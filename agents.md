# agents.md

Guidance for AI coding agents (and humans) working on this repo. **Keep this
file up to date** — whenever you change the architecture, Cloudflare
resources, deployment process, data model, or cost posture, update the
relevant section here in the same commit/PR. Stale docs here are worse than
no docs.

## What this is

Tenable is a daily-playable "Top 10" football trivia game (inspired by
[Football Tenable](https://playfootball.games/football-tenable/) / the ITV
show *Tenable*). Players browse a library of categories (e.g. "Top 10
Champions League winners by club") and guess entries in Classic (unlimited
guesses) or Tension (5 lives) mode.

- **Live**: https://tenable.cuong-luu.workers.dev
- **Repo**: cuongluu8/tenable, default branch `main`

## Stack

- **Frontend**: React 19 + Vite, in `src/react-app/`
- **Backend**: Hono on Cloudflare Workers, in `src/worker/`
- **Data**: Cloudflare D1 (quiz content) + Cloudflare KV (per-device progress/streaks)
- **Deploy**: Cloudflare Workers Builds (native Git integration, configured in the
  Cloudflare dashboard) — auto-builds and deploys on every push to `main`. There
  is **no GitHub Actions workflow** for this; see Deployment below.

## Repo map

```
src/worker/
  index.ts            # route mounting
  routes/
    categories.ts      # GET /api/categories — full library + this device's status per category
    category.ts         # GET /api/categories/:slug — one category + progress
    guess.ts             # POST /api/guess — server-authoritative answer checking
    reveal.ts             # GET /api/reveal/:slug — full answers, gated on completion
    stats.ts               # GET /api/stats — streak + lifetime totals
  lib/
    categories.ts    # D1 queries
    progressStore.ts # KV reads/writes (progress, streak, lifetime)
    normalize.ts       # guess/alias normalization (lowercase, strip accents/punctuation)
    device.ts            # anonymous device-id cookie
    dailyKey.ts            # UTC "today" helper (used for streak day-boundary only)
    types.ts

src/react-app/
  App.tsx                       # category list screen
  components/
    CategoryList.tsx
    PlayScreen.tsx     # mode picker → guess UI → result panel, per category
    AnswerGrid.tsx
    LivesIndicator.tsx

db/
  schema.sql   # categories / answers / answer_aliases / reference_entities tables
  seed.sql       # starter content — NOT a fact-checked library, see below
```

## Data model

- `categories` — one row per topic (slug, title, subtitle, stat_label).
- `answers` — usually 10 rows per category (rank, canonical_name, stat_value).
  `answerCount` is always derived from `COUNT(*)` rather than assumed to be
  10, so a category *can* have more if a topic genuinely calls for it — but
  **the default for every category, including `copa-libertadores-alltime-titles`,
  is a bounded Top N (normally 10)**, not "every entity that qualifies at
  all." An earlier pass expanded the Libertadores category to all 27 clubs
  that have ever won it; that was a misreading of a request that was actually
  about typeahead coverage (see below), not the answer set, and was reverted.
  Ties within a Top N are broken by most recent title/achievement (same
  convention across the Champions League, Serie A, and Libertadores
  categories) — don't uncap a category just because a tiebreak excludes a
  real qualifier; that's the tiebreak working as intended.
- `answer_aliases` — normalized match strings per answer (e.g. "psg", "paris
  saint-germain" both point at the "Paris Saint-Germain" answer). Guess
  matching (`matchGuess` in `src/worker/lib/categories.ts`) only ever compares
  against this table, never `canonical_name` directly, so seed data must
  always include the canonical name's own normalized form as one alias.

### Generic rule: answers stay bounded, typeahead is broader

This applies to every category, not just one: **the `answers` table is the
bounded guessable set (Top N) for a category and stays that size; the
typeahead/autocomplete pool for the guess box is a separate concern that
covers far more real, recognizable names than just the current answers**, so
players can type/select accurately even when guessing something that turns
out to be wrong. If a request sounds like "include more real X" for a
category, check whether it actually means the answer set or the typeahead
pool before touching `answers` — the Libertadores category was expanded to
27 clubs and reverted once already because of this ambiguity.

This is implemented via `reference_entities` / `reference_entity_aliases`
(see schema.sql) — a typeahead-only pool, decoupled from `answers`.
`suggestNames()` (`src/worker/lib/categories.ts`) unions both
`answer_aliases` and `reference_entity_aliases`, deduped by canonical name.
`matchGuess` (guess validation/scoring) never reads these tables, so adding
a name here can't make a wrong guess "count" — it only helps typing. Seeded
so far (see the bottom of `db/seed.sql`):
- ~180 South American football clubs, `entity_type = 'club'` (current
  top-flight rosters across the 10 CONMEBOL countries, `category` column
  holds the country).
- ~110 countries, `entity_type = 'country'` (UEFA + CAF members — scoped to
  the confederations the two 'country' categories actually cover, `category`
  column holds the confederation).
- ~160 players, `entity_type = 'player'` (broadly recognizable
  attackers/Ballon d'Or-calibre names across eras and nationalities,
  `category` column holds nationality). **Explicitly not exhaustive** —
  unlike the club/country lists (which are objectively bounded: "current
  top-flight roster", "confederation members"), "notable players" has no
  natural boundary. Expand as gaps show up rather than trying to front-load
  completeness.

This pool is **best-effort, not held to the same fact-checking bar as
`answers` content** (see Content accuracy below) — it doesn't affect
scoring, only what the guess box suggests, so an occasional stale or missing
entry here is a much smaller problem than an error in `answers`. Extend the
same way for other regions/entity types as new categories get added — don't
grow `answers` past its category's actual Top N to solve a typeahead gap.

**Production sync note (as of the country+player expansion):** the club and
country pools are applied to production D1; the player pool was generated
and is in `db/seed.sql`/local D1 but **not yet applied to production** — the
Cloudflare MCP connection expired mid-apply. Check
`SELECT entity_type, COUNT(*) FROM reference_entities GROUP BY entity_type;`
against production before assuming this is done; if it still shows 0 players,
apply the player `INSERT` statements from `db/seed.sql` (the block after the
country one) the same way prior reference-data batches were applied.

**Type-scoped**: both `categories` and `reference_entities` carry an
`entity_type` column (`'club'` | `'player'` | `'country'`, extend as new
category shapes are added — defaults to `'club'`). `suggestNames()` takes
the *playing* category's own `entity_type` and filters both sources to it,
so a players category (e.g. Ballon d'Or) never suggests a club and a clubs
category never suggests a player. The `/api/suggest` route
(`src/worker/routes/suggest.ts`) requires a `category` query param for this
— it looks up that category's `entity_type` via `getCategoryBySlug` and
returns no suggestions at all if the slug is missing or unknown, rather than
falling back to an unscoped, mixed-type list. The frontend
(`GuessInput.tsx`, via a `categorySlug` prop threaded from `PlayScreen.tsx`)
always sends it. When adding a new category whose answers aren't clubs,
players, or countries, add the new `entity_type` value here and to any
seed data using it — the column has no CHECK constraint, so a typo silently
creates a type nothing will ever match against.
- Categories are **not** date-gated — every category is playable any time.
  Per-device progress lives in KV, keyed by `progress:{deviceId}:{slug}`, kept
  indefinitely (no TTL) so a finished category is remembered and never
  resurfaces as fresh.
- Streak (`streak:{deviceId}`) is day-based and win-only, idempotent per
  calendar day (playing multiple categories in one sitting doesn't inflate
  it; a loss never erases it). Lifetime totals (`lifetime:{deviceId}`) move on
  every completion regardless of mode/result.

### Content accuracy

`db/seed.sql` is hand-curated, not pulled from a live API. Anything involving
recent seasons/tournaments needs fact-checking before being trusted — cross
reference multiple independent sources (WebSearch works from this
environment for that; direct WebFetch to most sports/reference sites does
not — it's blocked by the sandbox's egress proxy). When a topic is legally or
factually contested (e.g. an appealed match result), leave it out of seed
content rather than guess. See git history on `db/seed.sql` for precedent
(PSG's Champions League tiebreak, the AFCON 2025/26 dispute left
deliberately unmodeled).

**Production D1 is not auto-applied from `db/seed.sql`.** Workers Builds
(see Deployment) only builds and deploys the Worker/frontend code — it does
not run any D1 migration or seed step. So far, content changes have been
applied to production D1 by hand via the Cloudflare MCP `d1_database_query`
tool, mirroring whatever changed in `db/seed.sql`. If that ever changes (e.g.
a migration step gets added to the build), update this paragraph.

## Local development

```
npm install
npm run dev              # vite dev server, http://localhost:5173

# Local D1 + KV (separate from production, stored under .wrangler/state):
npx wrangler d1 execute tenable-content --local --file=./db/schema.sql
npx wrangler d1 execute tenable-content --local --file=./db/seed.sql
npx wrangler dev --port 8787   # full worker + bindings, http://localhost:8787

npm run lint
npm run build             # tsc -b && vite build
```

`wrangler dev` in this sandboxed environment logs harmless
`Request.cf` / "Request was cancelled" warnings on startup — ignore them, the
server still comes up.

`wrangler dev` here runs against a **redirected config pointing at
`dist/tenable/wrangler.json`**, i.e. a prebuilt bundle, not `src/worker/`
directly — editing worker source and restarting `wrangler dev` without
first running `npm run build` serves the *stale* bundle with no error or
warning. Always `npm run build` before testing a worker-code change locally.

## Deployment

Deploys happen via **Cloudflare Workers Builds** — Cloudflare's own Git
integration, connected directly to this repo through the Cloudflare
dashboard (Workers & Pages → tenable → Settings → Builds), most likely set up
by the original "Deploy to Cloudflare" template button. Every push to `main`
is automatically built and deployed by Cloudflare's own infrastructure —
**no GitHub Actions workflow is involved, and none should be added for
this.** Build/deploy status and logs are visible in the Cloudflare dashboard
under that Worker's **Deployments** tab, not in the repo's Actions tab.

An earlier version of this project *did* have a custom
`.github/workflows/deploy.yml` (`wrangler deploy` via `cloudflare/wrangler-action`)
that was redundant with Workers Builds and, worse, non-functional — it had no
`CLOUDFLARE_API_TOKEN` secret configured, so all 8 of its runs failed
outright. It sat there failing silently on every push while Workers Builds
quietly did the actual deploying in the background, which is exactly the kind
of thing this file exists to prevent — it's been removed. **Don't re-add a
GitHub Actions deploy step** unless Workers Builds is deliberately being
replaced (e.g. moving to a different Cloudflare account with no Git
integration configured) — check the dashboard's Builds tab first if deploys
ever seem to stop working, before assuming a new CI workflow is the fix.

This sandbox has no `wrangler` auth of its own (no `CLOUDFLARE_API_TOKEN` env
var), so an agent working from here **cannot** `wrangler deploy` directly —
there is no way to trigger or force a deploy from this environment. Pushing
(and merging) to `main` is what triggers a real deploy, handled entirely by
Cloudflare outside of anything in this repo or session. The Cloudflare
Developer Platform MCP tools available here can create/query D1, KV, and R2
*data/resources*, but cannot deploy Worker code or inspect Workers Builds
build status.

## Cloudflare resources

| Resource | Name | ID |
|---|---|---|
| Worker | `tenable` | — |
| D1 database | `tenable-content` | `a87ef250-cc94-4765-a821-785acbcd71a4` |
| KV namespace | `tenable-progress` | `f04cfb81bc8e4ba783cd3157d59e2734` |

Both are bound in `wrangler.json` (`DB`, `PROGRESS`). **This Cloudflare
account is shared with other, unrelated projects**
(`nero-perk-scheduler`, `deal-or-no-deal-api`, plus R2 buckets `bingo-caller`
and `deal-or-no-deal`) — the free-tier quotas below are account-wide, not
per-Worker, so tenable's real headroom depends on what else is running on
this account at any given time.

## Cost: designed for zero cost, but verify the account plan

This project only uses **Workers Free plan** — level resources (Worker
requests, D1, KV). Nothing in this repo requires or enables a paid Cloudflare
feature. As of the last check (2026-08-25), current usage is trivial —
low hundreds of requests total across testing, far under every limit below.

**Free-tier limits (reset daily at 00:00 UTC), account-wide:**

| Resource | Free limit |
|---|---|
| Worker requests | 100,000 / day |
| D1 rows read | 5,000,000 / day |
| D1 rows written | 100,000 / day |
| D1 storage | 5 GB total |
| KV reads | 100,000 / day |
| KV writes | 1,000 / day |
| KV deletes | 1,000 / day |
| KV list requests | 1,000 / day |
| KV storage | 1 GB |

**The important part: on the Free plan, exceeding any of these limits causes
the operation to fail with an error (e.g. D1 "exceeded daily row read
limit", KV "operation failed") — it does not generate a charge.** Cloudflare
only bills you if the account has been upgraded to a paid plan (Workers Paid,
$5/month base + metered overage) or a paid add-on/payment method has been
attached. So the only real lever for guaranteeing zero cost is the account's
plan tier and billing settings — and that is **account-level, not
project-level**, and **no tool available to an agent in this repo can read or
change it**. The Cloudflare Developer Platform MCP tools here can create/query
D1, KV, R2, and Workers *resources*, but expose nothing about billing plans,
payment methods, or spend.

**What the human account owner should do (an agent cannot do this):**
1. Confirm the account is on Workers Free at
   https://dash.cloudflare.com/?to=/:account/workers/plans — if it's ever
   upgraded to Workers Paid (deliberately or by accident), the "errors
   instead of charges" safety net above no longer applies for any project on
   this account, not just tenable.
2. There's no programmatic hard spend-cap for Workers/D1/KV free-tier usage.
   The closest thing available is checking usage under **Workers & Pages →
   tenable → Metrics** (and the D1/KV dashboards) periodically, or setting up
   a Cloudflare billing notification under **Notifications** in the dashboard
   if one is offered for your account type.

**Rule for agents working on this repo:** never enable a paid plan, attach a
payment method, or add a Cloudflare feature that requires one (R2 beyond the
free allocation, Durable Objects with billed SQLite storage, Workers Paid–only
models/features, etc.) without the user explicitly confirming it in the
conversation first. If you add a new Cloudflare binding or resource, check
whether it's free-tier-only and update the table above.

**Known non-cost risk to watch:** KV writes are capped at 1,000/day free, and
every completed guess round writes at least a progress record (plus
lifetime/streak on completion). If this game gets real traffic, that's the
first limit likely to be hit — it'll surface as user-facing errors on
`/api/guess`, not a bill. Worth keeping an eye on via the KV dashboard if
usage grows.

## Workers Builds cost

No GitHub Actions minutes are involved (see Deployment above). Workers
Builds itself is bundled with the Workers plan (Free or Paid) rather than
billed separately — it has its own resource limits (CPU, memory, disk,
build timeout; 20 GB disk on both Free and Paid as of the last check) but no
extra per-build charge beyond whatever Workers plan the account is
already on. See https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/
for current specifics if this ever needs re-checking (e.g. before adding a
much heavier build step).

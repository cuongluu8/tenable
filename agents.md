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
`matchGuess` (guess validation/scoring) never reads these tables (or
`entity_search`, below), so adding a name here can't make a wrong guess
"count" — it only helps typing.

**`suggestNames()` matches primarily through `entity_search`, an FTS5
virtual table (added 2026-08-25), not through the alias tables.**
`entity_search` indexes the canonical name of every `answers` row and every
`reference_entities` row, tokenized on word boundaries (`unicode61
remove_diacritics 2`), and is queried with a per-word prefix `MATCH` (see
`toFtsPrefixQuery()` in `normalize.ts`) — so a search matches ANY word of a
name, not just its start: typing "szo" finds "Dominik Szoboszlai" via its
second word, with no alias row required. It's kept in sync automatically by
triggers on `answers`, `reference_entities`, and `categories` (the last one
matters: `categories.entity_type` can be corrected by an `UPDATE` *after*
that category's answers already exist — seed.sql itself does this — and
`entity_search` denormalizes `entity_type` onto each answer row, so without
a trigger watching that `UPDATE` too, answers inserted before the fix-up
would carry a stale type forever; don't drop that trigger when touching this
area). `answer_aliases` / `reference_entity_aliases` are still unioned in on
top of the FTS match, but only earn their keep now for genuine nicknames
that aren't a substring of the canonical name at all and so can't be found
by tokenizing it — "psg", "barca", "spurs", "vvd". A missing nickname alias
is a minor, expected gap (add one if a real one is reported missing); it is
**not** the same class of bug as a missing `reference_entity_aliases` row
used to be before this change (see the incident below) — first/last-name
search no longer depends on alias rows existing at all.

**Adding a new `reference_entities` row (or answer) needs nothing beyond
the plain `INSERT`** — the trigger populates `entity_search` for you. Only
add alias rows for actual nicknames, not for the name itself or its parts.

Seeded
so far (see the bottom of `db/seed.sql`):
- Several hundred football clubs, `entity_type = 'club'` (South American
  top-flight rosters plus a full English/Scottish league expansion added
  later, `category` column holds the country).
- ~110 countries, `entity_type = 'country'` (UEFA + CAF members — scoped to
  the confederations the two 'country' categories actually cover, `category`
  column holds the confederation).
- **~7,800+ players and growing toward ~18,000**, `entity_type = 'player'`
  (originally a curated ~160 broadly-recognizable Ballon d'Or-calibre names;
  as of 2026-08-25 this is mid-expansion to a much broader "every player
  since 1992" pool sourced from a cleaned FIFA 21 dataset — see "In-progress
  player expansion" below). **Explicitly not exhaustive** — unlike the
  club/country lists (which are objectively bounded: "current top-flight
  roster", "confederation members"), "notable players" has no natural
  boundary. Expand as gaps show up rather than trying to front-load
  completeness.

This pool is **best-effort, not held to the same fact-checking bar as
`answers` content** (see Content accuracy below) — it doesn't affect
scoring, only what the guess box suggests, so an occasional stale or missing
entry here is a much smaller problem than an error in `answers`. Extend the
same way for other regions/entity types as new categories get added — don't
grow `answers` past its category's actual Top N to solve a typeahead gap.

**`db/seed.sql` and production D1 previously diverged for
`reference_entities` — now resolved (2026-08-27), see below for what to do
if it ever recurs.** The original intent (see git history) was that every
reference-data addition gets appended to `seed.sql` and then mirrored to
production by hand via the Cloudflare MCP `d1_database_query` tool. The
large player-pool expansion (2026-08-25 onward, see below) broke that
invariant for a while: batches were applied directly to production only,
without being back-ported into `seed.sql` — caught, fixed (seed.sql
regenerated from a verified-clean production export), and from batch 061
onward every batch was applied to production **and** appended to
`db/seed.sql` in the same step specifically to not reintroduce this drift.
As of the completed player expansion below, `db/seed.sql` and production
match exactly. **Still confirm this hasn't drifted again before trusting
either file** — compare
`SELECT entity_type, COUNT(*) FROM reference_entities GROUP BY entity_type;`
against production rather than assuming — but there is no known divergence
right now.

### Player expansion (started 2026-08-25, completed 2026-08-27)

At the user's request ("I want every player since 1992"), the player
typeahead pool was expanded from ~160 curated names to over 18,000 real
players, sourced from a cleaned FIFA 21 player dataset (EA's fabricated/
placeholder players — an entire fake Brazilian Série A, detected via
uniform-squad-size statistical fingerprinting — were filtered out first).
Names were normalized and aliased to match `normalize()` in
`src/worker/lib/normalize.ts`, deduped against pre-existing content, and
loaded in 70 batches of ~250 players each (sorted by FIFA overall rating
descending, so the most recognizable players loaded first in case the job
was interrupted — which it was, for several sessions). No bulk-upload API
exists for D1 from this environment, so each batch was a separate
`d1_database_query` MCP call.

**This is now finished** — all 70 batches (000-069) are applied to
production and present in `db/seed.sql`; production `reference_entities`
has 18,440 players (club=419, country=110), matching `db/seed.sql` exactly.
The `db/pending_player_batches/` working directory this used (batch files,
`PROGRESS.md`) has been fully consumed and removed — if you see either
referenced elsewhere (e.g. old commit messages), that's historical, not a
sign of remaining work. There is no pending batch work to resume.

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

**A wrong answer is not a minor bug — a user found one in
`pl-2025-26-top-scorers` (Antoine Semenyo missing from rank 3 entirely, fixed
2026-08-25) and correctly called that out as disillusioning, not cosmetic.**
Getting the Top 10 wrong is the one thing this app cannot do and still be
trustworthy — a player who catches an error has no reason to believe *any*
other category is right, which undermines the whole game, not just the one
category. Two things follow from this:

1. **When content is added or changed, verify every ranked entry it touches
   against multiple independent, reputable sources before it goes live** —
   not just the entry that prompted the change. A single source (including
   this agent's own training knowledge, or one aggregator site synthesizing
   a WebSearch answer) is not sufficient for anything from a real, checkable
   season/tournament; cross-reference at least two independent outlets
   (official league/competition sites, major sports media — AP, ESPN, Sky
   Sports, BBC, NBC Sports, Yahoo Sports, etc.) and prefer ones that show
   the same number from multiple angles (e.g. a full points table, not just
   a headline claim). WebSearch result summaries can themselves lean on a
   low-quality aggregator (seen in practice: a `yen.com.gh`-sourced summary
   claiming a player had transferred clubs mid-search that better sources
   didn't corroborate) — check which underlying source each claim actually
   traces to, don't take the search tool's synthesized answer at face value.
2. **After any bug report on `answers` content, don't just fix the one
   reported item — audit the rest of that category, and give the other
   time-sensitive categories (anything with "2025-26", "2026", or "through
   <season>" in its subtitle) the same pass.** One bug found by a user is a
   strong signal there may be others not yet found; a category-by-category
   spot check (query production for the full category list, verify every
   "current season" / "through <year>" category, not just the one reported)
   is exactly what surfaced no further errors after the Semenyo incident —
   that audit is the standard to repeat, not a one-time response. Categories
   without a season/year in the subtitle (e.g. Ballon d'Or all-time wins,
   Euro Championship by country through a named past tournament) are lower
   risk since they don't require folding in a just-finished season, but
   still worth a quick sanity check when touching content generally.

**Incident that motivated `entity_search` (2026-08-25):** a user reported
Dominik Szoboszlai missing from typeahead despite Liverpool's current squad
supposedly being covered. At the time, `suggestNames()` only ever matched
through `reference_entity_aliases`/`answer_aliases` — never `canonical_name`
directly — so a `reference_entities` row with zero alias rows was invisible
forever, with no error anywhere: the `INSERT` into `reference_entities`
succeeds, the follow-up alias `INSERT` can silently not happen (wrong join
key, a step that was never written, a batch that only did half the job),
and nothing surfaces it except a player noticing a name doesn't
autocomplete. Auditing the actual scope (not just the one reported player)
found **199 players and 157 clubs** — effectively every current-season
Premier League squad member plus every top-flight club across the big five
leagues and more — with no aliases at all, plus 65 exact-duplicate club rows
from a batch that had evidently run twice. That was patched in production
the same day (aliases backfilled, duplicates deleted), but the *fix that
actually matters* was structural: `suggestNames()` was rebuilt around
`entity_search` (see above) so first/last-name matching no longer depends
on any alias row existing in the first place — the bug class, not just this
instance of it, is closed. If you're ever debugging a "can't find this name"
report again, confirm `entity_search` actually contains the row and that
its `entity_type` matches what's being searched for:
```sql
SELECT * FROM entity_search WHERE entity_search MATCH 'yourprefix*';
```
An empty result there (rather than a missing alias) is now the thing to
chase — e.g. a trigger that didn't fire, or a bulk load that wrote
`reference_entities` some other way than a plain `INSERT` (bypassing the
trigger).

**Production D1 is not auto-applied from `db/seed.sql`.** Workers Builds
(see Deployment) only builds and deploys the Worker/frontend code — it does
not run any D1 migration or seed step. So far, content changes have been
applied to production D1 by hand via the Cloudflare MCP `d1_database_query`
tool, mirroring whatever changed in `db/seed.sql`. If that ever changes (e.g.
a migration step gets added to the build), update this paragraph.

**This mirroring silently stopped happening for a while (discovered and
fixed 2026-08-26) — treat "changes have been applied to production" as a
claim to verify, not a standing guarantee.** The player-reference-pool
expansion (`db/pending_player_batches/`, now removed) ran each batch's SQL
against production via the MCP tool, then deleted the batch file and
committed — with no step that ever wrote that SQL into `db/seed.sql`. By the
time this was caught, `db/seed.sql` had only 885 of production's 16,306
reference players (~15,400 rows that existed only in production, invisible
to local dev/CI, and would have been silently lost had production ever
needed rebuilding from the seed file). It was caught as a side effect of
investigating a report that "Thiago Alcântara is missing" — checking why led
to comparing `db/seed.sql`'s player count against production's. Fixed by:
recovering what git history still had (batches 027-060 were tracked as
files in one commit before deletion — recoverable via `git show`), exporting
the rest directly from production for what was never git-tracked at all
(batches 000-026), and along the way finding + removing 41 players (43
rows) that existed as **exact duplicates** in both production and the
already-committed `db/seed.sql` (famous names like Wayne Rooney that were in
the original hand-curated list *and* got reintroduced by the bulk FIFA21
load) — a real instance of the "duplicate entries" a user suspected, just
not the actual cause of the bug they'd reported. **Both items this left
outstanding are now resolved (2026-08-27):**
1. The 43 duplicate rows were deleted from production with explicit user
   authorization (the destructive action was correctly blocked by the
   environment's safety classifier until then). A full duplicate audit run
   after batches 061-069 completed (see #2) confirmed zero duplicate
   `(canonical_name, category, entity_type)` rows and zero self-duplicate
   aliases remain in either production or `db/seed.sql`.
2. Batches 061-069 (the rest of the original 70-batch expansion plan) were
   applied to production and appended to `db/seed.sql` in the same session,
   batch-by-batch, to avoid ever repeating the seed.sql/production drift
   above. Production `reference_entities` now has 18,440 players
   (club=419, country=110), matching `db/seed.sql` exactly — verified via
   a full local reseed + `verify:matching` + `verify:name-sync` + `playtest`
   (1897 assertions), all green.

The player-reference-pool expansion is complete; there is no further
pending batch work.

If you're ever unsure whether `db/seed.sql` still matches production,
don't assume it does — compare counts (`SELECT entity_type, COUNT(*) FROM
reference_entities GROUP BY entity_type` on both sides is a fast sanity
check) before trusting either one.

**Incident: an answer's name silently drifting from its reference-pool
counterpart (2026-08-26).** A user guessed "Igor Thiago" in
`pl-2025-26-top-scorers` and was told he wasn't on the list, despite
genuinely being rank 2 — the answer's `canonical_name` had been entered as
just "Thiago" (a name shared by many players in the reference pool), so a
correctly-spelled guess of his real name never matched any alias. The same
mismatch also made typeahead show what looked like two different people for
one real player, since the answer row and the reference-pool row disagreed
on the name string and so didn't collapse into a single suggestion. A
follow-up manual audit (comparing every answer's aliases against
`reference_entity_aliases` for an unambiguous same-alias owner with a
different name) found two more live instances the same day (Daniel Welbeck
vs. the real "Danny Welbeck"; Raul Gonzalez vs. the reference pool's
"Raul") — then, once that audit was turned into a real script and run
against the *entire* answer set (not just the categories that prompted the
report), it found two more genuine mismatches (Bournemouth/Brighton's
`answers.canonical_name` using the common short club name while their
`reference_entities` row used the fuller official name) alongside several
confirmed-different-people alias collisions that are fine as-is (Tim vs.
Gary Cahill, Andy Cole vs. Ashley Cole, etc. — see `KNOWN_COLLISIONS` in the
script below).

**`npm run verify:name-sync` (`scripts/verify-name-sync.ts`) is the standing
check for this bug class, and it runs in CI on every push/PR to `main`** —
same enforcement pattern as `verify:matching` below, for the same reason: a
manual audit someone claims to have done is not a guarantee the next
category addition won't reintroduce this. **Whenever a new category (or new
answers in an existing one) is added, this must pass before it's considered
done** — it's not an optional follow-up step. What it checks: for every
answer, if one of its aliases is *unambiguously* claimed by exactly one
`reference_entities` row (i.e. no other real entity in the pool shares that
alias) and that row's `canonical_name` differs from the answer's own, that's
flagged as a likely same-entity mismatch needing a fix — *unless* it's
already in the script's `KNOWN_COLLISIONS` allowlist as a confirmed
different real person/club that happens to share a surname or short name
(e.g. Tim Cahill vs. Gary Cahill). When it fires on something new: **first
figure out whether it's actually the same real-world entity** (the honest
default assumption — that's what it was in 3 of the 5 categories of finding
uncovered so far) **or a genuine different-entity collision.** Same entity →
sync the names (pick whichever form the game already uses as its
convention for that kind of entity — e.g. bare mononyms like "Pele"/"Raul"
for players known that way, short common club names like "Bournemouth" over
"AFC Bournemouth" to match how every other club in that category is
named — and add any alias forms that changed) and re-run both `verify:matching`
and `verify:name-sync`. Confirmed different entity → add one line to
`KNOWN_COLLISIONS` with the reason, don't touch the data.

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
npm run verify:matching   # re-seed local D1 first — see scripts/verify-guess-matching.ts
npm run verify:name-sync # re-seed local D1 first — see scripts/verify-name-sync.ts
npm run playtest          # self-resets local D1 + KV — see scripts/playtest.ts
```

**Run `npm run verify:matching` after any change to `db/seed.sql`'s answers/aliases, or to
`matchGuess()`/`normalize.ts`.** It checks two things against local D1: every answer's own
canonical name actually matches one of its own aliases (the class of bug that shipped three
times in production before this existed — see git history around 2026-08-26), and no two
different answers in the same category collapse to the same alias. A passing run is not
optional evidence you can skip and still claim you checked — it's the actual check.

**Run `npm run verify:name-sync` after any change to `db/seed.sql`'s answers, and always
when adding a new category — this is a required step, not an optional one.** It checks
every answer's `canonical_name` against `reference_entities` for the same real-world entity
under an unambiguous shared alias, catching the class of bug where an answer's name has
drifted from (or was entered wrong relative to) its reference-pool counterpart — see the
incident writeup in "Content accuracy" above for what this looks like in practice and how to
resolve a finding. **This also runs in CI** (`.github/workflows/ci.yml`).

**Run `npm run playtest` before merging any change touching a route, `matchGuess()`,
`normalize.ts`, `suggestNames()`, or `db/seed.sql`.** It's a black-box end-to-end test —
`wrangler dev` against a freshly reseeded local D1 + KV, driven purely over real HTTP with real
cookies, the same surface a browser uses — that plays every single category to completion the
way an actual player would: obscure aliases instead of full names, mixed case, stray
whitespace, punctuation swapped between space and hyphen, wrong-but-real names from the
reference pool that must be rejected, duplicate-guess detection (including the repeat-winner
case, e.g. Kylian Mbappe appearing at two ranks in `wc-recent-golden-boot`), tension-mode
win/loss, and request-validation edge cases (unknown category, empty guess, guessing after a
round is already finished). Non-zero exit on any failure. **This also runs automatically in CI**
(`.github/workflows/ci.yml`, on every push/PR to `main`) — that's the actual gate; running it
locally first is what keeps that gate from turning red after you've already pushed.

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

**Update, 2026-08-27 — the account already has billing capability.** Checked
the dashboard: Workers itself is confirmed on "Workers Free", but **R2 is on
a Paid plan (Active)** on this same account — meaning a payment method is
already on file, for a different project's R2 usage, not for tenable. This
matters because it means "no card exists on the account" can no longer be
assumed as tenable's safety net. What still holds, confirmed against current
Cloudflare pricing docs: Worker requests/CPU, D1, and KV overage billing are
gated specifically by **upgrading the Worker's own plan to Workers Paid**,
not by whether a card exists elsewhere on the account for R2 — so tenable
stays free as long as its Worker specifically is never upgraded, regardless
of R2. There is still no Cloudflare-wide hard spend cap for Workers/D1/KV
(only Budget Alerts, which are informational-only, not a block).

Given that, app-level guardrails were added as defense-in-depth for the
scenario where Workers *is* ever upgraded to Paid (deliberately or by a
collaborator with billing access) — see below.

### App-level cost guardrails (added 2026-08-27)

Two fail-closed circuit breakers, independent of and in addition to
whatever the Cloudflare plan's own limits are — see the code comments in
each file for full reasoning:

- **`src/worker/lib/circuitBreaker.ts`** — a hard ceiling on total requests
  handled per day, across the whole app (`app.use("/api/*", ...)` in
  `index.ts`). Once the daily count exceeds `DAILY_REQUEST_BUDGET`
  (wrangler.json `vars`, default 20,000), every route returns `503` for the
  rest of that UTC day.
- **`src/worker/lib/suggestRateLimit.ts`** — a per-IP-per-minute limit on
  `/api/suggest` specifically (the one endpoint that scales with keystrokes,
  not deliberate plays, so it's the fastest way a scripted client could run
  up D1 read volume). Once a single IP exceeds `SUGGEST_RATE_LIMIT_PER_MINUTE`
  (default 30) within a rolling 1-minute window, further suggest requests
  from that IP get `429` until the window rolls over; guessing itself is
  unaffected.

Both are backed by two new D1 tables (`request_budget`, `suggest_rate_limit`
in `db/schema.sql`) rather than KV, deliberately — they're written on every
request they guard, and D1 row-writes are far cheaper and have a far larger
included allotment than KV writes (see the free-tier table above and current
pricing), so a KV-backed counter would work against the very guardrail it's
meant to be.

Both defaults were chosen to sit far above this hobby-scale app's real
traffic (confirmed against a full `npm run playtest` run — ~690 total
requests, ~7 suggest calls in one window — and manually confirmed to
actually trip: 30 rapid `/api/suggest` calls succeed, the 31st+ return
`429`) and are configurable via `wrangler.json` `vars` if real traffic ever
approaches them — raise deliberately, don't delete the guardrail.

**Rule for agents:** if you add a new route or a new source of write volume
(KV or D1), consider whether it needs its own guard the way `/api/suggest`
did, rather than relying solely on the global daily ceiling.

## Workers Builds cost

No GitHub Actions minutes are involved (see Deployment above). Workers
Builds itself is bundled with the Workers plan (Free or Paid) rather than
billed separately — it has its own resource limits (CPU, memory, disk,
build timeout; 20 GB disk on both Free and Paid as of the last check) but no
extra per-build charge beyond whatever Workers plan the account is
already on. See https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/
for current specifics if this ever needs re-checking (e.g. before adding a
much heavier build step).

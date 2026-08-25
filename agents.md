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
- **Deploy**: GitHub Actions (`.github/workflows/deploy.yml`) runs on every push to `main`

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
  schema.sql   # categories / answers / answer_aliases tables
  seed.sql       # starter content — NOT a fact-checked library, see below
```

## Data model

- `categories` — one row per Top 10 topic (slug, title, subtitle, stat_label).
- `answers` — 10 rows per category (rank, canonical_name, stat_value).
- `answer_aliases` — normalized match strings per answer (e.g. "psg", "paris
  saint-germain" both point at the "Paris Saint-Germain" answer). Guess
  matching (`matchGuess` in `src/worker/lib/categories.ts`) only ever compares
  against this table, never `canonical_name` directly, so seed data must
  always include the canonical name's own normalized form as one alias.
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

**Production D1 is not auto-applied from `db/seed.sql`.** There is no
migration/sync step in the deploy workflow — so far, content changes have
been applied to production D1 by hand via the Cloudflare MCP
`d1_database_query` tool, mirroring whatever changed in `db/seed.sql`. If
that ever changes (e.g. a migration step gets added to CI), update this
paragraph.

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

## Deployment

`.github/workflows/deploy.yml` runs `npm ci && npm run build` then
`wrangler deploy` via `cloudflare/wrangler-action`, triggered on every push to
`main`. It needs a `CLOUDFLARE_API_TOKEN` repository secret (Settings →
Secrets and variables → Actions) — without it the workflow fails at the
deploy step. This sandbox has no `wrangler` auth of its own (no
`CLOUDFLARE_API_TOKEN` env var), so an agent working from here **cannot**
`wrangler deploy` directly — only via this GitHub Actions path, or via the
Cloudflare Developer Platform MCP tools for D1/KV data changes (not for
deploying Worker code).

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

## GitHub Actions cost

The deploy workflow runs on every push to `main`, taking roughly 1-2 minutes.
Public repos get unlimited free Actions minutes; private repos on a free
personal GitHub plan get a limited monthly minute allowance. At this
project's push frequency this is not a practical concern, but is worth
knowing if `main` starts getting pushed to much more often (e.g. an
automated content-refresh job).

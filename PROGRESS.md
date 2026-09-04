# Progress / handoff notes

Written 2026-08-31 so work on Tenable can continue in a fresh session —
possibly under a different Claude account with no memory of this one. This
file is a snapshot, not a living doc: trust `git log` and the live app over
anything here if they disagree. For conventions, architecture, deployment,
and cost guardrails, **read `agents.md` first** — it's the actual source of
truth and this file doesn't repeat it. This file is just "what happened
recently and what to know before touching anything."

## Where things stand right now — READ THIS BEFORE TOUCHING PRODUCTION

This session did a from-scratch architectural rewrite: `answers` +
`reference_entities` (two hand-authored, independently-drifting tables) are
replaced by a single `entities` identity table plus a derived-content
pipeline (`entity_stats` → `category_defs` → `category_answers`, rebuilt by
`src/worker/lib/rebuild.ts`). Full rationale, schema, and the new
"Checklist: adding a new category" are in `agents.md` — read it, don't
reconstruct this from git log.

**This has been merged to `main` and is LIVE:**

- Fast-forwarded `claude/single-source-of-truth-r37g3r` onto `main` (no PR —
  the user explicitly said to commit straight to `main`) and pushed. `main`
  is now at `df90e5c`, which auto-deploys via Cloudflare Workers Builds.
  Confirmed the deployed worker's bundled code (via
  `workers_get_worker_code`) already contains `asOfDate`/`rebuildAll`/
  `category_answers` and zero occurrences of `reference_entities`/
  `answer_aliases` — the new code is live, not just pushed.
  https://tenable.cuong-luu.workers.dev could not be curl'd/WebFetched from
  this sandbox to double-check the HTTP response directly (egress to that
  host is proxy-blocked here, same known sandbox limitation as
  football-data.org) — if something looks off on the live site, that's the
  first thing to actually load in a real browser/from outside this sandbox.
- **Done (2026-09-04)**: the old `answers`/`answer_aliases`/
  `reference_entities`/`reference_entity_aliases` tables (473/919/19314/37168
  rows) were confirmed still unread by any code, then dropped from
  production D1 via `wrangler d1 execute tenable-content --remote`. Verified
  post-drop: `entities` (19,364) and `category_answers` (473) untouched, DB
  size down from ~8.4MB to ~5.15MB, local D1 already had none of these four
  tables. Local `db/schema.sql` never defined them post-rewrite, so no
  schema-file change was needed.
- New tables verified in production: 48/48 `categories`, 48/48
  `category_defs`, 473/473 `entity_stats`, 473/473 `category_answers`, 0
  orphaned rows (every `category_answers.entity_id` resolves, every
  `category_answers.category_id` resolves, every `category_defs.category_id`
  resolves). This is full gameplay parity with production content today.
- **Gap closed**: a later session backfilled production's `entities`/
  `entity_aliases` from `db/seed.sql` in full, via 61 chunked-INSERT files
  (`entities_000`–`entities_035`, `aliases_000`–`aliases_024`, ~500 rows per
  statement). Production now holds all 19,364 entities and all 37,391
  aliases — verified directly against production D1 immediately after the
  load: `SELECT COUNT(*) FROM entities` = 19364, `SELECT COUNT(*) FROM
  entity_aliases` = 37391 (both exact matches to `db/seed.sql`), and zero
  orphaned aliases (`entity_aliases.entity_id` values all resolve to a row
  in `entities`). Typeahead now draws on the full entity pool and
  alias-based guessing (nicknames, alternate spellings) works for the whole
  set, not just the ~1,619-entity "critical set" this file previously
  described as loaded. `db/seed.sql` and production `entities`/
  `entity_aliases` are genuinely identical again — agents.md's seed.sql/
  production parity documentation now holds for these two tables.
- Full local verification pipeline is green on this branch: `npm run lint`,
  `npm run build`, `npm run verify:matching` (473 answers, 37391 aliases, 0
  issues), `npm run verify:category-defs` (473 dated stats, 48 defs, 0
  inconsistencies), `npm run playtest` (3403 assertions, every category
  playable end to end) — all run against a local D1 mirror that was proven
  content-identical to production before the rewrite (48 categories, 473
  answers matched exactly).
- `.github/workflows/ci.yml` updated to run `verify:category-defs` instead
  of the now-deleted `verify:name-sync` (that bug class — answers/
  reference_entities drift — is structurally impossible now that there's
  one entities table).

## Stats enrichment project — IN PROGRESS, being continued on the user's local machine

The user asked for richer per-entity data: player transfer history (fees
in EUR/GBP), career goals/appearances/assists/red cards/own goals, club
titles/relegations/promotions/stadium capacity/founding year, and manager
career history/titles/retirement status. **Full details — schema, sourcing
rules, exact current state, and exactly what's left — are in
`docs/stats-enrichment.md`. Read that file before touching this project
further; this section is just a pointer + the short version.**

Short version: two new tables (`transfers`, `management_spells`) plus new
`entity_stats` stat_keys, both live in schema.sql/local D1/production D1.
A first, objectively-scoped research wave (all 115 managers, 206 clubs
with 2+ aliases, and players id 530-650) was completed and reviewed; the
raw SQL is committed at `data/research/*.sql` so nothing from this session
is stranded. **Update, 2026-09-04**: managers (all 115) and clubs (all
206 candidates) are now **fully applied to production** — only the player
tier is still partial (18 of 121 batch-1 players; batch 1 is itself only a
first slice of the ~850-player "notable tier"). `db/seed.sql` is kept in
sync with production via `wrangler d1 export` (documented in
`docs/stats-enrichment.md`, including a 2026-09-04 fix for a
`content_version` fresh-reset crash) — regenerate it again after the next
production content change.

This was handed to the user's local LLM specifically because this
sandbox has no bulk football-stats API access (WebSearch only, one query
at a time) and no direct Cloudflare credentials (production writes had to
go through an MCP tool one statement at a time) — both are normal on a
real machine with `wrangler login`, which is exactly why the handoff makes
sense here. Don't try to redo the "apply via chunked MCP calls" pattern
from `data/research/`'s file-status notes if picking this up in a sandbox
like this one again; if you have real `wrangler` credentials, just use
`wrangler d1 execute --remote --file=...` directly, per `docs/stats-enrichment.md`.

## What a fresh session needs to do next (in order)

1. Actually load the live site (from outside this sandbox) and play a
   category end to end to confirm the deploy is genuinely healthy, not
   just "the bundled code looks right" — this session couldn't do that
   itself (egress to the live host is proxy-blocked here).
2. Confirm the Cron Trigger (`0 3 * * *`, rebuilds `category_answers` from
   `entity_stats` daily) actually fires in production —
   `wrangler dev --test-scheduled` could not be gotten to work locally in
   this sandbox (404 on `/__scheduled`, treated as a tooling quirk, not
   chased further since `rebuildAll()` was already proven correct through
   direct manual testing). Check Cloudflare's dashboard/logs after the
   first scheduled run in production instead of assuming.
3. ~~Once `main` is confirmed stable on the new schema for a while, drop the
   old `answers`/`answer_aliases`/`reference_entities`/
   `reference_entity_aliases` tables from production D1~~ — **done
   2026-09-04**, see the note in "Where things stand right now" above.

## Things a fresh session should know before diving in

- **This sandbox (Bash/WebFetch) cannot reach any external host** —
  football-data.org, Wikipedia, sports sites, everything. Only `WebSearch`
  works, and it's a chat-turn tool, not callable from a script (so
  `verify-content-source.ts` can only ever be tested for real in GitHub
  Actions CI, never locally). Don't waste time debugging what looks like a
  network failure in Bash/WebFetch here — it's the sandbox's egress policy,
  not a bug.
- **GitHub Actions run status via the list/get tools lags real completion**
  — a run can show `in_progress` well after it's actually finished. Cross-
  check with real wall-clock time (`date -u`) before assuming a run is
  stuck; `ci.yml` itself has a comment about a past false alarm here. Don't
  cancel/retrigger a run just because the status API looks slow to update.
- **`verify-content-source.ts` (`content-check.yml`) only covers "This
  Season" categories** that map to a real football-data.org competition
  (current-season domestic tables/scorers, a few UEFA/FIFA competitions).
  Everything else — all-time records, transfers, manager stats — has no
  live-API equivalent and is only as good as the WebSearch research behind
  it.
- Several other `claude/*` branches may exist on the remote from earlier,
  unrelated sessions — not reviewed or cleaned up, status unknown. Check
  before assuming any of them are current or safe to build on.
- Standard verification pipeline before any push (see agents.md's Local
  development section for exact commands): `npm run lint`, `npm run
  build`, `npm run verify:matching`, `npm run verify:category-defs`, `npm
  run playtest`. Apply any `db/seed.sql`/production D1 change and verify
  with a SELECT before pushing.
- **Adding a new category** now means adding rows to `entity_stats` +
  `category_defs` and running the rebuild, not hand-writing an answer list
  — see agents.md's rewritten "Checklist: adding a new category".
- Production D1 (`tenable-content`, id `a87ef250-cc94-4765-a821-785acbcd71a4`)
  and KV (`tenable-progress`) are on a **shared Cloudflare account** with
  other, unrelated projects — see agents.md's Cost section before assuming
  headroom.
- Bulk D1 writes via the `d1_database_query` MCP tool must be chunked to
  ~500 rows per multi-row INSERT statement (SQLITE_TOOBIG above that), and
  Bash output over roughly 20-40KB gets truncated when `cat`-ing a
  generated SQL file to relay it — chunk generation and reads together if
  you're doing this again for the remaining entities/aliases in step 2
  above.

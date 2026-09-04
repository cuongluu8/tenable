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

## Working with Claude on this repo — token cost awareness

The user develops this project largely through Claude Code sessions and is
cost-conscious about it. Two rules, agreed with the user 2026-09-04:

1. **Flag expensive work before doing it, then wait.** "Expensive" means:
   a bulk data read/write (many rows, or relaying a file over ~20KB through
   a tool that can't take a file path directly), spawning more than one
   background research/work agent, or any task likely to need >15 tool
   calls. State what the operation is, a rough scope/cost estimate, and any
   cheaper alternative — then **stop and wait for a go-ahead** rather than
   proceeding. Don't apply this to routine single-file edits, builds,
   lints, or a handful of targeted reads — the point is to catch the
   genuinely large operations, not to add friction to everything.
2. **The single biggest lever for reducing cost on this repo**: a cloud/
   sandboxed Claude session has no direct Cloudflare credentials, so any
   bulk production D1 write has to be relayed through an MCP tool one SQL
   statement at a time — the data gets paid for twice (read into context,
   then re-emitted as a tool argument). The exact same operation from a
   machine with real `wrangler login` credentials is a single
   `wrangler d1 execute --remote --file=...` command. Prefer preparing a
   file for local application over applying bulk data through a
   credential-less sandbox, whenever that's an option.

**On handing work to a local/cheaper model to save tokens**: this was
tried once (2026-09-01) — Claude Code itself, but pointed at a local model
backend instead of the usual hosted one — for a multi-file, judgment-heavy
handoff (see `docs/stats-enrichment.md`'s and `PROGRESS.md`'s history
around that date) and failed — the local run never read the handoff doc,
invented an unrelated task, and committed code with a syntax error and
undefined variables, plus silently broke `npm run build` (deleted from
package.json without updating anything that depended on it) and desynced
`package-lock.json`, breaking CI. Root cause was almost certainly the
smaller/local model given loose autonomy rather than a narrow, explicit
task — a known failure mode for that class of model on stateful,
precision-dependent work; it isn't specific to any one tool (Aider was
also tried briefly and dropped for unrelated reasons, not because it hit
this failure mode). **Only hand off small, mechanical, well-specified
tasks locally** (e.g. "apply exactly this file with this command") —
keep multi-file work or anything requiring judgment calls in a Claude Code
session against the normal hosted model. If handing off something bigger
anyway, point the local setup at the specific doc explicitly as its first
instruction, and verify (`npm ci && npm run lint && npm run build`) before
trusting anything it pushes.

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
  index.ts            # route mounting + scheduled() cron handler (nightly rebuild)
  routes/
    categories.ts      # GET /api/categories — full library + this device's status per category
    category.ts         # GET /api/categories/:slug — one category + progress
    guess.ts             # POST /api/guess — server-authoritative answer checking
    reveal.ts             # GET /api/reveal/:slug — full answers, gated on completion
    stats.ts               # GET /api/stats — streak + lifetime totals
  lib/
    categories.ts    # D1 queries (entities/category_answers, not answers/reference_entities)
    rebuild.ts          # category_defs + entity_stats -> category_answers (see Data model)
    responseCache.ts # Cache API wrapper for the two public read routes
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
  lib/
    formatAsOfDate.ts  # renders a category's asOfDate as the "Data as of ..." label

db/
  schema.sql   # categories / entities / entity_aliases / entity_stats / category_defs / category_answers
  seed.sql       # GENERATED export of production D1's content tables — never edit by hand, see below
```

## Data model

**Rebuilt 2026-08-31 around a single source of truth for identity, plus a
derived rather than hand-authored answer set.** The rest of this section
describes the current model; see "Historical incidents" below for the
previous `answers`/`reference_entities` design and the bugs that motivated
replacing it — several of those bug classes are now structurally closed
rather than merely checked for, which is worth knowing when you read them.

- `categories` — one row per topic (slug, title, subtitle, stat_label,
  `entity_type`, `group_label`/`group_order`, `reference_scope`). Unchanged
  in shape from before.
- `entities` — **the one and only place a real-world name lives.** A club,
  player, country, or manager gets exactly one row, identified by `id`, not
  by name (duplicate `canonical_name` across rows is expected and allowed —
  two different real people can share a full name — so never assume a name
  string uniquely identifies an entity). An entity IS the typeahead pool
  (every row is a `suggestNames()` candidate) AND, via `category_answers`
  below, IS how an answer is represented — there's no second copy of a name
  to drift out of sync with this one, which is what the old
  `answers.canonical_name` vs. `reference_entities.canonical_name` split
  could do (see "Historical incidents").
- `entity_aliases` — normalized nicknames per entity ("psg", "vvd", "cr7").
  **Only for genuine nicknames that aren't derivable from tokenizing the
  canonical name itself** — matching an entity's own name is now automatic
  (see `matchGuess`/`suggestNames` below), so there's no "remember to add
  the self-alias" step any more, and no reason to add one for a name's own
  words/parts.
- `entity_stats` — **dated, sourced observations** about an entity:
  `(entity_id, stat_key, scope, value_numeric, display_value, as_of_date,
  origin_rank, source, verified_at)`. Append-only by convention — a
  correction or an updated in-progress-season total is a **new row with a
  new `as_of_date`**, never an `UPDATE` in place, so "what did we believe
  true, and as of when" stays recoverable instead of silently overwritten,
  and a category can honestly state the date its numbers are accurate up
  to instead of a hand-written subtitle claim that can go stale unnoticed.
  `origin_rank` has two load-bearing roles, not one — see its comment in
  schema.sql and `rebuild.ts`'s `REBUILD_QUERY_SQL` comment: it's both a
  manual order-pin for otherwise-unresolved ties, and (grouped with
  `entity_id`) the thing that keeps a "one row per occurrence" category
  (e.g. a repeat World Cup Golden Boot winner) from collapsing two real
  occurrences of the same entity into one when the rebuild picks "the
  latest observation."
- `category_defs` — **the query a category's Top N is computed from**, one
  row per category: `stat_key`, `scope`, `sort_dir`, an optional
  `tiebreak_stat_key`/`tiebreak_dir`, `limit_n` (the bounded Top N — see
  below), and `target_date` (`NULL` = always the latest known value; a
  fixed date freezes a genuinely historical question so it always resolves
  the same way regardless of when it's played).
- `category_answers` — **the materialized snapshot gameplay actually reads
  and grades against**, written only by `rebuildCategory()`
  (`src/worker/lib/rebuild.ts`), never hand-edited. Materializing into a
  real table rather than computing a category's Top N live on every request
  is deliberate: `entity_stats` keeps accumulating new dated observations
  underneath it (a season's goal tally ticking up, say), but a round in
  progress needs a *stable* answer set for its whole duration — see
  `rebuild.ts`'s module comment. Each row carries its own `as_of_date`; the
  category-level "Data as of ..." date shown to players (see
  `formatAsOfDate.ts`) is `MAX(as_of_date)` across a category's rows,
  computed at query time, not a separately-tracked field that could drift
  from the rows it's summarizing.
- `content_version` — single-row counter, bumped by `rebuildAll()` on every
  rebuild. Used as the Cache API cache-busting key (`responseCache.ts`) for
  the two public read routes — see Serving/caching below. Never part of
  `db/seed.sql` (schema.sql seeds it fresh via `INSERT OR IGNORE` on every
  setup; a freshly-seeded local D1 has no prior rebuild history to version).
- `transfers` / `management_spells` — added 2026-09-01 for a stats-
  enrichment project (player transfer history with EUR/GBP fees; manager
  career history). Each references a **second** entity (the counterpart
  club, or a country entity for a national-team managerial job) alongside
  the row's primary entity — the one case `entity_stats`'s single-`entity_id`
  shape doesn't fit, which is why these are dedicated tables rather than more
  `entity_stats` rows. Not yet read by any gameplay code (no `category_defs`
  reference them) — currently pure data, populated incrementally. Full
  schema, sourcing rules, and current coverage: `docs/stats-enrichment.md`.

### Generic rule: answers stay bounded, typeahead is broader

This still applies to every category, not just one, and the mechanism for
it changed but the rule didn't: **a category's answer set is a bounded Top N
(`category_defs.limit_n`, normally 10) — the typeahead/autocomplete pool for
the guess box is every entity**, which covers far more real, recognizable
names than just the current answers, so players can type/select accurately
even when guessing something that turns out to be wrong. If a request
sounds like "include more real X" for a category, check whether it actually
means the answer set (`limit_n` / what `category_defs`' query returns) or
the general entity pool before touching either — the Libertadores category
was expanded to 27 clubs and reverted once already (see "Historical
incidents") because of exactly this ambiguity, back when the two pools were
separate tables; the same ambiguity is just as real now that they're one.

`matchGuess` (guess validation/scoring) only ever reads a category's current
`category_answers` rows (joined out to `entities`/`entity_aliases`) — a name
existing in the general entity pool can't make a wrong guess "count" on its
own; it has to actually be one of that category's materialized answers.

**`suggestNames()` matches primarily through `entity_search`, an FTS5
virtual table**, not through `entity_aliases`. It indexes every entity's
canonical name, tokenized on word boundaries (`unicode61 remove_diacritics
2`), queried with a per-word prefix `MATCH` (see `toFtsPrefixQuery()` in
`normalize.ts`) — so a search matches ANY word of a name, not just its
start: typing "szo" finds "Dominik Szoboszlai" via its second word, with no
alias row required. Kept in sync by a trigger on `entities` alone now (see
schema.sql's `entity_search` comment for why this is simpler than before:
the old version mirrored two source tables with a `source`/`source_id`
discriminator, plus a separate trigger watching `categories.entity_type`
UPDATEs to fix up denormalized type on already-inserted rows — merging into
one `entities` table removed both of those, there's nothing left to
cascade). `entity_aliases` is still unioned in on top of the FTS match, but
only earns its keep for genuine nicknames that aren't a substring of the
canonical name at all — "psg", "barca", "spurs", "vvd" — those can't be
found by tokenizing the name itself.

**Adding a new `entities` row needs nothing beyond the plain `INSERT`** —
the trigger populates `entity_search` for you. Only add `entity_aliases`
rows for actual nicknames, not the name itself or its parts.

Seeded so far (see `db/seed.sql`; a `SELECT entity_type, COUNT(*) FROM
entities GROUP BY entity_type` on production is the fast way to check this
hasn't drifted from what's below):
- Several hundred football clubs, `entity_type = 'club'`.
- ~110 countries, `entity_type = 'country'` (UEFA + CAF members — scoped to
  the confederations the two 'country' categories actually cover).
- 100 well-known managers, `entity_type = 'manager'`.
- **~18,400 players**, `entity_type = 'player'` (a cleaned FIFA 21 dataset,
  loaded in 70 batches — see "Historical incidents" for that expansion's
  own story). **Explicitly not exhaustive** — unlike the club/country lists
  (objectively bounded: "current top-flight roster", "confederation
  members"), "notable players" has no natural boundary. Expand as gaps show
  up rather than trying to front-load completeness.

The typeahead-only portion of this pool (entities that have never been a
category answer) is **best-effort, not held to the same fact-checking bar as
`entity_stats`/`category_answers` content** (see Content accuracy below) —
it doesn't affect scoring, only what the guess box suggests, so an
occasional stale or missing entry here is a much smaller problem than a
wrong Top N. Extend the same way for other regions/entity types as new
categories get added — don't grow a category's `limit_n` past its actual
Top N to solve a typeahead gap.

**`db/seed.sql` is now a GENERATED export of production D1's content
tables, not a hand-maintained parallel copy** — see the header comment in
`db/seed.sql` itself for the exact regeneration command. This closes off a
bug class that bit this project twice under the old model (see "Historical
incidents": the seed.sql/production divergence incidents) rather than
relying on remembering to mirror every change by hand a third time. If
you're ever unsure whether `db/seed.sql` matches production, don't assume
it does — regenerate it, don't hand-edit toward a guess.

### Type-scoped typeahead

Both `categories` and `entities` carry an `entity_type` column (`'club'` |
`'player'` | `'country'` | `'manager'`, extend as new category shapes are
added — defaults to `'club'`). `suggestNames()` takes the *playing*
category's own `entity_type` and filters to it, so a players category (e.g.
Ballon d'Or) never suggests a club and a clubs category never suggests a
player. The `/api/suggest` route (`src/worker/routes/suggest.ts`) requires a
`category` query param for this — it looks up that category's `entity_type`
via `getCategoryBySlug` and returns no suggestions at all if the slug is
missing or unknown, rather than falling back to an unscoped, mixed-type
list. The frontend (`GuessInput.tsx`, via a `categorySlug` prop threaded
from `PlayScreen.tsx`) always sends it. When adding a new category whose
answers aren't clubs, players, countries, or managers, add the new
`entity_type` value here and to any seed data using it — the column has no
CHECK constraint, so a typo silently creates a type nothing will ever match
against.

- Categories are **not** date-gated — every category is playable any time.
  Per-device progress lives in KV, keyed by `progress:{deviceId}:{slug}`, kept
  indefinitely (no TTL) so a finished category is remembered and never
  resurfaces as fresh.
- Streak (`streak:{deviceId}`) is day-based and win-only, idempotent per
  calendar day (playing multiple categories in one sitting doesn't inflate
  it; a loss never erases it). Lifetime totals (`lifetime:{deviceId}`) move on
  every completion regardless of mode/result.

### Serving/caching and the rebuild job

- **`rebuildAll()` / `rebuildCategory()`** (`src/worker/lib/rebuild.ts`) run
  every `category_defs` row's query against `entity_stats` and rewrite that
  category's `category_answers` rows, then bump `content_version`. Driven by
  a **Cron Trigger** (`wrangler.json`'s `triggers.crons`, `0 3 * * *` UTC) —
  a `scheduled()` handler in the same Worker (`index.ts`), no external
  scheduler or new billable resource (Cron Triggers run on the Workers Free
  plan). Re-run it by hand (or on a shorter cadence) if you need a content
  fix to take effect before the next 03:00 UTC firing.
- **`cachedContentQuery()`** (`src/worker/lib/responseCache.ts`) wraps the
  D1 query behind `GET /api/categories` and `GET /api/categories/:slug` —
  the category metadata portion only, never the per-device progress/streak
  data those routes merge in from KV afterwards (caching the whole response
  would leak one device's "already played" status to another device hitting
  the same cache key). Keyed on a synthetic internal URL plus
  `content_version`, via Cloudflare's edge Cache API — a cache hit costs one
  cheap indexed point-read (`content_version`) instead of the full
  `categories`/`category_answers` join, and a rebuild's version bump
  invalidates every cached entry for free, no explicit purge to remember.
  `GET /api/reveal/:slug` and `GET /api/multiplayer/reveal/:slug` are
  **never** cached this way — they contain actual answer content gated on
  completion, and caching them behind a version key shared by every visitor
  would let anyone request a completed device's cached reveal.
- D1 `VIEW`s were considered and rejected for the materialization step:
  SQLite views aren't materialized (a `SELECT` against one re-runs the
  underlying query every time, same row-reads as querying the tables
  directly) — no perf win, and no answer-set stability during a round
  either. `category_answers` being a real table, written by an explicit
  rebuild, is what actually delivers both.

### Content accuracy

Content is hand/AI-researched, not pulled from a live API except where noted
below. Anything involving recent seasons/tournaments needs fact-checking
before being trusted — cross reference multiple independent sources
(WebSearch works from this environment for that; direct WebFetch to most
sports/reference sites does not — it's blocked by the sandbox's egress
proxy). When a topic is legally or factually contested (e.g. an appealed
match result), leave it out rather than guess. See git history on
`db/seed.sql` for precedent (PSG's Champions League tiebreak, the AFCON
2025/26 dispute left deliberately unmodeled).

**Deriving a category's order from `entity_stats` raises this bar, not
lowers it, and adds one new bug class the old hand-typed `answers` model
made impossible by construction: a silently wrong sort.** Whoever wrote an
`answers` `INSERT` chose the display order directly — a sorting bug simply
couldn't happen. Now that order comes from `ORDER BY value_numeric`, a
`display_value` that doesn't actually match its `value_numeric` (e.g.
display "£222m" entered alongside `value_numeric` 220000000) produces a
wrong-but-plausible-looking ranking with no visual tell. `npm run
verify:category-defs` is the standing check for this — see "Local
development" below — but it's still on you to get the number right when you
write it; the check only catches an internal inconsistency, not a
real-world-wrong one, same limitation `verify:matching`/`playtest` always
had (see the "none of the automated checks can catch a category whose
numbers are simply wrong" incident below — still true, just for
`entity_stats` now instead of `answers`).

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
2. **After any bug report on category content, don't just fix the one
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

**Incident: none of the automated checks can catch a category whose numbers
are simply wrong (2026-08-27).** `pl-2025-26-final-table` shipped with the
wrong 9th/10th place (Fulham/Newcastle United instead of the real
Brentford/Chelsea) and stayed wrong until a user caught it by eye.
`verify:matching` and `playtest` (this was before `verify:category-defs` and
`entity_stats`/`category_answers` existed — see below) all passed the whole
time — none of them are wrong to have passed, because none of them check
real-world correctness at all: they treat whatever's in D1 as ground truth
and test the app's *mechanics* against it (does a guess resolve, does a
name stay in sync with the reference pool, does the HTTP API behave).
There was never an automated check standing behind rule 1 above ("verify
every ranked entry... before it goes live") — only the discipline of
actually doing it.

**First attempt at a fix, rejected as the wrong shape (same day):** a
`verify:content-freshness` script that hard-failed CI on every push/PR
unless a `group_label = 'This Season'` category carried a
`-- Verified YYYY-MM-DD: <source>` comment. This was a paper-trail check,
not a fact-check — it enforced that someone *claimed* to have verified a
category, not that the claim was true, and it ran regardless of whether
`db/seed.sql` had even changed. Correctly called out as not what was
asked for and removed the same day (see git history around 2026-08-27 for
both the add and the removal).

**`npm run verify:content-source` (`scripts/verify-content-source.ts`) is
the actual fact-check** — it fetches the real current standings/scorers
for each mapped category from football-data.org (a live, structured
sports-data API; free-tier key required, see below) and diffs them
against `db/seed.sql`, rank by rank, name and stat value. Coverage is
necessarily partial: the mapping only covers the current-season
domestic-league/UEFA/FIFA categories the API actually models (exactly
`group_label = 'This Season'`) — there's no known free, structured API for
all-time records or transfer fees, so those still depend on manual/AI web
research at creation time, same as before; rule 1 above still applies to
them. **This runs via `.github/workflows/content-check.yml`, gated on
`paths: db/seed.sql` — not in `ci.yml`, and not on every push** — a push
that doesn't touch `db/seed.sql` has nothing here to check, which was the
other half of what the first attempt got wrong. Requires a
`FOOTBALL_DATA_API_KEY` repository secret (free registration at
football-data.org); until that secret is set, the job runs and prints a
clear "skipped" message rather than failing.

**This script was written without the ability to test a live call against
the API from the sandbox it was built in** (its egress proxy blocks every
external host tried — see "Content accuracy" above and the file's own
header comment) — it only runs on a real network once it's actually in
CI. If the API's real response shape differs from what
`verify-content-source.ts` assumes, the first real run will surface that
clearly (it fails loudly and prints the raw response rather than silently
misreading it) — fix the parsing there against that real response, don't
guess again from a sandbox that can't reach the API to check.

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
`entities` (`reference_entities` at the time of this incident — see the
Data model section above for the current single-table model) some other way
than a plain `INSERT` (bypassing the trigger).

**Production D1 is not auto-applied from `db/seed.sql` — it's the other way
around now (as of the 2026-08-31 entities/`category_defs` rebuild).**
Workers Builds (see Deployment) only builds and deploys the Worker/frontend
code — it does not run any D1 migration or seed step. Content changes are
applied to production D1 by hand via the Cloudflare MCP `d1_database_query`
tool (a content edit is an `entity_stats` `INSERT` + rebuild, not a direct
`category_answers` edit — see Data model above), and `db/seed.sql` is then
**regenerated from production**, not hand-edited to match it — see
`db/seed.sql`'s header comment for the exact export command. The incidents
below describe what happened under the *previous* mirror-by-hand model
(both directions, hand-edited seed.sql "mirrored" to production) and are
kept for the history of why that model was replaced — they're not a
description of the current process.

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

If you're ever unsure whether `db/seed.sql` still matches production, don't
assume it does — regenerate it from production (see `db/seed.sql`'s header)
rather than comparing counts and hand-patching; that's the whole point of it
being a generated export now instead of a second hand-maintained copy.

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

**`verify-name-sync.ts` (and its `KNOWN_COLLISIONS` allowlist) is retired
(2026-08-31) — the bug class it existed for is now structurally closed, not
just checked for.** There's only one `canonical_name` per real-world entity
now (see Data model above); an "answer's name" and "its reference-pool
counterpart" can't drift apart because they're the same row. If you're
reading old commit history and see `verify:name-sync` referenced, that's
this incident and the retired script, not a currently-running check.

**That merge introduced a related-but-different collision risk, found
during the 2026-08-31 migration itself (not in production, in the migration
dry-run — see "Serving/caching and the rebuild job" above and the
migration's verification pass): two DIFFERENT real people sharing a bare
alias across the two formerly-separate alias tables.** Cristiano Ronaldo's
old `reference_entities` row carried a legacy "ronaldo" alias (harmless
before — reference aliases only ever fed typeahead, never scoring); Ronaldo
Nazário's answer in `wc-alltime-goalscorers`/`ballon-dor-most-wins`
genuinely needs "ronaldo" as a scoring alias (his `canonical_name` is
"Ronaldo Nazario", two words, so a bare "ronaldo" guess doesn't self-match).
Merging both alias sets into one `entity_aliases` table put both entities'
"ronaldo" alias in the same table for the first time, and `verify-guess-
matching.ts`'s cross-entity collision check (see below) caught it
immediately, in the same category. Fixed by deleting the redundant alias
from Cristiano Ronaldo's entity — it added no typeahead value his tokenized
`entity_search` match on "Cristiano **Ronaldo**" doesn't already cover, and
his own canonical name is always a valid match target now regardless (see
Data model above), so the alias row was pure legacy risk with no upside.
**The general lesson, not just this pair:** merging identity tables can
surface latent ambiguity that used to be inert because the two uses (answer
scoring vs. typeahead-only) were structurally separated — `verify-guess-
matching.ts`'s collision check is what catches this now, and it's exactly
why that check stayed (see below) rather than being retired alongside
name-sync.

#### Checklist: adding a new category

Everything above this point, distilled into the actual steps — every rule
here exists because skipping it shipped a real bug at some point (see the
incident writeups above for which one).

1. **Scope it as a bounded Top N** (normally 10, via `category_defs.limit_n`)
   — never "every entity that qualifies." If the request sounds like "add
   more real X", check whether it actually means the answer set or the
   general entity pool before touching either (see "Generic rule" above).
2. **Pick `entity_type`** — reuse `club`/`player`/`country`/`manager` if it
   fits. A genuinely new shape needs the value added consistently
   everywhere it's used; there's no CHECK constraint, so a typo here
   silently creates a type nothing will ever match against.
3. **Pick `group_label`/`group_order`** — `'This Season'` only if the
   category maps to a real football-data.org competition (that's what
   makes it eligible for step 7 below); otherwise this app's established
   `'All-Time Records'` / `group_order = 3` convention.
4. **Verify every ranked entry against at least two independent, reputable
   sources** before writing it — not just the entry that prompted the
   category, and not from a single WebSearch synthesis or this agent's own
   training knowledge alone (see "Content accuracy" above for why that bar
   exists). Ties broken by recency (or whatever the category's convention
   is), with the reasoning in a SQL comment above the `INSERT` — never in
   the player-visible subtitle.
5. **Insert or reuse `entities` rows for every answer**, each with a real
   `as_of_date` (the date the number is actually accurate up to — not
   today's date unless that's genuinely when it was verified) and, if
   needed, a `tiebreak_stat_key`/`origin_rank` on `category_defs` for how
   ties resolve. Add `entity_aliases` only for genuine nicknames not
   derivable from tokenizing the canonical name — an entity's own name is
   always a valid match target with no alias row required (see Data model
   above).
6. **Write the `category_defs` row** (`stat_key`, `scope`, `sort_dir`,
   `limit_n`, `target_date`) and run the rebuild (`rebuildCategory()`/
   `rebuildAll()` — see `rebuild.ts`) to materialize `category_answers`.
7. **Run the verification pipeline, in this order** (see "Local
   development" below for exact commands):
   - `npm run verify:matching` — always, after any `entity_stats`/
     `entity_aliases`/`category_defs` change.
   - `npm run verify:category-defs` — **required, not optional, every time
     a category is added or `entity_stats` changes** (catches a
     `display_value`/`value_numeric` mismatch or a query that silently
     produces the wrong row count — see "Content accuracy" above).
   - `npm run verify:content-source` — only for `group_label = 'This
     Season'` categories; add a `MAPPINGS` entry in
     `scripts/verify-content-source.ts` for the new category first.
   - `npm run playtest` — before merging. Also bump the hardcoded category-
     count assertion in `scripts/playtest.ts`.
8. **Apply the same content to production D1 in the same step**, via the
   Cloudflare MCP `d1_database_query` tool (the `entity_stats`/
   `category_defs` `INSERT`s, plus running the rebuild against production),
   verify with a `SELECT` after, then **regenerate `db/seed.sql` from
   production** (see its header comment) rather than hand-editing it — don't
   let these drift (see the "silently diverged" incident above for what
   that cost under the old hand-mirrored model).
9. **Push and confirm CI (and `content-check.yml`, if `db/seed.sql`
   changed) are green** before considering it done.

And separately, **whenever a bug is reported in existing content**: don't
just fix the one entry — audit the rest of that category, and give every
other dated/`'This Season'` category the same pass (see "Content accuracy"
above).

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
npm run verify:matching        # re-seed local D1 first — see scripts/verify-guess-matching.ts
npm run verify:category-defs   # re-seed local D1 first — see scripts/verify-category-defs.ts
npm run playtest                # self-resets local D1 + KV — see scripts/playtest.ts

# Requires FOOTBALL_DATA_API_KEY (free tier: https://www.football-data.org/client/register)
# — re-seed local D1 first; prints a "skipped" message rather than failing if the key isn't set.
FOOTBALL_DATA_API_KEY=... npm run verify:content-source  # see scripts/verify-content-source.ts
```

**Run `npm run verify:matching` after any change to `entity_stats`/`entity_aliases`/
`category_defs`, or to `matchGuess()`/`normalize.ts`.** It checks against local D1: every
current answer's own canonical name is (trivially, always) reachable — matching an entity's
own name no longer depends on an alias row existing (see Data model above), so this half of
the old check is now closed by construction rather than merely tested — plus referential/rank
integrity of `category_answers`, and the check that's still a genuine live risk: no two
DIFFERENT entities answering the same category collapse to the same match string (name or
alias). That last one is exactly what caught the Cristiano Ronaldo / Ronaldo Nazário alias
collision during the 2026-08-31 entities migration — see the incident writeup in "Content
accuracy" above. A passing run is not optional evidence you can skip and still claim you
checked — it's the actual check.

**Run `npm run verify:category-defs` after any change to `entity_stats` or `category_defs`,
and always when adding a new category — this is a required step, not an optional one.** It
checks that every `entity_stats` row's `display_value` is actually consistent with its
`value_numeric` (catches the "£222m" display next to a contradictory raw number" class of bug
— see "Content accuracy" above for why deriving order from `value_numeric` makes this a real,
previously-impossible risk), and that every `category_defs` row's query produces a non-empty
result matching what's actually materialized in `category_answers` (catches a typo'd
`stat_key`/`scope`, or a stale rebuild). **This also runs in CI** (`.github/workflows/ci.yml`)
— it's the direct replacement for the retired `verify:name-sync` in that pipeline, covering a
different bug class specific to the derived-answers model.

**Run `npm run verify:content-source` after adding or changing any answer in a
"This Season" category (`group_label = 'This Season'`).** Unlike the other three
checks, it fact-checks against a live external source (football-data.org) rather
than checking the app's own internal consistency — see the incident writeup in
"Content accuracy" above for what it covers and why its coverage is necessarily
partial (only categories the API actually models). **This also runs in CI, but
differently from the other checks: `.github/workflows/content-check.yml`, gated
on `paths: db/seed.sql`, not `ci.yml`'s every-push job** — see that file and the
incident writeup for why.

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

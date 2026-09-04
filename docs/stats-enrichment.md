# Stats enrichment: transfers, career stats, club/manager facts

An ongoing content project, started 2026-09-01, to populate `transfers`,
`management_spells`, and new `entity_stats` stat_keys (player career
totals; club titles/stadium/founding; manager status) — the data the user
asked for: "transfers from and to and how much, in Euros and pounds... goals,
own goals, appearances, red cards, assists... club stats such as titles,
relegations, promotions, stadium capacity, year they started... Manager
stats such as clubs managed from and to, titles, retirements."

**Read this file before doing any more work on this project.** It's the
complete reference: schema, conventions, sourcing rules, exact current
state, and exactly what's left. `PROGRESS.md` only has a short pointer here.

## Why this isn't "for all players" (scope decision)

The user's literal request was "for all players where possible." That's
~19,364 entities. This session has no bulk football-stats API access —
only turn-by-turn WebSearch — so exhaustive coverage isn't achievable in
any reasonable timeframe, and generating plausible-looking numbers without
a real source would violate this project's no-fabrication culture (see
`agents.md`'s Content accuracy section and its incident writeups).

The user chose a scoped "broader tier" instead of the two other options
offered (answer-entities-only, or literally-all-19364). That tier was
defined **objectively**, not by ad-hoc fame judgments, as:

- **All 115 managers** (`entity_type='manager'`) — small, already curated.
- **All 206 clubs with 2+ aliases** — an existing signal in the data:
  clubs recognizable enough to have nicknames already got them during
  migration; clubs with 0-1 aliases are mostly lower-league squad-depth
  entries with no such signal. (**Player** alias-count doesn't work as a
  fame filter — nearly every player already has 2+ aliases from a
  mechanical full-name+surname convention, so it's not selective.)
- **Players id 530-650** ("batch 1" of the star-player cluster) — ids
  530 onward are a hand-curated block of current/historic global stars
  (Messi=530, Ronaldo=531, Mbappé=536, Haaland=537, ...). Sampling showed
  this block's "obviously famous" quality fades out somewhere around
  id 900-1300 (e.g. id 1200 = Mascherano, still recognizable; id 1350 =
  Jonny Otto, id 1450 = Laurent Henkinet — journeyman squad players, not
  meaningfully different from the id>1500 "current squads" bulk). Batch 1
  (121 players) is a first slice of this block, not the whole thing — see
  "What's left" below for how to extend it.

This is a multi-session content project by design, not a single-turn
deliverable. Each session should do a real, bounded, well-sourced slice
and leave clear notes — same pattern as `agents.md`'s content-accuracy
incident history.

## Schema

Two new tables (added to `db/schema.sql`, migration-free since D1/SQLite —
already live in both local and production D1):

```sql
CREATE TABLE transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES entities(id),
    from_club_id INTEGER REFERENCES entities(id),  -- NULL: youth academy / no prior club on record
    to_club_id INTEGER REFERENCES entities(id),    -- NULL: retired / no subsequent club on record
    transfer_date TEXT NOT NULL,      -- "YYYY-MM-DD"; use the 1st of the month if only month/year known
    transfer_type TEXT NOT NULL DEFAULT 'permanent'
        CHECK (transfer_type IN ('permanent', 'loan', 'free', 'undisclosed')),
    fee_eur_value REAL,               -- NULL for free/loan/undisclosed
    fee_gbp_value REAL,               -- see "Currency conversion" below
    display_value TEXT NOT NULL,      -- what's shown, e.g. "€222m (~£195m)" or "Free transfer"
    source TEXT NOT NULL,
    verified_at TEXT NOT NULL
);

CREATE TABLE management_spells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER NOT NULL REFERENCES entities(id),
    club_id INTEGER REFERENCES entities(id),  -- may be a country entity for a national-team job
    start_date TEXT NOT NULL,
    end_date TEXT,                    -- NULL: still in charge as of verified_at
    titles_won TEXT,                  -- free-text summary for this spell
    source TEXT NOT NULL,
    verified_at TEXT NOT NULL
);
```

Why not cram this into `entity_stats`? A transfer or a managerial spell
inherently references a **second** entity (the counterpart club) —
`entity_stats` only ever carries one `entity_id` per row. Storing the
counterpart as a bare name string in `scope` would repeat exactly the
"identity is a name string, not an id" problem the whole single-source-of-
truth redesign exists to close off. Everything else (simple per-entity
facts) reuses `entity_stats` with new `stat_key` values — no schema
change needed there, that's what it was designed for.

### `entity_stats` stat_key vocabulary in use

All rows use `as_of_date`/`verified_at` = the date the research was done
(not the historical date something became true — these are "current as of
X" facts).

| stat_key | scope | Who | Meaning |
|---|---|---|---|
| `career-goals` | `career` | player | Career total, club competitions unless noted otherwise in `display_value` |
| `career-appearances` | `career` | player | Career total |
| `career-assists` | `career` | player | Career total (often unavailable for older careers — skip freely) |
| `career-red-cards` | `career` | player | Career total (often unavailable — skip freely) |
| `career-own-goals` | `career` | player | Career total (often unavailable — skip freely) |
| `founded-year` | `default` | club | Year founded |
| `stadium-capacity` | `current` | club | Current home ground capacity |
| `league-titles-count` | `domestic-league` | club | **Top-flight league titles only** — not cups, not continental. If a club's honours mix league eras (e.g. Soviet-era vs. post-independence), only the current-era competition counts; note the split in a comment, see `clubs_stats.sql` for two real examples (Dynamo Kyiv, Red Star Belgrade). |
| `times-relegated` / `times-promoted` | `all-time` | club | Hardest facts to source cleanly — low coverage is expected and fine, never force a guess |
| `career-titles-count` | `career` | manager | Total major trophies across whole career — **only** when a source states a clean countable total; skip otherwise (most managers don't get this row) |
| `manager-status` | `career` | manager | `value_numeric` NULL (genuinely not orderable — that's what NULL is documented for in `db/schema.sql`), `display_value` = `'active'` or `'retired'` |

### Currency conversion for transfers

**Strongly prefer a source that states the fee in both EUR and GBP
directly** (most transfer-fee reporting does — Transfermarkt, BBC, etc.
routinely quote both). Use those numbers verbatim; don't recompute them.

Only when a source gives just one currency, convert using this
**deliberately approximate** historical annual-average GBP-per-EUR table
(the user asked for "approximate," not exact daily rates):

```
2000:0.61 2001:0.62 2002:0.63 2003:0.69 2004:0.68 2005:0.68 2006:0.68 2007:0.68
2008:0.80 2009:0.89 2010:0.86 2011:0.87 2012:0.81 2013:0.85 2014:0.81 2015:0.73
2016:0.82 2017:0.88 2018:0.88 2019:0.88 2020:0.89 2021:0.86 2022:0.85 2023:0.87
2024:0.85 2025:0.84 2026:0.84
```

Multiply a EUR fee by that year's rate for an approximate GBP figure (or
divide a GBP fee by it for approximate EUR). Mark which is which in
`display_value`: a source's own dual-currency figure reads like
`'€180m (£165.7m)'`; a derived approximation reads like
`'€100m (~£88m, approx.)'`. Pre-2000 transfers: GBP approximation is
often skipped entirely (left NULL) rather than extending this table
further back on shaky ground — see Zidane's 1992/1996 transfers in
`data/research/players_batch1_transfers.sql` for the pattern.

## Sourcing / accuracy rules (non-negotiable — read `agents.md`'s Content
accuracy section for why this matters this much)

- **Never invent or estimate a number without a real source.** Skip the
  fact entirely rather than guess a plausible value. A missing row is
  fine; a wrong row is not.
- Prefer stable sources (Wikipedia, Transfermarkt, official club/league
  sites, major outlets) over forums or unsourced aggregators. Cite the
  outlet by name in `source`.
- When a name is ambiguous or a club/country genuinely isn't in the
  entity pool, leave the FK (`from_club_id`/`to_club_id`/`club_id`) as
  `NULL` and say so in a SQL comment rather than guessing a match — see
  the many `-- ... club_id unresolved` comments throughout
  `data/research/managers_spells.sql` for the pattern. A NULL FK still
  keeps everything else about the row (dates, fee, titles) useful.
- Resolve a club/country name to its `entities.id` with a **read-only**
  query against local D1 (already fully seeded):
  ```
  wrangler d1 execute tenable-content --local --json --command \
    "SELECT id, canonical_name, entity_type, scope FROM entities WHERE canonical_name LIKE '%<fragment>%' AND entity_type IN ('club','country');"
  ```

## Output format

One SQL file per research batch, `INSERT INTO <table> (...) VALUES (...);`
statements grouped by entity with a `-- <name> (entity_id N)` comment
above each group — see any file in `data/research/` for the exact style.
Batch a few hundred rows per statement, not one INSERT per row.

## Where things stand right now (2026-09-04)

**Production D1** (`tenable-content`, `a87ef250-cc94-4765-a821-785acbcd71a4`)
currently has, verified directly by query with 0 orphaned foreign keys:

- `management_spells`: **1,017 rows, all 115 of 115 managers** — the
  managers backfill (`apply_remaining_managers.sh`) has been fully applied.
  `entity_stats` manager coverage (`manager-status`/`career-titles-count`)
  is **not** the same count as `management_spells` coverage — that stat_key
  pair is only written "when a source states a clean countable total" per
  its row in the vocabulary table above, so expect it to stay below 115.
- `transfers`: **85 rows, 18 of 121 players** (Lionel Messi id 530 through
  Samuel Eto'o id 547 — the first 18 rows of `candidate_players_batch1.csv`)
  — **unchanged**, still the next priority item below.
- `entity_stats` (`career-goals` etc.): same 18 players as `transfers`.
- `entity_stats` (`founded-year`/`stadium-capacity`/`league-titles-count`/
  `times-relegated`): **all 206 of 206 club candidates** — the 48 remaining
  clubs in `clubs_remaining.csv` were researched and applied 2026-09-04
  (`clubs_remaining_stats.sql`), including Cajamarca (id 146), which the
  prior session skipped as ambiguous — resolved this time via
  `entity_aliases` ("fc cajamarca"); only its `stadium-capacity` was left
  out (sources disagreed sharply, see that file's comment). **Club
  candidate coverage is now fully complete** — nothing left in this tier.

`db/seed.sql` is kept in sync with production as of 2026-09-04 (regenerated
after the above). To regenerate again after any future production content
change, same command as always:

```
wrangler d1 export tenable-content --remote --no-schema \
  --table=categories --table=entities --table=entity_aliases \
  --table=entity_stats --table=category_defs --table=category_answers \
  --table=transfers --table=management_spells \
  --output=db/seed.sql
```

(Same command as `db/seed.sql`'s own header documents. **Deliberately no
`--table=content_version`** — that table is runtime state schema.sql
already seeds correctly on its own; including it in the export crashes a
fresh local reset with `UNIQUE constraint failed: content_version.id`, hit
and fixed 2026-09-04. Re-paste seed.sql's header comment back in after any
raw `wrangler d1 export` — the tool doesn't preserve it. Verified again
2026-09-04: a full local reset — `rm -rf .wrangler/state/v3/d1` then
re-running `schema.sql` then the regenerated `seed.sql` — comes up clean,
plus `npm run verify:matching`, `npm run verify:category-defs`, and
`npm run build` all pass against it.)

### `data/research/` — the raw research, committed for durability

Committed straight into the repo (not left in this session's ephemeral
sandbox) so nothing from this session's work is lost:

| File | Status |
|---|---|
| `managers_list.csv` | All 115 manager candidates (entity_id\|name\|nationality) |
| `candidate_clubs.csv` | All 206 club candidates (2+ alias clubs) |
| `candidate_players_batch1.csv` | Players 530-650 (121 candidates, "batch 1" only) |
| `players_batch1_remaining.csv` | The 103 players from batch 1 NOT yet researched |
| `managers_spells.sql` / `managers_stats.sql` | **Fully applied to production already** (all 115 managers). Kept as a durable, reviewable record only. **Do not re-run these files** — `managers_spells_remaining.sql`/`managers_stats_remaining.sql`/`apply_remaining_managers.sh` all did their job and have no more work left to do. |
| `clubs_stats.sql` | **Fully applied to production already** — matches production exactly (205 clubs). Kept here as a durable, reviewable record only. **Do not re-run this file.** |
| `clubs_remaining.csv` / `clubs_remaining_stats.sql` | **Fully applied to production already** (2026-09-04) — the 48 remaining club candidates, matches production exactly (206/206 club candidates now have stats). Kept as a durable, reviewable record only. **Do not re-run this file.** Club candidate research is now fully complete — nothing left in this tier. |
| `players_batch1_transfers.sql` / `players_batch1_stats.sql` | **Fully applied to production already** (18 players, ids 530-547) — matches production exactly. **Do not re-run these files.** |

## What's left, in priority order

1. **Research the 103 remaining batch-1 players** in
   `players_batch1_remaining.csv` — same process, new output files
   (don't touch the existing `players_batch1_*.sql`, already applied).
2. **Extend player coverage past batch 1** — the "notable tier" scope
   (id 530-1500ish) has ~850 players beyond batch 1 that have never had a
   candidate list generated. Generate one the same way this session did:
   ```sql
   SELECT id, canonical_name, scope FROM entities
   WHERE entity_type='player' AND id BETWEEN 651 AND 1500 ORDER BY id;
   ```
   then apply the same fame-decay judgment call this session made (the
   "obviously famous" quality fades well before 1500 — sample a few dozen
   ids first to find a sensible real cutoff for a given batch, the same
   way this session sampled ids 900-1500 before settling on batch 1's
   530-650 range).
3. After each new batch is applied to production, **repeat the
   `db/seed.sql` regeneration** so it never drifts from production again
   (same one-line export command above).

## A note on how this session applied data (don't repeat this)

This session ran in a sandbox with no direct Cloudflare credentials —
production writes had to go through an MCP tool one SQL statement at a
time, which is why application happened in small manual chunks and why
production is only partially caught up with the research files. **Your
local machine has real `wrangler` credentials** (via `wrangler login`),
so applying a whole file is one command:

```
wrangler d1 execute tenable-content --remote --file=data/research/<file>.sql
```

Always apply to **local D1 first** (`--local` instead of `--remote`),
verify counts, *then* apply to production — same order this session
used throughout (see `agents.md`'s Local development section). Verify
with a `SELECT COUNT(*)` / orphan-check query (patterns above) after
every apply, on both local and production, before moving on.

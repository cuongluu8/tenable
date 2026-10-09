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
state, and exactly what's left.

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
    verified_at TEXT NOT NULL,
    date_precision TEXT NOT NULL DEFAULT 'unverified'  -- added 2026-10-09, see below
        CHECK (date_precision IN ('day', 'month', 'inconclusive', 'unverified'))
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

### `transfers.date_precision` (added 2026-10-09)

Every transfer date is checked against a **second independent source** (the
player's Italian/Portuguese/French Wikipedia article, Soccerway's transfer
log, contemporary press). The result is recorded per row:

- `day` -- a source states the day and no other source contradicts it.
- `month` -- a source states the month and the others agree on the year;
  `transfer_date` is the 1st. Also used when two sources give different
  days in one month, and when they give different months in one year --
  then the **earlier** month is stored.
- `year` -- sources give only the year (or "summer", "early 2004", a
  debut date). The month and day of `transfer_date` are a placeholder that
  keeps a player's moves in order, nothing more.
- `inconclusive` -- sources disagree on the year, or none states one.
  Never use the date.
- `unverified` -- never cross-checked. The original 85 rows (players
  530-547) are all this.

This is the user's rule, stated 2026-10-09: an agreed year is enough, a
more specific date from one source stands unless contradicted, and only a
missing or disputed year is inconclusive. (The first attempt the same day
demanded two sources agreeing on month+year and marked 105 of 137 rows
inconclusive -- far too strict; don't reintroduce it.) **A question about
when a move happened may only ask at the row's own precision or coarser,
and never from an `inconclusive` or `unverified` row.**

A database that predates the column needs
`migration_transfers_date_precision.sql`; one that has the column but
rejects `'year'` (production did, briefly) needs
`migration_transfers_date_precision_v2.sql`.
Transfermarkt and worldfootball.net both refuse automated fetches (tried
2026-10-09) -- don't spend calls retrying them.

### `entity_stats` stat_key vocabulary in use

All rows use `as_of_date`/`verified_at` = the date the research was done
(not the historical date something became true — these are "current as of
X" facts).

**2026-09-04 change: `career-goals`/`career-appearances` are no longer written
as a single aggregated `entity_stats` row per player.** A lump total sourced
from one aggregate figure gave no way to cross-check itself and was the root
cause of a real batch of confidently-wrong data (see the incident notes
below). Instead, use the new `player_career_stats` table (see
`db/schema.sql`): one row per club spell or national-team level, each an
independently-sourced literal figure. A player's career total for club
competitions is a `SUM(appearances)`/`SUM(goals)` query over
`player_career_stats WHERE player_id = ? AND competition_type = 'club'`, not
a separately-stored number. `career-assists`/`career-red-cards`/
`career-own-goals` are unaffected — they stay as `entity_stats` rows below,
since those are rarely available at all and don't have the same
"aggregate-of-an-aggregate" failure mode (there's no per-club breakdown to
reconcile them against in the first place).

`scripts/research_player_stats.py` automates populating
`player_career_stats` mechanically (Wikipedia infobox extraction, no LLM
involved) — see that script's own docstring for the full method and usage.
It never cross-checks against the infobox's own separately-maintained
totalcaps/totalgoals field (that field isn't stored at all) — the per-club/
international breakdown is the fact, and an individual appearances/goals
value is left `NULL` rather than guessed whenever the source itself doesn't
state it. `transfers` still needs an LLM/human pass (reading prose for fee
disputes is a judgment task, not a mechanical one).

| stat_key | scope | Who | Meaning |
|---|---|---|---|
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

## Incident, 2026-09-04: a batch of confidently-wrong career totals

A batch of LLM research agents tasked with getting career-goals/appearances
for ~103 players via WebSearch produced numbers that were confidently wrong
by 20-45% for several players (Wayne Rooney: 237 goals claimed vs. real 366;
Gerd Müller: 487 vs. real ~606; Casemiro: 49 vs. real 55, plus a fabricated
club). Root cause: WebSearch snippets don't carry reliable scope metadata
(league-only vs all-competitions, stale vs current, sometimes even inventing
a club), and hand-summing across mismatched snippets silently produces a
wrong-but-plausible-looking total with false confidence. The batch was
caught by spot-checking a handful of results against primary sources — not
by anything in the agents' own self-validation — and discarded entirely
before anything touched a database.

The fix wasn't "be more careful," it was structural: **stop storing a
single aggregate total sourced from a synthesis step, and store the
per-team breakdown instead** (see `player_career_stats` above) — each row
is one literal figure straight from the source, no separately-maintained
"Total" field to disagree with it (that field isn't even read). An
individual appearances/goals value the source itself doesn't state is left
`NULL`, never guessed or derived — a career total is a `SUM()` over
whatever's known, which will honestly undercount a player with unresolved
early-career data rather than force a wrong-but-complete-looking number.
`scripts/research_player_stats.py` does this extraction mechanically (no
LLM per player at all), which also removes the token cost this kind of
research was running up.

## Where things stand right now (2026-09-04; re-verified 2026-09-14)

**Status: still in progress.** Career stats are done for 350 players
(batch 1's 121 + batch 2's 247, less 3 fatal), all 115 managers and all
206 club candidates are done, but transfers exist for only the first 18
players -- items 1-3 under "What's left" are real, unstarted work.
Re-checked 2026-09-14 against the local D1 mirror of production
(`db/seed.sql` regenerated 2026-09-13): 85 transfers / 18 players, 1,017
spells / 115 managers, 3,139 `player_career_stats` rows / 350 players,
club stats as itemised below.

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
- `entity_stats` club facts: **all 206 of 206 club candidates have
  `founded-year`**; `league-titles-count` 203, `stadium-capacity` 202,
  `times-relegated` 8 (low by design -- see the vocabulary table: never
  forced where sources don't state it cleanly) — the 48 remaining
  clubs in `clubs_remaining.csv` were researched and applied 2026-09-04
  (`clubs_remaining_stats.sql`), including Cajamarca (id 146), which the
  prior session skipped as ambiguous — resolved this time via
  `entity_aliases` ("fc cajamarca"); only its `stadium-capacity` was left
  out (sources disagreed sharply, see that file's comment). **Club
  candidate coverage is now fully complete** — nothing left in this tier.

`db/seed.sql` is kept in sync with production (last regenerated 2026-09-13
-- see `git log -- db/seed.sql`). To regenerate again after any future production content
change, same command as always:

```
wrangler d1 export tenable-content --remote --no-schema \
  --table=categories --table=entities --table=entity_aliases \
  --table=entity_stats --table=category_defs --table=category_answers \
  --table=transfers --table=management_spells --table=player_career_stats \
  --table=club_badge_questions --table=teammate_questions \
  --output=db/seed.sql
cat db/seed_header.txt db/seed.sql > /tmp/s && mv /tmp/s db/seed.sql
```

(`db/seed.sql`'s own header is the authoritative copy of this command --
if the two ever differ, use the header's. This doc's copy went stale once:
on 2026-10-09 it still lacked the two question tables, and an export run
from it silently dropped Club Run / Teammate Tell from the seed until it
was re-run. **Deliberately no
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
| `candidate_players_batch2_part1.csv` / `players_batch2_part1_stats.sql` | **Fully applied to production already** (2026-09-09/10) — 247 of 250 candidates in ids 651-900 (3 fatal, no usable Wikipedia infobox — see `players_batch2_part1_review.md`). No transfers research done for this batch yet. **Do not re-run these files.** |
| `players_batch1_remaining.csv` / `players_batch1_remaining_stats.sql` | **Career stats fully applied to production already** (2026-09-11) — all 103 remaining batch-1 candidates (ids 530-650), 0 fatal. **Transfers not yet researched** for these 103 -- see "What's left" below. **Do not re-run the stats file.** |

## What's left, in priority order

**2026-10-09:** transfers for players 548-559 (12 players, 72 rows) are
researched in `data/research/players_batch1_transfers_part2.sql` --
and players 560-571 (12 players, 65 rows) in
`players_batch1_transfers_part3.sql`. Part 2 was applied to production
under the first, too-strict labelling, then both files were relabelled.
`migration_transfers_date_precision_v2.sql`, part 2 and part 3 were then
applied to production in that order, confirmed by query 2026-10-09: 222
transfers / 42 players -- 34 `day`, 35 `month`, 61 `year`, 7
`inconclusive`, 85 `unverified`. **Do not re-run any of these files.**

Players 572-583 (32 rows; Giggs and Scholes have none) are researched in
`players_batch1_transfers_part4.sql` -- applied to production and synced
into `db/seed.sql` 2026-10-09. **Do not re-run it.** Production and seed
now hold 254 transfers / 52 players: 51 `day`, 45 `month`, 66 `year`, 7
`inconclusive`, 85 `unverified`.

Players 584-595 (47 rows; Puyol, Maldini and Totti have none) are
researched in `players_batch1_transfers_part5.sql` -- applied to
production and synced into `db/seed.sql` 2026-10-09. **Do not re-run
it.** Production and seed now hold 301 transfers: 74 `day`, 54 `month`,
81 `year`, 7 `inconclusive`, 85 `unverified`, 0 orphaned ids.

Players 596-607 (71 rows, Falcao to Sneijder) are in
`players_batch1_transfers_part6.sql`, also applied to production and
synced into the seed 2026-10-09. **Do not re-run it.** Production and
seed now hold 372 transfers / 73 players with rows: 123 `day`, 73
`month`, 84 `year`, 7 `inconclusive`, 85 `unverified`, 0 orphaned ids.

Players 608-619 (54 rows, Robben to Vinicius Junior) are in
`players_batch1_transfers_part7.sql`, also applied to production and
synced into the seed 2026-10-09. **Do not re-run it.** Production and
seed now hold 426 transfers: 161 `day`, 82 `month`, 91 `year`, 7
`inconclusive`, 85 `unverified`, 0 orphaned ids. Most players from id
596 on are still active -- their rows are their history as of
2026-10-09 and will go stale as they move.

Players 620-650 (96 rows, Bellingham to Ballack) are in
`players_batch1_transfers_part8.sql`, applied and synced the same day.
**Do not re-run it.** Its sourcing is weaker: ids 635-650 rest on the
English Wikipedia article alone (see the file's header).

**Batch 1 transfers are complete (2026-10-09).** Production and seed
hold 522 transfers for 112 of the 121 batch-1 players, 0 orphaned ids.
The other 9 are one-club players with no moves to record (Giggs,
Scholes, Puyol, Maldini, Totti, Gavi, Saka, Foden, Yashin). **Item 1
below is done; item 2 (batch 2, ids 651-900) is next.**

`transfers_date_recheck.sql` (applied the same day; it supersedes the
dates in `players_batch1_transfers.sql` and a few rows of part 8) then
did two clean-ups: the 85 original rows for players 530-547 were
checked against two Wikipedia articles each and relabelled -- no
`unverified` rows remain -- and players 636-650 got their second source.
Final split: 262 `day`, 130 `month`, 123 `year`, 7 `inconclusive`. A
clean local rebuild from `db/schema.sql` + `db/seed.sql` passes
`verify:matching` and `verify:category-defs`.

`transfers_followup_fixes.sql` (applied the same day, **do not re-run**
-- its INSERTs are unguarded) closed the gaps that left: fees for
players 530-547 rechecked against both articles (14 rows changed),
Mbappe's 2017 move split into the loan and the 2018 purchase, Fabinho's
second source, and 12 missing moves added for Ronaldinho, Lewandowski,
Modric, Salah, Drogba and Eto'o. **Production and seed now hold 535
transfers: 270 `day`, 133 `month`, 125 `year`, 7 `inconclusive`, 0
orphaned ids.**

What is still soft:
- Five fees for the original 18 rest on the first research pass's single
  aggregator figure, with nothing in either Wikipedia article to confirm
  or contradict them: Ronaldo to Manchester United 2021 (EUR 17m),
  Ronaldinho to Flamengo (EUR 3m), Neymar to Al-Hilal (EUR 90m), and
  Haaland's moves to Molde and Salzburg.
- The seven `inconclusive` rows (sources disagree on the year).
- Players active today will go stale as they move; nothing refreshes
  these rows automatically.

Convention added with part 4: when a move was announced long before it
happened (a pre-contract), `transfer_date` is the date the player joined
and the announcement date goes in `display_value`.

1. **Research transfers (fee/date history) for the 103 players in
   `players_batch1_remaining_stats.sql`** -- career stats are done and
   live; transfers are the harder, judgment-requiring half
   (`scripts/research_player_stats.py` deliberately doesn't attempt this
   -- see its own doc). Same sourcing rules as the original 18 (see
   `players_batch1_transfers.sql` for the pattern): one clear, sourced
   fee/date per move, never estimated: flag and skip rather than guess
   when a source disagrees or is ambiguous.
2. **Do the same for batch 2's 247 players** (ids 651-900,
   `candidate_players_batch2_part1.csv`) -- career stats are done.
   **In progress since 2026-10-09**, in files named
   `players_batch2_transfers_partN.sql`, each applied to production and
   synced into the seed as it is finished (**do not re-run them**):
   - part 1: ids 651-665, 77 rows. Production total after it: 612.
   - part 2: ids 666-680, 83 rows. Production total after it: 695.
   - part 3: ids 681-695, 63 rows. Production total after it: 758.
   - part 4: ids 696-710, 40 rows. Production total after it: 798.
     (Fabian Ruiz and Vitinha rest on the English article only.)
   - part 5: ids 711-725, 54 rows. Production total after it: 852.
     (Nwaneri rests on the English article only.)
   - part 6: ids 726-740, 48 rows. Production total after it: 900.
     (Curtis Jones and Luis Diaz rest on the English article only.)
   - part 7: ids 741-755, 52 rows. Production total after it: 952.
   - part 8: ids 756-770, 43 rows. Production total after it: 995.
     (Khusanov rests on the English article only.)
   - part 9: ids 771-785, 47 rows. Production total after it: 1,042.
     (Reece James rests on the English article only.)
   - part 10: ids 786-800, 54 rows. Production total after it: 1,096.
     (Joao Pedro rests on the English article only.)
   - part 11: ids 801-815, 67 rows. Production total after it: 1,163.
   - part 12: ids 816-830, 75 rows. Production total after it: 1,238.
     (Archie Gray, Anthony Gordon and Harvey Barnes rest on the English
     article only.)
   - part 13: ids 831-845, 66 rows. Production total after it: 1,304.
   - part 14: ids 846-860, 63 rows. Production total after it: 1,367.
   - part 15: ids 861-875, 67 rows. Production total after it: 1,434.
     (Daniel Munoz, Chris Richards, Idrissa Gueye and Beto rest on the
     English article only.)
   - part 16: ids 876-888, 50 rows. Production total after it: 1,484.
     (Joachim Andersen and Bart Verbruggen rest on the English article
     only.)
   Resume at the first id not listed here. Many batch-2 players' minor
   clubs are missing from the club pool, so NULL club ids are common.
3. **Extend player coverage past id 900** -- the "notable tier" scope
   (id 530-1500ish) has ~600 players beyond batches 1+2 that have never
   had a candidate list generated. Generate one the same way this
   project has each time:
   ```sql
   SELECT id, canonical_name, scope FROM entities
   WHERE entity_type='player' AND id BETWEEN 901 AND 1500 ORDER BY id;
   ```
   then apply the same fame-decay judgment call each prior batch made
   (the "obviously famous" quality fades well before 1500 -- sample a
   few dozen ids first to find a sensible real cutoff for this batch,
   the same way earlier batches did before settling on their own
   ranges).
4. After each new batch is applied to production, **repeat the
   `db/seed.sql` regeneration** so it never drifts from production again
   (same export command as this doc's own "Where things stand" section).

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

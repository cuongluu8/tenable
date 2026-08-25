# Player Data Loading — Resume Instructions

**Status as of this commit: 27 of 70 batches loaded into production. 43 remain (this directory).**

## Background

We're expanding the trivia game's player reference data to cover players
since 1992. A cleaned, deduped dataset of 17,577 real players (sourced from
FIFA 21 game data, with EA's fabricated/placeholder players filtered out via
statistical detection, and normalized/aliased to match the app's matching
logic) was split into 70 SQL batch files of ~250 players each, sorted by
FIFA overall rating descending (highest-profile players first). The first
150 players were loaded manually as an initial test batch; the rest were
split into `batch_000.sql` through `batch_069.sql`.

Batches 000–026 have already been executed against production. This
directory contains the remaining, **not yet executed** batches: `batch_027.sql`
through `batch_069.sql`.

## Current DB state (verified via COUNT query at pause time)

- `reference_entities` totals: **7,805 players**, 553 clubs, 110 countries.
- Cloudflare D1 database: `database_id = a87ef250-cc94-4765-a821-785acbcd71a4`,
  name "tenable-content".

## Resume procedure (new session)

1. Read `db/pending_player_batches/batch_027.sql` (the next unexecuted batch —
   check this directory's remaining lowest-numbered file, since completed
   ones should be deleted as you go, see step 4).
2. Execute its full contents as a **single** call to
   `mcp__Cloudflare_Developer_Platform__d1_database_query` with
   `database_id: a87ef250-cc94-4765-a821-785acbcd71a4`. Each file contains two
   statements back to back:
   - `INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES (...)`
   - `WITH v(name, cat, alias) AS (VALUES (...)) INSERT INTO reference_entity_aliases (entity_id, alias) SELECT re.id, v.alias FROM v JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';`
3. Confirm the result shows `changes: 250` for the entities insert and a
   changes count (~480–500) for the aliases insert.
4. Delete the batch file you just ran from this directory (or move it) and
   commit that removal, so the directory always reflects what's left to do.
   Repeat sequentially through `batch_069.sql`.
5. After the last batch, run
   `SELECT entity_type, COUNT(*) FROM reference_entities GROUP BY entity_type;`
   and report final totals to the user. Once all batches are gone, delete
   this now-empty directory in a final commit.

## Why this is batch-by-batch

No bulk-upload API is available — only the interactive D1 query MCP tool.
250-player batches were empirically chosen as the largest size that reliably
avoids truncation when read back via the Read tool (~20-25K tokens/file).
Each batch cycle (read + execute) costs roughly 40-55K tokens, so budget
~1.7-2.3M tokens total to finish the remaining 43 batches, across as many
sessions as needed using this checkpoint.

## Authorization

The user has explicitly confirmed (multiple times, via AskUserQuestion in the
original session) that they want the full 70-batch load completed. This is
authorized, ongoing work — resume it mechanically without re-asking.

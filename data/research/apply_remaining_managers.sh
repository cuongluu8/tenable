#!/usr/bin/env bash
# Applies the still-unapplied managers backfill (managers_spells_remaining.sql,
# managers_stats_remaining.sql) to local D1 and then production D1, then
# regenerates db/seed.sql so it stays in sync.
#
# Zero LLM involvement needed for this — it's a mechanical wrangler script.
# Run from the repo root with a `wrangler login`-authenticated shell:
#
#   bash data/research/apply_remaining_managers.sh
#
# Safe to re-run individual steps, but DO NOT re-run the two `d1 execute
# --file=` steps below more than once each — there's no uniqueness
# constraint on `management_spells`/`entity_stats`, so a second run would
# duplicate every row. If you're unsure whether a step already ran, check
# first (see the verification queries in each remaining.sql file's header
# and in docs/stats-enrichment.md) rather than re-running it.

set -euo pipefail
cd "$(dirname "$0")/../.."   # repo root

DB=tenable-content
SPELLS=data/research/managers_spells_remaining.sql
STATS=data/research/managers_stats_remaining.sql

echo "== Applying to LOCAL D1 =="
npx wrangler d1 execute "$DB" --local --file="$SPELLS"
npx wrangler d1 execute "$DB" --local --file="$STATS"

echo "== Applying to PRODUCTION D1 =="
npx wrangler d1 execute "$DB" --remote --file="$SPELLS"
npx wrangler d1 execute "$DB" --remote --file="$STATS"

echo "== Verifying production =="
npx wrangler d1 execute "$DB" --remote --command="SELECT COUNT(DISTINCT manager_id) FROM management_spells;"
npx wrangler d1 execute "$DB" --remote --command="SELECT COUNT(*) FROM entity_stats WHERE stat_key IN ('manager-status','career-titles-count');"
echo "Expect 115 distinct manager_id, and a count matching the total rows across"
echo "data/research/managers_stats.sql + all earlier-applied stats files."

echo "== Regenerating db/seed.sql =="
npx wrangler d1 export "$DB" --remote --output=db/seed.sql

echo "== Done. Now run the standard local checks and commit: =="
echo "  npm run lint && npm run build && npm run verify:matching && npm run verify:category-defs && npm run playtest"
echo "  git add db/seed.sql && git commit -m 'Apply remaining managers backfill; regenerate seed.sql'"

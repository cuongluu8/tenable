#!/usr/bin/env bash
# Step 2 of 2 (see upload_media.sh's header): applies a `media_updates_
# <timestamp>.sql` file -- `UPDATE entities SET image_key = ... WHERE id =
# ...` statements, one per successfully-uploaded row -- to D1, local first
# then production.
#
# Deliberately separate from upload_media.sh so the R2 upload (easy to
# verify, easy to re-run, nothing production-visible) and the D1 write
# (the one genuinely hard-to-reverse step here) are two things you assert
# individually, not one thing that just happens at the end of a long
# unattended run.
#
#   bash data/research/apply_media_updates.sh data/research/media_updates_<timestamp>.sql
#
# Safe to re-run: every statement is `UPDATE ... WHERE id = <entity_id>`,
# idempotent regardless of how many times or in what order you apply it.

set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root

SQL_FILE="${1:?Usage: bash data/research/apply_media_updates.sh path/to/media_updates_<timestamp>.sql}"
DB=tenable-content

if [ ! -s "$SQL_FILE" ]; then
	echo "Nothing to apply -- $SQL_FILE is empty or missing."
	exit 0
fi

n=$(grep -c '^UPDATE ' "$SQL_FILE")
echo "== Applying $n image_key update(s) from $SQL_FILE =="
echo ""
echo "-- local --"
npx wrangler d1 execute "$DB" --local --file="$SQL_FILE"
echo ""
echo "-- production --"
npx wrangler d1 execute "$DB" --remote --file="$SQL_FILE"
echo ""
echo "Done. Now regenerate db/seed.sql (see docs/stats-enrichment.md's export"
echo "command -- entities is already in that --table list, no changes needed"
echo "there) and run the standard checks before committing."

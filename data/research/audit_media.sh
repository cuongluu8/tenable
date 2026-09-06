#!/usr/bin/env bash
# One-off audit: checks every entity with an image_key set for whether the
# R2 object at that key is actually image data, or a Wikimedia HTML error/
# redirect page that silently got uploaded because the original
# upload_media.sh only checked "did we get a non-empty file", not "is this
# actually an image" (fixed now, but doesn't retroactively fix what's
# already in the bucket from before that fix -- see Aston Villa/Inter Miami,
# found by hand 2026-09-06).
#
# Zero LLM tokens -- mechanical wrangler r2 get + a byte-sniff per object.
#
# Usage: bash data/research/audit_media.sh
#
# Prints one line per entity: OK or BAD (with a reason), and a final
# summary. Writes any BAD entity_ids to data/research/media_needs_reupload.csv
# in the same entity_id,entity_type,image_url format upload_media.sh expects
# as a manifest -- IF the row can still be found in a manifest already on
# disk (club_badges_manifest.csv); otherwise just flags the id/key for you
# to re-source by hand.

set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root

DB=tenable-content
BUCKET=tenable-media
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT
BAD_CSV="data/research/media_needs_reupload.csv"
: > "$BAD_CSV"

rows_json=$(npx wrangler d1 execute "$DB" --remote --json --command \
	"SELECT id, entity_type, image_key FROM entities WHERE image_key IS NOT NULL ORDER BY id;")

# Extract id/entity_type/image_key triples without a JSON tool dependency --
# the d1 execute --json output is regular enough for a line-oriented parse.
ids=($(echo "$rows_json" | grep -o '"id": *[0-9]*' | grep -o '[0-9]*'))
types=($(echo "$rows_json" | grep -o '"entity_type": *"[a-z]*"' | grep -o '"[a-z]*"$' | tr -d '"'))
keys=($(echo "$rows_json" | grep -o '"image_key": *"[^"]*"' | sed -E 's/.*"([^"]+)"$/\1/'))

total=${#ids[@]}
ok=0
bad=0

echo "Auditing $total objects..."

for i in "${!ids[@]}"; do
	id="${ids[$i]}"
	type="${types[$i]}"
	key="${keys[$i]}"
	tmpfile="$TMPDIR/$id"

	if ! npx wrangler r2 object get "$BUCKET/$key" --remote --file="$tmpfile" >/dev/null 2>&1; then
		echo "BAD   entity $id ($key): object missing from R2 entirely"
		echo "$id,$type,$key" >>"$BAD_CSV"
		bad=$((bad + 1))
		continue
	fi

	if [ ! -s "$tmpfile" ]; then
		echo "BAD   entity $id ($key): empty object"
		echo "$id,$type,$key" >>"$BAD_CSV"
		bad=$((bad + 1))
		continue
	fi

	if head -c 512 "$tmpfile" | grep -qi '<!DOCTYPE html\|<html'; then
		echo "BAD   entity $id ($key): object is an HTML page, not an image"
		echo "$id,$type,$key" >>"$BAD_CSV"
		bad=$((bad + 1))
		continue
	fi

	ok=$((ok + 1))
done

echo ""
echo "== Done: $ok OK, $bad bad (out of $total) =="
if [ "$bad" -gt 0 ]; then
	echo "Bad entity_id/entity_type/image_key rows written to $BAD_CSV."
	echo "Cross-reference each id against club_badges_manifest.csv (or"
	echo "country_flags_manifest.csv once that exists) to find/replace its"
	echo "source URL, then re-run upload_media.sh against just those rows."
fi

#!/usr/bin/env bash
# Uploads club badges / country flags to the tenable-media R2 bucket and
# points each entity's `image_key` at the uploaded object — driven entirely
# by a CSV manifest, so this script does zero research/judgment itself.
#
# Zero LLM tokens needed to run this — it's a mechanical curl + wrangler
# loop. Run from the repo root with a `wrangler login`-authenticated shell:
#
#   bash data/research/upload_media.sh path/to/manifest.csv [sleep_seconds]
#
# sleep_seconds (default 1) is a delay between rows -- be polite to
# Wikimedia's servers. A too-fast run has genuinely tripped their rate
# limiter before (a real HTTP-200 response containing an HTML error page,
# not a curl failure -- see the content-validation step below).
#
# Manifest CSV format (no header row), one entity per line:
#
#   entity_id,entity_type,image_url
#
#   e.g.
#   217,club,https://upload.wikimedia.org/wikipedia/en/1/13/Real_Madrid_CF.svg
#   76,country,https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg
#
# entity_type must be "club" or "country" -- it only controls which R2
# key prefix (clubs/ or countries/) the object goes under, it doesn't get
# validated against the entities table here. image_url must be a direct
# link to the image file (not a Wikipedia/Commons *page* -- the "File:"
# page won't work, you need the actual upload.wikimedia.org file URL).
#
# What this does, per row:
#   1. Downloads image_url to a temp file.
#   2. Picks a file extension from the response Content-Type (falls back
#      to the URL's own extension if the server doesn't send one).
#   3. Uploads it to R2 as <entity_type>s/<entity_id>.<ext> via
#      `wrangler r2 object put` (local first, then production -- same
#      as the D1 pattern elsewhere in data/research/).
#   4. Appends `UPDATE entities SET image_key = '...' WHERE id = ...;`
#      to an output SQL file, applied once at the end via
#      `wrangler d1 execute --file=`.
#
# Safe to re-run: R2 `object put` overwrites by key (no duplicate-row risk
# like the SQL INSERT scripts elsewhere in this directory), and the SQL
# UPDATEs are idempotent by entity id. A failed/skipped row just doesn't
# get a key -- re-run the same manifest (or a manifest containing only the
# rows that failed) to retry.

set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root

MANIFEST="${1:?Usage: bash data/research/upload_media.sh path/to/manifest.csv [sleep_seconds]}"
SLEEP_S="${2:-1}"   # be polite to Wikimedia -- a fast back-to-back run over
	# many rows is exactly what tripped their rate limiter once already
	# (see the Aston Villa/Inter Miami incident, 2026-09-06); a real 429
	# response comes back as an HTTP-200 HTML error page, not a curl
	# failure, so nothing before this fix even noticed.
DB=tenable-content
BUCKET=tenable-media
TMPDIR=$(mktemp -d)
UPDATES_SQL="data/research/media_updates_$(date +%Y%m%d_%H%M%S).sql"
FAILED_LOG="data/research/media_failed_$(date +%Y%m%d_%H%M%S).csv"
trap 'rm -rf "$TMPDIR"' EXIT

: > "$UPDATES_SQL"
: > "$FAILED_LOG"

ok=0
fail=0

ext_from_content_type() {
	case "$1" in
	*svg*) echo "svg" ;;
	*png*) echo "png" ;;
	*jpeg* | *jpg*) echo "jpg" ;;
	*webp*) echo "webp" ;;
	*gif*) echo "gif" ;;
	*) echo "" ;;
	esac
}

ext_from_url() {
	local url="$1"
	local base="${url%%\?*}"        # strip query string
	local filename="${base##*/}"    # last path segment only -- a bare
		# ${base##*.} would wrongly match a dot in the domain (e.g.
		# example.com/noext) when the path itself has no extension
	local ext="${filename##*.}"
	if [ "$ext" = "$filename" ]; then
		echo ""
	else
		echo "$ext" | tr '[:upper:]' '[:lower:]'
	fi
}

mime_from_ext() {
	# The uploaded temp file has no extension (named just "$entity_id"), so
	# `wrangler r2 object put` has nothing to infer a Content-Type from on
	# its own -- confirmed this was landing as either no Content-Type at all
	# or a wrong sniffed one (e.g. "application/xml" for an SVG), which is
	# why badges silently failed to render as <img> sources in the browser
	# despite the object itself downloading fine. Always pass this
	# explicitly instead of relying on inference.
	case "$1" in
	svg) echo "image/svg+xml" ;;
	png) echo "image/png" ;;
	jpg | jpeg) echo "image/jpeg" ;;
	webp) echo "image/webp" ;;
	gif) echo "image/gif" ;;
	*) echo "application/octet-stream" ;;
	esac
}

while IFS=',' read -r entity_id entity_type image_url; do
	# skip blank lines
	[ -z "${entity_id// /}" ] && continue

	sleep "$SLEEP_S"

	tmpfile="$TMPDIR/$entity_id"
	content_type=$(curl -sL -o "$tmpfile" -w '%{content_type}' "$image_url")
	if [ ! -s "$tmpfile" ]; then
		echo "FAIL  entity $entity_id: download empty/failed ($image_url)"
		echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
		fail=$((fail + 1))
		continue
	fi
	# A non-empty file isn't necessarily a real image -- Wikimedia serves
	# genuine HTML (a rate-limit page, a broken-redirect page) with HTTP 200
	# on both a 429 and a stale/renamed Special:FilePath URL, and either one
	# would otherwise sail through as "success" and get uploaded as if it
	# were a badge. Reject anything the server itself didn't call an image,
	# and independently confirm the bytes don't start with an HTML doctype
	# (an SVG's content-type is sometimes reported as generic XML/text, so
	# content-type alone isn't a reliable enough gate on its own).
	case "$content_type" in
	*image*) : ;;
	*)
		if head -c 512 "$tmpfile" | grep -qi '<!DOCTYPE html\|<html'; then
			echo "FAIL  entity $entity_id: server returned an HTML page, not an image (content-type '$content_type', $image_url)"
			echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
			fail=$((fail + 1))
			continue
		fi
		;;
	esac

	ext=$(ext_from_content_type "$content_type")
	if [ -z "$ext" ]; then
		ext=$(ext_from_url "$image_url")
	fi
	if [ -z "$ext" ]; then
		echo "FAIL  entity $entity_id: couldn't determine file extension ($image_url, content-type '$content_type')"
		echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
		fail=$((fail + 1))
		continue
	fi

	key="${entity_type}s/${entity_id}.${ext}"
	mime=$(mime_from_ext "$ext")

	put_output=$(npx wrangler r2 object put "$BUCKET/$key" --file="$tmpfile" --content-type="$mime" --remote 2>&1)
	if [ $? -ne 0 ]; then
		echo "FAIL  entity $entity_id: r2 upload failed (key $key)"
		echo "  $put_output" | tail -3
		echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
		fail=$((fail + 1))
		continue
	fi

	echo "UPDATE entities SET image_key = '$key' WHERE id = $entity_id;" >>"$UPDATES_SQL"
	echo "OK    entity $entity_id -> $key"
	ok=$((ok + 1))
done <"$MANIFEST"

echo ""
echo "== Done: $ok uploaded, $fail failed =="
if [ "$fail" -gt 0 ]; then
	echo "Failed rows written to $FAILED_LOG -- fix/re-source those URLs and re-run"
	echo "this script against just that file."
fi

if [ "$ok" -gt 0 ]; then
	echo ""
	echo "== Applying $ok image_key updates to local then production D1 =="
	npx wrangler d1 execute "$DB" --local --file="$UPDATES_SQL"
	npx wrangler d1 execute "$DB" --remote --file="$UPDATES_SQL"
	echo ""
	echo "Updates SQL kept at $UPDATES_SQL for the record. Now regenerate"
	echo "db/seed.sql (see docs/stats-enrichment.md's export command --"
	echo "entities is already in that --table list, no changes needed there)"
	echo "and run the standard checks before committing."
fi

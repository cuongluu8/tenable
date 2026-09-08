#!/usr/bin/env bash
# Uploads club badges / country flags to the tenable-media R2 bucket --
# driven entirely by a CSV manifest, so this script does zero
# research/judgment itself. This is step 1 of 2: it only touches R2, never
# D1. Once it's done and you've spot-checked the result, apply the DB side
# with the companion script:
#
#   bash data/research/apply_media_updates.sh data/research/media_updates_<timestamp>.sql
#
# Split into two steps on purpose (2026-09-07) so each has something
# concrete to assert before moving on -- R2 objects existing and looking
# right, then (separately, deliberately) the production DB write, which is
# the one step here that's actually hard to reverse.
#
# Zero LLM tokens needed to run this — it's a mechanical curl + wrangler
# loop. Run from the repo root with a `wrangler login`-authenticated shell:
#
#   bash data/research/upload_media.sh path/to/manifest.csv [sleep_seconds]
#
# sleep_seconds (default 2) is a delay between rows -- be polite to
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
# image_url can also be a local `file://` path (e.g. from
# data/research/cache_media_locally.sh's output manifest) -- curl reads
# both the same way, so this script needs no changes either way. See
# docs/media-assets.md for the recommended cache-locally-first workflow.
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
#      `wrangler r2 object put --remote`.
#   4. Appends `UPDATE entities SET image_key = '...' WHERE id = ...;` to
#      an output SQL file -- NOT applied here, see apply_media_updates.sh.
#
# Safe to re-run: R2 `object put` overwrites by key (no duplicate-row risk
# like the SQL INSERT scripts elsewhere in this directory). A failed/
# skipped row just doesn't get a key -- re-run the same manifest (or a
# manifest containing only the rows that failed) to retry.
#
# Rate-limit handling (2026-09-07): a batch this size reliably trips
# Wikimedia's rate limiter partway through, even with a polite per-row
# delay -- a real run of 430 rows needed three manual passes (48, then 75,
# then a partial third) before it cleared. Instead of relying on a human to
# notice and re-run, each row now retries its own download with growing
# backoff (RETRY_BACKOFFS below) whenever it sees the rate-limit's actual
# signature -- an HTTP-200 response whose body is an HTML page, not image
# bytes -- before giving up and logging it to FAILED_LOG. One invocation of
# this script is now expected to self-heal through a full run; you should
# only need to re-run the FAILED_LOG manifest by hand if Wikimedia is
# throttling hard enough that even the longest backoff isn't enough.
#
# If you interrupt the script partway through (Ctrl-C, closed terminal),
# every row already uploaded to R2 by that point has its UPDATE already
# appended to $UPDATES_SQL (the filename is echoed when the script
# starts), so nothing is lost -- run apply_media_updates.sh against that
# file whenever you're ready, then re-run this script against $FAILED_LOG
# (or the tail of your original manifest you didn't get to) to pick up
# where you left off.

set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root

MANIFEST="${1:?Usage: bash data/research/upload_media.sh path/to/manifest.csv [sleep_seconds]}"
SLEEP_S="${2:-2}"   # be polite to Wikimedia -- a fast back-to-back run over
	# many rows is exactly what tripped their rate limiter once already
	# (see the Aston Villa/Inter Miami incident, 2026-09-06); a real 429
	# response comes back as an HTTP-200 HTML error page, not a curl
	# failure, so nothing before this fix even noticed.
RETRY_BACKOFFS=(10 30 60 120 240)   # seconds to wait before each retry of a
	# single row's download, on top of SLEEP_S -- five attempts spanning
	# ~7 minutes total per row before it's given up on, since the rate
	# limit has been observed to clear anywhere from under a minute to
	# several minutes in.
USER_AGENT="tenable-club-badges-upload/1.0 (contact: cuong.luu@manta-software.com)"
	# every earlier manual diagnostic curl in this project set a
	# descriptive UA and rarely failed; this script's own curl call had
	# none (bare curl/8.x default) until 2026-09-07, which Wikimedia's
	# infrastructure is known to treat less favourably than a real one --
	# plausibly the actual cause of some "download empty/failed" rows that
	# looked like plain rate-limiting but weren't reproducible with a
	# proper UA.
BUCKET=tenable-media
TMPDIR=$(mktemp -d)
UPDATES_SQL="data/research/media_updates_$(date +%Y%m%d_%H%M%S).sql"
FAILED_LOG="data/research/media_failed_$(date +%Y%m%d_%H%M%S).csv"
trap 'rm -rf "$TMPDIR"' EXIT

: > "$UPDATES_SQL"
: > "$FAILED_LOG"

echo "Updates SQL:  $UPDATES_SQL"
echo "Failed log:   $FAILED_LOG"
echo ""

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
	curl_err="$TMPDIR/$entity_id.err"
	download_ok=0
	attempt=0
	while true; do
		# -S (with -s) surfaces curl's own error text instead of swallowing
		# it -- plain -s was hiding *why* a download failed (timeout? DNS?
		# connection reset?), leaving nothing but a generic "empty/failed"
		# to guess from. --connect-timeout/--max-time stop a hung request
		# from blocking the whole run instead of hitting our own retry
		# logic. --ipv4 sidesteps any IPv6 path flakiness on networks where
		# v4 and v6 routes to the same host behave differently.
		content_type=$(curl -sS -L --ipv4 --connect-timeout 15 --max-time 60 \
			-A "$USER_AGENT" -o "$tmpfile" -w '%{content_type}' \
			"$image_url" 2>"$curl_err")
		curl_exit=$?
		is_html=0
		if [ -s "$tmpfile" ]; then
			# A non-empty file isn't necessarily a real image -- Wikimedia
			# serves genuine HTML (a rate-limit page, a broken-redirect
			# page) with HTTP 200 on both a 429 and a stale/renamed
			# Special:FilePath URL, and either one would otherwise sail
			# through as "success" and get uploaded as if it were a badge.
			# Reject anything the server itself didn't call an image, and
			# independently confirm the bytes don't start with an HTML
			# doctype (an SVG's content-type is sometimes reported as
			# generic XML/text, so content-type alone isn't a reliable
			# enough gate on its own).
			case "$content_type" in
			*image*) : ;;
			*)
				if head -c 512 "$tmpfile" | grep -qi '<!DOCTYPE html\|<html'; then
					is_html=1
				fi
				;;
			esac
			if [ "$is_html" -eq 0 ]; then
				download_ok=1
				break
			fi
		fi
		# Empty download or an HTML rate-limit page -- both are the kind of
		# transient failure a retry-with-backoff can ride out. Give up on
		# this row only once every backoff in RETRY_BACKOFFS is exhausted.
		if [ "$attempt" -ge "${#RETRY_BACKOFFS[@]}" ]; then
			break
		fi
		backoff="${RETRY_BACKOFFS[$attempt]}"
		if [ -s "$tmpfile" ]; then
			reason="server returned an HTML page, not an image (content-type '$content_type')"
		else
			reason="download empty/failed (curl exit $curl_exit: $(cat "$curl_err" 2>/dev/null))"
		fi
		echo "RETRY entity $entity_id: $reason -- waiting ${backoff}s (attempt $((attempt + 1))/${#RETRY_BACKOFFS[@]})"
		sleep "$backoff"
		attempt=$((attempt + 1))
	done

	if [ "$download_ok" -ne 1 ]; then
		if [ -s "$tmpfile" ]; then
			echo "FAIL  entity $entity_id: server returned an HTML page, not an image (content-type '$content_type', $image_url) after $attempt retries"
		else
			echo "FAIL  entity $entity_id: download empty/failed (curl exit $curl_exit: $(cat "$curl_err" 2>/dev/null)) ($image_url) after $attempt retries"
		fi
		echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
		fail=$((fail + 1))
		continue
	fi

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
echo "== Done: $ok uploaded to R2, $fail failed =="
if [ "$fail" -gt 0 ]; then
	echo "Failed rows written to $FAILED_LOG -- fix/re-source those URLs and re-run"
	echo "this script against just that file."
fi

if [ "$ok" -gt 0 ]; then
	echo ""
	echo "R2 is done -- nothing has touched D1 yet. Verify the objects are what you"
	echo "expect (spot-check a few keys, e.g. \`npx wrangler r2 object get $BUCKET/clubs/<id>.<ext>\`"
	echo "or just load a badge URL in a browser), THEN apply the DB side:"
	echo "    bash data/research/apply_media_updates.sh $UPDATES_SQL"
fi

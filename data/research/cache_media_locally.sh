#!/usr/bin/env bash
# Downloads club badges / country flags to a LOCAL cache directory instead
# of straight to R2 -- the first of a two-phase workflow (see
# docs/media-assets.md for the full writeup and why this replaced the old
# single-phase approach):
#
#   1. cache_media_locally.sh   (this script) fetches every candidate once
#      and writes them to disk, plus a manifest pointing at the local files.
#   2. A review page (or you, by eye) looks at the LOCAL files -- no
#      network calls at all during review -- and approves/rejects.
#   3. upload_media.sh runs against the local-file manifest, which uploads
#      to R2 straight off disk (no re-download -- curl reads `file://`
#      URLs natively, so upload_media.sh needs no changes for this).
#
# Run from the repo root with a `wrangler login`-authenticated shell isn't
# required for this step -- it's pure download, no Cloudflare access:
#
#   bash data/research/cache_media_locally.sh path/to/manifest.csv [cache_dir] [sleep_seconds]
#
# Input manifest format is the same as upload_media.sh's (no header row):
#   entity_id,entity_type,image_url
#
# Output:
#   <cache_dir>/<entity_type>s/<entity_id>.<ext>   -- the downloaded files
#   <cache_dir>/manifest_local.csv                  -- entity_id,entity_type,file://<abs path>
#                                                       feed this straight into upload_media.sh
#   data/research/media_cache_failed_<timestamp>.csv -- anything that never
#                                                        resolved; re-run just this file later
#
# Same rate-limit handling as upload_media.sh: each row retries its own
# download with growing backoff whenever Wikimedia serves its rate-limit
# signature (an HTTP-200 response whose body is an HTML page, not image
# bytes), and a descriptive User-Agent + explicit timeouts + --ipv4 avoid
# the other failure modes discovered building this (see docs/media-assets.md
# and upload_media.sh's own header for the incident history).
#
# Safe to re-run: re-downloading overwrites the same local path, and a
# manifest containing only the still-failed rows re-downloads just those.

set -uo pipefail
cd "$(dirname "$0")/../.."   # repo root

MANIFEST="${1:?Usage: bash data/research/cache_media_locally.sh path/to/manifest.csv [cache_dir] [sleep_seconds]}"
CACHE_DIR="${2:-data/research/media_cache}"
SLEEP_S="${3:-2}"
RETRY_BACKOFFS=(10 30 60 120 240)
USER_AGENT="tenable-club-badges-cache/1.0 (contact: cuong.luu@manta-software.com)"

FAILED_LOG="data/research/media_cache_failed_$(date +%Y%m%d_%H%M%S).csv"
LOCAL_MANIFEST="$CACHE_DIR/manifest_local.csv"
mkdir -p "$CACHE_DIR"
: > "$FAILED_LOG"
: > "$LOCAL_MANIFEST"

echo "Cache dir:       $CACHE_DIR"
echo "Local manifest:  $LOCAL_MANIFEST"
echo "Failed log:      $FAILED_LOG"
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
	local base="${url%%\?*}"
	local filename="${base##*/}"
	local ext="${filename##*.}"
	if [ "$ext" = "$filename" ]; then
		echo ""
	else
		echo "$ext" | tr '[:upper:]' '[:lower:]'
	fi
}

while IFS=',' read -r entity_id entity_type image_url; do
	[ -z "${entity_id// /}" ] && continue

	sleep "$SLEEP_S"

	tmpfile=$(mktemp)
	curl_err=$(mktemp)
	download_ok=0
	attempt=0
	while true; do
		content_type=$(curl -sS -L --ipv4 --connect-timeout 15 --max-time 60 \
			-A "$USER_AGENT" -o "$tmpfile" -w '%{content_type}' \
			"$image_url" 2>"$curl_err")
		curl_exit=$?
		is_html=0
		if [ -s "$tmpfile" ]; then
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
		rm -f "$tmpfile" "$curl_err"
		continue
	fi
	rm -f "$curl_err"

	ext=$(ext_from_content_type "$content_type")
	if [ -z "$ext" ]; then
		ext=$(ext_from_url "$image_url")
	fi
	if [ -z "$ext" ]; then
		echo "FAIL  entity $entity_id: couldn't determine file extension ($image_url, content-type '$content_type')"
		echo "$entity_id,$entity_type,$image_url" >>"$FAILED_LOG"
		fail=$((fail + 1))
		rm -f "$tmpfile"
		continue
	fi

	destdir="$CACHE_DIR/${entity_type}s"
	mkdir -p "$destdir"
	destfile="$destdir/$entity_id.$ext"
	mv "$tmpfile" "$destfile"

	echo "$entity_id,$entity_type,file://$(cd "$destdir" && pwd)/$entity_id.$ext" >>"$LOCAL_MANIFEST"
	echo "OK    entity $entity_id -> $destfile"
	ok=$((ok + 1))
done <"$MANIFEST"

echo ""
echo "== Done: $ok cached locally, $fail failed =="
if [ "$fail" -gt 0 ]; then
	echo "Failed rows written to $FAILED_LOG -- re-run this script against just that file."
fi
if [ "$ok" -gt 0 ]; then
	echo ""
	echo "Local manifest ready at $LOCAL_MANIFEST -- point your review process at"
	echo "$CACHE_DIR (e.g. \`python3 -m http.server\` from there) instead of hotlinking"
	echo "Wikipedia, then once approved:"
	echo "    bash data/research/upload_media.sh $LOCAL_MANIFEST"
fi

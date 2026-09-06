#!/usr/bin/env python3
"""
find_club_badges.py — mechanical extraction of each club's crest filename
from English Wikipedia's own {{Infobox football club}} template, for the
tenable club-badges project.

Same method and same reasons as scripts/research_player_stats.py (read
this docstring alongside that one): fetch the actual Wikipedia article
wikitext via the MediaWiki API (not a search engine's snippet), parse the
real infobox template properly (mwparserfromhell), and never guess --
anything ambiguous or missing goes to a needs-review file instead of a
best-effort manifest row.

Specific to clubs (vs. players):
  - Template is {{Infobox football club}}, and the field is `image` (a
    bare filename, e.g. "Real Madrid CF.svg" -- not a wikilink).
  - Club names are far more ambiguous than player names ("Nacional",
    "Deportivo", "Unión" exist in a dozen countries) -- every candidate
    article is title-matched, and if the search fallback's top hit's own
    infobox doesn't look like a football club (no image field at all),
    that's treated as "couldn't confidently resolve", not a guess.
  - Country (entities.scope) is used to bias the search query
    ("<name> football club <country>") since bare club names collide far
    more often than bare player names do.

SETUP
-----
    pip install requests mwparserfromhell

USAGE
-----
    python3 scripts/find_club_badges.py \\
        --input data/research/club_badges_missing.csv \\
        --out-manifest data/research/club_badges_missing_manifest.csv \\
        --out-review data/research/club_badges_missing_review.md

Input CSV format (pipe-separated, no header): entity_id|canonical_name|country
Output manifest format matches upload_media.sh's expected input exactly:
    entity_id,club,https://en.wikipedia.org/wiki/Special:FilePath/<filename>

This script only reads Wikipedia. It never writes to any database or R2
bucket, and never touches production in any way.
"""

import argparse
import csv
import re
import sys
import time
import urllib.parse

import requests

try:
    import mwparserfromhell
except ImportError:
    print(
        "ERROR: mwparserfromhell is not installed. Run:\n"
        "    pip install requests mwparserfromhell\n",
        file=sys.stderr,
    )
    sys.exit(1)

WIKI_API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = (
    "tenable-club-badge-research/1.0 "
    "(https://github.com/cuongluu8/tenable; one-off content-research script; "
    "contact: repo owner via GitHub)"
)

DISAMBIG_TEMPLATE_RE = re.compile(
    r"\{\{\s*(disambig(uation)?|hndis|given name|surname|hospital disambiguation)\b",
    re.IGNORECASE,
)


def is_disambiguation_page(wikitext: str) -> bool:
    return bool(DISAMBIG_TEMPLATE_RE.search(wikitext))


def get_content(session: requests.Session, title: str) -> tuple[str | None, str | None]:
    resp = session.get(
        WIKI_API,
        params={
            "action": "query",
            "prop": "revisions",
            "rvslots": "main",
            "rvprop": "content",
            "format": "json",
            "formatversion": "2",
            "redirects": "1",
            "titles": title,
        },
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    pages = data.get("query", {}).get("pages", [])
    if not pages or pages[0].get("missing"):
        return None, None
    page = pages[0]
    revisions = page.get("revisions")
    if not revisions:
        return None, None
    return page.get("title", title), revisions[0]["slots"]["main"]["content"]


def search_title(session: requests.Session, query: str) -> str | None:
    resp = session.get(
        WIKI_API,
        params={
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "formatversion": "2",
            "srlimit": "1",
        },
        timeout=20,
    )
    resp.raise_for_status()
    results = resp.json().get("query", {}).get("search", [])
    return results[0]["title"] if results else None


def candidate_pages(session: requests.Session, name: str, country: str):
    """Yields (title, wikitext, trusted) candidates in priority order. A
    candidate existing and not being a disambig page is NOT enough to stop
    here -- a bare club name (e.g. "Barnsley", "Lincoln City") very often
    resolves cleanly to an unrelated article (the town), which is a
    different failure mode than "missing" or "disambiguation". The caller
    checks each candidate for an actual club infobox and only moves to the
    next if it doesn't have one.

    `trusted` distinguishes two very different reliability tiers, found
    the hard way, 2026-09-06: the direct title and the country-qualified
    search ("<name> football club <country>") almost always land on the
    right club even for a generic name, since the country term does real
    work narrowing the search. The country-FREE queries ("<name> F.C.",
    "<name> football club") were added later specifically to recover
    genuine town-name collisions (Lincoln City, Ancona, ...) but, without
    a country term, just as readily hand back a completely different,
    more famous club that happens to share part of the name in ANOTHER
    country (this exact bug matched Brazil's "CSA" to a Romanian club,
    Paraguay's "Nacional"/"San Lorenzo" clubs to Argentina's/a different
    Paraguayan club's page, and Spain's "Merida" to a Mexican one) -- and
    a same-country wrong-club mixup like that often still mentions the
    right country somewhere in its own text, so a naive "does the country
    name appear anywhere" check does NOT reliably catch it either. A
    `trusted=False` candidate is therefore never auto-accepted by the
    caller -- only ever offered to a human as a review candidate.
    """
    seen_titles: set[str] = set()

    def try_title(title: str, trusted: bool):
        if title in seen_titles:
            return
        got_title, content = get_content(session, title)
        if got_title:
            seen_titles.add(got_title)
        if content is not None and not is_disambiguation_page(content):
            yield got_title, content, trusted

    yield from try_title(name.replace(" ", "_"), trusted=True)

    country_query = f"{name} football club {country}".strip()
    hit = search_title(session, country_query)
    if hit:
        yield from try_title(hit, trusted=True)

    for query in (f"{name} F.C.", f"{name} football club"):
        hit = search_title(session, query)
        if hit:
            yield from try_title(hit, trusted=False)


def find_club_infobox(wikitext: str):
    # Word-order-independent: most articles use "Infobox football club",
    # but some (Anzoátegui F.C., 2026-09-06) use "Football club infobox"
    # instead -- same template, just aliased/redirected under a differently
    # ordered name. Checking all three words appear, in any order, catches
    # both without needing to enumerate every alias by hand.
    code = mwparserfromhell.parse(wikitext)

    def is_club_infobox(t) -> bool:
        n = str(t.name).lower()
        return ("infobox" in n and "football" in n and "club" in n) or "infobox football biography" in n

    templates = code.filter_templates(matches=is_club_infobox)
    return templates[0] if templates else None


def param_text(infobox, name: str) -> str | None:
    """Returns the raw filename for an infobox image/logo field. Most clubs
    write it as a bare filename ("Foo.svg"), but some (all 10 Peruvian
    clubs hit this, 2026-09-06) wrap it as a full file-embed wikilink
    instead: [[File:Foo.png|180px]]. strip_code() on that would return
    "180px" (the size argument, treated as if it were display text) and
    silently discard the actual filename -- checking filter_wikilinks()
    first for a File:/Image: link and pulling its .title avoids that."""
    if not infobox.has(name):
        return None
    raw = str(infobox.get(name).value)
    parsed = mwparserfromhell.parse(raw)
    for link in parsed.filter_wikilinks():
        title = str(link.title).strip()
        if re.match(r"^(File|Image):", title, re.IGNORECASE):
            return re.sub(r"^(File|Image):", "", title, flags=re.IGNORECASE).strip()
    val = parsed.strip_code().strip()
    return val or None


def research_club(entity_id: str, name: str, country: str, sleep_s: float) -> dict:
    result = {"entity_id": entity_id, "name": name, "country": country, "status": "review", "reason": "", "filename": "", "wiki_title": ""}
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    reasons = []
    try:
        candidates = list(candidate_pages(session, name, country))
    except requests.RequestException as exc:
        result["reason"] = f"Network error: {exc}"
        time.sleep(sleep_s)
        return result
    time.sleep(sleep_s)

    if not candidates:
        result["reason"] = "No Wikipedia article found (direct title and search fallback both failed)."
        return result

    for title, wikitext, trusted in candidates:
        infobox = find_club_infobox(wikitext)
        if infobox is None:
            reasons.append(f'"{title}": no "Infobox football club" template (wrong article, e.g. a place name, not the club)')
            continue

        image = param_text(infobox, "image") or param_text(infobox, "logo")
        if not image:
            reasons.append(f'"{title}": has a football club infobox but no image/logo field set')
            continue

        # Strip wikilink/File: prefix junk some infoboxes wrap the filename
        # in, e.g. "[[File:Foo.svg|150px]]" -- keep just the bare filename.
        match = re.search(r"(?:File:)?([^|\[\]]+\.(?:svg|png|jpg|jpeg|gif))", image, re.IGNORECASE)
        if not match:
            reasons.append(f'"{title}": infobox image field ({image!r}) doesn\'t look like a plain image filename')
            continue

        if not trusted:
            # A real image with a real club infobox is still possibly the
            # WRONG club -- this candidate only came from a country-free
            # search query (see candidate_pages' docstring on the 2026-09-06
            # incident). A same-country wrong-club mixup often still
            # mentions the right country somewhere in its own text, so
            # merely checking for that (tried first) isn't reliable enough
            # either -- always defer to a human instead of guessing here.
            reasons.append(f'"{title}": has a real club infobox and image ({match.group(1).strip()}), but only via a country-free search -- verify by hand before trusting this match')
            continue

        result["wiki_title"] = title
        result["filename"] = match.group(1).strip()
        result["status"] = "found"
        return result

    result["reason"] = "; ".join(reasons)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-manifest", required=True)
    parser.add_argument("--out-review", required=True)
    parser.add_argument("--sleep", type=float, default=1.0)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    clubs = []
    with open(args.input, newline="", encoding="utf-8") as f:
        for row in csv.reader(f, delimiter="|"):
            if not row or not row[0].strip():
                continue
            clubs.append((row[0].strip(), row[1].strip(), row[2].strip() if len(row) > 2 else ""))
    if args.limit:
        clubs = clubs[: args.limit]

    results = []
    total = len(clubs)
    for i, (entity_id, name, country) in enumerate(clubs, start=1):
        print(f"[{i}/{total}] {name} ({country}) ...", file=sys.stderr)
        r = research_club(entity_id, name, country, args.sleep)
        results.append(r)
        print(f"    -> {r['status']}" + (f": {r['reason']}" if r["status"] != "found" else f": {r['filename']}"), file=sys.stderr)

    found = [r for r in results if r["status"] == "found"]
    review = [r for r in results if r["status"] != "found"]

    with open(args.out_manifest, "w", encoding="utf-8") as f:
        for r in found:
            url = "https://en.wikipedia.org/wiki/Special:FilePath/" + urllib.parse.quote(r["filename"])
            f.write(f"{r['entity_id']},club,{url}\n")

    with open(args.out_review, "w", encoding="utf-8") as f:
        f.write("# Clubs the script couldn't confidently resolve\n\n")
        f.write("Nothing here was guessed -- each needs a human to look at it directly.\n\n")
        for r in review:
            f.write(f"- **{r['name']}** (entity_id {r['entity_id']}, {r['country']}): {r['reason']}\n")

    print(
        f"\nDone: {total} clubs -- {len(found)} found, {len(review)} need manual review.\n"
        f"  Manifest: {args.out_manifest}\n"
        f"  Review:   {args.out_review}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()

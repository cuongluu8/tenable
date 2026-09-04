#!/usr/bin/env python3
"""
research_player_stats.py — mechanical extraction of a player's per-team
career stats (club stints AND international/national-team levels) from
English Wikipedia's own infobox data, for the tenable stats-enrichment
project.

WHY THIS EXISTS
----------------
An earlier attempt to get a player's *aggregate* career-goals/appearances via
an LLM doing WebSearch-and-sum produced confidently wrong totals (Wayne
Rooney off by ~35%, Gerd Müller by ~20%, Casemiro by ~20%) because search
snippets don't carry reliable scope metadata (league-only vs
all-competitions, stale vs current) and hand-summing across them silently
mixes incompatible numbers.

This script avoids that failure mode differently than a first pilot version
of it did: instead of extracting one aggregate "Total" number per player, it
extracts and stores the player's own per-team breakdown (one row per club
spell, one row per national-team level) — each row is a single literal
figure straight from the source, independently useful on its own (not just
as an input to a total), and a player's career total for competition_type=
'club' is a SUM query over these rows rather than a second, separately-wrong
number that has to be trusted on its own.

METHOD
------
  1. Fetch the player's actual Wikipedia article wikitext directly (MediaWiki
     API, not a search engine) — the same literal source a human researcher
     would read.
  2. Parse the {{Infobox football biography}} template properly (via
     mwparserfromhell, not regex-guessing at wikitext).
  3. Club stints: read the numbered `years{n}`/`clubs{n}`/`caps{n}`/
     `goals{n}` fields, one row per club spell. The infobox's own
     `totalcaps`/`totalgoals` "Total" field is NOT consulted at all — the
     per-club breakdown IS the stored fact (a player's career total is a
     SUM() over these rows), so a separately-maintained total that might
     disagree with it (as happened on Rivaldo's own Wikipedia page — its
     Total row disagreed with the sum of its own per-club rows) is simply
     never used as a gate. Per row, whatever is a clean number is used;
     whatever isn't (e.g. a "?" placeholder, as on George Weah's earliest
     amateur spell) is left NULL rather than blocking the row or the player
     — a known team/years with an unknown caps/goals is still real, useful
     information, and nothing downstream should have to guess to fill it in.
     Also scans for inline HTML comments (e.g. `<!-- LEAGUE ONLY -->`,
     invisible on the rendered page, only visible in raw wikitext) and
     records that as `scope_note` on every club row for that player if
     found — this exact check caught Alan Shearer's and Wayne Rooney's
     numbers being domestic-league-only, not all-competitions.
  4. International stints: same rule, reading the numbered
     `nationalyears{n}`/`nationalteam{n}`/`nationalcaps{n}`/
     `nationalgoals{n}` fields (a youth level, or the senior team, is
     already a complete, standalone fact — there's no aggregate here to
     begin with).
  5. Resolves each club/team name against the local entities pool (D1
     SQLite file) via an EXACT match (after normalizing case/diacritics/
     punctuation) against `entities.canonical_name` or `entity_aliases.alias`
     — never a fuzzy guess. No match -> team_id left NULL, team_name_raw
     kept, same "leave the FK NULL rather than guess" convention already
     used throughout this project's transfers/management_spells research.

This script makes NO judgment calls and NO assumptions: every fact it writes
is either an exact, literal figure straight from the source, or (for an
individual field only) explicitly NULL because the source itself doesn't
state it — never a guess, never a derived/estimated fill-in. Only a
genuinely fatal case (no article, no infobox at all) produces nothing and
goes to the needs-review file instead.

WHAT THIS SCRIPT DOES NOT DO
-----------------------------
It does NOT research `transfers` (fee/date history) — that requires reading
free-text prose (dispute detection, date disambiguation), which is a
judgment task, not a mechanical one.

SETUP
-----
    pip install requests mwparserfromhell

USAGE
-----
    python3 scripts/research_player_stats.py \\
        --input data/research/players_batch1_remaining.csv \\
        --out-sql data/research/script_stats.sql \\
        --out-review data/research/script_needs_review.md

    # Local D1 name resolution is auto-discovered from
    # .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite. Override
    # with --db <path>, or pass --no-db to skip resolution entirely (every
    # team_id will be NULL, team_name_raw still populated).

Input CSV format (pipe-separated, no header): entity_id|canonical_name|country

Re-run safety: this script only reads Wikipedia and the local D1 SQLite file
(read-only) and writes the two output files above (overwriting them each
run) — it never writes to any database.
"""

import argparse
import csv
import datetime
import glob
import re
import sqlite3
import sys
import time
import unicodedata
from dataclasses import dataclass, field

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
    "tenable-stats-research/2.0 "
    "(https://github.com/cuongluu8/tenable; one-off content-research script; "
    "contact: repo owner via GitHub)"
)

SCOPE_COMMENT_KEYWORDS = (
    "league only",
    "league matches only",
    "domestic league",
    "not all comp",
    "excl",
    "excludes",
    "cup only",
    "friendlies",
)

MAX_ROWS = 40  # how far to scan a numbered club/national-team series


# ---------------------------------------------------------------- data model

@dataclass
class TeamStint:
    team_name_raw: str
    competition_type: str  # 'club' | 'international'
    years_display: str | None
    appearances: int | None
    goals: int | None
    scope_note: str | None = None
    team_id: int | None = None


@dataclass
class PlayerResult:
    entity_id: str
    name: str
    country: str
    wiki_title: str = ""
    club_stints: list = field(default_factory=list)   # list[TeamStint], only populated if clean
    intl_stints: list = field(default_factory=list)   # list[TeamStint]
    club_review_reason: str | None = None
    fatal_review_reason: str | None = None             # no article / no infobox at all
    raw_club_rows: list = field(default_factory=list)   # for the review report


# --------------------------------------------------------------- Wikipedia

DISAMBIG_TEMPLATE_RE = re.compile(
    r"\{\{\s*(disambig(uation)?|hndis|given name|surname|hospital disambiguation)\b",
    re.IGNORECASE,
)


def is_disambiguation_page(wikitext: str) -> bool:
    """A bare name like 'Kaka'/'Gavi'/'Fabinho'/'Ederson' often resolves (via
    MediaWiki's redirect-following) not to the footballer's own article but
    to a disambiguation page listing several people/things with that name.
    That's real page content (not a "missing" page), so it isn't caught by
    the missing-page check in fetch_wikitext — it has to be detected
    explicitly so the search fallback actually runs instead of silently
    treating the disambiguation page as if it were the player's article."""
    return bool(DISAMBIG_TEMPLATE_RE.search(wikitext))


def fetch_wikitext(name: str) -> tuple[str | None, str | None]:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    def get_content(title: str) -> tuple[str | None, str | None]:
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

    title, content = get_content(name)
    if content is not None and not is_disambiguation_page(content):
        return title, content

    session_resp = session.get(
        WIKI_API,
        params={
            "action": "query",
            "list": "search",
            "srsearch": f"{name} footballer",
            "format": "json",
            "formatversion": "2",
            "srlimit": "1",
        },
        timeout=20,
    )
    session_resp.raise_for_status()
    results = session_resp.json().get("query", {}).get("search", [])
    if not results:
        return None, None
    return get_content(results[0]["title"])


def find_infobox(wikitext: str):
    code = mwparserfromhell.parse(wikitext)
    templates = code.filter_templates(
        matches=lambda t: "infobox football biography" in str(t.name).lower()
    )
    return templates[0] if templates else None


def param_str(infobox, name: str) -> str | None:
    if infobox.has(name):
        return str(infobox.get(name).value).strip()
    return None


def has_scope_comment(infobox) -> str | None:
    for p in infobox.params:
        for comment in p.value.filter_comments():
            text = str(comment.contents).strip().lower()
            if any(kw in text for kw in SCOPE_COMMENT_KEYWORDS):
                return str(comment).strip()
    return None


def to_int(raw: str | None) -> int | None:
    if raw is None:
        return None
    text = mwparserfromhell.parse(raw).strip_code().strip()
    match = re.match(r"^\s*(\d+)\s*$", text)
    return int(match.group(1)) if match else None


def to_text(raw: str | None) -> str | None:
    if raw is None:
        return None
    text = mwparserfromhell.parse(raw).strip_code().strip()
    return text or None


def extract_series(infobox, prefix_years, prefix_team, prefix_caps, prefix_goals):
    """Read a numbered {prefix}{n} series (1..MAX_ROWS) and return raw rows."""
    rows = []
    for n in range(1, MAX_ROWS + 1):
        years_raw = param_str(infobox, f"{prefix_years}{n}")
        team_raw = param_str(infobox, f"{prefix_team}{n}")
        caps_raw = param_str(infobox, f"{prefix_caps}{n}")
        goals_raw = param_str(infobox, f"{prefix_goals}{n}")
        if years_raw is None and team_raw is None and caps_raw is None and goals_raw is None:
            continue
        rows.append(
            {
                "team_name_raw": to_text(team_raw) or f"(row {n})",
                "years_display": to_text(years_raw),
                "caps_raw": caps_raw,
                "goals_raw": goals_raw,
                "caps": to_int(caps_raw),
                "goals": to_int(goals_raw),
            }
        )
    return rows


# ------------------------------------------------------------- name lookup

def normalize_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


class EntityResolver:
    """Exact (post-normalization) name -> entities.id lookup, read-only
    against the local D1 SQLite file. No fuzzy matching — a miss just means
    team_id stays NULL, never a guess."""

    def __init__(self, db_path: str | None):
        self.by_name: dict[str, int] = {}
        if not db_path:
            return
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        try:
            cur = conn.execute(
                "SELECT id, canonical_name FROM entities WHERE entity_type IN ('club','country')"
            )
            for entity_id, canonical_name in cur.fetchall():
                key = normalize_name(canonical_name)
                self.by_name.setdefault(key, entity_id)
            cur = conn.execute(
                "SELECT entity_id, alias FROM entity_aliases ea "
                "JOIN entities e ON e.id = ea.entity_id "
                "WHERE e.entity_type IN ('club','country')"
            )
            for entity_id, alias in cur.fetchall():
                key = normalize_name(alias)
                self.by_name.setdefault(key, entity_id)
        finally:
            conn.close()

    def resolve(self, name: str) -> int | None:
        return self.by_name.get(normalize_name(name))


def find_local_d1_path() -> str | None:
    matches = [
        m
        for m in glob.glob(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite")
        if not m.endswith("metadata.sqlite")
    ]
    return matches[0] if len(matches) == 1 else None


# --------------------------------------------------------------- research

def research_player(entity_id: str, name: str, country: str, sleep_s: float) -> PlayerResult:
    result = PlayerResult(entity_id=entity_id, name=name, country=country)
    try:
        title, wikitext = fetch_wikitext(name)
    except requests.RequestException as exc:
        result.fatal_review_reason = f"Network error fetching Wikipedia: {exc}"
        return result
    finally:
        time.sleep(sleep_s)

    if wikitext is None:
        result.fatal_review_reason = "No Wikipedia article found (direct title and search fallback both failed)."
        return result
    result.wiki_title = title

    infobox = find_infobox(wikitext)
    if infobox is None:
        result.fatal_review_reason = f'No "Infobox football biography" template found on the "{title}" article.'
        return result

    # --- club stints ---
    # No cross-check against the infobox's totalcaps/totalgoals: the per-club
    # breakdown IS the stored fact now (a player's career total is a SUM()
    # over these rows), so a separately-maintained "Total" field that might
    # disagree with it (as happened on Rivaldo's own page) is simply not
    # consulted. Per row: whatever's a clean number is used; whatever isn't
    # (e.g. a "?" placeholder, as on George Weah's earliest amateur spell) is
    # left NULL rather than blocking the row or the player — a known team/
    # years with an unknown caps/goals is still real, useful information.
    club_rows = extract_series(infobox, "years", "clubs", "caps", "goals")
    result.raw_club_rows = club_rows
    if not club_rows:
        result.club_review_reason = f'No numbered per-club rows found on "{title}".'
    else:
        scope_comment = has_scope_comment(infobox)
        for r in club_rows:
            if r["team_name_raw"] is None and r["caps"] is None and r["goals"] is None:
                continue
            result.club_stints.append(
                TeamStint(
                    team_name_raw=r["team_name_raw"],
                    competition_type="club",
                    years_display=r["years_display"],
                    appearances=r["caps"],
                    goals=r["goals"],
                    scope_note=scope_comment,
                )
            )

    # --- international stints (same "write what's known, leave the rest NULL" rule) ---
    intl_rows = extract_series(infobox, "nationalyears", "nationalteam", "nationalcaps", "nationalgoals")
    for r in intl_rows:
        if r["team_name_raw"] is None and r["caps"] is None and r["goals"] is None:
            continue  # nothing at all to record for this numbered slot
        result.intl_stints.append(
            TeamStint(
                team_name_raw=r["team_name_raw"],
                competition_type="international",
                years_display=r["years_display"],
                appearances=r["caps"],
                goals=r["goals"],  # may be None — that's fine, appearances is the primary fact
            )
        )

    return result


# ----------------------------------------------------------------- output

def escape_sql(s: str) -> str:
    return s.replace("'", "''")


def sql_str(s: str | None) -> str:
    return "NULL" if s is None else f"'{escape_sql(s)}'"


def sql_int(n: int | None) -> str:
    return "NULL" if n is None else str(n)


def write_sql(results: list[PlayerResult], out_path: str, run_date: str) -> None:
    lines = [
        "-- Research output: per-team career stats, generated by scripts/research_player_stats.py.",
        "-- Every row is a literal Wikipedia infobox club/international career-history row --",
        "-- mechanical extraction, no LLM judgment, no estimates. The infobox's own separately-",
        "-- maintained totalcaps/totalgoals 'Total' field is NOT used -- a player's career total",
        "-- is a SUM() over these rows. Individual appearances/goals values are NULL wherever the",
        "-- source itself doesn't state a number (never guessed/derived) -- a NULL just means that",
        "-- field isn't usable in a total/category yet, not that the row is wrong.",
        f"-- verified_at = {run_date} for all rows.",
        "-- FOR HUMAN REVIEW BEFORE APPLYING. Not applied to any database by this script.",
        "",
    ]
    for r in results:
        stints = r.club_stints + r.intl_stints
        if not stints:
            continue
        lines.append(f"-- {r.name} (entity_id {r.entity_id}) -- Wikipedia: \"{r.wiki_title}\"")
        if r.club_stints and r.club_stints[0].scope_note:
            lines.append(f"-- SCOPE CAVEAT on club rows (infobox wikitext comment): {r.club_stints[0].scope_note}")
        lines.append(
            "INSERT INTO player_career_stats "
            "(player_id, team_id, team_name_raw, competition_type, years_display, appearances, "
            "goals, scope_note, source, verified_at) VALUES"
        )
        value_tuples = []
        for s in stints:
            value_tuples.append(
                f"({r.entity_id}, {sql_int(s.team_id)}, {sql_str(s.team_name_raw)}, "
                f"'{s.competition_type}', {sql_str(s.years_display)}, {sql_int(s.appearances)}, "
                f"{sql_int(s.goals)}, {sql_str(s.scope_note)}, "
                f"'English Wikipedia infobox, \"{escape_sql(r.wiki_title)}\" article', '{run_date}')"
            )
        lines.append(",\n".join(value_tuples) + ";")
        lines.append("")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def write_review(results: list[PlayerResult], out_path: str) -> None:
    lines = [
        "# Needs human review — generated by scripts/research_player_stats.py",
        "",
        "Everything the script could extract at all is written to the SQL file, with",
        "individual unknown fields left NULL (never guessed) rather than blocking a row",
        "or a whole player. Only genuinely fatal cases end up here: no Wikipedia article",
        "found, or no infobox template on the page at all — nothing to extract.",
        "",
    ]
    fatal = [r for r in results if r.fatal_review_reason]
    club_issues = [r for r in results if not r.fatal_review_reason and r.club_review_reason]
    if not fatal and not club_issues:
        lines.append("(None — every player in this run had at least some usable data.)")
    if fatal:
        lines.append("## Fatal — no usable data")
        lines.append("")
        for r in fatal:
            lines.append(f"- **{r.name}** (entity_id {r.entity_id}, {r.country}): {r.fatal_review_reason}")
        lines.append("")
    if club_issues:
        lines.append("## No per-club rows found on the page (international rows, if any, were still written)")
        lines.append("")
        for r in club_issues:
            lines.append(f"### {r.name} (entity_id {r.entity_id}, {r.country})")
            lines.append("")
            lines.append(r.club_review_reason)
            if r.raw_club_rows:
                lines.append("")
                lines.append("Per-club rows found:")
                for row in r.raw_club_rows:
                    lines.append(f"- {row['team_name_raw']} ({row['years_display']}): caps={row['caps_raw']!r}, goals={row['goals_raw']!r}")
            lines.append("")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-sql", required=True)
    parser.add_argument("--out-review", required=True)
    parser.add_argument("--sleep", type=float, default=1.0)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--db", default=None, help="Path to the local D1 SQLite file (auto-discovered by default)")
    parser.add_argument("--no-db", action="store_true", help="Skip name resolution entirely (team_id always NULL)")
    args = parser.parse_args()

    db_path = None if args.no_db else (args.db or find_local_d1_path())
    if db_path:
        print(f"Resolving team names against local D1: {db_path}", file=sys.stderr)
    else:
        print(
            "WARNING: no local D1 SQLite file found/given — every team_id will be NULL "
            "(team_name_raw is still populated). Pass --db <path> to enable resolution.",
            file=sys.stderr,
        )
    resolver = EntityResolver(db_path)

    players = []
    with open(args.input, newline="", encoding="utf-8") as f:
        for row in csv.reader(f, delimiter="|"):
            if not row or not row[0].strip():
                continue
            players.append((row[0].strip(), row[1].strip(), row[2].strip() if len(row) > 2 else ""))
    if args.limit:
        players = players[: args.limit]

    run_date = datetime.date.today().isoformat()
    results = []
    for i, (entity_id, name, country) in enumerate(players, start=1):
        print(f"[{i}/{len(players)}] {name} (entity_id {entity_id}) ...", file=sys.stderr)
        r = research_player(entity_id, name, country, args.sleep)
        for stint in r.club_stints + r.intl_stints:
            stint.team_id = resolver.resolve(stint.team_name_raw)
        results.append(r)
        if r.fatal_review_reason:
            print(f"    -> FATAL: {r.fatal_review_reason}", file=sys.stderr)
        else:
            print(
                f"    -> club: {len(r.club_stints)} row(s)"
                + ("" if not r.club_review_reason else f" [SKIPPED: {r.club_review_reason}]")
                + f"; international: {len(r.intl_stints)} row(s)",
                file=sys.stderr,
            )

    write_sql(results, args.out_sql, run_date)
    write_review(results, args.out_review)

    fatal_n = sum(1 for r in results if r.fatal_review_reason)
    club_ok_n = sum(1 for r in results if r.club_stints)
    club_skip_n = sum(1 for r in results if not r.fatal_review_reason and r.club_review_reason)
    intl_n = sum(len(r.intl_stints) for r in results)
    print(
        f"\nDone: {len(results)} players -- {club_ok_n} with clean club rows, "
        f"{club_skip_n} club-rows skipped to review, {fatal_n} fatal (no data), "
        f"{intl_n} total international rows written.\n"
        f"  SQL:    {args.out_sql}\n"
        f"  Review: {args.out_review}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()

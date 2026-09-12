#!/usr/bin/env python3
"""
refresh_player_stats.py -- re-fetches career stats for every player ALREADY
researched (i.e. already has rows in player_career_stats), and only ever
regenerates a player whose fresh data is at least as complete as what's
already stored.

WHY THIS EXISTS
---------------
research_player_stats.py is the mechanical extractor for a *fixed*
candidate list -- a new batch of never-before-researched players. This is
its sibling for keeping ALREADY-researched players' data fresh over time
(a still-active player's club history is only complete once Wikipedia
catches up to their latest transfer, which can take days to weeks) -- it
re-runs the exact same extraction against every player who already has
data, and adds one safety rule research_player_stats.py doesn't need for a
one-off batch: a REGRESSION GATE.

REGRESSION GATE
---------------
A transient Wikipedia hiccup (a renamed article, a vandalized page, a
network blip, an infobox restructuring the parser doesn't yet understand)
can make a re-fetch return LESS data than what's already stored for a
player who was already researched. Blindly replacing that player's rows on
a schedule would eventually delete good, previously-verified data for no
real-world reason. So for each player, a fresh result is only accepted if:
  - it isn't fatal (an article and infobox were both found), AND
  - its total stint count (club + international rows) is >= the count
    currently stored for that player.
Anything that fails either check is left COMPLETELY UNTOUCHED -- not
deleted, not replaced -- and reported instead, for a human to look at.
This is deliberately a blunt row-count check, not a smarter semantic diff:
a count that goes down is *always* worth a second look, and a false
rejection just means one player's refresh waits until next run, which
costs nothing -- getting this wrong in the other direction (accepting a
regression) is the failure mode actually worth guarding against.

OUTPUT
------
Two files:
  --out-sql     A DELETE (for exactly the accepted player ids) followed by
                fresh INSERT statements for those players only -- meant to
                be applied as ONE transaction (delete-then-replace, not an
                additive re-insert, so re-running this against unchanged
                players is idempotent rather than accumulating
                duplicates). Empty (just the header comment) if nothing
                was accepted this run.
  --out-report  Which players were accepted vs. rejected, and why -- a
                caller (a CI job) reads this to decide whether to proceed;
                see --max-rejection-rate below.

Re-run safety: same as research_player_stats.py -- read-only against
Wikipedia and the local D1 file given via --db, writes only the two
output files above. Never touches a real database itself.

USAGE
-----
    python3 scripts/refresh_player_stats.py \\
        --db path/to/local-d1.sqlite \\
        --out-sql data/research/refresh_accepted.sql \\
        --out-report data/research/refresh_report.md
"""

import argparse
import datetime
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import research_player_stats as rps  # noqa: E402  (needs the sys.path insert above)


def load_researched_players(db_path: str) -> list[tuple[str, str, str, int]]:
    """Every player with existing player_career_stats rows, plus their
    CURRENT stint count -- the regression gate's baseline for that player."""
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    try:
        rows = conn.execute(
            """
            SELECT e.id, e.canonical_name, COALESCE(e.scope, ''), COUNT(pcs.id)
            FROM entities e
            JOIN player_career_stats pcs ON pcs.player_id = e.id
            WHERE e.entity_type = 'player'
            GROUP BY e.id, e.canonical_name, e.scope
            ORDER BY e.id
            """
        ).fetchall()
    finally:
        conn.close()
    return [(str(r[0]), r[1], r[2], r[3]) for r in rows]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--db", required=True, help="Path to the local D1 SQLite file -- both the candidate list and name resolution come from it")
    parser.add_argument("--out-sql", required=True)
    parser.add_argument("--out-report", required=True)
    parser.add_argument(
        "--out-ids",
        default=None,
        help="Optional: write the accepted player ids, comma-separated, to this file -- lets a caller "
        "(a CI job) know exactly which players changed without parsing --out-sql's DELETE statement.",
    )
    parser.add_argument("--sleep", type=float, default=1.0)
    parser.add_argument("--limit", type=int, default=None, help="Only check the first N players (smoke-testing)")
    parser.add_argument(
        "--max-rejection-rate",
        type=float,
        default=0.15,
        help="Exit 1 if more than this fraction of players are rejected by the regression gate in one run "
        "-- a handful of unlucky pages is normal noise, but a high rate smells like a systemic problem "
        "(a Wikipedia API or parser change), worth a human looking at the report before trusting this "
        "again unattended.",
    )
    args = parser.parse_args()

    candidates = load_researched_players(args.db)
    if args.limit:
        candidates = candidates[: args.limit]
    if not candidates:
        print("No already-researched players found in player_career_stats -- nothing to refresh.", file=sys.stderr)
        Path(args.out_sql).write_text("-- Nothing to refresh -- no researched players found.\n", encoding="utf-8")
        Path(args.out_report).write_text("# Player stats refresh report\n\nNothing to refresh -- no researched players found.\n", encoding="utf-8")
        if args.out_ids:
            Path(args.out_ids).write_text("", encoding="utf-8")
        return

    resolver = rps.EntityResolver(args.db)
    run_date = datetime.date.today().isoformat()

    accepted: list[rps.PlayerResult] = []
    rejected: list[tuple[rps.PlayerResult, int, str]] = []  # (result, previous_count, reason)

    for i, (entity_id, name, country, previous_count) in enumerate(candidates, start=1):
        print(f"[{i}/{len(candidates)}] {name} (entity_id {entity_id}, previously {previous_count} row(s)) ...", file=sys.stderr)
        result = rps.research_player(entity_id, name, country, args.sleep)
        for stint in result.club_stints:
            stint.team_id = resolver.resolve(stint.team_name_raw, prefer_type="club")
        for stint in result.intl_stints:
            stint.team_id = resolver.resolve(stint.team_name_raw, prefer_type="country")

        new_count = len(result.club_stints) + len(result.intl_stints)
        if result.fatal_review_reason:
            rejected.append((result, previous_count, f"fatal on re-fetch: {result.fatal_review_reason}"))
            print(f"    -> REJECTED (fatal): {result.fatal_review_reason}", file=sys.stderr)
        elif new_count < previous_count:
            rejected.append((result, previous_count, f"regression: {new_count} row(s) now vs {previous_count} previously"))
            print(f"    -> REJECTED (regression): {new_count} now vs {previous_count} previously", file=sys.stderr)
        else:
            accepted.append(result)
            print(f"    -> accepted: {new_count} row(s) (was {previous_count})", file=sys.stderr)

    # --- SQL output: DELETE the accepted players' old rows, then fresh INSERTs ---
    # (reuses research_player_stats.py's own write_sql verbatim for the INSERT
    # half -- same format, same "no assumptions" doc comment -- rather than
    # re-implementing it here.)
    tmp_insert_path = args.out_sql + ".inserts.tmp"
    rps.write_sql(accepted, tmp_insert_path, run_date)
    insert_body = Path(tmp_insert_path).read_text(encoding="utf-8")
    Path(tmp_insert_path).unlink()

    accepted_ids = [r.entity_id for r in accepted if (r.club_stints or r.intl_stints)]
    if args.out_ids:
        Path(args.out_ids).write_text(",".join(accepted_ids), encoding="utf-8")
    header = [
        "-- Refresh output: generated by scripts/refresh_player_stats.py.",
        "-- Delete-then-replace for exactly the players below (accepted by the regression",
        "-- gate this run) -- safe to apply as ONE transaction. Any player NOT listed here",
        "-- was rejected by the regression gate (see the report file) and is completely",
        "-- untouched by this file -- their existing rows are not deleted.",
        f"-- verified_at = {run_date}.",
        "",
    ]
    if accepted_ids:
        header.append("DELETE FROM player_career_stats WHERE player_id IN (" + ", ".join(accepted_ids) + ");")
        header.append("")
    Path(args.out_sql).write_text("\n".join(header) + "\n" + insert_body, encoding="utf-8")

    # --- report ---
    report = [
        "# Player stats refresh report",
        "",
        f"Run date: {run_date}",
        f"Players checked: {len(candidates)}",
        f"Accepted (fresh data applied): {len(accepted)}",
        f"Rejected by regression gate (left untouched): {len(rejected)}",
        "",
    ]
    if rejected:
        report.append("## Rejected -- left completely untouched, needs a human look if this recurs")
        report.append("")
        for result, previous_count, reason in rejected:
            report.append(f"- **{result.name}** (entity_id {result.entity_id}): {reason}")
        report.append("")
    else:
        report.append("(Nothing rejected this run.)")
        report.append("")
    Path(args.out_report).write_text("\n".join(report), encoding="utf-8")

    rejection_rate = len(rejected) / len(candidates) if candidates else 0
    print(
        f"\nDone: {len(candidates)} checked -- {len(accepted)} accepted, {len(rejected)} rejected "
        f"({rejection_rate:.1%}).\n  SQL:    {args.out_sql}\n  Report: {args.out_report}",
        file=sys.stderr,
    )
    if rejection_rate > args.max_rejection_rate:
        print(
            f"\nERROR: rejection rate {rejection_rate:.1%} exceeds --max-rejection-rate "
            f"{args.max_rejection_rate:.1%} -- this smells systemic (a Wikipedia API or parser "
            f"change), not a couple of unlucky pages. Failing so a human looks at the report "
            f"before this runs unattended again.",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()

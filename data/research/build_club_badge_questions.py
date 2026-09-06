#!/usr/bin/env python3
"""Derives club_badge_questions rows (see db/schema.sql) from the two
existing sources of a player's club history:

  - transfers: the 18 original batch-1 players (Messi, Ronaldo, ...) --
    chain from_club_id -> to_club_id ordered by transfer_date.
  - player_career_stats: the 103 batch1_remaining players -- resolved
    team_id values in row insertion order (mirrors the source Wikipedia
    infobox's top-to-bottom, i.e. chronological, order).

Mechanical derivation only, no judgment calls beyond the fixed rule below
-- same "objective, not ad-hoc" approach as the rest of data/research/.
A player is included only if they have >= 2 distinct resolved clubs after
collapsing (a single-club "sequence" isn't a guessing game). No manual
per-player review: every player in these two source tables was already
curated once, for fame, when their batch was chosen (see
docs/stats-enrichment.md's scope section) -- this script's only job is
"can a club sequence be built from what's already there", not "is this
player interesting enough".

collapse_adjacent_duplicates (below) only merges a club with the one
immediately before it in the chain -- it does NOT globally de-duplicate a
club out of every later position. An earlier version of this script did
the latter, and it was wrong: a real loan (join club A, go out on loan to
B, return to A before finally moving to C) chains as [A, B, A, C], and
global first-occurrence dedup silently dropped the return to A, so the
generated sequence read as A -> B -> C -- as if the player transferred
straight from the loan club to their next one, which never happened
(confirmed against Thibaut Courtois: Chelsea -> Atletico Madrid (loan)
-> Chelsea -> Real Madrid actually happened; the old logic produced
Chelsea -> Atletico Madrid -> Real Madrid). An adjacent repeat (A, A back
to back with nothing in between) is a different situation -- there's no
real "return" to represent, it's just the same continuous stint recorded
as two consecutive source rows (a Wikipedia infobox splitting one spell
across a competition or table-formatting quirk, most likely) -- so that
case still collapses to one appearance, same as before.

That fixes the case where a return-to-parent row already exists in the
source data somewhere non-adjacent. But both sources also have a second,
distinct way of losing a real return, one collapse_adjacent_duplicates
can't see because there's no return row in the source AT ALL:

  - transfers: each row's own from_club_id is the ground truth for "which
    club did this transfer start from" -- but chaining by appending only
    to_club_id (as an earlier version did) silently ignores it whenever a
    row's from_club_id doesn't match the chain's current end, i.e. exactly
    when the player was sent out on a second loan (or transferred) straight
    from the same parent without an explicit "returned to parent" row of
    its own (confirmed against Kevin De Bruyne: Chelsea -> loan to Genk ->
    Chelsea -> loan to Werder Bremen -> Chelsea -> Wolfsburg is the real
    chain, all recorded via from_club_id=Chelsea on both loan-return legs,
    but naive to_id-chaining produced Genk -> Chelsea -> Genk -> Bremen ->
    Wolfsburg, dropping both returns). append_transfer_chain (below) fixes
    this by inserting a row's own from_club_id whenever it differs from
    the chain's current end, before appending to_club_id.

  - player_career_stats has no from/to per row, just one row per stint --
    so a Wikipedia infobox lists a loan as a sub-entry directly under the
    parent club that sent the player out, and the PARENT's own years_display
    already spans the whole spell including the loan (there's normally no
    separate "returned to <parent>" row at all -- confirmed against
    Courtois again: his Chelsea row is a single "2011-2018", which already
    covers the entire 2011-2014 Atletico Madrid loan and the four seasons
    back at Chelsea afterwards). insert_loan_returns (below) fixes this: it
    tracks the most recent non-loan ("parent") row and its own listed end
    year, and after a run of one or more consecutive loan rows, inserts the
    parent's club id once more if the parent's end year is later than the
    last loan's end year -- i.e. the parent's contract clearly outlasted
    the loan(s), so a real return happened before whatever comes next.
    Still mechanical, not a per-player judgment call: it only compares
    years_display ranges already on record, the same "objective, not
    ad-hoc" rule for every player.

Usage: python3 data/research/build_club_badge_questions.py --db <path to local D1 sqlite file>
Writes data/research/club_badge_questions.sql.
"""
import argparse
import json
import re
import sqlite3
import sys


def collapse_adjacent_duplicates(seq):
    out = []
    for x in seq:
        if x is None:
            continue
        if out and out[-1] == x:
            continue
        out.append(x)
    return out


def append_transfer_chain(chain, from_id, to_id):
    """Extends an in-progress transfers chain by one row, inserting the
    row's own from_club_id first whenever it doesn't match the chain's
    current end -- see the module docstring's Kevin De Bruyne example."""
    if not chain:
        chain.append(from_id)
    elif chain[-1] != from_id:
        chain.append(from_id)
    chain.append(to_id)


def from_transfers(conn):
    cur = conn.execute(
        "SELECT player_id, from_club_id, to_club_id FROM transfers ORDER BY player_id, transfer_date"
    )
    by_player = {}
    for player_id, from_id, to_id in cur.fetchall():
        chain = by_player.setdefault(player_id, [])
        append_transfer_chain(chain, from_id, to_id)
    results = []
    for player_id, chain in by_player.items():
        clubs = collapse_adjacent_duplicates(chain)
        if len(clubs) >= 2:
            results.append((player_id, clubs, "transfers"))
    return results


def is_loan_row(team_name_raw):
    return team_name_raw is not None and "(loan)" in team_name_raw.lower()


def parse_years(years_display):
    """('2011-2018', '2019-', '2013', ...) -> (start_year, end_year), with
    end_year None for an open-ended ("still there") range -- see
    effective_end_outlasts below for how that's treated in comparisons."""
    if not years_display:
        return None, None
    s = years_display.replace("–", "-").replace("—", "-").strip()
    parts = s.split("-")
    years = [int(p) for p in re.findall(r"\d+", parts[0])] if parts[0].strip() else []
    start = years[0] if years else None
    if len(parts) == 1:
        return start, start
    end_part = parts[1].strip()
    end_years = [int(p) for p in re.findall(r"\d+", end_part)] if end_part else []
    end = end_years[0] if end_years else None
    return start, end


def parent_outlasts_loan(parent_end, loan_end):
    """True when the parent club's own listed end year is clearly later
    than the loan's -- i.e. the parent's contract was still running after
    the loan finished, so a real return happened. An open-ended loan
    (loan_end is None, still ongoing) can't have returned yet regardless
    of the parent; an open-ended parent (parent_end is None, still there)
    always outlasts a loan that's already finished."""
    if loan_end is None:
        return False
    if parent_end is None:
        return True
    return parent_end > loan_end


def insert_loan_returns(rows):
    """rows: (team_id, team_name_raw, years_display) tuples for one player,
    in source order. Returns the chain with an inferred return-to-parent
    club id spliced in after any loan run the parent's own dates outlast --
    see the module docstring's insert_loan_returns paragraph."""
    chain = []
    parent_id = None
    parent_end = None
    pending_loan_end = None
    for team_id, team_name_raw, years_display in rows:
        _, end_year = parse_years(years_display)
        if is_loan_row(team_name_raw):
            chain.append(team_id)
            if parent_id is not None:
                pending_loan_end = end_year
            continue
        if pending_loan_end is not None and parent_outlasts_loan(parent_end, pending_loan_end):
            chain.append(parent_id)
        chain.append(team_id)
        parent_id = team_id
        parent_end = end_year
        pending_loan_end = None
    if pending_loan_end is not None and parent_outlasts_loan(parent_end, pending_loan_end):
        chain.append(parent_id)
    return chain


def from_career_stats(conn):
    cur = conn.execute(
        "SELECT player_id, team_id, team_name_raw, years_display FROM player_career_stats "
        "WHERE competition_type='club' ORDER BY player_id, id"
    )
    by_player = {}
    for player_id, team_id, team_name_raw, years_display in cur.fetchall():
        by_player.setdefault(player_id, []).append((team_id, team_name_raw, years_display))
    results = []
    for player_id, rows in by_player.items():
        chain = insert_loan_returns(rows)
        clubs = collapse_adjacent_duplicates(chain)
        if len(clubs) >= 2:
            results.append((player_id, clubs, "player_career_stats"))
    return results


def sql_str(s):
    return "'" + s.replace("'", "''") + "'"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True, help="path to local D1 sqlite file (read-only)")
    parser.add_argument("--out", default="data/research/club_badge_questions.sql")
    args = parser.parse_args()

    conn = sqlite3.connect(f"file:{args.db}?mode=ro", uri=True)
    try:
        rows = from_transfers(conn) + from_career_stats(conn)
    finally:
        conn.close()

    rows.sort(key=lambda r: r[0])
    print(f"{len(rows)} players qualify (>= 2 distinct resolved clubs)", file=sys.stderr)

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("-- Generated by data/research/build_club_badge_questions.py -- do not hand-edit.\n")
        f.write("-- One row per player with a usable (>= 2 distinct resolved clubs) chronological\n")
        f.write("-- club sequence, derived from transfers/player_career_stats. Re-run and\n")
        f.write("-- regenerate this file if either source table changes materially (e.g. more\n")
        f.write("-- players researched) rather than hand-editing rows in here.\n\n")
        f.write(
            "INSERT INTO club_badge_questions (player_id, club_sequence, source) VALUES\n"
        )
        lines = []
        for player_id, clubs, source in rows:
            club_json = json.dumps(clubs)
            lines.append(f"({player_id}, {sql_str(club_json)}, {sql_str(source)})")
        f.write(",\n".join(lines))
        f.write(";\n")

    print(f"wrote {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()

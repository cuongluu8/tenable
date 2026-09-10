#!/usr/bin/env python3
"""Derives teammate_questions rows (see db/schema.sql) from
player_career_stats -- a mystery player identified by a set of well-known
former teammates ("Who am I? I played with...").

FAIL-CLOSED TEAMMATE RULE
------------------------
Two players count as teammates ONLY if all of the following hold, from the
data actually on record -- anything short of this is dropped, never guessed
(same "objective, not ad-hoc" rule as build_club_badge_questions.py, and
the user's explicit instruction 2026-09-10: "if there is doubt, then assume
that they didn't play together until better data becomes available"):

  1. Same club, resolved to the SAME entities.id (team_id NOT NULL on both
     player_career_stats rows). An unresolved club name can't be trusted to
     be the same club as another unresolved one.
  2. competition_type = 'club'. Being in the same 26-man national-team
     squad for a tournament is not "played with".
  3. Neither stint is a loan (team_name_raw not ending in "(loan)").
  4. Their listed year ranges overlap by at least one full shared season:
     min(end_a, end_b) - max(start_a, start_b) >= 1, where an open-ended
     range ("2021-") ends at the current year. That excludes the genuinely
     ambiguous handoff case (A "2016-2019", B "2019-2022" -> diff 0). Year
     granularity is the ceiling; exact transfer dates would tighten it.

UNIQUE CLUE SETS (2026-09-10)
---------------------------
The old version always used exactly 3 clues -- an arbitrary number that
routinely wasn't enough to pin down one player (e.g. "Shevchenko, Lampard,
Terry" is just "a Chelsea player, 2006-2009" -- Drogba, Cech, Ashley Cole
and a dozen others all fit). Now the clue count is whatever it takes: for
each mystery player, the smallest set of their most-recognizable teammates
such that NO OTHER player in the researched pool played with every one of
them. Search order is fewest-clues-first, then most-famous-first (clues are
only ever drawn from a player's CANDIDATE_POOL most-famous teammates, so a
question can't be built out of obscure names), between MIN_CLUES and
MAX_CLUES. A player with no unique set in that range is dropped rather than
shipped ambiguous.

"Unique" means unique *within the pool of researched players* (currently
~350, all fame-curated). A real player outside that pool could in
principle also fit a clue set; the pool is the correctness boundary we can
actually check, and its fame curation makes an unresearched well-known
alternative unlikely. Re-run this whenever player_career_stats grows --
adding players can break a previously-unique set.

Usage: python3 data/research/build_teammate_questions.py --db <path to local D1 sqlite file>
Writes data/research/teammate_questions.sql.
"""
import argparse
import itertools
import json
import re
import sqlite3

CURRENT_YEAR = 2026
MIN_CLUES = 2
MAX_CLUES = 5
# Only a player's N most-famous (lowest entity id) teammates are eligible
# to be clues -- keeps every question built from recognizable names, and
# keeps the combination search below cheap. A player whose famous teammates
# can't be combined into a unique set is dropped, not padded with obscure
# ones.
CANDIDATE_POOL = 12


def parse_years(s):
    """'2018-2021' -> (2018, 2021); '2021-' -> (2021, CURRENT_YEAR);
    '2020' -> (2020, 2020); anything else -> None (dropped, not guessed)."""
    s = s.strip()
    m = re.match(r"^(\d{4})\s*[–—-]\s*(\d{4})?$", s)
    if m:
        start = int(m.group(1))
        end = int(m.group(2)) if m.group(2) else CURRENT_YEAR
        return (start, end) if end >= start else None
    m = re.match(r"^(\d{4})$", s)
    if m:
        return int(m.group(1)), int(m.group(1))
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--out", default="data/research/teammate_questions.sql")
    args = ap.parse_args()

    conn = sqlite3.connect(args.db)
    rows = conn.execute(
        """
        SELECT pcs.player_id, pcs.team_id, pcs.team_name_raw, pcs.years_display
        FROM player_career_stats pcs
        WHERE pcs.competition_type = 'club'
          AND pcs.team_id IS NOT NULL
          AND pcs.years_display IS NOT NULL
        """
    ).fetchall()

    # team_id -> list of (player_id, start, end), loans excluded
    by_team = {}
    dropped_unparseable = 0
    for player_id, team_id, raw, years_display in rows:
        if re.search(r"\(loan\)\s*$", raw or ""):
            continue
        yr = parse_years(years_display)
        if yr is None:
            dropped_unparseable += 1
            continue
        by_team.setdefault(team_id, []).append((player_id, yr[0], yr[1]))

    # teammate graph: player_id -> set(player_id)
    graph = {}
    for stints in by_team.values():
        for i in range(len(stints)):
            for j in range(i + 1, len(stints)):
                a_pid, a_s, a_e = stints[i]
                b_pid, b_s, b_e = stints[j]
                if a_pid == b_pid:
                    continue
                if min(a_e, b_e) - max(a_s, b_s) >= 1:  # >= 1 full shared season
                    graph.setdefault(a_pid, set()).add(b_pid)
                    graph.setdefault(b_pid, set()).add(a_pid)

    # frozenset teammate sets for fast subset tests
    T = {pid: frozenset(mates) for pid, mates in graph.items()}

    def is_unique(clue_set, mystery_pid):
        """No player other than mystery_pid has every clue as a teammate."""
        return not any(cid != mystery_pid and clue_set <= mates for cid, mates in T.items())

    questions = []
    dropped_not_unique = 0
    for pid, mates in T.items():
        if len(mates) < MIN_CLUES:
            continue
        candidates = sorted(mates)[:CANDIDATE_POOL]  # most famous first
        found = None
        for k in range(MIN_CLUES, MAX_CLUES + 1):
            for combo in itertools.combinations(candidates, k):
                if is_unique(set(combo), pid):
                    found = list(combo)
                    break
            if found:
                break
        if found:
            questions.append((pid, found))
        else:
            dropped_not_unique += 1
    questions.sort()

    names = dict(
        conn.execute(
            "SELECT id, canonical_name FROM entities WHERE entity_type = 'player'"
        ).fetchall()
    )

    with open(args.out, "w") as f:
        f.write("-- Generated by data/research/build_teammate_questions.py -- do not hand-edit.\n")
        f.write("-- One row per mystery player, identified by the smallest set of their\n")
        f.write("-- most-recognizable former teammates that NO OTHER researched player\n")
        f.write("-- also played with (fail-closed overlap rule -- see the script docstring).\n")
        f.write("-- teammate_ids is that set (2-5 ids); clue count varies by player.\n")
        f.write("-- Regenerate if player_career_stats changes -- new players can break\n")
        f.write("-- a set that used to be unique.\n\n")
        f.write("INSERT INTO teammate_questions (player_id, teammate_ids, source) VALUES\n")
        entries = []
        for player_id, clue_ids in questions:
            who = names.get(player_id, f"id {player_id}")
            mates = ", ".join(names.get(t, str(t)) for t in clue_ids)
            ids_json = json.dumps(clue_ids, separators=(",", ":"))
            # Comment on its OWN line above the tuple -- a trailing `--`
            # comment would swallow the `,` separator that follows it.
            entries.append(f"\t-- {who} ({len(clue_ids)}): {mates}\n\t({player_id}, '{ids_json}', 'player_career_stats')")
        f.write(",\n".join(entries))
        f.write(";\n")

    counts = {}
    for _, clue_ids in questions:
        counts[len(clue_ids)] = counts.get(len(clue_ids), 0) + 1
    print(f"{len(rows)} club stint rows, {dropped_unparseable} dropped (unparseable years)")
    print(f"{len(T)} players have >=1 verified teammate")
    print(f"{len(questions)} unique-clue questions written; {dropped_not_unique} dropped (no unique set in {MIN_CLUES}-{MAX_CLUES} famous clues)")
    print(f"clue-count distribution: {dict(sorted(counts.items()))}")


if __name__ == "__main__":
    main()

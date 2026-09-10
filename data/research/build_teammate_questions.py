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
     player_career_stats rows).
  2. competition_type = 'club'. Same national-team squad doesn't count.
  3. Neither stint is a loan (team_name_raw not ending in "(loan)").
  4. Listed year ranges overlap by >= 1 full shared season:
     min(end_a, end_b) - max(start_a, start_b) >= 1 (open-ended range ends
     at CURRENT_YEAR). Year granularity is the ceiling.

PICKING THE CLUE SET (2026-09-10)
-------------------------------
The clue set has to actually pin down one player, and *feel* like it does.
"Shevchenko, Lampard, Terry" is just "a Chelsea player 2006-2009" -- Drogba,
Cech, Ashley Cole all fit -- so a plain count of "the 3 most famous
teammates" was wrong, and so was "the smallest set that happens not to
collide in our sample" (fragile -- pool-unique only because the rest of
that squad isn't researched yet).

Two hard rules now, both user instructions:
  - At least MIN_CLUES teammates per question.
  - Each clue from a DIFFERENT club of the mystery player's -- there must
    be a way to assign each clue its own distinct club where it actually
    overlapped them (a system of distinct representatives, has_distinct_
    clubs below). So every question is a genuine multi-club bridge, never
    a group from one squad.

Among the candidate sets that satisfy both rules AND are minimal (no
redundant clue) AND unique (no other researched player played with all of
them), the most discriminating one is picked:

  1. clue rarity, MAXIMISED -- prefer clues who themselves have few
     verified teammates; a player who only ever overlapped 10 others is a
     razor-sharp identifier, one who overlapped 90 is mush.
  2. fame, MAXIMISED -- lower entity id (the manual fame ranking).
  3. fewer clues -- elegance only, the final tie-break.

A player with no such set among their famous teammates is dropped, not
shipped ambiguous -- e.g. a one-club man, or one whose famous teammates
are all from a single club. "Unique" is still within the researched pool
(the boundary we can check); re-run when player_career_stats grows.

Usage: python3 data/research/build_teammate_questions.py --db <local D1 sqlite path>
Writes data/research/teammate_questions.sql.
"""
import argparse
import itertools
import json
import re
import sqlite3

CURRENT_YEAR = 2026
# At least 3 teammate clues per question (user instruction 2026-09-10),
# each from a different club (see has_distinct_clubs) -- so every question
# is "played with X at club A, Y at club B, Z at club C".
MIN_CLUES = 3
MAX_CLUES = 5
# Clues are only ever drawn from a player's N most-famous (lowest entity
# id) teammates -- keeps every question built from recognizable names and
# keeps the combination search cheap. Widened from 14 to 20 when MIN_CLUES
# went 2->3: needing 3 unique cross-club famous teammates is a much
# tighter ask, and a curated star's 20th-most-famous teammate is still a
# real name.
CANDIDATE_POOL = 20


def parse_years(s):
    """'2018-2021'->(2018,2021); '2021-'->(2021,CURRENT_YEAR); '2020'->(2020,2020);
    anything else -> None (dropped, not guessed)."""
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


def has_distinct_clubs(clue_venues):
    """True iff each clue can be assigned its OWN distinct club where it
    overlapped the mystery player -- a system of distinct representatives,
    via Kuhn's bipartite matching (clues <= MAX_CLUES, trivial)."""
    match = {}  # club -> clue index

    def augment(i, seen):
        for club in clue_venues[i]:
            if club in seen:
                continue
            seen.add(club)
            if club not in match or augment(match[club], seen):
                match[club] = i
                return True
        return False

    for i in range(len(clue_venues)):
        if not augment(i, set()):
            return False
    return True


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

    by_team = {}  # team_id -> [(player_id, start, end)], loans excluded
    player_clubs = {}  # player_id -> set(team_id)
    dropped_unparseable = 0
    for player_id, team_id, raw, years_display in rows:
        if re.search(r"\(loan\)\s*$", raw or ""):
            continue
        yr = parse_years(years_display)
        if yr is None:
            dropped_unparseable += 1
            continue
        by_team.setdefault(team_id, []).append((player_id, yr[0], yr[1]))
        player_clubs.setdefault(player_id, set()).add(team_id)

    # teammate graph + which club(s) each pair overlapped at
    graph = {}  # player_id -> set(player_id)
    pair_clubs = {}  # (lo_pid, hi_pid) -> set(team_id)
    for team_id, stints in by_team.items():
        for i in range(len(stints)):
            for j in range(i + 1, len(stints)):
                a_pid, a_s, a_e = stints[i]
                b_pid, b_s, b_e = stints[j]
                if a_pid == b_pid:
                    continue
                if min(a_e, b_e) - max(a_s, b_s) >= 1:  # >= 1 full shared season
                    graph.setdefault(a_pid, set()).add(b_pid)
                    graph.setdefault(b_pid, set()).add(a_pid)
                    pair_clubs.setdefault((min(a_pid, b_pid), max(a_pid, b_pid)), set()).add(team_id)

    T = {pid: frozenset(mates) for pid, mates in graph.items()}

    def is_unique(clue_set, mystery_pid):
        return not any(cid != mystery_pid and clue_set <= mates for cid, mates in T.items())

    questions = []
    dropped_not_unique = 0
    for pid, mates in T.items():
        if len(mates) < MIN_CLUES:
            continue
        candidates = sorted(mates)[:CANDIDATE_POOL]  # most famous first

        def venues_of(cs):
            return [pair_clubs[(min(pid, c), max(pid, c))] & player_clubs[pid] for c in cs]

        # All MINIMAL unique clue sets, filtered to clue-per-distinct-club.
        # Once a k-subset qualifies, its supersets are redundant (skip
        # anything containing an already-found one).
        valid = []
        for k in range(MIN_CLUES, MAX_CLUES + 1):
            for combo in itertools.combinations(candidates, k):
                cs = frozenset(combo)
                if any(u <= cs for u in valid):
                    continue
                if not has_distinct_clubs(venues_of(cs)):
                    continue
                if is_unique(cs, pid):
                    valid.append(cs)
        if not valid:
            dropped_not_unique += 1
            continue

        def score(cs):
            rarity = sum(len(T[c]) for c in cs)  # lower = sharper clues
            fame = sum(cs)  # lower id = more famous
            return (rarity, fame, len(cs))

        best = min(valid, key=score)
        questions.append((pid, sorted(best)))
    questions.sort()

    names = dict(
        conn.execute("SELECT id, canonical_name FROM entities WHERE entity_type = 'player'").fetchall()
    )

    with open(args.out, "w") as f:
        f.write("-- Generated by data/research/build_teammate_questions.py -- do not hand-edit.\n")
        f.write("-- One row per mystery player. teammate_ids is the most discriminating\n")
        f.write("-- minimal set of their most-recognizable former teammates such that\n")
        f.write("--   (a) each clue was a teammate at a DIFFERENT one of the mystery\n")
        f.write("--       player's clubs, and\n")
        f.write("--   (b) no other researched player played with all of them.\n")
        f.write("-- Count varies (2-5). See the script docstring for the tie-breaks.\n")
        f.write("-- Regenerate if player_career_stats changes -- new players can break\n")
        f.write("-- a set that used to be unique.\n\n")
        f.write("INSERT INTO teammate_questions (player_id, teammate_ids, source) VALUES\n")
        entries = []
        for player_id, clue_ids in questions:
            who = names.get(player_id, f"id {player_id}")
            mates = ", ".join(names.get(t, str(t)) for t in clue_ids)
            ids_json = json.dumps(clue_ids, separators=(",", ":"))
            entries.append(f"\t-- {who} ({len(clue_ids)}): {mates}\n\t({player_id}, '{ids_json}', 'player_career_stats')")
        f.write(",\n".join(entries))
        f.write(";\n")

    counts = {}
    for _, clue_ids in questions:
        counts[len(clue_ids)] = counts.get(len(clue_ids), 0) + 1
    print(f"{len(rows)} club stint rows, {dropped_unparseable} dropped (unparseable years)")
    print(f"{len(T)} players have >=1 verified teammate")
    print(f"{len(questions)} questions written; {dropped_not_unique} dropped (no unique clue-per-distinct-club set in {MIN_CLUES}-{MAX_CLUES} famous clues)")
    print(f"clue-count distribution: {dict(sorted(counts.items()))}  (every clue from a different club of the mystery player)")


if __name__ == "__main__":
    main()

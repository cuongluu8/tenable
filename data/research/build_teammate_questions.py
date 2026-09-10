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

Rules, all user instructions:
  - Each clue from a DIFFERENT club of the mystery player's -- built as
    "one famous teammate per club", so this holds by construction.
  - At least MIN_CLUES clues (3).
  - As MANY clues as possible, up to MAX_CLUES (6) -- "include more
    players where possible". So a player who was at six clubs, each with a
    recognizable teammate, gets a six-clue question; one with only three
    such clubs gets three.
  - The set must be unique: no other researched player played with all of
    them. (Superset of a unique set is unique, so if the biggest set
    isn't unique, no subset is either -- the player is just ambiguous and
    gets dropped.)

Construction: for each of the mystery player's clubs, take the single
most-famous teammate they overlapped there (each teammate used once,
clubs whose best teammate is more famous get first pick). Order those by
fame, keep up to six. Drop the player if fewer than three, or if the set
still isn't unique.

"Unique" is within the researched pool (the boundary we can check);
re-run when player_career_stats grows.

Usage: python3 data/research/build_teammate_questions.py --db <local D1 sqlite path>
Writes data/research/teammate_questions.sql.
"""
import argparse
import json
import re
import sqlite3

CURRENT_YEAR = 2026
# 3 to 6 teammate clues per question, each from a different club of the
# mystery player's -- as many as we can find, favouring the most famous
# (user instructions 2026-09-10).
MIN_CLUES = 3
MAX_CLUES = 6
# A teammate is only eligible as a clue if they're among the mystery
# player's N most-famous (lowest entity id) -- keeps every clue a
# recognizable name.
CANDIDATE_POOL = 30


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
    stint_years = {}  # (player_id, team_id) -> (earliest start, latest end)
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
        prev = stint_years.get((player_id, team_id))
        stint_years[(player_id, team_id)] = (
            min(prev[0], yr[0]) if prev else yr[0],
            max(prev[1], yr[1]) if prev else yr[1],
        )

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
    dropped_too_few = 0
    dropped_not_unique = 0
    for pid, mates in T.items():
        famous = set(sorted(mates)[:CANDIDATE_POOL])  # eligibility gate: recognizable only

        # club -> [famous teammates who overlapped pid there], most famous first
        club_mates = {}
        for c in mates:
            if c not in famous:
                continue
            for club in pair_clubs[(min(pid, c), max(pid, c))] & player_clubs[pid]:
                club_mates.setdefault(club, []).append(c)
        for club in club_mates:
            club_mates[club].sort()

        # One distinct teammate per club: clubs whose best teammate is more
        # famous choose first; each teammate used at most once.
        used = set()
        chosen = []  # (teammate_id, club_id), one per club
        for club in sorted(club_mates, key=lambda cl: club_mates[cl][0]):
            for c in club_mates[club]:
                if c not in used:
                    used.add(c)
                    chosen.append((c, club))
                    break

        chosen_top = sorted(chosen, key=lambda x: x[0])[:MAX_CLUES]  # most famous, up to 6
        if len(chosen_top) < MIN_CLUES:
            dropped_too_few += 1
            continue
        clue_ids = [c for c, _ in chosen_top]
        clue_clubs = [club for _, club in chosen_top]
        if not is_unique(frozenset(clue_ids), pid):
            dropped_not_unique += 1
            continue
        questions.append((pid, clue_ids, clue_clubs))
    questions.sort()

    names = dict(
        conn.execute("SELECT id, canonical_name FROM entities WHERE entity_type = 'player'").fetchall()
    )
    club_names = dict(
        conn.execute("SELECT id, canonical_name FROM entities WHERE entity_type = 'club'").fetchall()
    )
    club_images = dict(
        conn.execute(
            "SELECT id, image_key FROM entities WHERE entity_type = 'club' AND image_key IS NOT NULL"
        ).fetchall()
    )
    # entities.scope for a player is their country -- the hint 2 value.
    player_country = dict(
        conn.execute(
            "SELECT id, scope FROM entities WHERE entity_type = 'player' AND scope IS NOT NULL"
        ).fetchall()
    )

    def overlap_years(mystery_pid, teammate_id, club_id):
        """The window pid and teammate shared at club_id, as a display
        string -- 'YYYY', 'YYYY-YYYY', or 'YYYY-present' for an open range."""
        a = stint_years.get((mystery_pid, club_id))
        b = stint_years.get((teammate_id, club_id))
        if not a or not b:
            return "?"
        start, end = max(a[0], b[0]), min(a[1], b[1])
        if end >= CURRENT_YEAR:
            return f"{start}–present"
        return str(start) if start == end else f"{start}–{end}"

    with open(args.out, "w") as f:
        f.write("-- Generated by data/research/build_teammate_questions.py -- do not hand-edit.\n")
        f.write("-- One row per mystery player. teammate_ids is up to 6 of their\n")
        f.write("-- most-recognizable former teammates, ONE PER CLUB (each clue was a\n")
        f.write("-- teammate at a different one of the mystery player's clubs), such\n")
        f.write("-- that no other researched player played with all of them. Count\n")
        f.write("-- varies 3-6 -- as many recognizable one-per-club teammates as exist.\n")
        f.write("-- hints is {clubs, clubImages, nationality, years}: clubs/clubImages/years\n")
        f.write("-- teammate_ids (the club each was a teammate at, and the years they\n")
        f.write("-- overlapped there); nationality is the mystery player's own country.\n")
        f.write("-- These feed the 3 progressive hints -- see Teammates.tsx.\n")
        f.write("-- Regenerate if player_career_stats changes -- new players can break\n")
        f.write("-- a set that used to be unique.\n\n")
        f.write("INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) VALUES\n")
        entries = []
        for player_id, clue_ids, clue_clubs in questions:
            who = names.get(player_id, f"id {player_id}")
            mates = ", ".join(names.get(t, str(t)) for t in clue_ids)
            ids_json = json.dumps(clue_ids, separators=(",", ":"))
            hints = {
                "clubs": [club_names.get(cl, "?") for cl in clue_clubs],
                "clubImages": [club_images.get(cl) for cl in clue_clubs],
                "nationality": player_country.get(player_id),
                "years": [overlap_years(player_id, t, cl) for t, cl in zip(clue_ids, clue_clubs)],
            }
            hints_json = json.dumps(hints, separators=(",", ":")).replace("'", "''")
            entries.append(
                f"\t-- {who} ({len(clue_ids)}): {mates}\n"
                f"\t({player_id}, '{ids_json}', '{hints_json}', 'player_career_stats')"
            )
        f.write(",\n".join(entries))
        f.write(";\n")

    counts = {}
    for _, clue_ids, _ in questions:
        counts[len(clue_ids)] = counts.get(len(clue_ids), 0) + 1
    print(f"{len(rows)} club stint rows, {dropped_unparseable} dropped (unparseable years)")
    print(f"{len(T)} players have >=1 verified teammate")
    print(f"{len(questions)} questions written; {dropped_too_few} dropped (<{MIN_CLUES} one-per-club famous teammates), {dropped_not_unique} dropped (not unique)")
    print(f"clue-count distribution: {dict(sorted(counts.items()))}  (each clue a different club of the mystery player)")


if __name__ == "__main__":
    main()

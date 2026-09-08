// Standing correctness check for the club-badges game's data, run this
// after touching transfers/player_career_stats/club_badge_questions, not
// just once by hand.
//
// Exists because of a real, shipped bug (Mohamed Salah, 2026-09-08):
// transfers.id=49/50 (his Al Mokawloon -> Basel -> Chelsea moves) had
// null from_club_id/to_club_id ("Al-Mokawloon, Basel not found in local
// club pool"). That had two separate effects, both invisible to every
// other check in this repo: (1) his badge chain silently started at
// Chelsea instead of his actual first two clubs, since a null-ended
// transfer can't appear in club_sequence at all, and (2) src/worker/
// routes/clubBadges.ts's transferDatesFor walks a player's transfers rows
// and club_sequence steps in lockstep, advancing a pointer only on an
// exact from/to match -- a null-ended row can never match, and (before
// that function's own 2026-09-08 fix) sat at the pointer's start position
// forever, permanently blocking every real match after it. That silently
// marked his real Chelsea -> Fiorentina loan (and every transfer after
// it) as a non-loan. Nothing here failed to compile or crashed; it just
// quietly showed the wrong game to players, and the only reason it
// surfaced at all was a human clicking through the UI and happening to
// know Salah's real career. This check exists so the next one of these
// doesn't need a human who happens to know the answer -- it flags for
// review, it doesn't decide anything is wrong on its own or auto-fix it.
//
// Two things checked, both against every player who actually has a
// club_badge_questions row (only players who can currently be asked
// about in the game -- an unresolved club on some OTHER player wouldn't
// affect anything a user can see):
//
//   1. Any transfers or player_career_stats row for that player with an
//      unresolved club (null from_club_id/to_club_id/team_id). Each one
//      is a club that's either missing from their displayed chain
//      entirely (transfers) or won't get its own date estimate
//      (player_career_stats) -- Salah's exact shape, but this catches it
//      for anyone, not just him.
//   2. For source='transfers' players specifically: replays
//      transferDatesFor's own lockstep matching (kept in sync with that
//      function by hand -- there's no shared module between a Worker
//      route and a standalone script here) and flags any real (non-null)
//      transfers row that never gets consumed by the end of the walk.
//      That's the general shape of "this player's transfers table and
//      their club_sequence don't actually line up" -- broader than just
//      the null-row case check 1 already covers.
//
// Usage: npm run verify:club-badges
//   (requires a locally seeded D1 -- see README/agents.md for setup)

import { execFileSync } from "node:child_process";

interface QuestionRow {
	id: number;
	player_id: number;
	club_sequence: string;
	source: "transfers" | "player_career_stats";
}
interface TransferRow {
	id: number;
	player_id: number;
	from_club_id: number | null;
	to_club_id: number | null;
	transfer_date: string;
}
interface CareerStatsRow {
	id: number;
	player_id: number;
	team_id: number | null;
	team_name_raw: string;
	competition_type: "club" | "international";
}
interface EntityRow {
	id: number;
	canonical_name: string;
}

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 200 * 1024 * 1024 },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

const questions = queryLocalD1<QuestionRow>("SELECT id, player_id, club_sequence, source FROM club_badge_questions;");
const playerIds = [...new Set(questions.map((q) => q.player_id))];
const playerIdList = playerIds.join(",");

const allTransfers = queryLocalD1<TransferRow>(
	`SELECT id, player_id, from_club_id, to_club_id, transfer_date FROM transfers WHERE player_id IN (${playerIdList});`,
);
const allCareerStats = queryLocalD1<CareerStatsRow>(
	`SELECT id, player_id, team_id, team_name_raw, competition_type FROM player_career_stats WHERE player_id IN (${playerIdList});`,
);
const players = queryLocalD1<EntityRow>(`SELECT id, canonical_name FROM entities WHERE id IN (${playerIdList});`);
const playerNameById = new Map(players.map((p) => [p.id, p.canonical_name]));

let flagged = 0;

// Check 1: unresolved-club rows for any player actually in the game pool.
const unresolvedTransfers = allTransfers.filter((t) => t.from_club_id === null || t.to_club_id === null);
const unresolvedCareerStats = allCareerStats.filter((r) => r.competition_type === "club" && r.team_id === null);

if (unresolvedTransfers.length > 0) {
	flagged += unresolvedTransfers.length;
	console.error(`\n⚠ ${unresolvedTransfers.length} transfers row(s) with an unresolved club, for a player currently in club_badge_questions:`);
	for (const t of unresolvedTransfers) {
		const name = playerNameById.get(t.player_id) ?? `player_id=${t.player_id}`;
		console.error(
			`  [transfers.id=${t.id}] ${name} (${t.transfer_date}) -- from_club_id=${t.from_club_id} to_club_id=${t.to_club_id}`,
		);
	}
}
if (unresolvedCareerStats.length > 0) {
	flagged += unresolvedCareerStats.length;
	console.error(`\n⚠ ${unresolvedCareerStats.length} player_career_stats club row(s) with an unresolved team_id:`);
	for (const r of unresolvedCareerStats) {
		const name = playerNameById.get(r.player_id) ?? `player_id=${r.player_id}`;
		console.error(`  [player_career_stats.id=${r.id}] ${name} -- team_name_raw="${r.team_name_raw}"`);
	}
}

// Check 2: for source='transfers' questions, replay transferDatesFor's own
// lockstep walk (src/worker/routes/clubBadges.ts) and flag any real
// transfer that's never consumed by the end of it.
const transfersByPlayer = new Map<number, TransferRow[]>();
for (const t of allTransfers) {
	if (t.from_club_id === null || t.to_club_id === null) continue; // check 1 already flagged these
	const list = transfersByPlayer.get(t.player_id) ?? [];
	list.push(t);
	transfersByPlayer.set(t.player_id, list);
}
for (const list of transfersByPlayer.values()) {
	list.sort((a, b) => (a.transfer_date < b.transfer_date ? -1 : a.transfer_date > b.transfer_date ? 1 : 0));
}

const unmatchedByPlayer = new Map<number, TransferRow[]>();
for (const q of questions) {
	if (q.source !== "transfers") continue;
	const clubIds = JSON.parse(q.club_sequence) as number[];
	const playerTransfers = transfersByPlayer.get(q.player_id) ?? [];
	const consumed = new Set<number>();
	let ptr = 0;
	for (let i = 1; i < clubIds.length; i++) {
		const fromClubId = clubIds[i - 1];
		const toClubId = clubIds[i];
		const next = playerTransfers[ptr];
		if (next && next.from_club_id === fromClubId && next.to_club_id === toClubId) {
			consumed.add(next.id);
			ptr++;
		}
	}
	const unmatched = playerTransfers.filter((t) => !consumed.has(t.id));
	if (unmatched.length > 0) unmatchedByPlayer.set(q.player_id, unmatched);
}

if (unmatchedByPlayer.size > 0) {
	const totalUnmatched = [...unmatchedByPlayer.values()].reduce((n, l) => n + l.length, 0);
	flagged += totalUnmatched;
	console.error(
		`\n⚠ ${totalUnmatched} real transfer(s), across ${unmatchedByPlayer.size} player(s), never matched to a club_sequence step (transferDatesFor would silently fall back to an estimated/missing date and loan:false for these):`,
	);
	for (const [playerId, unmatched] of unmatchedByPlayer) {
		const name = playerNameById.get(playerId) ?? `player_id=${playerId}`;
		for (const t of unmatched) {
			console.error(`  [transfers.id=${t.id}] ${name} (${t.transfer_date}) -- from=${t.from_club_id} to=${t.to_club_id}`);
		}
	}
}

if (flagged > 0) {
	console.error(
		`\nverify-club-badges: ${flagged} issue(s) flagged for review (not a failure -- these may be genuine data gaps, not bugs; decide case by case).`,
	);
} else {
	console.log(
		`verify-club-badges: OK — ${questions.length} questions, ${allTransfers.length} transfers, ${allCareerStats.length} career-stats rows checked, 0 unresolved clubs, 0 unmatched transfers`,
	);
}

// Shared "Sets" mode helpers -- club-badges and teammates each replaced
// a plain random round with fixed, named groups of question rows
// resolved by player entity id (see clubBadgeSets.ts/teammateSets.ts's
// own docs on why the ids are ordered the way they are). Both routes
// need the exact same two operations against their own table/config, so
// they live here once rather than as two hand-copied implementations.

export interface SetsIndexEntry {
	id: number;
	name: string;
	questionIds: number[];
}

// Resolves one curated set (an ordered list of player entity ids) against
// this mode's full question-row list, in that FIXED order, keeping only
// ids that still resolve to a real row -- a set referencing a player
// whose question row got deleted out from under it just shrinks by one,
// it doesn't error the whole round.
export function resolveSetQuestions<Row extends { player_id: number }>(allRows: Row[], playerIds: number[]): Row[] {
	const byPlayerId = new Map(allRows.map((row) => [row.player_id, row]));
	return playerIds.map((pid) => byPlayerId.get(pid)).filter((row): row is Row => row !== undefined);
}

// Builds a Sets-mode /sets index response: one entry per configured set,
// only ever including sets that resolve to exactly `questionsPerRound`
// questions -- a short/broken set shouldn't show up in the picker at all
// (see clubBadgeSets.ts's own doc), checked against the ACTUAL resolved
// count so a set that drops below full for any reason (not just the
// known short last-batch case) is hidden the same way.
export function buildSetsIndex(
	rows: { id: number; player_id: number }[],
	sets: number[][],
	names: string[],
	questionsPerRound: number,
): SetsIndexEntry[] {
	const questionIdByPlayerId = new Map(rows.map((row) => [row.player_id, row.id]));
	return sets
		.map((playerIds, i) => ({
			id: i + 1,
			name: names[i],
			questionIds: playerIds.map((pid) => questionIdByPlayerId.get(pid)).filter((id): id is number => id !== undefined),
		}))
		.filter((set) => set.questionIds.length === questionsPerRound);
}

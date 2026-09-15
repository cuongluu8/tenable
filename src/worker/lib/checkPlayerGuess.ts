import { normalize, collapseToAlnum } from "./normalize";

export interface PlayerGuessResult {
	result: "correct" | "wrong";
	name: string;
}

// Validates a guess against the mystery player behind one "name the
// player" question row -- shared by club-badges' and teammates'
// /check-guess, which grade a guess the exact same way (canonical name
// OR any curated alias, compared on collapseToAlnum(normalize(...)));
// only which table maps question id -> player_id differs between them.
//
// `questionsTable` is always one of this app's own two literal table
// names, passed by the route itself -- never derived from the request
// body -- so interpolating it into the query is safe; D1's `?`
// placeholders can't parameterize a table name at all.
//
// Returns null when the question id doesn't resolve to a row, or that
// row's player has no entities record -- the caller turns that into its
// own 404 (kept as the route's call, not this helper's, since the two
// routes' error responses aren't guaranteed to stay identical just
// because they happen to match today).
//
// All three queries are id-keyed / indexed-FK lookups -- no scans.
export async function checkPlayerGuess(
	db: D1Database,
	questionsTable: "club_badge_questions" | "teammate_questions",
	questionId: number,
	guess: { giveUp: true } | { guess: string },
): Promise<PlayerGuessResult | null> {
	const question = await db
		.prepare(`SELECT player_id FROM ${questionsTable} WHERE id = ?`)
		.bind(questionId)
		.first<{ player_id: number }>();
	if (!question) return null;

	const [player, aliasRows] = await Promise.all([
		db.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(question.player_id).first<{
			canonical_name: string;
		}>(),
		db.prepare("SELECT alias FROM entity_aliases WHERE entity_id = ?").bind(question.player_id).all<{
			alias: string;
		}>(),
	]);
	if (!player) return null;

	// Give-up: skips the guess/matching below entirely and always grades
	// as wrong -- still returns the real answer, same as any other wrong
	// guess, just without needing a guess string to compare against nothing.
	const givingUp = "giveUp" in guess;
	const matchStrings = [player.canonical_name, ...(aliasRows.results ?? []).map((r) => r.alias)];
	const isCorrect = !givingUp && matchStrings.some((s) => collapseToAlnum(s) === collapseToAlnum(normalize(guess.guess)));

	return {
		result: isCorrect ? "correct" : "wrong",
		name: player.canonical_name,
	};
}

// ---- Grading inside the session object (2026-09-15) ----
//
// A remote round's answer, resolved ONCE at /start and kept in the
// session object so a guess is graded in memory -- checkPlayerGuess()
// above round-trips to D1 three times per guess, which the load test
// measured as ~230 ms per guess against ~50 ms for every other action
// (docs/scaling.md §5f). Same rule as above: canonical name or any
// curated alias, compared on collapseToAlnum(normalize(...)). `keys`
// are the pre-collapsed match strings; `name` is what's revealed.
export interface RoundAnswer {
	name: string;
	keys: string[];
}

export function gradeGuess(answer: RoundAnswer, guess: string): boolean {
	const key = collapseToAlnum(normalize(guess));
	return key.length > 0 && answer.keys.includes(key);
}

// Every picked question's answer in two indexed queries (names, aliases),
// keyed by player id. A player missing an entities row is simply absent
// -- the caller falls back to checkPlayerGuess() for that question.
export async function loadRoundAnswers(db: D1Database, playerIds: number[]): Promise<Map<number, RoundAnswer>> {
	const ids = [...new Set(playerIds)];
	const out = new Map<number, RoundAnswer>();
	if (ids.length === 0) return out;
	const marks = ids.map(() => "?").join(",");
	const [names, aliases] = await Promise.all([
		db.prepare(`SELECT id, canonical_name FROM entities WHERE id IN (${marks})`).bind(...ids).all<{ id: number; canonical_name: string }>(),
		db.prepare(`SELECT entity_id, alias FROM entity_aliases WHERE entity_id IN (${marks})`).bind(...ids).all<{ entity_id: number; alias: string }>(),
	]);
	for (const row of names.results ?? []) out.set(row.id, { name: row.canonical_name, keys: [collapseToAlnum(row.canonical_name)] });
	for (const row of aliases.results ?? []) out.get(row.entity_id)?.keys.push(collapseToAlnum(row.alias));
	return out;
}

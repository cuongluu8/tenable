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

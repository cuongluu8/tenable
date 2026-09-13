// Question selection + assembly for "Teammate Tell" ("who am I? I played
// with..."), shared by teammates.ts's own GET /round (single-device) and
// RemoteGameSession's question-serving (a host-chosen count) -- split out
// of teammates.ts (2026-09-13) for the same reason clubBadgeRound.ts was
// split out of clubBadges.ts: remote play reuses the exact same assembly
// rather than a second, drifting copy. See build_teammate_questions.py
// for where the rows themselves come from.

export interface TeammateQuestionRow {
	id: number;
	player_id: number;
	teammate_ids: string; // JSON array of teammate entity ids
	hints: string | null; // JSON Hints, or null for a pre-2026-09-10 row
}

interface Hints {
	clubs: string[];
	clubImages: (string | null)[];
	nationality: string | null;
	years: string[];
}

// One clue's hint data -- nullable so a caller that withholds hints
// server-side (RemoteGameSession's publicQuestion) can send the same
// shape with the gated fields blanked; teammates.ts's own /round always
// fills them (the single-device client hides them itself).
export interface TeammateCardHintPublic {
	club: string | null;
	image: string | null; // ready /api/media URL, or null if no badge sourced
	years: string | null; // overlap years, e.g. "2019–2021"
}

// One question, with nothing that gives the answer away -- the mystery
// player's own name/id is never included, only the clue names.
export interface TeammateQuestionPublic {
	id: number;
	teammates: string[];
	// Parallel to `teammates`: hint 1 reveals club + image, hint 3 the
	// overlap years. Empty when the row has no hints yet.
	cardHints: TeammateCardHintPublic[];
	nationality: string | null; // Hint 2.
}

// Fisher-Yates, take the first N -- same as clubBadgeRound.ts's own picker.
export function pickRandomTeammateQuestions(all: TeammateQuestionRow[], count: number): TeammateQuestionRow[] {
	const shuffled = [...all];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
}

// Builds the public payload for already-selected rows. One IN() over
// entities for every clue id across the picked rows -- at most
// QUESTIONS_PER_ROUND * 6 = 60 ids for a full single-device round, well
// under D1's variable cap; remote play's MAX_QUESTION_COUNT of 20 is
// bounded the same way. Nothing here scans entities.
export async function buildTeammateQuestions(db: D1Database, picked: TeammateQuestionRow[]): Promise<TeammateQuestionPublic[]> {
	if (picked.length === 0) return [];

	const clueIds = [...new Set(picked.flatMap((q) => JSON.parse(q.teammate_ids) as number[]))];
	const { results: nameRows } = await db
		.prepare(`SELECT id, canonical_name FROM entities WHERE id IN (${clueIds.map(() => "?").join(",")})`)
		.bind(...clueIds)
		.all<{ id: number; canonical_name: string }>();
	const nameById = new Map((nameRows ?? []).map((r) => [r.id, r.canonical_name]));

	return picked.map((q) => {
		const names = (JSON.parse(q.teammate_ids) as number[]).map((tid) => nameById.get(tid) ?? "Unknown");
		const h = q.hints ? (JSON.parse(q.hints) as Hints) : null;
		return {
			id: q.id,
			teammates: names,
			cardHints: h
				? h.clubs.map((club, i) => ({
						club: club ?? "?",
						image: h.clubImages[i] ? `/api/media/${h.clubImages[i]}` : null,
						years: h.years[i] ?? "?",
					}))
				: [],
			nationality: h?.nationality ?? null,
		};
	});
}

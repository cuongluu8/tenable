import { Hono } from "hono";
import { normalize, collapseToAlnum } from "../lib/normalize";
import { TEAMMATE_SETS, TEAMMATE_SET_NAMES } from "../lib/teammateSets";

const teammates = new Hono<{ Bindings: Env }>();

// A full round's size -- same as club-badges, and doubles as Sets mode's
// "is this set actually complete" threshold below (/sets), same as
// clubBadges.ts.
const QUESTIONS_PER_ROUND = 10;

interface QuestionRow {
	id: number;
	player_id: number;
	teammate_ids: string;
	hints: string | null;
}

interface Hints {
	clubs: string[];
	clubImages: (string | null)[];
	nationality: string | null;
	years: string[];
}

// GET /api/teammates/round  -- 10 "who am I? I played with..." questions.
// The mystery player's own name/id is never sent -- just the clue names,
// plus the hint pieces per question: `cardHints` (each clue's club +
// badge + overlap years, shown IN its card by hints 1 and 3) and
// `nationality` (hint 2, shown as text). The client reveals one hint at a
// time for a 15-point penalty each, same as club-badges. Clue count
// varies 3-6, one per club the mystery player was at -- see
// build_teammate_questions.py.
//
// ?setId=N (1-indexed) hands back exactly one curated set's questions (see
// teammateSets.ts), in that FIXED order rather than shuffled, so "Set 3"
// means the same ten every time -- TeammateSetPlay.tsx's own view. The
// response then also carries `setName` ("Candid Ibex" etc). With no
// setId it's a fresh random 10. ?playerId=N forces one player's question
// (dev/test escape hatch, same as clubBadges /round).
//
// D1 cost: teammate_questions is a small curated table (few hundred rows,
// only grows by manual re-derivation) -- an unfiltered SELECT of it is
// deliberate and cheap, same call shape as clubBadges /round. The name
// lookup binds at most QUESTIONS_PER_ROUND * 6 = 60 ids in one IN(),
// well under D1's variable cap. Nothing here scans entities/entity_aliases.
teammates.get("/round", async (c) => {
	const { results: all } = await c.env.DB
		.prepare("SELECT id, player_id, teammate_ids, hints FROM teammate_questions")
		.all<QuestionRow>();
	if (!all || all.length === 0) {
		return c.json({ error: "No teammate questions available" }, 500);
	}

	const rawSetId = c.req.query("setId");
	const setIndex = rawSetId ? Number(rawSetId) - 1 : NaN;
	const set = Number.isInteger(setIndex) ? TEAMMATE_SETS[setIndex] : undefined;
	// Dev/test-only: ?playerId=552 forces that one player's question, same
	// escape hatch clubBadges /round has.
	const forcedPlayerId = c.req.query("playerId");
	let picked: QuestionRow[];
	if (set) {
		const byPlayerId = new Map(all.map((q) => [q.player_id, q]));
		// .filter mirrors clubBadges /round: a set referencing a player
		// whose teammate_questions row got deleted just shrinks that set by
		// one, it doesn't 500 the page.
		picked = set.map((pid) => byPlayerId.get(pid)).filter((q): q is QuestionRow => q !== undefined);
	} else if (forcedPlayerId) {
		picked = all.filter((q) => q.player_id === Number(forcedPlayerId));
	} else {
		picked = [...all].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
	}
	if (picked.length === 0) {
		return c.json({ error: "No matching question" }, 404);
	}

	const clueIds = [...new Set(picked.flatMap((q) => JSON.parse(q.teammate_ids) as number[]))];
	const { results: nameRows } = await c.env.DB
		.prepare(`SELECT id, canonical_name FROM entities WHERE id IN (${clueIds.map(() => "?").join(",")})`)
		.bind(...clueIds)
		.all<{ id: number; canonical_name: string }>();
	const nameById = new Map((nameRows ?? []).map((r) => [r.id, r.canonical_name]));

	const questions = picked.map((q) => {
		const names = (JSON.parse(q.teammate_ids) as number[]).map((tid) => nameById.get(tid) ?? "Unknown");
		const h = q.hints ? (JSON.parse(q.hints) as Hints) : null;
		return {
			id: q.id,
			// Clue cards show names only -- club/nationality/years withheld
			// behind the hints.
			teammates: names,
			// The per-clue hint data, parallel to `teammates`: hint 1 drops
			// the club + badge into each card, hint 3 the overlap years.
			// `image` is a ready /api/media URL (or null if not sourced).
			cardHints: h
				? h.clubs.map((club, i) => ({
						club: club ?? "?",
						image: h.clubImages[i] ? `/api/media/${h.clubImages[i]}` : null,
						years: h.years[i] ?? "?",
					}))
				: [],
			// Hint 2 -- a single value, shown as text below the cards.
			nationality: h?.nationality ?? null,
		};
	});
	return c.json({ setName: set ? TEAMMATE_SET_NAMES[setIndex] : undefined, questions });
});

// GET /api/teammates/sets  -- Sets mode's index (TeammateSets.tsx, the
// set-picker). One call to learn how many sets exist and which
// teammate_questions.id sits in each slot, so the picker can show
// "7/10 done" and a finished set's average score straight from
// localStorage (teammateSetsStorage.ts) with no per-set round trip.
// questionIds only, never a player id or name -- same non-spoiler
// reasoning as clubBadges /sets. Small unfiltered SELECT, no scans.
teammates.get("/sets", async (c) => {
	const { results } = await c.env.DB
		.prepare("SELECT id, player_id FROM teammate_questions")
		.all<{ id: number; player_id: number }>();
	const questionIdByPlayerId = new Map((results ?? []).map((r) => [r.player_id, r.id]));

	const sets = TEAMMATE_SETS.map((playerIds, i) => ({
		id: i + 1,
		name: TEAMMATE_SET_NAMES[i],
		// .filter mirrors clubBadges /sets: a set referencing a now-missing
		// player quietly shrinks rather than crashing, and any set that
		// ends up under a full ten is hidden from the picker (all 11 are a
		// full ten today -- see teammateSets.ts).
		questionIds: playerIds
			.map((pid) => questionIdByPlayerId.get(pid))
			.filter((id): id is number => id !== undefined),
	})).filter((set) => set.questionIds.length === QUESTIONS_PER_ROUND);

	return c.json({ sets });
});

interface CheckGuessBody {
	questionId?: number;
	guess?: string;
	giveUp?: boolean;
}

// POST /api/teammates/check-guess  -- server-authoritative: the answer
// (mystery player name) is never on the client, so this is the only place
// a guess is validated. Same matching as clubBadges /check-guess
// (canonical name OR any curated alias, compared on collapseToAlnum).
// All three queries are id-keyed / indexed-FK lookups -- no scans.
teammates.post("/check-guess", async (c) => {
	const body = await c.req.json<CheckGuessBody>().catch(() => ({}) as CheckGuessBody);
	if (!Number.isInteger(body.questionId)) {
		return c.json({ error: "Missing question id" }, 400);
	}
	const givingUp = body.giveUp === true;
	const rawGuess = (body.guess ?? "").trim();
	if (!givingUp && !rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const question = await c.env.DB.prepare("SELECT player_id FROM teammate_questions WHERE id = ?")
		.bind(body.questionId)
		.first<{ player_id: number }>();
	if (!question) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const [player, aliasRows] = await Promise.all([
		c.env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?")
			.bind(question.player_id)
			.first<{ canonical_name: string }>(),
		c.env.DB.prepare("SELECT alias FROM entity_aliases WHERE entity_id = ?")
			.bind(question.player_id)
			.all<{ alias: string }>(),
	]);
	if (!player) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const collapsedGuess = collapseToAlnum(normalize(rawGuess));
	const matchStrings = [player.canonical_name, ...(aliasRows.results ?? []).map((r) => r.alias)];
	const isCorrect = !givingUp && matchStrings.some((s) => collapseToAlnum(s) === collapsedGuess);

	return c.json({
		result: (isCorrect ? "correct" : "wrong") as "correct" | "wrong",
		name: player.canonical_name,
	});
});

export default teammates;

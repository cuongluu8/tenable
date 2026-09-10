import { Hono } from "hono";
import { normalize, collapseToAlnum } from "../lib/normalize";

const teammates = new Hono<{ Bindings: Env }>();

// A full round's size -- same as club-badges, and same "10 random draws
// from the whole pool at play time" model (no daily-locked set here).
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

// GET /api/teammates/round  -- 10 random "who am I? I played with..."
// questions. The mystery player's own name/id is never sent -- just the
// clue names, plus the three hint pieces per question (clubHint with a
// badge image per clue, the mystery player's nationality, the overlap
// years), which the client reveals one at a time for a 15-point penalty
// each, same as club-badges. Clue count varies 3-6, one per club the
// mystery player was at -- see build_teammate_questions.py.
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

	// Dev/test-only: ?playerId=552 forces that one player's question, same
	// escape hatch clubBadges /round has.
	const forcedPlayerId = c.req.query("playerId");
	let picked: QuestionRow[];
	if (forcedPlayerId) {
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
			// Hint 1: the club each clue was a teammate at, with its badge,
			// in the SAME order as `teammates` -- the client lines them up
			// positionally, so no need to repeat the names. `image` is a
			// ready /api/media URL (or null if not sourced).
			clubHint: h
				? h.clubs.map((club, i) => ({
						club: club ?? "?",
						image: h.clubImages[i] ? `/api/media/${h.clubImages[i]}` : null,
					}))
				: [],
			// Hint 2 (raw) and hint 3 (pre-joined) -- the client wraps these.
			nationality: h?.nationality ?? null,
			yearHint: h ? names.map((n, i) => `${n} — ${h.years[i] ?? "?"}`).join(" · ") : "",
		};
	});
	return c.json({ questions });
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

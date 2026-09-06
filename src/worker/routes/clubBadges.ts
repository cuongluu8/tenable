import { Hono } from "hono";
import { normalize, collapseToAlnum, toFtsPrefixQuery } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/suggestRateLimit";

const clubBadges = new Hono<{ Bindings: Env }>();

const QUESTIONS_PER_ROUND = 10;

interface QuestionRow {
	id: number;
	player_id: number;
	club_sequence: string; // JSON array of club entity ids
}

// "Guess the player from the clubs they played for" -- same stateless,
// client-holds-the-round philosophy as multiplayer.ts: no session to
// persist, no device id, the server's only job is (1) hand out a random
// round's worth of question shells with nothing that gives the answer away,
// and (2) grade a guess against the one question it names. See
// db/schema.sql's club_badge_questions comment for why this is a curated
// pool sampled at play time rather than a daily-locked "today's 10" the way
// categories work.
clubBadges.get("/round", async (c) => {
	// Only questions whose every club currently has a sourced badge are
	// eligible -- a question with even one missing image would either show
	// a broken image or give the answer away by omission (fewer badges than
	// the player actually has clubs for makes the sequence look wrong).
	// Filtered in JS rather than SQL: club_sequence is a JSON array, and at
	// ~107 rows total this is nowhere near worth a json_each query.
	const [{ results: questions }, { results: clubs }] = await Promise.all([
		c.env.DB.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions").all<QuestionRow>(),
		c.env.DB
			.prepare("SELECT id FROM entities WHERE entity_type = 'club' AND image_key IS NOT NULL")
			.all<{ id: number }>(),
	]);

	const clubsWithBadges = new Set((clubs ?? []).map((r) => r.id));
	const eligible = (questions ?? []).filter((q) => {
		const clubIds: number[] = JSON.parse(q.club_sequence);
		return clubIds.length > 0 && clubIds.every((id) => clubsWithBadges.has(id));
	});

	// Fisher-Yates, take the first N -- fine at this scale (well under
	// a couple hundred rows) and avoids ORDER BY RANDOM() needing to
	// shuffle the JSON-filtered subset back in SQL.
	for (let i = eligible.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[eligible[i], eligible[j]] = [eligible[j], eligible[i]];
	}
	const picked = eligible.slice(0, QUESTIONS_PER_ROUND);

	if (picked.length === 0) {
		return c.json({ questions: [] });
	}

	const allClubIds = [...new Set(picked.flatMap((q): number[] => JSON.parse(q.club_sequence)))];
	const placeholders = allClubIds.map(() => "?").join(",");
	const { results: clubRows } = await c.env.DB
		.prepare(`SELECT id, image_key FROM entities WHERE id IN (${placeholders})`)
		.bind(...allClubIds)
		.all<{ id: number; image_key: string }>();
	const imageKeyById = new Map((clubRows ?? []).map((r) => [r.id, r.image_key]));

	return c.json({
		questions: picked.map((q) => ({
			id: q.id,
			// Deliberately no player_id/name here -- that's the answer.
			badgeUrls: (JSON.parse(q.club_sequence) as number[]).map((clubId) => `/api/media/${imageKeyById.get(clubId)}`),
		})),
	});
});

interface CheckGuessBody {
	questionId?: number;
	guess?: string;
}

clubBadges.post("/check-guess", async (c) => {
	const body = await c.req.json<CheckGuessBody>().catch(() => ({}) as CheckGuessBody);

	const questionId = body.questionId;
	if (!Number.isInteger(questionId)) {
		return c.json({ error: "Missing question id" }, 400);
	}
	const rawGuess = (body.guess ?? "").trim();
	if (!rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const question = await c.env.DB.prepare("SELECT player_id, club_sequence FROM club_badge_questions WHERE id = ?")
		.bind(questionId)
		.first<{ player_id: number; club_sequence: string }>();
	if (!question) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const clubIds: number[] = JSON.parse(question.club_sequence);
	const placeholders = clubIds.map(() => "?").join(",");

	const [player, aliasRows, clubRows] = await Promise.all([
		c.env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(question.player_id).first<{
			canonical_name: string;
		}>(),
		c.env.DB.prepare("SELECT alias FROM entity_aliases WHERE entity_id = ?").bind(question.player_id).all<{
			alias: string;
		}>(),
		c.env.DB
			.prepare(`SELECT id, canonical_name FROM entities WHERE id IN (${placeholders})`)
			.bind(...clubIds)
			.all<{ id: number; canonical_name: string }>(),
	]);

	if (!player) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const collapsedGuess = collapseToAlnum(normalize(rawGuess));
	const matchStrings = [player.canonical_name, ...(aliasRows.results ?? []).map((r) => r.alias)];
	const isCorrect = matchStrings.some((s) => collapseToAlnum(s) === collapsedGuess);

	const namesById = new Map((clubRows.results ?? []).map((r) => [r.id, r.canonical_name]));
	const clubNames = clubIds.map((id) => namesById.get(id) ?? "Unknown");

	// The correct name + full club list are revealed either way ("results
	// shown after each question" applies to a wrong guess too, same as a
	// normal quiz reveal) -- only the `result` field tells the client
	// whether to count it as a point.
	return c.json({
		result: (isCorrect ? "correct" : "wrong") as "correct" | "wrong",
		name: player.canonical_name,
		clubNames,
	});
});

// Typeahead scoped to players, for the guess box -- reuses the same
// suggestNames() the category-based /api/suggest route does, just without
// needing a fake categories row to hang entityType/scope off of (this game
// has no categories row at all).
clubBadges.get("/suggest", enforceSuggestRateLimit, async (c) => {
	const raw = c.req.query("q") ?? "";
	const prefix = normalize(raw.slice(0, 60));
	if (prefix.length < 3 || !toFtsPrefixQuery(prefix)) {
		return c.json({ suggestions: [], truncated: false });
	}

	const { names, truncated } = await suggestNames(c.env.DB, prefix, "player", 20, null);
	return c.json({ suggestions: names, truncated });
});

export default clubBadges;

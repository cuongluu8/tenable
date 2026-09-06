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
	const { results: questions } = await c.env.DB
		.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions")
		.all<QuestionRow>();

	// Fisher-Yates, take the first N -- fine at this scale (~107 rows) and
	// avoids ORDER BY RANDOM() in SQL.
	const shuffled = [...(questions ?? [])];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	const picked = shuffled.slice(0, QUESTIONS_PER_ROUND);

	if (picked.length === 0) {
		return c.json({ questions: [] });
	}

	// Every question is eligible regardless of badge coverage -- a club with
	// no image_key (not sourced yet, or a stale URL that 404s at render
	// time) degrades to a text placeholder client-side (see
	// ClubBadgesPlay.tsx) rather than the question being excluded outright.
	// club names are sent alongside each badge on purpose: they're not the
	// answer (the player is), so showing one as text when its image is
	// missing gives away nothing a working badge wouldn't have anyway.
	const allClubIds = [...new Set(picked.flatMap((q): number[] => JSON.parse(q.club_sequence)))];
	const placeholders = allClubIds.map(() => "?").join(",");
	const { results: clubRows } = await c.env.DB
		.prepare(`SELECT id, canonical_name, image_key FROM entities WHERE id IN (${placeholders})`)
		.bind(...allClubIds)
		.all<{ id: number; canonical_name: string; image_key: string | null }>();
	const clubById = new Map((clubRows ?? []).map((r) => [r.id, r]));

	return c.json({
		questions: picked.map((q) => ({
			id: q.id,
			// Deliberately no player_id/name here -- that's the answer.
			badges: (JSON.parse(q.club_sequence) as number[]).map((clubId) => {
				const club = clubById.get(clubId);
				return {
					name: club?.canonical_name ?? "Unknown club",
					url: club?.image_key ? `/api/media/${club.image_key}` : null,
				};
			}),
		})),
	});
});

interface CheckGuessBody {
	questionId?: number;
	guess?: string;
	// Give-up: skips the guess requirement/matching below entirely and
	// always grades as wrong -- still returns the real answer, same as any
	// other wrong guess (see the shared response comment below), just
	// without needing a guess string to compare against nothing.
	giveUp?: boolean;
}

clubBadges.post("/check-guess", async (c) => {
	const body = await c.req.json<CheckGuessBody>().catch(() => ({}) as CheckGuessBody);

	const questionId = body.questionId;
	if (!Number.isInteger(questionId)) {
		return c.json({ error: "Missing question id" }, 400);
	}
	const givingUp = body.giveUp === true;
	const rawGuess = (body.guess ?? "").trim();
	if (!givingUp && !rawGuess) {
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
	const isCorrect = !givingUp && matchStrings.some((s) => collapseToAlnum(s) === collapsedGuess);

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

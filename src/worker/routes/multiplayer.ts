import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { getAllAnswers, getCategoryBySlug, matchGuess } from "../lib/categories";

const multiplayer = new Hono<{ Bindings: Env }>();

interface CheckGuessBody {
	categorySlug?: string;
	guess?: string;
	foundRanks?: number[];
}

// The entire multiplayer v1 backend: single-device pass-and-play keeps the
// whole game (players, turn order, lives, found ranks) as plain React state
// in the browser — see the plan this was built from — so the only thing
// that has to happen server-side at all is checking a guess, since answers
// live in D1 and must stay server-authoritative (the same reason
// src/worker/routes/guess.ts exists). Deliberately stateless: no KV write,
// no device-id cookie, no persisted session. Reuses the exact same
// getCategoryBySlug/matchGuess/normalize building blocks guess.ts already
// uses, so guess-matching behavior (obscure aliases, punctuation, case)
// stays identical between single- and multi-player without duplicating that
// logic — but never imports guess.ts, progressStore.ts, or the single-player
// Progress type, keeping this fully decoupled from that code path.
multiplayer.post("/check-guess", async (c) => {
	const body = await c.req.json<CheckGuessBody>().catch(() => ({}) as CheckGuessBody);

	const categorySlug = body.categorySlug;
	if (!categorySlug) {
		return c.json({ error: "Missing category slug" }, 400);
	}

	const rawGuess = (body.guess ?? "").trim();
	if (!rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const foundRanks = Array.isArray(body.foundRanks) ? body.foundRanks.filter((r) => Number.isInteger(r)) : [];

	const category = await getCategoryBySlug(c.env.DB, categorySlug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const normalized = normalize(rawGuess);
	const match = await matchGuess(c.env.DB, category.id, normalized, foundRanks);

	if (!match) {
		return c.json({ result: "wrong" as const });
	}
	if (foundRanks.includes(match.rank)) {
		return c.json({ result: "duplicate" as const });
	}
	return c.json({
		result: "correct" as const,
		rank: match.rank,
		name: match.canonical_name,
		statValue: match.stat_value,
	});
});

// Full answer list for a category, once a round is over — used by the
// finished screen to show what every player missed (see
// MultiplayerResult.tsx). Unlike single-player's /api/reveal/:slug, this is
// NOT gated on a persisted "is this round actually complete" check: there's
// no server-side session to check it against (multiplayer keeps the whole
// round in browser state — see the module doc above), and the client only
// ever calls this once its own local state has already reached "finished".
// A player who wanted to see the list early could already do that by
// hitting /api/multiplayer/check-guess with every candidate name in a
// category, so this route doesn't introduce a new way to spoil the round
// that a determined cheater didn't already have; it just makes the honest
// post-game path a GET instead of that.
multiplayer.get("/reveal/:slug", async (c) => {
	const slug = c.req.param("slug");

	const category = await getCategoryBySlug(c.env.DB, slug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const answers = await getAllAnswers(c.env.DB, category.id);
	return c.json({
		answers: answers.map((a) => ({
			rank: a.rank,
			name: a.canonical_name,
			statValue: a.stat_value,
		})),
	});
});

export default multiplayer;

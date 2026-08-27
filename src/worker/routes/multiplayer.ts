import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { getCategoryBySlug, matchGuess } from "../lib/categories";

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

export default multiplayer;

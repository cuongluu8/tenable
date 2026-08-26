import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { todayKey } from "../lib/dailyKey";
import { normalize } from "../lib/normalize";
import { getCategoryBySlug, getAnswerCount, matchGuess } from "../lib/categories";
import {
	getProgress,
	startProgress,
	saveProgress,
	recordCompletion,
} from "../lib/progressStore";
import { TENSION_LIVES, type Mode } from "../lib/types";

const guess = new Hono<{ Bindings: Env }>();

interface GuessBody {
	slug?: string;
	guess?: string;
	mode?: Mode;
}

guess.post("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);
	const body = await c.req.json<GuessBody>().catch(() => ({}) as GuessBody);

	const slug = body.slug;
	if (!slug) {
		return c.json({ error: "Missing category slug" }, 400);
	}

	const category = await getCategoryBySlug(c.env.DB, slug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	let progress = await getProgress(c.env.PROGRESS, deviceId, slug);
	if (!progress) {
		const mode: Mode = body.mode === "tension" ? "tension" : "classic";
		progress = await startProgress(c.env.PROGRESS, deviceId, slug, mode);
	}

	if (progress.completed) {
		return c.json({ error: "This category is already finished" }, 409);
	}

	const rawGuess = (body.guess ?? "").trim();
	if (!rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const answerCount = await getAnswerCount(c.env.DB, category.id);
	const normalized = normalize(rawGuess);
	const match = await matchGuess(c.env.DB, category.id, normalized, progress.foundRanks);

	let result: "correct" | "duplicate" | "wrong";

	if (match && progress.foundRanks.includes(match.rank)) {
		result = "duplicate";
	} else if (match) {
		result = "correct";
		progress.foundRanks.push(match.rank);
	} else {
		result = "wrong";
		progress.wrongGuesses += 1;
	}

	const outOfLives =
		progress.mode === "tension" && progress.wrongGuesses >= TENSION_LIVES;
	const foundAll = progress.foundRanks.length >= answerCount;

	if (foundAll || outOfLives) {
		progress.completed = true;
		progress.won = foundAll;
		progress.completedAt = new Date().toISOString();
	}

	await saveProgress(c.env.PROGRESS, deviceId, slug, progress);

	let streakUpdate = null;
	if (progress.completed) {
		streakUpdate = await recordCompletion(
			c.env.PROGRESS,
			deviceId,
			todayKey(),
			progress.won,
		);
	}

	return c.json({
		result,
		found:
			match && result === "correct"
				? { rank: match.rank, name: match.canonical_name, statValue: match.stat_value }
				: null,
		progress,
		livesRemaining:
			progress.mode === "tension" ? TENSION_LIVES - progress.wrongGuesses : null,
		streak: streakUpdate?.streak ?? null,
		lifetime: streakUpdate?.lifetime ?? null,
	});
});

export default guess;

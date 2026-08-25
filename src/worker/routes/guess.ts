import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { todayKey } from "../lib/dailyKey";
import { normalize } from "../lib/normalize";
import {
	getCategoryForDate,
	getAnswerCount,
	matchGuess,
} from "../lib/categories";
import {
	getProgress,
	startProgress,
	saveProgress,
	recordCompletion,
} from "../lib/progressStore";
import { TENSION_LIVES, type Mode } from "../lib/types";

const guess = new Hono<{ Bindings: Env }>();

interface GuessBody {
	guess?: string;
	mode?: Mode;
}

guess.post("/", async (c) => {
	const date = todayKey();
	const deviceId = getOrSetDeviceId(c);
	const body = await c.req.json<GuessBody>().catch(() => ({}) as GuessBody);

	const category = await getCategoryForDate(c.env.DB, date);
	if (!category) {
		return c.json({ error: "No puzzle scheduled for today" }, 404);
	}

	let progress = await getProgress(c.env.PROGRESS, deviceId, date);
	if (!progress) {
		const mode: Mode = body.mode === "tension" ? "tension" : "classic";
		progress = await startProgress(c.env.PROGRESS, deviceId, date, mode);
	}

	if (progress.completed) {
		return c.json({ error: "Today's round is already finished" }, 409);
	}

	const rawGuess = (body.guess ?? "").trim();
	if (!rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const answerCount = await getAnswerCount(c.env.DB, category.id);
	const normalized = normalize(rawGuess);
	const match = await matchGuess(c.env.DB, category.id, normalized);

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

	await saveProgress(c.env.PROGRESS, deviceId, date, progress);

	let streak = null;
	if (progress.completed) {
		streak = await recordCompletion(c.env.PROGRESS, deviceId, date, progress.won);
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
		streak,
	});
});

export default guess;

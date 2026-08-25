import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getCategoryBySlug, getAnswerCount, getAllAnswers, toPublic } from "../lib/categories";
import { getProgress } from "../lib/progressStore";

const category = new Hono<{ Bindings: Env }>();

// A single category (answers withheld) plus this device's progress on it,
// if any. Used both to start a fresh round and to resume/review one.
category.get("/:slug", async (c) => {
	const slug = c.req.param("slug");
	const deviceId = getOrSetDeviceId(c);

	const row = await getCategoryBySlug(c.env.DB, slug);
	if (!row) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const [answerCount, progress] = await Promise.all([
		getAnswerCount(c.env.DB, row.id),
		getProgress(c.env.PROGRESS, deviceId, slug),
	]);

	// Resuming a round in a new session only carries the found *ranks*
	// (see progressStore) — without this, the client has no way to know the
	// names behind already-correct guesses and would render those slots
	// green with nothing in them. Safe to send: these are ranks the player
	// already guessed correctly, not ranks they haven't found yet.
	let foundAnswers: { rank: number; name: string; statValue: string }[] = [];
	if (progress && progress.foundRanks.length > 0) {
		const allAnswers = await getAllAnswers(c.env.DB, row.id);
		foundAnswers = allAnswers
			.filter((a) => progress.foundRanks.includes(a.rank))
			.map((a) => ({ rank: a.rank, name: a.canonical_name, statValue: a.stat_value }));
	}

	return c.json({
		category: toPublic(row, answerCount),
		progress,
		foundAnswers,
	});
});

export default category;

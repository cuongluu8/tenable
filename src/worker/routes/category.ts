import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getCategoryBySlug, getCategoryMeta, getAllAnswers, toPublic } from "../lib/categories";
import { cachedContentQuery } from "../lib/responseCache";
import { getProgress } from "../lib/progressStore";

const category = new Hono<{ Bindings: Env }>();

// A single category (answers withheld) plus this device's progress on it,
// if any. Used both to start a fresh round and to resume/review one. Same
// split as categories.ts: the category row + its metadata (public, same
// for everyone) is edge-cached; this device's progress from KV is not.
category.get("/:slug", async (c) => {
	const slug = c.req.param("slug");
	const deviceId = getOrSetDeviceId(c);

	const row = await cachedContentQuery(c.env.DB, c.executionCtx, `category:${slug}`, () =>
		getCategoryBySlug(c.env.DB, slug),
	);
	if (!row) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const [meta, progress] = await Promise.all([
		cachedContentQuery(c.env.DB, c.executionCtx, `category-meta:${slug}`, () =>
			getCategoryMeta(c.env.DB, row.id),
		),
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
		category: toPublic(row, meta.answerCount, meta.asOfDate),
		progress,
		foundAnswers,
	});
});

export default category;

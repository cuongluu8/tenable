import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getCategoryBySlug, getAnswerCount, toPublic } from "../lib/categories";
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

	return c.json({
		category: toPublic(row, answerCount),
		progress,
	});
});

export default category;

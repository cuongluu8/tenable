import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getCategoryBySlug, getAllAnswers } from "../lib/categories";
import { getProgress } from "../lib/progressStore";

const reveal = new Hono<{ Bindings: Env }>();

// Full answer list for a category — only returned once this device's round
// on it is actually completed, so the client can't peek mid-round.
reveal.get("/:slug", async (c) => {
	const slug = c.req.param("slug");
	const deviceId = getOrSetDeviceId(c);

	const category = await getCategoryBySlug(c.env.DB, slug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const progress = await getProgress(c.env.PROGRESS, deviceId, slug);
	if (!progress?.completed) {
		return c.json({ error: "Round not finished yet" }, 403);
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

export default reveal;

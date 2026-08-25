import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { todayKey } from "../lib/dailyKey";
import { getCategoryForDate, getAllAnswers } from "../lib/categories";
import { getProgress } from "../lib/progressStore";

const reveal = new Hono<{ Bindings: Env }>();

// Full answer list for today's category — only returned once this device's
// round is actually completed, so the client can't peek mid-round.
reveal.get("/", async (c) => {
	const date = todayKey();
	const deviceId = getOrSetDeviceId(c);

	const category = await getCategoryForDate(c.env.DB, date);
	if (!category) {
		return c.json({ error: "No puzzle scheduled for today" }, 404);
	}

	const progress = await getProgress(c.env.PROGRESS, deviceId, date);
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

import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { todayKey } from "../lib/dailyKey";
import { getCategoryForDate, getAnswerCount, toPublic } from "../lib/categories";
import { getProgress, getStreak } from "../lib/progressStore";

const daily = new Hono<{ Bindings: Env }>();

// Today's category (answers withheld) plus this device's progress so far
// today, if any, and their current streak.
daily.get("/", async (c) => {
	const date = todayKey();
	const deviceId = getOrSetDeviceId(c);

	const category = await getCategoryForDate(c.env.DB, date);
	if (!category) {
		return c.json({ error: "No puzzle scheduled for today" }, 404);
	}

	const answerCount = await getAnswerCount(c.env.DB, category.id);
	const [progress, streak] = await Promise.all([
		getProgress(c.env.PROGRESS, deviceId, date),
		getStreak(c.env.PROGRESS, deviceId),
	]);

	return c.json({
		date,
		category: toPublic(category, answerCount),
		progress,
		streak,
	});
});

export default daily;

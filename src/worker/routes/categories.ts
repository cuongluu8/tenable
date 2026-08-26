import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getAllCategories, toPublic } from "../lib/categories";
import { listProgressBySlug, getStreak, getLifetimeStats } from "../lib/progressStore";
import type { CategorySummary, CategoryStatus } from "../lib/types";

const categories = new Hono<{ Bindings: Env }>();

// The whole playable library, each category annotated with this device's
// status on it — "new" ones are what the client should offer to play next;
// "won"/"lost" ones are already answered and shown read-only.
categories.get("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);

	const [rows, progressBySlug, streak, lifetime] = await Promise.all([
		getAllCategories(c.env.DB),
		listProgressBySlug(c.env.PROGRESS, deviceId),
		getStreak(c.env.PROGRESS, deviceId),
		getLifetimeStats(c.env.PROGRESS, deviceId),
	]);

	const summaries: CategorySummary[] = rows.map((row) => {
		const progress = progressBySlug.get(row.slug);
		const status: CategoryStatus = !progress
			? "new"
			: !progress.completed
				? "in_progress"
				: progress.won
					? "won"
					: "lost";
		return { ...toPublic(row, row.answer_count), status, group: row.group_label };
	});

	return c.json({ categories: summaries, streak, lifetime });
});

export default categories;

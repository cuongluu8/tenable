import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getAllCategories, toPublic } from "../lib/categories";
import { cachedContentQuery } from "../lib/responseCache";
import { listProgressBySlug, getStreak, getLifetimeStats } from "../lib/progressStore";
import type { CategorySummary, CategoryStatus } from "../lib/types";

const categories = new Hono<{ Bindings: Env }>();

// The whole playable library, each category annotated with this device's
// status on it — "new" ones are what the client should offer to play next;
// "won"/"lost" ones are already answered and shown read-only. The D1 query
// (category metadata, same for everyone) is edge-cached; the KV lookups
// (this device's progress/streak/lifetime) are never cached — see
// responseCache.ts for why those can't share a cache entry.
categories.get("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);

	const [rows, progressBySlug, streak, lifetime] = await Promise.all([
		cachedContentQuery(c.env.DB, c.executionCtx, "categories", () => getAllCategories(c.env.DB)),
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
		return { ...toPublic(row, row.answer_count, row.as_of_date), status, group: row.group_label };
	});

	return c.json({ categories: summaries, streak, lifetime });
});

export default categories;

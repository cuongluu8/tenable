import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { todayKey } from "../lib/dailyKey";
import { getCategoryBySlug } from "../lib/categories";
import { getProgress, saveProgress, recordCompletion } from "../lib/progressStore";

const giveUp = new Hono<{ Bindings: Env }>();

interface GiveUpBody {
	slug?: string;
}

// Ends an in-progress round early, without finding the rest of the
// answers — the only way to close out a classic-mode round short of
// finding all 10 (classic has no lives to run out of), and a faster exit
// from tension than deliberately burning the remaining lives. Scored the
// same as any other non-win: completed=true, won=false, which is exactly
// what a tension loss already looks like, so the client's existing
// completed/won handling (ResultPanel, reveal, category-list "lost"
// status) needs no special case for it.
giveUp.post("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);
	const body = await c.req.json<GiveUpBody>().catch(() => ({}) as GiveUpBody);

	const slug = body.slug;
	if (!slug) {
		return c.json({ error: "Missing category slug" }, 400);
	}

	const category = await getCategoryBySlug(c.env.DB, slug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	const progress = await getProgress(c.env.PROGRESS, deviceId, slug);
	if (!progress) {
		return c.json({ error: "No round in progress for that category" }, 404);
	}
	if (progress.completed) {
		return c.json({ error: "This category is already finished" }, 409);
	}

	progress.completed = true;
	progress.won = false;
	progress.completedAt = new Date().toISOString();
	await saveProgress(c.env.PROGRESS, deviceId, slug, progress);

	const { streak, lifetime } = await recordCompletion(c.env.PROGRESS, deviceId, todayKey(), false);

	return c.json({ progress, streak, lifetime });
});

export default giveUp;

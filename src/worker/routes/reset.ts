import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getCategoryBySlug } from "../lib/categories";
import { deleteProgress } from "../lib/progressStore";

const reset = new Hono<{ Bindings: Env }>();

interface ResetBody {
	slug?: string;
}

// Clears this device's progress for one category so it can be played again
// from scratch — see progressStore.deleteProgress for why this is the only
// way back to a fresh round once one has been started or finished.
// Idempotent: resetting a category with no progress yet (or already reset)
// still succeeds, since the end state either way is "no progress record".
reset.post("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);
	const body = await c.req.json<ResetBody>().catch(() => ({}) as ResetBody);

	const slug = body.slug;
	if (!slug) {
		return c.json({ error: "Missing category slug" }, 400);
	}

	const category = await getCategoryBySlug(c.env.DB, slug);
	if (!category) {
		return c.json({ error: "Unknown category" }, 404);
	}

	await deleteProgress(c.env.PROGRESS, deviceId, slug);

	return c.json({ ok: true });
});

export default reset;

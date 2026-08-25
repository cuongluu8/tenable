import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getStreak } from "../lib/progressStore";

const stats = new Hono<{ Bindings: Env }>();

stats.get("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);
	const streak = await getStreak(c.env.PROGRESS, deviceId);
	return c.json({ streak });
});

export default stats;

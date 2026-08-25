import { Hono } from "hono";
import { getOrSetDeviceId } from "../lib/device";
import { getStreak, getLifetimeStats } from "../lib/progressStore";

const stats = new Hono<{ Bindings: Env }>();

stats.get("/", async (c) => {
	const deviceId = getOrSetDeviceId(c);
	const [streak, lifetime] = await Promise.all([
		getStreak(c.env.PROGRESS, deviceId),
		getLifetimeStats(c.env.PROGRESS, deviceId),
	]);
	return c.json({ streak, lifetime });
});

export default stats;

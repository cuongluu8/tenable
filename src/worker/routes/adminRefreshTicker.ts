import { Hono } from "hono";
import { getEplTickerMessage, refreshEplTicker } from "../lib/eplTicker";

const adminRefreshTicker = new Hono<{ Bindings: Env }>();

// Unlisted admin action (no link to it anywhere in the app nav, same
// obscurity-only "protection" as media-audit.ts) -- forces an immediate
// run of the same refresh the */15 Cron Trigger does on its own schedule
// (see lib/eplTicker.ts), so a newly-set FOOTBALL_DATA_API_KEY secret (or
// any other "did this actually work" question) can be checked right away
// instead of waiting up to 15 minutes for the next natural tick. POST,
// not GET, since -- unlike media-audit's read-only page -- this has a
// real side effect (an external API call, a KV write); a GET here could
// otherwise fire from something as innocuous as link prefetching.
//
// POST /api/admin/refresh-ticker
adminRefreshTicker.post("/", async (c) => {
	await refreshEplTicker(c.env.PROGRESS, c.env.FOOTBALL_DATA_API_KEY);
	const message = await getEplTickerMessage(c.env.PROGRESS);
	return c.json({ message });
});

export default adminRefreshTicker;

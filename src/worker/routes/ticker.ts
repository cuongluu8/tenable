import { Hono } from "hono";
import { getEplTickerMessage } from "../lib/eplTicker";

const ticker = new Hono<{ Bindings: Env }>();

// The scrolling ticker banner (components/Ticker.tsx) has two sources,
// checked in order:
//   1. TICKER_MESSAGE (wrangler.json) -- a manual override for a one-off
//      announcement (a birthday shout-out, etc.), changeable without a
//      code change; see wrangler.json's own comment on live-override vs.
//      redeploy. Deliberately wins whenever it's set: it's someone
//      explicitly saying "show this instead", so it should always beat
//      the automatic default below.
//   2. The latest Premier League scores, kept fresh in KV by a Cron
//      Trigger (see lib/eplTicker.ts) -- this is what shows the rest of
//      the time, i.e. whenever TICKER_MESSAGE is cleared to "".
// Trimmed and possibly empty either way; the client hides the ticker
// entirely rather than rendering an empty bar when it is.
ticker.get("/", async (c) => {
	const override = (c.env.TICKER_MESSAGE ?? "").trim();
	if (override) return c.json({ message: override });
	const message = await getEplTickerMessage(c.env.PROGRESS);
	return c.json({ message: message.trim() });
});

export default ticker;

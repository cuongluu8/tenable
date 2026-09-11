import { Hono } from "hono";

const ticker = new Hono<{ Bindings: Env }>();

// The scrolling ticker banner (components/Ticker.tsx) -- its message
// lives in the TICKER_MESSAGE var (wrangler.json), not hardcoded, so it
// can be changed (a birthday shout-out today, something else tomorrow)
// without a code change -- see wrangler.json's own comment on how to
// override it live vs. redeploying. Trimmed and possibly empty; the
// client hides the ticker entirely rather than rendering an empty bar
// when it is.
ticker.get("/", (c) => {
	return c.json({ message: (c.env.TICKER_MESSAGE ?? "").trim() });
});

export default ticker;

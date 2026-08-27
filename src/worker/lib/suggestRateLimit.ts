import type { Context, MiddlewareHandler } from "hono";

// Per-IP rate limit on typeahead suggestions specifically. This is the
// single highest-QPS endpoint in the app — one request per debounced
// keystroke burst, with no natural cap like "one guess per game" — so it's
// the one place a scripted client could run up D1 read volume fastest. See
// circuitBreaker.ts for the app-wide daily ceiling this complements.
//
// One row per IP (not per IP-per-window): the window resets in place when
// it rolls over, so the table's size is bounded by real distinct visitors,
// not by IP x time-window.
const DEFAULT_SUGGEST_LIMIT_PER_MINUTE = 30;

function currentWindow(): string {
	return new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM", a 1-minute bucket
}

export const enforceSuggestRateLimit: MiddlewareHandler<{ Bindings: Env }> = async (
	c: Context<{ Bindings: Env }>,
	next,
) => {
	const limit = Number(c.env.SUGGEST_RATE_LIMIT_PER_MINUTE) || DEFAULT_SUGGEST_LIMIT_PER_MINUTE;
	// Cloudflare-set, not client-suppliable — reliable even against a
	// scripted client with no cookie jar. Falls back to a shared bucket
	// under local `wrangler dev`, where this header isn't present.
	const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
	const window = currentWindow();

	let count: number;
	try {
		const row = await c.env.DB.prepare(
			`INSERT INTO suggest_rate_limit (ip, window, count) VALUES (?1, ?2, 1)
			 ON CONFLICT(ip) DO UPDATE SET
			   count = CASE WHEN suggest_rate_limit.window = excluded.window
			                THEN suggest_rate_limit.count + 1
			                ELSE 1 END,
			   window = excluded.window
			 RETURNING count`,
		)
			.bind(ip, window)
			.first<{ count: number }>();
		count = row?.count ?? 0;
	} catch {
		// Same reasoning as circuitBreaker.ts: if D1 is unreachable, the
		// route's own D1 query is about to fail anyway.
		return next();
	}

	if (count > limit) {
		return c.json({ error: "Too many suggestion requests" }, 429);
	}

	return next();
};

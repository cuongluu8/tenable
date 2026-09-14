import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "tenable_device";

// A freshly minted id, remembered for the rest of the SAME request. Two
// callers per request are normal now -- the rate-limit middleware
// (lib/rateLimits.ts) and then the route -- and getCookie() only ever
// reads the *request's* Cookie header, so without this the second caller
// minted a second id and set a second Set-Cookie: the route saved the
// player's progress under one id while the browser kept the other, and a
// first-time player's first guess vanished (2026-09-14, caught by the
// playtest's tension-loss check: five wrong guesses, four lives lost).
// Keyed on the raw Request so it can't leak across requests or isolates.
const mintedThisRequest = new WeakMap<Request, string>();

// Anonymous per-browser identity: a random id stored in a long-lived cookie.
// No accounts, no PII — just enough to key streaks/progress in KV per device.
// Idempotent within a request -- see mintedThisRequest.
export function getOrSetDeviceId(c: Context): string {
	const existing = getCookie(c, COOKIE_NAME);
	if (existing) return existing;
	const minted = mintedThisRequest.get(c.req.raw);
	if (minted) return minted;

	const id = crypto.randomUUID();
	mintedThisRequest.set(c.req.raw, id);
	setCookie(c, COOKIE_NAME, id, {
		httpOnly: true,
		sameSite: "Lax",
		secure: true,
		path: "/",
		maxAge: 60 * 60 * 24 * 400, // ~13 months
	});
	return id;
}

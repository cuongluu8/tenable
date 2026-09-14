import type { Context, MiddlewareHandler } from "hono";
import { getOrSetDeviceId } from "./device";

// Cost guardrails, on Cloudflare's Rate Limiting binding (2026-09-14).
//
// These replace two D1-backed guards -- a daily request counter
// (circuitBreaker.ts) and a per-IP typeahead limiter (suggestRateLimit.ts)
// -- each of which cost a contended D1 write on the hot path of every
// request it guarded, and were the first two ceilings the app hit under
// load (docs/scaling.md §2). The binding is in-memory at the edge: no
// storage ops, no round trip, free-plan compatible. Two things about it
// shape what's below:
//   - Limits are static (`wrangler.json` `ratelimits`) and enforced per
//     Cloudflare location, best-effort. Fine for "stop one client
//     hammering us" and "bound a runaway burst"; not for accounting.
//   - Its keys are ours to choose, so limits are per PLAYER (the remote-
//     play token, else the daily game's device cookie, else the IP) --
//     the old per-IP limiter made a whole room on one Wi-Fi share a
//     single 30/min bucket, which four people typing at once could hit.
//
// A missing binding (a dev/test config without `ratelimits`) fails open:
// these are guardrails, not gates.

export interface RateLimitEnv {
	PLAYER_RATE_LIMITER?: RateLimit;
	SUGGEST_RATE_LIMITER?: RateLimit;
	GLOBAL_RATE_LIMITER?: RateLimit;
}

// Who is this request from, for limiting purposes: the remote-play token,
// else the device cookie -- MINTED here if the client doesn't have one
// yet (the daily game's routes set it, Roll of Honour's solo routes
// didn't, and without it every cookie-less request from a venue fell
// into one shared IP bucket; found when the parallel e2e suite tripped
// it). The IP is the fallback only for a client that refuses cookies.
export function rateLimitKey(c: Context): string {
	const token = c.req.header("X-Player-Token");
	if (token) return `t:${token}`;
	return `d:${getOrSetDeviceId(c)}`;
}

async function allowed(limiter: RateLimit | undefined, key: string): Promise<boolean> {
	if (!limiter) return true;
	try {
		return (await limiter.limit({ key })).success;
	} catch {
		return true; // A binding hiccup must never take the app down.
	}
}

// Not a player action, so not counted against a player:
//   - the remote-play poll and its WebSocket upgrade (the heartbeat; its cadence is the client's,
//     and counting it would make the limit a function of connection time)
//   - badge/flag images (a Club Run round or a revealed Roll of Honour grid
//     pulls dozens at once -- confirmed the hard way: counting them starved
//     real actions and stalled the e2e suite; they're cacheable GETs)
//   - the ticker read.
function exempt(path: string): boolean {
	return (path.startsWith("/api/remote/") && (path.endsWith("/state") || path.endsWith("/ws"))) || path.startsWith("/api/media/") || path === "/api/ticker";
}

// Every other /api route.
export const enforcePlayerRateLimit: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	if (exempt(c.req.path)) return next();
	const env = c.env as RateLimitEnv;
	if (!(await allowed(env.GLOBAL_RATE_LIMITER, "global"))) {
		return c.json({ error: "The app is unusually busy right now -- please try again in a moment." }, 503);
	}
	if (!(await allowed(env.PLAYER_RATE_LIMITER, rateLimitKey(c)))) {
		return c.json({ error: "Too many requests -- slow down a little." }, 429);
	}
	return next();
};

// Typeahead specifically -- the one thing that scales with keystrokes, not
// with deliberate plays. Mounted on each suggest route.
export const enforceSuggestRateLimit: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	const env = c.env as RateLimitEnv;
	if (!(await allowed(env.SUGGEST_RATE_LIMITER, rateLimitKey(c)))) {
		return c.json({ error: "Too many suggestion requests" }, 429);
	}
	return next();
};

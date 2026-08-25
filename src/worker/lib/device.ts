import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "tenable_device";

// Anonymous per-browser identity: a random id stored in a long-lived cookie.
// No accounts, no PII — just enough to key streaks/progress in KV per device.
export function getOrSetDeviceId(c: Context): string {
	const existing = getCookie(c, COOKIE_NAME);
	if (existing) return existing;

	const id = crypto.randomUUID();
	setCookie(c, COOKIE_NAME, id, {
		httpOnly: true,
		sameSite: "Lax",
		secure: true,
		path: "/",
		maxAge: 60 * 60 * 24 * 400, // ~13 months
	});
	return id;
}

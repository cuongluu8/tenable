// The per-IP limit on remote-play session create and join
// (lib/rateLimits.ts's enforceSessionRateLimit, wrangler.json's
// SESSION_RATE_LIMITER: 120 a minute per connecting IP, create and join
// combined). Behind Cloudflare CF-Connecting-IP is always present; the
// tests set it explicitly. A request without it falls back to the
// per-player key, which is what every other test file relies on (each
// SELF.fetch is a fresh device), so the limit never trips them.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

function create(ip: string) {
	return SELF.fetch("https://example.com/api/remote/sessions", {
		method: "POST",
		headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
		body: JSON.stringify({ hostName: "Host" }),
	});
}

describe("per-IP session limit", () => {
	it("allows 120 creates and joins a minute from one address, then 429s that address only", { timeout: 60_000 }, async () => {
		const ip = "203.0.113.9";
		let firstCode = "";
		for (let i = 0; i < 120; i++) {
			const res = await create(ip);
			expect(res.status).toBe(200);
			if (!firstCode) firstCode = ((await res.json()) as { sessionCode: string }).sessionCode;
		}
		const over = await create(ip);
		expect(over.status).toBe(429);
		expect(((await over.json()) as { error: string }).error).toMatch(/your network/);

		// Joins share the same bucket.
		const join = await SELF.fetch(`https://example.com/api/remote/sessions/${firstCode}/join`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
			body: JSON.stringify({ name: "Guest" }),
		});
		expect(join.status).toBe(429);

		// Another address is unaffected.
		expect((await create("203.0.113.10")).status).toBe(200);
		// And every other route from the limited address still works -- this
		// bounds session minting, not play.
		const state = await SELF.fetch(`https://example.com/api/remote/sessions/${firstCode}/state`, { headers: { "CF-Connecting-IP": ip } });
		expect(state.status).not.toBe(429);
	});
});

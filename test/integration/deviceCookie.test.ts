// First contact with the daily game: the device cookie must be minted
// exactly once per request, however many layers ask for it (the rate-limit
// middleware AND the route both do -- lib/device.ts's mintedThisRequest).
// Regression test for 2026-09-14: two Set-Cookies on one response meant a
// new player's first guess was saved under an id the browser never kept.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("device cookie on first contact", () => {
	it("sets exactly one device cookie, and the round continues under it", async () => {
		const first = await SELF.fetch("https://example.com/api/guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug: "fixture-top-3", guess: "Not An Answer", mode: "tension" }),
		});
		expect(first.status).toBe(200);
		const cookies = first.headers.getSetCookie().filter((c) => c.startsWith("tenable_device="));
		expect(cookies).toHaveLength(1);
		const body1 = (await first.json()) as { result: string; livesRemaining: number };
		expect(body1.result).toBe("wrong");
		expect(body1.livesRemaining).toBe(4);

		// The same round, under the one cookie the browser was given.
		const second = await SELF.fetch("https://example.com/api/guess", {
			method: "POST",
			headers: { "Content-Type": "application/json", Cookie: cookies[0].split(";")[0] },
			body: JSON.stringify({ slug: "fixture-top-3", guess: "Still Not An Answer", mode: "tension" }),
		});
		const body2 = (await second.json()) as { result: string; livesRemaining: number };
		expect(body2.livesRemaining).toBe(3);
	});
});

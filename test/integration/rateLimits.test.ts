// The Rate Limiting binding guards (lib/rateLimits.ts). The pool's
// in-memory implementation of the binding enforces `simple` limits, so
// this exercises the real middleware against the real config: the
// typeahead limit is per player (a token, or a device cookie), so someone
// else in the same room (same IP) is unaffected.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("typeahead rate limit", () => {
	it("allows 60 suggest calls a minute per device, then 429s that device only", async () => {
		const device = `tenable_device=${crypto.randomUUID()}`;
		let last = 0;
		for (let i = 0; i < 60; i++) {
			last = (await SELF.fetch("https://example.com/api/club-badges/suggest?q=ron", { headers: { Cookie: device } })).status;
		}
		expect(last).toBe(200);
		const over = await SELF.fetch("https://example.com/api/club-badges/suggest?q=ron", { headers: { Cookie: device } });
		expect(over.status).toBe(429);
		expect(await over.json()).toEqual({ error: "Too many suggestion requests" });

		const other = await SELF.fetch("https://example.com/api/club-badges/suggest?q=ron", {
			headers: { Cookie: `tenable_device=${crypto.randomUUID()}` },
		});
		expect(other.status).toBe(200);
	});
});

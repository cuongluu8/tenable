// Route-level contract test for circuitBreaker.ts's app-wide daily request
// budget. DAILY_REQUEST_BUDGET is overridden to 50 for this whole test
// project (see vitest.integration.config.ts's own doc) specifically so
// this can be exhausted in a handful of requests -- the real 20,000 would
// make this test impractically slow otherwise. D1 (and so the
// request_budget table) is freshly seeded per test FILE, so this file's
// own count starts at zero regardless of what any other test file did.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Daily request budget", () => {
	it("serves normally up to the budget, then fails closed with a 503 past it", async () => {
		let lastStatus = 0;
		for (let i = 0; i < 50; i++) {
			const res = await SELF.fetch("https://example.com/api/stats", {
				headers: { Cookie: `tenable_device=${crypto.randomUUID()}` },
			});
			lastStatus = res.status;
		}
		expect(lastStatus).toBe(200); // the 50th request is still within budget

		const overBudget = await SELF.fetch("https://example.com/api/stats", {
			headers: { Cookie: `tenable_device=${crypto.randomUUID()}` },
		});
		expect(overBudget.status).toBe(503);
		expect(await overBudget.json()).toEqual({
			error: "This app has reached its daily request budget. Please try again tomorrow.",
		});
	});
});

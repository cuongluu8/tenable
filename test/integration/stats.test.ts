// Route-level contract test for GET /api/stats.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/stats", () => {
	it("defaults to zero streak/lifetime for a device that's never played", async () => {
		const res = await SELF.fetch("https://example.com/api/stats", {
			headers: { Cookie: `tenable_device=${crypto.randomUUID()}` },
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			streak: { current: 0, longest: 0, lastCompletedDate: null },
			lifetime: { totalPlayed: 0, totalWon: 0 },
		});
	});

	it("reflects a win recorded via completing the fixture category", async () => {
		const device = crypto.randomUUID();
		const cookie = { Cookie: `tenable_device=${device}`, "Content-Type": "application/json" };
		for (const name of ["Fixture Player One", "Fixture Player Two", "Fixture Player Three"]) {
			await SELF.fetch("https://example.com/api/guess", {
				method: "POST",
				headers: cookie,
				body: JSON.stringify({ slug: "fixture-top-3", guess: name }),
			});
		}
		const res = await SELF.fetch("https://example.com/api/stats", { headers: cookie });
		const data = (await res.json()) as { streak: { current: number }; lifetime: { totalPlayed: number; totalWon: number } };
		expect(data.lifetime).toEqual({ totalPlayed: 1, totalWon: 1 });
		expect(data.streak.current).toBe(1);
	});
});

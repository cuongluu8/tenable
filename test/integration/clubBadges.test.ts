// First integration test, also serving as the smoke test that the whole
// harness (Phase A) actually works: a real request through the real Worker
// (SELF, from cloudflare:test) against the real local D1 seeded by
// setup.ts, no mocks anywhere in the path.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/club-badges/round", () => {
	it("returns a full random round with no answer-revealing fields", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/round");
		expect(res.status).toBe(200);

		const data = (await res.json()) as { questions: { id: number; badges: unknown[] }[] };
		expect(data.questions).toHaveLength(10);
		for (const question of data.questions) {
			expect(typeof question.id).toBe("number");
			// The whole point of this endpoint: never ship the answer itself.
			expect(question).not.toHaveProperty("player_id");
			expect(question).not.toHaveProperty("club_sequence");
		}
	});
});

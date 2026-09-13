// Route-level contract tests for /api/club-badges/* -- real Worker, real
// local D1 seeded from fixtures/core.sql (see test/integration/setup.ts).
// Deliberately contract-level (status codes, response shapes, correct/
// wrong outcomes), not a re-derivation of clubBadges.ts's own documented
// historical hint-computation bugs (transferDatesFor's loan/return/
// adjacent-duplicate edge cases, each with its own real production
// incident noted in that function's comments) -- those would need their
// own much larger, purpose-built fixtures modeling each exact shape and
// are a good candidate for focused follow-up, not folded in here.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface RoundQuestion {
	id: number;
	badges: { name: string; url: string; country: string | null }[];
}
interface RoundResponse {
	questions: RoundQuestion[];
	setName?: string;
}

describe("GET /api/club-badges/round", () => {
	it("returns a full random round with no answer-revealing fields", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/round");
		expect(res.status).toBe(200);

		const data = (await res.json()) as RoundResponse;
		expect(data.questions).toHaveLength(10);
		for (const question of data.questions) {
			expect(typeof question.id).toBe("number");
			expect(question).not.toHaveProperty("player_id");
			expect(question).not.toHaveProperty("club_sequence");
		}
	});

	it("?playerId= (dev/test override) narrows the round to just that player's question", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/round?playerId=11");
		expect(res.status).toBe(200);
		const data = (await res.json()) as RoundResponse;
		expect(data.questions).toHaveLength(1);
	});

	it("?setId= for a set that doesn't resolve against the current pool returns no questions", async () => {
		// Fixture ids (1-20) don't overlap with the real, curated
		// CLUB_BADGE_SETS player ids -- see this file's own header on why
		// that's the honest, expected outcome here rather than something to
		// fake around.
		const res = await SELF.fetch("https://example.com/api/club-badges/round?setId=1");
		expect(res.status).toBe(200);
		const data = (await res.json()) as RoundResponse;
		expect(data.questions).toEqual([]);
	});
});

describe("GET /api/club-badges/sets", () => {
	it("hides every curated set that doesn't fully resolve against the current pool", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/sets");
		expect(res.status).toBe(200);
		const data = (await res.json()) as { sets: unknown[] };
		// Same reasoning as the ?setId= case above: none of the real
		// CLUB_BADGE_SETS entries resolve against this fixture's ids, so a
		// fully-empty list is buildSetsIndex() working correctly, not a bug.
		expect(data.sets).toEqual([]);
	});
});

describe("POST /api/club-badges/check-guess", () => {
	it("grades a correct guess (by canonical name)", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, guess: "Fixture Player One" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "correct", name: "Fixture Player One" });
	});

	it("grades a wrong guess but still reveals the real name", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, guess: "Someone Else Entirely" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "wrong", name: "Fixture Player One" });
	});

	it("is forgiving of case/punctuation (normalize + collapseToAlnum)", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, guess: "  fixture   PLAYER one!!" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ result: "correct" });
	});

	it("give-up always grades wrong and still reveals the name, without needing a guess", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, giveUp: true }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "wrong", name: "Fixture Player One" });
	});

	it("400s on a missing/non-numeric question id", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ guess: "anyone" }),
		});
		expect(res.status).toBe(400);
	});

	it("400s on a missing guess when not giving up", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1 }),
		});
		expect(res.status).toBe(400);
	});

	it("404s on a question id that doesn't exist", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 999999, guess: "anyone" }),
		});
		expect(res.status).toBe(404);
	});
});

// Route-level contract tests for /api/teammates/* -- mirrors
// clubBadges.test.ts's shape; see that file's header for the same
// "contract-level, not a re-derivation of every documented edge case"
// scope note.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface RoundQuestion {
	id: number;
	teammates: string[];
	cardHints: { club: string; image: string | null; years: string }[];
	nationality: string | null;
}
interface RoundResponse {
	questions: RoundQuestion[];
	setName?: string;
}

describe("GET /api/teammates/round", () => {
	it("returns clue names only, never the mystery player's own name", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/round?playerId=11");
		expect(res.status).toBe(200);
		const data = (await res.json()) as RoundResponse;
		expect(data.questions).toHaveLength(1);
		expect(data.questions[0].teammates).toEqual(["Fixture Player Two", "Fixture Player Three", "Fixture Player Four"]);
		for (const q of data.questions) {
			expect(JSON.stringify(q)).not.toContain("Fixture Player One");
		}
	});

	it("shapes populated hints into cardHints + nationality", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/round?playerId=11");
		const data = (await res.json()) as RoundResponse;
		expect(data.questions[0].nationality).toBe("Fixture Country");
		expect(data.questions[0].cardHints).toEqual([
			{ club: "Fixture Club A", image: null, years: "2019" },
			{ club: "Fixture Club B", image: null, years: "2020" },
			{ club: "Fixture Club C", image: null, years: "2021" },
		]);
	});

	it("a row with no hints yet (hints IS NULL) degrades to empty cardHints, not an error", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/round?playerId=12");
		expect(res.status).toBe(200);
		const data = (await res.json()) as RoundResponse;
		expect(data.questions[0].cardHints).toEqual([]);
		expect(data.questions[0].nationality).toBeNull();
	});

	it("404s when no question matches (unknown player id, no set)", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/round?playerId=999999");
		expect(res.status).toBe(404);
	});
});

describe("GET /api/teammates/sets", () => {
	it("hides every curated set that doesn't fully resolve against the current pool", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/sets");
		expect(res.status).toBe(200);
		const data = (await res.json()) as { sets: unknown[] };
		expect(data.sets).toEqual([]);
	});
});

describe("POST /api/teammates/check-guess", () => {
	it("grades a correct guess", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, guess: "Fixture Player One" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "correct", name: "Fixture Player One" });
	});

	it("grades a correct guess by alias", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 1, guess: "fp1" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "correct", name: "Fixture Player One" });
	});

	it("404s on a question id that doesn't exist", async () => {
		const res = await SELF.fetch("https://example.com/api/teammates/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: 999999, guess: "anyone" }),
		});
		expect(res.status).toBe(404);
	});
});

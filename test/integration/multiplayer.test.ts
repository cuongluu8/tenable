// Route-level contract tests for /api/multiplayer/* -- entirely stateless
// (no device cookie, no KV), unlike the single-player Top-10 flow, so
// each request stands alone with no need to track a device id across
// calls.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("POST /api/multiplayer/check-guess", () => {
	it("grades a correct guess with rank/name/statValue", async () => {
		const res = await SELF.fetch("https://example.com/api/multiplayer/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ categorySlug: "fixture-top-3", guess: "Fixture Player One", foundRanks: [] }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ result: "correct", rank: 1, name: "Fixture Player One", statValue: "100" });
	});

	it("reports 'duplicate' for a rank already in the caller-supplied foundRanks", async () => {
		const res = await SELF.fetch("https://example.com/api/multiplayer/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ categorySlug: "fixture-top-3", guess: "Fixture Player One", foundRanks: [1] }),
		});
		expect(await res.json()).toEqual({ result: "duplicate" });
	});

	it("reports 'wrong' for an unmatched guess", async () => {
		const res = await SELF.fetch("https://example.com/api/multiplayer/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ categorySlug: "fixture-top-3", guess: "Nobody At All" }),
		});
		expect(await res.json()).toEqual({ result: "wrong" });
	});

	it("400s on a missing slug or guess, 404s on an unknown category", async () => {
		const missingSlug = await SELF.fetch("https://example.com/api/multiplayer/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ guess: "x" }),
		});
		expect(missingSlug.status).toBe(400);

		const unknownCategory = await SELF.fetch("https://example.com/api/multiplayer/check-guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ categorySlug: "does-not-exist", guess: "x" }),
		});
		expect(unknownCategory.status).toBe(404);
	});
});

describe("GET /api/multiplayer/reveal/:slug", () => {
	it("returns the full answer list with no completion gate (unlike single-player reveal)", async () => {
		const res = await SELF.fetch("https://example.com/api/multiplayer/reveal/fixture-top-3");
		expect(res.status).toBe(200);
		const data = (await res.json()) as { answers: { rank: number; name: string }[] };
		expect(data.answers).toHaveLength(3);
	});

	it("404s on an unknown slug", async () => {
		const res = await SELF.fetch("https://example.com/api/multiplayer/reveal/does-not-exist");
		expect(res.status).toBe(404);
	});
});

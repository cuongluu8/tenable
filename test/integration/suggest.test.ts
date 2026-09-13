// Route-level contract tests for GET /api/suggest (typeahead) and
// club-badges' own /api/club-badges/suggest, both backed by the FTS5
// entity_search table -- auto-populated by schema.sql's entity_search_ai
// trigger the moment an entities row is inserted, so the fixture's own
// entities are already indexed with no extra setup.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/suggest", () => {
	it("suggests a matching player name, scoped to the category's entity_type", async () => {
		const res = await SELF.fetch("https://example.com/api/suggest?q=fixture+player+o&category=fixture-top-3");
		expect(res.status).toBe(200);
		const data = (await res.json()) as { suggestions: string[]; truncated: boolean };
		expect(data.suggestions).toContain("Fixture Player One");
		expect(data.suggestions).not.toContain("Fixture Club A");
	});

	it("returns nothing for a query shorter than the minimum length", async () => {
		const res = await SELF.fetch("https://example.com/api/suggest?q=fp&category=fixture-top-3");
		expect(await res.json()).toEqual({ suggestions: [], truncated: false });
	});

	it("returns nothing without a category (never an unscoped mixed-type list)", async () => {
		const res = await SELF.fetch("https://example.com/api/suggest?q=fixture");
		expect(await res.json()).toEqual({ suggestions: [], truncated: false });
	});

	it("returns nothing for an unknown category slug", async () => {
		const res = await SELF.fetch("https://example.com/api/suggest?q=fixture&category=does-not-exist");
		expect(await res.json()).toEqual({ suggestions: [], truncated: false });
	});
});

describe("GET /api/club-badges/suggest", () => {
	it("suggests a matching player with no category needed at all", async () => {
		const res = await SELF.fetch("https://example.com/api/club-badges/suggest?q=fixture+player+t");
		const data = (await res.json()) as { suggestions: string[] };
		expect(data.suggestions).toContain("Fixture Player Two");
	});
});

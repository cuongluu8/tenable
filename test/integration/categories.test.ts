// Route-level contract tests for GET /api/categories and
// GET /api/categories/:slug.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

function withDevice(id: string): HeadersInit {
	return { Cookie: `tenable_device=${id}` };
}

describe("GET /api/categories", () => {
	it("lists the fixture category as 'new' for a device with no progress", async () => {
		const res = await SELF.fetch("https://example.com/api/categories", {
			headers: withDevice(crypto.randomUUID()),
		});
		expect(res.status).toBe(200);
		const data = (await res.json()) as { categories: { slug: string; status: string; answerCount?: number }[] };
		const fixture = data.categories.find((c) => c.slug === "fixture-top-3");
		expect(fixture).toBeDefined();
		expect(fixture?.status).toBe("new");
	});

	it("never reveals answer names, only the materialized count", async () => {
		const res = await SELF.fetch("https://example.com/api/categories", {
			headers: withDevice(crypto.randomUUID()),
		});
		const text = await res.text();
		expect(text).not.toContain("Fixture Player One");
	});
});

describe("GET /api/categories/:slug", () => {
	it("returns the category with no progress for a fresh device", async () => {
		const res = await SELF.fetch("https://example.com/api/categories/fixture-top-3", {
			headers: withDevice(crypto.randomUUID()),
		});
		expect(res.status).toBe(200);
		const data = (await res.json()) as { category: { slug: string }; progress: unknown; foundAnswers: unknown[] };
		expect(data.category.slug).toBe("fixture-top-3");
		expect(data.progress).toBeNull();
		expect(data.foundAnswers).toEqual([]);
	});

	it("404s on an unknown slug", async () => {
		const res = await SELF.fetch("https://example.com/api/categories/does-not-exist", {
			headers: withDevice(crypto.randomUUID()),
		});
		expect(res.status).toBe(404);
	});
});

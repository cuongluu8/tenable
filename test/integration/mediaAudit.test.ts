// Route-level contract test for GET /api/admin/media-audit -- an unlisted
// HTML admin page, so this is a lighter contract check (status + expected
// substrings) rather than full markup parsing.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/admin/media-audit", () => {
	it("marks every fixture club MISSING (none have an image_key)", async () => {
		const res = await SELF.fetch("https://example.com/api/admin/media-audit");
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Fixture Club A");
		expect(html).toContain("MISSING");
	});

	it("?type=country switches to country entities (none in the fixture, so an empty grid)", async () => {
		const res = await SELF.fetch("https://example.com/api/admin/media-audit?type=country");
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).not.toContain("Fixture Club A");
	});
});

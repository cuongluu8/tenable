// Route-level contract tests for GET /api/media/:key -- the MEDIA R2
// binding is forced to local (empty) emulation for tests (see
// vitest.integration.config.ts's own doc on why), so the "object exists"
// path needs its own env.MEDIA.put() first; the "missing" path is already
// the real, deterministic default of an empty bucket.
import { env, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/media/:key", () => {
	it("404s for a key that was never uploaded", async () => {
		const res = await SELF.fetch("https://example.com/api/media/clubs/does-not-exist.svg");
		expect(res.status).toBe(404);
	});

	it("streams the object back with a cache-control header once it exists", async () => {
		await env.MEDIA.put("clubs/fixture.svg", "<svg>fixture</svg>", {
			httpMetadata: { contentType: "image/svg+xml" },
		});
		const res = await SELF.fetch("https://example.com/api/media/clubs/fixture.svg");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toBe("public, max-age=86400");
		expect(await res.text()).toBe("<svg>fixture</svg>");
	});

	it("captures a key containing its own slash whole, not just its last segment", async () => {
		await env.MEDIA.put("countries/nested/path.svg", "ok");
		const res = await SELF.fetch("https://example.com/api/media/countries/nested/path.svg");
		expect(res.status).toBe(200);
	});
});

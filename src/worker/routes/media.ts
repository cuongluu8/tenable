import { Hono } from "hono";

const media = new Hono<{ Bindings: Env }>();

// Streams a badge/flag image out of the tenable-media R2 bucket by its
// entities.image_key (see db/schema.sql's comment on that column). The
// bucket itself is never made public — every request for an image goes
// through this route so R2 access stays scoped to this Worker's binding,
// not a world-readable bucket URL.
//
// `:key{.+}` (not the default `:key`) so a key containing its own "/"
// (e.g. "clubs/217.png") is captured whole rather than just its last
// segment — Hono's param matching stops at the next "/" otherwise.
media.get("/:key{.+}", async (c) => {
	// Edge cache in front of R2 (2026-09-14; docs/scaling.md §5c): the
	// browser already keeps an image for a day (Cache-Control below), but
	// every first-time visitor was still an R2 read. Keyed on the request
	// URL, so each image is read from R2 once per Cloudflare location per
	// day rather than once per browser. Same one-day TTL as the browser --
	// deliberately NOT `immutable`/a year: an image_key is the entity's id,
	// not a content hash, so a re-uploaded badge keeps its key and has to
	// age out.
	const cache = caches.default;
	const cacheKey = new Request(c.req.url, { method: "GET" });
	const hit = await cache.match(cacheKey);
	if (hit) return hit;

	const key = c.req.param("key");
	const object = await c.env.MEDIA.get(key);
	if (!object) {
		return c.json({ error: "Not found" }, 404);
	}
	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=86400");
	const response = new Response(object.body, { headers });
	c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
});

export default media;

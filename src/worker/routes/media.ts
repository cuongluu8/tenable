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
	const key = c.req.param("key");

	const object = await c.env.MEDIA.get(key);
	if (!object) {
		return c.json({ error: "Not found" }, 404);
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	// Content-addressed by entity id, but a badge can still get re-sourced
	// under the same key (e.g. a club rebrand) -- a day is long enough to
	// meaningfully cut R2 reads, short enough that a correction doesn't
	// linger stale for weeks.
	headers.set("cache-control", "public, max-age=86400");

	return new Response(object.body, { headers });
});

export default media;

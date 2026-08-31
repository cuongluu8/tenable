// Edge cache for the public, device-independent portion of the two
// read-heavy category routes (GET /api/categories, GET /api/categories/:slug)
// — the category metadata itself (title/subtitle/answerCount/asOfDate),
// never the per-device progress/streak/lifetime data those routes merge in
// afterwards from KV. Caching the whole HTTP response would leak one
// device's "already played" status into what another device sees for the
// same cache key, so this only ever wraps the D1 query, not the response.
//
// Keyed on a synthetic internal URL plus content_version (see
// rebuild.ts/schema.sql) rather than anything from the incoming request —
// every visitor should hit the same cache entry for the same category data.
// A rebuild bumps content_version, which changes the key and so invalidates
// every cached entry for free, with no explicit purge step to remember.
export async function cachedContentQuery<T>(
	db: D1Database,
	// Structural rather than Cloudflare's global `ExecutionContext` type:
	// Hono's `c.executionCtx` has its own, narrower `ExecutionContext`
	// interface (same name, different shape) that isn't assignable to the
	// ambient Workers one — this only ever needs `waitUntil`, so typing it
	// that way accepts either.
	ctx: { waitUntil(promise: Promise<unknown>): void },
	cacheName: string,
	compute: () => Promise<T>,
): Promise<T> {
	const versionRow = await db
		.prepare(`SELECT version FROM content_version WHERE id = 1`)
		.first<{ version: number }>();
	const version = versionRow?.version ?? 1;

	const cacheKey = new Request(`https://cache.internal/${cacheName}?v=${version}`);
	const store = caches.default;

	const cached = await store.match(cacheKey);
	if (cached) return (await cached.json()) as T;

	const value = await compute();
	const response = new Response(JSON.stringify(value), {
		headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
	});
	ctx.waitUntil(store.put(cacheKey, response));
	return value;
}

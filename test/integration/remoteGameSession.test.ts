// Proves the RemoteGameSession Durable Object binding + migration
// actually work end to end (see wrangler.json's own doc) -- no real
// session logic exists yet, just a health-check route (see that file's
// own doc on why).
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("RemoteGameSession (Durable Object)", () => {
	it("is reachable via its binding and responds to a request", async () => {
		const id = env.REMOTE_GAME_SESSION.idFromName("test-session");
		const stub = env.REMOTE_GAME_SESSION.get(id);

		const res = await stub.fetch("https://example.com/");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it("idFromName is deterministic -- the same name always resolves to the same instance", async () => {
		const a = env.REMOTE_GAME_SESSION.idFromName("same-name");
		const b = env.REMOTE_GAME_SESSION.idFromName("same-name");
		expect(a.equals(b)).toBe(true);
	});
});

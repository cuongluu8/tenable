import { Hono, type Context } from "hono";
import { enforceSessionRateLimit } from "../lib/rateLimits";
import { generateSessionCode, isValidSessionCode, normalizeSessionCode } from "../lib/remoteSession";

const remoteSession = new Hono<{ Bindings: Env }>();

// TICKER_MESSAGE-style dashboard override (see wrangler.json's own doc on
// REMOTE_MULTIPLAYER_ENABLED) -- flipping this off takes every route below
// out of service without a deploy, in case the feature needs pulling in a
// hurry once it's live.
remoteSession.use("*", async (c, next) => {
	if (!c.env.REMOTE_MULTIPLAYER_ENABLED) {
		return c.json({ error: "Remote multiplayer is temporarily unavailable." }, 503);
	}
	return next();
});

// This route file deliberately does none of the actual session business
// logic (name validation, lobby-state checks, auth) -- that all lives once,
// inside RemoteGameSession itself, so there's a single source of truth
// regardless of which HTTP entry point reaches it. This file's only job is
// resolving a session code to the right Durable Object instance and
// forwarding the request/response through unchanged -- see media.ts for
// the same "return the inner Response as-is" pattern used elsewhere in this
// codebase.
function sessionStub(env: Env, code: string): DurableObjectStub {
	return env.REMOTE_GAME_SESSION.get(env.REMOTE_GAME_SESSION.idFromName(code));
}

// Forwards to an existing session identified by the :code param -- every
// route except /sessions (create) uses this. The player token, when
// present, travels as a header rather than a body field or query param so
// it never ends up in a URL (logs, referrers) and every route can read it
// the same way regardless of HTTP method.
async function forward(c: Context<{ Bindings: Env }>, path: string, init: RequestInit = {}): Promise<Response> {
	const code = normalizeSessionCode(c.req.param("code"));
	if (!isValidSessionCode(code)) return c.json({ error: "Invalid session code" }, 400);

	const token = c.req.header("X-Player-Token");
	return sessionStub(c.env, code).fetch(`https://do${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(token ? { "X-Player-Token": token } : {}),
		},
	});
}

// A code collision here would mean this freshly-generated code already has
// a live session on it -- astronomically unlikely given ~1.07 billion
// combinations (see generateSessionCode's own doc), but retried a few
// times rather than assumed impossible: the failure mode of assuming wrong
// (silently colliding with a real session) is far worse than a wasted
// retry.
const MAX_CREATE_ATTEMPTS = 5;

// Create and join carry the per-IP session limit (lib/rateLimits.ts's
// enforceSessionRateLimit) on top of the per-player one every /api route
// gets: these two are reachable with no identity, and a device cookie is
// no bound on a script.
remoteSession.post("/sessions", enforceSessionRateLimit, async (c) => {
	const body = await c.req.text();
	for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
		const code = generateSessionCode();
		const res = await sessionStub(c.env, code).fetch("https://do/create", {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Session-Code": code },
			body,
		});
		if (res.status === 409) continue;
		return res;
	}
	return c.json({ error: "Could not allocate a session code, please try again." }, 500);
});

remoteSession.post("/sessions/:code/join", enforceSessionRateLimit, async (c) => forward(c, "/join", { method: "POST", body: await c.req.text() }));

// The query string rides along: /state?since=<feed id> is how the client
// asks for only the activity-feed entries it hasn't seen (see
// remoteGameSession.ts's /state).
remoteSession.get("/sessions/:code/state", async (c) => forward(c, `/state${new URL(c.req.url).search}`));

// The push channel (see remoteGameSession.ts's WebSockets doc). The
// token rides in the query here, not a header, because a browser's
// WebSocket API can't set headers; the upgrade is forwarded to the object
// as-is and its 101 response returned untouched.
remoteSession.get("/sessions/:code/ws", (c) => {
	const code = normalizeSessionCode(c.req.param("code"));
	if (!isValidSessionCode(code)) return c.json({ error: "Invalid session code" }, 400);
	if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") return c.json({ error: "Expected a WebSocket upgrade" }, 426);
	return sessionStub(c.env, code).fetch(`https://do/ws${new URL(c.req.url).search}`, { headers: { Upgrade: "websocket" } });
});

remoteSession.post("/sessions/:code/ready", async (c) => forward(c, "/ready", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/guess", async (c) => forward(c, "/guess", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/give-up", async (c) => forward(c, "/give-up", { method: "POST" }));

remoteSession.post("/sessions/:code/message", async (c) => forward(c, "/message", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/restart", async (c) => forward(c, "/restart", { method: "POST", body: await c.req.text() }));

// Roll of Honour's grid (see remoteGameSession.ts's class doc).
remoteSession.post("/sessions/:code/tile/select", async (c) => forward(c, "/tile/select", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/tile/release", async (c) => forward(c, "/tile/release", { method: "POST" }));

remoteSession.post("/sessions/:code/tile/answer", async (c) => forward(c, "/tile/answer", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/leave", async (c) => forward(c, "/leave", { method: "POST" }));

remoteSession.post("/sessions/:code/remove", async (c) => forward(c, "/remove", { method: "POST", body: await c.req.text() }));

remoteSession.post("/sessions/:code/start", async (c) => forward(c, "/start", { method: "POST", body: await c.req.text() }));

export default remoteSession;

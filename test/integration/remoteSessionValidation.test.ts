// Error/permission/edge-case contract tests for /api/remote/* -- see
// remoteSessionLifecycle.test.ts's own doc for the happy path and why this
// is a separate file.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerId: string;
	playerToken: string;
}
interface JoinResponse {
	playerId: string;
	playerToken: string;
}

async function createSession(hostName: string): Promise<CreateResponse> {
	const res = await SELF.fetch("https://example.com/api/remote/sessions", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ hostName }),
	});
	expect(res.status).toBe(200);
	return res.json();
}

async function joinSession(code: string, name: string): Promise<{ status: number; body: JoinResponse | { error: string } }> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	return { status: res.status, body: await res.json() };
}

function post(code: string, path: string, token: string | undefined, body?: unknown) {
	return SELF.fetch(`https://example.com/api/remote/sessions/${code}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? { "X-Player-Token": token } : {}),
		},
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
}

describe("session creation validation", () => {
	it("400s on a missing host name", async () => {
		const res = await SELF.fetch("https://example.com/api/remote/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(400);
	});

	it("400s on a host name over the length limit", async () => {
		const res = await SELF.fetch("https://example.com/api/remote/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ hostName: "x".repeat(25) }),
		});
		expect(res.status).toBe(400);
	});
});

describe("POST /api/remote/sessions/:code/join validation", () => {
	it("400s on a malformed session code", async () => {
		// Contains 'O', which is outside SESSION_CODE_ALPHABET by design (see
		// remoteSession.ts's own doc on ambiguous characters).
		const res = await joinSession("AB2OCD", "Guest");
		expect(res.status).toBe(400);
	});

	it("404s on a well-formed but unknown session code", async () => {
		const res = await joinSession("ZZZZZZ", "Guest");
		expect(res.status).toBe(404);
	});

	it("400s on a missing/blank name", async () => {
		const host = await createSession("Host");
		const res = await joinSession(host.sessionCode, "   ");
		expect(res.status).toBe(400);
	});

	it("still accepts a join once the game has started -- late joiners start on zero wins", async () => {
		const host = await createSession("Host");
		// No other players, so the host (auto-ready) can start immediately --
		// see remoteGameSession.ts's own doc on why readiness only gates
		// non-host players.
		const start = await post(host.sessionCode, "/start", host.playerToken, { questionCount: 3 });
		expect(start.status).toBe(200);

		// Mid-game joining was opened up 2026-09-13 (see the class doc's own
		// bullet) -- this used to be a 409.
		const res = await joinSession(host.sessionCode, "LateComer");
		expect(res.status).toBe(200);
		const late = res.body as JoinResponse;
		const stateRes = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state`, {
			headers: { "X-Player-Token": late.playerToken },
		});
		const state = (await stateRes.json()) as { status: string; players: { id: string; wins: number; ready: boolean }[] };
		expect(state.status).toBe("in_progress");
		const me = state.players.find((p) => p.id === late.playerId);
		expect(me?.wins).toBe(0);
		// Joined mid-round (not during a reveal), so the normal not-ready
		// default applies -- remoteSessionGiveUp.test.ts covers the reveal case.
		expect(me?.ready).toBe(false);
	});

	it("409s once the session is full", async () => {
		const host = await createSession("Host");
		// Host already occupies one of the MAX_PLAYERS=8 slots.
		for (let i = 0; i < 7; i++) {
			const res = await joinSession(host.sessionCode, `Player${i}`);
			expect(res.status).toBe(200);
		}
		const overflow = await joinSession(host.sessionCode, "OneTooMany");
		expect(overflow.status).toBe(409);
	});
});

describe("auth: an invalid or missing player token is rejected", () => {
	it("401s on /state, /ready, /leave, /remove, and /start", async () => {
		const host = await createSession("Host");

		const state = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state`, {
			headers: { "X-Player-Token": "not-a-real-token" },
		});
		expect(state.status).toBe(401);

		expect((await post(host.sessionCode, "/ready", "garbage", { ready: true })).status).toBe(401);
		expect((await post(host.sessionCode, "/leave", "garbage")).status).toBe(401);
		expect((await post(host.sessionCode, "/remove", "garbage", { playerId: "x" })).status).toBe(401);
		expect((await post(host.sessionCode, "/start", "garbage", { questionCount: 3 })).status).toBe(401);
	});
});

describe("host-only actions reject a non-host caller", () => {
	it("403s a non-host trying to remove another player", async () => {
		const host = await createSession("Host");
		const guestJoin = await joinSession(host.sessionCode, "Guest");
		const guest = guestJoin.body as JoinResponse;
		const bystanderJoin = await joinSession(host.sessionCode, "Bystander");
		const bystander = bystanderJoin.body as JoinResponse;

		const res = await post(host.sessionCode, "/remove", guest.playerToken, { playerId: bystander.playerId });
		expect(res.status).toBe(403);
	});

	it("403s a non-host trying to start the game", async () => {
		const host = await createSession("Host");
		const guestJoin = await joinSession(host.sessionCode, "Guest");
		const guest = guestJoin.body as JoinResponse;

		const res = await post(host.sessionCode, "/start", guest.playerToken, { questionCount: 3 });
		expect(res.status).toBe(403);
	});
});

describe("POST /api/remote/sessions/:code/remove edge cases", () => {
	it("400s removing yourself (use /leave instead)", async () => {
		const host = await createSession("Host");
		const res = await post(host.sessionCode, "/remove", host.playerToken, { playerId: host.playerId });
		expect(res.status).toBe(400);
	});

	it("404s removing an unknown player id", async () => {
		const host = await createSession("Host");
		const res = await post(host.sessionCode, "/remove", host.playerToken, { playerId: "no-such-player" });
		expect(res.status).toBe(404);
	});
});

describe("POST /api/remote/sessions/:code/start validation", () => {
	it("400s on a non-integer or out-of-range questionCount", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 0 })).status).toBe(400);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 999 })).status).toBe(400);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2.5 })).status).toBe(400);
	});

	it("409s when a non-away, non-host player hasn't readied up", async () => {
		const host = await createSession("Host");
		const guestJoin = await joinSession(host.sessionCode, "Guest");
		const guest = guestJoin.body as JoinResponse;

		const res = await post(host.sessionCode, "/start", host.playerToken, { questionCount: 3 });
		expect(res.status).toBe(409);
		const body = (await res.json()) as { notReadyPlayerIds: string[] };
		expect(body.notReadyPlayerIds).toEqual([guest.playerId]);
	});

	it("409s starting a session that's already started", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 3 })).status).toBe(200);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 3 })).status).toBe(409);
	});
});

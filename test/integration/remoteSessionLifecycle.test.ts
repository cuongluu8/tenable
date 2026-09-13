// Happy-path route-level contract tests for /api/remote/* -- the session
// lifecycle only (create/join/state/ready/start/leave/remove), per Phase 1
// of remoteGameSession.ts's own doc. No question content, no guessing --
// that's a later phase. See remoteSessionValidation.test.ts for the error/
// permission edge cases; kept in a separate file so each stays comfortably
// under this test's own DAILY_REQUEST_BUDGET=50 (isolated per file, see
// setup.ts's own doc), even though /state itself is exempt from that
// budget entirely (see circuitBreaker.ts).
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
interface StateResponse {
	status: "lobby" | "in_progress" | "finished" | "ended";
	questionCount: number | null;
	players: { id: string; name: string; isHost: boolean; ready: boolean; away: boolean; wins: number }[];
	round: unknown;
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

async function joinSession(code: string, name: string): Promise<JoinResponse> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	expect(res.status).toBe(200);
	return res.json();
}

async function getState(code: string, token: string): Promise<{ status: number; body: StateResponse }> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/state`, {
		headers: { "X-Player-Token": token },
	});
	return { status: res.status, body: await res.json() };
}

function post(code: string, path: string, token: string, body?: unknown) {
	return SELF.fetch(`https://example.com/api/remote/sessions/${code}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Player-Token": token },
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
}

describe("POST /api/remote/sessions (create)", () => {
	it("creates a session with a valid 6-character code and a ready host", async () => {
		const created = await createSession("Alice");
		expect(created.sessionCode).toHaveLength(6);
		expect(created.playerId).toBeTruthy();
		expect(created.playerToken).toBeTruthy();

		const { body } = await getState(created.sessionCode, created.playerToken);
		expect(body).toEqual({
			status: "lobby",
			questionCount: null,
			round: null,
			players: [{ id: created.playerId, name: "Alice", isHost: true, ready: true, away: false, wins: 0, message: null }],
		});
	});
});

describe("full lifecycle: create -> join -> ready -> start", () => {
	it("both players see each other in /state, and starting flips status + records questionCount", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");

		const afterJoin = await getState(host.sessionCode, host.playerToken);
		expect(afterJoin.body.players).toHaveLength(2);
		const guestInState = afterJoin.body.players.find((p) => p.id === guest.playerId);
		expect(guestInState).toEqual({ id: guest.playerId, name: "Guest", isHost: false, ready: false, away: false, wins: 0, message: null });

		// Starting before the guest readies up is rejected -- see
		// remoteSessionValidation.test.ts for the exact error shape.
		const tooEarly = await post(host.sessionCode, "/start", host.playerToken, { questionCount: 5 });
		expect(tooEarly.status).toBe(409);

		const readyRes = await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect(readyRes.status).toBe(200);

		const afterReady = await getState(host.sessionCode, guest.playerToken);
		expect(afterReady.body.players.find((p) => p.id === guest.playerId)?.ready).toBe(true);

		const startRes = await post(host.sessionCode, "/start", host.playerToken, { questionCount: 5 });
		expect(startRes.status).toBe(200);
		expect(await startRes.json()).toEqual({ ok: true });

		const afterStart = await getState(host.sessionCode, host.playerToken);
		expect(afterStart.body.status).toBe("in_progress");
		expect(afterStart.body.questionCount).toBe(5);
	});
});

describe("POST /api/remote/sessions/:code/leave", () => {
	it("a non-host leaving just removes them from the roster", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");

		const leaveRes = await post(host.sessionCode, "/leave", guest.playerToken);
		expect(leaveRes.status).toBe(200);

		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.body.status).toBe("lobby");
		expect(state.body.players.map((p) => p.id)).toEqual([host.playerId]);
	});

	it("the host leaving ends the session for everyone, roster still visible", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");

		const leaveRes = await post(host.sessionCode, "/leave", host.playerToken);
		expect(leaveRes.status).toBe(200);

		// The guest can still poll -- their token is still valid -- and sees
		// the session ended, rather than getting locked out entirely.
		const state = await getState(host.sessionCode, guest.playerToken);
		expect(state.body.status).toBe("ended");
		expect(state.body.players).toHaveLength(2);
	});
});

describe("POST /api/remote/sessions/:code/remove", () => {
	it("the host can remove a non-host player", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");

		const removeRes = await post(host.sessionCode, "/remove", host.playerToken, { playerId: guest.playerId });
		expect(removeRes.status).toBe(200);

		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.body.players.map((p) => p.id)).toEqual([host.playerId]);
	});
});

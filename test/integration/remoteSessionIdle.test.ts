// Idle players (remoteGameSession.ts's pruneIdle): a player unseen for
// IDLE_REMOVE_MS -- 4s here (vitest.integration.config.ts), 30 min in
// production -- is dropped on the next request anyone makes, with a feed
// line; their own next request finds their token gone. The host going
// idle outside a live game ends the session; mid-game the host is kept so
// the others can finish.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerToken: string;
	playerId: string;
}
interface StateResponse {
	status: string;
	players: { name: string }[];
	feed: { kind: string; text: string }[];
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

async function join(code: string, name: string): Promise<CreateResponse> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	expect(res.status).toBe(200);
	return res.json();
}

function poll(code: string, token: string) {
	return SELF.fetch(`https://example.com/api/remote/sessions/${code}/state?since=0`, { headers: { "X-Player-Token": token } });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Keeps one player fresh (polling every 500ms) while the clock runs past
// the 4s idle limit for anyone who isn't.
async function keepPolling(code: string, token: string, forMs: number): Promise<void> {
	const until = Date.now() + forMs;
	while (Date.now() < until) {
		expect((await poll(code, token)).status).toBe(200);
		await sleep(500);
	}
}

describe("idle players", () => {
	it("drops a guest unseen past the limit on the next request, with a feed line, and refuses their token after", { timeout: 15_000 }, async () => {
		const host = await createSession("Host");
		const guest = await join(host.sessionCode, "Guest");

		await keepPolling(host.sessionCode, host.playerToken, 4_800);

		const state = (await (await poll(host.sessionCode, host.playerToken)).json()) as StateResponse;
		expect(state.status).toBe("lobby");
		expect(state.players.map((p) => p.name)).toEqual(["Host"]);
		expect(state.feed.map((e) => e.text)).toContain("Guest was dropped after being away for 4 seconds");

		expect((await poll(host.sessionCode, guest.playerToken)).status).toBe(401);
	});

	it("ends the session when the host goes idle in the lobby", { timeout: 15_000 }, async () => {
		const host = await createSession("Host");
		const guest = await join(host.sessionCode, "Guest");

		await keepPolling(host.sessionCode, guest.playerToken, 4_800);

		const state = (await (await poll(host.sessionCode, guest.playerToken)).json()) as StateResponse;
		expect(state.status).toBe("ended");
		expect(state.feed.map((e) => e.text)).toContain("Session ended -- the host has been away too long");
	});

	it("keeps an idle host mid-game so the others can finish", { timeout: 15_000 }, async () => {
		const host = await createSession("Host");
		const guest = await join(host.sessionCode, "Guest");
		const ready = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/ready`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Player-Token": guest.playerToken },
			body: JSON.stringify({ ready: true }),
		});
		expect(ready.status).toBe(200);
		const start = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Player-Token": host.playerToken },
			body: JSON.stringify({ questionCount: 1 }),
		});
		expect(start.status).toBe(200);

		await keepPolling(host.sessionCode, guest.playerToken, 4_800);

		const state = (await (await poll(host.sessionCode, guest.playerToken)).json()) as StateResponse;
		expect(state.status).toBe("in_progress");
		expect(state.players.map((p) => p.name)).toEqual(["Host", "Guest"]);
	});
});

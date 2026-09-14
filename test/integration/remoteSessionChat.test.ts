// Chat tests for /api/remote/* -- /message's own limits (20 words, 30s
// per-player cooldown) and its appearance in /state. Own file for the
// per-file DAILY_REQUEST_BUDGET=50 reason noted in
// remoteSessionLifecycle.test.ts; helpers duplicated the way the other
// remoteSession*.test.ts files already do.
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
interface RoundBadge {
	name: string;
	url: string | null;
	country: string | null;
}
interface StateResponse {
	status: "lobby" | "in_progress" | "finished" | "ended";
	questionCount: number | null;
	players: {
		id: string;
		name: string;
		isHost: boolean;
		ready: boolean;
		away: boolean;
		wins: number;
	}[];
	feed: { id: number; kind: string; playerId: string | null; text: string }[];
	round: {
		index: number;
		total: number;
		hintsRevealed: number;
		question: { id: number; badges: RoundBadge[]; nationality: string | null; transferDates: (string | null)[] };
		winnerId: string | null;
		answerName: string | null;
		givenUpPlayerIds: string[];
	} | null;
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

async function getState(code: string, token: string): Promise<StateResponse> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/state`, {
		headers: { "X-Player-Token": token },
	});
	expect(res.status).toBe(200);
	return res.json();
}

function post(code: string, path: string, token: string, body?: unknown) {
	return SELF.fetch(`https://example.com/api/remote/sessions/${code}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Player-Token": token },
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
}

describe("POST /api/remote/sessions/:code/message", () => {
	it("posts a message into the feed every other player sees in /state, emojis intact, whitespace collapsed", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		const res = await post(host.sessionCode, "/message", guest.playerToken, { text: "  no   idea 🤷‍♂️  who this is 😂 " });
		expect(res.status).toBe(200);

		const state = await getState(host.sessionCode, host.playerToken);
		const chat = state.feed.filter((e) => e.kind === "chat");
		expect(chat).toHaveLength(1);
		expect(chat[0]).toMatchObject({ playerId: guest.playerId, text: "no idea 🤷‍♂️ who this is 😂" });
	});

	it("400s an empty message or one over 20 words; emoji runs count as one word", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/message", host.playerToken, { text: "   " })).status).toBe(400);
		expect((await post(host.sessionCode, "/message", host.playerToken, {})).status).toBe(400);

		const twentyOne = Array.from({ length: 21 }, (_, i) => `w${i}`).join(" ");
		expect((await post(host.sessionCode, "/message", host.playerToken, { text: twentyOne })).status).toBe(400);

		// Exactly 20 words, one of them a run of emojis -- fine.
		const twenty = [...Array.from({ length: 19 }, (_, i) => `w${i}`), "🔥🔥🔥"].join(" ");
		expect((await post(host.sessionCode, "/message", host.playerToken, { text: twenty })).status).toBe(200);
	});

	it("429s a second message inside 30s, saying how long is left, and allowed in the lobby", async () => {
		const host = await createSession("Host");
		// Still in the lobby -- chat isn't gated on the game having started.
		expect((await post(host.sessionCode, "/message", host.playerToken, { text: "first" })).status).toBe(200);

		const again = await post(host.sessionCode, "/message", host.playerToken, { text: "second" });
		expect(again.status).toBe(429);
		const body = (await again.json()) as { error: string; retryAfterMs: number };
		expect(body.retryAfterMs).toBeGreaterThan(0);
		expect(body.retryAfterMs).toBeLessThanOrEqual(30_000);
		expect(body.error).toMatch(/post again in \d+s/);

		// The rejected one never reached the feed.
		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.feed.filter((e) => e.kind === "chat").map((e) => e.text)).toEqual(["first"]);
	});

	it("409s once the session has ended", async () => {
		const host = await createSession("Host");
		await post(host.sessionCode, "/leave", host.playerToken);
		expect((await post(host.sessionCode, "/message", host.playerToken, { text: "anyone?" })).status).toBe(409);
	});
});

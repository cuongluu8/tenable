// The session activity feed (remoteGameSession.ts's FeedEntry / /state
// ?since=) that drives the client's chat & activity pane: what gets
// logged, incremental delivery, and persistence across Play again. Own
// file for the per-file request budget (see remoteSessionLifecycle
// .test.ts); helpers duplicated as the sibling files do.
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
	players: { id: string; name: string; isHost: boolean; ready: boolean; away: boolean; wins: number }[];
	feed: { id: number; at: number; kind: "chat" | "guess" | "give-up" | "system"; playerId: string | null; text: string; correct?: boolean; season?: string }[];
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

async function getState(code: string, token: string, since = 0): Promise<StateResponse> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/state?since=${since}`, {
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

describe("the session activity feed", () => {
	it("logs round events, every guess with its verdict, chat and give-ups; ?since= returns only what's new; it survives Play again", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await getState(host.sessionCode, host.playerToken)).feed).toEqual([]);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		let state = await getState(host.sessionCode, host.playerToken);
		expect(state.feed.map((e) => [e.kind, e.text])).toEqual([["system", "Question 1 of 1"]]);
		const afterStart = state.feed[state.feed.length - 1].id;

		await post(host.sessionCode, "/guess", guest.playerToken, { guess: "Not A Player" });
		await post(host.sessionCode, "/message", host.playerToken, { text: "tough one 😅" });
		await post(host.sessionCode, "/give-up", guest.playerToken);

		// Incremental: only entries after the id the client already has.
		state = await getState(host.sessionCode, host.playerToken, afterStart);
		expect(state.feed.map((e) => [e.kind, e.playerId, e.text, e.correct])).toEqual([
			["guess", guest.playerId, "Not A Player", false],
			["chat", host.playerId, "tough one 😅", undefined],
			["give-up", guest.playerId, "gave up", undefined],
		]);
		expect(state.feed.every((e) => e.id > afterStart && e.at > 0)).toBe(true);

		await post(host.sessionCode, "/give-up", host.playerToken);
		state = await getState(host.sessionCode, host.playerToken, state.feed[state.feed.length - 1].id);
		expect(state.feed.map((e) => e.kind)).toEqual(["give-up", "system"]);
		expect(state.feed[1].text).toMatch(/^Nobody got it -- it was /);

		// The whole history is still there on a fresh load, and Play again
		// appends to it rather than wiping it.
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await getState(host.sessionCode, host.playerToken)).status).toBe("finished");
		await post(host.sessionCode, "/restart", host.playerToken, {});
		state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("lobby");
		expect(state.feed).toHaveLength(7);
		expect(state.feed[0].text).toBe("Question 1 of 1");
		expect(state.feed[6].text).toBe("New game -- scores reset");
	});

	it("a poll echoing the last fingerprint gets a tiny 'unchanged' reply until something visible changes", async () => {
		const host = await createSession("Host");
		const url = (v: string) => `https://example.com/api/remote/sessions/${host.sessionCode}/state?since=0&v=${v}`;
		const headers = { "X-Player-Token": host.playerToken };
		const first = (await (await SELF.fetch(url(""), { headers })).json()) as { v: string };
		expect(first.v).toMatch(/^[0-9a-f]{8}$/);

		const again = (await (await SELF.fetch(url(first.v), { headers })).json()) as { unchanged?: true; v: string };
		expect(again).toEqual({ unchanged: true, v: first.v });

		// Someone joining is a visible change: full state, new fingerprint.
		await joinSession(host.sessionCode, "Guest");
		const changed = (await (await SELF.fetch(url(first.v), { headers })).json()) as { unchanged?: true; v: string; players?: unknown[] };
		expect(changed.unchanged).toBeUndefined();
		expect(changed.players).toHaveLength(2);
		expect(changed.v).not.toBe(first.v);
	});
});

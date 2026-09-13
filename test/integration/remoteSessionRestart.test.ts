// /restart tests -- a finished game back to the lobby on the same code.
// Own file for the per-file DAILY_REQUEST_BUDGET=50 reason noted in
// remoteSessionLifecycle.test.ts; helpers duplicated the way the other
// remoteSession*.test.ts files already do.
import { env, SELF } from "cloudflare:test";
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

// The fixture's club_badge_questions rows are the test oracle here, same
// role queryLocalD1() plays in scripts/playtest.ts -- never something a
// guess itself could reach over HTTP.
async function correctAnswerFor(questionId: number): Promise<string> {
	const question = await env.DB.prepare("SELECT player_id FROM club_badge_questions WHERE id = ?").bind(questionId).first<{
		player_id: number;
	}>();
	const player = await env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(question!.player_id).first<{
		canonical_name: string;
	}>();
	return player!.canonical_name;
}

describe("POST /api/remote/sessions/:code/restart", () => {
	it("host-only, finished-only; resets scores and readiness back to a fresh lobby that can start again", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		// Mid-game: not yet.
		expect((await post(host.sessionCode, "/restart", host.playerToken)).status).toBe(409);

		const round = await getState(host.sessionCode, host.playerToken);
		await post(host.sessionCode, "/guess", host.playerToken, { guess: await correctAnswerFor(round.round!.question.id) });
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		const finished = await getState(host.sessionCode, host.playerToken);
		expect(finished.status).toBe("finished");
		expect(finished.players.find((p) => p.id === host.playerId)?.wins).toBe(1);

		// Guests can't.
		expect((await post(host.sessionCode, "/restart", guest.playerToken)).status).toBe(403);

		expect((await post(host.sessionCode, "/restart", host.playerToken)).status).toBe(200);
		const lobby = await getState(host.sessionCode, guest.playerToken);
		expect(lobby.status).toBe("lobby");
		expect(lobby.round).toBeNull();
		expect(lobby.questionCount).toBeNull();
		// Same two seats, scoreboard wiped, guest has to re-ready.
		expect(lobby.players.map((p) => p.id).sort()).toEqual([host.playerId, guest.playerId].sort());
		expect(lobby.players.every((p) => p.wins === 0)).toBe(true);
		expect(lobby.players.find((p) => p.id === guest.playerId)?.ready).toBe(false);
		expect(lobby.players.find((p) => p.id === host.playerId)?.ready).toBe(true);

		// And the normal flow runs again from there.
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(409); // guest not ready
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);
		const again = await getState(host.sessionCode, host.playerToken);
		expect(again.status).toBe("in_progress");
		expect(again.round!.index).toBe(0);
		expect(again.round!.total).toBe(2);
	});
});

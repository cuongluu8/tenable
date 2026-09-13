// Give-up tests for /api/remote/* -- one player bowing out of a round, the
// round resolving with no winner once everyone active has, and how that
// interacts with the ready-to-advance gate and players leaving. Split out
// of remoteSessionGameplay.test.ts purely for the per-file
// DAILY_REQUEST_BUDGET=50 reason noted there (its own cases already sit
// close to that budget); the helpers below are the same ones that file
// uses, duplicated the way the other remoteSession*.test.ts files already
// do rather than shared through a module the per-file isolation would
// have to be reasoned about for.
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

describe("POST /api/remote/sessions/:code/give-up", () => {
	it("bows one player out without deciding the round; the others keep racing and can still win", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		expect((await post(host.sessionCode, "/give-up", guest.playerToken)).status).toBe(200);

		// Recorded, but the round is still open and the answer still hidden
		// -- someone else is still racing for it (see /give-up's own doc).
		const open = await getState(host.sessionCode, guest.playerToken);
		expect(open.round!.givenUpPlayerIds).toEqual([guest.playerId]);
		expect(open.round!.winnerId).toBeNull();
		expect(open.round!.answerName).toBeNull();
		expect(open.round!.hintsRevealed).toBe(0);

		// A give-up is final for the round: the bowed-out player's own
		// guesses are rejected, even a correct one.
		const answer = await correctAnswerFor(open.round!.question.id);
		expect((await post(host.sessionCode, "/guess", guest.playerToken, { guess: answer })).status).toBe(409);
		// ...and repeating it is a harmless no-op, not an error.
		expect((await post(host.sessionCode, "/give-up", guest.playerToken)).status).toBe(200);
		expect((await getState(host.sessionCode, guest.playerToken)).round!.givenUpPlayerIds).toEqual([guest.playerId]);

		// The player still racing wins exactly as before.
		const win = await post(host.sessionCode, "/guess", host.playerToken, { guess: answer });
		expect(win.status).toBe(200);
		const after = await getState(host.sessionCode, guest.playerToken);
		expect(after.round!.winnerId).toBe(host.playerId);
		expect(after.round!.answerName).toBe(answer);

		// Once decided, giving up is as pointless as guessing -- rejected.
		expect((await post(host.sessionCode, "/give-up", host.playerToken)).status).toBe(409);
	});

	it("resolves the round with no winner once every active player has given up, then the ready gate advances", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);
		const round0 = await getState(host.sessionCode, host.playerToken);
		const answer0 = await correctAnswerFor(round0.round!.question.id);

		await post(host.sessionCode, "/give-up", host.playerToken);
		expect((await getState(host.sessionCode, host.playerToken)).round!.answerName).toBeNull();

		expect((await post(host.sessionCode, "/give-up", guest.playerToken)).status).toBe(200);

		const resolved = await getState(host.sessionCode, host.playerToken);
		expect(resolved.status).toBe("in_progress");
		expect(resolved.round!.index).toBe(0);
		expect(resolved.round!.winnerId).toBeNull();
		expect(resolved.round!.answerName).toBe(answer0);
		// Nothing left to race for, so every hint tier is open -- same as
		// after a win.
		expect(resolved.round!.hintsRevealed).toBe(3);
		expect(resolved.players.every((p) => p.wins === 0)).toBe(true);
		expect(resolved.round!.givenUpPlayerIds.sort()).toEqual([host.playerId, guest.playerId].sort());

		// The same "confirm you saw the answer" gate a won round uses.
		expect((await post(host.sessionCode, "/guess", guest.playerToken, { guess: answer0 })).status).toBe(409);
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		const round1 = await getState(host.sessionCode, host.playerToken);
		expect(round1.round!.index).toBe(1);
		expect(round1.round!.answerName).toBeNull();
		// Fresh round, fresh give-up list -- nobody's bowed out of THIS one.
		expect(round1.round!.givenUpPlayerIds).toEqual([]);
	});

	it("a solo host giving up moves straight on, same as a solo win does", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		expect((await post(host.sessionCode, "/give-up", host.playerToken)).status).toBe(200);

		const final = await getState(host.sessionCode, host.playerToken);
		expect(final.status).toBe("finished");
		expect(final.round!.winnerId).toBeNull();
		expect(final.round!.answerName).toBe(await correctAnswerFor(final.round!.question.id));
	});

	it("resolves the round when the last player still racing leaves everyone else who'd given up", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);

		await post(host.sessionCode, "/give-up", host.playerToken);
		expect((await post(host.sessionCode, "/leave", guest.playerToken)).status).toBe(200);

		// With the guest gone, the host is the only active player and has
		// already given up -- the round resolves, and (no non-host players
		// left to wait on) the advance gate is satisfied vacuously, so the
		// host lands on round 1 rather than stuck on a round nobody's playing.
		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("in_progress");
		expect(state.round!.index).toBe(1);
		expect(state.round!.givenUpPlayerIds).toEqual([]);
	});

	it("409s giving up before the game has started", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/give-up", host.playerToken)).status).toBe(409);
	});
});

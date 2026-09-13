// Phase 2 gameplay tests for /api/remote/* -- question serving, guessing,
// hint gating, and the round-advance gate on top of Phase 1's lobby (see
// remoteSessionLifecycle.test.ts). Kept in its own file for the same
// per-file request-budget reason noted there.
//
// The correct answer for a round is never exposed over HTTP (same
// server-authoritative principle as single-player -- see
// remoteGameSession.ts's own doc), so tests here read it directly out of
// D1, the same "test oracle, never used by the guesses themselves"
// pattern scripts/playtest.ts already uses against the real API.
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
interface GuessResponse {
	result: "correct" | "wrong";
	answerName?: string;
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

describe("question content after /start", () => {
	it("serves a real question with hint-gated fields hidden immediately after start", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("in_progress");
		expect(state.round).not.toBeNull();
		expect(state.round!.total).toBe(1);
		expect(state.round!.index).toBe(0);
		// hintsRevealed reads elapsed wall-clock time since the round started
		// (30s per tier) -- immediately after /start, nothing has elapsed, so
		// nothing hint-gated should be visible yet. Actual tier-by-tier
		// reveal timing (30s/60s/90s) isn't covered here -- it reads real
		// Date.now() inside the Workers runtime, which a test-process fake
		// timer can't reach across the isolate boundary, and a real 90s
		// sleep is too slow for this suite (same tradeoff already made for
		// Phase 1's "away" timing -- see that file's own notes).
		expect(state.round!.hintsRevealed).toBe(0);
		expect(state.round!.question.badges).toHaveLength(3);
		for (const badge of state.round!.question.badges) {
			expect(badge.country).toBeNull();
			expect(badge.name).toBeTruthy();
		}
		expect(state.round!.question.nationality).toBeNull();
		expect(state.round!.question.transferDates.every((d) => d === null)).toBe(true);
		// Never revealed pre-guess, at any hint tier -- see class doc.
		expect(JSON.stringify(state.round)).not.toContain("player_id");
	});
});

describe("POST /api/remote/sessions/:code/guess", () => {
	it("a correct guess wins the round, increments wins, and reveals the answer", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		expect((await post(host.sessionCode, "/ready", guest.playerToken, { ready: true })).status).toBe(200);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);

		const before = await getState(host.sessionCode, host.playerToken);
		const answer = await correctAnswerFor(before.round!.question.id);

		const guessRes = await post(host.sessionCode, "/guess", host.playerToken, { guess: answer });
		expect(guessRes.status).toBe(200);
		const guessBody = (await guessRes.json()) as GuessResponse;
		expect(guessBody).toEqual({ result: "correct", answerName: answer });

		const after = await getState(host.sessionCode, host.playerToken);
		expect(after.round!.winnerId).toBe(host.playerId);
		expect(after.round!.answerName).toBe(answer);
		expect(after.players.find((p) => p.id === host.playerId)?.wins).toBe(1);

		// The round is already decided -- a second guess (even the guest's
		// first attempt) is rejected outright, not scored.
		const tooLate = await post(host.sessionCode, "/guess", guest.playerToken, { guess: "anything" });
		expect(tooLate.status).toBe(409);
	});

	it("wrong guesses don't end the round and can be repeated -- unlimited attempts", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 })).status).toBe(200);

		const first = await post(host.sessionCode, "/guess", host.playerToken, { guess: "Not The Right Answer" });
		expect(first.status).toBe(200);
		expect(await first.json()).toEqual({ result: "wrong" });

		const second = await post(host.sessionCode, "/guess", host.playerToken, { guess: "Still Not It" });
		expect(await second.json()).toEqual({ result: "wrong" });

		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.round!.winnerId).toBeNull();
	});

	it("409s guessing before the game has started, and 400s on a missing guess", async () => {
		const host = await createSession("Host");
		const beforeStart = await post(host.sessionCode, "/guess", host.playerToken, { guess: "x" });
		expect(beforeStart.status).toBe(409);

		await post(host.sessionCode, "/start", host.playerToken, { questionCount: 1 });
		const missingGuess = await post(host.sessionCode, "/guess", host.playerToken, {});
		expect(missingGuess.status).toBe(400);
	});
});

describe("the round-advance gate", () => {
	it("advances only once every non-host player is ready, and finishes after the last question", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		expect((await post(host.sessionCode, "/ready", guest.playerToken, { ready: true })).status).toBe(200);
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);

		// /start's own transition into round 0 resets the guest's "ready to
		// start" flag back to false for round 0's own "ready to advance"
		// gate -- see PlayerRecord.ready's own doc.
		const round0 = await getState(host.sessionCode, host.playerToken);
		expect(round0.players.find((p) => p.id === guest.playerId)?.ready).toBe(false);

		const answer0 = await correctAnswerFor(round0.round!.question.id);
		await post(host.sessionCode, "/guess", host.playerToken, { guess: answer0 });

		// Marking ready before the round has a winner would be premature
		// (see maybeAdvanceRound's own doc) -- here it's already won, so
		// this is the real "confirm you saw it, let's move on" case.
		const readyRes = await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect(readyRes.status).toBe(200);

		const round1 = await getState(host.sessionCode, host.playerToken);
		expect(round1.status).toBe("in_progress");
		expect(round1.round!.index).toBe(1);
		expect(round1.round!.winnerId).toBeNull();
		// Reset again for round 1's own advance gate.
		expect(round1.players.find((p) => p.id === guest.playerId)?.ready).toBe(false);

		const answer1 = await correctAnswerFor(round1.round!.question.id);
		await post(host.sessionCode, "/guess", host.playerToken, { guess: answer1 });
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });

		const final = await getState(host.sessionCode, host.playerToken);
		expect(final.status).toBe("finished");
		// The last question played stays visible for the final recap rather
		// than disappearing once the deck is exhausted.
		expect(final.round!.index).toBe(1);
		expect(final.round!.answerName).toBe(answer1);
		expect(final.players.find((p) => p.id === host.playerId)?.wins).toBe(2);
	});
});

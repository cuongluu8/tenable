// Roll of Honour's Turn mode over remote play (remoteGameSession.ts's
// settleHonourTurn): seasons in grid order, the opening guess rotating a
// seat per tile, one guess per turn, a hint after each full trip round
// the table, and the winner revealed with nobody credited after the
// third. MIN_REVEAL_MS is 0 here, so a decided tile moves straight on to
// the next. Own file for the per-file DAILY_REQUEST_BUDGET=50 reason
// noted in remoteSessionLifecycle.test.ts.
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
	gameType: string;
	questionCount: number | null;
	players: { id: string; name: string; isHost: boolean; ready: boolean; away: boolean; wins: number }[];
	honour: {
		competitionId: string;
		competitionName: string;
		mode: "party" | "turn";
		turn: { turnMs: number; season: string; playerId: string | null; deadline: number | null; hints: string[]; revealed: boolean } | null;
		tiles: { season: string; status: "open" | "locked" | "answered"; lockedBy: string | null; answeredBy: string | null; winner: string | null; imageUrl: string | null }[];
		givenUpPlayerIds: string[];
	} | null;
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
		body: JSON.stringify({ hostName, gameType: "roll-of-honour" }),
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


const answer = (code: string, token: string, season: string, guess: string) => post(code, "/tile/answer", token, { season, guess });

describe("Roll of Honour, Turn mode", () => {
	it("goes round the table with a hint per pass, reveals a missed season, and rotates who opens the next", async () => {
		const host = await createSession("Cuong");
		const luka = await joinSession(host.sessionCode, "Luka");
		const geoff = await joinSession(host.sessionCode, "Geoff");
		const code = host.sessionCode;
		await post(code, "/ready", luka.playerToken, { ready: true });
		await post(code, "/ready", geoff.playerToken, { ready: true });
		expect((await post(code, "/start", host.playerToken, { competitionId: "european-cup", mode: "league" })).status).toBe(400);
		expect((await post(code, "/start", host.playerToken, { competitionId: "european-cup", mode: "turn", turnSeconds: 4 })).status).toBe(400);
		expect((await post(code, "/start", host.playerToken, { competitionId: "european-cup", mode: "turn", turnSeconds: 10 })).status).toBe(200);

		let state = await getState(code, host.playerToken);
		expect(state.honour!.mode).toBe("turn");
		expect(state.honour!.turn).toMatchObject({ season: "1955-56", playerId: host.playerId, hints: [], revealed: false, turnMs: 10_000 });
		// The season in play is marked as the current player's on the grid.
		expect(state.honour!.tiles[0]).toMatchObject({ status: "locked", lockedBy: host.playerId, winner: null });
		expect(state.honour!.tiles[1].status).toBe("open");

		// Not your turn, not the season in play, and nothing to select.
		expect((await answer(code, luka.playerToken, "1955-56", "Real Madrid")).status).toBe(409);
		expect((await answer(code, host.playerToken, "1956-57", "Real Madrid")).status).toBe(409);
		expect((await post(code, "/tile/select", host.playerToken, { season: "1956-57" })).status).toBe(409);

		// Three passes of wrong answers, in seat order each time.
		const table = [host, luka, geoff];
		for (const expectedHints of [["Country: Spain"], ["Country: Spain", "R _ _ _  _ _ _ _ _ _"]]) {
			for (const p of table) {
				const res = await answer(code, p.playerToken, "1955-56", "Benfica");
				expect(await res.json()).toMatchObject({ result: "wrong" });
			}
			state = await getState(code, host.playerToken);
			expect(state.honour!.turn).toMatchObject({ season: "1955-56", playerId: host.playerId, hints: expectedHints });
			expect(JSON.stringify(state.honour)).not.toContain("Real Madrid");
		}
		for (const p of table) await answer(code, p.playerToken, "1955-56", "Benfica");

		// Nobody got it: revealed with no owner and no point, and the next
		// season opens with the next seat.
		state = await getState(code, host.playerToken);
		expect(state.honour!.tiles[0]).toMatchObject({ status: "answered", answeredBy: null, winner: "Real Madrid" });
		expect(state.players.map((p) => p.wins)).toEqual([0, 0, 0]);
		expect(state.honour!.turn).toMatchObject({ season: "1956-57", playerId: luka.playerId, hints: [] });

		// A right answer scores and moves on; the seat after opens the next.
		expect(await (await answer(code, luka.playerToken, "1956-57", "real madrid")).json()).toMatchObject({ result: "correct", winner: "Real Madrid" });
		state = await getState(code, host.playerToken);
		expect(state.honour!.tiles[1]).toMatchObject({ status: "answered", answeredBy: luka.playerId, winner: "Real Madrid" });
		expect(state.players.find((p) => p.id === luka.playerId)!.wins).toBe(1);
		expect(state.honour!.turn).toMatchObject({ season: "1957-58", playerId: geoff.playerId });
	});

	it("hints about the name only when every winner is from one country, and skips a player who gave up", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		const code = host.sessionCode;
		await post(code, "/ready", guest.playerToken, { ready: true });
		expect((await post(code, "/start", host.playerToken, { competitionId: "first-division", mode: "turn" })).status).toBe(200);

		// 1888-89: Preston North End.
		await answer(code, host.playerToken, "1888-89", "Everton");
		await answer(code, guest.playerToken, "1888-89", "Everton");
		let state = await getState(code, host.playerToken);
		expect(state.honour!.turn).toMatchObject({ turnMs: 10_000, playerId: host.playerId, hints: ["P _ _ _ _ _ _  _ _ _ _ _  _ _ _"] });
		await answer(code, host.playerToken, "1888-89", "Everton");
		await answer(code, guest.playerToken, "1888-89", "Everton");
		state = await getState(code, host.playerToken);
		expect(state.honour!.turn).toMatchObject({ playerId: host.playerId, hints: ["P _ _ _ _ _ _  _ _ _ _ _  _ _ D"] });

		// The host gives up on their own turn: it passes at once, and from
		// then on every turn is the guest's.
		expect((await post(code, "/give-up", host.playerToken)).status).toBe(200);
		state = await getState(code, guest.playerToken);
		expect(state.honour!.turn).toMatchObject({ season: "1888-89", playerId: guest.playerId });
		expect(await (await answer(code, guest.playerToken, "1888-89", "Preston")).json()).toMatchObject({ result: "correct" });
		state = await getState(code, guest.playerToken);
		expect(state.honour!.turn).toMatchObject({ season: "1889-90", playerId: guest.playerId });
		expect((await answer(code, host.playerToken, "1889-90", "Preston North End")).status).toBe(409);
	});

	it("passes the turn when the timer runs out; Party mode has no turn at all", async () => {
		const party = await createSession("Party");
		expect((await post(party.sessionCode, "/start", party.playerToken, { competitionId: "european-cup" })).status).toBe(200);
		expect((await getState(party.sessionCode, party.playerToken)).honour).toMatchObject({ mode: "party", turn: null });

		// A table of one, 5s a turn: running out ends the first pass, so the
		// same player is up again with the first hint.
		const host = await createSession("Solo");
		expect((await post(host.sessionCode, "/start", host.playerToken, { competitionId: "european-cup", mode: "turn", turnSeconds: 5 })).status).toBe(200);
		const before = await getState(host.sessionCode, host.playerToken);
		expect(before.honour!.turn).toMatchObject({ playerId: host.playerId, hints: [] });
		await new Promise((r) => setTimeout(r, 5_300));
		const after = await getState(host.sessionCode, host.playerToken);
		expect(after.honour!.turn).toMatchObject({ season: "1955-56", playerId: host.playerId, hints: ["Country: Spain"] });
		expect(after.honour!.turn!.deadline!).toBeGreaterThan(before.honour!.turn!.deadline!);
	}, 15_000);
});

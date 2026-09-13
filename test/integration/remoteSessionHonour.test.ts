// Roll of Honour over remote play -- the grid engine (lib/rollOfHonour.ts
// + remoteGameSession.ts's /tile/* routes): start builds the grid with
// every winner hidden; select locks a season; a wrong answer frees it and
// blocks the guesser from it; give up bows out of the whole game; the
// grid is revealed once the game finishes. The curated data is the real
// list, so the answers used here are real (1955-56: Real Madrid) -- the
// fixture DB has no such club, which is exactly the "graded on the
// curated name, no badge" fallback path. Own file for the per-file
// DAILY_REQUEST_BUDGET=50 reason noted in remoteSessionLifecycle.test.ts.
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

describe("Roll of Honour over remote play", () => {
	it("lists every competition, in chronological order per country", async () => {
		const res = await SELF.fetch("https://example.com/api/roll-of-honour/competitions");
		expect(res.status).toBe(200);
		const { competitions } = (await res.json()) as { competitions: { id: string; name: string; seasonCount: number }[] };
		expect(competitions.map((c) => [c.id, c.seasonCount])).toEqual([
			["european-cup", 37],
			["champions-league", 33],
			["first-division", 93],
			["premier-league", 34],
		]);
	});

	it("starts as a grid of the chosen competition with every winner hidden, no question count needed", async () => {
		const host = await createSession("Host");
		// Unknown competition is refused; omitted defaults to the Champions
		// League era.
		expect((await post(host.sessionCode, "/start", host.playerToken, { competitionId: "world-cup" })).status).toBe(400);
		expect((await post(host.sessionCode, "/start", host.playerToken, {})).status).toBe(200);
		const state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("in_progress");
		expect(state.gameType).toBe("roll-of-honour");
		expect(state.round).toBeNull();
		expect(state.honour!.competitionName).toBe("Champions League");
		expect(state.honour!.tiles).toHaveLength(33);
		expect(state.honour!.tiles[0].season).toBe("1992-93");
		expect(state.honour!.tiles[32].season).toBe("2024-25");
		expect(state.honour!.tiles.every((t) => t.status === "open" && t.winner === null && t.imageUrl === null)).toBe(true);
		expect(JSON.stringify(state.honour)).not.toContain("Marseille");
		// The round formats' guess route isn't this game's.
		expect((await post(host.sessionCode, "/guess", host.playerToken, { guess: "Real Madrid" })).status).toBe(409);
	});

	it("select locks a season for one player; a wrong answer frees it and blocks that player; a right one scores and reveals it", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		// The European Cup grid: 1955-56 to 1991-92.
		expect((await post(host.sessionCode, "/start", host.playerToken, { competitionId: "european-cup" })).status).toBe(200);
		const started = await getState(host.sessionCode, host.playerToken);
		expect(started.honour!.competitionName).toBe("European Cup");
		expect(started.honour!.tiles).toHaveLength(37);
		expect(started.honour!.tiles[36].season).toBe("1991-92");

		// Answering without holding the tile is refused.
		expect((await post(host.sessionCode, "/tile/answer", guest.playerToken, { season: "1955-56", guess: "Real Madrid" })).status).toBe(409);

		const sel = await post(host.sessionCode, "/tile/select", guest.playerToken, { season: "1955-56" });
		expect(sel.status).toBe(200);
		expect(await sel.json()).toEqual({ ok: true, lockedForMs: 20_000 });
		// Nobody else can take it while held.
		expect((await post(host.sessionCode, "/tile/select", host.playerToken, { season: "1955-56" })).status).toBe(409);
		let state = await getState(host.sessionCode, host.playerToken);
		expect(state.honour!.tiles[0]).toMatchObject({ status: "locked", lockedBy: guest.playerId, winner: null });

		// Wrong: freed, and the guesser is blocked from it for 5s.
		const wrong = await post(host.sessionCode, "/tile/answer", guest.playerToken, { season: "1955-56", guess: "Chelsea" });
		expect(wrong.status).toBe(200);
		expect(await wrong.json()).toEqual({ result: "wrong", retryAfterMs: 5_000 });
		state = await getState(host.sessionCode, host.playerToken);
		expect(state.honour!.tiles[0]).toMatchObject({ status: "open", lockedBy: null, winner: null });
		const blocked = await post(host.sessionCode, "/tile/select", guest.playerToken, { season: "1955-56" });
		expect(blocked.status).toBe(409);
		const blockedBody = (await blocked.json()) as { retryAfterMs: number };
		expect(blockedBody.retryAfterMs).toBeGreaterThan(0);
		expect(blockedBody.retryAfterMs).toBeLessThanOrEqual(5_000);

		// ...but someone else can take it straight away, and an alias counts.
		expect((await post(host.sessionCode, "/tile/select", host.playerToken, { season: "1955-56" })).status).toBe(200);
		const right = await post(host.sessionCode, "/tile/answer", host.playerToken, { season: "1955-56", guess: "real" });
		expect(right.status).toBe(200);
		expect(await right.json()).toMatchObject({ result: "correct", winner: "Real Madrid" });
		state = await getState(host.sessionCode, host.playerToken);
		expect(state.honour!.tiles[0]).toMatchObject({ status: "answered", answeredBy: host.playerId, winner: "Real Madrid" });
		expect(state.honour!.tiles[1].winner).toBeNull(); // Only the answered tile is revealed.
		expect(state.players.find((p) => p.id === host.playerId)?.wins).toBe(1);
		// Answered tiles can't be taken again.
		expect((await post(host.sessionCode, "/tile/select", guest.playerToken, { season: "1955-56" })).status).toBe(409);
	});

	it("give up bows a player out; once everyone active has, the game finishes and the whole roll is revealed; Play again resets the grid", async () => {
		const host = await createSession("Host");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { competitionId: "european-cup" })).status).toBe(200);

		expect((await post(host.sessionCode, "/give-up", guest.playerToken)).status).toBe(200);
		let state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("in_progress");
		expect(state.honour!.givenUpPlayerIds).toEqual([guest.playerId]);
		// Bowed out means out: no more tiles for them.
		expect((await post(host.sessionCode, "/tile/select", guest.playerToken, { season: "1960-61" })).status).toBe(409);

		expect((await post(host.sessionCode, "/give-up", host.playerToken)).status).toBe(200);
		state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("finished");
		expect(state.honour!.tiles.every((t) => t.winner !== null)).toBe(true);
		expect(state.honour!.tiles.find((t) => t.season === "1985-86")?.winner).toBe("Steaua București");

		expect((await post(host.sessionCode, "/restart", host.playerToken, {})).status).toBe(200);
		state = await getState(host.sessionCode, host.playerToken);
		expect(state.status).toBe("lobby");
		expect(state.honour).toBeNull();
	});
});

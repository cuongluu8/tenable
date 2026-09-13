// Teammate Tell as a remote game -- gameType at /create, the "I played
// with..." question shape with its hint fields withheld server-side, and
// grading against teammate_questions. Everything else (ready gate, give
// up, chat, restart) is format-agnostic and covered by the sibling files.
// Own file for the per-file DAILY_REQUEST_BUDGET=50 reason noted in
// remoteSessionLifecycle.test.ts; helpers duplicated as those files do
// (here pointed at teammate_questions as the answer oracle). The fixture
// has exactly two teammate_questions rows, hence questionCount <= 2.
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
	gameType: "club-badges" | "teammates";
	round: {
		index: number;
		total: number;
		hintsRevealed: number;
		question: {
			id: number;
			teammates?: string[];
			cardHints?: { club: string | null; image: string | null; years: string | null }[];
			badges?: RoundBadge[];
			nationality: string | null;
		};
		winnerId: string | null;
		answerName: string | null;
		givenUpPlayerIds: string[];
	} | null;
}

async function createSession(hostName: string, gameType = "teammates"): Promise<CreateResponse> {
	const res = await SELF.fetch("https://example.com/api/remote/sessions", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ hostName, gameType }),
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
	const question = await env.DB.prepare("SELECT player_id FROM teammate_questions WHERE id = ?").bind(questionId).first<{
		player_id: number;
	}>();
	const player = await env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(question!.player_id).first<{
		canonical_name: string;
	}>();
	return player!.canonical_name;
}

describe("Teammate Tell over remote play", () => {
	it("400s an unknown gameType", async () => {
		const res = await SELF.fetch("https://example.com/api/remote/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ hostName: "Host", gameType: "top-10" }),
		});
		expect(res.status).toBe(400);
	});

	it("serves clue names with every hint field withheld, reveals them once decided, and grades against the right table", async () => {
		const host = await createSession("Host");
		expect((await getState(host.sessionCode, host.playerToken)).gameType).toBe("teammates");
		const guest = await joinSession(host.sessionCode, "Guest");
		await post(host.sessionCode, "/ready", guest.playerToken, { ready: true });
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);

		const open = await getState(host.sessionCode, guest.playerToken);
		const q = open.round!.question;
		expect(q.badges).toBeUndefined();
		expect(q.teammates).toHaveLength(3);
		for (const name of q.teammates!) expect(name).toBeTruthy();
		// Tier 0: nothing hint-gated is visible -- club/image/years blanked
		// per card (or no cards at all for a row with no hints), no
		// nationality. The answer never appears in any form.
		for (const card of q.cardHints!) {
			expect(card.club).toBeNull();
			expect(card.image).toBeNull();
			expect(card.years).toBeNull();
		}
		expect(q.nationality).toBeNull();
		expect(JSON.stringify(open.round)).not.toContain("player_id");

		// Wrong guesses are wrong here too.
		expect(await (await post(host.sessionCode, "/guess", host.playerToken, { guess: "Not A Player" })).json()).toEqual({ result: "wrong" });

		const answer = await correctAnswerFor(q.id);
		const win = await post(host.sessionCode, "/guess", guest.playerToken, { guess: answer });
		expect(win.status).toBe(200);
		expect(await win.json()).toEqual({ result: "correct", answerName: answer });

		// Decided: every tier open, so whatever hint data the row has is
		// now visible (the fixture's hinted row carries a country).
		const decided = await getState(host.sessionCode, host.playerToken);
		expect(decided.round!.winnerId).toBe(guest.playerId);
		expect(decided.round!.hintsRevealed).toBe(3);
		const dq = decided.round!.question;
		if (dq.cardHints!.length > 0) {
			expect(dq.cardHints![0].club).toBeTruthy();
			expect(dq.cardHints![0].years).toBeTruthy();
			expect(dq.nationality).toBe("Fixture Country");
		}
	});
});

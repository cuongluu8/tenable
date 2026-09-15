// Guesses are graded inside the session object from answers resolved at
// /start (remoteGameSession.ts's SessionRecord.answers, lib/
// checkPlayerGuess.ts's RoundAnswer) -- no D1 read per guess. The
// fixture's question rows are the oracle, as in remoteSessionGameplay.
import { env, runInDurableObject, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerToken: string;
	playerId: string;
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

function post(code: string, path: string, token: string, body?: unknown) {
	return SELF.fetch(`https://example.com/api/remote/sessions/${code}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Player-Token": token },
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
}

async function oracle(questionId: number): Promise<{ name: string; aliases: string[] }> {
	const q = await env.DB.prepare("SELECT player_id FROM club_badge_questions WHERE id = ?").bind(questionId).first<{ player_id: number }>();
	const p = await env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(q!.player_id).first<{ canonical_name: string }>();
	const a = await env.DB.prepare("SELECT alias FROM entity_aliases WHERE entity_id = ?").bind(q!.player_id).all<{ alias: string }>();
	return { name: p!.canonical_name, aliases: (a.results ?? []).map((r) => r.alias) };
}

describe("in-object grading", () => {
	it("stores every question's answer at /start, never exposes it, and grades a guess from it", async () => {
		const host = await createSession("Host");
		expect((await post(host.sessionCode, "/start", host.playerToken, { questionCount: 2 })).status).toBe(200);

		const stateRes = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state`, { headers: { "X-Player-Token": host.playerToken } });
		const state = (await stateRes.json()) as { round: { question: { id: number } } };
		const questionId = state.round.question.id;
		const truth = await oracle(questionId);

		// Stored alongside the deck, one per question, keys collapsed.
		const stored = await runInDurableObject(env.REMOTE_GAME_SESSION.get(env.REMOTE_GAME_SESSION.idFromName(host.sessionCode)), (_i, s) => {
			const row = s.storage.sql.exec<{ data: string }>("SELECT data FROM questions WHERE id = 1").one();
			return JSON.parse(row.data) as { questions: { id: number }[]; answers: { name: string; keys: string[] }[] };
		});
		expect(stored.answers).toHaveLength(2);
		const idx = stored.questions.findIndex((q) => q.id === questionId);
		expect(stored.answers[idx].name).toBe(truth.name);
		expect(stored.answers[idx].keys).toContain(truth.name.toLowerCase().replace(/[^a-z0-9]/g, ""));

		// The public state carries the question, not the answer.
		expect(JSON.stringify(state)).not.toContain(truth.name);

		// Graded from the stored answer: an alias is accepted, a wrong name
		// is not, and the reveal names the canonical answer.
		const wrong = await post(host.sessionCode, "/guess", host.playerToken, { guess: "Nobody At All" });
		expect(((await wrong.json()) as { result: string }).result).toBe("wrong");
		const byAlias = truth.aliases[0] ?? truth.name;
		const right = await post(host.sessionCode, "/guess", host.playerToken, { guess: byAlias.toUpperCase() });
		const graded = (await right.json()) as { result: string; answerName: string };
		expect(graded.result).toBe("correct");
		expect(graded.answerName).toBe(truth.name);
	});
});

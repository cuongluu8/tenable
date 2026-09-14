// The remote session's storage layout (remoteGameSession.ts, "Storage"
// section of the constructor): one SQLite row per player / feed entry /
// tile rather than two whole-record KV values, and a one-time migration
// for a session that was persisted the old way before the switch.
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

async function join(code: string, name: string): Promise<CreateResponse> {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	expect(res.status).toBe(200);
	return res.json();
}

function stubFor(code: string) {
	return env.REMOTE_GAME_SESSION.get(env.REMOTE_GAME_SESSION.idFromName(code));
}

const count = (state: DurableObjectState, table: string) => state.storage.sql.exec<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`).one().n;

describe("remote session storage", () => {
	it("keeps one row per player and per feed entry, and the deck out of the session row", async () => {
		const host = await createSession("Host");
		const guest = await join(host.sessionCode, "Guest");
		const post = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/message`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Player-Token": guest.playerToken },
			body: JSON.stringify({ text: "hello" }),
		});
		expect(post.status).toBe(200);

		await runInDurableObject(stubFor(host.sessionCode), (_instance, state) => {
			expect(count(state, "players")).toBe(2);
			expect(count(state, "feed")).toBe(1);
			expect(count(state, "session")).toBe(1);
			const core = JSON.parse(state.storage.sql.exec<{ data: string }>("SELECT data FROM session WHERE id = 1").one().data) as Record<string, unknown>;
			expect(core.questions).toBeUndefined();
			expect(core.feed).toBeUndefined();
			expect(state.storage.sql.exec<{ text: string }>("SELECT text FROM feed").one().text).toBe("hello");
		});

		// Leaving deletes just that player's row.
		const leave = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/leave`, { method: "POST", headers: { "X-Player-Token": guest.playerToken } });
		expect(leave.status).toBe(200);
		await runInDurableObject(stubFor(host.sessionCode), (_instance, state) => {
			expect(count(state, "players")).toBe(1);
		});
	});

	it("migrates a session persisted as the old two KV values on first read", async () => {
		// Build a legacy-shaped record from a real one: the pre-switch format
		// was the whole SessionRecord (questions, feed and all) under
		// "session" plus the roster under "players".
		const source = await createSession("Host");
		const legacy = await runInDurableObject(stubFor(source.sessionCode), (_instance, state) => {
			const sql = state.storage.sql;
			const core = JSON.parse(sql.exec<{ data: string }>("SELECT data FROM session WHERE id = 1").one().data) as Record<string, unknown>;
			const questions = JSON.parse(sql.exec<{ data: string }>("SELECT data FROM questions WHERE id = 1").one().data) as unknown[];
			const players = sql
				.exec<{ data: string }>("SELECT data FROM players")
				.toArray()
				.map((r) => JSON.parse(r.data) as Record<string, unknown>);
			return { session: { ...core, questions, feed: [], feedNextId: 1, honour: null }, players };
		});

		// A never-touched object gets only the KV values, as a deploy-time
		// session would have.
		const code = "KVSESH";
		await runInDurableObject(stubFor(code), async (_instance, state) => {
			await state.storage.put({ session: legacy.session, players: legacy.players });
			expect(count(state, "session")).toBe(0);
		});

		const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/state`, { headers: { "X-Player-Token": source.playerToken } });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { players: { name: string }[]; status: string };
		expect(body.status).toBe("lobby");
		expect(body.players.map((p) => p.name)).toEqual(["Host"]);

		await runInDurableObject(stubFor(code), async (_instance, state) => {
			expect(count(state, "session")).toBe(1);
			expect(count(state, "players")).toBe(1);
			expect(await state.storage.get("session")).toBeUndefined();
			expect(await state.storage.get("players")).toBeUndefined();
		});
	});
});

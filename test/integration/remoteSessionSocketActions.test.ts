// Actions over the socket (remoteGameSession.ts's webSocketMessage): a
// client sends {id, type, body} on its open socket and gets {id, status,
// body} back -- the same route, rules and reply shape as the HTTP POST,
// with the push to every socket following as for any write. Unknown
// types are 400, a burst past the per-player guard is 429.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerToken: string;
	playerId: string;
}
interface Push {
	status: string;
	players: { id: string; name: string; ready: boolean }[];
	round: { answerName: string | null } | null;
	feed: { kind: string; text: string }[];
}
interface Reply {
	id: string;
	status: number;
	body: Record<string, unknown>;
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

async function connect(code: string, token: string) {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/ws?token=${token}&since=0`, { headers: { Upgrade: "websocket" } });
	expect(res.status).toBe(101);
	const ws = res.webSocket!;
	const pushes: Push[] = [];
	const replies = new Map<string, Reply>();
	const waiters: (() => void)[] = [];
	ws.addEventListener("message", (e) => {
		if (e.data === "pong") return;
		const msg = JSON.parse(e.data as string) as Push | Reply;
		if ("id" in msg && typeof msg.id === "string") replies.set(msg.id, msg as Reply);
		else pushes.push(msg as Push);
		for (const w of waiters.splice(0)) w();
	});
	ws.accept();
	const until = async (pred: () => boolean, what: string) => {
		const deadline = Date.now() + 3_000;
		while (!pred()) {
			if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
			await new Promise<void>((r) => {
				waiters.push(r);
				setTimeout(r, 100);
			});
		}
	};
	let seq = 0;
	const act = async (type: string, body?: unknown): Promise<Reply> => {
		const id = `r${++seq}`;
		ws.send(JSON.stringify({ id, type, body }));
		await until(() => replies.has(id), `reply ${id}`);
		return replies.get(id)!;
	};
	return { ws, pushes, act, until };
}

describe("actions over the socket", () => {
	it("dispatches to the same routes as HTTP, replies by id, and pushes the result to everyone", async () => {
		const host = await createSession("Host");
		const guest = await join(host.sessionCode, "Guest");
		const h = await connect(host.sessionCode, host.playerToken);
		const g = await connect(host.sessionCode, guest.playerToken);
		await h.until(() => h.pushes.length >= 1, "initial push");
		await g.until(() => g.pushes.length >= 1, "initial push");

		// Guest readies over the socket: 200 reply, and the host's next push
		// shows it -- the very thing the HTTP /ready + poll used to do.
		const ready = await g.act("ready", { ready: true });
		expect(ready.status).toBe(200);
		expect(ready.body).toEqual({ ok: true });
		await h.until(() => h.pushes.some((p) => p.players.find((x) => x.id === guest.playerId)?.ready === true), "host sees guest ready");

		// Host starts over the socket, both sockets learn the game began.
		const start = await h.act("start", { questionCount: 1 });
		expect(start.status).toBe(200);
		await g.until(() => g.pushes.some((p) => p.status === "in_progress"), "guest sees in_progress");

		// A guess: graded reply, and the feed line reaches the other socket.
		const guess = await g.act("guess", { guess: "Nobody At All" });
		expect(guess.status).toBe(200);
		expect(guess.body.result).toBe("wrong");
		await h.until(() => h.pushes.some((p) => p.feed.some((e) => e.kind === "guess" && e.text === "Nobody At All")), "host sees the guess in the feed");

		// Chat, and the server's own rule (30s cooldown) applies identically.
		expect((await g.act("message", { text: "hello" })).status).toBe(200);
		expect((await g.act("message", { text: "again" })).status).toBe(429);

		// Unknown actions are refused without touching the session.
		const bad = await g.act("teleport", {});
		expect(bad.status).toBe(400);

		h.ws.close(1000, "done");
		g.ws.close(1000, "done");
	});

	it("answers a burst beyond the per-player guard with 429 instead of dispatching", async () => {
		const host = await createSession("Host");
		const h = await connect(host.sessionCode, host.playerToken);
		await h.until(() => h.pushes.length >= 1, "initial push");
		const statuses: number[] = [];
		for (let i = 0; i < 70; i++) statuses.push((await h.act("ready", { ready: true })).status);
		expect(statuses.slice(0, 60).every((s) => s === 200)).toBe(true);
		expect(statuses.slice(60).every((s) => s === 429)).toBe(true);
		h.ws.close(1000, "done");
	});
});

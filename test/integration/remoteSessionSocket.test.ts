// The remote session's push channel (remoteGameSession.ts's WebSockets
// doc): a client with a socket open gets the public state pushed when it
// changes -- initial state on connect, another player's action, chat with
// the incremental feed -- and is closed with 4410 once it's no longer in
// the session. Polling /state keeps working alongside.
import { env, runInDurableObject, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerToken: string;
	playerId: string;
}

interface Push {
	status: string;
	round: { startedAt: number | null; hintsRevealed: number } | null;
	players: { id: string; name: string; away: boolean }[];
	feed: { id: number; kind: string; text: string }[];
	v: string;
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

// Opens the socket and returns it with a queue of parsed pushes, so a test
// can await "the next push" without racing the runtime.
async function connect(code: string, token: string, since = 0) {
	const res = await SELF.fetch(`https://example.com/api/remote/sessions/${code}/ws?token=${token}&since=${since}`, { headers: { Upgrade: "websocket" } });
	expect(res.status).toBe(101);
	const ws = res.webSocket!;
	const queue: Push[] = [];
	const waiters: ((p: Push) => void)[] = [];
	const closed = new Promise<{ code: number; reason: string }>((resolve) => ws.addEventListener("close", (e) => resolve({ code: e.code, reason: e.reason })));
	ws.addEventListener("message", (e) => {
		if (e.data === "pong") return;
		const push = JSON.parse(e.data as string) as Push;
		const waiter = waiters.shift();
		if (waiter) waiter(push);
		else queue.push(push);
	});
	ws.accept();
	const next = (): Promise<Push> => {
		const queued = queue.shift();
		if (queued) return Promise.resolve(queued);
		return new Promise<Push>((resolve, reject) => {
			waiters.push(resolve);
			setTimeout(() => reject(new Error("no push within 3s")), 3_000);
		});
	};
	return { ws, next, closed };
}

describe("remote session WebSockets", () => {
	it("pushes the state on connect, on another player's action, and the feed incrementally", async () => {
		const host = await createSession("Host");
		const hostSocket = await connect(host.sessionCode, host.playerToken);

		const initial = await hostSocket.next();
		expect(initial.status).toBe("lobby");
		expect(initial.players.map((p) => p.name)).toEqual(["Host"]);
		expect(initial.feed).toEqual([]);

		const guest = await join(host.sessionCode, "Guest");
		const afterJoin = await hostSocket.next();
		expect(afterJoin.players.map((p) => p.name)).toEqual(["Host", "Guest"]);

		const guestSocket = await connect(host.sessionCode, guest.playerToken);
		const guestInitial = await guestSocket.next();
		expect(guestInitial.players.map((p) => p.name)).toEqual(["Host", "Guest"]);

		const post = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/message`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Player-Token": guest.playerToken },
			body: JSON.stringify({ text: "hello" }),
		});
		expect(post.status).toBe(200);
		const hostChat = await hostSocket.next();
		const guestChat = await guestSocket.next();
		expect(hostChat.feed.map((e) => e.text)).toEqual(["hello"]);
		expect(guestChat.feed.map((e) => e.text)).toEqual(["hello"]);

		// A poll still works alongside, and agrees.
		const poll = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state?since=0`, { headers: { "X-Player-Token": host.playerToken } });
		expect(poll.status).toBe(200);
		const polled = (await poll.json()) as Push;
		expect(polled.v).toBe(hostChat.v);
		expect(polled.feed.map((e) => e.text)).toEqual(["hello"]);

		// Leaving closes the leaver's socket and tells the others.
		const leave = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/leave`, { method: "POST", headers: { "X-Player-Token": guest.playerToken } });
		expect(leave.status).toBe(200);
		expect((await guestSocket.closed).code).toBe(4410);
		const afterLeave = await hostSocket.next();
		expect(afterLeave.players.map((p) => p.name)).toEqual(["Host"]);
		hostSocket.ws.close(1000, "done");
	});

	it("rejects an upgrade without a valid token, and a plain GET without an upgrade", async () => {
		const host = await createSession("Host");
		const bad = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/ws?token=nope`, { headers: { Upgrade: "websocket" } });
		expect(bad.status).toBe(401);
		const plain = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/ws?token=${host.playerToken}`);
		expect(plain.status).toBe(426);
	});

	it("books the alarm for the next clock-driven change while a socket is open (the first hint tier)", async () => {
		const host = await createSession("Host");
		const socket = await connect(host.sessionCode, host.playerToken);
		await socket.next();
		const start = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Player-Token": host.playerToken },
			body: JSON.stringify({ questionCount: 1 }),
		});
		expect(start.status).toBe(200);
		const started = await socket.next();
		expect(started.status).toBe("in_progress");
		expect(started.round?.hintsRevealed).toBe(0);

		// The tier reveals at 30s (HINT_REVEAL_INTERVAL_MS) -- before sockets
		// the next poll noticed; now the alarm is booked for it.
		const stub = env.REMOTE_GAME_SESSION.get(env.REMOTE_GAME_SESSION.idFromName(host.sessionCode));
		const alarmAt = await runInDurableObject(stub, (_instance, state) => state.storage.getAlarm());
		expect(alarmAt).not.toBeNull();
		expect(alarmAt! - started.round!.startedAt!).toBeGreaterThanOrEqual(30_000);
		expect(alarmAt! - started.round!.startedAt!).toBeLessThan(30_100);
		socket.ws.close(1000, "done");
	});

	it("resumes the feed from `since` rather than replaying it", async () => {
		const host = await createSession("Host");
		for (const text of ["one", "two"]) {
			const post = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/message`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-Player-Token": host.playerToken },
				body: JSON.stringify({ text }),
			});
			// The 30s chat cooldown rejects the second -- it's the FIRST that matters here.
			expect([200, 429]).toContain(post.status);
		}
		const socket = await connect(host.sessionCode, host.playerToken, 1);
		const initial = await socket.next();
		expect(initial.feed.map((e) => e.text)).toEqual([]);
		socket.ws.close(1000, "done");
	});
});

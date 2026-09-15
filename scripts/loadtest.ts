// Load test for remote play (docs/scaling.md §5f): N simulated players in
// rooms, each holding a WebSocket and acting on a human-ish cadence --
// guessing, giving up, readying for the next question, chatting; or, in
// Roll of Honour, claiming and answering tiles -- against a URL you name.
// Prints per-route latency percentiles, status codes, push counts and the
// request rate. Everything in the scaling doc was arithmetic until this.
//
//   node --experimental-strip-types scripts/loadtest.ts \
//     --base https://top-10-tension-staging.cuong-luu.workers.dev \
//     --players 500 --room-size 6 --seconds 120 [--game roll-of-honour]
//
// Aim it at STAGING (`npm run deploy:staging`) or a local dev server --
// never at production: it creates real sessions and real load.
//
// AND MIND THE ACCOUNT'S DAILY WRITE BUDGET. Cloudflare's free-tier
// quotas are per ACCOUNT per day, shared by staging and production: the
// Durable Object limit is 100,000 rows written, and on 2026-09-15 five
// runs of this script (~19,000 actions) used it up -- production remote
// play returned 500 for the rest of the day. The script now prints its
// estimated row cost and refuses to run more than FREE_TIER_MAX_PLAYERS
// against a non-local URL unless --paid-plan is passed. From one
// machine all rooms come from one IP, so the ramp is paced under the
// per-IP session limit (wrangler.json's SESSION_RATE_LIMITER, 120
// create+join a minute): 500 players in rooms of 6 is ~5 minutes of
// ramp before the measured window starts. The per-player and global
// limits are counted as findings (429/503 columns), not worked around.
//
// The simulated player is deliberately dumb: it fetches one two-letter
// typeahead shard and guesses names from it (almost always wrong), gives
// up after a few, readies when the round is decided, restarts a finished
// game if it's the host. That is enough to exercise every hot path --
// pushes to every socket per action, the gate alarms, the shard route --
// without needing the answers.

interface Args {
	base: string;
	players: number;
	roomSize: number;
	seconds: number;
	game: "club-badges" | "roll-of-honour";
	rampPerMinute: number;
	// "ws" (default): in-session actions travel over each player's socket
	// as {id, type, body}, as the real client does since 2026-09-15; "http"
	// sends them as POSTs, the fallback path, for comparison.
	transport: "ws" | "http";
	paidPlan: boolean;
}
const FREE_TIER_MAX_PLAYERS = 30;

function parseArgs(): Args {
	const a = process.argv.slice(2);
	const get = (name: string, fallback: string) => {
		const i = a.indexOf(`--${name}`);
		return i >= 0 && a[i + 1] ? a[i + 1] : fallback;
	};
	return {
		base: get("base", "http://localhost:5173").replace(/\/$/, ""),
		players: Number(get("players", "50")),
		roomSize: Number(get("room-size", "6")),
		seconds: Number(get("seconds", "60")),
		game: get("game", "club-badges") as Args["game"],
		rampPerMinute: Number(get("ramp-per-min", "110")),
		transport: get("transport", "ws") as Args["transport"],
		paidPlan: a.includes("--paid-plan"),
	};
}

// ---- metrics ----

interface RouteStats {
	latencies: number[];
	statuses: Map<number, number>;
	errors: number;
}
const routes = new Map<string, RouteStats>();
let pushes = 0;
let pushBytes = 0;
let socketOpens = 0;
let socketFailures = 0;
let measuring = false;

function stats(route: string): RouteStats {
	let s = routes.get(route);
	if (!s) {
		s = { latencies: [], statuses: new Map(), errors: 0 };
		routes.set(route, s);
	}
	return s;
}

function percentile(sorted: number[], p: number): number {
	if (sorted.length === 0) return 0;
	return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

// ---- one player ----

interface Player {
	name: string;
	code: string;
	token: string;
	id: string;
	isHost: boolean;
	state: SessionState | null;
	gaveUp: boolean;
	guesses: string[];
	ws: WebSocket | null;
	stopped: boolean;
	pending: Map<string, (reply: { status: number; body: unknown }) => void>;
	seq: number;
}
let socketActionsSent = 0;
let socketActionFallbacks = 0;

interface SessionState {
	status: string;
	players: { id: string; ready: boolean }[];
	round: { index: number; answerName: string | null; givenUpPlayerIds: string[] } | null;
	honour: { tiles: { season: string; status: string }[]; givenUpPlayerIds: string[] } | null;
	feed: unknown[];
	v: string;
}

const args = parseArgs();

async function api<T = unknown>(route: string, path: string, init: RequestInit & { token?: string } = {}): Promise<{ status: number; body: T | null }> {
	const t0 = performance.now();
	const s = stats(route);
	try {
		const res = await fetch(`${args.base}${path}`, {
			...init,
			headers: { "Content-Type": "application/json", ...(init.token ? { "X-Player-Token": init.token } : {}), ...(init.headers ?? {}) },
		});
		const ms = performance.now() - t0;
		if (measuring) {
			s.latencies.push(ms);
			s.statuses.set(res.status, (s.statuses.get(res.status) ?? 0) + 1);
		}
		let body: T | null = null;
		try {
			body = (await res.json()) as T;
		} catch {
			body = null;
		}
		return { status: res.status, body };
	} catch {
		if (measuring) s.errors += 1;
		return { status: 0, body: null };
	}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// An in-session action: over the player's socket when it's open (the
// reply is matched by id and timed like an HTTP call, under the same route
// label so the two transports compare directly), else the HTTP POST.
async function action<T = unknown>(p: Player, route: string, type: string, path: string, body?: unknown): Promise<{ status: number; body: T | null }> {
	const ws = p.ws;
	if (args.transport === "ws" && ws && ws.readyState === WebSocket.OPEN) {
		const id = String(++p.seq);
		const t0 = performance.now();
		const s = stats(route);
		const reply = await new Promise<{ status: number; body: unknown } | null>((resolve) => {
			const timer = setTimeout(() => {
				p.pending.delete(id);
				resolve(null);
			}, 5_000);
			p.pending.set(id, (r) => {
				clearTimeout(timer);
				resolve(r);
			});
			try {
				ws.send(JSON.stringify({ id, type, body }));
			} catch {
				clearTimeout(timer);
				p.pending.delete(id);
				resolve(null);
			}
		});
		if (reply) {
			if (measuring) {
				socketActionsSent += 1;
				s.latencies.push(performance.now() - t0);
				s.statuses.set(reply.status, (s.statuses.get(reply.status) ?? 0) + 1);
			}
			return { status: reply.status, body: reply.body as T };
		}
		if (measuring) socketActionFallbacks += 1;
	}
	return api<T>(route, `/api/remote/sessions/${p.code}${path}`, { method: "POST", token: p.token, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const jitter = (baseMs: number) => baseMs * (0.6 + Math.random() * 0.8);

let clubNames: string[] = [];
const shardCache = new Map<string, string[]>();
async function guessPool(): Promise<string[]> {
	if (args.game === "roll-of-honour") return clubNames;
	const prefix = pick(["ma", "jo", "da", "al", "ja", "me", "li", "ro", "an", "pe"]);
	const cached = shardCache.get(prefix);
	if (cached) return cached;
	const res = await api<{ players: { name: string }[] }>("GET players/:prefix", `/api/club-badges/players/${prefix}`);
	const names = res.body?.players.map((p) => p.name) ?? ["Nobody"];
	shardCache.set(prefix, names);
	return names;
}

function connect(p: Player): void {
	if (p.stopped) return;
	const url = `${args.base.replace(/^http/, "ws")}/api/remote/sessions/${p.code}/ws?token=${encodeURIComponent(p.token)}&since=0`;
	let ws: WebSocket;
	try {
		ws = new WebSocket(url);
	} catch {
		socketFailures += 1;
		return;
	}
	p.ws = ws;
	let ping: ReturnType<typeof setInterval> | undefined;
	ws.onopen = () => {
		socketOpens += 1;
		ping = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) ws.send("ping");
		}, 25_000);
	};
	ws.onmessage = (ev) => {
		if (typeof ev.data !== "string" || ev.data === "pong") return;
		let msg: SessionState | { id: string; status: number; body: unknown };
		try {
			msg = JSON.parse(ev.data) as typeof msg;
		} catch {
			return;
		}
		if ("id" in msg && typeof msg.id === "string") {
			p.pending.get(msg.id)?.(msg);
			p.pending.delete(msg.id);
			return;
		}
		if (measuring) {
			pushes += 1;
			pushBytes += ev.data.length;
		}
		p.state = msg as SessionState;
	};
	ws.onerror = () => {
		socketFailures += 1;
	};
	ws.onclose = () => {
		clearInterval(ping);
		if (!p.stopped) setTimeout(() => connect(p), 2_000 + Math.random() * 3_000);
	};
}

async function act(p: Player): Promise<void> {
	const s = p.state;
	if (!s) return;
	if (s.status === "finished") {
		if (p.isHost) await action(p, "restart", "restart", "/restart", { keepScores: false });
		return;
	}
	if (s.status === "lobby") {
		if (p.isHost) {
			const everyoneReady = s.players.filter((x) => x.id !== p.id).every((x) => x.ready);
			if (everyoneReady) await startGame(p);
		} else {
			const me = s.players.find((x) => x.id === p.id);
			if (me && !me.ready) await action(p, "ready", "ready", "/ready", { ready: true });
		}
		return;
	}
	if (s.status !== "in_progress") return;

	if (Math.random() < 0.04) {
		await action(p, "message", "message", "/message", { text: pick(["nice", "no way", "😂", "come on", "so close"]) });
	}

	if (args.game === "roll-of-honour") {
		if (!s.honour || s.honour.givenUpPlayerIds.includes(p.id)) return;
		const open = s.honour.tiles.filter((t) => t.status === "open");
		if (open.length === 0) return;
		if (Math.random() < 0.03) {
			await action(p, "give-up", "give-up", "/give-up");
			return;
		}
		const season = pick(open).season;
		const sel = await action<{ ok?: true }>(p, "tile/select", "tile/select", "/tile/select", { season });
		if (sel.status !== 200) return;
		await sleep(jitter(2_500)); // "thinking" while holding the tile
		await action(p, "tile/answer", "tile/answer", "/tile/answer", { season, guess: pick(await guessPool()) });
		return;
	}

	const round = s.round;
	if (!round) return;
	if (round.answerName !== null) {
		// Decided: guests ready up for the next one.
		const me = s.players.find((x) => x.id === p.id);
		if (!p.isHost && me && !me.ready) await action(p, "ready", "ready", "/ready", { ready: true });
		p.guesses = [];
		p.gaveUp = false;
		return;
	}
	if (round.givenUpPlayerIds.includes(p.id)) return;
	if (p.guesses.length >= 3 && Math.random() < 0.5) {
		await action(p, "give-up", "give-up", "/give-up");
		p.gaveUp = true;
		return;
	}
	const guess = pick(await guessPool());
	p.guesses.push(guess);
	await action(p, "guess", "guess", "/guess", { guess });
}

let competitionId = "";
async function startGame(host: Player): Promise<void> {
	const body = args.game === "roll-of-honour" ? { questionCount: 1, competitionId } : { questionCount: 5 };
	await action(host, "start", "start", "/start", body);
}

async function playerLoop(p: Player): Promise<void> {
	await sleep(Math.random() * 5_000);
	while (!p.stopped) {
		try {
			await act(p);
		} catch {
			/* keep going */
		}
		await sleep(jitter(6_000));
	}
}

// ---- rooms ----

async function makeRoom(index: number, size: number): Promise<Player[]> {
	const gate = async () => sleep((60_000 / args.rampPerMinute) * (0.8 + Math.random() * 0.4));
	await gate();
	const created = await api<{ sessionCode: string; playerId: string; playerToken: string }>("POST /sessions", "/api/remote/sessions", {
		method: "POST",
		body: JSON.stringify({ hostName: `Host${index}`, gameType: args.game }),
	});
	if (created.status !== 200 || !created.body) {
		console.error(`  room ${index}: create failed (${created.status})`);
		return [];
	}
	const code = created.body.sessionCode;
	const players: Player[] = [{ name: `Host${index}`, code, token: created.body.playerToken, id: created.body.playerId, isHost: true, state: null, gaveUp: false, guesses: [], ws: null, stopped: false, pending: new Map(), seq: 0 }];
	for (let g = 1; g < size; g++) {
		await gate();
		const joined = await api<{ playerId: string; playerToken: string }>("POST /join", `/api/remote/sessions/${code}/join`, {
			method: "POST",
			body: JSON.stringify({ name: `Guest${index}-${g}` }),
		});
		if (joined.status !== 200 || !joined.body) {
			console.error(`  room ${index}: join failed (${joined.status})`);
			continue;
		}
		players.push({ name: `Guest${index}-${g}`, code, token: joined.body.playerToken, id: joined.body.playerId, isHost: false, state: null, gaveUp: false, guesses: [], ws: null, stopped: false, pending: new Map(), seq: 0 });
	}
	for (const p of players) connect(p);
	return players;
}

async function main(): Promise<void> {
	console.log(`loadtest: ${args.players} players in rooms of ${args.roomSize}, ${args.game}, actions over ${args.transport}, ${args.seconds}s measured, against ${args.base}`);

	// Row budget (see the header): ~10 actions/min/player, ~1.5 rows per
	// action after the 2026-09-15 write reduction (a feed row, plus a
	// player/session/tile row for the actions that change one), plus the
	// ramp (~3 rows per seat) and the pushes' alarm bookings.
	const roomCount0 = Math.ceil(args.players / args.roomSize);
	const rampMinutes = (args.players + roomCount0) / args.rampPerMinute;
	const estimatedActions = Math.round(args.players * 10 * (args.seconds / 60 + rampMinutes / 2));
	const estimatedRows = Math.round(estimatedActions * 1.5 + args.players * 3);
	const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(args.base);
	console.log(`estimated cost: ~${estimatedActions} actions, ~${estimatedRows} Durable Object rows written${local ? " (local server: not billed)" : " -- counted against the ACCOUNT's daily quota, shared with production"}`);
	if (!local && args.players > FREE_TIER_MAX_PLAYERS && !args.paidPlan) {
		console.error(`refusing: ${args.players} players against a remote URL exceeds the free-tier guard of ${FREE_TIER_MAX_PLAYERS}. The free plan allows 100,000 rows written a day across the whole account; pass --paid-plan only if the account is on Workers Paid.`);
		process.exit(2);
	}
	if (args.game === "roll-of-honour") {
		const comps = await api<{ competitions: { id: string }[] }>("GET competitions", "/api/roll-of-honour/competitions");
		competitionId = comps.body?.competitions[0]?.id ?? "";
		const clubs = await api<{ clubs: { name: string }[] }>("GET clubs", "/api/roll-of-honour/clubs");
		clubNames = clubs.body?.clubs.map((c) => c.name) ?? ["Nobody"];
		if (!competitionId) throw new Error("no competitions returned");
	}
	const roomCount = Math.ceil(args.players / args.roomSize);
	const rampStart = Date.now();
	console.log(`ramping ${roomCount} rooms at ~${args.rampPerMinute} create+join/min (under the per-IP session limit)...`);
	const all: Player[] = [];
	const loops: Promise<void>[] = [];
	for (let r = 0; r < roomCount; r++) {
		const size = Math.min(args.roomSize, args.players - r * args.roomSize);
		const players = await makeRoom(r, size);
		for (const p of players) {
			all.push(p);
			loops.push(playerLoop(p));
		}
		if ((r + 1) % 10 === 0) console.log(`  ${all.length} players in ${r + 1} rooms (${Math.round((Date.now() - rampStart) / 1000)}s)`);
	}
	console.log(`ramp done: ${all.length} players, ${socketOpens} sockets open, ${socketFailures} socket failures, ${Math.round((Date.now() - rampStart) / 1000)}s`);

	measuring = true;
	const measureStart = Date.now();
	await sleep(args.seconds * 1000);
	measuring = false;
	const measuredSeconds = (Date.now() - measureStart) / 1000;

	for (const p of all) {
		p.stopped = true;
		p.ws?.close(1000, "done");
	}

	// ---- report ----
	let totalRequests = 0;
	const rows: string[][] = [];
	for (const [route, s] of [...routes.entries()].sort()) {
		const sorted = [...s.latencies].sort((a, b) => a - b);
		const n = sorted.length;
		totalRequests += n;
		const status = [...s.statuses.entries()]
			.sort()
			.map(([k, v]) => `${k}:${v}`)
			.join(" ");
		rows.push([route, String(n), `${percentile(sorted, 50).toFixed(0)}`, `${percentile(sorted, 95).toFixed(0)}`, `${percentile(sorted, 99).toFixed(0)}`, `${sorted[n - 1]?.toFixed(0) ?? "-"}`, status, String(s.errors)]);
	}
	const header = ["route", "n", "p50 ms", "p95 ms", "p99 ms", "max ms", "statuses", "net errors"];
	const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
	const line = (r: string[]) => r.map((c, i) => c.padEnd(widths[i])).join("  ");
	console.log("");
	console.log(`measured ${measuredSeconds.toFixed(0)}s with ${all.length} players (${socketOpens} socket opens, ${socketFailures} socket failures overall)`);
	console.log(line(header));
	console.log(widths.map((w) => "-".repeat(w)).join("  "));
	for (const r of rows) console.log(line(r));
	console.log("");
	const httpRequests = totalRequests - socketActionsSent;
	console.log(`actions: ${totalRequests} in ${measuredSeconds.toFixed(0)}s = ${((totalRequests / measuredSeconds) * 60).toFixed(0)}/min = ${((totalRequests / measuredSeconds) * 60 / Math.max(1, all.length)).toFixed(1)}/min/player`);
	console.log(`  of which over the socket: ${socketActionsSent} (billed 20:1 = ~${Math.ceil(socketActionsSent / 20)} requests); as HTTP: ${httpRequests}${socketActionFallbacks ? ` (${socketActionFallbacks} were socket timeouts that fell back)` : ""}`);
	console.log(`pushes received: ${pushes} (${(pushBytes / 1024).toFixed(0)} KB) = ${(pushes / Math.max(1, all.length)).toFixed(1)} per player, ${((pushBytes / 1024) / Math.max(1, all.length)).toFixed(1)} KB per player`);
	// /message's own 429 is the 30s chat cooldown (an application rule the
	// simulated chatter trips on purpose), not a rate-limit binding.
	let limited = 0;
	for (const [route, s] of routes) {
		if (route === "message" || route === "POST /message") continue;
		limited += (s.statuses.get(429) ?? 0) + (s.statuses.get(503) ?? 0);
	}
	if (limited > 0) console.log(`rate-limited responses (429/503, excluding the chat cooldown): ${limited} -- a limit in wrangler.json's ratelimits is binding at this load`);
	else console.log("no rate-limit binding tripped (the /message 429s, if any, are the 30s chat cooldown)");
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

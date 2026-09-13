import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { generateToken } from "../lib/remoteSession";

// The authoritative session for one "remote" multiplayer game -- players
// on their own devices, as opposed to the existing pass-and-play mode
// (multiplayer/state.ts) where the whole game lives as plain client
// state on one shared device. A Durable Object is the right fit here for
// one specific reason: "first correct guess wins" needs an atomic
// check-and-set, and a DO processes every request to one instance
// strictly one-at-a-time, so that's just a plain in-memory/SQLite check
// inside a single request handler -- no separate distributed lock needed
// the way a naive D1-only approach would (two players' guesses landing
// within milliseconds of each other could otherwise both read
// "unanswered" before either writes back).
//
// SQLite-backed (`new_sqlite_classes` in wrangler.json's migrations, not
// the older key-value backend) -- the modern, recommended storage
// backend, and the ONLY one available on the Workers Free plan. Confirmed
// during this feature's design (2026-09-13, via Cloudflare's own current
// docs, not assumed from memory) that Durable Objects themselves are
// free-tier compatible too, with limits comparable to D1's own: 100,000
// requests/day, 13,000 GB-s duration/day, 5M SQLite rows read/day,
// 100,000 rows written/day, 5GB total storage -- Cloudflare's own
// changelog for that April 2025 announcement names "real-time
// applications like chat or multiplayer games" as the intended use case.
//
// Design decisions locked in before any of this was written (see the
// conversation this was built from -- not repeated in full here, only
// the parts that shape this specific class):
//   - Clients POLL a /state endpoint every 4s -- no WebSockets. A few
//     seconds of UI lag doesn't affect fairness, since the server (this
//     class), not the client, decides who won each question.
//   - A player is "away" after 15s of silence (~3 missed polls); both
//     "everyone ready" and "everyone next-question" gates only wait on
//     non-away players. The host can also remove a player outright.
//   - Wrong guesses cost nothing -- unlimited attempts, a pure race on
//     the first correct one.
//   - Hints are shared and automatic: every 30s with no correct answer,
//     the next hint tier reveals for everyone at once (reusing
//     clubBadgesState.ts's own HINT_KEYS order) -- not player-triggered,
//     not point-costing.
//   - Scoring is a simple win count.
//   - The host picks how many questions the game has, once, at start.
//
// This class owns nothing but routing HTTP-shaped requests into its own
// state -- see src/worker/lib/ for anything that could conceivably be
// unit-tested in isolation (session code/token generation, etc.) rather
// than needing a real Durable Object instance to exercise.
//
// Phase 1 (this file, as of 2026-09-13): session *lifecycle* only --
// create/join/state/ready/leave/remove/start. No question content, no
// guessing, no hints, no scoring yet -- those need this lobby to exist
// first, and are deliberately a separate phase (see /start below, which
// only records the chosen question count and flips status, rather than
// actually picking or serving any question).

const PLAYER_AWAY_MS = 15_000; // ~3 missed 4s polls -- see class doc.
const MAX_PLAYERS = 8; // A casual party-game bound, not a locked design
// decision -- easy to raise later if a real session ever wants more. Caps
// this DO's own per-request storage-read/write cost more than it limits
// any real game night.
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20; // Provisional, independent of the 48-category
// catalog size -- revisit once the phase that actually serves questions
// exists and picks a real bound.
const MAX_NAME_LENGTH = 24;

type SessionStatus = "lobby" | "in_progress" | "ended";

interface SessionRecord {
	status: SessionStatus;
	questionCount: number | null;
	createdAt: number;
}

interface PlayerRecord {
	id: string;
	token: string;
	name: string;
	isHost: boolean;
	ready: boolean;
	joinedAt: number;
	lastSeenAt: number;
}

interface PublicPlayer {
	id: string;
	name: string;
	isHost: boolean;
	ready: boolean;
	away: boolean;
}

function isAway(player: PlayerRecord, now: number): boolean {
	return now - player.lastSeenAt > PLAYER_AWAY_MS;
}

function toPublicPlayer(player: PlayerRecord, now: number): PublicPlayer {
	return {
		id: player.id,
		name: player.name,
		isHost: player.isHost,
		ready: player.ready,
		away: isAway(player, now),
	};
}

export class RemoteGameSession extends DurableObject<Env> {
	private readonly app: Hono;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.app = new Hono();

		// Small local helpers bound to this instance's storage -- kept
		// inside the constructor (rather than free functions taking
		// `storage` as a parameter) since every route needs both and this
		// class has no other state worth threading through.
		const storage = ctx.storage;
		const getSession = () => storage.get<SessionRecord>("session");
		const getPlayers = () => storage.get<PlayerRecord[]>("players").then((p) => p ?? []);
		const findByToken = (players: PlayerRecord[], token: string | undefined) =>
			token ? players.find((p) => p.token === token) : undefined;

		this.app.get("/", (c) => c.json({ ok: true }));

		this.app.post("/create", async (c) => {
			const code = c.req.header("X-Session-Code");
			if (!code) return c.json({ error: "Missing session code" }, 400);

			const existing = await getSession();
			if (existing) {
				// Astronomically unlikely (see generateSessionCode's own doc on
				// the ~1.07 billion combination space) -- the outer route
				// retries with a fresh code on this specific status rather than
				// ever overwriting a real live session.
				return c.json({ error: "Session already exists" }, 409);
			}

			const body = await c.req.json<{ hostName?: string }>().catch(() => ({}) as { hostName?: string });
			const hostName = (body.hostName ?? "").trim();
			if (!hostName) return c.json({ error: "Missing host name" }, 400);
			if (hostName.length > MAX_NAME_LENGTH) return c.json({ error: "Name is too long" }, 400);

			const now = Date.now();
			const session: SessionRecord = { status: "lobby", questionCount: null, createdAt: now };
			// The host is marked ready from the start -- readiness exists to
			// gate the *other* players before the host starts the game, not to
			// make the host wait on themselves (see /start below).
			const host: PlayerRecord = {
				id: generateToken(),
				token: generateToken(),
				name: hostName,
				isHost: true,
				ready: true,
				joinedAt: now,
				lastSeenAt: now,
			};
			await storage.put({ session, players: [host] });

			return c.json({ sessionCode: code, playerId: host.id, playerToken: host.token });
		});

		this.app.post("/join", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status !== "lobby") {
				return c.json({ error: "This session has already started" }, 409);
			}

			const players = await getPlayers();
			if (players.length >= MAX_PLAYERS) return c.json({ error: "This session is full" }, 409);

			const body = await c.req.json<{ name?: string }>().catch(() => ({}) as { name?: string });
			const name = (body.name ?? "").trim();
			if (!name) return c.json({ error: "Missing name" }, 400);
			if (name.length > MAX_NAME_LENGTH) return c.json({ error: "Name is too long" }, 400);

			const now = Date.now();
			const player: PlayerRecord = {
				id: generateToken(),
				token: generateToken(),
				name,
				isHost: false,
				ready: false,
				joinedAt: now,
				lastSeenAt: now,
			};
			await storage.put("players", [...players, player]);

			return c.json({ playerId: player.id, playerToken: player.token });
		});

		this.app.get("/state", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			// Polling IS the heartbeat -- there's no separate "still here"
			// signal, so simply reaching this handler at all proves the
			// caller isn't away, regardless of how stale their last poll was.
			const now = Date.now();
			self.lastSeenAt = now;
			await storage.put("players", players);

			return c.json({
				status: session.status,
				questionCount: session.questionCount,
				players: players.map((p) => toPublicPlayer(p, now)),
			});
		});

		this.app.post("/ready", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);
			if (session.status !== "lobby") return c.json({ error: "This session has already started" }, 409);

			const body = await c.req.json<{ ready?: boolean }>().catch(() => ({}) as { ready?: boolean });
			self.ready = Boolean(body.ready);
			self.lastSeenAt = Date.now();
			await storage.put("players", players);

			return c.json({ ok: true });
		});

		this.app.post("/leave", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			if (self.isHost) {
				// Host-explicit-leave ends the session for everyone -- distinct
				// from host-idle (just another "away" player until they either
				// come back or the game plays on without them), see class doc.
				// The player roster is left as-is (not cleared) so a poll made
				// right after this still shows who was in the room when it
				// ended, not an empty list.
				session.status = "ended";
				await storage.put("session", session);
			} else {
				await storage.put(
					"players",
					players.filter((p) => p.id !== self.id),
				);
			}

			return c.json({ ok: true });
		});

		this.app.post("/remove", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const caller = findByToken(players, c.req.header("X-Player-Token"));
			if (!caller) return c.json({ error: "Invalid session token" }, 401);
			if (!caller.isHost) return c.json({ error: "Only the host can remove a player" }, 403);

			const body = await c.req.json<{ playerId?: string }>().catch(() => ({}) as { playerId?: string });
			if (body.playerId === caller.id) {
				return c.json({ error: "Use leave to remove yourself" }, 400);
			}
			const target = players.find((p) => p.id === body.playerId);
			if (!target) return c.json({ error: "Player not found" }, 404);

			await storage.put(
				"players",
				players.filter((p) => p.id !== target.id),
			);

			return c.json({ ok: true });
		});

		this.app.post("/start", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const caller = findByToken(players, c.req.header("X-Player-Token"));
			if (!caller) return c.json({ error: "Invalid session token" }, 401);
			if (!caller.isHost) return c.json({ error: "Only the host can start the game" }, 403);
			if (session.status !== "lobby") return c.json({ error: "This session has already started" }, 409);

			const body = await c.req.json<{ questionCount?: number }>().catch(() => ({}) as { questionCount?: number });
			const questionCount = body.questionCount;
			if (
				typeof questionCount !== "number" ||
				!Number.isInteger(questionCount) ||
				questionCount < MIN_QUESTION_COUNT ||
				questionCount > MAX_QUESTION_COUNT
			) {
				return c.json({ error: `questionCount must be an integer between ${MIN_QUESTION_COUNT} and ${MAX_QUESTION_COUNT}` }, 400);
			}

			// "Everyone ready" only waits on non-away players -- see class doc.
			// A player who's gone quiet shouldn't be able to indefinitely block
			// the host from starting.
			const now = Date.now();
			const notReady = players.filter((p) => !p.isHost && !p.ready && !isAway(p, now));
			if (notReady.length > 0) {
				return c.json({ error: "All players must be ready before starting", notReadyPlayerIds: notReady.map((p) => p.id) }, 409);
			}

			session.status = "in_progress";
			session.questionCount = questionCount;
			await storage.put("session", session);

			return c.json({ ok: true });
		});
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}
}

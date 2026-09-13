import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { generateToken } from "../lib/remoteSession";
import { buildClubBadgeQuestions, pickRandomEligibleQuestions, type ClubBadgeQuestionPublic, type QuestionRow } from "../lib/clubBadgeRound";
import { checkPlayerGuess } from "../lib/checkPlayerGuess";

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
//   - Questions are Club Run's own badge-trail format (guess the player
//     from the clubs they played for -- see clubBadgeRound.ts), not the
//     Top-10 category format -- confirmed explicitly (2026-09-13) rather
//     than assumed from the hint design below, since guessing wrong here
//     would mean building the wrong data model entirely. A single correct
//     answer per question is exactly what makes "first correct guess
//     wins" a coherent race, unlike a Top-10 list's multiple answers.
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
//     clubBadgesState.ts's own HINT_KEYS order: country, nationality,
//     transferDate) -- not player-triggered, not point-costing. Unlike
//     single-player/pass-and-play (which send every hint field up front
//     and only hide them client-side, since there's no one to cheat
//     against), a genuinely competitive race across separate devices
//     needs this enforced server-side -- see publicQuestion() below.
//   - Scoring is a simple win count.
//   - The host picks how many questions the game has, once, at start.
//
// This class owns nothing but routing HTTP-shaped requests into its own
// state -- see src/worker/lib/ for anything that could conceivably be
// unit-tested in isolation (session code/token generation, etc.) rather
// than needing a real Durable Object instance to exercise.
//
// Phase 1 (2026-09-13): session *lifecycle* -- create/join/state/ready/
// leave/remove/start.
// Phase 2 (this file, as of 2026-09-13): real gameplay on top of that
// lobby -- question selection at /start, /guess, hint reveal timing, and
// the "everyone ready" gate advancing to the next question (or finishing
// the game on the last one).

const PLAYER_AWAY_MS = 15_000; // ~3 missed 4s polls -- see class doc.
const MAX_PLAYERS = 8; // A casual party-game bound, not a locked design
// decision -- easy to raise later if a real session ever wants more. Caps
// this DO's own per-request storage-read/write cost more than it limits
// any real game night.
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20; // Provisional -- comfortably below the
// eligible club_badge_questions pool (90+, see clubBadgeRound.ts's
// MIN_CLUBS_FOR_QUESTION), not tied to any other bound.
const MAX_NAME_LENGTH = 24;

// Hint tiers, in reveal order -- mirrors clubBadgesState.ts's HINT_KEYS
// exactly (country, nationality, transferDate), but NOT imported from
// there: that module lives under src/react-app (the client bundle), and
// worker code never imports from it (separate tsconfigs, separate
// bundles). Three tiers, hardcoded here, kept in sync by hand -- the
// actual per-tier gating (which fields a given hintsRevealed count
// unlocks) lives in publicQuestion() below, right next to this constant.
const HINT_TIER_COUNT = 3;
const HINT_REVEAL_INTERVAL_MS = 30_000;

type SessionStatus = "lobby" | "in_progress" | "finished" | "ended";

interface SessionRecord {
	status: SessionStatus;
	questionCount: number | null;
	createdAt: number;
	// Phase 2 -- all null/empty while status is "lobby".
	questions: ClubBadgeQuestionPublic[];
	roundIndex: number; // 0-based index into `questions`.
	roundStartedAt: number | null; // Epoch ms the current round began -- hint timing reads off this.
	roundWinnerId: string | null; // Set the instant someone's guess is graded correct; null while the round is still open.
	roundAnswerName: string | null; // The real player's name, revealed once roundWinnerId is set.
}

interface PlayerRecord {
	id: string;
	token: string;
	name: string;
	isHost: boolean;
	// Dual-purpose, by session.status: in "lobby", "ready to start the
	// game"; in "in_progress", "ready to advance past the current round"
	// (reset to false for every non-host player each time a new round
	// begins -- see startNewRound below). Never a source of confusion in
	// practice since a client only ever needs to interpret it against
	// whichever status /state just told it, not both meanings at once.
	ready: boolean;
	joinedAt: number;
	lastSeenAt: number;
	wins: number;
}

interface PublicPlayer {
	id: string;
	name: string;
	isHost: boolean;
	ready: boolean;
	away: boolean;
	wins: number;
}

interface PublicRound {
	index: number;
	total: number;
	startedAt: number | null;
	hintsRevealed: number;
	question: ClubBadgeQuestionPublic;
	winnerId: string | null;
	answerName: string | null;
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
		wins: player.wins,
	};
}

// Non-host, non-away players who haven't marked ready -- shared by /start
// (gating lobby -> in_progress) and the round-advance check (gating
// current round -> next round), since both are literally the same rule:
// don't wait on the host (they drive the gate, not block on it) or on
// someone who's gone quiet (see class doc on "away").
function playersNotReady(players: PlayerRecord[], now: number): PlayerRecord[] {
	return players.filter((p) => !p.isHost && !p.ready && !isAway(p, now));
}

// Reveals hint-gated fields only once the corresponding tier's 30s window
// has elapsed (or immediately, once the round's already been won -- no
// reason to keep the reveal artificial once there's nothing left to race
// for). This is the one place single-player's own equivalent (clubBadges.
// ts's /round, via clubBadgeRound.ts) deliberately diverges from what
// this sends: solo/pass-and-play ship every field up front and hide them
// client-side only (nothing to cheat against on a shared or solo device);
// a real race across separate devices needs the server itself to withhold
// them, or a technically-inclined player could read the raw response and
// skip the wait entirely.
function publicQuestion(question: ClubBadgeQuestionPublic, hintsRevealed: number): ClubBadgeQuestionPublic {
	return {
		id: question.id,
		badges: question.badges.map((b) => ({ ...b, country: hintsRevealed >= 1 ? b.country : null })),
		nationality: hintsRevealed >= 2 ? question.nationality : null,
		transferDates: hintsRevealed >= 3 ? question.transferDates : question.transferDates.map(() => null),
		// Never itself a hint (see clubBadgeRound.ts's own doc) -- always
		// visible, same as single-player.
		loanMoves: question.loanMoves,
	};
}

function publicRound(session: SessionRecord, now: number): PublicRound | null {
	if (session.status === "lobby" || session.questions.length === 0) return null;

	// "finished" can leave roundIndex one past the last real question (see
	// startNewRound) -- show the last one actually played rather than
	// nothing, so the final reveal stays visible after the game ends.
	const index = Math.min(session.roundIndex, session.questions.length - 1);
	const question = session.questions[index];

	const elapsedMs = session.roundStartedAt ? now - session.roundStartedAt : 0;
	const hintsRevealed =
		session.roundWinnerId !== null ? HINT_TIER_COUNT : Math.min(HINT_TIER_COUNT, Math.floor(elapsedMs / HINT_REVEAL_INTERVAL_MS));

	return {
		index,
		total: session.questions.length,
		startedAt: session.roundStartedAt,
		hintsRevealed,
		question: publicQuestion(question, hintsRevealed),
		winnerId: session.roundWinnerId,
		answerName: session.roundAnswerName,
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

		// Resets a session into a fresh round at `index` -- shared by /start
		// (index 0) and the auto-advance check below (index roundIndex + 1).
		// Mutates `session`/`players` in place and persists them; callers
		// just need to have already decided that advancing is correct.
		function startNewRound(session: SessionRecord, players: PlayerRecord[], index: number, now: number): void {
			if (index >= session.questions.length) {
				session.status = "finished";
				return;
			}
			session.status = "in_progress";
			session.roundIndex = index;
			session.roundStartedAt = now;
			session.roundWinnerId = null;
			session.roundAnswerName = null;
			// Fresh "ready to advance" gate for the new round -- see
			// PlayerRecord.ready's own doc on why this is reused rather than
			// a second field, and why it must be reset here: without this,
			// whatever readiness got someone PAST the previous round would
			// otherwise instantly satisfy the gate for the next one too.
			for (const p of players) p.ready = p.isHost;
		}

		// Advances past the current round once every non-host, non-away
		// player has marked ready -- called after anything that could newly
		// satisfy that gate (a /ready call, or a not-ready player leaving/
		// being removed). Requires the round to already have a winner: this
		// is a "confirm you saw the answer, move on" gate, not a "let's all
		// give up on this one" skip -- see class doc's "everyone next-
		// question" line. Without this precondition, a session with zero
		// OTHER players (a host testing solo) would satisfy "no non-host
		// player is unready" vacuously and blow through the entire question
		// deck the instant /start succeeded, before anyone had guessed
		// anything.
		async function maybeAdvanceRound(session: SessionRecord, players: PlayerRecord[], now: number): Promise<void> {
			if (session.status !== "in_progress" || session.roundWinnerId === null) return;
			if (playersNotReady(players, now).length > 0) return;

			startNewRound(session, players, session.roundIndex + 1, now);
			await storage.put({ session, players });
		}

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
			const session: SessionRecord = {
				status: "lobby",
				questionCount: null,
				createdAt: now,
				questions: [],
				roundIndex: 0,
				roundStartedAt: null,
				roundWinnerId: null,
				roundAnswerName: null,
			};
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
				wins: 0,
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
				wins: 0,
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
				round: publicRound(session, now),
			});
		});

		this.app.post("/ready", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status !== "lobby" && session.status !== "in_progress") {
				return c.json({ error: "This session has already ended" }, 409);
			}

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const body = await c.req.json<{ ready?: boolean }>().catch(() => ({}) as { ready?: boolean });
			const now = Date.now();
			self.ready = Boolean(body.ready);
			self.lastSeenAt = now;
			await storage.put("players", players);

			// Might be the last non-host player the current round's advance
			// gate was waiting on -- a no-op read-only check when it isn't
			// (session.status !== "in_progress", or the round has no winner
			// yet, or someone else is still unready).
			await maybeAdvanceRound(session, players, now);

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
				const remaining = players.filter((p) => p.id !== self.id);
				await storage.put("players", remaining);
				// The departing player might have been the last one the
				// round-advance gate was waiting on.
				await maybeAdvanceRound(session, remaining, Date.now());
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

			const remaining = players.filter((p) => p.id !== target.id);
			await storage.put("players", remaining);
			await maybeAdvanceRound(session, remaining, Date.now());

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
			const notReady = playersNotReady(players, now);
			if (notReady.length > 0) {
				return c.json({ error: "All players must be ready before starting", notReadyPlayerIds: notReady.map((p) => p.id) }, 409);
			}

			const { results: questionRows } = await this.env.DB.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions").all<QuestionRow>();
			const picked = pickRandomEligibleQuestions(questionRows ?? [], questionCount);
			const questions = await buildClubBadgeQuestions(this.env.DB, picked);
			if (questions.length < questionCount) {
				// Never expected in practice (the eligible pool is comfortably
				// larger than MAX_QUESTION_COUNT -- see that constant's own
				// doc), but this is the one place a shrinking content pool
				// could silently under-deliver on the questionCount promised
				// to players, so it's checked rather than assumed.
				return c.json({ error: "Not enough content available to start a game of this size" }, 500);
			}

			session.questionCount = questionCount;
			session.questions = questions;
			startNewRound(session, players, 0, now);
			await storage.put({ session, players });

			return c.json({ ok: true });
		});

		this.app.post("/guess", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status !== "in_progress") return c.json({ error: "No active round" }, 409);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const now = Date.now();
			self.lastSeenAt = now;

			if (session.roundWinnerId !== null) {
				await storage.put("players", players);
				return c.json({ error: "This round is already over" }, 409);
			}

			const body = await c.req.json<{ guess?: string }>().catch(() => ({}) as { guess?: string });
			const rawGuess = (body.guess ?? "").trim();
			if (!rawGuess) {
				await storage.put("players", players);
				return c.json({ error: "Missing guess" }, 400);
			}

			const question = session.questions[session.roundIndex];
			const result = await checkPlayerGuess(this.env.DB, "club_badge_questions", question.id, { guess: rawGuess });
			if (!result) {
				// Defensive only -- question.id always came from a real
				// club_badge_questions row selected at /start.
				await storage.put("players", players);
				return c.json({ error: "Unknown question" }, 404);
			}

			if (result.result === "correct") {
				self.wins += 1;
				session.roundWinnerId = self.id;
				session.roundAnswerName = result.name;
				await storage.put({ session, players });
				return c.json({ result: "correct" as const, answerName: result.name });
			}

			await storage.put("players", players);
			return c.json({ result: "wrong" as const });
		});
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}
}

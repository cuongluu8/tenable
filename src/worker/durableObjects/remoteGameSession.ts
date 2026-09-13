import { DurableObject } from "cloudflare:workers";
import { Hono, type Context } from "hono";
import { generateToken } from "../lib/remoteSession";
import { buildClubBadgeQuestions, pickRandomEligibleQuestions, type ClubBadgeQuestionPublic, type QuestionRow } from "../lib/clubBadgeRound";
import { buildTeammateQuestions, pickRandomTeammateQuestions, type TeammateQuestionPublic, type TeammateQuestionRow } from "../lib/teammateRound";
import { checkPlayerGuess } from "../lib/checkPlayerGuess";
import { buildHonourTiles, DEFAULT_HONOUR_COMPETITION_ID, gradeHonourGuess, HONOUR_COMPETITIONS, type HonourTilePrivate } from "../lib/rollOfHonour";

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
//   - Questions are one of the two "name the player" formats, chosen by
//     the host at /create and fixed for the session's life (gameType):
//     Club Run's badge trail (clubBadgeRound.ts) or, since later on
//     2026-09-13, Teammate Tell's "I played with..." clue cards
//     (teammateRound.ts) -- not the Top-10 category format. A single
//     correct answer per question is exactly what makes "first correct
//     guess wins" a coherent race, unlike a Top-10 list's multiple
//     answers. Everything below that isn't question assembly or the
//     per-tier hint gating in publicQuestion() is identical for both.
//   - Clients POLL a /state endpoint every 4s -- no WebSockets. Plain
//     poll-timing jitter alone was NOT actually harmless in practice,
//     though -- confirmed live across three real devices (2026-09-13):
//     the host's own client re-fetches /state right after /start
//     succeeds, so the host saw a new question up to several seconds
//     before other players' independent, unsynchronized poll timers
//     happened to catch up, a real head start in a "first correct guess
//     wins" race. See ROUND_START_GRACE_MS below for the fix -- guessing
//     itself is still fully server-adjudicated regardless.
//   - Joining is open for the whole game, not just the lobby (2026-09-13
//     -- originally lobby-only, a plain status check nothing else relied
//     on). A mid-game joiner starts on zero wins, an accepted
//     disadvantage; nothing about adjudication, hint timing or the start
//     countdown reads who was present at /start, so no other rule
//     changes. "Rejoining" after /leave is just this -- the old record is
//     gone, they come back as a fresh seat. See /join for the one
//     wrinkle (readiness when joining during a reveal).
//   - A player is "away" after 15s of silence (~3 missed polls); both
//     "everyone ready" and "everyone next-question" gates only wait on
//     non-away players. The host can also remove a player outright.
//   - Wrong guesses cost nothing -- unlimited attempts, a pure race on
//     the first correct one. A player CAN bow out of a question, though
//     -- the same two-step "Give up" Club Run's own solo/pass-and-play
//     screen has (RoundPlay.tsx), added 2026-09-13 so remote play matches
//     it. A give-up is per-player and final for that round (their own
//     guesses are rejected after it); the round itself only resolves
//     without a winner once EVERY non-away player has given up -- see
//     /give-up and maybeResolveRoundByGiveUp below.
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
// Give up (2026-09-13): /give-up -- per-player bow-out, and the round
// resolving with no winner once every non-away player has done so.
// Chat (2026-09-13): /message -- one short message per player at a time,
// shown next to their name on every client's leaderboard. See
// MESSAGE_MAX_WORDS and friends below.
// Play again (2026-09-13): /restart -- host-only, from "finished" back to
// "lobby" with the same players and a fresh scoreboard, so a group can
// run game after game on one code. "finished" is therefore no longer a
// terminal status; only "ended" is.
// Roll of Honour (2026-09-13): a third gameType with a different ENGINE --
// not rounds at all, but one shared grid of seasons (lib/rollOfHonour.ts)
// that players race to fill in: tap a season to lock it (HONOUR_LOCK_MS),
// answer it, a wrong answer frees it and blocks that player from it for
// HONOUR_RETRY_BLOCK_MS so someone else can try. Score is correct tiles,
// kept in the same `wins` field so the leaderboard/restart work as-is.
// Give up bows the player out of the whole game; the game finishes when
// every tile is answered or every active player has bowed out, and only
// then are the unanswered winners revealed. No hints. Lobby, chat, away,
// leave/end, Play again and the start countdown are all shared with the
// round-based modes; everything round-specific (ready gate, hint tiers,
// minimum reveal) simply never engages since no round ever starts.

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

// Which "name the player" format a session plays -- see the class doc.
// Mirrors the client's own RemoteGameType (remoteApi.ts); not imported
// from there (separate bundles, same reasoning as HINT_TIER_COUNT).
type RemoteGameType = "club-badges" | "teammates" | "roll-of-honour";
const GAME_TYPES: readonly RemoteGameType[] = ["club-badges", "teammates", "roll-of-honour"];
// The two round-based formats -- the ones with a questions table.
type RoundGameType = Exclude<RemoteGameType, "roll-of-honour">;
const QUESTIONS_TABLE: Record<RoundGameType, "club_badge_questions" | "teammate_questions"> = {
	"club-badges": "club_badge_questions",
	teammates: "teammate_questions",
};
type RemoteQuestionPublic = ClubBadgeQuestionPublic | TeammateQuestionPublic;

// Roll of Honour timings -- see the class doc. Both real durations, not
// env-overridable: tests only ever assert the immediate rejections.
const HONOUR_LOCK_MS = 20_000;
const HONOUR_RETRY_BLOCK_MS = 5_000;

interface HonourTileRecord extends HonourTilePrivate {
	lockedBy: string | null;
	lockedUntil: number | null;
	answeredBy: string | null;
	// playerId -> epoch ms until which THAT player may not re-select this
	// tile (their last answer on it was wrong).
	blockedUntil: Record<string, number>;
}

interface HonourRecord {
	competitionId: string;
	competitionName: string;
	tiles: HonourTileRecord[];
}

interface PublicHonourTile {
	season: string;
	status: "open" | "locked" | "answered";
	lockedBy: string | null;
	answeredBy: string | null;
	// Both null until the tile is answered correctly -- or the game is
	// over, when every tile is revealed.
	winner: string | null;
	imageUrl: string | null;
}

interface PublicHonour {
	competitionId: string;
	competitionName: string;
	// When the game started -- drives the client's shared start countdown
	// (publicRound is null for this mode, so it can't come from there).
	startedAt: number | null;
	tiles: PublicHonourTile[];
	// Bowed out of the whole game -- SessionRecord.roundGivenUpPlayerIds
	// doing double duty (this mode has exactly one "round": the game).
	givenUpPlayerIds: string[];
}

// Chat -- deliberately tiny: one live message per player (a new one
// replaces the old), capped at 20 words (the product ask) and, as a
// backstop against a 20-"word" wall of text, a character limit too, at
// most one post every 30s per player. Emojis are just characters here --
// nothing strips or rewrites the text beyond trimming it. A message is
// reported by /state for MESSAGE_VISIBLE_MS after posting, comfortably
// longer than the client's 4s poll (so a client whose poll just missed
// it still picks it up) plus the client's own 5s display; the client
// decides on its own when to scroll it away and never re-shows one it's
// already dismissed (RemoteGame.tsx's Leaderboard).
const MESSAGE_MAX_WORDS = 20;
const MESSAGE_MAX_CHARS = 240;
const MESSAGE_COOLDOWN_MS = 30_000;
const MESSAGE_VISIBLE_MS = 20_000;

// Hint tiers, in reveal order -- mirrors clubBadgesState.ts's HINT_KEYS
// exactly (country, nationality, transferDate), but NOT imported from
// there: that module lives under src/react-app (the client bundle), and
// worker code never imports from it (separate tsconfigs, separate
// bundles). Three tiers, hardcoded here, kept in sync by hand -- the
// actual per-tier gating (which fields a given hintsRevealed count
// unlocks) lives in publicQuestion() below, right next to this constant.
const HINT_TIER_COUNT = 3;
const HINT_REVEAL_INTERVAL_MS = 30_000;

// How long after roundStartedAt guesses are rejected -- the fix for the
// poll-timing head start described in the class doc above. Longer than
// the 4s poll interval clients actually use (not imported from anywhere;
// worker code never imports the client's polling constant, same
// separate-bundles reasoning as HINT_TIER_COUNT above), so every client
// is guaranteed at least one full poll cycle -- plus real headroom for
// its own network latency on top of that -- to have already seen the new
// round before anyone can submit. Enforced here, not just in the client
// UI (which also locks its own guess box for this same window -- see
// RemoteGame.tsx): a client that ignored its own disabled button and
// POSTed straight through would otherwise still get the same unfair
// head start this exists to remove.
//
// A real wrangler.json var (read fresh per-request below), not a bare
// constant -- same reasoning as circuitBreaker.ts's DAILY_REQUEST_BUDGET:
// integration tests override this to 0 so they don't need a real
// multi-second sleep between starting a round and guessing on it.
const DEFAULT_ROUND_START_GRACE_MS = 5_000;

// Minimum time a decided round stays on its reveal before the ready gate
// is allowed to advance past it -- the fix for a real report (2026-09-13)
// that the last question "went straight to the final results" on some
// devices: the reveal only exists server-side between "decided" and
// "everyone ready", and with one non-host player who wins and taps Ready
// inside a single 4s poll interval, every OTHER device's next poll finds
// the game already finished, never having seen the answer. Long enough
// for at least one full poll cycle plus latency on every client (same
// reasoning as DEFAULT_ROUND_START_GRACE_MS above), with reading time on
// top. Same env-var-with-default pattern, same reason: integration tests
// override it to 0 rather than sleeping through it.
const DEFAULT_MIN_REVEAL_MS = 5_000;

// lobby -> in_progress -> finished -> (lobby again, via /restart) ...;
// "ended" (host left) is the only terminal status.
type SessionStatus = "lobby" | "in_progress" | "finished" | "ended";

interface SessionRecord {
	status: SessionStatus;
	// Absent on sessions persisted before Teammate Tell existed -- read
	// back as "club-badges" (the only thing they could have been).
	gameType: RemoteGameType;
	questionCount: number | null;
	createdAt: number;
	// Phase 2 -- all null/empty while status is "lobby". Shape follows
	// gameType; the client discriminates on that, not on the question.
	questions: RemoteQuestionPublic[];
	roundIndex: number; // 0-based index into `questions`.
	roundStartedAt: number | null; // Epoch ms the current round began -- hint timing reads off this.
	roundWinnerId: string | null; // Set the instant someone's guess is graded correct; stays null if the round instead resolves by everyone giving up.
	// The real player's name -- the actual "is this round decided" signal
	// (not roundWinnerId, which can stay null): set either the instant
	// someone's guess is graded correct, or once every non-away player has
	// given up (see /give-up below), so a give-up-resolved round still
	// flows through the exact same reveal/ready-for-next-question gate a
	// won one does.
	roundAnswerName: string | null;
	// Epoch ms the round was decided (won, or resolved by everyone giving
	// up) -- what DEFAULT_MIN_REVEAL_MS measures from. null while open.
	roundDecidedAt: number | null;
	// Player ids who've given up on the CURRENT round -- reset alongside
	// roundWinnerId/roundAnswerName each time a new round starts (see
	// startNewRound). Once every non-away player is in this list, the
	// round resolves with no winner rather than sitting open forever
	// waiting for a guess nobody's going to make. For Roll of Honour the
	// whole game is the one round, so this is "bowed out of the game".
	roundGivenUpPlayerIds: string[];
	// Roll of Honour's grid -- null for the round-based formats, and for a
	// Roll of Honour session still in the lobby. Absent on records
	// persisted before the mode existed (read back as null).
	honour: HonourRecord | null;
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
	// Chat (see MESSAGE_* above). Both absent on records persisted before
	// chat existed -- read with `?? null`, never assumed present.
	message: { text: string; postedAt: number } | null;
	lastMessageAt: number | null;
}

interface PublicMessage {
	text: string;
	postedAt: number;
	// Server-computed at /state time so clients can judge "is this still
	// fresh enough to show" without comparing a server timestamp against
	// their own possibly-skewed clock. At most one poll interval stale.
	ageMs: number;
}

interface PublicPlayer {
	id: string;
	name: string;
	isHost: boolean;
	ready: boolean;
	away: boolean;
	wins: number;
	message: PublicMessage | null;
}

interface PublicRound {
	index: number;
	total: number;
	startedAt: number | null;
	hintsRevealed: number;
	question: RemoteQuestionPublic;
	winnerId: string | null;
	answerName: string | null;
	// Who's bowed out of this round so far (see SessionRecord.
	// roundGivenUpPlayerIds) -- clients use it to show their own "you gave
	// up, waiting for the others" state and to mark who's no longer racing.
	givenUpPlayerIds: string[];
}

// The one "is this round decided" check, used everywhere the answer's
// visibility or the round's openness matters (guessing, hint gating, the
// ready-to-advance gate). Deliberately NOT roundWinnerId -- a round
// resolved by everyone giving up has an answer to show but no winner.
function isRoundDecided(session: SessionRecord): boolean {
	return session.roundAnswerName !== null;
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
		message: publicMessage(player, now),
	};
}

function publicMessage(player: PlayerRecord, now: number): PublicMessage | null {
	const message = player.message ?? null;
	if (!message) return null;
	const ageMs = now - message.postedAt;
	if (ageMs >= MESSAGE_VISIBLE_MS) return null;
	return { text: message.text, postedAt: message.postedAt, ageMs };
}

// Whitespace-separated tokens, so an emoji-only message counts as one
// word and "🔥🔥🔥" as one too -- there's no sensible per-emoji rule
// worth the complexity (grapheme segmentation) for a 20-word cap.
function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
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
// for). This is the one place single-player's own equivalents (clubBadges.
// ts's and teammates.ts's /round) deliberately diverge from what this
// sends: solo/pass-and-play ship every field up front and hide them
// client-side only (nothing to cheat against on a shared or solo device);
// a real race across separate devices needs the server itself to withhold
// them, or a technically-inclined player could read the raw response and
// skip the wait entirely. Tier order per format mirrors what the solo
// screens reveal in order: Club Run country -> nationality -> transfer
// dates (clubBadgesState.ts's HINT_KEYS); Teammate Tell club+badge ->
// nationality -> overlap years (TeammateSetPlay.tsx's `hints`).
function publicQuestion(question: RemoteQuestionPublic, hintsRevealed: number): RemoteQuestionPublic {
	if ("badges" in question) {
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
	return {
		id: question.id,
		teammates: question.teammates,
		cardHints: question.cardHints.map((h) => ({
			club: hintsRevealed >= 1 ? h.club : null,
			image: hintsRevealed >= 1 ? h.image : null,
			years: hintsRevealed >= 3 ? h.years : null,
		})),
		nationality: hintsRevealed >= 2 ? question.nationality : null,
	};
}

// Answers stay hidden until a tile is answered correctly -- or the game is
// over, when the whole roll is revealed (including tiles nobody got).
function publicHonour(session: SessionRecord, now: number): PublicHonour | null {
	const honour = session.honour;
	if (!honour) return null;
	const over = session.status === "finished";
	return {
		competitionId: honour.competitionId,
		competitionName: honour.competitionName,
		startedAt: session.roundStartedAt,
		tiles: honour.tiles.map((t) => {
			const locked = t.lockedBy !== null && t.lockedUntil !== null && t.lockedUntil > now;
			const reveal = t.answeredBy !== null || over;
			return {
				season: t.season,
				status: t.answeredBy !== null ? "answered" : locked ? "locked" : "open",
				lockedBy: locked ? t.lockedBy : null,
				answeredBy: t.answeredBy,
				winner: reveal ? t.winner : null,
				imageUrl: reveal ? t.imageUrl : null,
			};
		}),
		givenUpPlayerIds: session.roundGivenUpPlayerIds,
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
	const hintsRevealed = isRoundDecided(session)
		? HINT_TIER_COUNT
		: Math.min(HINT_TIER_COUNT, Math.floor(elapsedMs / HINT_REVEAL_INTERVAL_MS));

	return {
		index,
		total: session.questions.length,
		startedAt: session.roundStartedAt,
		hintsRevealed,
		question: publicQuestion(question, hintsRevealed),
		winnerId: session.roundWinnerId,
		answerName: session.roundAnswerName,
		givenUpPlayerIds: session.roundGivenUpPlayerIds,
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
		// roundGivenUpPlayerIds was added (2026-09-13) after real sessions
		// had already been persisted without it -- a DO's storage outlives
		// deploys, so a record from before that field existed is read back
		// with it filled in rather than every reader having to `?? []`.
		const getSession = async (): Promise<SessionRecord | undefined> => {
			const session = await storage.get<SessionRecord>("session");
			if (session && !Array.isArray(session.roundGivenUpPlayerIds)) session.roundGivenUpPlayerIds = [];
			// Same for roundDecidedAt (added later the same day): a record
			// without it that IS decided is treated as decided long ago, so
			// the minimum-reveal check never holds a pre-existing session up.
			if (session && session.roundDecidedAt === undefined) session.roundDecidedAt = session.roundAnswerName !== null ? 0 : null;
			// And gameType (Teammate Tell added later still) -- see its own doc.
			if (session && !session.gameType) session.gameType = "club-badges";
			if (session && session.honour === undefined) session.honour = null;
			return session;
		};
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
			session.roundDecidedAt = null;
			session.roundGivenUpPlayerIds = [];
			// Fresh "ready to advance" gate for the new round -- see
			// PlayerRecord.ready's own doc on why this is reused rather than
			// a second field, and why it must be reset here: without this,
			// whatever readiness got someone PAST the previous round would
			// otherwise instantly satisfy the gate for the next one too.
			for (const p of players) p.ready = p.isHost;
		}

		// Resolves the current round with no winner once every non-away
		// player has given up on it -- the actual "give up" outcome, as
		// opposed to one player's own /give-up call, which is just that
		// player bowing out while the others keep racing. Called from
		// /give-up itself and from anything that shrinks the set of players
		// still racing (a not-given-up player leaving, being removed, or
		// going away between polls), since any of those can be what tips a
		// round into "nobody left is still trying". Requires at least one
		// non-away player: a room where everyone has gone quiet is left open
		// for them to come back to, not silently resolved behind their backs.
		// Persists nothing itself -- callers already write session/players
		// afterwards. Returns whether it resolved anything, so callers know
		// to follow up with maybeAdvanceRound.
		const resolveRoundByGiveUp = async (session: SessionRecord, players: PlayerRecord[], now: number): Promise<boolean> => {
			if (session.gameType === "roll-of-honour") return false; // Not a round-based format -- see finishHonourIfDone.
			if (session.status !== "in_progress" || isRoundDecided(session)) return false;
			const active = players.filter((p) => !isAway(p, now));
			if (active.length === 0 || !active.every((p) => session.roundGivenUpPlayerIds.includes(p.id))) return false;

			const question = session.questions[session.roundIndex];
			// checkPlayerGuess's give-up branch is exactly "hand me the real
			// answer without grading anything" -- the same lookup Club Run's
			// own solo give-up uses (clubBadges.ts's /check-guess), reused
			// rather than duplicating the entities join here.
			const result = await checkPlayerGuess(this.env.DB, QUESTIONS_TABLE[session.gameType as RoundGameType], question.id, { giveUp: true });
			if (!result) return false; // Defensive only -- see /guess's own "Unknown question" note.
			session.roundAnswerName = result.name;
			session.roundDecidedAt = now;
			return true;
		};

		// Advances past the current round once every non-host, non-away
		// player has marked ready -- called after anything that could newly
		// satisfy that gate (a /ready call, or a not-ready player leaving/
		// being removed). Requires the round to already be decided (won, or
		// resolved by everyone giving up -- isRoundDecided): this is a
		// "confirm you saw the answer, move on" gate, not itself a skip --
		// see class doc's "everyone next-question" line. Without this
		// precondition, a session with zero OTHER players (a host testing
		// solo) would satisfy "no non-host player is unready" vacuously and
		// blow through the entire question deck the instant /start
		// succeeded, before anyone had guessed anything.
		// Also holds the reveal on screen for at least MIN_REVEAL_MS after the
		// round was decided (see DEFAULT_MIN_REVEAL_MS) -- which is why /state
		// calls this on every poll too, not just the ready/leave/remove
		// handlers: once the gate is otherwise satisfied, the advance has to
		// happen on whichever request first arrives after the window closes,
		// and polls are the only requests guaranteed to keep coming.
		async function maybeAdvanceRound(session: SessionRecord, players: PlayerRecord[], now: number): Promise<void> {
			if (session.status !== "in_progress" || !isRoundDecided(session)) return;
			if (session.gameType === "roll-of-honour") return; // No rounds to advance -- see finishHonourIfDone.
			if (playersNotReady(players, now).length > 0) return;
			const rawMinRevealMs = Number(env.MIN_REVEAL_MS);
			const minRevealMs = Number.isFinite(rawMinRevealMs) ? rawMinRevealMs : DEFAULT_MIN_REVEAL_MS;
			if (session.roundDecidedAt !== null && now - session.roundDecidedAt < minRevealMs) return;

			startNewRound(session, players, session.roundIndex + 1, now);
			await storage.put({ session, players });
		}

		// ---- Roll of Honour helpers (see class doc) ----

		// Drops every lock `playerId` holds (a player holds at most one, but
		// this is the safe form). Returns whether anything changed.
		function releaseHonourLocks(session: SessionRecord, playerId: string): boolean {
			let changed = false;
			for (const t of session.honour?.tiles ?? []) {
				if (t.lockedBy === playerId) {
					t.lockedBy = null;
					t.lockedUntil = null;
					changed = true;
				}
			}
			return changed;
		}

		// Locks are time-limited (HONOUR_LOCK_MS) and expire lazily -- on
		// whichever request next looks at the grid -- rather than by alarm.
		function expireHonourLocks(session: SessionRecord, now: number): boolean {
			let changed = false;
			for (const t of session.honour?.tiles ?? []) {
				if (t.lockedBy !== null && (t.lockedUntil === null || t.lockedUntil <= now)) {
					t.lockedBy = null;
					t.lockedUntil = null;
					changed = true;
				}
			}
			return changed;
		}

		// The game is over once every tile is answered, or once every
		// non-away player has bowed out (same "at least one active player"
		// guard as resolveRoundByGiveUp: a room that's all gone quiet is
		// left for them to come back to). Returns whether it finished.
		function finishHonourIfDone(session: SessionRecord, players: PlayerRecord[], now: number): boolean {
			if (session.gameType !== "roll-of-honour" || session.status !== "in_progress" || !session.honour) return false;
			const allAnswered = session.honour.tiles.every((t) => t.answeredBy !== null);
			const active = players.filter((p) => !isAway(p, now));
			const allBowedOut = active.length > 0 && active.every((p) => session.roundGivenUpPlayerIds.includes(p.id));
			if (!allAnswered && !allBowedOut) return false;
			session.status = "finished";
			session.roundDecidedAt = now;
			return true;
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

			const body = await c.req.json<{ hostName?: string; gameType?: string }>().catch(() => ({}) as { hostName?: string; gameType?: string });
			const hostName = (body.hostName ?? "").trim();
			if (!hostName) return c.json({ error: "Missing host name" }, 400);
			if (hostName.length > MAX_NAME_LENGTH) return c.json({ error: "Name is too long" }, 400);
			// Omitted means Club Run -- what every client sent before the
			// field existed.
			const gameType = (body.gameType ?? "club-badges") as RemoteGameType;
			if (!GAME_TYPES.includes(gameType)) return c.json({ error: "Unknown game type" }, 400);

			const now = Date.now();
			const session: SessionRecord = {
				status: "lobby",
				gameType,
				questionCount: null,
				createdAt: now,
				questions: [],
				roundIndex: 0,
				roundStartedAt: null,
				roundWinnerId: null,
				roundAnswerName: null,
				roundDecidedAt: null,
				roundGivenUpPlayerIds: [],
				honour: null,
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
				message: null,
				lastMessageAt: null,
			};
			await storage.put({ session, players: [host] });

			return c.json({ sessionCode: code, playerId: host.id, playerToken: host.token });
		});

		this.app.post("/join", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status === "finished" || session.status === "ended") {
				return c.json({ error: "This game is over" }, 409);
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
				// Joining during a reveal (the round's already decided, everyone
				// else is confirming they've seen the answer): pre-marked ready,
				// or this newcomer -- who never saw the question -- would block
				// the whole room's advance to the next one until they found the
				// "Ready" button for an answer that means nothing to them. In
				// the lobby, or mid-round, the normal not-ready default applies
				// (startNewRound resets it per round anyway).
				ready: session.status === "in_progress" && isRoundDecided(session),
				joinedAt: now,
				lastSeenAt: now,
				wins: 0,
				message: null,
				lastMessageAt: null,
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
			// "Away" is purely time-based (no request marks it), so the moment
			// a still-racing player crosses PLAYER_AWAY_MS can only ever be
			// noticed by someone ELSE's poll -- this one. If that leaves only
			// given-up players active, the round resolves here rather than
			// hanging until the away player happens to come back.
			// Roll of Honour: a lock running out, or the last active player
			// going away/bowing out, can only be noticed by someone's poll --
			// this one.
			const honourChanged = expireHonourLocks(session, now) || finishHonourIfDone(session, players, now);
			if ((await resolveRoundByGiveUp(session, players, now)) || honourChanged) {
				await storage.put({ session, players });
			} else {
				await storage.put("players", players);
			}
			// Unconditional -- see maybeAdvanceRound's own doc on why a poll
			// has to be able to complete an advance the ready gate already
			// approved (the minimum-reveal window). A read-only no-op when
			// there's nothing to advance.
			await maybeAdvanceRound(session, players, now);

			return c.json({
				status: session.status,
				gameType: session.gameType,
				questionCount: session.questionCount,
				players: players.map((p) => toPublicPlayer(p, now)),
				round: publicRound(session, now),
				honour: publicHonour(session, now),
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
				const now = Date.now();
				// The departing player might have been the last one still
				// racing (everyone else already gave up), or the last one the
				// round-advance gate was waiting on -- or, Roll of Honour,
				// holding a tile lock / the last one still filling the grid.
				const honourChanged = releaseHonourLocks(session, self.id) || finishHonourIfDone(session, remaining, now);
				if ((await resolveRoundByGiveUp(session, remaining, now)) || honourChanged) await storage.put("session", session);
				await storage.put("players", remaining);
				await maybeAdvanceRound(session, remaining, now);
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
			const now = Date.now();
			const honourChanged = releaseHonourLocks(session, target.id) || finishHonourIfDone(session, remaining, now);
			if ((await resolveRoundByGiveUp(session, remaining, now)) || honourChanged) await storage.put("session", session);
			await storage.put("players", remaining);
			await maybeAdvanceRound(session, remaining, now);

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

			const body = await c.req.json<{ questionCount?: number; competitionId?: string }>().catch(() => ({}) as { questionCount?: number; competitionId?: string });

			if (session.gameType === "roll-of-honour") {
				// No question count -- the grid IS the game. The competition is
				// the one choice, defaulting to the only one that exists today.
				const competition = HONOUR_COMPETITIONS[body.competitionId ?? DEFAULT_HONOUR_COMPETITION_ID];
				if (!competition) return c.json({ error: "Unknown competition" }, 400);
				const now = Date.now();
				const notReady = playersNotReady(players, now);
				if (notReady.length > 0) {
					return c.json({ error: "All players must be ready before starting", notReadyPlayerIds: notReady.map((p) => p.id) }, 409);
				}
				const tiles = await buildHonourTiles(this.env.DB, competition);
				session.honour = {
					competitionId: competition.id,
					competitionName: competition.name,
					tiles: tiles.map((t) => ({ ...t, lockedBy: null, lockedUntil: null, answeredBy: null, blockedUntil: {} })),
				};
				session.questionCount = tiles.length;
				session.status = "in_progress";
				// roundStartedAt drives the same shared start countdown the
				// round formats use (ROUND_START_GRACE_MS) -- everything else
				// round-shaped stays null, so no round ever "starts".
				session.roundStartedAt = now;
				session.roundGivenUpPlayerIds = [];
				await storage.put({ session, players });
				return c.json({ ok: true });
			}

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

			// The one place the two formats' assembly differs -- everything
			// downstream works off the built RemoteQuestionPublic list.
			let questions: RemoteQuestionPublic[];
			if (session.gameType === "teammates") {
				const { results: rows } = await this.env.DB.prepare("SELECT id, player_id, teammate_ids, hints FROM teammate_questions").all<TeammateQuestionRow>();
				questions = await buildTeammateQuestions(this.env.DB, pickRandomTeammateQuestions(rows ?? [], questionCount));
			} else {
				const { results: rows } = await this.env.DB.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions").all<QuestionRow>();
				questions = await buildClubBadgeQuestions(this.env.DB, pickRandomEligibleQuestions(rows ?? [], questionCount));
			}
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

			if (isRoundDecided(session)) {
				await storage.put("players", players);
				return c.json({ error: "This round is already over" }, 409);
			}
			if (session.roundGivenUpPlayerIds.includes(self.id)) {
				// A give-up is final for the round (see class doc) -- same as
				// Club Run's own RoundPlay, where giving up ends that player's
				// turn at the question outright rather than being undoable.
				await storage.put("players", players);
				return c.json({ error: "You've already given up on this round" }, 409);
			}
			if (session.gameType === "roll-of-honour") {
				await storage.put("players", players);
				return c.json({ error: "This game is answered on the grid -- see /tile/answer" }, 409);
			}

			// `||` (not `??`) would wrongly fall back to the default when the
			// test override is exactly 0 -- Number.isFinite is what actually
			// distinguishes "not configured" from "configured to zero".
			const rawGraceMs = Number(this.env.ROUND_START_GRACE_MS);
			const roundStartGraceMs = Number.isFinite(rawGraceMs) ? rawGraceMs : DEFAULT_ROUND_START_GRACE_MS;
			if (session.roundStartedAt !== null && now - session.roundStartedAt < roundStartGraceMs) {
				// See ROUND_START_GRACE_MS's own doc -- a legitimate client's own
				// guess box is disabled for this same window, so only a client
				// bypassing its own UI (or one whose clock is meaningfully off)
				// ever actually reaches this.
				await storage.put("players", players);
				return c.json({ error: "Too early -- wait for the countdown" }, 409);
			}

			const body = await c.req.json<{ guess?: string }>().catch(() => ({}) as { guess?: string });
			const rawGuess = (body.guess ?? "").trim();
			if (!rawGuess) {
				await storage.put("players", players);
				return c.json({ error: "Missing guess" }, 400);
			}

			const question = session.questions[session.roundIndex];
			const result = await checkPlayerGuess(this.env.DB, QUESTIONS_TABLE[session.gameType as RoundGameType], question.id, { guess: rawGuess });
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
				session.roundDecidedAt = now;
				await storage.put({ session, players });
				return c.json({ result: "correct" as const, answerName: result.name });
			}

			await storage.put("players", players);
			return c.json({ result: "wrong" as const });
		});

		// One player bowing out of the current round -- the remote
		// counterpart of Club Run's own "Give up" (RoundPlay.tsx's
		// confirmGiveUp -> checkRoundGuess with { giveUp: true }). Unlike
		// solo/pass-and-play, where a give-up reveals the answer to that
		// player immediately (nobody left to spoil it for), here the answer
		// stays hidden until the round is actually decided: someone else may
		// still be racing for it, and the players are on separate devices
		// but very possibly in the same room or voice call. So this only
		// records the bow-out; the reveal comes through the same /state
		// answerName every other player sees, either when someone wins or
		// when the last active player gives up too (resolveRoundByGiveUp).
		// Idempotent: giving up twice is a no-op 200, not an error, so a
		// double-tap or a retried request can't surface a spurious failure.
		this.app.post("/give-up", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status !== "in_progress") return c.json({ error: "No active round" }, 409);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const now = Date.now();
			self.lastSeenAt = now;

			if (session.gameType === "roll-of-honour") {
				// Bows out of the whole game (see class doc): any held tile goes
				// back, and if nobody active is left playing the game's over.
				if (!session.roundGivenUpPlayerIds.includes(self.id)) session.roundGivenUpPlayerIds.push(self.id);
				releaseHonourLocks(session, self.id);
				finishHonourIfDone(session, players, now);
				await storage.put({ session, players });
				return c.json({ ok: true as const });
			}

			if (isRoundDecided(session)) {
				await storage.put("players", players);
				return c.json({ error: "This round is already over" }, 409);
			}

			if (!session.roundGivenUpPlayerIds.includes(self.id)) session.roundGivenUpPlayerIds.push(self.id);
			await resolveRoundByGiveUp(session, players, now);
			await storage.put({ session, players });
			// A solo host (no other players) has nobody to wait on -- same
			// vacuous-gate behaviour a win already gets there.
			await maybeAdvanceRound(session, players, now);

			// Nothing about the outcome is returned here -- the client learns
			// whether the round resolved from its own /state refresh, same as
			// every other player does, rather than from a field that would be
			// stale the instant maybeAdvanceRound above moved a solo host on.
			return c.json({ ok: true as const });
		});

		// Chat -- see MESSAGE_* above. Allowed in any live status (lobby, a
		// round, the final results), just not once the session's ended;
		// the client only offers the composer on the game screen today,
		// but nothing here should need to change if that widens.
		this.app.post("/message", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status === "ended") return c.json({ error: "This session has already ended" }, 409);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const now = Date.now();
			self.lastSeenAt = now;

			const body = await c.req.json<{ text?: string }>().catch(() => ({}) as { text?: string });
			// Internal runs of whitespace collapsed too, not just trimmed --
			// what's stored is what every other client renders, in a single
			// nowrap line, so there's nothing a run of spaces or a newline
			// could usefully mean there.
			const text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
			if (!text) {
				await storage.put("players", players);
				return c.json({ error: "Type a message first" }, 400);
			}
			if (text.length > MESSAGE_MAX_CHARS || countWords(text) > MESSAGE_MAX_WORDS) {
				await storage.put("players", players);
				return c.json({ error: `Keep it to ${MESSAGE_MAX_WORDS} words` }, 400);
			}

			const lastMessageAt = self.lastMessageAt ?? null;
			if (lastMessageAt !== null && now - lastMessageAt < MESSAGE_COOLDOWN_MS) {
				const retryAfterMs = MESSAGE_COOLDOWN_MS - (now - lastMessageAt);
				await storage.put("players", players);
				return c.json({ error: `You can post again in ${Math.ceil(retryAfterMs / 1000)}s`, retryAfterMs }, 429);
			}

			self.message = { text, postedAt: now };
			self.lastMessageAt = now;
			await storage.put("players", players);

			return c.json({ ok: true as const });
		});

		// ---- Roll of Honour's grid (see class doc) ----

		// Shared preamble for the three tile routes: a live Roll of Honour
		// game, a real player who hasn't bowed out. Returns the error
		// response to send, or the pieces to proceed with.
		const honourContext = async (c: Context) => {
			const session = await getSession();
			if (!session) return { error: c.json({ error: "Session not found" }, 404) };
			if (session.gameType !== "roll-of-honour" || !session.honour) return { error: c.json({ error: "Not a Roll of Honour game" }, 409) };
			if (session.status !== "in_progress") return { error: c.json({ error: "No game in progress" }, 409) };
			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return { error: c.json({ error: "Invalid session token" }, 401) };
			const now = Date.now();
			self.lastSeenAt = now;
			if (session.roundGivenUpPlayerIds.includes(self.id)) {
				await storage.put("players", players);
				return { error: c.json({ error: "You've given up on this game" }, 409) };
			}
			expireHonourLocks(session, now);
			return { session, honour: session.honour, players, self, now };
		};

		// Take a season to answer it. Refused if someone else holds it, if
		// this player's own wrong answer on it is still inside the retry
		// block, or during the start countdown. Taking a tile drops any
		// other tile this player was holding -- one at a time.
		this.app.post("/tile/select", async (c) => {
			const ctx = await honourContext(c);
			if ("error" in ctx) return ctx.error;
			const { session, honour, players, self, now } = ctx;

			const rawGraceMs = Number(this.env.ROUND_START_GRACE_MS);
			const roundStartGraceMs = Number.isFinite(rawGraceMs) ? rawGraceMs : DEFAULT_ROUND_START_GRACE_MS;
			if (session.roundStartedAt !== null && now - session.roundStartedAt < roundStartGraceMs) {
				await storage.put({ session, players });
				return c.json({ error: "Too early -- wait for the countdown" }, 409);
			}

			const body = await c.req.json<{ season?: string }>().catch(() => ({}) as { season?: string });
			const tile = honour.tiles.find((t) => t.season === body.season);
			if (!tile) {
				await storage.put({ session, players });
				return c.json({ error: "Unknown season" }, 404);
			}
			if (tile.answeredBy !== null) {
				await storage.put({ session, players });
				return c.json({ error: "That season's already been answered" }, 409);
			}
			if (tile.lockedBy !== null && tile.lockedBy !== self.id) {
				await storage.put({ session, players });
				return c.json({ error: "Someone else has that season right now" }, 409);
			}
			const blockedUntil = tile.blockedUntil[self.id] ?? 0;
			if (blockedUntil > now) {
				await storage.put({ session, players });
				return c.json({ error: "You just got that one wrong -- give someone else a go", retryAfterMs: blockedUntil - now }, 409);
			}

			releaseHonourLocks(session, self.id);
			tile.lockedBy = self.id;
			tile.lockedUntil = now + HONOUR_LOCK_MS;
			await storage.put({ session, players });
			return c.json({ ok: true as const, lockedForMs: HONOUR_LOCK_MS });
		});

		// Put a held season back without answering (Cancel).
		this.app.post("/tile/release", async (c) => {
			const ctx = await honourContext(c);
			if ("error" in ctx) return ctx.error;
			const { session, players, self } = ctx;
			releaseHonourLocks(session, self.id);
			await storage.put({ session, players });
			return c.json({ ok: true as const });
		});

		// Answer a season this player currently holds. Correct: the tile is
		// theirs (wins += 1) and revealed to everyone; wrong: the tile is
		// freed and this player is blocked from re-taking it for
		// HONOUR_RETRY_BLOCK_MS. Either way the hold ends.
		this.app.post("/tile/answer", async (c) => {
			const ctx = await honourContext(c);
			if ("error" in ctx) return ctx.error;
			const { session, honour, players, self, now } = ctx;

			const body = await c.req.json<{ season?: string; guess?: string }>().catch(() => ({}) as { season?: string; guess?: string });
			const tile = honour.tiles.find((t) => t.season === body.season);
			if (!tile) {
				await storage.put({ session, players });
				return c.json({ error: "Unknown season" }, 404);
			}
			if (tile.answeredBy !== null) {
				await storage.put({ session, players });
				return c.json({ error: "That season's already been answered" }, 409);
			}
			if (tile.lockedBy !== self.id) {
				// Includes "was yours but the hold ran out" -- expireHonourLocks
				// in the preamble already cleared it.
				await storage.put({ session, players });
				return c.json({ error: "Your hold on that season has run out -- take it again" }, 409);
			}
			const guess = (body.guess ?? "").trim();
			if (!guess) {
				await storage.put({ session, players });
				return c.json({ error: "Missing guess" }, 400);
			}

			tile.lockedBy = null;
			tile.lockedUntil = null;
			if (gradeHonourGuess(guess, tile)) {
				tile.answeredBy = self.id;
				self.wins += 1;
				finishHonourIfDone(session, players, now);
				await storage.put({ session, players });
				return c.json({ result: "correct" as const, winner: tile.winner, imageUrl: tile.imageUrl });
			}
			tile.blockedUntil[self.id] = now + HONOUR_RETRY_BLOCK_MS;
			await storage.put({ session, players });
			return c.json({ result: "wrong" as const, retryAfterMs: HONOUR_RETRY_BLOCK_MS });
		});

		// Host-only: a finished game back to the lobby, same code, same
		// players, scores reset unless the host asks to keep them running
		// (`keepScores` -- a running total across games on one code) -- from
		// there it's the normal ready/start
		// flow again (everyone re-readies, the host picks a question count),
		// which is deliberately reused rather than jumping straight into a
		// new game: someone may have put their phone down at the results.
		// Players who've drifted away are left in place -- the ready gate
		// already skips them, and they come back on their next poll.
		this.app.post("/restart", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);

			const players = await getPlayers();
			const caller = findByToken(players, c.req.header("X-Player-Token"));
			if (!caller) return c.json({ error: "Invalid session token" }, 401);
			if (!caller.isHost) return c.json({ error: "Only the host can start a new game" }, 403);
			if (session.status !== "finished") return c.json({ error: "The current game hasn't finished" }, 409);

			const body = await c.req.json<{ keepScores?: boolean }>().catch(() => ({}) as { keepScores?: boolean });
			const keepScores = body.keepScores === true;

			const now = Date.now();
			session.status = "lobby";
			session.questionCount = null;
			session.questions = [];
			session.roundIndex = 0;
			session.roundStartedAt = null;
			session.roundWinnerId = null;
			session.roundAnswerName = null;
			session.roundDecidedAt = null;
			session.roundGivenUpPlayerIds = [];
			session.honour = null;
			for (const p of players) {
				if (!keepScores) p.wins = 0;
				p.ready = p.isHost; // Same as a fresh /create: the host is ready by definition, everyone else re-readies.
			}
			caller.lastSeenAt = now;
			await storage.put({ session, players });

			return c.json({ ok: true as const });
		});
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}
}

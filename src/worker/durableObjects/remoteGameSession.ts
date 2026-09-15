import { DurableObject } from "cloudflare:workers";
import { Hono, type Context } from "hono";
import { generateToken } from "../lib/remoteSession";
import { buildClubBadgeQuestions, pickRandomEligibleQuestions, type ClubBadgeQuestionPublic, type QuestionRow } from "../lib/clubBadgeRound";
import { buildTeammateQuestions, pickRandomTeammateQuestions, type TeammateQuestionPublic, type TeammateQuestionRow } from "../lib/teammateRound";
import { checkPlayerGuess, gradeGuess, loadRoundAnswers, type RoundAnswer } from "../lib/checkPlayerGuess";
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
//   - Clients hold a WebSocket (GET /ws) and get the public state PUSHED
//     on every change (2026-09-14 -- see the WebSockets section in the
//     constructor); /state polling (4s, 1.5s during a Roll of Honour
//     game) is the fallback while a socket is down. Before sockets, plain
//     poll-timing jitter was NOT actually harmless in practice --
//     confirmed live across three real devices (2026-09-13): the host's
//     own client re-fetched /state right after /start succeeded, so the
//     host saw a new question up to several seconds before other
//     players' independent, unsynchronized poll timers happened to catch
//     up, a real head start in a "first correct guess wins" race. See
//     ROUND_START_GRACE_MS below for the fix, which stays -- guessing
//     itself is fully server-adjudicated regardless.
//   - Joining is open for the whole game, not just the lobby (2026-09-13
//     -- originally lobby-only, a plain status check nothing else relied
//     on). A mid-game joiner starts on zero wins, an accepted
//     disadvantage; nothing about adjudication, hint timing or the start
//     countdown reads who was present at /start, so no other rule
//     changes. "Rejoining" after /leave is just this -- the old record is
//     gone, they come back as a fresh seat. See /join for the one
//     wrinkle (readiness when joining during a reveal).
//   - A player is "away" 15s after their last poll or 60s after their
//     last socket ping (see PLAYER_AWAY_MS / SOCKET_AWAY_MS), and is
//     DROPPED from the session after 30 minutes unseen (IDLE_REMOVE_MS,
//     pruneIdle) -- the host too, which ends the session, unless a game
//     is in progress (it plays on without them; they're dropped once it's
//     over). Their seat is simply gone; coming back means rejoining. Both
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
// Activity feed (2026-09-14): every chat message, every guess (right or
// wrong), give-ups and round/game events, kept for the whole session
// (across Play again) in SessionRecord.feed and served incrementally by
// /state?since=<id> -- the client's side pane (remote/ChatPane.tsx). See
// FEED_MAX_ENTRIES.
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

const PLAYER_AWAY_MS = 15_000; // ~3 missed 4s polls -- see class doc and isAway.
// The socket equivalent: a connected player pings every 25s (see
// useRemoteSession.ts's SOCKET_PING_MS), so two missed pings plus slack.
// Coarser than the poll rule on purpose -- a tighter one needs more
// pings, and pings are the one steady per-player cost sockets left.
const SOCKET_AWAY_MS = 60_000;
// A socket that hasn't pinged for this long is dead on the far side
// (network gone without a close frame) -- closed by the next broadcast so
// it doesn't linger. Past SOCKET_AWAY_MS: by then the player has been
// away for a while and, if they're back, has a fresh socket.
const SOCKET_STALE_MS = 120_000;
// Actions a client may send over its socket (webSocketMessage) and the
// route each one dispatches to -- the same routes the HTTP path uses.
// create/join/leave/state stay HTTP: no socket exists yet for the first
// two, leave closes it, state IS the push.
const SOCKET_ACTIONS: Record<string, string> = {
	ready: "/ready",
	guess: "/guess",
	"give-up": "/give-up",
	message: "/message",
	restart: "/restart",
	start: "/start",
	remove: "/remove",
	"tile/select": "/tile/select",
	"tile/release": "/tile/release",
	"tile/answer": "/tile/answer",
};
// Socket-action burst guard per player -- see webSocketMessage.
const SOCKET_ACTIONS_PER_WINDOW = 60;
const SOCKET_ACTION_WINDOW_MS = 10_000;
// A player unseen (no ping, no poll) for this long is dropped from the
// session -- lazily, by whichever request or alarm tick next runs (see
// pruneIdle), never by a timer of its own: an idle player is the unhappy
// case and mustn't cost anything to handle. The client pauses itself
// after 10 minutes without a touch (useRemoteSession.ts's IDLE_MS) and a
// hidden tab disconnects at once, so a real person's phone in their
// pocket stops pinging well before this; whoever is still unseen at 30
// minutes has left. A wrangler var so integration tests can shrink it.
const DEFAULT_IDLE_REMOVE_MS = 30 * 60_000;
// A session nobody has touched for this long is deleted outright (storage
// and all) by the object's alarm -- see alarm() below. Before this
// (2026-09-14) abandoned sessions lived forever; every code ever created
// was a permanent row set. A day covers "we'll finish tomorrow" and the
// lobby link someone opens late; the only things that resume a session
// are its players' own pings and polls, which refresh lastSeenAt.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
// ...but a session that has ENDED, or whose roster is empty (everyone
// left or was dropped), has nothing anyone can come back to, so it goes
// an hour after its last activity instead -- storage freed sooner for no
// extra requests (the alarm was being booked anyway). See sessionTtlMs.
const ENDED_TTL_MS = 60 * 60 * 1000;

// Which of the two applies -- shared by scheduleAlarm and alarm() so the
// booking and the check can't disagree (they'd loop hourly if they did).
function sessionTtlMs(status: SessionRecord["status"], playerCount: number): number {
	return status === "ended" || playerCount === 0 ? ENDED_TTL_MS : SESSION_TTL_MS;
}
// /state's heartbeat write (lastSeenAt) is skipped when the previous one is
// younger than this -- see that handler. Comfortably inside PLAYER_AWAY_MS.
const HEARTBEAT_WRITE_MIN_MS = 3_000;
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

// Chat -- deliberately tiny: capped at 20 words (the product ask) and, as
// a backstop against a 20-"word" wall of text, a character limit too, at
// most one post every 30s per player. Emojis are just characters here --
// nothing strips or rewrites the text beyond trimming it. A message goes
// into the activity feed (below) and nowhere else -- the per-player
// "live message" the leaderboard used to show was dropped 2026-09-14
// once the feed pane existed, so chat isn't shown in two places.
const MESSAGE_MAX_WORDS = 20;
const MESSAGE_MAX_CHARS = 240;
const MESSAGE_COOLDOWN_MS = 30_000;

// The activity feed's cap. Oldest entries drop off past this -- a 4-player
// game night with chat and every guess logged is a few hundred entries;
// the DO stores the whole session record as one value (128KB cap), and
// 300 entries of ~100 bytes is comfortably inside that.
const FEED_MAX_ENTRIES = 300;

interface FeedEntry {
	id: number; // Monotonic within the session -- /state?since= filters on it.
	at: number;
	kind: "chat" | "guess" | "give-up" | "system";
	playerId: string | null; // null for system entries.
	text: string; // The message, the guess, or the system line.
	// guess: whether it was right. system/chat/give-up: absent.
	correct?: boolean;
	// Roll of Honour guesses: which season was being answered.
	season?: string;
}

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
	// One per question, resolved at /start (lib/checkPlayerGuess.ts's
	// RoundAnswer) so a guess is graded here, not against D1. null where
	// the answer couldn't be resolved (then /guess falls back to D1).
	// NEVER part of the public state -- see publicRound/publicQuestion.
	answers: (RoundAnswer | null)[];
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
	// Activity feed -- see FEED_MAX_ENTRIES. Survives Play again (it's the
	// session's history, not the game's). Both absent on older records.
	feed: FeedEntry[];
	feedNextId: number;
}

function pushFeed(session: SessionRecord, now: number, entry: Omit<FeedEntry, "id" | "at">): void {
	session.feed.push({ id: session.feedNextId++, at: now, ...entry });
	if (session.feed.length > FEED_MAX_ENTRIES) session.feed.splice(0, session.feed.length - FEED_MAX_ENTRIES);
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
	// Chat cooldown (see MESSAGE_COOLDOWN_MS). Absent on records persisted
	// before chat existed -- read with `?? null`, never assumed present.
	lastMessageAt: number | null;
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

function toPublicPlayer(player: PlayerRecord, away: boolean): PublicPlayer {
	return {
		id: player.id,
		name: player.name,
		isHost: player.isHost,
		ready: player.ready,
		away,
		wins: player.wins,
	};
}

// Whitespace-separated tokens, so an emoji-only message counts as one
// word and "🔥🔥🔥" as one too -- there's no sensible per-emoji rule
// worth the complexity (grapheme segmentation) for a 20-word cap.
function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
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

// FNV-1a, 32-bit, as 8 hex chars -- cheap, and a collision only costs one
// poll's worth of a missed update (the next differing poll corrects it).
function fingerprint(s: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(16).padStart(8, "0");
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
	// Set in the constructor (the storage and socket helpers are
	// closure-local there).
	private wipe!: () => Promise<void>;
	private tokenForPlayer!: (playerId: string) => Promise<string | null>;
	private tick!: (now: number) => Promise<void>;
	private onSocketGone!: (ws: WebSocket) => Promise<void>;
	private socketsLastSeen!: () => number;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.app = new Hono();

		// ---- Storage (2026-09-14: the object's SQLite tables) ----
		//
		// The session used to be two KV values -- `session` (everything,
		// including the whole feed and grid) and `players` -- rewritten in
		// full on every change: ~60KB per guess for a chatty Roll of Honour
		// game, against the KV backend's 128KiB value cap. Now (docs/
		// scaling.md §4c) it's five tables, one row per player / tile / feed
		// entry, and the object keeps the records IN MEMORY as the working
		// copy: loaded once per wake, mutated by the handlers exactly as
		// before, and persisted by save(), which diffs each record against
		// what was last written and touches only the rows that changed. So
		// a poll reads no storage at all (memory), a guess writes one or two
		// rows, and the feed is a plain append. The object is the sole
		// writer of its own storage, which is what makes the cache safe;
		// alarm() below is the one reader that goes to SQL directly, so a
		// test can age rows underneath it.
		const storage = ctx.storage;
		const sql = storage.sql;
		const ensureTables = (): void => {
			sql.exec(`
			CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, data TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, data TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, data TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS tiles (season TEXT PRIMARY KEY, data TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS feed (id INTEGER PRIMARY KEY, at INTEGER NOT NULL, kind TEXT NOT NULL, player_id TEXT, text TEXT NOT NULL, correct INTEGER, season TEXT);
			`);
		};
		ensureTables();

		interface Loaded {
			session: SessionRecord | undefined;
			players: PlayerRecord[];
		}
		let loaded: Loaded | null = null;
		let loading: Promise<Loaded> | null = null;
		// Set by save() when it wrote something -- the WebSocket layer below
		// broadcasts after the request when it's set.
		let dirty = false;
		// Last-written JSON per row (session core, questions, player:<id>,
		// tile:<season>) -- save() only writes a row whose JSON differs.
		const written = new Map<string, string>();
		let writtenFeedMaxId = 0;
		let writtenFeedMinId = 0;

		// Fields added after real sessions had been persisted without them
		// (roundGivenUpPlayerIds 2026-09-13, roundDecidedAt, gameType,
		// honour, feed) -- filled in on read so no reader needs `?? x`.
		const normaliseSession = (session: SessionRecord): SessionRecord => {
			if (!Array.isArray(session.roundGivenUpPlayerIds)) session.roundGivenUpPlayerIds = [];
			if (session.roundDecidedAt === undefined) session.roundDecidedAt = session.roundAnswerName !== null ? 0 : null;
			if (!session.gameType) session.gameType = "club-badges";
			if (session.honour === undefined) session.honour = null;
			if (!Array.isArray(session.feed)) session.feed = [];
			// Ids are monotonic and trimming keeps the newest, so the next id
			// is always one past the last entry -- not persisted (see coreJson).
			session.feedNextId = (session.feed.length ? session.feed[session.feed.length - 1].id : 0) + 1;
			if (!Array.isArray(session.answers)) session.answers = []; // Pre-2026-09-15 session: graded against D1 until its next /start.
			return session;
		};

		// The session row is everything EXCEPT the parts with their own
		// tables (questions, tiles, feed) -- so a lock, a guess or a chat
		// line never rewrites the question deck.
		const coreJson = (session: SessionRecord): string => {
			// feedNextId is derived from the feed on load (see load /
			// normaliseSession), so a chat line or a wrong guess -- which
			// change nothing else in here -- doesn't rewrite this row.
			const { feed: _feed, questions: _questions, answers: _answers, feedNextId: _next, honour, ...rest } = session;
			void _feed;
			void _questions;
			void _answers;
			void _next;
			return JSON.stringify({ ...rest, honour: honour ? { competitionId: honour.competitionId, competitionName: honour.competitionName } : null });
		};

		// The questions row carries the deck AND its answers -- both change
		// only at /start, never on a guess, so they share one row.
		const questionsJson = (session: SessionRecord): string => JSON.stringify({ questions: session.questions, answers: session.answers });

		const rememberWritten = (state: Loaded): void => {
			written.clear();
			if (state.session) {
				written.set("session", coreJson(state.session));
				written.set("questions", questionsJson(state.session));
				for (const t of state.session.honour?.tiles ?? []) written.set(`tile:${t.season}`, JSON.stringify(t));
				const feed = state.session.feed;
				writtenFeedMaxId = feed.length ? feed[feed.length - 1].id : 0;
				writtenFeedMinId = feed.length ? feed[0].id : 0;
			}
			for (const p of state.players) written.set(`player:${p.id}`, JSON.stringify(p));
		};

		interface FeedRow {
			id: number;
			at: number;
			kind: string;
			player_id: string | null;
			text: string;
			correct: number | null;
			season: string | null;
		}

		const load = async (): Promise<Loaded> => {
			if (loaded) return loaded;
			if (!loading) {
				loading = (async () => {
					const row = sql.exec<{ data: string }>("SELECT data FROM session WHERE id = 1").toArray()[0];
					if (row) {
						const session = JSON.parse(row.data) as SessionRecord;
						const q = sql.exec<{ data: string }>("SELECT data FROM questions WHERE id = 1").toArray()[0];
						const parsedQuestions = q ? (JSON.parse(q.data) as RemoteQuestionPublic[] | { questions: RemoteQuestionPublic[]; answers: (RoundAnswer | null)[] }) : [];
						// The row was a bare question array before answers joined it (2026-09-15).
						if (Array.isArray(parsedQuestions)) {
							session.questions = parsedQuestions;
							session.answers = [];
						} else {
							session.questions = parsedQuestions.questions;
							session.answers = parsedQuestions.answers ?? [];
						}
						if (session.honour) {
							session.honour.tiles = sql
								.exec<{ data: string }>("SELECT data FROM tiles ORDER BY rowid")
								.toArray()
								.map((t) => JSON.parse(t.data) as HonourTileRecord);
						}
						session.feed = (sql.exec("SELECT id, at, kind, player_id, text, correct, season FROM feed ORDER BY id").toArray() as unknown as FeedRow[]).map((r) => ({
								id: r.id,
								at: r.at,
								kind: r.kind as FeedEntry["kind"],
								playerId: r.player_id,
								text: r.text,
								...(r.correct === null ? {} : { correct: r.correct === 1 }),
								...(r.season === null ? {} : { season: r.season }),
						}));
						const players = sql
							.exec<{ data: string }>("SELECT data FROM players ORDER BY rowid")
							.toArray()
							.map((p) => JSON.parse(p.data) as PlayerRecord);
						loaded = { session: normaliseSession(session), players };
						rememberWritten(loaded);
						return loaded;
					}
					// One-time migration for a session persisted as the two KV
					// values this replaced (still live at deploy time).
					const kvSession = await storage.get<SessionRecord>("session");
					if (kvSession) {
						const kvPlayers = (await storage.get<PlayerRecord[]>("players")) ?? [];
						loaded = { session: normaliseSession(kvSession), players: kvPlayers };
						await save();
						await storage.delete(["session", "players"]);
						return loaded;
					}
					loaded = { session: undefined, players: [] };
					return loaded;
				})();
			}
			return loading;
		};

		// Writes `statement` only if this row's JSON changed since last
		// written. The JSON is always the LAST bind parameter.
		const upsert = (key: string, statement: string, ...bind: (string | number)[]): boolean => {
			const json = String(bind[bind.length - 1]);
			if (written.get(key) === json) return false;
			sql.exec(statement, ...bind);
			written.set(key, json);
			return true;
		};

		// Persist whatever changed. `override` swaps in a new session/players
		// object first (a fresh /create, a /join's appended roster, a
		// /leave's filtered one). Returns whether anything was written.
		// Synchronous underneath (sql.exec is), async-shaped so the ~40
		// former KV write sites read the same as before.
		const save = async (override?: { session?: SessionRecord; players?: PlayerRecord[] }): Promise<boolean> => {
			const state = loaded ?? (loaded = { session: undefined, players: [] });
			if (override?.session) state.session = override.session;
			if (override?.players) state.players = override.players;
			let changed = false;
			const { session, players } = state;
			if (session) {
				if (upsert("session", "INSERT INTO session (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data", coreJson(session))) changed = true;
				if (upsert("questions", "INSERT INTO questions (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data", questionsJson(session)))
					changed = true;
				const seenTiles = new Set<string>();
				for (const t of session.honour?.tiles ?? []) {
					seenTiles.add(t.season);
					if (upsert(`tile:${t.season}`, "INSERT INTO tiles (season, data) VALUES (?, ?) ON CONFLICT(season) DO UPDATE SET data = excluded.data", t.season, JSON.stringify(t))) changed = true;
				}
				for (const key of [...written.keys()]) {
					if (key.startsWith("tile:") && !seenTiles.has(key.slice(5))) {
						sql.exec("DELETE FROM tiles WHERE season = ?", key.slice(5));
						written.delete(key);
						changed = true;
					}
				}
				for (const e of session.feed) {
					if (e.id > writtenFeedMaxId) {
						sql.exec(
							"INSERT OR IGNORE INTO feed (id, at, kind, player_id, text, correct, season) VALUES (?, ?, ?, ?, ?, ?, ?)",
							e.id,
							e.at,
							e.kind,
							e.playerId,
							e.text,
							e.correct === undefined ? null : e.correct ? 1 : 0,
							e.season ?? null,
						);
						changed = true;
					}
				}
				if (session.feed.length) writtenFeedMaxId = Math.max(writtenFeedMaxId, session.feed[session.feed.length - 1].id);
				const minId = session.feed.length ? session.feed[0].id : 0;
				if (minId > writtenFeedMinId) {
					sql.exec("DELETE FROM feed WHERE id < ?", minId);
					writtenFeedMinId = minId;
					changed = true;
				}
			}
			const seenPlayers = new Set<string>();
			for (const p of players) {
				seenPlayers.add(p.id);
				if (upsert(`player:${p.id}`, "INSERT INTO players (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data", p.id, JSON.stringify(p))) changed = true;
			}
			for (const key of [...written.keys()]) {
				if (key.startsWith("player:") && !seenPlayers.has(key.slice(7))) {
					sql.exec("DELETE FROM players WHERE id = ?", key.slice(7));
					written.delete(key);
					changed = true;
				}
			}
			if (changed) dirty = true;
			return changed;
		};

		// Everything gone -- the session expired (alarm()). Also forgets the
		// in-memory copy so a later request sees an empty object. deleteAll()
		// drops the tables too (this object stays alive afterwards, so its
		// constructor won't recreate them) -- hence ensureTables() again.
		this.wipe = async () => {
			for (const ws of ctx.getWebSockets()) ws.close(4404, "Session expired");
			await storage.deleteAll();
			ensureTables();
			loaded = null;
			loading = null;
			written.clear();
			writtenFeedMaxId = 0;
			writtenFeedMinId = 0;
		};

		const getSession = async (): Promise<SessionRecord | undefined> => (await load()).session;
		const getPlayers = async (): Promise<PlayerRecord[]> => (await load()).players;
		// ---- Presence ----
		//
		// "Away" (see class doc) was purely poll-based: no /state for
		// PLAYER_AWAY_MS. With WebSockets (below) a player is present while
		// their socket is PINGING: the client sends "ping" every 25s, the
		// runtime answers without waking this object (setWebSocketAutoResponse)
		// but records when it last did, and that timestamp is the socket's
		// heartbeat (SOCKET_AWAY_MS). An open socket alone is NOT presence --
		// a phone that loses signal never sends a close frame, so its socket
		// looks open for minutes (found by the offline e2e test, 2026-09-15);
		// its pings stop at once. The poll rule still applies alongside.
		//
		// Actions do NOT touch lastSeenAt (2026-09-15, write reduction): a
		// socket player's presence is their pings, a polling player's is
		// their polls (throttled to one write per 3s in /state), so writing
		// the player's row on every guess and ready only cost a row -- the
		// day the account's free-tier row budget ran out under a load test,
		// that row was a third of every action's cost. Only /ws connect,
		// socket close and the poll heartbeat write it now.
		//
		// Nothing wakes the object just to re-check presence (2026-09-15):
		// "away" is evaluated whenever something else happens -- a request,
		// a hint tier, a lock expiry -- and the only alarm booked FOR it is
		// the one case the clock alone must settle: a gate that everyone
		// present has satisfied except a player who has gone quiet (see
		// scheduleAlarm's gateBlockers). An idle connected lobby costs no
		// wakes at all; its away badges refresh on the next push.
		const socketSeenAt = (ws: WebSocket): number => {
			const pinged = ctx.getWebSocketAutoResponseTimestamp(ws);
			if (pinged) return pinged.getTime();
			const att = ws.deserializeAttachment() as SocketAttachment | null;
			return att?.connectedAt ?? 0;
		};
		const lastSeen = (player: PlayerRecord): number => Math.max(player.lastSeenAt, ...ctx.getWebSockets(player.id).map(socketSeenAt));
		// The moment this player becomes away if nothing more is heard from
		// them: whichever of their channels keeps them present longest.
		const presenceDeadline = (player: PlayerRecord): number =>
			Math.max(player.lastSeenAt + PLAYER_AWAY_MS, ...ctx.getWebSockets(player.id).map((ws) => socketSeenAt(ws) + SOCKET_AWAY_MS));
		const isAway = (player: PlayerRecord, now: number): boolean => presenceDeadline(player) < now;
		this.socketsLastSeen = () => Math.max(0, ...ctx.getWebSockets().map(socketSeenAt));
		// Non-host, non-away players who haven't marked ready -- shared by
		// /start (gating lobby -> in_progress) and the round-advance check
		// (gating current round -> next round), since both are literally
		// the same rule: don't wait on the host (they drive the gate, not
		// block on it) or on someone who's gone quiet.
		const playersNotReady = (players: PlayerRecord[], now: number): PlayerRecord[] => players.filter((p) => !p.isHost && !p.ready && !isAway(p, now));

		const findByToken = (players: PlayerRecord[], token: string | undefined) =>
			token ? players.find((p) => p.token === token) : undefined;

		// ---- WebSockets (2026-09-14, Hibernation API) ----
		//
		// Each client holds one socket (GET /ws, token in the query since a
		// browser's WebSocket can't set headers) and gets the public state
		// PUSHED whenever it changes, instead of polling /state every 1.5-4s
		// (docs/scaling.md §4b). The object hibernates between events with
		// the sockets held by the runtime, so an idle lobby costs nothing.
		// Polling still works unchanged and is the client's fallback while
		// its socket is down.
		//
		// What triggers a push: (1) any request that ended up writing --
		// save() sets `dirty`, the middleware below broadcasts after the
		// handler; (2) the alarm, for changes that come from the CLOCK with
		// no request behind them -- a hint tier at 30s, a lock running out,
		// a player crossing PLAYER_AWAY_MS, the minimum-reveal window
		// closing. Before sockets those were noticed by whichever poll came
		// next; scheduleAlarm() now books the earliest of them (folding in
		// the daily session-expiry check, previously the alarm's only job).
		//
		// Per socket the runtime keeps a small attachment -- which player,
		// the last feed id sent, the last fingerprint sent -- so a push is
		// skipped when that socket already has this exact state, and the
		// feed goes out incrementally exactly as /state?since= does.
		interface SocketAttachment {
			playerId: string;
			feedId: number;
			v: string;
			connectedAt: number; // Presence until the first ping lands -- see socketSeenAt.
		}
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));

		const minRevealMs = (): number => {
			const raw = Number(env.MIN_REVEAL_MS);
			return Number.isFinite(raw) ? raw : DEFAULT_MIN_REVEAL_MS;
		};

		const publicState = (session: SessionRecord, players: PlayerRecord[], now: number) => ({
			status: session.status,
			gameType: session.gameType,
			questionCount: session.questionCount,
			players: players.map((p) => toPublicPlayer(p, isAway(p, now))),
			round: publicRound(session, now),
			honour: publicHonour(session, now),
		});

		const broadcast = async (now: number): Promise<void> => {
			dirty = false;
			const sockets = ctx.getWebSockets();
			if (sockets.length === 0) return;
			const { session, players } = await load();
			if (!session) {
				for (const ws of sockets) ws.close(4404, "Session not found");
				return;
			}
			const body = publicState(session, players, now);
			const v = fingerprint(JSON.stringify(body));
			for (const ws of sockets) {
				const att = (ws.deserializeAttachment() ?? { playerId: "", feedId: 0, v: "", connectedAt: 0 }) as SocketAttachment;
				if (!players.some((p) => p.id === att.playerId)) {
					ws.close(4410, "No longer in this session");
					continue;
				}
				if (now - socketSeenAt(ws) > SOCKET_STALE_MS) {
					ws.close(4408, "No ping"); // Dead on the far side -- see SOCKET_STALE_MS.
					continue;
				}
				const feed = session.feed.filter((e) => e.id > att.feedId);
				if (feed.length === 0 && att.v === v) continue;
				try {
					ws.send(JSON.stringify({ ...body, feed, v }));
				} catch {
					continue; // A socket mid-close -- the runtime's close event tidies up.
				}
				ws.serializeAttachment({ ...att, feedId: feed.length ? feed[feed.length - 1].id : att.feedId, v } satisfies SocketAttachment);
			}
		};

		// The present players a gate is waiting on, when everyone else
		// present has already satisfied it -- the one situation where a
		// player going away changes the game with nobody acting: an
		// undecided round (or a Roll of Honour game) where every other
		// active player has given up, or a decided round where every other
		// non-host player is ready. Empty when the gate isn't otherwise met
		// (then whoever acts next re-evaluates) or when nobody is waiting.
		const gateBlockers = (session: SessionRecord, players: PlayerRecord[], now: number): PlayerRecord[] => {
			if (session.status !== "in_progress") return [];
			const active = players.filter((p) => !isAway(p, now));
			if (session.gameType === "roll-of-honour" || !isRoundDecided(session)) {
				const notGivenUp = active.filter((p) => !session.roundGivenUpPlayerIds.includes(p.id));
				return notGivenUp.length < active.length ? notGivenUp : [];
			}
			return playersNotReady(players, now);
		};

		// Books the alarm for the earliest thing the clock alone will
		// change -- see the WebSockets doc above: the next hint tier, lock
		// expiry, the reveal hold closing, a gate's last blocker going away
		// (gateBlockers), and the daily expiry check. No periodic presence
		// sweep -- see the presence doc. Never books a time already past
		// (the tick that fires handles it and the next call finds it gone),
		// so it can't spin.
		const scheduleAlarm = async (now: number): Promise<void> => {
			const { session, players } = await load();
			if (!session) return;
			const inProgress = session.status === "in_progress";
			let next = Math.max(session.createdAt, ...players.map(lastSeen)) + sessionTtlMs(session.status, players.length);
			const consider = (at: number) => {
				if (at > now && at < next) next = at;
			};
			// Rounded up to a 5s boundary: a blocker's presence deadline moves
			// with every ping, and each move was an alarm write.
			for (const p of gateBlockers(session, players, now)) consider(Math.ceil((presenceDeadline(p) + 1) / 5_000) * 5_000);
			if (inProgress) {
				for (const t of session.honour?.tiles ?? []) if (t.lockedBy !== null && t.lockedUntil !== null) consider(t.lockedUntil);
				if (session.gameType !== "roll-of-honour") {
					if (!isRoundDecided(session)) {
						if (session.roundStartedAt !== null) {
							const tier = Math.floor((now - session.roundStartedAt) / HINT_REVEAL_INTERVAL_MS) + 1;
							if (tier <= HINT_TIER_COUNT) consider(session.roundStartedAt + tier * HINT_REVEAL_INTERVAL_MS + 1);
						}
					} else if (session.roundDecidedAt !== null) {
						consider(session.roundDecidedAt + minRevealMs() + 1);
					}
				}
			}
			if ((await storage.getAlarm()) !== next) await storage.setAlarm(next);
		};

		// Everything that changes with the clock and no request -- run by
		// every /state (a poll is a fine clock too) and by the alarm.
		const settleTimedEvents = async (session: SessionRecord, players: PlayerRecord[], now: number): Promise<void> => {
			const locksExpired = expireHonourLocks(session, now);
			const honourFinished = finishHonourIfDone(session, players, now);
			if ((await resolveRoundByGiveUp(session, players, now)) || locksExpired || honourFinished) await save();
			await maybeAdvanceRound(session, players, now);
		};

		// Drops players unseen for IDLE_REMOVE_MS -- run before every request
		// (the middleware below) and every alarm tick, so it costs no wake
		// of its own; a session nobody touches simply keeps its idle roster
		// until its expiry. A dropped player's own next request finds their
		// token gone (401 / the socket refused), which is how they learn.
		// The host: in the lobby or on the results nothing can move without
		// them, so their going ends the session for everyone; mid-game the
		// others can finish (the gates already skip an away host), so the
		// host is left in place until the game is over.
		const idleRemoveMs = (): number => {
			const raw = Number(env.IDLE_REMOVE_MS);
			return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_IDLE_REMOVE_MS;
		};
		const pruneIdle = async (session: SessionRecord, players: PlayerRecord[], now: number): Promise<boolean> => {
			if (session.status === "ended") return false;
			const limit = idleRemoveMs();
			const gone = players.filter((p) => now - lastSeen(p) > limit && !(p.isHost && session.status === "in_progress"));
			if (gone.length === 0) return false;
			const remaining = players.filter((p) => !gone.includes(p));
			for (const p of gone) {
				releaseHonourLocks(session, p.id);
				const forHow = limit >= 60_000 ? `${Math.round(limit / 60_000)} minutes` : `${Math.round(limit / 1_000)} seconds`;
				pushFeed(session, now, { kind: "system", playerId: null, text: `${p.name} was dropped after being away for ${forHow}` });
			}
			if (gone.some((p) => p.isHost)) {
				session.status = "ended";
				pushFeed(session, now, { kind: "system", playerId: null, text: "Session ended -- the host has been away too long" });
			} else {
				// Same follow-ups as /leave and /remove: the dropped player may
				// have been the one a gate was waiting on.
				finishHonourIfDone(session, remaining, now);
				await resolveRoundByGiveUp(session, remaining, now);
			}
			await save({ players: remaining });
			if (session.status === "in_progress") await maybeAdvanceRound(session, remaining, now);
			return true;
		};

		this.tokenForPlayer = async (playerId) => (await load()).players.find((p) => p.id === playerId)?.token ?? null;

		this.tick = async (now) => {
			const { session, players } = await load();
			if (!session) return;
			await pruneIdle(session, players, now);
			await settleTimedEvents(session, (await load()).players, now);
			await broadcast(now);
			await scheduleAlarm(now);
		};

		// A socket closing cleanly (tab gone) -- the player keeps
		// PLAYER_AWAY_MS of grace from now, as if this were their last poll,
		// rather than being marked away on the spot: a refresh reconnects
		// well inside that.
		this.onSocketGone = async (ws) => {
			const att = ws.deserializeAttachment() as SocketAttachment | null;
			const { players } = await load();
			const player = att ? players.find((p) => p.id === att.playerId) : undefined;
			const now = Date.now();
			if (player) {
				player.lastSeenAt = now;
				await save();
			}
			await scheduleAlarm(now);
		};

		this.app.use("*", async (c, next) => {
			if (c.req.path !== "/create") {
				const { session, players } = await load();
				if (session) await pruneIdle(session, players, Date.now());
			}
			await next();
			if (dirty) {
				const now = Date.now();
				await broadcast(now);
				await scheduleAlarm(now);
			}
		});

		this.app.get("/ws", async (c) => {
			if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") return c.json({ error: "Expected a WebSocket upgrade" }, 426);
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			const players = await getPlayers();
			const self = findByToken(players, c.req.query("token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const since = Number(c.req.query("since") ?? 0);
			const pair = new WebSocketPair();
			const [client, server] = [pair[0], pair[1]];
			ctx.acceptWebSocket(server, [self.id]);
			const now = Date.now();
			server.serializeAttachment({ playerId: self.id, feedId: Number.isFinite(since) && since > 0 ? since : 0, v: "", connectedAt: now } satisfies SocketAttachment);
			self.lastSeenAt = now;
			await save();
			dirty = true; // Even if nothing changed: the new socket needs its first state.
			return new Response(null, { status: 101, webSocket: client });
		});

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
			pushFeed(session, now, { kind: "system", playerId: null, text: `Question ${index + 1} of ${session.questions.length}` });
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
			// The answer resolved at /start, else (a session from before
			// stored answers) checkPlayerGuess's give-up branch -- "hand me the
			// real answer without grading anything".
			const stored = session.answers[session.roundIndex] ?? null;
			const result = stored ? { name: stored.name } : await checkPlayerGuess(this.env.DB, QUESTIONS_TABLE[session.gameType as RoundGameType], question.id, { giveUp: true });
			if (!result) return false; // Defensive only -- see /guess's own "Unknown question" note.
			session.roundAnswerName = result.name;
			session.roundDecidedAt = now;
			pushFeed(session, now, { kind: "system", playerId: null, text: `Nobody got it -- it was ${result.name}` });
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
			await save();
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

		// Locks are time-limited (HONOUR_LOCK_MS) and expire on whichever
		// request next looks at the grid, or on the alarm scheduleAlarm()
		// books for the earliest lockedUntil (so connected players see the
		// tile open the moment it does).
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
			pushFeed(session, now, { kind: "system", playerId: null, text: allAnswered ? "Every season filled -- game over" : "Everyone gave up -- game over" });
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
				answers: [],
				roundIndex: 0,
				roundStartedAt: null,
				roundWinnerId: null,
				roundAnswerName: null,
				roundDecidedAt: null,
				roundGivenUpPlayerIds: [],
				honour: null,
				feed: [],
				feedNextId: 1,
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
				lastMessageAt: null,
			};
			await save({ session, players: [host] });
			// The alarm (expiry, and mid-game timed events -- see
			// scheduleAlarm) is booked by the broadcast middleware after this.

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
				lastMessageAt: null,
			};
			await save({ players: [...players, player] });

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
			// The heartbeat write is throttled: lastSeenAt only needs to be
			// accurate to well within PLAYER_AWAY_MS (15s), so a poll arriving
			// less than HEARTBEAT_WRITE_MIN_MS after the last recorded one
			// doesn't pay a storage write just to move it a second -- which is
			// what lets the client poll Roll of Honour games at 1.5s (see
			// useRemoteSession.ts) without multiplying row writes.
			const heartbeatDue = now - self.lastSeenAt >= HEARTBEAT_WRITE_MIN_MS;
			if (heartbeatDue) self.lastSeenAt = now;
			// "Away" is purely time-based (no request marks it), so the moment
			// a still-racing player crosses PLAYER_AWAY_MS can only ever be
			// noticed by someone ELSE's poll -- this one. If that leaves only
			// given-up players active, the round resolves here rather than
			// hanging until the away player happens to come back.
			// Roll of Honour: a lock running out, or the last active player
			// going away/bowing out, can only be noticed by someone's poll --
			// this one.
			if (heartbeatDue) await save();
			// Includes maybeAdvanceRound -- see its own doc on why a poll has
			// to be able to complete an advance the ready gate already
			// approved (the minimum-reveal window).
			await settleTimedEvents(session, players, now);

			// Incremental feed: `since` is the last entry id the client has,
			// so a steady-state poll carries only what's new (usually nothing);
			// a fresh load (since=0) gets the whole retained history.
			const since = Number(c.req.query("since") ?? 0);
			const feed = Number.isFinite(since) && since > 0 ? session.feed.filter((e) => e.id > since) : session.feed;

			// Versioned polls (2026-09-14): the public state is fingerprinted
			// and the client echoes the fingerprint it last saw as `v`. When
			// nothing (visible) has changed and there's no new feed, the reply
			// is a few bytes instead of the whole state -- a 93-tile Roll of
			// Honour grid is ~10KB and most of its 1.5s polls change nothing.
			// A fingerprint of the OUTPUT rather than a mutation counter on
			// purpose: hint tiers, "away" flags and lock expiry are computed
			// from the clock at read time, so a counter bumped only on writes
			// would miss the moment a hint reveals. The server still builds
			// the state each poll; what's saved is bytes on the wire and the
			// client's parse/re-render, which is where a phone feels it.
			const body = publicState(session, players, now);
			const v = fingerprint(JSON.stringify(body));
			if (feed.length === 0 && c.req.query("v") === v) return c.json({ unchanged: true as const, v });

			return c.json({ ...body, feed, v });
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
			await save();

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
				// from host-away (just another "away" player until they either
				// come back, the game plays on without them, or pruneIdle drops
				// them after IDLE_REMOVE_MS), see class doc.
				// The player roster is left as-is (not cleared) so a poll made
				// right after this still shows who was in the room when it
				// ended, not an empty list.
				session.status = "ended";
				await save();
			} else {
				const remaining = players.filter((p) => p.id !== self.id);
				const now = Date.now();
				// The departing player might have been the last one still
				// racing (everyone else already gave up), or the last one the
				// round-advance gate was waiting on -- or, Roll of Honour,
				// holding a tile lock / the last one still filling the grid.
				const honourChanged = releaseHonourLocks(session, self.id) || finishHonourIfDone(session, remaining, now);
				if ((await resolveRoundByGiveUp(session, remaining, now)) || honourChanged) await save();
				await save({ players: remaining });
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
			if ((await resolveRoundByGiveUp(session, remaining, now)) || honourChanged) await save();
			await save({ players: remaining });
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
				await save();
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
			let picked: { id: number; player_id: number }[];
			if (session.gameType === "teammates") {
				const { results: rows } = await this.env.DB.prepare("SELECT id, player_id, teammate_ids, hints FROM teammate_questions").all<TeammateQuestionRow>();
				picked = pickRandomTeammateQuestions(rows ?? [], questionCount);
				questions = await buildTeammateQuestions(this.env.DB, picked as TeammateQuestionRow[]);
			} else {
				const { results: rows } = await this.env.DB.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions").all<QuestionRow>();
				picked = pickRandomEligibleQuestions(rows ?? [], questionCount);
				questions = await buildClubBadgeQuestions(this.env.DB, picked as QuestionRow[]);
			}
			// The answers, resolved now so every guess this game is graded in
			// memory (see SessionRecord.answers). Two indexed queries, once.
			const answersByPlayer = await loadRoundAnswers(this.env.DB, picked.map((p) => p.player_id));
			const playerByQuestion = new Map(picked.map((p) => [p.id, p.player_id]));
			const answers = questions.map((q) => answersByPlayer.get(playerByQuestion.get(q.id) ?? -1) ?? null);
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
			session.answers = answers;
			startNewRound(session, players, 0, now);
			await save();

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

			if (isRoundDecided(session)) {
				await save();
				return c.json({ error: "This round is already over" }, 409);
			}
			if (session.roundGivenUpPlayerIds.includes(self.id)) {
				// A give-up is final for the round (see class doc) -- same as
				// Club Run's own RoundPlay, where giving up ends that player's
				// turn at the question outright rather than being undoable.
				await save();
				return c.json({ error: "You've already given up on this round" }, 409);
			}
			if (session.gameType === "roll-of-honour") {
				await save();
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
				await save();
				return c.json({ error: "Too early -- wait for the countdown" }, 409);
			}

			const body = await c.req.json<{ guess?: string }>().catch(() => ({}) as { guess?: string });
			const rawGuess = (body.guess ?? "").trim();
			if (!rawGuess) {
				await save();
				return c.json({ error: "Missing guess" }, 400);
			}

			const question = session.questions[session.roundIndex];
			// Graded here from the answer resolved at /start -- no D1 on the
			// hot path (docs/scaling.md §5f); D1 only for a session that
			// predates stored answers.
			const stored = session.answers[session.roundIndex] ?? null;
			const result = stored
				? { result: gradeGuess(stored, rawGuess) ? ("correct" as const) : ("wrong" as const), name: stored.name }
				: await checkPlayerGuess(this.env.DB, QUESTIONS_TABLE[session.gameType as RoundGameType], question.id, { guess: rawGuess });
			if (!result) {
				// Defensive only -- question.id always came from a real
				// club_badge_questions row selected at /start.
				await save();
				return c.json({ error: "Unknown question" }, 404);
			}

			if (result.result === "correct") {
				self.wins += 1;
				session.roundWinnerId = self.id;
				session.roundAnswerName = result.name;
				session.roundDecidedAt = now;
				pushFeed(session, now, { kind: "guess", playerId: self.id, text: result.name, correct: true });
				await save();
				return c.json({ result: "correct" as const, answerName: result.name });
			}

			pushFeed(session, now, { kind: "guess", playerId: self.id, text: rawGuess, correct: false });
			await save();
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

			if (session.gameType === "roll-of-honour") {
				// Bows out of the whole game (see class doc): any held tile goes
				// back, and if nobody active is left playing the game's over.
				if (!session.roundGivenUpPlayerIds.includes(self.id)) {
					session.roundGivenUpPlayerIds.push(self.id);
					pushFeed(session, now, { kind: "give-up", playerId: self.id, text: "gave up" });
				}
				releaseHonourLocks(session, self.id);
				finishHonourIfDone(session, players, now);
				await save();
				return c.json({ ok: true as const });
			}

			if (isRoundDecided(session)) {
				await save();
				return c.json({ error: "This round is already over" }, 409);
			}

			if (!session.roundGivenUpPlayerIds.includes(self.id)) {
				session.roundGivenUpPlayerIds.push(self.id);
				pushFeed(session, now, { kind: "give-up", playerId: self.id, text: "gave up" });
			}
			await resolveRoundByGiveUp(session, players, now);
			await save();
			// A solo host (no other players) has nobody to wait on -- same
			// vacuous-gate behaviour a win already gets there.
			await maybeAdvanceRound(session, players, now);

			// Nothing about the outcome is returned here -- the client learns
			// whether the round resolved from its own /state refresh, same as
			// every other player does, rather than from a field that would be
			// stale the instant maybeAdvanceRound above moved a solo host on.
			return c.json({ ok: true as const });
		});

		// Chat -- see MESSAGE_* above. Posts into the activity feed. Allowed
		// in any live status (lobby, a round, the final results), just not
		// once the session's ended.
		this.app.post("/message", async (c) => {
			const session = await getSession();
			if (!session) return c.json({ error: "Session not found" }, 404);
			if (session.status === "ended") return c.json({ error: "This session has already ended" }, 409);

			const players = await getPlayers();
			const self = findByToken(players, c.req.header("X-Player-Token"));
			if (!self) return c.json({ error: "Invalid session token" }, 401);

			const now = Date.now();

			const body = await c.req.json<{ text?: string }>().catch(() => ({}) as { text?: string });
			// Internal runs of whitespace collapsed too, not just trimmed --
			// what's stored is what every other client renders, in a single
			// nowrap line, so there's nothing a run of spaces or a newline
			// could usefully mean there.
			const text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
			if (!text) {
				await save();
				return c.json({ error: "Type a message first" }, 400);
			}
			if (text.length > MESSAGE_MAX_CHARS || countWords(text) > MESSAGE_MAX_WORDS) {
				await save();
				return c.json({ error: `Keep it to ${MESSAGE_MAX_WORDS} words` }, 400);
			}

			const lastMessageAt = self.lastMessageAt ?? null;
			if (lastMessageAt !== null && now - lastMessageAt < MESSAGE_COOLDOWN_MS) {
				const retryAfterMs = MESSAGE_COOLDOWN_MS - (now - lastMessageAt);
				await save();
				return c.json({ error: `You can post again in ${Math.ceil(retryAfterMs / 1000)}s`, retryAfterMs }, 429);
			}

			self.lastMessageAt = now;
			pushFeed(session, now, { kind: "chat", playerId: self.id, text });
			await save();

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
			if (session.roundGivenUpPlayerIds.includes(self.id)) {
				await save();
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
			const { session, honour, self, now } = ctx;

			const rawGraceMs = Number(this.env.ROUND_START_GRACE_MS);
			const roundStartGraceMs = Number.isFinite(rawGraceMs) ? rawGraceMs : DEFAULT_ROUND_START_GRACE_MS;
			if (session.roundStartedAt !== null && now - session.roundStartedAt < roundStartGraceMs) {
				await save();
				return c.json({ error: "Too early -- wait for the countdown" }, 409);
			}

			const body = await c.req.json<{ season?: string }>().catch(() => ({}) as { season?: string });
			const tile = honour.tiles.find((t) => t.season === body.season);
			if (!tile) {
				await save();
				return c.json({ error: "Unknown season" }, 404);
			}
			if (tile.answeredBy !== null) {
				await save();
				return c.json({ error: "That season's already been answered" }, 409);
			}
			if (tile.lockedBy !== null && tile.lockedBy !== self.id) {
				await save();
				return c.json({ error: "Someone else has that season right now" }, 409);
			}
			const blockedUntil = tile.blockedUntil[self.id] ?? 0;
			if (blockedUntil > now) {
				await save();
				return c.json({ error: "You just got that one wrong -- give someone else a go", retryAfterMs: blockedUntil - now }, 409);
			}

			releaseHonourLocks(session, self.id);
			tile.lockedBy = self.id;
			tile.lockedUntil = now + HONOUR_LOCK_MS;
			await save();
			return c.json({ ok: true as const, lockedForMs: HONOUR_LOCK_MS });
		});

		// Put a held season back without answering (Cancel).
		this.app.post("/tile/release", async (c) => {
			const ctx = await honourContext(c);
			if ("error" in ctx) return ctx.error;
			const { session, self } = ctx;
			releaseHonourLocks(session, self.id);
			await save();
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
				await save();
				return c.json({ error: "Unknown season" }, 404);
			}
			if (tile.answeredBy !== null) {
				await save();
				return c.json({ error: "That season's already been answered" }, 409);
			}
			if (tile.lockedBy !== self.id) {
				// Includes "was yours but the hold ran out" -- expireHonourLocks
				// in the preamble already cleared it.
				await save();
				return c.json({ error: "Your hold on that season has run out -- take it again" }, 409);
			}
			const guess = (body.guess ?? "").trim();
			if (!guess) {
				await save();
				return c.json({ error: "Missing guess" }, 400);
			}

			tile.lockedBy = null;
			tile.lockedUntil = null;
			if (gradeHonourGuess(guess, tile)) {
				tile.answeredBy = self.id;
				self.wins += 1;
				pushFeed(session, now, { kind: "guess", playerId: self.id, text: tile.winner, correct: true, season: tile.season });
				finishHonourIfDone(session, players, now);
				await save();
				return c.json({ result: "correct" as const, winner: tile.winner, imageUrl: tile.imageUrl });
			}
			pushFeed(session, now, { kind: "guess", playerId: self.id, text: guess, correct: false, season: tile.season });
			tile.blockedUntil[self.id] = now + HONOUR_RETRY_BLOCK_MS;
			await save();
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
			session.answers = [];
			session.roundIndex = 0;
			session.roundStartedAt = null;
			session.roundWinnerId = null;
			session.roundAnswerName = null;
			session.roundDecidedAt = null;
			session.roundGivenUpPlayerIds = [];
			session.honour = null;
			pushFeed(session, now, { kind: "system", playerId: null, text: keepScores ? "New game -- scores carried over" : "New game -- scores reset" });
			for (const p of players) {
				if (!keepScores) p.wins = 0;
				p.ready = p.isHost; // Same as a fresh /create: the host is ready by definition, everyone else re-readies.
			}
			await save();

			return c.json({ ok: true as const });
		});
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}

	// Two jobs (see the constructor's WebSockets doc): session expiry --
	// nobody connected and nobody polled within SESSION_TTL_MS deletes the
	// whole object's storage (a fresh /create on the same code,
	// astronomically unlikely, starts clean) -- and otherwise a tick of the
	// clock-driven events, a push to every socket, and booking the next.
	async alarm(): Promise<void> {
		// Expiry reads presence from SQL rather than the in-memory copy so a
		// test (or an operator) can age rows underneath it -- see the storage
		// doc in the constructor. A pinging socket is presence too.
		const sql = this.ctx.storage.sql;
		const sessionRow = sql.exec<{ data: string }>("SELECT data FROM session WHERE id = 1").toArray()[0];
		if (!sessionRow) {
			await this.wipe();
			return;
		}
		const now = Date.now();
		const session = JSON.parse(sessionRow.data) as SessionRecord;
		const presence = sql.exec<{ last: number | null; n: number }>("SELECT MAX(json_extract(data, '$.lastSeenAt')) AS last, COUNT(*) AS n FROM players").one();
		const lastSeen = Math.max(presence.last ?? session.createdAt, this.socketsLastSeen());
		if (now - lastSeen >= sessionTtlMs(session.status, presence.n)) {
			await this.wipe();
			return;
		}
		await this.tick(now);
	}

	// Actions over the socket (2026-09-15; docs/scaling.md §5g). A client
	// with its socket open sends {id, type, body} instead of an HTTP POST
	// -- an incoming socket message bills at 20:1 against one Worker + one
	// Durable Object request for the same action, and it skips the Worker
	// hop. The action is dispatched to the SAME Hono route the HTTP path
	// uses (an internal Request through this.app.fetch, token supplied from
	// the socket's own identity), so every rule, every middleware --
	// idle pruning before, broadcast after -- and every reply shape is
	// shared with the HTTP fallback; nothing is implemented twice. The
	// reply is {id, status, body}; pushes carry no `id`. "ping" never
	// reaches here (setWebSocketAutoResponse).
	//
	// What the Worker's per-player rate limiter did for HTTP actions is done
	// here per socket player: a runaway client's messages still wake the
	// object, so a burst beyond SOCKET_ACTIONS_PER_WINDOW in
	// SOCKET_ACTION_WINDOW_MS is answered 429 without dispatching.
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		if (typeof message !== "string") return;
		let parsed: { id?: unknown; type?: unknown; body?: unknown };
		try {
			parsed = JSON.parse(message) as typeof parsed;
		} catch {
			return; // Not an action.
		}
		const id = typeof parsed.id === "string" ? parsed.id : null;
		if (id === null) return;
		const reply = (status: number, body: unknown) => {
			try {
				ws.send(JSON.stringify({ id, status, body }));
			} catch {
				/* socket mid-close */
			}
		};
		const path = typeof parsed.type === "string" ? SOCKET_ACTIONS[parsed.type] : undefined;
		if (!path) {
			reply(400, { error: "Unknown action" });
			return;
		}
		const att = ws.deserializeAttachment() as { playerId?: string } | null;
		if (!att?.playerId || !this.withinSocketActionLimit(att.playerId)) {
			reply(429, { error: "Too many requests -- slow down a little." });
			return;
		}
		const token = await this.tokenForPlayer(att.playerId);
		if (!token) {
			reply(401, { error: "Invalid session token" });
			ws.close(4410, "No longer in this session");
			return;
		}
		const res = await this.app.fetch(
			new Request(`https://do${path}`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-Player-Token": token },
				body: parsed.body === undefined ? "{}" : JSON.stringify(parsed.body),
			}),
		);
		let body: unknown = null;
		try {
			body = await res.json();
		} catch {
			body = null;
		}
		reply(res.status, body);
	}

	// Per-player sliding window for socket actions -- in memory, so it
	// resets when the object hibernates, which is fine for a burst guard.
	private readonly socketActionTimes = new Map<string, number[]>();
	private withinSocketActionLimit(playerId: string): boolean {
		const now = Date.now();
		const times = (this.socketActionTimes.get(playerId) ?? []).filter((t) => now - t < SOCKET_ACTION_WINDOW_MS);
		if (times.length >= SOCKET_ACTIONS_PER_WINDOW) {
			this.socketActionTimes.set(playerId, times);
			return false;
		}
		times.push(now);
		this.socketActionTimes.set(playerId, times);
		return true;
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
		ws.close(code, reason);
		await this.onSocketGone(ws);
	}

	async webSocketError(ws: WebSocket): Promise<void> {
		await this.onSocketGone(ws);
	}
}

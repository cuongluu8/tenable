// State for "Guess the player" (club badges) — single-device pass-and-play,
// same philosophy as src/react-app/multiplayer/state.ts: no server session,
// the whole game lives here as a plain reducer, and the only network calls
// are (1) fetching a round's 10 questions once at "start" and (2) one
// stateless guess-check per question (see ClubBadges.tsx).
//
// Deliberately its own module rather than reusing multiplayer/state.ts:
// that reducer's shape (lives, a shared found/missed board, "duplicate"
// guesses) is built around one category's ranked Top-10 list every player
// contributes to together. This game is 10 independent single-answer
// questions where each question belongs to exactly one player's turn --
// similar spirit (pass-and-play, round-robin), different enough machinery
// that forcing it through the same reducer would mean more special-casing
// than just having its own.
import { colorForPlayerIndex } from "../multiplayer/state";

export interface CbPlayer {
	name: string;
	color: string;
	correct: number;
}

export type CbPhase = "setup" | "playing" | "finished";

// One club within a question's sequence. `url` is null when that club has
// no sourced badge yet -- ClubBadgesPlay.tsx renders `name` as a text
// placeholder in that case (and also falls back to it if a present url
// 404s at render time). Showing the name isn't a spoiler: the club isn't
// the answer, the player is. `country` is sent for the same non-spoiler
// reason, always present in the response but only shown once the hint
// button is used (see ClubBadgesPlay.tsx/BadgeTile.tsx) -- the first of
// what's meant to grow into a small set of hints.
export interface CbBadge {
	name: string;
	url: string | null;
	country: string | null;
}

// One question as handed out by GET /api/club-badges/round -- deliberately
// no player id/name in here, that's the answer.
export interface CbQuestion {
	id: number;
	badges: CbBadge[];
	// Second hint: the player's nationality (country represented
	// internationally, falling back to country of birth -- see
	// clubBadges.ts's /round comment on why that fallback is currently a
	// no-op). null means neither is known for this player -- the hint is
	// skipped entirely rather than shown with nothing to reveal (see
	// ClubBadgesPlay.tsx's availableHints).
	nationality: string | null;
	// Third hint: one entry per transfer (badges[i] -> badges[i+1]), so
	// length is always badges.length - 1. Each entry is a formatted "Mon
	// YYYY" when an exact transfer_date is on record, a "~YYYY" estimate
	// pulled from a coarser year-only source when it isn't, or null when
	// neither has anything usable for that specific transfer -- see
	// clubBadges.ts's transferDatesFor. A null entry is skipped individually
	// (ClubBadgesPlay.tsx) rather than blanking the whole hint; the hint
	// itself is only offered at all when at least one entry is non-null.
	transferDates: (string | null)[];
	// Same indexing as transferDates (one entry per transfer, badges[i] ->
	// badges[i+1]), but never gated behind the transferDate hint button --
	// see clubBadges.ts's loanMoves comment for why this isn't itself a
	// hint. Only ever true for a transfers-sourced move (the 18 batch-1
	// players -- see clubBadges.ts); player_career_stats has no per-move
	// classification to draw this from, so it's always false there rather
	// than guessed at.
	loanMoves: boolean[];
}

// Every hint this game currently has, in the order their buttons appear.
// A hint key here doesn't guarantee its button shows for a given question
// (e.g. nationality is skipped when CbQuestion.nationality is null) -- see
// ClubBadgesPlay.tsx's availableHints.
export const HINT_KEYS = ["country", "nationality", "transferDate"] as const;
export type HintKey = (typeof HINT_KEYS)[number];

export interface CbResult {
	playerName: string;
	guess: string;
	// Always "wrong" for a give-up (see GuessThePlayer.tsx's giveUp()) --
	// this is what tells the reveal to say "you gave up" instead of
	// "not quite" for that case, same outcome, different framing.
	outcome: "correct" | "wrong";
	gaveUp: boolean;
	correctName: string;
	// This question's score (see computeScore below), captured by
	// ClubBadgesPlay.tsx at the moment the guess/give-up was actually
	// submitted -- not recomputed here or on the tick after the server
	// responds, so a slow network doesn't cost extra points on top of
	// however long the player actually took to answer. Always populated
	// (even for a wrong guess/give-up), but only ever displayed for a
	// correct outcome -- ClubBadgesPlay.tsx's reveal branch -- per the
	// spec this shipped against: points are something you "got" for a
	// correct answer, not a consolation number for a wrong one.
	points: number;
}

// Solo lives, matching the single-player categories game's tension mode
// (src/worker/lib/types.ts's TENSION_LIVES) -- same number, same "one wrong
// guess too many and it's over" rule, just counted across this round's
// otherwise-independent questions instead of one shared Top-10 board.
// Multiplayer has no lives at all (see currentTurnIndex/isLastQuestion
// call sites): a shared or per-player life count doesn't map onto
// pass-and-play the way it does for one person playing alone.
export const MAX_WRONG_LIVES = 5;

// Per-question scoring. Starts at SCORE_START and decays two ways as the
// question stays open -- SCORE_TIME_PENALTY every SCORE_TIME_INTERVAL_
// SECONDS of wall-clock time (ClubBadgesPlay.tsx's own ticking timer,
// not anything the server tracks -- see clubBadges.ts's /check-guess,
// which has never known or cared how long a question took), and
// SCORE_HINT_PENALTY per hint revealed (HINT_KEYS above). Deliberately
// not clamped to zero -- a very slow, very hint-heavy answer can and
// does go negative (see scoreBand's "grey" band below, which only
// exists to color a negative score).
export const SCORE_START = 100;
export const SCORE_TIME_PENALTY = 10;
export const SCORE_TIME_INTERVAL_SECONDS = 30;
export const SCORE_HINT_PENALTY = 15;

export function computeScore(elapsedSeconds: number, hintsUsed: number): number {
	const timePenalty = Math.floor(elapsedSeconds / SCORE_TIME_INTERVAL_SECONDS) * SCORE_TIME_PENALTY;
	const hintPenalty = hintsUsed * SCORE_HINT_PENALTY;
	return SCORE_START - timePenalty - hintPenalty;
}

// Which color chip a score gets on the reveal (ClubBadgesPlay.tsx/
// clubBadges.css's .cb-score--*), per the exact bands specified: more
// than 80 is gold, 50-79 silver, 30-49 yellow, 0-29 brown, less than 0
// grey. Those five phrases leave a single-point gap at exactly 80
// (neither "more than 80" nor "50-79" covers it) -- resolved here by
// folding it into silver, the band it sits at the top edge of, rather
// than leaving an integer score with no defined color.
export type ScoreBand = "gold" | "silver" | "yellow" | "brown" | "grey";

export function scoreBand(score: number): ScoreBand {
	if (score > 80) return "gold";
	if (score >= 50) return "silver";
	if (score >= 30) return "yellow";
	if (score >= 0) return "brown";
	return "grey";
}

export interface CbState {
	phase: CbPhase;
	players: CbPlayer[];
	questions: CbQuestion[];
	// Which question is currently up. Whose turn it is is always derived
	// (questionIndex % players.length), never stored separately -- lives
	// (wrongCount below) can end the round early, but never eliminate one
	// player while the others keep going, so there's no one to skip over
	// the way multiplayer's nextTurnIndex() has to account for.
	questionIndex: number;
	// Wrong answers (including give-ups -- see the guessResult case below)
	// so far this round, solo only in practice (see MAX_WRONG_LIVES). Never
	// reset mid-round, only by "start"/"reset" -- unlike questionIndex this
	// has no natural cap of its own, so ClubBadgesPlay.tsx/ClubBadgesResult.tsx
	// compare it against MAX_WRONG_LIVES themselves wherever the round could
	// end early because of it.
	wrongCount: number;
	// Every wrong guess actually typed/picked for the *current* question
	// (not give-ups -- see the reducer cases), in order -- same idea and
	// same rendering (ClubBadgesPlay.tsx reuses App.css's .wrong-guesses
	// classes directly) as the daily categories game's own incorrect-
	// guesses list (PlayScreen.tsx), just scoped to one question instead of
	// the whole round: a name that didn't work for this player isn't
	// meaningful information once the next question (a different player
	// entirely) starts, so this resets on "next", unlike categories' list
	// which persists for the whole round against one shared board.
	wrongGuesses: string[];
	// Set the instant a guess comes back from the server *and ends the
	// question* (correct, a give-up, or a wrong guess that was also the
	// last life) -- cleared by "next". Its presence is what the Play screen
	// uses to decide whether it's showing the guess box or the reveal --
	// see ClubBadgesPlay.tsx.
	lastResult: CbResult | null;
}

export const initialCbState: CbState = {
	phase: "setup",
	players: [],
	questions: [],
	questionIndex: 0,
	wrongCount: 0,
	wrongGuesses: [],
	lastResult: null,
};

export function currentTurnIndex(state: CbState): number {
	if (state.players.length === 0) return 0;
	return state.questionIndex % state.players.length;
}

export type CbAction =
	| { type: "start"; playerNames: string[]; questions: CbQuestion[] }
	// A solo wrong (non-give-up) guess with a life still left after it --
	// see GuessThePlayer.tsx's checkQuestion for how it decides between
	// this and "guessResult" for a wrong outcome. Never dispatched for
	// multiplayer (no lives, no retrying -- every wrong guess there is a
	// "guessResult").
	| { type: "wrongAttempt"; guess: string }
	| {
			type: "guessResult";
			guess: string;
			outcome: "correct" | "wrong";
			gaveUp: boolean;
			correctName: string;
			points: number;
	  }
	| { type: "next" }
	| { type: "reset" };

export function clubBadgesReducer(state: CbState, action: CbAction): CbState {
	switch (action.type) {
		case "start":
			return {
				...initialCbState,
				phase: "playing",
				questions: action.questions,
				players: action.playerNames.map((name, i) => ({ name, color: colorForPlayerIndex(i), correct: 0 })),
			};

		case "wrongAttempt":
			if (state.phase !== "playing") return state;
			return { ...state, wrongCount: state.wrongCount + 1, wrongGuesses: [...state.wrongGuesses, action.guess] };

		case "guessResult": {
			if (state.phase !== "playing") return state;
			const turnIndex = currentTurnIndex(state);
			const players =
				action.outcome === "correct"
					? state.players.map((p, i) => (i === turnIndex ? { ...p, correct: p.correct + 1 } : p))
					: state.players;
			// A give-up is always outcome "wrong" (see CbResult's doc) but isn't
			// itself a guess -- same reasoning as categories' own list, which a
			// give-up never adds to either -- so only an actual wrong guess (the
			// one that happened to be the last life, since anything survivable
			// already went through "wrongAttempt" above) gets appended here.
			const isWrongGuess = action.outcome === "wrong" && !action.gaveUp;
			return {
				...state,
				players,
				// A give-up still costs a life the same as an actual wrong guess
				// would -- not knowing the answer is not knowing the answer,
				// whichever way this question ended. A wrong guess that used up
				// the last life also arrives here (not as "wrongAttempt") for the
				// same reason -- either way, this life wasn't already counted by
				// a previous "wrongAttempt" dispatch for this same guess.
				wrongCount: action.outcome === "wrong" ? state.wrongCount + 1 : state.wrongCount,
				wrongGuesses: isWrongGuess ? [...state.wrongGuesses, action.guess] : state.wrongGuesses,
				lastResult: {
					playerName: state.players[turnIndex].name,
					guess: action.guess,
					outcome: action.outcome,
					gaveUp: action.gaveUp,
					correctName: action.correctName,
					points: action.points,
				},
			};
		}

		case "next": {
			if (state.phase !== "playing" || !state.lastResult) return state;
			const nextIndex = state.questionIndex + 1;
			// Lives only apply solo (see MAX_WRONG_LIVES) -- a shared or
			// per-player count doesn't map onto multiplayer's pass-and-play, so
			// a roster of more than one never ends early here regardless of how
			// many turns have gone wrong.
			const outOfLives = state.players.length === 1 && state.wrongCount >= MAX_WRONG_LIVES;
			if (outOfLives || nextIndex >= state.questions.length) {
				return { ...state, phase: "finished", lastResult: null, wrongGuesses: [] };
			}
			return { ...state, questionIndex: nextIndex, lastResult: null, wrongGuesses: [] };
		}

		case "reset":
			return initialCbState;

		default:
			return state;
	}
}

// Winner (and full standings): most correct first, ties share a rank --
// unlike multiplayer's rankPlayers() there's no time tiebreaker (this game
// never tracked per-turn timing, and with a fixed number of questions per
// player -- see ClubBadgesPlay.tsx's turn-count note -- speed was never
// part of the pitch the user asked for).
export interface CbRankedPlayer {
	player: CbPlayer;
	index: number;
	rank: number;
}

export function rankCbPlayers(players: CbPlayer[]): CbRankedPlayer[] {
	const ordered = players.map((player, index) => ({ player, index })).sort((a, b) => b.player.correct - a.player.correct);

	let rank = 0;
	let prevCorrect: number | null = null;
	return ordered.map((entry, i) => {
		if (prevCorrect === null || entry.player.correct !== prevCorrect) rank = i + 1;
		prevCorrect = entry.player.correct;
		return { ...entry, rank };
	});
}

// State for "Guess the player" (club badges) — single-device pass-and-play,
// same philosophy as src/react-app/multiplayer/state.ts: no server session,
// the whole game lives here as a plain reducer, and the only network calls
// are (1) fetching a round's 10 questions once at "start" and (2) one
// stateless guess-check per question (see ClubBadges.tsx).
//
// Deliberately its own module rather than reusing multiplayer/state.ts:
// that reducer's shape (lives, a shared found/missed board, "duplicate"
// guesses) is built around one category's ranked Top-10 list every player
// contributes to together. This game is 10 questions, but (2026-09-08,
// fixing a real reported bug -- see playerIndex's own doc) every player
// takes their own independent turn at EACH question before the group
// moves on to the next one, not one question per player across the round
// -- similar spirit (pass-and-play, lives, a give-up escape hatch),
// different enough machinery that forcing it through the same reducer
// would mean more special-casing than just having its own.
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

// Lives per attempt at a question, matching the single-player categories
// game's tension mode (src/worker/lib/types.ts's TENSION_LIVES) -- same
// number, same "one wrong guess too many and it's over" rule, but what
// "it" scopes to differs by mode (see wrongCount's own doc, and the
// "next" reducer case, which is where this split is actually enforced):
//   - Solo: a single round-wide budget. wrongCount is never reset until
//     the round itself ends, so all 5 lives really can get spent on just
//     one hard question, ending the round there without ever reaching
//     the rest of the deck -- unchanged behavior from before 2026-09-08.
//   - Multiplayer: a fresh budget every player gets on THEIR OWN turn at
//     the current question (reset in "next" whenever playerIndex
//     advances) -- fixing a real reported bug where a multiplayer guess
//     had exactly one attempt before the question ended and revealed the
//     answer to whoever was up next. A player running out of lives here
//     only ends THEIR turn, never the round -- see isRoundOver's own doc
//     in ClubBadgesPlay.tsx for why there's no multiplayer equivalent of
//     solo's early round-ending.
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
	// Which question is currently up.
	questionIndex: number;
	// Which player (index into `players`) is currently attempting the
	// active question -- see currentTurnIndex below. Explicit rather than
	// derived from questionIndex, unlike before 2026-09-08: back when
	// every question belonged to exactly one player's turn, whose turn it
	// was fell straight out of questionIndex % players.length and this
	// field didn't need to exist. Now every player gets their own turn at
	// EACH question in fixed roster order (0, 1, 2, ...) before the group
	// moves on -- see the "next" reducer case -- so questionIndex alone no
	// longer says whose turn it is; solo always stays at 0 (there's only
	// ever one player to be up), so this is a no-op there.
	playerIndex: number;
	// Wrong answers (including give-ups -- see the guessResult case below)
	// on the CURRENT player's CURRENT attempt -- see MAX_WRONG_LIVES's own
	// doc on how far that budget stretches by mode. Reset in "next"
	// whenever playerIndex advances (multiplayer) or, for solo, never
	// reset mid-round at all (only "start"/"reset") -- that split is what
	// makes solo's 5 lives a round-wide budget but multiplayer's a fresh
	// one per player per question. ClubBadgesPlay.tsx/ClubBadgesResult.tsx
	// compare it against MAX_WRONG_LIVES wherever that distinction matters.
	wrongCount: number;
	// Every wrong guess actually typed/picked for the CURRENT player's
	// CURRENT attempt (not give-ups -- see the reducer cases), in order --
	// same idea and same rendering (ClubBadgesPlay.tsx reuses App.css's
	// .wrong-guesses classes directly) as the daily categories game's own
	// incorrect-guesses list (PlayScreen.tsx), just scoped to one attempt
	// instead of the whole round: a name that didn't work for this
	// player's turn isn't meaningful information once it's someone else's
	// turn (multiplayer) or the next question (solo), so this resets on
	// "next" every time, unlike categories' list which persists for the
	// whole round against one shared board.
	wrongGuesses: string[];
	// Set the instant a guess comes back from the server *and ends the
	// CURRENT player's turn at the current question* (correct, a give-up,
	// or a wrong guess that was also their last life) -- cleared by
	// "next". Its presence is what the Play screen uses to decide whether
	// it's showing the guess box or a reveal -- see ClubBadgesPlay.tsx.
	// Note this does NOT mean the correct answer is necessarily shown:
	// multiplayer only reveals it once every player has had their own
	// turn at this question (ClubBadgesPlay.tsx's isRoundOver/
	// isLastPlayerForQuestion), so an earlier player's wrong guess or
	// give-up can't spoil it for whoever's still due to go.
	lastResult: CbResult | null;
}

export const initialCbState: CbState = {
	phase: "setup",
	players: [],
	questions: [],
	questionIndex: 0,
	playerIndex: 0,
	wrongCount: 0,
	wrongGuesses: [],
	lastResult: null,
};

// Whose turn it is right now -- always state.playerIndex directly since
// 2026-09-08 (see that field's own doc for why it's no longer derived
// from questionIndex). Kept as a named function rather than inlining
// `state.playerIndex` at call sites purely for the doc comment landing
// somewhere findable; the `players.length === 0` guard covers the brief
// "setup" phase window before a real roster exists.
export function currentTurnIndex(state: CbState): number {
	if (state.players.length === 0) return 0;
	return state.playerIndex;
}

export type CbAction =
	| { type: "start"; playerNames: string[]; questions: CbQuestion[] }
	// A wrong (non-give-up) guess with a life still left after it, for
	// WHICHEVER player is currently up (solo or multiplayer, since
	// 2026-09-08 -- both get to keep retrying their own current attempt
	// until they're right, give up, or run out of lives) -- see
	// GuessThePlayer.tsx's checkQuestion for how it decides between this
	// and "guessResult" for a wrong outcome.
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

			// Solo: unchanged behavior from before 2026-09-08 -- one player,
			// so there's never anyone else left to take a turn at the current
			// question; every "next" moves straight to the next question (or
			// ends the round, on either running out of the deck or the
			// round-wide life budget -- see MAX_WRONG_LIVES's own doc).
			// wrongCount is deliberately NOT reset here: it has to keep
			// counting across questions for that round-wide budget to mean
			// anything.
			if (state.players.length === 1) {
				const nextIndex = state.questionIndex + 1;
				const outOfLives = state.wrongCount >= MAX_WRONG_LIVES;
				if (outOfLives || nextIndex >= state.questions.length) {
					return { ...state, phase: "finished", lastResult: null, wrongGuesses: [] };
				}
				return { ...state, questionIndex: nextIndex, lastResult: null, wrongGuesses: [] };
			}

			// Multiplayer: this player's own turn at the current question just
			// ended (correct, gave up, or ran out of lives -- state.lastResult
			// is set either way). If anyone in the roster hasn't gone yet,
			// it's simply their turn next, same question, with a completely
			// fresh attempt (wrongCount/wrongGuesses reset, and
			// ClubBadgesPlay.tsx's own turn-keyed effect resets hints/timer to
			// match) -- nothing about this reveals the answer (see
			// isLastPlayerForQuestion in ClubBadgesPlay.tsx, which gates that).
			const nextPlayerIndex = state.playerIndex + 1;
			if (nextPlayerIndex < state.players.length) {
				return { ...state, playerIndex: nextPlayerIndex, lastResult: null, wrongGuesses: [], wrongCount: 0 };
			}
			// Every player has now had their turn at this question -- move on
			// to the next one, starting fresh from player 0, or end the round
			// if that was the last question. No life budget check here:
			// multiplayer has no round-ending life count (see MAX_WRONG_LIVES's
			// own doc) -- a player running out of lives only ever costs THEM
			// this one question, never the group's ability to keep playing.
			const nextQuestionIndex = state.questionIndex + 1;
			if (nextQuestionIndex >= state.questions.length) {
				return { ...state, phase: "finished", lastResult: null, wrongGuesses: [] };
			}
			return {
				...state,
				questionIndex: nextQuestionIndex,
				playerIndex: 0,
				lastResult: null,
				wrongGuesses: [],
				wrongCount: 0,
			};
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

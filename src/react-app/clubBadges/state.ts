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
	clubNames: string[];
}

export interface CbState {
	phase: CbPhase;
	players: CbPlayer[];
	questions: CbQuestion[];
	// Which question is currently up. Whose turn it is is always derived
	// (questionIndex % players.length), never stored separately -- with no
	// lives/eliminations to skip over (every player just answers their
	// question and passes on), a round-robin index needs no extra state the
	// way multiplayer's nextTurnIndex() does.
	questionIndex: number;
	// Set the instant a guess comes back from the server; cleared by "next".
	// Its presence is what the Play screen uses to decide whether it's
	// showing the guess box or the reveal -- see ClubBadgesPlay.tsx.
	lastResult: CbResult | null;
}

export const initialCbState: CbState = {
	phase: "setup",
	players: [],
	questions: [],
	questionIndex: 0,
	lastResult: null,
};

export function currentTurnIndex(state: CbState): number {
	if (state.players.length === 0) return 0;
	return state.questionIndex % state.players.length;
}

export type CbAction =
	| { type: "start"; playerNames: string[]; questions: CbQuestion[] }
	| {
			type: "guessResult";
			guess: string;
			outcome: "correct" | "wrong";
			gaveUp: boolean;
			correctName: string;
			clubNames: string[];
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

		case "guessResult": {
			if (state.phase !== "playing") return state;
			const turnIndex = currentTurnIndex(state);
			const players =
				action.outcome === "correct"
					? state.players.map((p, i) => (i === turnIndex ? { ...p, correct: p.correct + 1 } : p))
					: state.players;
			return {
				...state,
				players,
				lastResult: {
					playerName: state.players[turnIndex].name,
					guess: action.guess,
					outcome: action.outcome,
					gaveUp: action.gaveUp,
					correctName: action.correctName,
					clubNames: action.clubNames,
				},
			};
		}

		case "next": {
			if (state.phase !== "playing" || !state.lastResult) return state;
			const nextIndex = state.questionIndex + 1;
			if (nextIndex >= state.questions.length) {
				return { ...state, phase: "finished", lastResult: null };
			}
			return { ...state, questionIndex: nextIndex, lastResult: null };
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

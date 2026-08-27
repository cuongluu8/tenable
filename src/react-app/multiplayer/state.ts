// All multiplayer game state lives here as a plain client-side reducer — see
// the plan this was built from (single-device pass-and-play v1): no
// cross-device sync, no server-side session, no polling. The only thing
// that ever leaves the browser is a single guess-check request per turn
// (see Multiplayer.tsx), because answers must stay server-authoritative —
// everything else (whose turn it is, lives, found ranks) is decided here.
//
// Deliberately its own module, not touching src/react-app/types.ts's
// single-player Progress shape — the two are shaped similarly (both track
// foundRanks) because they're solving a similar problem, not because they
// share code.

export interface MpPlayer {
	name: string;
	lives: number;
}

export type MpPhase = "setup" | "playing" | "finished";

export interface MpLastAction {
	playerName: string;
	guess: string;
	result: "correct" | "duplicate" | "wrong";
}

export interface MpCategory {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
}

export interface MpState {
	phase: MpPhase;
	category: MpCategory | null;
	players: MpPlayer[];
	turnIndex: number;
	foundRanks: number[];
	// Name/stat for each found rank, straight off the check-guess response —
	// same reason PlayScreen.tsx keeps an equivalent map for single-player:
	// lets the answer grid show what was found without a separate reveal
	// fetch mid-round.
	foundDetails: Record<number, { name: string; statValue: string }>;
	lastAction: MpLastAction | null;
	winReason: "all_found" | "all_out_of_lives" | null;
}

export const initialMpState: MpState = {
	phase: "setup",
	category: null,
	players: [],
	turnIndex: 0,
	foundRanks: [],
	foundDetails: {},
	lastAction: null,
	winReason: null,
};

const STARTING_LIVES = 3;

export type MpAction =
	| { type: "start"; category: MpCategory; playerNames: string[] }
	| {
			type: "guessResult";
			guess: string;
			result: "correct" | "duplicate" | "wrong";
			rank?: number;
			name?: string;
			statValue?: string;
	  }
	| { type: "reset" };

// Finds the next player with lives left, wrapping around the roster —
// walking the whole roster (not just checking the immediate next seat)
// means a single surviving player correctly keeps taking every turn rather
// than the game getting stuck looking for a "next" player who's already out.
function nextTurnIndex(players: MpPlayer[], fromIndex: number): number {
	for (let step = 1; step <= players.length; step++) {
		const idx = (fromIndex + step) % players.length;
		if (players[idx].lives > 0) return idx;
	}
	return fromIndex;
}

export function multiplayerReducer(state: MpState, action: MpAction): MpState {
	switch (action.type) {
		case "start":
			return {
				...initialMpState,
				phase: "playing",
				category: action.category,
				players: action.playerNames.map((name) => ({ name, lives: STARTING_LIVES })),
			};

		case "guessResult": {
			if (state.phase !== "playing" || !state.category) return state;

			const current = state.players[state.turnIndex];
			const lastAction: MpLastAction = {
				playerName: current.name,
				guess: action.guess,
				result: action.result,
			};

			let players = state.players;
			let foundRanks = state.foundRanks;
			let foundDetails = state.foundDetails;

			if (action.result === "correct" && action.rank !== undefined) {
				foundRanks = [...foundRanks, action.rank];
				foundDetails = {
					...foundDetails,
					[action.rank]: { name: action.name ?? action.guess, statValue: action.statValue ?? "" },
				};
			} else if (action.result === "wrong") {
				players = players.map((p, i) =>
					i === state.turnIndex ? { ...p, lives: p.lives - 1 } : p,
				);
			}
			// "duplicate" changes neither lives nor foundRanks — the turn still
			// passes, same as a wrong guess would, just without the life lost.

			const allFound = foundRanks.length >= state.category.answerCount;
			const allOut = players.every((p) => p.lives <= 0);

			if (allFound || allOut) {
				return {
					...state,
					players,
					foundRanks,
					foundDetails,
					lastAction,
					phase: "finished",
					winReason: allFound ? "all_found" : "all_out_of_lives",
				};
			}

			return {
				...state,
				players,
				foundRanks,
				foundDetails,
				lastAction,
				turnIndex: nextTurnIndex(players, state.turnIndex),
			};
		}

		case "reset":
			return initialMpState;

		default:
			return state;
	}
}

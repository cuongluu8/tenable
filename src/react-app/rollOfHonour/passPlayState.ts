import { colorForPlayerIndex } from "../components/playerColors";

// Roll of Honour, pass-and-play (2026-09-13): the rules as a pure reducer,
// same reasoning as multiplayer/state.ts and components/clubBadgesState.ts
// -- one device, plain React state, nothing server-persisted; the only
// network calls are the stateless /check per answer and /reveal at the
// end (RollOfHonourPassPlay.tsx). Rules: players take turns in roster
// order; a turn is ONE attempt at ONE season -- right claims the tile for
// that player (their colour, +1), wrong just ends the turn (no lives: the
// grid, not a life count, is the finite resource), and a player may skip.
// The game ends when every tile is filled, or when the group gives up;
// either way the whole roll is revealed. Most tiles wins.

export interface PassPlayer {
	name: string;
	color: string;
	correct: number;
}

export interface PassAnswered {
	winner: string;
	imageUrl: string | null;
	playerIndex: number;
}

export interface PassPlayState {
	players: PassPlayer[];
	seasons: string[];
	turnIndex: number;
	answered: Record<string, PassAnswered>;
	over: boolean;
	gaveUp: boolean;
	// Every season's winner, filled from /reveal once the game is over.
	revealed: Record<string, { winner: string; imageUrl: string | null }> | null;
}

export type PassPlayAction =
	| { type: "start"; playerNames: string[]; seasons: string[] }
	| { type: "correct"; season: string; winner: string; imageUrl: string | null }
	| { type: "wrong" }
	| { type: "skip" }
	| { type: "giveUp" }
	| { type: "revealed"; tiles: { season: string; winner: string; imageUrl: string | null }[] };

export const initialPassPlayState: PassPlayState = {
	players: [],
	seasons: [],
	turnIndex: 0,
	answered: {},
	over: false,
	gaveUp: false,
	revealed: null,
};

function nextTurn(state: PassPlayState): number {
	return state.players.length === 0 ? 0 : (state.turnIndex + 1) % state.players.length;
}

export function passPlayReducer(state: PassPlayState, action: PassPlayAction): PassPlayState {
	switch (action.type) {
		case "start":
			return {
				...initialPassPlayState,
				players: action.playerNames.map((name, i) => ({ name, color: colorForPlayerIndex(i), correct: 0 })),
				seasons: action.seasons,
			};
		case "correct": {
			if (state.over || action.season in state.answered) return state;
			const answered = { ...state.answered, [action.season]: { winner: action.winner, imageUrl: action.imageUrl, playerIndex: state.turnIndex } };
			const players = state.players.map((p, i) => (i === state.turnIndex ? { ...p, correct: p.correct + 1 } : p));
			const over = Object.keys(answered).length >= state.seasons.length;
			return { ...state, answered, players, over, turnIndex: nextTurn(state) };
		}
		case "wrong":
		case "skip":
			if (state.over) return state;
			return { ...state, turnIndex: nextTurn(state) };
		case "giveUp":
			if (state.over) return state;
			return { ...state, over: true, gaveUp: true };
		case "revealed":
			return { ...state, revealed: Object.fromEntries(action.tiles.map((t) => [t.season, { winner: t.winner, imageUrl: t.imageUrl }])) };
	}
}

export interface RankedPassPlayer {
	player: PassPlayer;
	index: number; // roster position, for colour lookups
	rank: number; // ties share a rank
}

export function rankPassPlayers(players: PassPlayer[]): RankedPassPlayer[] {
	const ordered = players.map((player, index) => ({ player, index })).sort((a, b) => b.player.correct - a.player.correct);
	return ordered.map((entry, i) => ({
		...entry,
		rank: i > 0 && ordered[i - 1].player.correct === entry.player.correct ? 0 : i + 1,
	})).map((entry, i, all) => (entry.rank === 0 ? { ...entry, rank: all.slice(0, i).reverse().find((e) => e.rank !== 0)?.rank ?? 1 } : entry));
}

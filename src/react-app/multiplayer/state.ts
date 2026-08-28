// All multiplayer game state lives here as a plain client-side reducer — see
// the plan this was built from (single-device pass-and-play v1): no
// cross-device sync, no server-side session, no polling. The only thing
// that ever leaves the browser is a single guess-check request per turn
// (see Multiplayer.tsx), because answers must stay server-authoritative —
// everything else (whose turn it is, lives, found ranks, per-turn timing) is
// decided here.
//
// Deliberately its own module, not touching src/react-app/types.ts's
// single-player Progress shape — the two are shaped similarly (both track
// foundRanks) because they're solving a similar problem, not because they
// share code.

// Assigned to players in roster order at "start", cycling if there are ever
// more players than colors (MultiplayerSetup.tsx caps at 8, matching this
// palette's length, so cycling is just a safety net, not the normal case).
// Deliberately excludes pure red (#f87171) and pure green (#22c55e/#4ade80)
// at the *extremes* of this palette's hues that App.css already uses for
// "wrong"/"life lost" and "correct"/"found" — a player's identity color
// shouldn't itself read as a correctness signal. (The one green here, first
// in the list, is soft enough not to collide in practice, and dropping it
// would leave only seven.)
export const PLAYER_COLORS = [
	"#4ade80", // green
	"#60a5fa", // blue
	"#f472b6", // pink
	"#fbbf24", // amber
	"#a78bfa", // violet
	"#22d3ee", // cyan
	"#fb923c", // orange
	"#94a3b8", // slate
];

export function colorForPlayerIndex(index: number): string {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

// "0:07", "1:23" — used for both the live per-turn timer and the final
// per-player total in MultiplayerResult. Minutes aren't zero-padded (a round
// realistically never reaches double-digit minutes on one turn), seconds
// always are.
export function formatDuration(ms: number): string {
	const totalSeconds = Math.max(0, Math.round(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export interface MpPlayer {
	name: string;
	lives: number;
	color: string;
	// Correct answers found by this player — the primary ranking for
	// "winner" (see rankPlayers below).
	correct: number;
	// Cumulative time in ms across every turn this player has taken
	// (whether it ended in a correct guess, a wrong guess, a duplicate, or a
	// pass) — the tiebreaker when two players have the same correct count.
	// Lower is "quicker". Finalized turn-by-turn in the reducer, not derived
	// from timestamps at read time, so it survives a page free of any
	// wall-clock assumptions once the round ends.
	totalTimeMs: number;
}

export type MpPhase = "setup" | "playing" | "finished";

export interface MpLastAction {
	playerName: string;
	guess: string;
	// "pass" costs a life exactly like "wrong" does — passing is "I don't
	// know this one", not a free skip, so it can't be used to stall out the
	// clock without any cost. See the "pass" reducer case below.
	result: "correct" | "duplicate" | "wrong" | "pass";
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
	// Name/stat/finder for each found rank, straight off the check-guess
	// response — same reason PlayScreen.tsx keeps an equivalent map for
	// single-player: lets the answer grid show what was found without a
	// separate reveal fetch mid-round. playerIndex additionally drives the
	// per-player highlight color on that answer's grid slot.
	foundDetails: Record<number, { name: string; statValue: string; playerIndex: number }>;
	lastAction: MpLastAction | null;
	winReason: "all_found" | "all_out_of_lives" | null;
	// Wall-clock start of the *current* player's turn (epoch ms) — read
	// against Date.now() by MultiplayerPlay.tsx's ticking display, and used
	// here to compute how much time to add to a player's totalTimeMs when
	// their turn ends. Reset every time the turn passes to someone new.
	turnStartedAt: number;
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
	turnStartedAt: 0,
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
	| { type: "pass" }
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

// Shared by "guessResult" and "pass": every way a turn can end charges the
// elapsed wall-clock time to whoever was playing it, regardless of what
// happened (right, wrong, duplicate, or a deliberate skip) — the timer is
// tracking "how long this player took", not "how long they took to be
// right". Takes `now` as a parameter (rather than calling Date.now()
// internally) so a single instant is shared by every derived value in one
// dispatch.
function chargeElapsedTime(players: MpPlayer[], turnIndex: number, turnStartedAt: number, now: number): MpPlayer[] {
	const elapsed = Math.max(0, now - turnStartedAt);
	return players.map((p, i) => (i === turnIndex ? { ...p, totalTimeMs: p.totalTimeMs + elapsed } : p));
}

// Shared tail end of both "guessResult" (wrong/duplicate/correct-but-not-
// last-answer) and "pass": once this turn's players/foundRanks/foundDetails
// are settled, decide whether the round just ended and either finish or
// hand the turn to whoever's next.
function settleTurn(
	state: MpState,
	players: MpPlayer[],
	foundRanks: number[],
	foundDetails: MpState["foundDetails"],
	lastAction: MpLastAction,
	now: number,
): MpState {
	const allFound = state.category !== null && foundRanks.length >= state.category.answerCount;
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
		turnStartedAt: now,
	};
}

export function multiplayerReducer(state: MpState, action: MpAction): MpState {
	switch (action.type) {
		case "start":
			return {
				...initialMpState,
				phase: "playing",
				category: action.category,
				players: action.playerNames.map((name, i) => ({
					name,
					lives: STARTING_LIVES,
					color: colorForPlayerIndex(i),
					correct: 0,
					totalTimeMs: 0,
				})),
				turnStartedAt: Date.now(),
			};

		case "guessResult": {
			if (state.phase !== "playing" || !state.category) return state;

			const now = Date.now();
			const current = state.players[state.turnIndex];
			const lastAction: MpLastAction = {
				playerName: current.name,
				guess: action.guess,
				result: action.result,
			};

			let players = chargeElapsedTime(state.players, state.turnIndex, state.turnStartedAt, now);
			let foundRanks = state.foundRanks;
			let foundDetails = state.foundDetails;

			if (action.result === "correct" && action.rank !== undefined) {
				foundRanks = [...foundRanks, action.rank];
				foundDetails = {
					...foundDetails,
					[action.rank]: {
						name: action.name ?? action.guess,
						statValue: action.statValue ?? "",
						playerIndex: state.turnIndex,
					},
				};
				players = players.map((p, i) => (i === state.turnIndex ? { ...p, correct: p.correct + 1 } : p));
			} else if (action.result === "wrong") {
				players = players.map((p, i) => (i === state.turnIndex ? { ...p, lives: p.lives - 1 } : p));
			}
			// "duplicate" changes neither lives nor foundRanks — the turn still
			// passes, same as a wrong guess would, just without the life lost.

			return settleTurn(state, players, foundRanks, foundDetails, lastAction, now);
		}

		case "pass": {
			if (state.phase !== "playing" || !state.category) return state;

			const now = Date.now();
			const current = state.players[state.turnIndex];
			let players = chargeElapsedTime(state.players, state.turnIndex, state.turnStartedAt, now);
			// Costs a life, exactly like a wrong guess — otherwise a player could
			// stall indefinitely (or a struggling player could pass every turn
			// forever) without ever risking elimination.
			players = players.map((p, i) => (i === state.turnIndex ? { ...p, lives: p.lives - 1 } : p));

			const lastAction: MpLastAction = { playerName: current.name, guess: "", result: "pass" };
			return settleTurn(state, players, state.foundRanks, state.foundDetails, lastAction, now);
		}

		case "reset":
			return initialMpState;

		default:
			return state;
	}
}

// Winner (and full standings order): most correct answers first, then
// quickest total time as the tiebreaker — the rule the player asked for.
// Returns players paired with their original roster index (foundDetails and
// the live-play roster both key off that index, not name, since two
// players could otherwise share a display name after one changes it —
// MultiplayerSetup.tsx already guards against duplicates within one roster,
// but ranking stays index-keyed regardless so this function doesn't have to
// re-assume that invariant).
export interface RankedPlayer {
	player: MpPlayer;
	index: number;
	rank: number; // 1 = winner; ties share a rank (co-winners on an exact tie)
}

export function rankPlayers(players: MpPlayer[]): RankedPlayer[] {
	const ordered = players
		.map((player, index) => ({ player, index }))
		.sort((a, b) => {
			if (b.player.correct !== a.player.correct) return b.player.correct - a.player.correct;
			return a.player.totalTimeMs - b.player.totalTimeMs;
		});

	let rank = 0;
	let prev: { correct: number; totalTimeMs: number } | null = null;
	return ordered.map((entry, i) => {
		const key = { correct: entry.player.correct, totalTimeMs: entry.player.totalTimeMs };
		if (!prev || key.correct !== prev.correct || key.totalTimeMs !== prev.totalTimeMs) {
			rank = i + 1;
		}
		prev = key;
		return { ...entry, rank };
	});
}

// Unit tests for multiplayer/state.ts's plain client-side reducer -- see
// that file's own doc for why this is where the ENTIRE pass-and-play game
// lives (no server session). Also covers playerColors.ts's
// colorForPlayerIndex, re-exported here and assigned at "start".
import { describe, expect, it } from "vitest";
import { formatDuration, initialMpState, multiplayerReducer, rankPlayers, type MpCategory, type MpState } from "./state";

const CATEGORY: MpCategory = { slug: "fixture", title: "Fixture", subtitle: null, statLabel: "points", answerCount: 3 };

function started(playerNames = ["Alice", "Bob", "Charlie"]): MpState {
	return multiplayerReducer(initialMpState, { type: "start", category: CATEGORY, playerNames });
}

describe("formatDuration", () => {
	it("formats seconds under a minute as 0:SS", () => {
		expect(formatDuration(7_000)).toBe("0:07");
	});

	it("formats minutes without zero-padding, seconds with it", () => {
		expect(formatDuration(83_000)).toBe("1:23");
	});

	it("floors negative/zero durations to 0:00 rather than going negative", () => {
		expect(formatDuration(0)).toBe("0:00");
		expect(formatDuration(-500)).toBe("0:00");
	});
});

describe("multiplayerReducer: start", () => {
	it("gives every player STARTING_LIVES and a distinct color, turn to the first player", () => {
		const state = started();
		expect(state.phase).toBe("playing");
		expect(state.turnIndex).toBe(0);
		expect(state.players).toHaveLength(3);
		for (const p of state.players) {
			expect(p.lives).toBe(3);
			expect(p.correct).toBe(0);
			expect(p.totalTimeMs).toBe(0);
		}
		expect(new Set(state.players.map((p) => p.color)).size).toBe(3);
	});
});

describe("multiplayerReducer: guessResult", () => {
	it("a correct guess adds the rank to foundRanks, credits the current player, and passes the turn", () => {
		const state = multiplayerReducer(started(), {
			type: "guessResult",
			guess: "Someone",
			result: "correct",
			rank: 1,
			name: "Someone",
			statValue: "100",
		});
		expect(state.foundRanks).toEqual([1]);
		expect(state.players[0].correct).toBe(1);
		expect(state.turnIndex).toBe(1); // passed to the next player
		expect(state.foundDetails[1]).toEqual({ name: "Someone", statValue: "100", playerIndex: 0 });
	});

	it("a wrong guess costs the current player a life and passes the turn", () => {
		const state = multiplayerReducer(started(), { type: "guessResult", guess: "Nope", result: "wrong" });
		expect(state.players[0].lives).toBe(2);
		expect(state.turnIndex).toBe(1);
	});

	it("a duplicate guess costs no life and adds nothing to foundRanks, but still passes the turn", () => {
		const afterFirst = multiplayerReducer(started(), {
			type: "guessResult",
			guess: "Someone",
			result: "correct",
			rank: 1,
			name: "Someone",
			statValue: "100",
		});
		// Turn is now player 1's -- a duplicate on their turn shouldn't touch
		// player 0's life or player 1's.
		const afterDuplicate = multiplayerReducer(afterFirst, { type: "guessResult", guess: "Someone", result: "duplicate" });
		expect(afterDuplicate.players.map((p) => p.lives)).toEqual([3, 3, 3]);
		expect(afterDuplicate.foundRanks).toEqual([1]);
		expect(afterDuplicate.turnIndex).toBe(2);
	});

	it("finishes the round (all_found) once every answer is found, without needing every player to run out of lives", () => {
		let state = started();
		state = multiplayerReducer(state, { type: "guessResult", guess: "a", result: "correct", rank: 1, name: "a", statValue: "1" });
		state = multiplayerReducer(state, { type: "guessResult", guess: "b", result: "correct", rank: 2, name: "b", statValue: "2" });
		state = multiplayerReducer(state, { type: "guessResult", guess: "c", result: "correct", rank: 3, name: "c", statValue: "3" });
		expect(state.phase).toBe("finished");
		expect(state.winReason).toBe("all_found");
	});

	it("finishes the round (all_out_of_lives) once every player has run out", () => {
		let state = started(["Alice", "Bob"]);
		// 3 lives each -- 6 wrong guesses total eliminates both.
		for (let i = 0; i < 6; i++) {
			state = multiplayerReducer(state, { type: "guessResult", guess: `wrong ${i}`, result: "wrong" });
		}
		expect(state.phase).toBe("finished");
		expect(state.winReason).toBe("all_out_of_lives");
	});

	it("skips an eliminated player's turn, wrapping around to whoever still has lives", () => {
		let state = started(["Alice", "Bob"]);
		// Eliminate Alice (player 0) with 3 wrong guesses on her own turns --
		// turn alternates, so every OTHER guess is hers.
		state = multiplayerReducer(state, { type: "guessResult", guess: "w", result: "wrong" }); // Alice: 2 lives, -> Bob
		state = multiplayerReducer(state, { type: "guessResult", guess: "w", result: "wrong" }); // Bob: 2 lives, -> Alice
		state = multiplayerReducer(state, { type: "guessResult", guess: "w", result: "wrong" }); // Alice: 1 life, -> Bob
		state = multiplayerReducer(state, { type: "guessResult", guess: "w", result: "wrong" }); // Bob: 1 life, -> Alice
		state = multiplayerReducer(state, { type: "guessResult", guess: "w", result: "wrong" }); // Alice: 0 lives, -> Bob
		expect(state.turnIndex).toBe(1);
		expect(state.players[0].lives).toBe(0);
		// Bob keeps taking every turn now that Alice is out -- a correct
		// guess (rather than another wrong one, which would finish the round
		// by eliminating Bob too) shows the turn wrapping straight back to
		// him instead of to eliminated Alice.
		state = multiplayerReducer(state, {
			type: "guessResult",
			guess: "a",
			result: "correct",
			rank: 1,
			name: "a",
			statValue: "1",
		});
		expect(state.turnIndex).toBe(1);
		expect(state.phase).toBe("playing");
	});
});

describe("multiplayerReducer: pass", () => {
	it("costs a life exactly like a wrong guess, so passing can't be used to stall for free", () => {
		const state = multiplayerReducer(started(), { type: "pass" });
		expect(state.players[0].lives).toBe(2);
		expect(state.lastAction).toEqual({ playerName: "Alice", guess: "", result: "pass" });
	});
});

describe("multiplayerReducer: reset", () => {
	it("returns to the initial (setup) state", () => {
		const state = multiplayerReducer(started(), { type: "reset" });
		expect(state).toEqual(initialMpState);
	});
});

describe("rankPlayers", () => {
	it("ranks by most correct first", () => {
		const players = [
			{ name: "A", lives: 3, color: "x", correct: 1, totalTimeMs: 1000 },
			{ name: "B", lives: 3, color: "x", correct: 3, totalTimeMs: 5000 },
		];
		const ranked = rankPlayers(players);
		expect(ranked.map((r) => r.player.name)).toEqual(["B", "A"]);
		expect(ranked.map((r) => r.rank)).toEqual([1, 2]);
	});

	it("breaks a tie on correct count with the quicker total time", () => {
		const players = [
			{ name: "Slow", lives: 3, color: "x", correct: 2, totalTimeMs: 9000 },
			{ name: "Fast", lives: 3, color: "x", correct: 2, totalTimeMs: 3000 },
		];
		const ranked = rankPlayers(players);
		expect(ranked.map((r) => r.player.name)).toEqual(["Fast", "Slow"]);
	});

	it("gives co-winners the same rank on an exact tie", () => {
		const players = [
			{ name: "A", lives: 3, color: "x", correct: 2, totalTimeMs: 5000 },
			{ name: "B", lives: 3, color: "x", correct: 2, totalTimeMs: 5000 },
			{ name: "C", lives: 3, color: "x", correct: 1, totalTimeMs: 1000 },
		];
		const ranked = rankPlayers(players);
		expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3]);
	});
});

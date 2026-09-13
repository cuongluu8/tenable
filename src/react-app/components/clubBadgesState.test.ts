// Unit tests for clubBadgesState.ts's reducer and scoring helpers -- see
// that file's own doc for why solo and multiplayer share one reducer
// despite genuinely different "next" semantics (a round-wide life budget
// vs. a fresh one per player per question).
import { describe, expect, it } from "vitest";
import {
	computeScore,
	initialRoundState,
	roundReducer,
	rankRoundPlayers,
	scoreBand,
	type CbQuestion,
	type RoundState,
} from "./clubBadgesState";

function questions(count: number): CbQuestion[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		badges: [],
		nationality: null,
		transferDates: [],
		loanMoves: [],
	}));
}

function started(playerNames: string[], questionCount = 3): RoundState {
	return roundReducer(initialRoundState, { type: "start", playerNames, questions: questions(questionCount) });
}

describe("computeScore", () => {
	it("starts at 100 with no time elapsed and no hints used", () => {
		expect(computeScore(0, 0)).toBe(100);
	});

	it("deducts 10 per 30-second interval elapsed", () => {
		expect(computeScore(29, 0)).toBe(100); // not a full interval yet
		expect(computeScore(30, 0)).toBe(90);
		expect(computeScore(65, 0)).toBe(80); // 2 full intervals, not 3
	});

	it("deducts 15 per hint used", () => {
		expect(computeScore(0, 2)).toBe(70);
	});

	it("can go negative -- deliberately not clamped to zero", () => {
		expect(computeScore(300, 5)).toBeLessThan(0);
	});
});

describe("scoreBand", () => {
	it("bands scores at the documented thresholds", () => {
		expect(scoreBand(81)).toBe("gold");
		expect(scoreBand(80)).toBe("silver"); // the documented single-point gap, folded into silver
		expect(scoreBand(50)).toBe("silver");
		expect(scoreBand(49)).toBe("yellow");
		expect(scoreBand(30)).toBe("yellow");
		expect(scoreBand(29)).toBe("brown");
		expect(scoreBand(0)).toBe("brown");
		expect(scoreBand(-1)).toBe("grey");
	});
});

describe("roundReducer: start", () => {
	it("gives every player a distinct color and zero correct, phase playing", () => {
		const state = started(["Alice", "Bob"]);
		expect(state.phase).toBe("playing");
		expect(state.players.map((p) => p.correct)).toEqual([0, 0]);
		expect(new Set(state.players.map((p) => p.color)).size).toBe(2);
	});
});

describe("roundReducer: wrongAttempt", () => {
	it("increments wrongCount and records the guess, without ending the attempt", () => {
		const state = roundReducer(started(["Solo"]), { type: "wrongAttempt", guess: "nope" });
		expect(state.wrongCount).toBe(1);
		expect(state.wrongGuesses).toEqual(["nope"]);
		expect(state.lastResult).toBeNull(); // still their turn, not revealed yet
	});
});

describe("roundReducer: guessResult", () => {
	it("a correct guess credits the current player and doesn't touch wrongCount/wrongGuesses", () => {
		const state = roundReducer(started(["Solo"]), {
			type: "guessResult",
			guess: "Right",
			outcome: "correct",
			gaveUp: false,
			correctName: "Right",
			points: 85,
		});
		expect(state.players[0].correct).toBe(1);
		expect(state.wrongCount).toBe(0);
		expect(state.wrongGuesses).toEqual([]);
		expect(state.lastResult).toEqual({
			playerName: "Solo",
			guess: "Right",
			outcome: "correct",
			gaveUp: false,
			correctName: "Right",
			points: 85,
		});
	});

	it("a wrong (non-give-up) guess costs a life and is recorded in wrongGuesses", () => {
		const state = roundReducer(started(["Solo"]), {
			type: "guessResult",
			guess: "Wrong",
			outcome: "wrong",
			gaveUp: false,
			correctName: "Right",
			points: 0,
		});
		expect(state.wrongCount).toBe(1);
		expect(state.wrongGuesses).toEqual(["Wrong"]);
	});

	it("a give-up costs a life too, but is NOT added to wrongGuesses (it isn't a guess)", () => {
		const state = roundReducer(started(["Solo"]), {
			type: "guessResult",
			guess: "",
			outcome: "wrong",
			gaveUp: true,
			correctName: "Right",
			points: 0,
		});
		expect(state.wrongCount).toBe(1);
		expect(state.wrongGuesses).toEqual([]);
		expect(state.lastResult?.gaveUp).toBe(true);
	});
});

describe("roundReducer: next (solo)", () => {
	function afterGuess(state: RoundState, outcome: "correct" | "wrong"): RoundState {
		return roundReducer(state, { type: "guessResult", guess: "x", outcome, gaveUp: false, correctName: "x", points: 0 });
	}

	it("moves to the next question, resetting per-attempt state but NOT the round-wide wrongCount", () => {
		let state = started(["Solo"], 2);
		state = roundReducer(state, { type: "wrongAttempt", guess: "nope" });
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" });
		expect(state.questionIndex).toBe(1);
		expect(state.phase).toBe("playing");
		expect(state.wrongGuesses).toEqual([]);
		expect(state.wrongCount).toBe(1); // round-wide budget, carries over
	});

	it("ends the round once the round-wide life budget (5) is exhausted, even mid-deck", () => {
		let state = started(["Solo"], 10);
		for (let i = 0; i < 5; i++) {
			state = afterGuess(state, "wrong");
			state = roundReducer(state, { type: "next" });
		}
		expect(state.phase).toBe("finished");
	});

	it("ends the round once the deck runs out, even with lives to spare", () => {
		let state = started(["Solo"], 2);
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" });
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" });
		expect(state.phase).toBe("finished");
	});
});

describe("roundReducer: next (multiplayer)", () => {
	function afterGuess(state: RoundState, outcome: "correct" | "wrong"): RoundState {
		return roundReducer(state, { type: "guessResult", guess: "x", outcome, gaveUp: false, correctName: "x", points: 0 });
	}

	it("passes to the next player on the SAME question first, with a fresh per-player budget", () => {
		let state = started(["Alice", "Bob"], 2);
		state = afterGuess(state, "wrong");
		state = roundReducer(state, { type: "next" });
		expect(state.questionIndex).toBe(0); // still the same question
		expect(state.playerIndex).toBe(1); // Bob's turn now
		expect(state.wrongCount).toBe(0); // fresh budget for Bob, not carried from Alice
	});

	it("moves to the next question (resetting playerIndex to 0) only once every player has gone", () => {
		let state = started(["Alice", "Bob"], 2);
		state = afterGuess(state, "wrong");
		state = roundReducer(state, { type: "next" }); // -> Bob, same question
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" }); // -> question 2, Alice again
		expect(state.questionIndex).toBe(1);
		expect(state.playerIndex).toBe(0);
	});

	it("a player running out of lives only ends THEIR turn, never the whole round", () => {
		let state = started(["Alice", "Bob"], 5);
		for (let i = 0; i < 5; i++) state = afterGuess(state, "wrong"); // Alice's own wrongCount is now 5 -- irrelevant to the round
		state = roundReducer(state, { type: "next" });
		expect(state.phase).toBe("playing");
		expect(state.playerIndex).toBe(1);
	});

	it("ends the round once every player has had a turn on the last question", () => {
		let state = started(["Alice", "Bob"], 1);
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" }); // -> Bob, question 0 (only one question)
		state = afterGuess(state, "correct");
		state = roundReducer(state, { type: "next" });
		expect(state.phase).toBe("finished");
	});
});

describe("roundReducer: reset", () => {
	it("returns to the initial (setup) state", () => {
		const state = roundReducer(started(["Solo"]), { type: "reset" });
		expect(state).toEqual(initialRoundState);
	});
});

describe("rankRoundPlayers", () => {
	it("ranks by most correct, with no time tiebreak (unlike multiplayer/state.ts's rankPlayers)", () => {
		const players = [
			{ name: "A", color: "x", correct: 2 },
			{ name: "B", color: "x", correct: 4 },
			{ name: "C", color: "x", correct: 2 },
		];
		const ranked = rankRoundPlayers(players);
		expect(ranked.map((r) => r.player.name)).toEqual(["B", "A", "C"]);
		expect(ranked.map((r) => r.rank)).toEqual([1, 2, 2]);
	});
});

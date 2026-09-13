// Unit tests for checkRoundGuess.ts -- the guess-check round-trip shared
// by GuessThePlayer.tsx and useSetRound.ts. global fetch is stubbed so
// this never makes a real network call.
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRoundGuess } from "./checkRoundGuess";
import { MAX_WRONG_LIVES, initialRoundState, type CbQuestion, type RoundAction, type RoundState } from "./clubBadgesState";

const QUESTION: CbQuestion = { id: 1, badges: [], nationality: null, transferDates: [], loanMoves: [] };

function stubFetch(status: number, body: unknown) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response(JSON.stringify(body), { status })),
	);
}

function baseState(overrides: Partial<RoundState> = {}): RoundState {
	return { ...initialRoundState, phase: "playing", questions: [QUESTION], questionIndex: 0, ...overrides };
}

function harness(state: RoundState) {
	const dispatched: RoundAction[] = [];
	const submittingCalls: boolean[] = [];
	return {
		dispatched,
		submittingCalls,
		run: (body: { guess: string } | { giveUp: true }, points = 42, submitting = false) =>
			checkRoundGuess({
				checkGuessUrl: "/api/fixture/check-guess",
				state,
				dispatch: (a) => dispatched.push(a),
				submitting,
				setSubmitting: (v) => submittingCalls.push(v),
				body,
				points,
			}),
	};
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("checkRoundGuess", () => {
	it("sends the current question's id alongside the guess, and toggles submitting true then false", async () => {
		stubFetch(200, { result: "correct", name: "Someone" });
		const { dispatched, submittingCalls, run } = harness(baseState());
		await run({ guess: "Someone" });

		expect(vi.mocked(fetch)).toHaveBeenCalledWith(
			"/api/fixture/check-guess",
			expect.objectContaining({ body: JSON.stringify({ questionId: 1, guess: "Someone" }) }),
		);
		expect(submittingCalls).toEqual([true, false]);
		expect(dispatched).toEqual([
			{ type: "guessResult", guess: "Someone", outcome: "correct", gaveUp: false, correctName: "Someone", points: 42 },
		]);
	});

	it("does nothing if already submitting (guards against a double-fire)", async () => {
		stubFetch(200, { result: "correct", name: "Someone" });
		const { dispatched, run } = harness(baseState());
		await run({ guess: "Someone" }, 42, true);
		expect(dispatched).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("does nothing if there's no current question (questionIndex past the end)", async () => {
		stubFetch(200, { result: "correct", name: "Someone" });
		const { dispatched, run } = harness(baseState({ questionIndex: 5 }));
		await run({ guess: "Someone" });
		expect(dispatched).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("dispatches nothing on a server error response, but still clears submitting", async () => {
		stubFetch(404, { error: "Unknown question" });
		const { dispatched, submittingCalls, run } = harness(baseState());
		await run({ guess: "Someone" });
		expect(dispatched).toEqual([]);
		expect(submittingCalls).toEqual([true, false]);
	});

	it("a wrong guess with lives remaining is retryable -- dispatches wrongAttempt, not guessResult", async () => {
		stubFetch(200, { result: "wrong", name: "Real Name" });
		const { dispatched, run } = harness(baseState({ wrongCount: 0 }));
		await run({ guess: "Nope" });
		expect(dispatched).toEqual([{ type: "wrongAttempt", guess: "Nope" }]);
	});

	it("a wrong guess that uses the last life ends the turn -- dispatches guessResult", async () => {
		stubFetch(200, { result: "wrong", name: "Real Name" });
		const { dispatched, run } = harness(baseState({ wrongCount: MAX_WRONG_LIVES - 1 }));
		await run({ guess: "Nope" });
		expect(dispatched).toEqual([
			{ type: "guessResult", guess: "Nope", outcome: "wrong", gaveUp: false, correctName: "Real Name", points: 42 },
		]);
	});

	it("a correct guess always ends the turn, even with retries left (never retryable)", async () => {
		stubFetch(200, { result: "correct", name: "Real Name" });
		const { dispatched, run } = harness(baseState({ wrongCount: 0 }));
		await run({ guess: "Real Name" });
		expect(dispatched[0]).toMatchObject({ type: "guessResult", outcome: "correct" });
	});

	it("giving up always ends the turn immediately, regardless of lives remaining", async () => {
		stubFetch(200, { result: "wrong", name: "Real Name" });
		const { dispatched, run } = harness(baseState({ wrongCount: 0 }));
		await run({ giveUp: true });
		expect(dispatched).toEqual([
			{ type: "guessResult", guess: "(gave up)", outcome: "wrong", gaveUp: true, correctName: "Real Name", points: 42 },
		]);
	});

	it("a network error is swallowed silently -- no dispatch, submitting still cleared", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("network down");
			}),
		);
		const { dispatched, submittingCalls, run } = harness(baseState());
		await run({ guess: "Someone" });
		expect(dispatched).toEqual([]);
		expect(submittingCalls).toEqual([true, false]);
	});
});

import { MAX_WRONG_LIVES, type RoundAction, type RoundState } from "./clubBadgesState";

export interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

// Shared by GuessThePlayer.tsx (multiplayer's own real multi-question
// round) and useSetRound.ts (the Sets modes' one-question-at-a-time
// mini-rounds) -- despite driving very different ROUND shapes, the guess-
// check round-trip itself is identical either way: it only ever reads
// the CURRENT question off `state` and dispatches to roundReducer,
// nothing here cares whether the round has 1 question or 10.
//
// A give-up is a deliberate "stop trying this one" -- it always ends the
// current player's turn, lives or not, unlike an actual wrong guess
// (which only ends it once their lives run out). wrongCount+1 here
// mirrors what the reducer is about to do to it (see
// "wrongAttempt"/"guessResult" in clubBadgesState.ts) so this can decide
// which of the two to dispatch *before* that update lands. Applies
// equally to solo and multiplayer -- multiplayer used to have no retry
// at all (every wrong guess ended the question after a single attempt),
// a real reported bug, not an intentional design difference from solo.
export async function checkRoundGuess(opts: {
	checkGuessUrl: string;
	state: RoundState;
	dispatch: (action: RoundAction) => void;
	submitting: boolean;
	setSubmitting: (submitting: boolean) => void;
	body: { guess: string } | { giveUp: true };
	// This question's live score (computeScore(elapsedSeconds, hintsUsed))
	// as RoundPlay.tsx read it at the moment the guess/give-up button was
	// actually pressed -- not recomputed here after the fetch resolves,
	// so the score reflects how long the player took to answer, not how
	// long the network took to grade it.
	points: number;
}): Promise<void> {
	const { checkGuessUrl, state, dispatch, submitting, setSubmitting, body, points } = opts;
	const question = state.questions[state.questionIndex];
	if (!question || submitting) return;

	setSubmitting(true);
	try {
		const res = await fetch(checkGuessUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ questionId: question.id, ...body }),
		});
		const data = (await res.json()) as CheckGuessResponse | { error: string };
		if (!res.ok || "error" in data) return;

		const gaveUp = !("guess" in body);
		const retryable = !gaveUp && data.result === "wrong" && state.wrongCount + 1 < MAX_WRONG_LIVES;

		if (retryable) {
			dispatch({ type: "wrongAttempt", guess: "guess" in body ? body.guess : "" });
			return;
		}

		dispatch({
			type: "guessResult",
			guess: "guess" in body ? body.guess : "(gave up)",
			outcome: data.result,
			gaveUp,
			correctName: data.name,
			points,
		});
	} catch {
		// Network error mid-question: nothing to apply, player just tries again.
	} finally {
		setSubmitting(false);
	}
}

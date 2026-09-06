import { useCallback, useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "./clubBadges.css";
import { ClubBadgesPlay } from "./ClubBadgesPlay";
import { ClubBadgesResult } from "./ClubBadgesResult";
import { clubBadgesReducer, initialCbState, type CbQuestion } from "./state";

interface RoundResponse {
	questions: CbQuestion[];
}

interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
	clubNames: string[];
}

interface Props {
	// Roster is already decided by whichever screen got here -- a single
	// "You" entry for the solo Single Player variant, or a real multi-name
	// roster collected by Multiplayer's own roster step. This component
	// owns nothing about how the roster was gathered, only the game itself
	// (round fetching, guessing, scoring) -- see ClubBadgesPlay.tsx/
	// ClubBadgesResult.tsx for how they adapt their display for a
	// single-player roster (no turn-passing, no per-player standings).
	playerNames: string[];
	// Leaves the game entirely, back to whichever screen chose to start it
	// (SinglePlayerHome or Multiplayer's game-type picker) -- distinct from
	// "Play again" below, which stays in the game with a fresh round.
	onExit: () => void;
}

// The actual "guess the player from their clubs" engine, reusable from
// both Single Player (one name, no pass-and-play) and Multiplayer (a real
// roster) -- see App.tsx and Multiplayer.tsx for the two entry points. Same
// round-fetch-then-grade-guesses shape the previous single-entry-point
// version had, just without owning its own roster-collection step anymore.
export function GuessThePlayer({ playerNames, onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const startRound = useCallback(async () => {
		setLoadError(null);
		try {
			const res = await fetch("/api/club-badges/round");
			const data = (await res.json()) as RoundResponse | { error: string };
			if (!res.ok || "error" in data || data.questions.length === 0) {
				setLoadError("Couldn't load a round right now — try again in a moment.");
				return;
			}
			dispatch({ type: "start", playerNames, questions: data.questions });
		} catch {
			setLoadError("Couldn't load a round right now — try again in a moment.");
		}
		// playerNames is a fresh array from the caller on every render in
		// practice (built from user input), but its actual contents only
		// change when a genuinely new roster is chosen -- re-running this on
		// referential changes alone would just re-fetch on unrelated
		// re-renders, so it's intentionally left out of the dependency list;
		// this effect's own mount-once trigger below is what actually starts
		// the round.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		startRound();
	}, [startRound]);

	// Shared by submitGuess and giveUp below -- the server call and the
	// resulting dispatch are identical either way (giveUp just skips the
	// matching entirely and always grades wrong -- see clubBadges.ts), only
	// what gets recorded as the "guess" in state differs.
	async function checkQuestion(body: { guess: string } | { giveUp: true }) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/club-badges/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionId: question.id, ...body }),
			});
			const data = (await res.json()) as CheckGuessResponse | { error: string };
			if (!res.ok || "error" in data) return;

			dispatch({
				type: "guessResult",
				guess: "guess" in body ? body.guess : "(gave up)",
				outcome: data.result,
				gaveUp: !("guess" in body),
				correctName: data.name,
				clubNames: data.clubNames,
			});
		} catch {
			// Network error mid-question: nothing to apply, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function submitGuess(guess: string) {
		return checkQuestion({ guess });
	}

	function giveUp() {
		return checkQuestion({ giveUp: true });
	}

	function nextQuestion() {
		dispatch({ type: "next" });
	}

	function playAgain() {
		dispatch({ type: "reset" });
		startRound();
	}

	return (
		<div className="screen">
			{state.phase === "setup" &&
				(loadError ? (
					<>
						<button type="button" className="back-link" onClick={onExit}>
							← Back
						</button>
						<p className="mp-setup__error">{loadError}</p>
						<button type="button" onClick={startRound}>
							Try again
						</button>
					</>
				) : (
					<p>Loading a round…</p>
				))}
			{state.phase === "playing" && (
				<ClubBadgesPlay
					state={state}
					onGuess={submitGuess}
					onGiveUp={giveUp}
					onNext={nextQuestion}
					submitting={submitting}
					onQuit={onExit}
				/>
			)}
			{state.phase === "finished" && <ClubBadgesResult state={state} onPlayAgain={playAgain} onExit={onExit} />}
		</div>
	);
}

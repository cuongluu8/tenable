import { useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "./clubBadges.css";
import { ClubBadgesPlayers } from "./ClubBadgesPlayers";
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
	onBack: () => void;
}

// Top-level owner of the "guess the player from their clubs" pass-and-play
// flow -- same shape as src/react-app/multiplayer/Multiplayer.tsx (roster
// step, then play, then result), but its own state (see ./state.ts for why)
// and a round fetched once at start rather than a category picked up
// front.
export function ClubBadges({ onBack }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	async function startGame(playerNames: string[]) {
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
	}

	async function submitGuess(guess: string) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/club-badges/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionId: question.id, guess }),
			});
			const data = (await res.json()) as CheckGuessResponse | { error: string };
			if (!res.ok || "error" in data) return;

			dispatch({ type: "guessResult", guess, outcome: data.result, correctName: data.name, clubNames: data.clubNames });
		} catch {
			// Network error mid-question: nothing to apply, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function nextQuestion() {
		dispatch({ type: "next" });
	}

	function resetGame() {
		setLoadError(null);
		dispatch({ type: "reset" });
	}

	return (
		<div className="screen">
			{state.phase === "setup" && (
				<>
					<ClubBadgesPlayers onStart={startGame} onBack={onBack} />
					{loadError && <p className="mp-setup__error">{loadError}</p>}
				</>
			)}
			{state.phase === "playing" && (
				<ClubBadgesPlay state={state} onGuess={submitGuess} onNext={nextQuestion} submitting={submitting} onQuit={resetGame} />
			)}
			{state.phase === "finished" && <ClubBadgesResult state={state} onPlayAgain={resetGame} />}
		</div>
	);
}

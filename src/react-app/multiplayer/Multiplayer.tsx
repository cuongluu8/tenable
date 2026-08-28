import { useReducer, useState } from "react";
import "./multiplayer.css";
import { MultiplayerSetup } from "./MultiplayerSetup";
import { MultiplayerPlay } from "./MultiplayerPlay";
import { MultiplayerResult } from "./MultiplayerResult";
import { multiplayerReducer, initialMpState, type MpCategory } from "./state";

interface CheckGuessResponse {
	result: "correct" | "duplicate" | "wrong";
	rank?: number;
	name?: string;
	statValue?: string;
}

interface Props {
	onBack: () => void;
}

// Top-level owner of the whole single-device pass-and-play flow — see
// src/react-app/multiplayer/state.ts for why all game state lives here as
// plain React state rather than anything server-persisted. The only network
// call this makes is the one stateless guess-check per turn.
export function Multiplayer({ onBack }: Props) {
	const [state, dispatch] = useReducer(multiplayerReducer, initialMpState);
	const [submitting, setSubmitting] = useState(false);

	function startGame(category: MpCategory, playerNames: string[]) {
		dispatch({ type: "start", category, playerNames });
	}

	async function submitGuess(guess: string) {
		if (!state.category || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/multiplayer/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ categorySlug: state.category.slug, guess, foundRanks: state.foundRanks }),
			});
			const data = (await res.json()) as CheckGuessResponse | { error: string };
			if (!res.ok || "error" in data) return;

			dispatch({
				type: "guessResult",
				guess,
				result: data.result,
				rank: data.rank,
				name: data.name,
				statValue: data.statValue,
			});
		} catch {
			// Network error mid-round: nothing to apply, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	// Passing is purely a client-side turn transition — no guess to check, so
	// no network round trip, unlike submitGuess above.
	function passTurn() {
		dispatch({ type: "pass" });
	}

	return (
		<div className="screen">
			{state.phase === "setup" && (
				<>
					<button type="button" className="back-link" onClick={onBack}>
						← Back
					</button>
					<MultiplayerSetup onStart={startGame} />
				</>
			)}
			{state.phase === "playing" && (
				<MultiplayerPlay
					state={state}
					onGuess={submitGuess}
					onPass={passTurn}
					submitting={submitting}
					onQuit={() => dispatch({ type: "reset" })}
				/>
			)}
			{state.phase === "finished" && (
				<MultiplayerResult state={state} onPlayAgain={() => dispatch({ type: "reset" })} />
			)}
		</div>
	);
}

import { useEffect, useReducer, useState } from "react";
import "./multiplayer.css";
import { MultiplayerSetup } from "./MultiplayerSetup";
import { MultiplayerPlay } from "./MultiplayerPlay";
import { MultiplayerResult } from "./MultiplayerResult";
import { multiplayerReducer, initialMpState, type MpCategory } from "./state";
import type { RevealAnswer } from "../types";

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
	// Full answer list, fetched once the round ends — see
	// MultiplayerResult.tsx, which shows it alongside the found/missed grid
	// the same way single-player's PlayScreen does. null before the fetch
	// resolves (or if it fails); the result screen just shows found answers
	// only in that case, same as it did before this existed.
	const [revealed, setRevealed] = useState<RevealAnswer[] | null>(null);

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

	// Passing is a client-side turn transition (costs a life, same as a wrong
	// guess — see state.ts) — no guess to check, so no network round trip,
	// unlike submitGuess above.
	function passTurn() {
		dispatch({ type: "pass" });
	}

	// Fetches the full answer list exactly once, right when the round
	// finishes, so the result screen can show what everyone missed.
	useEffect(() => {
		if (state.phase !== "finished" || !state.category) return;
		let cancelled = false;
		fetch(`/api/multiplayer/reveal/${state.category.slug}`)
			.then((res) => (res.ok ? (res.json() as Promise<{ answers: RevealAnswer[] }>) : null))
			.then((data) => {
				if (!cancelled && data) setRevealed(data.answers);
			})
			.catch(() => {
				// Result screen still works without the reveal — see its found-only
				// fallback.
			});
		return () => {
			cancelled = true;
		};
		// state.category is included for the lint rule, not because it actually
		// changes while phase stays "finished" — a round's category is fixed
		// once "start" sets it, and only "reset" (which also flips phase back
		// to "setup") ever clears it — so this still only re-fetches on the
		// real phase transition into "finished".
	}, [state.phase, state.category]);

	// Shared by both "quit mid-round" and "play again" — either way, the next
	// round's reveal (if it gets that far) needs to start from a clean slate,
	// not the previous round's answer list.
	function resetGame() {
		setRevealed(null);
		dispatch({ type: "reset" });
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
				<MultiplayerPlay state={state} onGuess={submitGuess} onPass={passTurn} submitting={submitting} onQuit={resetGame} />
			)}
			{state.phase === "finished" && (
				<MultiplayerResult state={state} revealed={revealed} onPlayAgain={resetGame} />
			)}
		</div>
	);
}

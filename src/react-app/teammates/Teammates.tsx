import { useCallback, useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../clubBadges/clubBadges.css";
import "./teammates.css";
import { ClubBadgesPlay } from "../clubBadges/ClubBadgesPlay";
import { ClubBadgesResult } from "../clubBadges/ClubBadgesResult";
import { clubBadgesReducer, initialCbState, MAX_WRONG_LIVES, type CbQuestion } from "../clubBadges/state";

// "Who am I? I played with..." single-player mode. Structurally a sibling
// of GuessThePlayer.tsx: fetch a round, drive clubBadgesReducer, render
// ClubBadgesPlay + ClubBadgesResult. The ONLY differences from club-badges
// are the network endpoints and the middle of the play screen -- three-to-
// six teammate clue cards instead of a badge chain, passed to
// ClubBadgesPlay as its `middle` slot. Everything else (lives, timer,
// guess box, two-step give-up, reveal + score chip, round-over screen) is
// the exact same components, so the two solo modes play identically.

interface Clue {
	name: string;
	country: string | null;
}
interface RoundQuestion {
	id: number;
	teammates: Clue[];
}
interface RoundResponse {
	questions: RoundQuestion[];
}
interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

interface Props {
	onExit: () => void;
}

// A teammates question carries no badge chain -- the reducer/ClubBadgesPlay
// only ever read `id` off it here (badges/hints are replaced by the
// `middle` slot + hideHints), so the rest is filled with the empty values
// their types demand.
function toCbQuestion(q: RoundQuestion): CbQuestion {
	return { id: q.id, badges: [], nationality: null, transferDates: [], loanMoves: [] };
}

export function Teammates({ onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	// Clue cards per question, index-aligned with state.questions -- the
	// only teammates-specific data ClubBadgesPlay's `middle` slot needs.
	const [clueSets, setClueSets] = useState<Clue[][]>([]);

	const startRound = useCallback(async () => {
		setLoadError(null);
		try {
			const res = await fetch("/api/teammates/round");
			const data = (await res.json()) as RoundResponse | { error: string };
			if (!res.ok || "error" in data || data.questions.length === 0) {
				setLoadError("Couldn't load a round right now — try again in a moment.");
				return;
			}
			setClueSets(data.questions.map((q) => q.teammates));
			dispatch({ type: "start", playerNames: ["You"], questions: data.questions.map(toCbQuestion) });
		} catch {
			setLoadError("Couldn't load a round right now — try again in a moment.");
		}
	}, []);

	useEffect(() => {
		startRound();
	}, [startRound]);

	// Identical shape to GuessThePlayer.tsx's checkQuestion, just a
	// different endpoint -- a wrong guess with a life still to spare is a
	// "wrongAttempt" (keep guessing), anything else a "guessResult".
	async function checkQuestion(body: { guess: string } | { giveUp: true }, points: number) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/teammates/check-guess", {
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
			// Network error mid-question: nothing applied, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function submitGuess(guess: string, points: number) {
		return checkQuestion({ guess }, points);
	}
	function giveUp(points: number) {
		return checkQuestion({ giveUp: true }, points);
	}
	function nextQuestion() {
		dispatch({ type: "next" });
	}
	function playAgain() {
		dispatch({ type: "reset" });
		startRound();
	}

	const clues = clueSets[state.questionIndex] ?? [];

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
					hideHints
					soloBanner="Who am I?"
					middle={
						<>
							<p className="tm-sub">I played with…</p>
							<ul className="tm-clues">
								{clues.map((c, i) => (
									<li key={i} className="tm-clue">
										<span className="tm-clue__name">{c.name}</span>
										{c.country && <span className="tm-clue__country">{c.country}</span>}
									</li>
								))}
							</ul>
						</>
					}
				/>
			)}
			{state.phase === "finished" && <ClubBadgesResult state={state} onPlayAgain={playAgain} onExit={onExit} />}
		</div>
	);
}

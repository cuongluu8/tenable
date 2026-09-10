import { useCallback, useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../clubBadges/clubBadges.css";
import "./teammates.css";
import { ClubBadgesPlay } from "../clubBadges/ClubBadgesPlay";
import { ClubBadgesResult } from "../clubBadges/ClubBadgesResult";
import { shareTeammatesViaWhatsApp } from "./shareTeammates";
import { clubBadgesReducer, initialCbState, MAX_WRONG_LIVES, type CbQuestion } from "../clubBadges/state";

// "Who am I? I played with..." single-player mode. Structurally a sibling
// of GuessThePlayer.tsx: fetch a round, drive clubBadgesReducer, render
// ClubBadgesPlay + ClubBadgesResult. The ONLY differences from club-badges
// are the network endpoints and the middle of the play screen -- three-to-
// six teammate clue cards instead of a badge chain, passed to
// ClubBadgesPlay as its `middle` slot. Everything else (lives, timer,
// guess box, two-step give-up, reveal + score chip, round-over screen) is
// the exact same components, so the two solo modes play identically.

interface CardHint {
	club: string;
	image: string | null; // ready /api/media URL, or null if no badge sourced
	years: string; // overlap years, e.g. "2019–2021" / "2021–present"
}
interface RoundQuestion {
	id: number;
	teammates: string[]; // clue names only -- club/nationality/years are hints
	cardHints: CardHint[]; // hints 1 & 3 -- shown in each clue's card, same order as teammates
	nationality: string | null; // hint 2 -- shown as text below
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
// `middle` slot + extraHints), so the rest is filled with the empty values
// their types demand.
function toCbQuestion(q: RoundQuestion): CbQuestion {
	return { id: q.id, badges: [], nationality: null, transferDates: [], loanMoves: [] };
}

export function Teammates({ onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	// Per question, index-aligned with state.questions: the clue names (for
	// ClubBadgesPlay's `middle` slot) and the raw hint pieces (assembled
	// into ClubBadgesPlay's `extraHints` nodes at render).
	const [clueSets, setClueSets] = useState<string[][]>([]);
	const [hintData, setHintData] = useState<Pick<RoundQuestion, "cardHints" | "nationality">[]>([]);
	// Running score total this round -- the reducer only tracks a correct
	// COUNT (state.players[0].correct), not points, so accumulate it here
	// for the WhatsApp share text.
	const [totalPoints, setTotalPoints] = useState(0);

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
			setHintData(
				data.questions.map((q) => ({ cardHints: q.cardHints, nationality: q.nationality })),
			);
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
			if (data.result === "correct") setTotalPoints((p) => p + points);
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
		setTotalPoints(0);
		startRound();
	}

	const clues = clueSets[state.questionIndex] ?? [];
	// The ordered hints for the current question. Hints 1 (club + badge)
	// and 3 (overlap years) are `null` here -- their content goes INTO the
	// clue cards (the `middle` render prop below), not a list underneath,
	// but each null still counts as a hint press (and -15). Only hint 2
	// (the mystery player's country) renders as text, and it's skipped
	// entirely if the country isn't on record -- so a question is 3 hints
	// normally, 2 without a country. No hint data -> no hints.
	const hd = hintData[state.questionIndex];
	const hints: React.ReactNode[] = hd
		? [null, ...(hd.nationality ? [`They represent ${hd.nationality}`] : []), null]
		: [];

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
					soloBanner="Who am I?"
					extraHints={hints}
					middle={(hintsRevealed) => (
						<>
							<p className="tm-sub">I played with…</p>
							<ul className="tm-clues">
								{clues.map((name, i) => {
									const card = hd?.cardHints[i];
									// Hint 1 -> club + badge in the card; hint 3 (the
									// last hint) -> add the overlap years after it.
									const showClub = hintsRevealed >= 1;
									const showYears = hints.length > 0 && hintsRevealed >= hints.length;
									return (
										<li key={i} className="tm-clue">
											<span className="tm-clue__name">{name}</span>
											{card && (showClub || showYears) && (
												<span className="tm-clue__meta">
													{showClub && (
														<>
															{card.image && (
																<img src={card.image} alt="" className="tm-clue__badge" />
															)}
															{card.club}
														</>
													)}
													{showYears && <span className="tm-clue__years">{card.years}</span>}
												</span>
											)}
										</li>
									);
								})}
							</ul>
						</>
					)}
				/>
			)}
			{state.phase === "finished" && (
				<ClubBadgesResult
					state={state}
					onPlayAgain={playAgain}
					onExit={onExit}
					onShare={() =>
						// questionIndex + 1 = questions actually played (a round
						// ends early when the 5 lives run out) -- matches the
						// "X / N correct" the result screen shows.
						shareTeammatesViaWhatsApp(state.players[0].correct, state.questionIndex + 1, totalPoints)
					}
				/>
			)}
		</div>
	);
}

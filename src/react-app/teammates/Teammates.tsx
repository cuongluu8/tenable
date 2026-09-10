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

interface ClubClue {
	name: string;
	club: string;
	image: string | null; // ready /api/media URL, or null if no badge sourced
}
interface RoundQuestion {
	id: number;
	teammates: string[]; // clue names only -- club/nationality/years are hints
	clubHint: ClubClue[]; // hint 1: each clue's club, with badge
	nationality: string | null; // hint 2
	yearHint: string; // hint 3, pre-joined
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
	const [hintData, setHintData] = useState<Pick<RoundQuestion, "clubHint" | "nationality" | "yearHint">[]>([]);
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
				data.questions.map((q) => ({ clubHint: q.clubHint, nationality: q.nationality, yearHint: q.yearHint })),
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
	// Build the 3 ordered hint nodes for the current question: (1) each
	// clue's club with its badge inline, (2) the mystery player's country,
	// (3) the overlap years. Hint 2 is skipped if the country isn't on
	// record; a question with no hint data at all yields [].
	const hd = hintData[state.questionIndex];
	const hints: React.ReactNode[] = hd
		? [
				<span className="tm-hint-clubs">
					{hd.clubHint.map((c, i) => (
						<span key={i} className="tm-hint-club">
							{c.image && <img src={c.image} alt="" className="tm-hint-badge" />}
							{c.name} — {c.club}
						</span>
					))}
				</span>,
				...(hd.nationality ? [`They represent ${hd.nationality}`] : []),
				hd.yearHint,
			]
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
					middle={
						<>
							<p className="tm-sub">I played with…</p>
							<ul className="tm-clues">
								{clues.map((name, i) => (
									<li key={i} className="tm-clue">
										{name}
									</li>
								))}
							</ul>
						</>
					}
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

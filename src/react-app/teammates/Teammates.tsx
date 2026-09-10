import { useEffect, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import { computeScore, scoreBand, MAX_WRONG_LIVES } from "../clubBadges/state";
import "../multiplayer/multiplayer.css";
import "../clubBadges/clubBadges.css";
import "./teammates.css";

// "Who am I? I played with..." -- single-player mode. A round is 10 mystery
// players, each shown only by three well-known former teammates (see
// db/schema.sql's teammate_questions + build_teammate_questions.py for how
// those are derived, fail-closed). Guess who it is.
//
// The screen chrome here is deliberately the SAME as club-badges'
// ClubBadgesPlay.tsx -- same .cb-play wrapper, .cb-progress line,
// LivesIndicator, .cb-turn-banner, .cb-timer, two-step give-up confirm,
// .cb-reveal block with a score chip, .cb-next-button, and the shared
// .wrong-guesses list -- so the two solo modes feel identical to play.
// Only the middle (three teammate clue cards vs. a badge chain) differs.
// The lives budget is round-wide and ends the round early when spent,
// matching solo club-badges (state.ts's MAX_WRONG_LIVES doc); wrongGuesses
// clears per question.

interface Clue {
	name: string;
	country: string | null;
}
interface Question {
	id: number;
	teammates: Clue[];
}
interface RoundResponse {
	questions: Question[];
}
interface CheckResponse {
	result: "correct" | "wrong";
	name: string;
}

// m:ss -- same helper (and same look) as ClubBadgesPlay.tsx's own timer.
function formatElapsed(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface Props {
	onExit: () => void;
}

export function Teammates({ onExit }: Props) {
	const [questions, setQuestions] = useState<Question[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [index, setIndex] = useState(0);
	const [guessInput, setGuessInput] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
	// Round-wide, like solo club-badges -- not reset between questions.
	const [wrongCount, setWrongCount] = useState(0);
	// Per-question -- the names tried on THIS question, cleared on "next".
	const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [totalPoints, setTotalPoints] = useState(0);
	// null while the current question is unanswered; set once it's graded.
	const [result, setResult] = useState<
		{ outcome: "correct" | "wrong"; gaveUp: boolean; outOfLives: boolean; name: string; points: number } | null
	>(null);

	async function loadRound() {
		setLoadError(null);
		setQuestions(null);
		setIndex(0);
		setGuessInput("");
		setConfirmingGiveUp(false);
		setWrongCount(0);
		setWrongGuesses([]);
		setElapsedSeconds(0);
		setCorrectCount(0);
		setTotalPoints(0);
		setResult(null);
		try {
			const res = await fetch("/api/teammates/round");
			const data = (await res.json()) as RoundResponse | { error: string };
			if (!res.ok || "error" in data || data.questions.length === 0) {
				setLoadError("Couldn't load a round right now — try again in a moment.");
				return;
			}
			setQuestions(data.questions);
		} catch {
			setLoadError("Couldn't load a round right now — try again in a moment.");
		}
	}

	useEffect(() => {
		loadRound();
	}, []);

	// Ticks once a second while the current question is still open; frozen
	// the instant it's answered, and restarted (from 0) when the question
	// changes -- same shape as ClubBadgesPlay.tsx's timer effect.
	useEffect(() => {
		if (result) return;
		const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
		return () => clearInterval(id);
	}, [index, result]);

	const current = questions?.[index];
	const isLastQuestion = questions ? index === questions.length - 1 : false;
	// The round ends when the last question is answered, or the moment the
	// round-wide life budget is spent -- exactly solo club-badges.
	const roundOver = !!result && (isLastQuestion || result.outOfLives);

	async function grade(body: { guess: string } | { giveUp: true }) {
		if (!current || submitting || result) return;
		setSubmitting(true);
		try {
			const points = computeScore(elapsedSeconds, 0); // no hints in this mode (yet)
			const res = await fetch("/api/teammates/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionId: current.id, ...body }),
			});
			const data = (await res.json()) as CheckResponse | { error: string };
			if (!res.ok || "error" in data) return;

			const gaveUp = !("guess" in body);
			// A wrong guess with a life still to spare doesn't end the
			// question -- decrement, remember it, keep guessing. Only a
			// correct guess, a give-up, or the guess that spends the last
			// life reveals the answer. Mirrors GuessThePlayer.tsx's own
			// `retryable` check.
			const survivable = !gaveUp && data.result === "wrong" && wrongCount + 1 < MAX_WRONG_LIVES;
			if (survivable) {
				setWrongCount((n) => n + 1);
				setWrongGuesses((g) => [...g, "guess" in body ? body.guess : ""]);
				setGuessInput("");
				return;
			}

			const isWrong = data.result === "wrong";
			if (isWrong) setWrongCount((n) => n + 1);
			if (isWrong && !gaveUp) setWrongGuesses((g) => [...g, "guess" in body ? body.guess : ""]);
			if (data.result === "correct") {
				setCorrectCount((n) => n + 1);
				setTotalPoints((p) => p + points);
			}
			setResult({
				outcome: data.result,
				gaveUp,
				outOfLives: isWrong && wrongCount + 1 >= MAX_WRONG_LIVES,
				name: data.name,
				points,
			});
		} catch {
			// Network hiccup: nothing applied, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function pick(name: string) {
		setGuessInput(name);
		grade({ guess: name });
		setGuessInput("");
	}

	function next() {
		setConfirmingGiveUp(false);
		setResult(null);
		setGuessInput("");
		setWrongGuesses([]);
		setElapsedSeconds(0);
		setIndex((i) => i + 1);
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onExit}>
					← Back
				</button>
				<p className="mp-setup__error">{loadError}</p>
				<button type="button" onClick={loadRound}>
					Try again
				</button>
			</div>
		);
	}

	if (!questions || !current) {
		return (
			<div className="screen">
				<p>Loading a round…</p>
			</div>
		);
	}

	return (
		<div className="cb-play">
			<button type="button" className="back-link" onClick={onExit}>
				← New game
			</button>

			<p className="cb-progress">
				Question {index + 1} of {questions.length}
			</p>

			<LivesIndicator total={MAX_WRONG_LIVES} remaining={MAX_WRONG_LIVES - wrongCount} />

			<p className="cb-turn-banner">Who am I?</p>
			<p className="tm-sub">I played with…</p>

			<p className="cb-timer">⏱ {formatElapsed(elapsedSeconds)}</p>

			<ul className="tm-clues">
				{current.teammates.map((t, i) => (
					<li key={i} className="tm-clue">
						<span className="tm-clue__name">{t.name}</span>
						{t.country && <span className="tm-clue__country">{t.country}</span>}
					</li>
				))}
			</ul>

			{!result ? (
				<>
					<GuessInput
						value={guessInput}
						onChange={setGuessInput}
						onPick={pick}
						disabled={submitting}
						suggestUrl="/api/club-badges/suggest"
						excludeNames={wrongGuesses}
					/>
					{confirmingGiveUp ? (
						<div className="give-up-confirm">
							<span>Give up on this one?</span>
							<button
								type="button"
								className="give-up-confirm__yes"
								onClick={() => grade({ giveUp: true })}
								disabled={submitting}
							>
								Yes, give up
							</button>
							<button
								type="button"
								className="give-up-confirm__cancel"
								onClick={() => setConfirmingGiveUp(false)}
								disabled={submitting}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							type="button"
							className="give-up-link"
							onClick={() => setConfirmingGiveUp(true)}
							disabled={submitting}
						>
							Give up
						</button>
					)}
				</>
			) : (
				<div className="cb-reveal">
					<p className={result.outcome === "correct" ? "cb-reveal__correct" : "cb-reveal__wrong"}>
						{result.outcome === "correct"
							? `✅ Correct! It was ${result.name}`
							: result.gaveUp
								? `It was ${result.name}`
								: result.outOfLives
									? `❌ Not quite — out of guesses. It was ${result.name}`
									: `❌ Not quite — it was ${result.name}`}
					</p>
					{result.outcome === "correct" && (
						<p className={`cb-score cb-score--${scoreBand(result.points)}`}>{result.points} points</p>
					)}
					{roundOver ? (
						<>
							<p className="tm-final">
								Round over — {correctCount} of {questions.length} correct, {totalPoints} points.
							</p>
							<button type="button" className="cb-next-button" onClick={loadRound}>
								Play again
							</button>
						</>
					) : (
						<button type="button" className="cb-next-button" onClick={next}>
							Next question
						</button>
					)}
				</div>
			)}

			{wrongGuesses.length > 0 && (
				<div className="wrong-guesses" aria-live="polite">
					<h4 className="wrong-guesses__heading">Incorrect guesses</h4>
					<ul className="wrong-guesses__list">
						{wrongGuesses.map((name, i) => (
							<li key={`${name}-${i}`}>{name}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

import { useEffect, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import "../multiplayer/multiplayer.css";
import "../clubBadges/clubBadges.css";
import "./teammates.css";

// "Who am I? I played with..." -- single-player example mode. A round is
// 10 mystery players, each shown only by three well-known former teammates
// (see db/schema.sql's teammate_questions + build_teammate_questions.py for
// how those are derived, fail-closed). Guess the mystery player.
//
// Deliberately lean: no timer, no score bands, just a correct/seen tally --
// this is a worked example of the format, not (yet) the full treatment the
// club-badges mode has.

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

interface Props {
	onExit: () => void;
}

export function Teammates({ onExit }: Props) {
	const [questions, setQuestions] = useState<Question[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [index, setIndex] = useState(0);
	const [guess, setGuess] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
	// null while unanswered; set once graded (right, wrong, or gave up).
	const [result, setResult] = useState<{ outcome: "correct" | "wrong"; gaveUp: boolean; name: string } | null>(null);
	const [correctCount, setCorrectCount] = useState(0);

	async function loadRound() {
		setLoadError(null);
		setQuestions(null);
		setIndex(0);
		setGuess("");
		setResult(null);
		setCorrectCount(0);
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

	const current = questions?.[index];
	const isLast = questions ? index === questions.length - 1 : false;

	async function grade(body: { guess: string } | { giveUp: true }) {
		if (!current || submitting || result) return;
		setSubmitting(true);
		try {
			const res = await fetch("/api/teammates/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionId: current.id, ...body }),
			});
			const data = (await res.json()) as CheckResponse | { error: string };
			if (!res.ok || "error" in data) return;
			const gaveUp = !("guess" in body);
			setResult({ outcome: data.result, gaveUp, name: data.name });
			if (data.result === "correct") setCorrectCount((n) => n + 1);
		} catch {
			// Network hiccup: nothing applied, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function pick(name: string) {
		setGuess("");
		grade({ guess: name });
	}

	function next() {
		setConfirmingGiveUp(false);
		setResult(null);
		setGuess("");
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

	const roundOver = result && isLast;

	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onExit}>
				← New game
			</button>

			<p className="cb-progress">
				Question {index + 1} of {questions.length} · {correctCount} correct
			</p>

			<h2 className="tm-heading">Who am I?</h2>
			<p className="tm-sub">I played with…</p>

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
						value={guess}
						onChange={setGuess}
						onPick={pick}
						disabled={submitting}
						suggestUrl="/api/club-badges/suggest"
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
								: `❌ Not quite — it was ${result.name}`}
					</p>
					{roundOver ? (
						<>
							<p className="tm-final">
								You got {correctCount} of {questions.length}.
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
		</div>
	);
}

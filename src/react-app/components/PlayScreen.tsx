import { useEffect, useMemo, useState } from "react";
import { AnswerGrid } from "./AnswerGrid";
import { GuessInput } from "./GuessInput";
import { LivesIndicator } from "./LivesIndicator";
import { formatAsOfDate } from "../lib/formatAsOfDate";
import type {
	Category,
	CategoryResponse,
	GiveUpResponse,
	GuessResponse,
	Mode,
	Progress,
	RevealAnswer,
	Streak,
} from "../types";

const TENSION_LIVES = 5;

interface Props {
	slug: string;
	onBack: () => void;
}

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; category: Category };

export function PlayScreen({ slug, onBack }: Props) {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [progress, setProgress] = useState<Progress | null>(null);
	const [streak, setStreak] = useState<Streak | null>(null);
	const [found, setFound] = useState<Map<number, { name: string; statValue: string }>>(
		new Map(),
	);
	const [revealed, setRevealed] = useState<RevealAnswer[] | null>(null);
	const [guessInput, setGuessInput] = useState("");
	const [feedback, setFeedback] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	// Names picked from the suggestion list that turned out wrong — client-side
	// only (not part of the persisted Progress), so it resets on reload same as
	// `feedback` does; the point is to show them during this sitting, not to
	// survive a refresh.
	const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
	// Give-up is destructive (throws away an in-progress round) and one
	// misclick away from the guess input, so it asks for a second tap before
	// actually calling the API — see the give-up-confirm render below.
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

	useEffect(() => {
		fetch(`/api/categories/${slug}`)
			.then((res) => {
				if (!res.ok) throw new Error("Couldn't load that category");
				return res.json() as Promise<CategoryResponse>;
			})
			.then((data) => {
				setLoad({ status: "ready", category: data.category });
				setProgress(data.progress);
				setFound(new Map(data.foundAnswers.map((a) => [a.rank, a])));
			})
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, [slug]);

	useEffect(() => {
		if (progress?.completed) {
			fetch(`/api/reveal/${slug}`)
				.then((res) => (res.ok ? (res.json() as Promise<{ answers: RevealAnswer[] }>) : null))
				.then((data) => data && setRevealed(data.answers))
				.catch(() => {});
		}
	}, [slug, progress?.completed]);

	if (load.status === "loading") {
		return <div className="screen">Loading…</div>;
	}
	if (load.status === "error") {
		return (
			<div className="screen">
				<p>{load.message}</p>
				<button onClick={onBack}>Back to categories</button>
			</div>
		);
	}

	const { category } = load;

	function startMode(mode: Mode) {
		setFeedback(null);
		setWrongGuesses([]);
		setConfirmingGiveUp(false);
		setProgress({
			mode,
			foundRanks: [],
			wrongGuesses: 0,
			completed: false,
			won: false,
			completedAt: null,
		});
	}

	async function doGuess(guessText: string) {
		if (!guessText.trim() || !progress || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, guess: guessText, mode: progress.mode }),
			});
			const data = (await res.json()) as GuessResponse | { error: string };

			if (!res.ok || "error" in data) {
				setFeedback("error" in data ? data.error : "Something went wrong");
				return;
			}

			setProgress(data.progress);
			if (data.streak) setStreak(data.streak);

			if (data.result === "correct" && data.found) {
				setFound((prev) => new Map(prev).set(data.found!.rank, {
					name: data.found!.name,
					statValue: data.found!.statValue,
				}));
				setFeedback(`✅ #${data.found.rank} — ${data.found.name}`);
			} else if (data.result === "duplicate") {
				setFeedback("Already found that one.");
			} else {
				setFeedback("❌ Not on the list.");
				setWrongGuesses((prev) => [...prev, guessText]);
			}
			setGuessInput("");
		} catch {
			setFeedback("Network error — try again.");
		} finally {
			setSubmitting(false);
		}
	}

	// Picking a suggestion skips typing entirely: fill it in and submit
	// straight away, since avoiding a typo is the whole point of picking one.
	// This is now the *only* way to submit a guess — see GuessInput/App.tsx's
	// removed submit button: forcing a pick from the list (click, or Enter on
	// a highlighted option) means every guess resolves to a real reference-pool
	// name server-side, not arbitrary typed text.
	function pickSuggestion(name: string) {
		setGuessInput(name);
		doGuess(name);
	}

	async function giveUp() {
		if (!progress || progress.completed || submitting) return;

		setConfirmingGiveUp(false);
		setSubmitting(true);
		try {
			const res = await fetch("/api/give-up", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug }),
			});
			const data = (await res.json()) as GiveUpResponse | { error: string };

			if (!res.ok || "error" in data) {
				setFeedback("error" in data ? data.error : "Something went wrong");
				return;
			}

			setProgress(data.progress);
			setStreak(data.streak);
			setFeedback(null);
		} catch {
			setFeedback("Network error — try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="screen">
			<button className="back-link" onClick={onBack}>
				← All categories
			</button>

			<section className="category">
				<h2>{category.title}</h2>
				{category.subtitle && <p className="category__subtitle">{category.subtitle}</p>}
				{formatAsOfDate(category.asOfDate) && (
					<p className="category__as-of">{formatAsOfDate(category.asOfDate)}</p>
				)}
			</section>

			{streak && streak.current > 0 && <p className="streak">🔥 {streak.current}-day streak</p>}

			{!progress ? (
				<ModePicker onPick={startMode} />
			) : (
				<>
					{progress.mode === "tension" && !progress.completed && (
						<LivesIndicator
							total={TENSION_LIVES}
							remaining={TENSION_LIVES - progress.wrongGuesses}
						/>
					)}

					<AnswerGrid
						answerCount={category.answerCount}
						statLabel={category.statLabel}
						progress={progress}
						revealed={revealed}
						found={found}
					/>

					{!progress.completed ? (
						<div className="guess-form">
							<GuessInput
								value={guessInput}
								onChange={setGuessInput}
								onPick={pickSuggestion}
								disabled={submitting}
								categorySlug={slug}
								excludeNames={Array.from(found.values(), (a) => a.name)}
							/>
							{confirmingGiveUp ? (
								<div className="give-up-confirm">
									<span>Give up on this round?</span>
									<button
										type="button"
										className="give-up-confirm__yes"
										onClick={giveUp}
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
						</div>
					) : (
						<ResultPanel progress={progress} category={category} onBack={onBack} />
					)}

					{feedback && <p className="feedback">{feedback}</p>}

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
				</>
			)}
		</div>
	);
}

function ModePicker({ onPick }: { onPick: (mode: Mode) => void }) {
	return (
		<div className="mode-picker">
			<button className="mode-button" onClick={() => onPick("classic")}>
				<strong>Classic</strong>
				<span>Unlimited guesses</span>
			</button>
			<button className="mode-button" onClick={() => onPick("tension")}>
				<strong>Tension</strong>
				<span>5 lives — one wrong guess too many and it's over</span>
			</button>
		</div>
	);
}

function ResultPanel({
	progress,
	category,
	onBack,
}: {
	progress: Progress;
	category: Category;
	onBack: () => void;
}) {
	const shareText = useMemo(() => buildShareText(progress, category), [progress, category]);
	const [copied, setCopied] = useState(false);

	return (
		<div className="result-panel">
			<h3>{progress.won ? "🎉 You got all 10!" : "Round over"}</h3>
			<p>
				{progress.foundRanks.length} / {category.answerCount} found
				{progress.mode === "tension" && ` · ${progress.wrongGuesses} wrong guesses`}
			</p>
			<div className="result-panel__actions">
				<button
					onClick={() => {
						navigator.clipboard?.writeText(shareText).then(() => {
							setCopied(true);
							setTimeout(() => setCopied(false), 2000);
						});
					}}
				>
					{copied ? "Copied!" : "Share result"}
				</button>
				<button onClick={onBack}>More categories</button>
			</div>
		</div>
	);
}

function buildShareText(progress: Progress, category: Category): string {
	const grid = Array.from({ length: category.answerCount }, (_, i) =>
		progress.foundRanks.includes(i + 1) ? "🟩" : "⬜",
	).join("");
	const modeLabel = progress.mode === "tension" ? "Tension" : "Classic";
	return `Tenable — ${category.title}\n${modeLabel}: ${progress.foundRanks.length}/${category.answerCount}\n${grid}`;
}

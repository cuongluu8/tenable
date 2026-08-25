import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { AnswerGrid } from "./components/AnswerGrid";
import { LivesIndicator } from "./components/LivesIndicator";
import type {
	DailyResponse,
	GuessResponse,
	Mode,
	Progress,
	RevealAnswer,
	Streak,
} from "./types";

const TENSION_LIVES = 5;

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; data: DailyResponse };

function App() {
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

	useEffect(() => {
		fetch("/api/daily")
			.then((res) => {
				if (!res.ok) throw new Error("No puzzle available today");
				return res.json() as Promise<DailyResponse>;
			})
			.then((data) => {
				setLoad({ status: "ready", data });
				setProgress(data.progress);
				setStreak(data.streak);
			})
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, []);

	useEffect(() => {
		if (progress?.completed) {
			fetch("/api/reveal")
				.then((res) => (res.ok ? (res.json() as Promise<{ answers: RevealAnswer[] }>) : null))
				.then((data) => data && setRevealed(data.answers))
				.catch(() => {});
		}
	}, [progress?.completed]);

	if (load.status === "loading") {
		return <div className="screen">Loading today's puzzle…</div>;
	}
	if (load.status === "error") {
		return <div className="screen">Couldn't load today's puzzle: {load.message}</div>;
	}

	const { category } = load.data;

	async function startMode(mode: Mode) {
		setFeedback(null);
		// Kicked off by submitting an empty-ish guess would be wrong; instead
		// we just seed local progress and let the first real guess create the
		// server-side record with this mode.
		setProgress({
			mode,
			foundRanks: [],
			wrongGuesses: 0,
			completed: false,
			won: false,
			completedAt: null,
		});
	}

	async function submitGuess(e: React.FormEvent) {
		e.preventDefault();
		if (!guessInput.trim() || !progress || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ guess: guessInput, mode: progress.mode }),
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
			}
			setGuessInput("");
		} catch {
			setFeedback("Network error — try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="screen">
			<header className="header">
				<h1>Tenable</h1>
				<p className="subtitle">Top 10 football trivia</p>
				{streak && streak.current > 0 && (
					<p className="streak">🔥 {streak.current}-day streak</p>
				)}
			</header>

			<section className="category">
				<h2>{category.title}</h2>
				{category.subtitle && <p className="category__subtitle">{category.subtitle}</p>}
			</section>

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
						<form className="guess-form" onSubmit={submitGuess}>
							<input
								type="text"
								value={guessInput}
								onChange={(e) => setGuessInput(e.target.value)}
								placeholder="Type your guess…"
								autoFocus
								disabled={submitting}
							/>
							<button type="submit" disabled={submitting || !guessInput.trim()}>
								Guess
							</button>
						</form>
					) : (
						<ResultPanel progress={progress} category={category} />
					)}

					{feedback && <p className="feedback">{feedback}</p>}
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
}: {
	progress: Progress;
	category: DailyResponse["category"];
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
		</div>
	);
}

function buildShareText(
	progress: Progress,
	category: DailyResponse["category"],
): string {
	const grid = Array.from({ length: category.answerCount }, (_, i) =>
		progress.foundRanks.includes(i + 1) ? "🟩" : "⬜",
	).join("");
	const modeLabel = progress.mode === "tension" ? "Tension" : "Classic";
	return `Tenable — ${category.title}\n${modeLabel}: ${progress.foundRanks.length}/${category.answerCount}\n${grid}`;
}

export default App;

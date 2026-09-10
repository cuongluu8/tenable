import { useEffect, useState } from "react";
import "../components/clubBadges.css";
import { scoreBand } from "../components/clubBadgesState";
import { getSetResults, resetQuestion, resetSet, type SetQuestionResult } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

interface SetSummary {
	id: number;
	name: string;
	questionIds: number[];
}

interface SetsResponse {
	sets: SetSummary[];
}

interface Props {
	// Enters that set's play view -- ClubBadgeSetPlay.tsx, played from the
	// beginning of whatever's left unanswered. onlyQuestionId narrows a
	// session to exactly one question ("Retry" on a single already-
	// answered one below) instead of the whole remaining set.
	onPlay: (setId: number, onlyQuestionId?: number) => void;
	onBack: () => void;
}

// Set picker for club-badges Sets mode (single player only) -- replaces
// the old "random 10 every round" entry point with ten standing, curated
// rounds (see src/worker/lib/clubBadgeSets.ts's own doc on why they're
// ordered the way they are) a player can leave and come back to. All
// progress tracking is local (setsStorage.ts); this page's only network
// call is the one-time /sets index fetch that says which
// club_badge_questions.id sits in which slot of which set.
export function ClubBadgeSets({ onPlay, onBack }: Props) {
	const [sets, setSets] = useState<SetSummary[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	// Re-read fresh after any reset action below -- these aren't derived
	// from React state anywhere else (setsStorage.ts talks to localStorage
	// directly), so nothing else would tell this component to re-render
	// and pick up the change otherwise.
	const [resultsBySet, setResultsBySet] = useState<Record<number, Record<number, SetQuestionResult>>>({});
	const [confirmingResetSetId, setConfirmingResetSetId] = useState<number | null>(null);

	function refreshResults(list: SetSummary[]) {
		const next: Record<number, Record<number, SetQuestionResult>> = {};
		for (const s of list) next[s.id] = getSetResults(s.id);
		setResultsBySet(next);
	}

	useEffect(() => {
		let cancelled = false;
		fetch("/api/club-badges/sets")
			.then((res) => res.json() as Promise<SetsResponse>)
			.then((data) => {
				if (cancelled) return;
				setSets(data.sets);
				refreshResults(data.sets);
			})
			.catch(() => {
				if (!cancelled) setLoadError("Couldn't load sets right now — try again in a moment.");
			});
		return () => {
			cancelled = true;
		};
	}, []);

	function handleResetSet(setId: number) {
		resetSet(setId);
		setConfirmingResetSetId(null);
		if (sets) refreshResults(sets);
	}

	function handleRetryQuestion(setId: number, questionId: number) {
		// Clearing the stored result before entering play isn't strictly
		// necessary (ClubBadgeSetPlay.tsx's own onlyQuestionId path always
		// re-records on completion regardless of any prior entry), but doing
		// it here means the dot immediately shows "not yet answered" if the
		// player backs out of the retry without finishing it, rather than
		// still showing the old result until they actually submit a new one.
		resetQuestion(setId, questionId);
		onPlay(setId, questionId);
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onBack}>
					← Back
				</button>
				<p className="load-error">{loadError}</p>
			</div>
		);
	}

	if (!sets) {
		return (
			<div className="screen">
				<p>Loading sets…</p>
			</div>
		);
	}

	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Guess the player — Sets</h2>
			<p className="cb-sets-intro">
				Ten fixed sets of ten, ordered from well-known players to more obscure ones. Progress is saved on this
				device — come back and finish a set anytime, or retry a question you already answered.
			</p>

			<div className="cb-sets-list">
				{sets.map((set) => {
					const results = resultsBySet[set.id] ?? {};
					const answeredCount = set.questionIds.filter((id) => id in results).length;
					const isComplete = answeredCount === set.questionIds.length;
					const average = isComplete
						? Math.round(set.questionIds.reduce((sum, id) => sum + (results[id]?.points ?? 0), 0) / set.questionIds.length)
						: null;

					return (
						<div key={set.id} className="cb-set-card">
							<div className="cb-set-card__header">
								<span className="cb-set-card__title">
									Set {set.id}: {set.name}
								</span>
								{average !== null ? (
									<span className={`cb-score cb-score--${scoreBand(average)}`}>{average} avg</span>
								) : (
									<span className="cb-set-card__progress">
										{answeredCount} / {set.questionIds.length} answered
									</span>
								)}
							</div>

							<div className="cb-set-dots">
								{set.questionIds.map((id, i) => {
									const result = results[id];
									const dotClass = !result
										? "cb-set-dot--empty"
										: result.outcome === "correct"
											? `cb-set-dot--${scoreBand(result.points)}`
											: "cb-set-dot--wrong";
									return (
										<button
											type="button"
											key={id}
											className={`cb-set-dot ${dotClass}`}
											title={result ? `Question ${i + 1}: ${result.outcome} — click to retry` : `Question ${i + 1}: not yet answered`}
											disabled={!result}
											onClick={() => handleRetryQuestion(set.id, id)}
										>
											{i + 1}
										</button>
									);
								})}
							</div>

							<div className="cb-set-card__actions">
								{/* Hidden once complete rather than offered as some third
								    "replay everything" action -- a completed set's only
								    ways to play again are explicit: retry one question (the
								    dots above) or reset the whole set below, never an
								    implicit wipe-and-restart hiding behind a "Play" button. */}
								{!isComplete && (
									<button type="button" onClick={() => onPlay(set.id)}>
										{answeredCount === 0 ? "Play" : "Resume"}
									</button>
								)}
								{/* Re-share for a set completed in an earlier session --
								    ClubBadgeSetPlay.tsx's own share button only ever shows
								    once, right when a set first becomes complete, so this is
								    the only way back to it afterward. */}
								{average !== null && (
									<button type="button" onClick={() => shareSetViaWhatsApp(set.id, set.name, average)}>
										Share
									</button>
								)}
								{confirmingResetSetId === set.id ? (
									<span className="give-up-confirm">
										<span>Reset this whole set?</span>
										<button type="button" className="give-up-confirm__yes" onClick={() => handleResetSet(set.id)}>
											Yes, reset
										</button>
										<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirmingResetSetId(null)}>
											Cancel
										</button>
									</span>
								) : (
									answeredCount > 0 && (
										<button type="button" className="give-up-link" onClick={() => setConfirmingResetSetId(set.id)}>
											Reset set
										</button>
									)
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

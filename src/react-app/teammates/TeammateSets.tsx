import { useEffect, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../components/clubBadges.css";
import { scoreBand } from "../components/clubBadgesState";
import { getSetResults, resetQuestion, resetSet, type SetQuestionResult } from "./teammateSetsStorage";
import { shareTeammateSetViaWhatsApp } from "./shareTeammates";

interface SetSummary {
	id: number;
	name: string;
	questionIds: number[];
}

interface SetsResponse {
	sets: SetSummary[];
}

interface Props {
	// Enters that set's play view -- TeammateSetPlay.tsx, played from the
	// beginning of whatever's left unanswered. onlyQuestionId narrows a
	// session to exactly one question ("Retry" on a single already-
	// answered one below) instead of the whole remaining set.
	onPlay: (setId: number, onlyQuestionId?: number) => void;
	onBack: () => void;
}

// Set picker for "Who am I?" -- a straight sibling of clubBadges/
// ClubBadgeSets.tsx (that file's doc covers the shared design): eleven
// standing, curated rounds (see src/worker/lib/teammateSets.ts) a player
// leaves and comes back to, all progress tracked locally
// (teammateSetsStorage.ts), the only network call being the one-time
// /sets index fetch mapping each slot to a teammate_questions.id.
export function TeammateSets({ onPlay, onBack }: Props) {
	const [sets, setSets] = useState<SetSummary[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	// Re-read fresh after any reset action -- these aren't derived from
	// React state anywhere else, so nothing would tell this component to
	// re-render and pick up the change otherwise.
	const [resultsBySet, setResultsBySet] = useState<Record<number, Record<number, SetQuestionResult>>>({});
	const [confirmingResetSetId, setConfirmingResetSetId] = useState<number | null>(null);

	function refreshResults(list: SetSummary[]) {
		const next: Record<number, Record<number, SetQuestionResult>> = {};
		for (const s of list) next[s.id] = getSetResults(s.id);
		setResultsBySet(next);
	}

	useEffect(() => {
		let cancelled = false;
		fetch("/api/teammates/sets")
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
		// necessary (TeammateSetPlay.tsx's onlyQuestionId path always
		// re-records on completion), but doing it here means the dot
		// immediately shows "not yet answered" if the player backs out of
		// the retry without finishing it.
		resetQuestion(setId, questionId);
		onPlay(setId, questionId);
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onBack}>
					← Back
				</button>
				<p className="mp-setup__error">{loadError}</p>
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
			<h2>Who am I? — Sets</h2>
			<p className="cb-sets-intro">
				Eleven fixed sets of ten, ordered from well-known players to more obscure ones. Progress is saved on this
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
								{/* Hidden once complete rather than offered as a "replay
								    everything" action -- a completed set's only ways to
								    play again are explicit: retry one question (the dots)
								    or reset the whole set below. */}
								{!isComplete && (
									<button type="button" onClick={() => onPlay(set.id)}>
										{answeredCount === 0 ? "Play" : "Resume"}
									</button>
								)}
								{/* Re-share for a set completed in an earlier session --
								    TeammateSetPlay.tsx's own share button only shows once,
								    right when a set first becomes complete. */}
								{average !== null && (
									<button type="button" onClick={() => shareTeammateSetViaWhatsApp(set.id, set.name, average)}>
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

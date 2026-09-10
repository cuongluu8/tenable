import { useEffect, useReducer, useState } from "react";
import "../components/clubBadges.css";
import "./teammates.css";
import { ClubBadgesPlay } from "../components/ClubBadgesPlay";
import { clubBadgesReducer, initialCbState, MAX_WRONG_LIVES, scoreBand, type CbQuestion } from "../components/clubBadgesState";
import { getSetResults, recordResult } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

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
	setName?: string;
	questions: RoundQuestion[];
}

interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

// One question actually due to be played THIS session, plus its 0-based
// position in the full fixed set (for the "Question 7 of 10" line, which
// has to reflect where it really sits, not its index among however many
// are left to retry now) and the teammates-mode extras the reducer's
// CbQuestion has no room for -- the clue names and per-clue hint data.
interface QueueItem {
	question: CbQuestion;
	clues: string[];
	cardHints: CardHint[];
	nationality: string | null;
	originalIndex: number;
}

interface Props {
	setId: number;
	// When given, play ONLY this one question (its teammate_questions.id)
	// regardless of what else in the set is unanswered -- TeammateSets.tsx's
	// per-question "Retry". Omitted for the normal "Play"/"Resume" path.
	onlyQuestionId?: number;
	// Leaves Sets mode, back to TeammateSets.tsx -- which re-reads
	// setsStorage on its next render, no separate refresh signal.
	onExit: () => void;
}

// Plays through a single "Who am I?" Set, one question at a time -- a
// straight sibling of clubBadges/ClubBadgeSetPlay.tsx (that file's doc
// covers the shared design: each question is its own one-question
// "mini-round" of clubBadgesReducer + ClubBadgesPlay so state.ts's
// per-round lives/retry bookkeeping naturally scopes to the one question,
// with zero changes to state.ts). The only teammates-specific parts are
// the endpoints (/api/teammates/...) and what fills ClubBadgesPlay's
// `middle` slot -- the "I played with..." clue cards instead of a badge
// chain -- plus the mode's own hint nodes (`extraHints`): hint 1 (club +
// badge) and hint 3 (overlap years) render INSIDE each clue card, so
// they're null slots that still cost 15 each; hint 2 (nationality) is the
// only one shown as text.
//
// checkQuestion is a near-duplicate of GuessThePlayer.tsx's version, on
// purpose -- same reasoning as ClubBadgeSetPlay.tsx: this mode is
// single-player only, and leaving the shared round engine untouched beats
// extracting an abstraction just for this.
export function TeammateSetPlay({ setId, onlyQuestionId, onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	// null while the set's question list hasn't loaded -- distinct from an
	// empty array ("nothing left to play").
	const [queue, setQueue] = useState<QueueItem[] | null>(null);
	const [queueIndex, setQueueIndex] = useState(0);
	const [setSize, setSetSize] = useState(0);
	const [setName, setSetName] = useState(`Set ${setId}`);
	// Every question id in the WHOLE set, fixed order, regardless of what's
	// answered -- nextQuestion() needs it to tell "the whole set just
	// became complete" apart from "just this session's queue ran out".
	const [allQuestionIds, setAllQuestionIds] = useState<number[] | null>(null);
	// Set once the whole set (not just this session) is fully answered --
	// non-null switches the render to the share/complete screen.
	const [completionAverage, setCompletionAverage] = useState<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(`/api/teammates/round?setId=${setId}`);
				const data = (await res.json()) as RoundResponse | { error: string };
				if (cancelled) return;
				if (!res.ok || "error" in data || data.questions.length === 0) {
					setLoadError("Couldn't load this set right now — try again in a moment.");
					return;
				}
				setSetSize(data.questions.length);
				if (data.setName) setSetName(data.setName);
				setAllQuestionIds(data.questions.map((q) => q.id));
				const done = getSetResults(setId);
				const items: QueueItem[] = data.questions
					.map((q, originalIndex) => ({
						question: { id: q.id, badges: [], nationality: null, transferDates: [], loanMoves: [] } as CbQuestion,
						clues: q.teammates,
						cardHints: q.cardHints,
						nationality: q.nationality,
						originalIndex,
					}))
					.filter((item) => (onlyQuestionId ? item.question.id === onlyQuestionId : !(item.question.id in done)));
				// Nothing left to play -- shouldn't be reachable from
				// TeammateSets.tsx's UI (it hides "Play"/"Resume" once a set is
				// complete), but defensive rather than stuck on "Loading…".
				if (items.length === 0) {
					onExit();
					return;
				}
				setQueue(items);
				// Dispatched in the same tick as setQueue (React batches both
				// into one re-render) rather than a separate effect -- see
				// ClubBadgeSetPlay.tsx's own comment on why the in-between
				// render would briefly show the wrong question's content.
				dispatch({ type: "start", playerNames: ["You"], questions: [items[0].question] });
			} catch {
				if (!cancelled) setLoadError("Couldn't load this set right now — try again in a moment.");
			}
		})();
		return () => {
			cancelled = true;
		};
		// setId/onlyQuestionId only change by mounting a fresh instance (App
		// keys the play view on both) -- effectively mount-once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Same shape as GuessThePlayer.tsx's checkQuestion -- see this
	// component's doc on why it's duplicated rather than shared.
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

	// The one bit of real Sets-mode logic GuessThePlayer.tsx has no
	// equivalent of: record this question's result (state.lastResult is
	// still populated -- "next" hasn't fired yet) before moving on, so a
	// closed tab never loses a finished question. Advancing dispatches
	// "start" for the next question directly, same tick as setQueueIndex.
	function nextQuestion() {
		if (!queue || !state.lastResult) return;
		const current = queue[queueIndex];
		recordResult(setId, current.question.id, {
			outcome: state.lastResult.outcome,
			points: state.lastResult.outcome === "correct" ? state.lastResult.points : 0,
		});
		const nextIndex = queueIndex + 1;
		if (nextIndex < queue.length) {
			setQueueIndex(nextIndex);
			dispatch({ type: "start", playerNames: ["You"], questions: [queue[nextIndex].question] });
			return;
		}
		// This session's queue is done -- but not necessarily the whole SET
		// (resuming a partial set, or retrying one answered question, both
		// end here without the set being newly complete). Re-read fresh:
		// recordResult above wrote synchronously.
		if (allQuestionIds) {
			const results = getSetResults(setId);
			const isFullSetComplete = allQuestionIds.every((id) => id in results);
			if (isFullSetComplete) {
				const average = Math.round(
					allQuestionIds.reduce((sum, id) => sum + (results[id]?.points ?? 0), 0) / allQuestionIds.length,
				);
				setCompletionAverage(average);
				return;
			}
		}
		onExit();
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onExit}>
					← Back
				</button>
				<p className="load-error">{loadError}</p>
			</div>
		);
	}

	// The whole set just became fully answered -- shown instead of
	// silently dropping back to TeammateSets.tsx so there's an actual
	// "you did it" moment to share from.
	if (completionAverage !== null) {
		return (
			<div className="screen">
				<h2>
					Set {setId}: {setName} complete!
				</h2>
				<p className={`cb-score cb-score--${scoreBand(completionAverage)}`}>{completionAverage} avg</p>
				<div className="cb-set-complete__actions">
					<button type="button" onClick={() => shareSetViaWhatsApp(setId, setName, completionAverage)}>
						Share via WhatsApp
					</button>
					<button type="button" className="back-link" onClick={onExit}>
						← Back to Sets
					</button>
				</div>
			</div>
		);
	}

	if (!queue || !queue[queueIndex]) {
		return (
			<div className="screen">
				<p>Loading…</p>
			</div>
		);
	}

	const current = queue[queueIndex];
	// The ordered hint nodes for this question. Hints 1 (club + badge) and
	// 3 (overlap years) are `null` -- their content goes INTO the clue
	// cards (the `middle` render prop), not a list underneath, but each
	// null still counts as a hint press (and -15). Only hint 2 (the
	// mystery player's country) renders as text, and it's skipped when the
	// country isn't on record -- so a question is 3 hints normally, 2
	// without a country.
	const hints: React.ReactNode[] = [
		null,
		...(current.nationality ? [`They represent ${current.nationality}`] : []),
		null,
	];

	return (
		<div className="screen">
			{/* Keyed on the question id so React fully remounts between
			    questions -- ClubBadgesPlay's hints/timer/guess-box reset is
			    keyed on state.questionIndex/playerIndex, which never change
			    across our one-question mini-rounds. Safe against stale content
			    because `state` and `queueIndex` always update in the same tick
			    (load effect and nextQuestion both dispatch "start" directly). */}
			<ClubBadgesPlay
				key={current.question.id}
				state={state}
				onGuess={submitGuess}
				onGiveUp={giveUp}
				onNext={nextQuestion}
				submitting={submitting}
				onQuit={onExit}
				progressLabel={`Set ${setId}: ${setName} — Question ${current.originalIndex + 1} of ${setSize}`}
				isLastOverride={queueIndex === queue.length - 1}
				soloBanner="Who am I?"
				extraHints={hints}
				middle={(hintsRevealed) => (
					<>
						<p className="tm-sub">I played with…</p>
						<ul className="tm-clues">
							{current.clues.map((name, i) => {
								const card = current.cardHints[i];
								// Hint 1 -> club + badge in the card; hint 3 (the last
								// hint) -> the overlap years after it.
								const showClub = hintsRevealed >= 1;
								const showYears = hints.length > 0 && hintsRevealed >= hints.length;
								return (
									<li key={i} className="tm-clue">
										<span className="tm-clue__name">{name}</span>
										{card && (showClub || showYears) && (
											<span className="tm-clue__meta">
												{showClub && (
													<>
														{card.image && <img src={card.image} alt="" className="tm-clue__badge" />}
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
		</div>
	);
}

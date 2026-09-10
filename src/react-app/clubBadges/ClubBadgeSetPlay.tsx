import { useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../components/clubBadges.css";
import { ClubBadgesPlay } from "../components/ClubBadgesPlay";
import { clubBadgesReducer, initialCbState, MAX_WRONG_LIVES, scoreBand, type CbQuestion } from "../components/clubBadgesState";
import { getSetResults, recordResult } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

interface RoundResponse {
	setName?: string;
	questions: CbQuestion[];
}

interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

// One item of this set actually due to be played THIS session, alongside
// its position in the full, fixed set (0-based) -- kept even though the
// play queue below is usually a strict subset of the set (see queue's own
// doc), since the progress line ("Question 7 of 10") has to reflect where
// a question really sits in the set, not just its position among however
// many are left to retry right now.
interface QueueItem {
	question: CbQuestion;
	originalIndex: number;
}

interface Props {
	setId: number;
	// When given, play ONLY this one question (its own club_badge_
	// questions.id) regardless of what else in the set is still
	// unanswered -- ClubBadgeSets.tsx's per-question "Retry" control.
	// Omitted for the normal "Play"/"Resume" path, which plays every
	// not-yet-answered question in the set, in order.
	onlyQuestionId?: number;
	// Leaves Sets mode entirely, back to ClubBadgeSets.tsx -- which will
	// show this session's newly recorded result(s) on its own next read of
	// setsStorage, no separate "refresh" signal needed since it re-reads
	// localStorage on every render anyway.
	onExit: () => void;
}

// Plays through a single Set, one question at a time -- each question is
// its own complete "mini-round" of the SAME reducer/UI single-player
// already uses (clubBadgesReducer, ClubBadgesPlay), never a real
// multi-question round. That's deliberate, not a shortcut: state.ts's
// lives/retry bookkeeping (wrongCount, wrongGuesses) is scoped to "the
// current round," and Sets mode needs each QUESTION to have its own
// independent 5-life budget that never ends the rest of the set early --
// exactly what a fresh one-question round already gives for free, with
// zero changes to state.ts itself. ClubBadgesPlay.tsx's progressLabel/
// isLastOverride props exist specifically to keep this one-question-at-a-
// time approach from reading as "Question 1 of 1" and "See results" on
// every single question.
//
// checkQuestion below is deliberately a near-duplicate of GuessThePlayer.
// tsx's own version rather than a shared hook -- this feature is scoped to
// single-player only (see the user request this shipped against), and
// leaving GuessThePlayer.tsx (solo AND multiplayer's own round engine)
// completely untouched was worth the small duplication over any risk of
// destabilizing either of those while extracting a shared abstraction.
export function ClubBadgeSetPlay({ setId, onlyQuestionId, onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	// null while the set's own question list hasn't loaded yet -- distinct
	// from an empty array (which would mean "nothing left to play").
	const [queue, setQueue] = useState<QueueItem[] | null>(null);
	const [queueIndex, setQueueIndex] = useState(0);
	const [setSize, setSetSize] = useState(0);
	// "Crimson Falcon" etc -- clubBadgeSets.ts's display name for this set,
	// fetched here rather than via a separate /sets call since /round?
	// setId=N already has to resolve the same CLUB_BADGE_SETS entry.
	// Falls back to a plain "Set N" if it's ever missing (shouldn't happen
	// against the real server, but avoids "undefined" showing up anywhere).
	const [setName, setSetName] = useState(`Set ${setId}`);
	// Every question id in the WHOLE set, fixed order, regardless of
	// what's already answered -- unlike `queue` (this session's subset),
	// nextQuestion() needs the full list to tell "the whole set just
	// became fully answered" apart from "just this session's queue ran
	// out" (e.g. resuming a partially-done set, or retrying one already-
	// answered question -- neither means the SET is done).
	const [allQuestionIds, setAllQuestionIds] = useState<number[] | null>(null);
	// Set once the set (all of it, not just this session) is fully
	// answered -- non-null switches the render below from the guessing
	// screen to the share/complete screen.
	const [completionAverage, setCompletionAverage] = useState<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(`/api/club-badges/round?setId=${setId}`);
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
					.map((question, originalIndex) => ({ question, originalIndex }))
					.filter(({ question }) => (onlyQuestionId ? question.id === onlyQuestionId : !(question.id in done)));
				// Nothing left to play -- shouldn't be reachable from
				// ClubBadgeSets.tsx's own UI (it hides "Play"/"Resume" once a
				// set is complete), but defensive either way rather than
				// getting stuck on "Loading..." forever with an empty queue.
				if (items.length === 0) {
					onExit();
					return;
				}
				setQueue(items);
				// Dispatched here, in the same tick as setQueue above (React 18
				// batches both into one re-render), rather than in a separate
				// effect keyed on [queue, queueIndex] -- that would leave a
				// render in between where queueIndex/progressLabel already
				// point at a question but `state` still holds the previous
				// one's, which briefly showed the wrong badges under the right
				// question number. nextQuestion() below dispatches its own
				// "start" the same synchronous way for the same reason.
				dispatch({ type: "start", playerNames: ["You"], questions: [items[0].question] });
			} catch {
				if (!cancelled) setLoadError("Couldn't load this set right now — try again in a moment.");
			}
		})();
		return () => {
			cancelled = true;
		};
		// setId/onlyQuestionId only ever change by mounting a fresh instance of
		// this component (ClubBadgeSets.tsx keys its play view on both), so
		// this effect is really mount-once -- listed anyway for correctness,
		// not because a change is expected to re-trigger it in practice.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Same shape as GuessThePlayer.tsx's own checkQuestion -- see this
	// component's own doc on why that's duplicated rather than shared.
	async function checkQuestion(body: { guess: string } | { giveUp: true }, points: number) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/club-badges/check-guess", {
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
			// Network error mid-question: nothing to apply, player just tries again.
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

	// The one piece of real Sets-mode logic that GuessThePlayer.tsx has no
	// equivalent of: record this question's result (state.lastResult is
	// still populated here -- "next" hasn't been dispatched yet, see
	// state.ts's own doc on when it gets cleared) before moving on, so a
	// closed tab or a reset mid-set never loses a question that was
	// actually finished. Advancing dispatches "start" for the next
	// question directly, in the same tick as setQueueIndex -- see the load
	// effect's own comment on why that matters here too.
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
		// This session's own queue is done -- but that's not necessarily the
		// whole SET (resuming a partial set, or retrying one already-
		// answered question, both end here without the set itself being
		// newly complete). Re-read localStorage fresh: recordResult above
		// already wrote synchronously, so it reflects this question too.
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
				<p className="mp-setup__error">{loadError}</p>
			</div>
		);
	}

	// The whole set (not just this session) just became fully answered --
	// see nextQuestion's own doc on exactly when this fires. Shown instead
	// of silently dropping back to ClubBadgeSets.tsx so there's an actual
	// "you did it" moment to share from, not just an updated card the
	// player has to notice on the list.
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

	return (
		<div className="screen">
			{/* Keyed on the question id so React fully remounts this component
			    between questions -- ClubBadgesPlay.tsx's own hints/timer/guess-
			    box reset logic is keyed on state.questionIndex/playerIndex,
			    which (deliberately, see this file's own top doc) never actually
			    change across our one-question-at-a-time mini-rounds, so nothing
			    would otherwise tell it a genuinely new question has started.
			    Safe against showing stale content mid-transition specifically
			    because `state` and `queueIndex` above always update together in
			    the same tick (the load effect and nextQuestion both dispatch
			    "start" directly rather than via a separate effect) -- by the
			    time this key changes, the state passed alongside it already
			    matches. */}
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
			/>
		</div>
	);
}

import { useEffect, useReducer, useState } from "react";
import { roundReducer, initialRoundState, MAX_WRONG_LIVES, type CbQuestion, type RoundState } from "./clubBadgesState";
import type { SetsStore } from "./setsStorage";

// One question actually due to be played THIS session, alongside its
// 0-based position in the full, fixed set -- kept even though the play
// queue is usually a strict subset of the set (see useSetRound's own
// doc), since the progress line ("Question 7 of 10") has to reflect
// where a question really sits, not just its position among however
// many are left to retry right now. `extra` is whatever a mode's own UI
// needs beyond the reducer's plain CbQuestion -- null for club-badges
// (its raw round question already IS a CbQuestion), the clue names +
// per-clue hint data for teammates (see toQueueItem below).
export interface SetQueueItem<Extra> {
	question: CbQuestion;
	extra: Extra;
	originalIndex: number;
}

interface RoundResponse<RawQuestion> {
	setName?: string;
	questions: RawQuestion[];
}

interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

export interface UseSetRoundOptions<RawQuestion, Extra> {
	setId: number;
	// When given, play ONLY this one question regardless of what else in
	// the set is unanswered -- the picker's per-question "Retry" control.
	// Omitted for the normal "Play"/"Resume" path.
	onlyQuestionId?: number;
	roundUrl: string;
	checkGuessUrl: string;
	// Splits one raw /round question into the reducer's plain CbQuestion
	// and this mode's own per-question extra data -- the one place a
	// mode's raw response shape meets this shared engine.
	toQueueItem: (raw: RawQuestion, originalIndex: number) => SetQueueItem<Extra>;
	store: Pick<SetsStore, "getSetResults" | "recordResult">;
	// Leaves Sets mode entirely, back to the picker -- which re-reads
	// localStorage on its own next render, no separate refresh signal.
	onExit: () => void;
}

export interface UseSetRoundResult<Extra> {
	state: RoundState;
	submitting: boolean;
	loadError: string | null;
	// null while the set's own question list hasn't loaded yet -- distinct
	// from an empty array (which would mean "nothing left to play").
	queue: SetQueueItem<Extra>[] | null;
	queueIndex: number;
	setSize: number;
	// This set's display name ("Crimson Falcon" etc), falling back to a
	// plain "Set N" if the /round response is ever missing it (shouldn't
	// happen against the real server).
	setName: string;
	// Non-null once the whole set (not just this session) is fully
	// answered -- callers switch from the guessing screen to a
	// SetCompleteScreen when this is set.
	completionAverage: number | null;
	submitGuess: (guess: string, points: number) => void;
	giveUp: (points: number) => void;
	nextQuestion: () => void;
}

// Drives a single "Sets" mode Set, one question at a time -- shared by
// club-badges' ClubBadgeSetPlay.tsx and teammates' TeammateSetPlay.tsx.
// Each question is its own complete "mini-round" of the same
// reducer/UI single-player already uses (roundReducer,
// RoundPlay), never a real multi-question round -- deliberate, not
// a shortcut: clubBadgesState.ts's lives/retry bookkeeping (wrongCount,
// wrongGuesses) is scoped to "the current round," and Sets mode needs
// each QUESTION to have its own independent 5-life budget that never
// ends the rest of the set early -- exactly what a fresh one-question
// round already gives for free, with zero changes to clubBadgesState.ts
// itself. RoundPlay's progressLabel/isLastOverride props exist
// specifically to keep this one-question-at-a-time approach from
// reading as "Question 1 of 1" and "See results" on every question.
//
// This hook owns the queue/completion bookkeeping and the guess-check
// round-trip; it does NOT render RoundPlay itself, since only
// teammates needs that component's extra soloBanner/extraHints/middle
// props -- callers own their own render (and their own loadError/
// completionAverage/loading branches), keeping this hook a plain state
// machine.
//
// checkQuestion (submitGuess/giveUp below) is deliberately a
// near-duplicate of GuessThePlayer.tsx's own version rather than
// reusing it from here too -- GuessThePlayer is multiplayer's own round
// engine (a REAL multi-question round with its own reducer usage), and
// leaving it completely untouched is worth the small duplication over
// bending this Sets-only hook to also cover it.
export function useSetRound<RawQuestion extends { id: number }, Extra>(
	opts: UseSetRoundOptions<RawQuestion, Extra>,
): UseSetRoundResult<Extra> {
	const { setId, onlyQuestionId, roundUrl, checkGuessUrl, toQueueItem, store, onExit } = opts;
	const [state, dispatch] = useReducer(roundReducer, initialRoundState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [queue, setQueue] = useState<SetQueueItem<Extra>[] | null>(null);
	const [queueIndex, setQueueIndex] = useState(0);
	const [setSize, setSetSize] = useState(0);
	const [setName, setSetName] = useState(`Set ${setId}`);
	// Every question id in the WHOLE set, fixed order, regardless of
	// what's already answered -- unlike `queue` (this session's subset),
	// nextQuestion() needs the full list to tell "the whole set just
	// became fully answered" apart from "just this session's queue ran
	// out" (e.g. resuming a partially-done set, or retrying one already-
	// answered question -- neither means the SET is done).
	const [allQuestionIds, setAllQuestionIds] = useState<number[] | null>(null);
	const [completionAverage, setCompletionAverage] = useState<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(roundUrl);
				const data = (await res.json()) as RoundResponse<RawQuestion> | { error: string };
				if (cancelled) return;
				if (!res.ok || "error" in data || data.questions.length === 0) {
					setLoadError("Couldn't load this set right now — try again in a moment.");
					return;
				}
				setSetSize(data.questions.length);
				if (data.setName) setSetName(data.setName);
				setAllQuestionIds(data.questions.map((q) => q.id));
				const done = store.getSetResults(setId);
				const items = data.questions
					.map((raw, originalIndex) => toQueueItem(raw, originalIndex))
					.filter((item) => (onlyQuestionId ? item.question.id === onlyQuestionId : !(item.question.id in done)));
				// Nothing left to play -- shouldn't be reachable from the
				// picker's own UI (it hides "Play"/"Resume" once a set is
				// complete), but defensive either way rather than getting
				// stuck on "Loading..." forever with an empty queue.
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
				// one's, which briefly showed the wrong content under the
				// right question number. nextQuestion() below dispatches its
				// own "start" the same synchronous way for the same reason.
				dispatch({ type: "start", playerNames: ["You"], questions: [items[0].question] });
			} catch {
				if (!cancelled) setLoadError("Couldn't load this set right now — try again in a moment.");
			}
		})();
		return () => {
			cancelled = true;
		};
		// setId/onlyQuestionId only ever change by mounting a fresh instance
		// of the caller (the picker keys its play view on both), so this
		// effect is really mount-once -- listed anyway for correctness, not
		// because a change is expected to re-trigger it in practice.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function checkQuestion(body: { guess: string } | { giveUp: true }, points: number) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch(checkGuessUrl, {
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

	// The one piece of real Sets-mode logic GuessThePlayer.tsx has no
	// equivalent of: record this question's result (state.lastResult is
	// still populated here -- "next" hasn't been dispatched yet, see
	// clubBadgesState.ts's own doc on when it gets cleared) before moving
	// on, so a closed tab or a reset mid-set never loses a question that
	// was actually finished. Advancing dispatches "start" for the next
	// question directly, in the same tick as setQueueIndex -- see the
	// load effect's own comment on why that matters here too.
	function nextQuestion() {
		if (!queue || !state.lastResult) return;
		const current = queue[queueIndex];
		store.recordResult(setId, current.question.id, {
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
			const results = store.getSetResults(setId);
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

	return {
		state,
		submitting,
		loadError,
		queue,
		queueIndex,
		setSize,
		setName,
		completionAverage,
		submitGuess,
		giveUp,
		nextQuestion,
	};
}

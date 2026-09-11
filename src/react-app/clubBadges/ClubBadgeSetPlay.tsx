import "../components/clubBadges.css";
import { RoundPlay } from "../components/RoundPlay";
import { SetCompleteScreen } from "../components/SetCompleteScreen";
import { useSetRound } from "../components/useSetRound";
import type { CbQuestion } from "../components/clubBadgesState";
import { getSetResults, recordResult } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

interface Props {
	setId: number;
	// When given, play ONLY this one question (its own club_badge_
	// questions.id) regardless of what else in the set is still
	// unanswered -- ClubBadgeSets.tsx's per-question "Retry" control.
	// Omitted for the normal "Play"/"Resume" path, which plays every
	// not-yet-answered question in the set, in order.
	onlyQuestionId?: number;
	onExit: () => void;
}

// Plays through a single club-badges Set, one question at a time -- see
// components/useSetRound.ts for the shared design (why each question is
// its own mini-round, why the queue/completion bookkeeping works the
// way it does; that hook is also what teammates/TeammateSetPlay.tsx
// drives). This file owns nothing but the endpoints and the plain
// render: club-badges' raw round question already IS a CbQuestion
// (toQuestion is the identity function), and RoundPlay renders here
// with none of the soloBanner/extraHints/middle props only teammates
// needs.
export function ClubBadgeSetPlay({ setId, onlyQuestionId, onExit }: Props) {
	const {
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
	} = useSetRound<CbQuestion>({
		setId,
		onlyQuestionId,
		roundUrl: `/api/club-badges/round?setId=${setId}`,
		checkGuessUrl: "/api/club-badges/check-guess",
		toQuestion: (question) => question,
		store: { getSetResults, recordResult },
		onExit,
	});

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

	if (completionAverage !== null) {
		return (
			<SetCompleteScreen
				setId={setId}
				setName={setName}
				average={completionAverage}
				onShare={() => shareSetViaWhatsApp(setId, setName, completionAverage)}
				onExit={onExit}
			/>
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
			    between questions -- RoundPlay's own hints/timer/guess-box
			    reset logic is keyed on state.questionIndex/playerIndex, which
			    (deliberately, see useSetRound.ts's own doc) never actually
			    change across our one-question-at-a-time mini-rounds, so nothing
			    would otherwise tell it a genuinely new question has started. */}
			<RoundPlay
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

import { useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { BadgeTile } from "./BadgeTile";
import { currentTurnIndex, type CbState } from "./state";

interface Props {
	state: CbState;
	onGuess: (guess: string) => void;
	onGiveUp: () => void;
	onNext: () => void;
	submitting: boolean;
	onQuit: () => void;
}

// Active-round screen. Two sub-views depending on state.lastResult: the
// guess box (nothing answered yet this question) or the reveal (answered,
// waiting for "Next" to hand the device to the next player) -- see
// state.ts's doc on why that's what lastResult's presence means.
export function ClubBadgesPlay({ state, onGuess, onGiveUp, onNext, submitting, onQuit }: Props) {
	const [guessInput, setGuessInput] = useState("");
	// Same "confirm before it costs you" pattern as single-player's give-up
	// (PlayScreen.tsx) -- a stray tap here loses a point on this question
	// just as surely as give-up loses the round there, so it gets the same
	// two-step guard rather than acting immediately.
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
	// First of what's meant to grow into a small set of hints (see
	// BadgeTile.tsx) -- just the country-ribbon reveal for now. Per-question:
	// reset whenever the question changes rather than staying revealed into
	// the next one, same "starts fresh each question" reasoning as
	// guessInput/confirmingGiveUp already get via their own dead-end paths.
	// React's own "adjusting state when a prop changes" pattern (setState
	// during render, guarded by comparing against a tracked previous value)
	// rather than a useEffect -- an effect here would commit the stale
	// "still revealed" render first and only reset on the render after,
	// which the lint rule (react-hooks/set-state-in-effect) flags for
	// exactly that reason.
	const [hintRevealed, setHintRevealed] = useState(false);
	const [hintQuestionIndex, setHintQuestionIndex] = useState(state.questionIndex);
	if (state.questionIndex !== hintQuestionIndex) {
		setHintQuestionIndex(state.questionIndex);
		setHintRevealed(false);
	}

	const question = state.questions[state.questionIndex];
	if (!question) return null;
	const turnIndex = currentTurnIndex(state);
	const current = state.players[turnIndex];
	const isLastQuestion = state.questionIndex + 1 >= state.questions.length;
	// Solo Single Player has exactly one "player" (see App.tsx) -- no one to
	// pass the device to and no roster worth listing, so that chrome only
	// makes sense once there's a real multiplayer roster.
	const solo = state.players.length === 1;

	function pick(name: string) {
		setGuessInput(name);
		onGuess(name);
		setGuessInput("");
	}

	function next() {
		setGuessInput("");
		onNext();
	}

	function confirmGiveUp() {
		setConfirmingGiveUp(false);
		onGiveUp();
	}

	return (
		<div className="cb-play">
			<button type="button" className="back-link" onClick={onQuit}>
				← New game
			</button>

			<p className="cb-progress">
				Question {state.questionIndex + 1} of {state.questions.length}
			</p>

			{!solo && (
				<ul className="mp-players">
					{state.players.map((player, i) => (
						<li
							key={i}
							className={i === turnIndex ? "mp-players__item--active" : undefined}
							style={{ "--player-color": player.color } as React.CSSProperties}
						>
							<span className="mp-players__name">{player.name}</span>
							<span className="cb-players__correct">{player.correct} correct</span>
						</li>
					))}
				</ul>
			)}

			<p className="cb-turn-banner" style={{ "--player-color": current.color } as React.CSSProperties}>
				{solo
					? "Who is this?"
					: state.lastResult
						? isLastQuestion
							? "Last question — see how everyone did"
							: `Pass the device to ${state.players[(turnIndex + 1) % state.players.length].name}`
						: `${current.name}'s turn — who is this?`}
			</p>

			<div className="cb-badges">
				{question.badges.map((badge, i) => (
					<div className="cb-badge-step" key={i}>
						{i > 0 && (
							<span className="cb-arrow" aria-hidden="true">
								→
							</span>
						)}
						<BadgeTile badge={badge} showCountryHint={hintRevealed} />
					</div>
				))}
			</div>

			{!state.lastResult && !hintRevealed && (
				<button type="button" className="cb-hint-button" onClick={() => setHintRevealed(true)}>
					💡 Hint: show country
				</button>
			)}

			{!state.lastResult ? (
				<>
					<GuessInput
						value={guessInput}
						onChange={setGuessInput}
						onPick={pick}
						disabled={submitting}
						suggestUrl="/api/club-badges/suggest"
					/>
					{confirmingGiveUp ? (
						<div className="give-up-confirm">
							<span>Give up on this one?</span>
							<button type="button" className="give-up-confirm__yes" onClick={confirmGiveUp} disabled={submitting}>
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
						<button type="button" className="give-up-link" onClick={() => setConfirmingGiveUp(true)} disabled={submitting}>
							Give up
						</button>
					)}
				</>
			) : (
				<div className="cb-reveal">
					<p className={state.lastResult.outcome === "correct" ? "cb-reveal__correct" : "cb-reveal__wrong"}>
						{state.lastResult.outcome === "correct"
							? "✅ Correct!"
							: state.lastResult.gaveUp
								? `It was ${state.lastResult.correctName}`
								: `❌ Not quite — it was ${state.lastResult.correctName}`}
					</p>
					<p className="cb-reveal__clubs">{state.lastResult.clubNames.join(" → ")}</p>
					<button type="button" className="cb-next-button" onClick={next}>
						{isLastQuestion ? "See results" : "Next question"}
					</button>
				</div>
			)}
		</div>
	);
}

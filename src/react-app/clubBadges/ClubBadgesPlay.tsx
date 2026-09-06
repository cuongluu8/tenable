import { useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { BadgeTile } from "./BadgeTile";
import { currentTurnIndex, type CbState } from "./state";

interface Props {
	state: CbState;
	onGuess: (guess: string) => void;
	onNext: () => void;
	submitting: boolean;
	onQuit: () => void;
}

// Active-round screen. Two sub-views depending on state.lastResult: the
// guess box (nothing answered yet this question) or the reveal (answered,
// waiting for "Next" to hand the device to the next player) -- see
// state.ts's doc on why that's what lastResult's presence means.
export function ClubBadgesPlay({ state, onGuess, onNext, submitting, onQuit }: Props) {
	const [guessInput, setGuessInput] = useState("");

	const question = state.questions[state.questionIndex];
	if (!question) return null;
	const turnIndex = currentTurnIndex(state);
	const current = state.players[turnIndex];
	const isLastQuestion = state.questionIndex + 1 >= state.questions.length;

	function pick(name: string) {
		setGuessInput(name);
		onGuess(name);
		setGuessInput("");
	}

	function next() {
		setGuessInput("");
		onNext();
	}

	return (
		<div className="cb-play">
			<button type="button" className="back-link" onClick={onQuit}>
				← New game
			</button>

			<p className="cb-progress">
				Question {state.questionIndex + 1} of {state.questions.length}
			</p>

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

			<p className="cb-turn-banner" style={{ "--player-color": current.color } as React.CSSProperties}>
				{state.lastResult
					? isLastQuestion
						? "Last question — see how everyone did"
						: `Pass the device to ${state.players[(turnIndex + 1) % state.players.length].name}`
					: `${current.name}'s turn — who is this?`}
			</p>

			<div className="cb-badges">
				{question.badges.map((badge, i) => (
					<BadgeTile key={i} badge={badge} />
				))}
			</div>

			{!state.lastResult ? (
				<GuessInput
					value={guessInput}
					onChange={setGuessInput}
					onPick={pick}
					disabled={submitting}
					suggestUrl="/api/club-badges/suggest"
				/>
			) : (
				<div className="cb-reveal">
					<p className={state.lastResult.outcome === "correct" ? "cb-reveal__correct" : "cb-reveal__wrong"}>
						{state.lastResult.outcome === "correct" ? "✅ Correct!" : `❌ Not quite — it was ${state.lastResult.correctName}`}
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

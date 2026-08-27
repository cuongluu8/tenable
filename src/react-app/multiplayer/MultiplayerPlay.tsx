import { useState } from "react";
import { AnswerGrid } from "../components/AnswerGrid";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import type { MpState } from "./state";

const STARTING_LIVES = 3;

interface Props {
	state: MpState;
	onGuess: (guess: string) => void;
	submitting: boolean;
	onQuit: () => void;
}

// Active-round screen. Reuses the same AnswerGrid/GuessInput/LivesIndicator
// components single-player uses (see src/react-app/components) — this
// screen just shapes multiplayer's own state to fit their existing props
// rather than forking them.
export function MultiplayerPlay({ state, onGuess, submitting, onQuit }: Props) {
	const [guessInput, setGuessInput] = useState("");

	if (!state.category) return null;
	const current = state.players[state.turnIndex];

	function pick(name: string) {
		setGuessInput(name);
		onGuess(name);
		setGuessInput("");
	}

	return (
		<div className="mp-play">
			<button type="button" className="back-link" onClick={onQuit}>
				← New game
			</button>

			<section className="category">
				<h2>{state.category.title}</h2>
				{state.category.subtitle && <p className="category__subtitle">{state.category.subtitle}</p>}
			</section>

			<ul className="mp-players">
				{state.players.map((player, i) => (
					<li key={i} className={i === state.turnIndex ? "mp-players__item--active" : undefined}>
						<span className="mp-players__name">{player.name}</span>
						<LivesIndicator total={STARTING_LIVES} remaining={player.lives} />
					</li>
				))}
			</ul>

			<p className="mp-turn-banner">{current.name}'s turn</p>

			<AnswerGrid
				answerCount={state.category.answerCount}
				statLabel={state.category.statLabel}
				progress={{
					mode: "classic",
					foundRanks: state.foundRanks,
					wrongGuesses: 0,
					completed: false,
					won: false,
					completedAt: null,
				}}
				revealed={null}
				found={new Map(Object.entries(state.foundDetails).map(([rank, v]) => [Number(rank), v]))}
			/>

			<GuessInput
				value={guessInput}
				onChange={setGuessInput}
				onPick={pick}
				disabled={submitting}
				categorySlug={state.category.slug}
			/>

			{state.lastAction && (
				<p className="mp-feedback">
					{state.lastAction.result === "correct" && `✅ ${state.lastAction.playerName} found ${state.lastAction.guess}`}
					{state.lastAction.result === "duplicate" && `Already found that one.`}
					{state.lastAction.result === "wrong" && `❌ ${state.lastAction.playerName} — not on the list.`}
				</p>
			)}
		</div>
	);
}

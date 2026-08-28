import { useEffect, useState } from "react";
import { AnswerGrid } from "../components/AnswerGrid";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import { formatDuration, type MpState } from "./state";

const STARTING_LIVES = 3;
// How often the live per-turn timer re-renders. Doesn't need to be 1000ms —
// a little smoother than once-a-second reads better and formatDuration()
// rounds to the nearest second anyway, so the extra ticks are free.
const TIMER_TICK_MS = 250;

interface Props {
	state: MpState;
	onGuess: (guess: string) => void;
	onPass: () => void;
	submitting: boolean;
	onQuit: () => void;
}

// Active-round screen. Reuses the same AnswerGrid/GuessInput/LivesIndicator
// components single-player uses (see src/react-app/components) — this
// screen just shapes multiplayer's own state to fit their existing props
// rather than forking them.
export function MultiplayerPlay({ state, onGuess, onPass, submitting, onQuit }: Props) {
	const [guessInput, setGuessInput] = useState("");
	// Forces a re-render on an interval so the "time this turn" figure below
	// keeps ticking — the underlying value (state.turnStartedAt) only ever
	// changes on a real state transition, so without this the banner would
	// freeze at 0:00 until the next guess.
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), TIMER_TICK_MS);
		return () => clearInterval(id);
	}, []);

	if (!state.category) return null;
	const current = state.players[state.turnIndex];
	const turnElapsedMs = Math.max(0, now - state.turnStartedAt);

	const foundColorByRank = new Map(
		Object.entries(state.foundDetails).map(([rank, v]) => [Number(rank), state.players[v.playerIndex].color]),
	);

	function pick(name: string) {
		setGuessInput(name);
		onGuess(name);
		setGuessInput("");
	}

	function pass() {
		setGuessInput("");
		onPass();
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
					<li
						key={i}
						className={i === state.turnIndex ? "mp-players__item--active" : undefined}
						style={{ "--player-color": player.color } as React.CSSProperties}
					>
						<span className="mp-players__name">{player.name}</span>
						<LivesIndicator total={STARTING_LIVES} remaining={player.lives} />
						<span className="mp-players__total-time">{formatDuration(player.totalTimeMs)} total</span>
					</li>
				))}
			</ul>

			<p className="mp-turn-banner" style={{ "--player-color": current.color } as React.CSSProperties}>
				<span className="mp-turn-banner__name">{current.name}'s turn</span>
				<span className="mp-turn-banner__timer" aria-live="off">
					{formatDuration(turnElapsedMs)}
				</span>
			</p>

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
				foundColorByRank={foundColorByRank}
			/>

			<GuessInput
				value={guessInput}
				onChange={setGuessInput}
				onPick={pick}
				disabled={submitting}
				categorySlug={state.category.slug}
				excludeNames={Object.values(state.foundDetails).map((a) => a.name)}
			/>

			<button type="button" className="mp-pass-button" onClick={pass} disabled={submitting}>
				Pass turn
			</button>

			{state.lastAction && (
				<p className="mp-feedback">
					{state.lastAction.result === "correct" && `✅ ${state.lastAction.playerName} found ${state.lastAction.guess}`}
					{state.lastAction.result === "duplicate" && `Already found that one.`}
					{state.lastAction.result === "wrong" && `❌ ${state.lastAction.playerName} — not on the list.`}
					{state.lastAction.result === "pass" && `⏭️ ${state.lastAction.playerName} passed.`}
				</p>
			)}
		</div>
	);
}

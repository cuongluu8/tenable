import { AnswerGrid } from "../components/AnswerGrid";
import type { RevealAnswer } from "../types";
import { formatDuration, rankPlayers, type MpState } from "./state";

interface Props {
	state: MpState;
	// Full answer list, fetched by Multiplayer.tsx right as the round ends —
	// see its useEffect. Still null for the brief window before that fetch
	// resolves (or forever, if it failed): the grid below degrades to
	// showing only what was actually found, same as it did before this
	// existed, rather than blocking the result screen on it.
	revealed: RevealAnswer[] | null;
	onPlayAgain: () => void;
}

export function MultiplayerResult({ state, revealed, onPlayAgain }: Props) {
	if (!state.category) return null;

	const won = state.winReason === "all_found";
	const standings = rankPlayers(state.players);
	const foundColorByRank = new Map(
		Object.entries(state.foundDetails).map(([rank, v]) => [Number(rank), state.players[v.playerIndex].color]),
	);

	return (
		<div className="result-panel">
			<h3>{won ? "🎉 All answers found!" : "💀 Everyone's out of lives"}</h3>
			<p>
				{state.foundRanks.length} / {state.category.answerCount} found
			</p>

			<ul className="mp-players mp-players--final">
				{standings.map(({ player, index, rank }) => (
					<li key={index} style={{ "--player-color": player.color } as React.CSSProperties}>
						<span className="mp-players__rank">
							{rank === 1 ? "🏆" : `#${rank}`}
						</span>
						<span className="mp-players__name">{player.name}</span>
						<span className="mp-players__stats">
							<span className="mp-players__found-count">
								{player.correct} found
							</span>
							<span className="mp-players__total-time">{formatDuration(player.totalTimeMs)}</span>
							<span className="mp-players__lives-left">
								{player.lives > 0 ? `${player.lives} ${player.lives === 1 ? "life" : "lives"} left` : "out"}
							</span>
						</span>
					</li>
				))}
			</ul>
			<p className="mp-result-hint">Winner: most found, ties broken by quickest total time.</p>

			<AnswerGrid
				answerCount={state.category.answerCount}
				statLabel={state.category.statLabel}
				progress={{
					mode: "classic",
					foundRanks: state.foundRanks,
					wrongGuesses: 0,
					completed: true,
					won,
					completedAt: null,
				}}
				revealed={revealed}
				found={new Map(Object.entries(state.foundDetails).map(([rank, v]) => [Number(rank), v]))}
				foundColorByRank={foundColorByRank}
			/>

			<div className="result-panel__actions">
				<button type="button" onClick={onPlayAgain}>
					New game
				</button>
			</div>
		</div>
	);
}

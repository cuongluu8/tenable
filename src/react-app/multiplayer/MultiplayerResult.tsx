import { formatDuration, rankPlayers, type MpState } from "./state";

interface Props {
	state: MpState;
	onPlayAgain: () => void;
}

export function MultiplayerResult({ state, onPlayAgain }: Props) {
	if (!state.category) return null;

	const won = state.winReason === "all_found";
	const standings = rankPlayers(state.players);

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

			<div className="result-panel__actions">
				<button type="button" onClick={onPlayAgain}>
					New game
				</button>
			</div>
		</div>
	);
}

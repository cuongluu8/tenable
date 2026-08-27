import type { MpState } from "./state";

interface Props {
	state: MpState;
	onPlayAgain: () => void;
}

export function MultiplayerResult({ state, onPlayAgain }: Props) {
	if (!state.category) return null;

	const won = state.winReason === "all_found";

	return (
		<div className="result-panel">
			<h3>{won ? "🎉 All answers found!" : "💀 Everyone's out of lives"}</h3>
			<p>
				{state.foundRanks.length} / {state.category.answerCount} found
			</p>

			<ul className="mp-players mp-players--final">
				{state.players.map((player, i) => (
					<li key={i}>
						<span className="mp-players__name">{player.name}</span>
						<span className="mp-players__lives-left">
							{player.lives > 0 ? `${player.lives} ${player.lives === 1 ? "life" : "lives"} left` : "out"}
						</span>
					</li>
				))}
			</ul>

			<div className="result-panel__actions">
				<button type="button" onClick={onPlayAgain}>
					New game
				</button>
			</div>
		</div>
	);
}

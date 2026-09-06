import { rankCbPlayers, type CbState } from "./state";

interface Props {
	state: CbState;
	onPlayAgain: () => void;
}

export function ClubBadgesResult({ state, onPlayAgain }: Props) {
	const standings = rankCbPlayers(state.players);

	return (
		<div className="result-panel">
			<h3>🏁 Round over</h3>
			<p>{state.questions.length} questions played</p>

			<ul className="mp-players mp-players--final">
				{standings.map(({ player, index, rank }) => (
					<li key={index} style={{ "--player-color": player.color } as React.CSSProperties}>
						<span className="mp-players__rank">{rank === 1 ? "🏆" : `#${rank}`}</span>
						<span className="mp-players__name">{player.name}</span>
						<span className="cb-players__correct">
							{player.correct} / {state.questions.length} correct
						</span>
					</li>
				))}
			</ul>
			<p className="mp-result-hint">Winner: most correct answers.</p>

			<div className="result-panel__actions">
				<button type="button" onClick={onPlayAgain}>
					New game
				</button>
			</div>
		</div>
	);
}

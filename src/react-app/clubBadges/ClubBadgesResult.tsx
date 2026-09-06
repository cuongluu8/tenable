import { rankCbPlayers, type CbState } from "./state";

interface Props {
	state: CbState;
	onPlayAgain: () => void;
	onExit: () => void;
}

export function ClubBadgesResult({ state, onPlayAgain, onExit }: Props) {
	const solo = state.players.length === 1;
	const standings = rankCbPlayers(state.players);

	return (
		<div className="result-panel">
			<h3>🏁 Round over</h3>

			{solo ? (
				// No standings list for one player -- just the score. Ranking
				// language ("winner", "#1") would be meaningless against yourself.
				<p className="cb-solo-score">
					{state.players[0].correct} / {state.questions.length} correct
				</p>
			) : (
				<>
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
				</>
			)}

			<div className="result-panel__actions">
				<button type="button" onClick={onPlayAgain}>
					Play again
				</button>
				<button type="button" className="back-link" onClick={onExit}>
					← Back
				</button>
			</div>
		</div>
	);
}

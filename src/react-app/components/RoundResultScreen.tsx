import { MAX_WRONG_LIVES, rankRoundPlayers, type RoundState } from "./clubBadgesState";

interface Props {
	state: RoundState;
	onPlayAgain: () => void;
	onExit: () => void;
	// When given, a "Share via WhatsApp" button appears next to Play again
	// -- "Teammate Tell" mode (TeammateSetPlay.tsx) passes it; club-badges
	// doesn't (its Set-complete screen has its own share, see shareSet.ts).
	onShare?: () => void;
}

export function RoundResultScreen({ state, onPlayAgain, onExit, onShare }: Props) {
	const solo = state.players.length === 1;
	const standings = rankRoundPlayers(state.players);
	// Lives can end a solo round before all 10 questions -- state.questionIndex
	// is preserved as-is through the "finished" transition (clubBadgesState.ts), so
	// +1 is exactly how many were actually played, same number whether the
	// round ran its full length or got cut short.
	const questionsPlayed = state.questionIndex + 1;
	const outOfLives = solo && state.wrongCount >= MAX_WRONG_LIVES;

	return (
		<div className="result-panel">
			<h3>🏁 Round over</h3>

			{solo ? (
				// No standings list for one player -- just the score. Ranking
				// language ("winner", "#1") would be meaningless against yourself.
				<>
					<p className="cb-solo-score">
						{state.players[0].correct} / {questionsPlayed} correct
					</p>
					{outOfLives && <p className="cb-solo-lives-note">Out of lives — that's the round.</p>}
				</>
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
				{onShare && (
					<button type="button" onClick={onShare}>
						Share via WhatsApp
					</button>
				)}
				<button type="button" className="back-link" onClick={onExit}>
					← Back
				</button>
			</div>
		</div>
	);
}

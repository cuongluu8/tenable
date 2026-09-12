export type MpGameType = "categories" | "club-badges";

interface Props {
	onStart: (gameType: MpGameType) => void;
	// Back to the roster step (MultiplayerPlayers.tsx), same "one step up,
	// not all the way home" reasoning as MultiplayerCategoryPick.tsx's onBack.
	onBack: () => void;
}

// New second step of multiplayer setup, ahead of the two games' own next
// steps (MultiplayerCategoryPick.tsx for the Top 10 game, straight into
// GuessThePlayer for the club-badges one -- it has no further picking to
// do, a round is always a random draw). Both games are pass-and-play with
// the same roster, so this is the one shared fork point rather than
// duplicating the roster step per game.
export function MultiplayerGameTypePick({ onStart, onBack }: Props) {
	return (
		<div className="mp-setup">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Choose a game</h2>

			<div className="mode-picker">
				<button type="button" className="mode-button" onClick={() => onStart("categories")}>
					<strong>🏆 Top 10 trivia</strong>
					<span>Race to find every entry in a category</span>
				</button>
				<button type="button" className="mode-button" onClick={() => onStart("club-badges")}>
					<strong>🛡️ Club Run</strong>
					<span>Name them from the clubs they've played for</span>
				</button>
			</div>
		</div>
	);
}

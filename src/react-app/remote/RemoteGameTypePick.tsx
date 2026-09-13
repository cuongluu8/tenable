export type RemoteGameType = "club-badges";

interface Props {
	onSelect: (gameType: RemoteGameType) => void;
	onBack: () => void;
}

// First step of remote play, ahead of RemoteHome's own host-or-join
// choice -- same "one shared fork point" reasoning as local multiplayer's
// MultiplayerGameTypePick.tsx. Only Club Run is actually wired up
// (RemoteGameSession only ever serves badge-trail questions -- see that
// class's own doc), but all three of this app's game types are shown
// here rather than just the one that works today, so the other two read
// as "coming soon", not as never having been considered.
export function RemoteGameTypePick({ onSelect, onBack }: Props) {
	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Remote play</h2>
			<p className="remote-subtitle">Choose a game to race friends on their own devices.</p>

			<div className="mode-picker">
				<button type="button" className="mode-button" disabled>
					<strong>🏆 Top 10 trivia</strong>
					<span>Coming soon</span>
				</button>
				<button type="button" className="mode-button" onClick={() => onSelect("club-badges")}>
					<strong>🛡️ Club Run</strong>
					<span>Name them from the clubs they've played for</span>
				</button>
				<button type="button" className="mode-button" disabled>
					<strong>🤝 Teammate Tell</strong>
					<span>Coming soon</span>
				</button>
			</div>
		</div>
	);
}

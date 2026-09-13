import type { RemoteGameType } from "./remoteApi";

export type { RemoteGameType };

interface Props {
	onSelect: (gameType: RemoteGameType) => void;
	onBack: () => void;
}

// First step of remote play, ahead of RemoteHome's own host-or-join
// choice -- same "one shared fork point" reasoning as local multiplayer's
// MultiplayerGameTypePick.tsx. Club Run and (since 2026-09-13) Teammate
// Tell are wired up -- both "name the player" formats RemoteGameSession
// serves; Top 10 is shown too rather than hidden, so it reads as "coming
// soon", not as never having been considered.
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
				<button type="button" className="mode-button" onClick={() => onSelect("teammates")}>
					<strong>🤝 Teammate Tell</strong>
					<span>Name them from who they played with</span>
				</button>
			</div>
		</div>
	);
}

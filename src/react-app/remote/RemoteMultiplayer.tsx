import "./remote.css";
import { RemoteGame } from "./RemoteGame";
import { RemoteHome } from "./RemoteHome";
import { RemoteLobby } from "./RemoteLobby";
import { useRemoteSession } from "./useRemoteSession";

interface Props {
	onBack: () => void;
}

// Top-level orchestrator: which of Home/Lobby/Game to show is entirely a
// function of whether a session identity exists yet and what its server
// state currently says -- there's no separate client-side navigation
// state to keep in sync with it (unlike App.tsx's own screens, which are
// real distinct URLs a refresh/back-button should land back on). A
// refresh here just re-reads the same identity from localStorage and
// resumes wherever the session actually is.
export function RemoteMultiplayer({ onBack }: Props) {
	const { identity, state, error, isHost, create, join, setReady, start, removePlayer, guess, leave, forget } = useRemoteSession();

	if (!identity) {
		return <RemoteHome error={error} onCreate={create} onJoin={join} onBack={onBack} />;
	}

	if (!state) {
		return (
			<div className="screen">
				<p>Loading…</p>
			</div>
		);
	}

	if (state.status === "ended") {
		return (
			<div className="screen">
				<h2>Session ended</h2>
				<p className="remote-subtitle">The host ended this session.</p>
				<button type="button" className="remote-primary-button" onClick={forget}>
					Back
				</button>
			</div>
		);
	}

	if (state.status === "lobby") {
		return (
			<RemoteLobby
				state={state}
				sessionCode={identity.sessionCode}
				myPlayerId={identity.playerId}
				isHost={isHost}
				error={error}
				onSetReady={setReady}
				onStart={(count) => {
					void start(count);
				}}
				onRemovePlayer={removePlayer}
				onLeave={leave}
			/>
		);
	}

	return (
		<RemoteGame
			state={state}
			myPlayerId={identity.playerId}
			error={error}
			onGuess={guess}
			onSetReady={setReady}
			onLeave={state.status === "finished" ? forget : leave}
		/>
	);
}

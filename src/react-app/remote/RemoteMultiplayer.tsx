import { useState } from "react";
import "./remote.css";
import { RemoteGame } from "./RemoteGame";
import { RemoteGameTypePick, type RemoteGameType } from "./RemoteGameTypePick";
import { RemoteHome } from "./RemoteHome";
import { RemoteLobby } from "./RemoteLobby";
import { useRemoteSession } from "./useRemoteSession";

interface Props {
	onBack: () => void;
}

// Top-level orchestrator: which of GameTypePick/Home/Lobby/Game to show is
// entirely a function of whether a game type has been picked yet, whether
// a session identity exists, and what its server state currently says --
// there's no separate client-side navigation state to keep in sync with
// it (unlike App.tsx's own screens, which are real distinct URLs a
// refresh/back-button should land back on). A refresh here just re-reads
// the same identity from localStorage and resumes wherever the session
// actually is -- skipping the game-type picker entirely once a session
// exists, since a resumed session already committed to whichever game it
// started as; there's nothing left to pick.
export function RemoteMultiplayer({ onBack }: Props) {
	const { identity, state, error, isHost, create, join, setReady, start, removePlayer, guess, giveUp, postMessage, leave, forget } = useRemoteSession();
	// Set when this page was opened via a shared WhatsApp join link (see
	// shareSession.ts) -- read once at mount, same as App.tsx's own
	// pathname-based routing helpers read window.location directly rather
	// than threading a router through props. A join link always means
	// "join THIS Club Run game", so it skips the game-type picker
	// entirely -- there's nothing to pick, the sender already picked it.
	const [joinCode] = useState(() => new URLSearchParams(window.location.search).get("join")?.toUpperCase() || undefined);
	const [gameType, setGameType] = useState<RemoteGameType | null>(() => (joinCode ? "club-badges" : null));

	if (!identity && !gameType) {
		return <RemoteGameTypePick onSelect={setGameType} onBack={onBack} />;
	}

	if (!identity) {
		return <RemoteHome error={error} onCreate={create} onJoin={join} onBack={() => setGameType(null)} initialJoinCode={joinCode} />;
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
			onGiveUp={giveUp}
			onPostMessage={postMessage}
			onSetReady={setReady}
			onLeave={state.status === "finished" ? forget : leave}
		/>
	);
}

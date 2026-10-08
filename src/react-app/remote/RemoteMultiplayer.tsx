import { useState } from "react";
import "./remote.css";
import { RemoteGame } from "./RemoteGame";
import { RemoteHome } from "./RemoteHome";
import { RemoteLobby } from "./RemoteLobby";
import { RollOfHonourGame } from "./RollOfHonourGame";
import { useRemoteSession, type UseRemoteSessionResult } from "./useRemoteSession";

interface Props {
	onBack: () => void;
}

// The one hook call, and the one thing drawn over every screen: the
// "Still there?" pause after IDLE_MS without a touch (see
// useRemoteSession.ts) -- live updates are off until tapped, whichever
// screen was up. A hidden tab pauses too, but resumes by itself.
export function RemoteMultiplayer({ onBack }: Props) {
	const session = useRemoteSession();
	return (
		<>
			<RemoteScreens session={session} onBack={onBack} />
			{session.suspended === "idle" && (
				<div className="remote-modal-backdrop" onClick={session.resume}>
					<div className="remote-modal remote-idle" role="alertdialog" aria-modal="true" aria-label="Still there?" onClick={(e) => e.stopPropagation()}>
						<h3 className="remote-modal__title">Still there?</h3>
						<p className="remote-subtitle">Live updates are paused while you're away from the screen.</p>
						<button type="button" className="remote-primary-button" onClick={session.resume} autoFocus>
							I'm back
						</button>
					</div>
				</div>
			)}
		</>
	);
}

// Top-level orchestrator: which of Home/Lobby/Game to show is entirely a
// function of whether a session identity exists and what its server state
// currently says --
// there's no separate client-side navigation state to keep in sync with
// it (unlike App.tsx's own screens, which are real distinct URLs a
// refresh/back-button should land back on). A refresh here just re-reads
// the same identity from localStorage and resumes wherever the session
// actually is. Picking a game type is part of hosting, so it lives inside
// RemoteHome (after "Host a game"), not here.
function RemoteScreens({ session, onBack }: { session: UseRemoteSessionResult; onBack: () => void }) {
	const { identity, state, feed, error, isHost, create, join, setReady, start, removePlayer, guess, giveUp, postMessage, restart, selectTile, releaseTile, answerTile, leave, forget } = session;
	// Set when this page was opened via a shared WhatsApp join link (see
	// shareSession.ts) -- read once at mount, same as App.tsx's own
	// pathname-based routing helpers read window.location directly rather
	// than threading a router through props.
	const [joinCode] = useState(() => new URLSearchParams(window.location.search).get("join")?.toUpperCase() || undefined);

	if (!identity) {
		return <RemoteHome error={error} onCreate={create} onJoin={join} onBack={onBack} initialJoinCode={joinCode} />;
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
				<p className="remote-subtitle">The host ended this session, or has been away too long.</p>
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
				onStart={(count, competitionId) => {
					void start(count, competitionId);
				}}
				onRemovePlayer={removePlayer}
				onLeave={leave}
			/>
		);
	}

	if (state.gameType === "roll-of-honour") {
		// A different engine (one shared grid, no rounds) -- see
		// remoteGameSession.ts's class doc -- with its own screen; the
		// lobby/ended states above are shared.
		return (
			<RollOfHonourGame
				state={state}
				feed={feed}
				myPlayerId={identity.playerId}
				error={error}
				onSelectTile={selectTile}
				onReleaseTile={releaseTile}
				onAnswerTile={answerTile}
				onGiveUp={giveUp}
				onPostMessage={postMessage}
				onRestart={restart}
				onLeave={leave}
			/>
		);
	}

	return (
		<RemoteGame
			state={state}
			feed={feed}
			myPlayerId={identity.playerId}
			error={error}
			onGuess={guess}
			onGiveUp={giveUp}
			onPostMessage={postMessage}
			onSetReady={setReady}
			onRestart={restart}
			// A real leave even from the results (2026-09-13 -- used to be a
			// local-only forget there): the session lives on for "Play
			// again", so a player who's done has to actually vacate their
			// seat, and a host who's done ends it for everyone, same as
			// mid-game.
			onLeave={leave}
		/>
	);
}

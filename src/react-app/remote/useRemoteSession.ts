import { useCallback, useEffect, useRef, useState } from "react";
import {
	apiAnswerTile,
	apiCreateSession,
	apiFetchState,
	apiGiveUp,
	apiJoinSession,
	apiLeaveSession,
	apiPostMessage,
	apiReleaseTile,
	apiRemovePlayer,
	apiRestart,
	apiSelectTile,
	apiSetReady,
	apiStartGame,
	apiSubmitGuess,
	clearIdentity,
	loadIdentity,
	saveIdentity,
	type RemoteGameType,
	type RemoteIdentity,
	type SessionState,
} from "./remoteApi";

// 4s, matching the locked design decision (see remoteGameSession.ts's own
// doc): no WebSockets, a few seconds of UI lag doesn't affect fairness
// since the server decides who won each question, not the client.
const POLL_INTERVAL_MS = 4_000;

interface UseRemoteSessionResult {
	identity: RemoteIdentity | null;
	state: SessionState | null;
	error: string | null;
	isHost: boolean;
	create: (hostName: string, gameType: RemoteGameType) => Promise<void>;
	join: (code: string, name: string) => Promise<void>;
	setReady: (ready: boolean) => Promise<void>;
	start: (questionCount: number) => Promise<string | null>;
	removePlayer: (playerId: string) => Promise<void>;
	guess: (guess: string) => Promise<"correct" | "wrong" | null>;
	// Bows this player out of the current round -- see remoteGameSession.ts's
	// /give-up on why the answer isn't returned here (it arrives via the
	// next /state, once the round is actually decided).
	giveUp: () => Promise<void>;
	// Posts a chat message. Resolves to null on success, or to the
	// server's own rejection (a 20-word/30s-cooldown message the composer
	// shows inline) -- kept out of the shared `error` banner since it's
	// feedback on one field, not a session-level problem. `retryAfterMs`
	// accompanies a cooldown rejection so the composer can count it down.
	postMessage: (text: string) => Promise<{ error: string; retryAfterMs?: number } | null>;
	// Host-only: a finished game back to the lobby for another go -- see
	// remoteGameSession.ts's /restart. `keepScores` carries the wins over
	// as a running total instead of starting everyone back at 0.
	restart: (keepScores: boolean) => Promise<void>;
	// Roll of Honour's grid -- see remoteGameSession.ts's /tile/* routes.
	// Each resolves to the server's own answer (including its rejections,
	// which the grid shows inline) rather than routing through `error`.
	selectTile: (season: string) => Promise<{ lockedForMs: number } | { error: string; retryAfterMs?: number }>;
	releaseTile: () => Promise<void>;
	answerTile: (
		season: string,
		guess: string,
	) => Promise<{ result: "correct"; winner: string; imageUrl: string | null } | { result: "wrong"; retryAfterMs: number } | { error: string }>;
	leave: () => Promise<void>;
	// Forgets the session locally without telling the server -- for
	// leaving a session that's already "finished"/"ended", where there's
	// nothing left for the server to do (see remoteGameSession.ts's /leave
	// doc: a session already over has no state left to change).
	forget: () => void;
}

// Owns the one piece of client-side state every remote-multiplayer screen
// needs: the current session's identity (persisted to localStorage so a
// refresh mid-game doesn't lose a seat) and its live server state (polled
// every 4s). Split out of any one screen component since Home/Lobby/Game
// are really one continuous session, just rendered differently depending
// on `state.status` -- see RemoteMultiplayer.tsx.
export function useRemoteSession(): UseRemoteSessionResult {
	const [identity, setIdentity] = useState<RemoteIdentity | null>(() => loadIdentity());
	const [state, setState] = useState<SessionState | null>(null);
	const [error, setError] = useState<string | null>(null);
	// Avoids setting state after the identity that produced it has already
	// been cleared (e.g. a 401 from a stale localStorage entry racing
	// against an in-flight poll) -- checked by reference, not a boolean, so
	// a poll started under IDENTITY A can never clobber state set (or
	// cleared) after switching to IDENTITY B.
	const identityRef = useRef(identity);
	identityRef.current = identity;

	const refresh = useCallback(async (id: RemoteIdentity) => {
		const res = await apiFetchState(id.sessionCode, id.playerToken);
		if (identityRef.current !== id) return; // superseded while this was in flight
		if (res.status === 401 || res.status === 404) {
			// The session this identity pointed at is gone or never existed --
			// a stale localStorage entry from a previous game, most likely.
			// Nothing to recover: forget it and let the player start fresh.
			clearIdentity();
			setIdentity(null);
			setState(null);
			return;
		}
		if (res.status !== 200) {
			setError("error" in res.body ? res.body.error : "Something went wrong.");
			return;
		}
		setError(null);
		setState(res.body as SessionState);
	}, []);

	useEffect(() => {
		if (!identity) return;
		let cancelled = false;
		refresh(identity);
		const interval = setInterval(() => {
			// Nothing left to learn once a session has ended -- the one
			// terminal status (see remoteGameSession.ts). "finished" is NOT
			// terminal since /restart exists: every device at the results has
			// to keep polling to notice the host starting another game.
			if (state?.status === "ended") return;
			if (!cancelled) refresh(identity);
		}, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
		// state.status is read inside the interval callback (to stop polling
		// once terminal), not depended on here -- depending on it would tear
		// down and rebuild the interval every single poll, defeating a fixed
		// 4s cadence.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [identity, refresh]);

	const create = useCallback(
		async (hostName: string, gameType: RemoteGameType) => {
			const res = await apiCreateSession(hostName, gameType);
			if (res.status !== 200 || !("sessionCode" in res.body)) {
				setError("error" in res.body ? res.body.error : "Couldn't create a session.");
				return;
			}
			const id: RemoteIdentity = { sessionCode: res.body.sessionCode, playerId: res.body.playerId, playerToken: res.body.playerToken };
			saveIdentity(id);
			setError(null);
			setIdentity(id);
			await refresh(id);
		},
		[refresh],
	);

	const join = useCallback(
		async (code: string, name: string) => {
			const res = await apiJoinSession(code, name);
			if (res.status !== 200 || !("playerId" in res.body)) {
				setError("error" in res.body ? res.body.error : "Couldn't join that session.");
				return;
			}
			const id: RemoteIdentity = { sessionCode: code, playerId: res.body.playerId, playerToken: res.body.playerToken };
			saveIdentity(id);
			setError(null);
			setIdentity(id);
			await refresh(id);
		},
		[refresh],
	);

	const setReadyAction = useCallback(
		async (ready: boolean) => {
			if (!identity) return;
			const res = await apiSetReady(identity.sessionCode, identity.playerToken, ready);
			if (res.status !== 200) {
				setError("error" in res.body ? res.body.error : "Couldn't update ready status.");
				return;
			}
			await refresh(identity);
		},
		[identity, refresh],
	);

	const start = useCallback(
		async (questionCount: number): Promise<string | null> => {
			if (!identity) return "No active session.";
			const res = await apiStartGame(identity.sessionCode, identity.playerToken, questionCount);
			if (res.status !== 200) {
				const message = "error" in res.body ? res.body.error : "Couldn't start the game.";
				setError(message);
				return message;
			}
			await refresh(identity);
			return null;
		},
		[identity, refresh],
	);

	const removePlayerAction = useCallback(
		async (playerId: string) => {
			if (!identity) return;
			const res = await apiRemovePlayer(identity.sessionCode, identity.playerToken, playerId);
			if (res.status !== 200) {
				setError("error" in res.body ? res.body.error : "Couldn't remove that player.");
				return;
			}
			await refresh(identity);
		},
		[identity, refresh],
	);

	const guess = useCallback(
		async (guessText: string): Promise<"correct" | "wrong" | null> => {
			if (!identity) return null;
			const res = await apiSubmitGuess(identity.sessionCode, identity.playerToken, guessText);
			if (res.status !== 200 || !("result" in res.body)) {
				setError("error" in res.body ? res.body.error : "Couldn't submit that guess.");
				return null;
			}
			await refresh(identity);
			return res.body.result;
		},
		[identity, refresh],
	);

	const giveUp = useCallback(async () => {
		if (!identity) return;
		const res = await apiGiveUp(identity.sessionCode, identity.playerToken);
		if (res.status !== 200) {
			setError("error" in res.body ? res.body.error : "Couldn't give up on this one.");
			return;
		}
		await refresh(identity);
	}, [identity, refresh]);

	const postMessage = useCallback(
		async (text: string): Promise<{ error: string; retryAfterMs?: number } | null> => {
			if (!identity) return { error: "No active session." };
			const res = await apiPostMessage(identity.sessionCode, identity.playerToken, text);
			if (res.status !== 200) {
				return "error" in res.body ? { error: res.body.error, retryAfterMs: res.body.retryAfterMs } : { error: "Couldn't send that message." };
			}
			await refresh(identity);
			return null;
		},
		[identity, refresh],
	);

	const restart = useCallback(
		async (keepScores: boolean) => {
			if (!identity) return;
			const res = await apiRestart(identity.sessionCode, identity.playerToken, keepScores);
			if (res.status !== 200) {
				setError("error" in res.body ? res.body.error : "Couldn't start a new game.");
				return;
			}
			await refresh(identity);
		},
		[identity, refresh],
	);

	const selectTile = useCallback(
		async (season: string) => {
			if (!identity) return { error: "No active session." };
			const res = await apiSelectTile(identity.sessionCode, identity.playerToken, season);
			if (res.status !== 200 || !("ok" in res.body)) {
				return "error" in res.body ? { error: res.body.error, retryAfterMs: res.body.retryAfterMs } : { error: "Couldn't take that season." };
			}
			await refresh(identity);
			return { lockedForMs: res.body.lockedForMs };
		},
		[identity, refresh],
	);

	const releaseTile = useCallback(async () => {
		if (!identity) return;
		await apiReleaseTile(identity.sessionCode, identity.playerToken);
		await refresh(identity);
	}, [identity, refresh]);

	const answerTile = useCallback(
		async (season: string, guess: string) => {
			if (!identity) return { error: "No active session." };
			const res = await apiAnswerTile(identity.sessionCode, identity.playerToken, season, guess);
			if (res.status !== 200 || !("result" in res.body)) {
				return { error: "error" in res.body ? res.body.error : "Couldn't submit that answer." };
			}
			await refresh(identity);
			return res.body;
		},
		[identity, refresh],
	);

	const leave = useCallback(async () => {
		if (identity) await apiLeaveSession(identity.sessionCode, identity.playerToken);
		clearIdentity();
		setIdentity(null);
		setState(null);
		setError(null);
	}, [identity]);

	const forget = useCallback(() => {
		clearIdentity();
		setIdentity(null);
		setState(null);
		setError(null);
	}, []);

	const isHost = state?.players.find((p) => p.id === identity?.playerId)?.isHost ?? false;

	return {
		identity,
		state,
		error,
		isHost,
		create,
		join,
		setReady: setReadyAction,
		start,
		removePlayer: removePlayerAction,
		guess,
		giveUp,
		postMessage,
		restart,
		selectTile,
		releaseTile,
		answerTile,
		leave,
		forget,
	};
}

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
	sessionSocketUrl,
	type FeedEntry,
	type RemoteGameType,
	type RemoteIdentity,
	type SessionState,
} from "./remoteApi";

// Live updates arrive over a WebSocket (2026-09-14 -- see
// remoteGameSession.ts's WebSockets doc): the server pushes the same
// body /state returns whenever it changes. Polling is the FALLBACK, used
// only while the socket is down (connecting, reconnecting, or blocked by
// something in between), at the cadences remote play ran on before:
// 4s, and 1.5s during a Roll of Honour game, where a season someone else
// released reads as a dead tile until the next update shows it open.
const POLL_INTERVAL_MS = 4_000;
const HONOUR_POLL_INTERVAL_MS = 1_500;
// Keep-alive over the socket, answered by the runtime without waking the
// session object. It's also this device's PRESENCE: the server counts a
// player present while their socket keeps pinging (see remoteGameSession
// .ts's presence doc -- away after two missed pings plus slack). And it's
// how THIS side notices a dead connection: a socket the network dropped
// without a close frame still reads as open here, so two unanswered
// pings close it and reconnect. 25s is the one steady per-player cost
// sockets left (incoming messages bill 20:1, so ~7 requests an hour) --
// deliberately not tightened for faster away detection, which is an
// edge case that only needs handling, not speed.
const SOCKET_PING_MS = 25_000;
const SOCKET_MAX_UNANSWERED_PINGS = 2;
// Reconnect backoff: 1s, 2s, 4s, 8s, 16s, then every 30s. While the
// device is offline these attempts fail in the browser and reach no
// server; the browser's `online` event cuts the wait short when the
// network is back.
const SOCKET_RETRY_MAX_MS = 30_000;
// Idle handling (2026-09-15) -- the unhappy case, so it must cost
// nothing: a tab HIDDEN for HIDDEN_GRACE_MS (phone locked, switched app)
// disconnects, and reconnects the moment it's visible again (one upgrade
// request; the first push is the current state). The grace is for the
// quick flick to another app or a screen that auto-locks in 30s: each of
// those would otherwise be a disconnect, a reconnect and a full state
// push, and 60s later an "away" -- for someone who's right there. A
// visible tab nobody has touched, scrolled or moved a pointer on for
// IDLE_MS pauses the same way and shows "Still there?" until tapped.
// Paused, this device sends no pings and no polls, so the server sees it
// go quiet and, after its own limit (IDLE_REMOVE_MS, 30 min), drops it
// from the session; a player back before that just resumes.
const HIDDEN_GRACE_MS = 30_000;
const IDLE_MS = 10 * 60_000;

export type Suspended = "hidden" | "idle" | null;

export interface UseRemoteSessionResult {
	identity: RemoteIdentity | null;
	// Why live updates are paused, if they are -- see IDLE_MS. "hidden"
	// clears itself when the tab is visible again; "idle" waits for
	// resume() (a tap on the overlay RemoteMultiplayer shows).
	suspended: Suspended;
	resume: () => void;
	state: SessionState | null;
	// The whole activity feed this tab has seen for the current session,
	// oldest first -- accumulated from each poll's incremental slice (see
	// remoteGameSession.ts's /state `since`), so it survives across
	// rounds and Play again. Reset with the identity.
	feed: FeedEntry[];
	error: string | null;
	isHost: boolean;
	create: (hostName: string, gameType: RemoteGameType) => Promise<void>;
	join: (code: string, name: string) => Promise<void>;
	setReady: (ready: boolean) => Promise<void>;
	start: (questionCount: number, competitionId?: string) => Promise<string | null>;
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
// refresh mid-game doesn't lose a seat) and its live server state (pushed
// over a WebSocket, polled while that's down). Split out of any one screen component since Home/Lobby/Game
// are really one continuous session, just rendered differently depending
// on `state.status` -- see RemoteMultiplayer.tsx.
export function useRemoteSession(): UseRemoteSessionResult {
	const [identity, setIdentity] = useState<RemoteIdentity | null>(() => loadIdentity());
	const [state, setState] = useState<SessionState | null>(null);
	const [feed, setFeed] = useState<FeedEntry[]>([]);
	// The last feed id received, for the next poll's `since` -- a ref, not
	// state, so refresh() (a stable callback) always reads the latest.
	const lastFeedIdRef = useRef(0);
	// The fingerprint of the last state applied -- echoed as the next
	// poll's `v` (see remoteApi.ts's UnchangedState).
	const lastVersionRef = useRef("");
	const [error, setError] = useState<string | null>(null);
	const [suspended, setSuspended] = useState<Suspended>(null);
	// Avoids setting state after the identity that produced it has already
	// been cleared (e.g. a 401 from a stale localStorage entry racing
	// against an in-flight poll) -- checked by reference, not a boolean, so
	// a poll started under IDENTITY A can never clobber state set (or
	// cleared) after switching to IDENTITY B.
	const identityRef = useRef(identity);
	identityRef.current = identity;
	// Whether the push channel is up -- the poll loop stands down while it is.
	const socketOpenRef = useRef(false);

	// The session this identity pointed at is gone or never existed -- a
	// stale localStorage entry from a previous game, most likely, or a
	// player the host removed. Nothing to recover: forget it and let the
	// player start fresh.
	const dropIdentity = useCallback(() => {
		clearIdentity();
		setIdentity(null);
		setState(null);
		resetFeed();
		// Shown on the home screen (RemoteHome's error line) so being dropped
		// for idling, or a session ending while away, doesn't just dump the
		// player back at the start with no word.
		setError("That session is over for you -- it ended, or you were away for too long. Start or join another.");
	}, []);

	// One state body, from a poll or a push -- identical shapes.
	const applyState = useCallback((body: SessionState) => {
		lastVersionRef.current = body.v;
		if (body.feed.length > 0) {
			// Updates can overlap (a push and an action's own refresh), so
			// merge by id rather than blindly appending.
			setFeed((prev) => {
				const known = new Set(prev.map((e) => e.id));
				const fresh = body.feed.filter((e) => !known.has(e.id));
				return fresh.length === 0 ? prev : [...prev, ...fresh].sort((a, b) => a.id - b.id);
			});
			lastFeedIdRef.current = Math.max(lastFeedIdRef.current, ...body.feed.map((e) => e.id));
		}
		setState(body);
	}, []);

	const refresh = useCallback(
		async (id: RemoteIdentity) => {
			const res = await apiFetchState(id.sessionCode, id.playerToken, lastFeedIdRef.current, lastVersionRef.current);
			if (identityRef.current !== id) return; // superseded while this was in flight
			if (res.status === 401 || res.status === 404) {
				dropIdentity();
				return;
			}
			if (res.status !== 200) {
				setError("error" in res.body ? res.body.error : "Something went wrong.");
				return;
			}
			setError(null);
			if ("unchanged" in res.body) return; // Nothing new -- no re-render either.
			applyState(res.body as SessionState);
		},
		[applyState, dropIdentity],
	);

	// A new identity is a new session: start its history from scratch.
	function resetFeed() {
		setFeed([]);
		lastFeedIdRef.current = 0;
		lastVersionRef.current = "";
	}

	// The cadence only changes on a real transition (a Roll of Honour game
	// starting or ending), so depending on this derived value rebuilds the
	// interval then and only then -- not on every poll.
	const pollMs = state?.gameType === "roll-of-honour" && state.status === "in_progress" ? HONOUR_POLL_INTERVAL_MS : POLL_INTERVAL_MS;

	useEffect(() => {
		if (!identity || suspended) return;
		let cancelled = false;
		refresh(identity);
		const interval = setInterval(() => {
			// Nothing left to learn once a session has ended -- the one
			// terminal status (see remoteGameSession.ts). "finished" is NOT
			// terminal since /restart exists: every device at the results has
			// to keep listening to notice the host starting another game.
			if (state?.status === "ended") return;
			if (socketOpenRef.current) return; // The socket is delivering -- see its effect below.
			if (!cancelled) refresh(identity);
		}, pollMs);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
		// state.status is read inside the interval callback (to stop polling
		// once terminal), not depended on here -- depending on it would tear
		// down and rebuild the interval every single poll, defeating a fixed
		// cadence. pollMs IS depended on: see its own comment. So is
		// `suspended`: coming back from a pause re-polls at once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [identity, refresh, pollMs, suspended]);

	// Pausing -- see IDLE_MS. A hidden tab pauses and resumes by itself;
	// IDLE_MS without a touch pauses until resume(). Neither applies once
	// the session has ended (nothing left to pause).
	const ended = state?.status === "ended";
	useEffect(() => {
		if (!identity || ended) return;
		let hiddenTimer: ReturnType<typeof setTimeout> | undefined;
		const onVisibility = () => {
			clearTimeout(hiddenTimer);
			if (document.visibilityState === "hidden") {
				hiddenTimer = setTimeout(() => setSuspended((s) => s ?? "hidden"), HIDDEN_GRACE_MS);
			} else {
				setSuspended((s) => (s === "hidden" ? null : s));
			}
		};
		onVisibility();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			clearTimeout(hiddenTimer);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [identity, ended]);
	useEffect(() => {
		if (!identity || ended || suspended) return;
		let timer = setTimeout(() => setSuspended("idle"), IDLE_MS);
		const touched = () => {
			clearTimeout(timer);
			timer = setTimeout(() => setSuspended("idle"), IDLE_MS);
		};
		// Scrolling and pointer movement count too: a Roll of Honour player
		// who has given up and is watching the grid fill, or someone reading
		// the chat, is present without tapping anything for a long time.
		const events = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll"] as const;
		for (const e of events) window.addEventListener(e, touched, { passive: true, capture: true });
		return () => {
			clearTimeout(timer);
			for (const e of events) window.removeEventListener(e, touched, { capture: true });
		};
	}, [identity, ended, suspended]);
	const resume = useCallback(() => setSuspended(null), []);

	// The push channel: one socket per identity, reconnected with backoff
	// for as long as the identity stands, with a poll on every reconnect to
	// cover whatever was missed while it was down. The server's close codes
	// 4404 (session gone) and 4410 (no longer a player) mean the same as a
	// poll's 401/404.
	useEffect(() => {
		if (!identity || suspended || typeof WebSocket === "undefined") return;
		let ws: WebSocket | null = null;
		let disposed = false;
		let attempt = 0;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;
		let pingTimer: ReturnType<typeof setInterval> | undefined;

		const connect = () => {
			if (disposed) return;
			const socket = new WebSocket(sessionSocketUrl(identity.sessionCode, identity.playerToken, lastFeedIdRef.current));
			ws = socket;
			let unansweredPings = 0;
			let opened = false;
			socket.onopen = () => {
				attempt = 0;
				opened = true;
				socketOpenRef.current = true;
				pingTimer = setInterval(() => {
					if (socket.readyState !== WebSocket.OPEN) return;
					if (unansweredPings >= SOCKET_MAX_UNANSWERED_PINGS) {
						socket.close(4000, "no pong"); // Dead connection -- onclose reconnects.
						return;
					}
					unansweredPings += 1;
					socket.send("ping");
				}, SOCKET_PING_MS);
			};
			socket.onmessage = (event) => {
				unansweredPings = 0; // Anything arriving proves the connection.
				if (typeof event.data !== "string" || event.data === "pong") return;
				if (identityRef.current !== identity) return;
				let body: SessionState;
				try {
					body = JSON.parse(event.data) as SessionState;
				} catch {
					return;
				}
				setError(null);
				applyState(body);
			};
			socket.onerror = () => socket.close();
			socket.onclose = (event) => {
				socketOpenRef.current = false;
				clearInterval(pingTimer);
				if (disposed) return;
				if (event.code === 4404 || event.code === 4410) {
					dropIdentity();
					return;
				}
				attempt += 1;
				retryTimer = setTimeout(connect, Math.min(SOCKET_RETRY_MAX_MS, 1_000 * 2 ** Math.min(attempt - 1, 4)));
				// A socket that had been delivering may have missed something as
				// it died: fill the gap now rather than on the next poll tick. One
				// that never opened has nothing to fill -- the poll loop is
				// already covering, and an extra request per failed attempt
				// would only add load exactly when the connection is bad.
				if (opened) void refresh(identity);
			};
		};
		connect();

		// The browser says the network is back: don't wait out the backoff
		// (or for the missed-pong check) -- drop whatever socket there is and
		// reconnect now, which also polls once for what was missed.
		const onOnline = () => {
			attempt = 0;
			clearTimeout(retryTimer);
			if (ws && ws.readyState !== WebSocket.CLOSED) ws.close(4001, "network back");
			else connect();
		};
		window.addEventListener("online", onOnline);

		return () => {
			disposed = true;
			socketOpenRef.current = false;
			window.removeEventListener("online", onOnline);
			clearTimeout(retryTimer);
			clearInterval(pingTimer);
			ws?.close(1000, "leaving");
		};
	}, [identity, suspended, applyState, dropIdentity, refresh]);

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
			resetFeed();
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
			resetFeed();
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
		async (questionCount: number, competitionId?: string): Promise<string | null> => {
			if (!identity) return "No active session.";
			const res = await apiStartGame(identity.sessionCode, identity.playerToken, questionCount, competitionId);
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
		resetFeed();
	}, [identity]);

	const forget = useCallback(() => {
		clearIdentity();
		setIdentity(null);
		setState(null);
		setError(null);
		resetFeed();
	}, []);

	const isHost = state?.players.find((p) => p.id === identity?.playerId)?.isHost ?? false;

	return {
		identity,
		suspended,
		resume,
		state,
		feed,
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

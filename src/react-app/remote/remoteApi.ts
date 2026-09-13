// Thin fetch wrappers for /api/remote/* (see src/worker/routes/
// remoteSession.ts) plus the localStorage identity a browser tab needs to
// keep proving who it is across polls -- see remoteSession.ts (worker
// lib)'s own doc: the player token is never typed or read by a person, so
// there's no readability tradeoff the way the session CODE has; it's
// stored here purely so a page refresh mid-game doesn't lose the player's
// seat.

export interface PublicPlayer {
	id: string;
	name: string;
	isHost: boolean;
	ready: boolean;
	away: boolean;
	wins: number;
}

export interface RoundBadge {
	name: string;
	url: string | null;
	country: string | null;
}

export interface RoundQuestion {
	id: number;
	badges: RoundBadge[];
	nationality: string | null;
	transferDates: (string | null)[];
	loanMoves: boolean[];
}

export interface RoundInfo {
	index: number;
	total: number;
	startedAt: number | null;
	hintsRevealed: number;
	question: RoundQuestion;
	winnerId: string | null;
	answerName: string | null;
}

export type SessionStatus = "lobby" | "in_progress" | "finished" | "ended";

export interface SessionState {
	status: SessionStatus;
	questionCount: number | null;
	players: PublicPlayer[];
	round: RoundInfo | null;
}

export interface RemoteIdentity {
	sessionCode: string;
	playerId: string;
	playerToken: string;
}

const STORAGE_KEY = "remoteMultiplayer.identity";

export function loadIdentity(): RemoteIdentity | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<RemoteIdentity>;
		if (!parsed.sessionCode || !parsed.playerId || !parsed.playerToken) return null;
		return parsed as RemoteIdentity;
	} catch {
		// Corrupt/foreign localStorage value -- treat exactly like "never had
		// a session going", not a crash.
		return null;
	}
}

export function saveIdentity(identity: RemoteIdentity): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function clearIdentity(): void {
	localStorage.removeItem(STORAGE_KEY);
}

interface ApiResult<T> {
	status: number;
	body: T;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
	const res = await fetch(`/api/remote${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
	});
	const body = (await res.json().catch(() => ({}))) as T;
	return { status: res.status, body };
}

function authHeaders(token: string): Record<string, string> {
	return { "X-Player-Token": token };
}

export function apiCreateSession(hostName: string) {
	return apiFetch<{ sessionCode: string; playerId: string; playerToken: string } | { error: string }>("/sessions", {
		method: "POST",
		body: JSON.stringify({ hostName }),
	});
}

export function apiJoinSession(code: string, name: string) {
	return apiFetch<{ playerId: string; playerToken: string } | { error: string }>(`/sessions/${code}/join`, {
		method: "POST",
		body: JSON.stringify({ name }),
	});
}

export function apiFetchState(code: string, token: string) {
	return apiFetch<SessionState | { error: string }>(`/sessions/${code}/state`, {
		headers: authHeaders(token),
	});
}

export function apiSetReady(code: string, token: string, ready: boolean) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/ready`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ ready }),
	});
}

export function apiLeaveSession(code: string, token: string) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/leave`, {
		method: "POST",
		headers: authHeaders(token),
	});
}

export function apiRemovePlayer(code: string, token: string, playerId: string) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/remove`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ playerId }),
	});
}

export function apiStartGame(code: string, token: string, questionCount: number) {
	return apiFetch<{ ok: true } | { error: string; notReadyPlayerIds?: string[] }>(`/sessions/${code}/start`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ questionCount }),
	});
}

export function apiSubmitGuess(code: string, token: string, guess: string) {
	return apiFetch<{ result: "correct" | "wrong"; answerName?: string } | { error: string }>(`/sessions/${code}/guess`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ guess }),
	});
}

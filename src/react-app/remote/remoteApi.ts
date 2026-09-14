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

// Which "name the player" format a session plays -- picked by the host
// (RemoteGameTypePick.tsx), fixed for the session's life, reported by
// /state so joiners learn it from the session rather than a link param.
// Mirrors remoteGameSession.ts's own RemoteGameType.
export type RemoteGameType = "club-badges" | "teammates" | "roll-of-honour";

export const REMOTE_GAME_LABELS: Record<RemoteGameType, string> = {
	"club-badges": "Club Run",
	teammates: "Teammate Tell",
	"roll-of-honour": "Roll of Honour",
};

// One entry of GET /api/roll-of-honour/competitions -- what the lobby's
// competition picker offers. Fetched, not hardcoded, so adding a list in
// lib/rollOfHonour.ts is the whole job.
export interface HonourCompetitionOption {
	id: string;
	name: string;
	seasonCount: number;
}

export function apiHonourCompetitions() {
	return apiFetchRaw<{ competitions: HonourCompetitionOption[] }>("/api/roll-of-honour/competitions");
}

// Roll of Honour's grid, as /state reports it -- see remoteGameSession.ts's
// PublicHonour. winner/imageUrl are null until a tile is answered (or the
// game is over, when every tile is revealed).
export interface HonourTile {
	season: string;
	status: "open" | "locked" | "answered";
	lockedBy: string | null;
	answeredBy: string | null;
	winner: string | null;
	imageUrl: string | null;
}
export interface HonourState {
	competitionId: string;
	competitionName: string;
	startedAt: number | null;
	tiles: HonourTile[];
	givenUpPlayerIds: string[];
}

export interface RoundBadge {
	name: string;
	url: string | null;
	country: string | null;
}

// Club Run: the badge trail. Same shape as components/clubBadgesState.ts's
// CbQuestion, so BadgeChain renders it directly.
export interface ClubBadgeRoundQuestion {
	id: number;
	badges: RoundBadge[];
	nationality: string | null;
	transferDates: (string | null)[];
	loanMoves: boolean[];
}

// Teammate Tell: clue names, with the per-card hint fields null until the
// server's own hint tier reveals them (club + image at tier 1, years at
// tier 3; nationality at tier 2) -- see remoteGameSession.ts's
// publicQuestion.
export interface TeammateCardHint {
	club: string | null;
	image: string | null;
	years: string | null;
}
export interface TeammateRoundQuestion {
	id: number;
	teammates: string[];
	cardHints: TeammateCardHint[];
	nationality: string | null;
}

// Discriminate with `"badges" in question` (or on SessionState.gameType).
export type RoundQuestion = ClubBadgeRoundQuestion | TeammateRoundQuestion;

export interface RoundInfo {
	index: number;
	total: number;
	startedAt: number | null;
	hintsRevealed: number;
	question: RoundQuestion;
	winnerId: string | null;
	answerName: string | null;
	// Who's given up on this round so far -- see remoteGameSession.ts's
	// PublicRound. Includes the local player once their own give-up lands.
	givenUpPlayerIds: string[];
}

export type SessionStatus = "lobby" | "in_progress" | "finished" | "ended";

// One line of the session's activity feed -- see remoteGameSession.ts's
// FeedEntry. Accumulated client-side by useRemoteSession (the server
// only sends what's new since the last poll).
export interface FeedEntry {
	id: number;
	at: number;
	kind: "chat" | "guess" | "give-up" | "system";
	playerId: string | null;
	text: string;
	correct?: boolean;
	season?: string;
}

export interface SessionState {
	status: SessionStatus;
	gameType: RemoteGameType;
	questionCount: number | null;
	players: PublicPlayer[];
	round: RoundInfo | null;
	// Non-null only for a Roll of Honour session that's started.
	honour: HonourState | null;
	// Only the entries newer than the `since` the poll asked with.
	feed: FeedEntry[];
	// Fingerprint of everything above except `feed` -- echoed back as the
	// next poll's `v` so an unchanged state comes back as a few bytes.
	v: string;
}

// /state's reply when nothing changed since the `v` the poll carried.
export interface UnchangedState {
	unchanged: true;
	v: string;
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

// Same shape as apiFetch below, for the one non-/api/remote endpoint the
// remote screens read (Roll of Honour's competition list).
async function apiFetchRaw<T>(url: string): Promise<ApiResult<T>> {
	const res = await fetch(url);
	const body = (await res.json().catch(() => ({}))) as T;
	return { status: res.status, body };
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

export function apiCreateSession(hostName: string, gameType: RemoteGameType) {
	return apiFetch<{ sessionCode: string; playerId: string; playerToken: string } | { error: string }>("/sessions", {
		method: "POST",
		body: JSON.stringify({ hostName, gameType }),
	});
}

export function apiJoinSession(code: string, name: string) {
	return apiFetch<{ playerId: string; playerToken: string } | { error: string }>(`/sessions/${code}/join`, {
		method: "POST",
		body: JSON.stringify({ name }),
	});
}

export function apiFetchState(code: string, token: string, sinceFeedId = 0, lastVersion = "") {
	return apiFetch<SessionState | UnchangedState | { error: string }>(
		`/sessions/${code}/state?since=${sinceFeedId}&v=${encodeURIComponent(lastVersion)}`,
		{ headers: authHeaders(token) },
	);
}

// The push channel's URL (see remoteGameSession.ts's WebSockets doc and
// useRemoteSession.ts). Same origin as the page; the token has to ride
// in the query because a browser's WebSocket can't set headers.
export function sessionSocketUrl(code: string, token: string, sinceFeedId = 0): string {
	const scheme = window.location.protocol === "https:" ? "wss" : "ws";
	return `${scheme}://${window.location.host}/api/remote/sessions/${code}/ws?token=${encodeURIComponent(token)}&since=${sinceFeedId}`;
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

// `competitionId` is Roll of Honour's one start option (ignored by the
// round formats, which read questionCount instead -- and vice versa).
export function apiStartGame(code: string, token: string, questionCount: number, competitionId?: string) {
	return apiFetch<{ ok: true } | { error: string; notReadyPlayerIds?: string[] }>(`/sessions/${code}/start`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ questionCount, competitionId }),
	});
}

export function apiSubmitGuess(code: string, token: string, guess: string) {
	return apiFetch<{ result: "correct" | "wrong"; answerName?: string } | { error: string }>(`/sessions/${code}/guess`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ guess }),
	});
}

export function apiGiveUp(code: string, token: string) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/give-up`, {
		method: "POST",
		headers: authHeaders(token),
	});
}

export function apiPostMessage(code: string, token: string, text: string) {
	return apiFetch<{ ok: true } | { error: string; retryAfterMs?: number }>(`/sessions/${code}/message`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ text }),
	});
}

export function apiRestart(code: string, token: string, keepScores: boolean) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/restart`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ keepScores }),
	});
}

export function apiSelectTile(code: string, token: string, season: string) {
	return apiFetch<{ ok: true; lockedForMs: number } | { error: string; retryAfterMs?: number }>(`/sessions/${code}/tile/select`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ season }),
	});
}

export function apiReleaseTile(code: string, token: string) {
	return apiFetch<{ ok: true } | { error: string }>(`/sessions/${code}/tile/release`, {
		method: "POST",
		headers: authHeaders(token),
	});
}

export function apiAnswerTile(code: string, token: string, season: string, guess: string) {
	return apiFetch<
		{ result: "correct"; winner: string; imageUrl: string | null } | { result: "wrong"; retryAfterMs: number } | { error: string }
	>(`/sessions/${code}/tile/answer`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ season, guess }),
	});
}

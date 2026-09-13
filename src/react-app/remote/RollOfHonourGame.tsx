import { useEffect, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { colorForPlayerIndex } from "../components/playerColors";
import type { HonourTile, SessionState } from "./remoteApi";
import { ChatModal, FinalResults, Leaderboard, LeaveControl, ROUND_START_GRACE_MS } from "./RemoteGame";

interface Props {
	state: SessionState;
	myPlayerId: string;
	error: string | null;
	onSelectTile: (season: string) => Promise<{ lockedForMs: number } | { error: string; retryAfterMs?: number }>;
	onReleaseTile: () => Promise<void>;
	onAnswerTile: (
		season: string,
		guess: string,
	) => Promise<{ result: "correct"; winner: string; imageUrl: string | null } | { result: "wrong"; retryAfterMs: number } | { error: string }>;
	onGiveUp: () => Promise<void>;
	onPostMessage: (text: string) => Promise<{ error: string; retryAfterMs?: number } | null>;
	onRestart: (keepScores: boolean) => void;
	onLeave: () => void;
}

// Local deadline for a server-given duration -- a plain helper so the
// event handlers below can read the clock (react-hooks/purity only
// polices the component body itself; handlers are allowed to be impure,
// but the rule can't tell an async handler declared in the body apart).
function deadline(ms: number): number {
	return Date.now() + ms;
}

// One tile of the grid. `mine`/`blockedForMs`/`lockLeftMs` are this
// device's own view of the tile (its held lock, its retry block) -- both
// timed locally from the server's response rather than from server
// timestamps, so clock skew can't make a 5s block look like 9 or 1.
interface TileProps {
	tile: HonourTile;
	playerIndex: (id: string | null) => number;
	mine: boolean;
	lockLeftMs: number | null;
	blockedForMs: number;
	disabled: boolean;
	onSelect: () => void;
}

function Tile({ tile, playerIndex, mine, lockLeftMs, blockedForMs, disabled, onSelect }: TileProps) {
	const ownerId = tile.answeredBy ?? tile.lockedBy;
	const ownerColor = ownerId ? colorForPlayerIndex(playerIndex(ownerId)) : undefined;
	const classes = ["roh-tile"];
	if (tile.status === "answered") classes.push("roh-tile--answered");
	if (tile.status === "locked") classes.push(mine ? "roh-tile--mine" : "roh-tile--locked");
	if (blockedForMs > 0) classes.push("roh-tile--blocked");
	const interactive = tile.status === "open" && blockedForMs <= 0 && !disabled;
	return (
		<button
			type="button"
			className={classes.join(" ")}
			style={ownerColor ? ({ "--owner-color": ownerColor } as React.CSSProperties) : undefined}
			onClick={onSelect}
			disabled={!interactive && !mine}
			aria-label={`${tile.season}${tile.winner ? `: ${tile.winner}` : ""}`}
		>
			<span className="roh-tile__season">{tile.season}</span>
			{tile.winner ? (
				<span className="roh-tile__answer">
					{tile.imageUrl ? <img src={tile.imageUrl} alt="" className="roh-tile__badge" /> : null}
					<span className="roh-tile__club">{tile.winner}</span>
				</span>
			) : mine && lockLeftMs !== null ? (
				<span className="roh-tile__timer">{Math.ceil(lockLeftMs / 1000)}s</span>
			) : tile.status === "locked" ? (
				<span className="roh-tile__lock">🔒</span>
			) : blockedForMs > 0 ? (
				<span className="roh-tile__timer roh-tile__timer--blocked">{Math.ceil(blockedForMs / 1000)}s</span>
			) : null}
		</button>
	);
}

// Roll of Honour's live game and its results -- see remoteGameSession.ts's
// class doc for the rules. Everything not about the grid (leaderboard,
// chat, leave/end, final results with Play again) is the same shared UI
// the round-based formats use, imported from RemoteGame.tsx.
export function RollOfHonourGame({ state, myPlayerId, error, onSelectTile, onReleaseTile, onAnswerTile, onGiveUp, onPostMessage, onRestart, onLeave }: Props) {
	const [now, setNow] = useState(() => Date.now());
	const inProgress = state.status === "in_progress";
	useEffect(() => {
		if (!inProgress) return;
		const id = setInterval(() => setNow(Date.now()), 250); // 4/s: the tile timers read in whole seconds, this just keeps them from visibly lagging.
		return () => clearInterval(id);
	}, [inProgress]);

	const [chatOpen, setChatOpen] = useState(false);
	const [chatCooldownUntil, setChatCooldownUntil] = useState<number | null>(null);
	// The season this device currently holds, with the local deadline the
	// server gave it (lockedForMs from /tile/select).
	const [held, setHeld] = useState<{ season: string; until: number } | null>(null);
	// season -> local epoch ms until which THIS player can't re-take it
	// (a wrong answer's retryAfterMs).
	const [blocked, setBlocked] = useState<Record<string, number>>({});
	const [guess, setGuess] = useState("");
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState<{ kind: "correct" | "wrong" | "info"; text: string } | null>(null);
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

	// Escape puts a held tile back, same as the answer modal's backdrop/×.
	const holding = held !== null;
	useEffect(() => {
		if (!holding) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setHeld(null);
				setGuess("");
				void onReleaseTile();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [holding, onReleaseTile]);

	const honour = state.honour;
	const me = state.players.find((p) => p.id === myPlayerId);
	const iGaveUp = honour?.givenUpPlayerIds.includes(myPlayerId) ?? false;
	const playerIndex = (id: string | null) => state.players.findIndex((p) => p.id === id);

	// A held tile whose local deadline has passed, or that the server now
	// shows as no longer ours (answered by someone / lock expired), is
	// dropped -- React's "adjust state during render" pattern, guarded.
	const heldTile = held ? honour?.tiles.find((t) => t.season === held.season) : undefined;
	if (held && (held.until <= now || !heldTile || heldTile.status !== "locked" || heldTile.lockedBy !== myPlayerId)) {
		if (held.until <= now && heldTile?.status === "open") setFeedback({ kind: "info", text: `Time's up on ${held.season} -- it's back up for grabs.` });
		setHeld(null);
		setGuess("");
	}

	if (state.status === "finished") {
		return (
			<FinalResults state={state} myPlayerId={myPlayerId} error={error} onRestart={onRestart} onLeave={onLeave}>
				{honour && (
					<>
						<p className="remote-subtitle roh-final-title">The full {honour.competitionName} roll of honour</p>
						<div className="roh-grid roh-grid--final">
							{honour.tiles.map((t) => (
								<Tile key={t.season} tile={t} playerIndex={playerIndex} mine={false} lockLeftMs={null} blockedForMs={0} disabled onSelect={() => undefined} />
							))}
						</div>
					</>
				)}
			</FinalResults>
		);
	}

	if (!honour) return null; // in_progress but the grid hasn't arrived yet -- a one-poll gap at worst.

	// Same shared start countdown as the round formats, timed off the
	// server's own start time (see remoteGameSession.ts's /start Roll of
	// Honour branch) -- the server rejects selects inside this window too.
	const startCountdown = honour.startedAt !== null ? Math.max(0, Math.ceil((honour.startedAt + ROUND_START_GRACE_MS - now) / 1000)) : 0;

	const answered = honour.tiles.filter((t) => t.status === "answered").length;

	async function select(season: string) {
		if (busy || iGaveUp) return;
		setBusy(true);
		setFeedback(null);
		const res = await onSelectTile(season);
		setBusy(false);
		if ("error" in res) {
			if (res.retryAfterMs) setBlocked((b) => ({ ...b, [season]: deadline(res.retryAfterMs!) }));
			setFeedback({ kind: "info", text: res.error });
			return;
		}
		setHeld({ season, until: deadline(res.lockedForMs) });
		setGuess("");
	}

	async function cancelHold() {
		setHeld(null);
		setGuess("");
		await onReleaseTile();
	}

	async function answer(name: string) {
		if (!held || busy) return;
		setBusy(true);
		const season = held.season;
		const res = await onAnswerTile(season, name);
		setBusy(false);
		setHeld(null);
		setGuess("");
		if ("error" in res) {
			setFeedback({ kind: "info", text: res.error });
			return;
		}
		if (res.result === "correct") {
			setFeedback({ kind: "correct", text: `✅ ${season}: ${res.winner}` });
			return;
		}
		setBlocked((b) => ({ ...b, [season]: deadline(res.retryAfterMs) }));
		setFeedback({ kind: "wrong", text: `❌ Not ${name} -- ${season} is free again for others; you can retry it in ${Math.ceil(res.retryAfterMs / 1000)}s.` });
	}

	async function confirmGiveUp() {
		setConfirmingGiveUp(false);
		setHeld(null);
		await onGiveUp();
	}

	return (
		<div className="screen">
			<div className="remote-round-header">
				<span>
					{honour.competitionName} · {answered} of {honour.tiles.length} filled
				</span>
			</div>

			<Leaderboard players={state.players} myPlayerId={myPlayerId} givenUpPlayerIds={honour.givenUpPlayerIds} compact onOpenChat={() => setChatOpen(true)} />

			{startCountdown > 0 ? (
				<div className="remote-countdown" aria-live="polite">
					<p className="remote-countdown__label">Grid opens in</p>
					<p className="remote-countdown__value">{startCountdown}</p>
				</div>
			) : (
				<>
					{iGaveUp ? (
						<p className="remote-subtitle">You gave up on this one. Watching the others fill in the rest…</p>
					) : (
						<p className="remote-subtitle roh-hint">Tap a season to claim it, then name the winner.</p>
					)}

					{feedback && <p className={`roh-feedback roh-feedback--${feedback.kind}`}>{feedback.text}</p>}

					<div className="roh-grid">
						{honour.tiles.map((t) => {
							const mine = held?.season === t.season && t.lockedBy === myPlayerId;
							const blockedForMs = Math.max(0, (blocked[t.season] ?? 0) - now);
							return (
								<Tile
									key={t.season}
									tile={t}
									playerIndex={playerIndex}
									mine={mine}
									lockLeftMs={mine && held ? Math.max(0, held.until - now) : null}
									blockedForMs={blockedForMs}
									disabled={busy || iGaveUp}
									onSelect={() => (mine ? undefined : void select(t.season))}
								/>
							);
						})}
					</div>

					{!iGaveUp && (
						<div className="remote-give-up">
							{confirmingGiveUp ? (
								<div className="give-up-confirm">
									<span>Give up on the whole game?</span>
									<button type="button" className="give-up-confirm__yes" onClick={confirmGiveUp} disabled={busy}>
										Yes, give up
									</button>
									<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirmingGiveUp(false)} disabled={busy}>
										Cancel
									</button>
								</div>
							) : (
								<button type="button" className="give-up-link" onClick={() => setConfirmingGiveUp(true)} disabled={busy}>
									Give up
								</button>
							)}
						</div>
					)}
				</>
			)}

			{error && <p className="remote-error">{error}</p>}

			<LeaveControl isHost={me?.isHost ?? false} onLeave={onLeave} />

			{/* The answer box is a modal (2026-09-13): the grid is 70 tiles tall,
			    so an inline box above it was off-screen by the time a phone had
			    scrolled down to tap 2024-25. Positioned a quarter of the way
			    down the screen, not centred or pinned to an edge (both tried on
			    real phones: centred left no room for the typeahead list, and a
			    top/bottom sheet got shoved around by the on-screen keyboard),
			    so the list opens BELOW the input (GuessInput's placement=
			    "below") with the modal itself staying put. Tapping outside, the
			    ×, or Escape puts the season back -- then tap another. */}
			{held && !iGaveUp && (
				<div className="remote-modal-backdrop remote-modal-backdrop--upper" onClick={() => void cancelHold()}>
					<div className="remote-modal" role="dialog" aria-modal="true" aria-label={`Who won in ${held.season}?`} onClick={(e) => e.stopPropagation()}>
						<div className="remote-modal__header">
							<h3 className="remote-modal__title">
								Who won in {held.season}? <span className="roh-answer__timer">{Math.ceil((held.until - now) / 1000)}s</span>
							</h3>
							<button type="button" className="remote-modal__close" onClick={() => void cancelHold()} aria-label="Put it back">
								×
							</button>
						</div>
						<GuessInput value={guess} onChange={setGuess} onPick={answer} disabled={busy} suggestUrl="/api/roll-of-honour/suggest" placement="below" />
						<p className="roh-sheet__hint">Tap outside to put it back and pick another season.</p>
					</div>
				</div>
			)}

			{chatOpen && (
				<ChatModal onPost={onPostMessage} now={now} cooldownUntil={chatCooldownUntil} onCooldown={setChatCooldownUntil} onClose={() => setChatOpen(false)} />
			)}
		</div>
	);
}

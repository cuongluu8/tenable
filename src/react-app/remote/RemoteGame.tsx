import { useEffect, useState } from "react";
import { BadgeChain } from "../components/BadgeChain";
import { GuessInput } from "../components/GuessInput";
import { colorForPlayerIndex } from "../components/playerColors";
import type { PublicMessage, PublicPlayer, RoundInfo, SessionState } from "./remoteApi";

const HINT_REVEAL_INTERVAL_MS = 30_000; // Matches remoteGameSession.ts's own HINT_REVEAL_INTERVAL_MS.
const HINT_TIER_COUNT = 3;
// Matches remoteGameSession.ts's own ROUND_START_GRACE_MS -- see that
// constant's own doc for why this exists (a poll-timing head start,
// confirmed live across three real devices) and why it's enforced
// server-side too, not just here: this only disables the LEGITIMATE
// guess box for this window, it isn't itself what makes guessing early
// impossible.
const ROUND_START_GRACE_MS = 5_000;

// Chat display. A message holds still next to its author's name for
// CHAT_HOLD_MS, then scrolls off leftwards (behind the name -- the bubble
// container clips it) over CHAT_SCROLL_MS and never comes back. Both are
// also baked into remote.css's remote-chat-scroll keyframes (hold = 10/11
// of the total) and the row flash's duration there, kept in step by hand.
// Hold was 5s at first; doubled 2026-09-13 as too short to read across a
// room. CHAT_MAX_FIRST_SEEN_AGE_MS: a message
// this old on FIRST sight (server-reported ageMs, so clock skew can't
// affect it) is treated as already over -- it's how a page refresh, or a
// player joining, doesn't replay something everyone else watched scroll
// away 15s ago. Comfortably above the 4s poll interval so a message that
// just missed one poll is still fresh on the next.
const CHAT_HOLD_MS = 10_000;
const CHAT_SCROLL_MS = 1_000;
const CHAT_MAX_FIRST_SEEN_AGE_MS = 12_000;
const CHAT_MAX_WORDS = 20; // Matches remoteGameSession.ts's MESSAGE_MAX_WORDS.
const CHAT_COOLDOWN_MS = 30_000; // Matches remoteGameSession.ts's MESSAGE_COOLDOWN_MS.

// Messages this tab has finished showing (scrolled away) or decided were
// already stale when first seen -- keyed on author + postedAt, which is
// what makes "a new message from the same player" distinct from "the
// same message again on the next poll". Module-level rather than
// component state so it survives the Leaderboard remounting between the
// round screen and the final results (the server keeps reporting a
// message for 20s -- see MESSAGE_VISIBLE_MS there -- and the ask is that
// once gone, it stays gone). Per tab, by design: a refresh is covered by
// the age check above instead.
const dismissedMessages = new Set<string>();
const shownMessages = new Set<string>();

function messageKey(playerId: string, message: PublicMessage): string {
	return `${playerId}:${message.postedAt}`;
}

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

interface ChatBubbleProps {
	playerId: string;
	message: PublicMessage;
}

// One player's live message in their leaderboard row. Mounted once per
// distinct message (keyed by the parent) so the CSS animation runs
// exactly once from mount; when it ends the message is recorded as
// dismissed and unmounted, and the Leaderboard's own check keeps it from
// ever mounting again.
function ChatBubble({ playerId, message }: ChatBubbleProps) {
	const key = messageKey(playerId, message);
	const [gone, setGone] = useState(false);
	useEffect(() => {
		shownMessages.add(key);
	}, [key]);
	if (gone) return null;
	return (
		<span className="remote-chat" aria-live="polite">
			<span
				className="remote-chat__text"
				style={{ animationDuration: `${CHAT_HOLD_MS + CHAT_SCROLL_MS}ms` }}
				onAnimationEnd={(e) => {
					// Several animations run on this element (the entrance pop and
					// the glow pulse end long before the hold does) -- only the
					// hold-then-scroll one means the message is over.
					if (e.animationName !== "remote-chat-scroll") return;
					dismissedMessages.add(key);
					setGone(true);
				}}
			>
				{message.text}
			</span>
		</span>
	);
}

function shouldShowMessage(playerId: string, message: PublicMessage | null): message is PublicMessage {
	if (!message) return false;
	const key = messageKey(playerId, message);
	if (dismissedMessages.has(key)) return false;
	// Already on screen: keep it there until its own animation ends, even
	// if a later poll reports it older than the first-sight cutoff.
	if (shownMessages.has(key)) return true;
	return message.ageMs < CHAT_MAX_FIRST_SEEN_AGE_MS;
}

// The emoji picker's set -- a fixed, hand-picked grid rather than a
// full Unicode picker library: reactions and football, which is what a
// 20-word heckle mid-round actually wants, and nothing to download.
const CHAT_EMOJIS = [
	"😂", "🤣", "😅", "😭", "😍", "🤔", "🤯", "😱", "🙄", "😴", "🤡", "😎",
	"🥳", "😤", "🤷", "🤦", "😬", "🥴", "🫣", "🤫", "👀", "🙏", "👏", "🙌",
	"👍", "👎", "💪", "🤝", "🔥", "💀", "🐐", "🐢", "⚽", "🥅", "🧤", "🏆",
	"🥇", "👑", "🎯", "⏰", "🍀", "❤️", "💚", "🎉",
];

interface ChatModalProps {
	onPost: (text: string) => Promise<{ error: string; retryAfterMs?: number } | null>;
	now: number;
	// Epoch ms the poster's cooldown ends (null: none running). Owned by
	// RemoteGame, not here, so it outlives this modal being closed and
	// reopened -- the countdown has to still be right on the next open.
	cooldownUntil: number | null;
	onCooldown: (until: number) => void;
	onClose: () => void;
}

// The chat composer, as a modal (2026-09-13 -- was an inline box under the
// round; moved off the page so the round screen stays about the round,
// opened from the 💬 next to your own name on the leaderboard). Enforces
// the same 20-word cap and 30s cooldown the server does
// (remoteGameSession.ts's MESSAGE_*), purely as feedback -- the server's
// own rejection is what actually holds, and its message is shown inline
// when it does. Closes itself once a message is accepted. `now` is
// RemoteGame's ticking clock, so the cooldown counts down visibly
// without its own interval.
function ChatModal({ onPost, now, cooldownUntil, onCooldown, onClose }: ChatModalProps) {
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emojiOpen, setEmojiOpen] = useState(false);

	const words = countWords(text);
	const overLimit = words > CHAT_MAX_WORDS;
	const cooldownLeftMs = cooldownUntil !== null ? Math.max(0, cooldownUntil - now) : 0;
	const coolingDown = cooldownLeftMs > 0;

	// Escape closes, same as the backdrop -- a real subscription on
	// window, so an effect is the right tool.
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	async function send() {
		const trimmed = text.trim();
		if (!trimmed || overLimit || coolingDown || sending) return;
		setSending(true);
		setError(null);
		const result = await onPost(trimmed);
		setSending(false);
		if (result) {
			setError(result.error);
			if (result.retryAfterMs) onCooldown(Date.now() + result.retryAfterMs);
			return;
		}
		onCooldown(Date.now() + CHAT_COOLDOWN_MS);
		onClose();
	}

	function addEmoji(emoji: string) {
		// A space before it unless we're at the start or already after one
		// -- keeps the word count honest (an emoji run stays one word, an
		// emoji after a word becomes its own).
		setText((t) => (t === "" || /\s$/.test(t) ? t + emoji : `${t} ${emoji}`));
	}

	return (
		<div className="remote-modal-backdrop" onClick={onClose}>
			<div className="remote-modal" role="dialog" aria-modal="true" aria-label="Send a message" onClick={(e) => e.stopPropagation()}>
				<div className="remote-modal__header">
					<h3 className="remote-modal__title">Say something</h3>
					<button type="button" className="remote-modal__close" onClick={onClose} aria-label="Close">
						×
					</button>
				</div>
				<form
					className="remote-chat-composer"
					onSubmit={(e) => {
						e.preventDefault();
						void send();
					}}
				>
					<input
						type="text"
						className="remote-chat-composer__input"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={coolingDown ? `You can post again in ${Math.ceil(cooldownLeftMs / 1000)}s` : "Type a message…"}
						disabled={sending || coolingDown}
						aria-label="Chat message"
						autoFocus
					/>
					<button
						type="button"
						className={emojiOpen ? "remote-emoji-toggle remote-emoji-toggle--open" : "remote-emoji-toggle"}
						onClick={() => setEmojiOpen((o) => !o)}
						aria-label={emojiOpen ? "Hide emojis" : "Add an emoji"}
						aria-expanded={emojiOpen}
						disabled={sending || coolingDown}
					>
						😀
					</button>
					<span className={overLimit ? "remote-chat-composer__count remote-chat-composer__count--over" : "remote-chat-composer__count"}>
						{words}/{CHAT_MAX_WORDS}
					</span>
					<button type="submit" className="remote-primary-button" disabled={!text.trim() || overLimit || coolingDown || sending}>
						Send
					</button>
					{error && <span className="remote-chat-composer__error">{error}</span>}
				</form>
				{emojiOpen && (
					<div className="remote-emoji-grid" role="group" aria-label="Emojis">
						{CHAT_EMOJIS.map((emoji) => (
							<button key={emoji} type="button" className="remote-emoji-grid__item" onClick={() => addEmoji(emoji)}>
								{emoji}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

interface GuessAreaProps {
	onGuess: (guess: string) => Promise<"correct" | "wrong" | null>;
	onGiveUp: () => Promise<void>;
}

// Owns the guess box's own local state (the typed value, in-flight/
// feedback status, the give-up confirmation step) -- split out from
// RemoteGame and remounted fresh via `key={round.index}` there, rather
// than an effect resetting this state when the round changes: React's own
// recommended way to reset local state on a prop change is a fresh
// component instance, not a setState-in-an-effect that would otherwise
// cause an extra render.
function GuessArea({ onGuess, onGiveUp }: GuessAreaProps) {
	const [value, setValue] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
	// Same two-step "confirm before it costs you" guard as Club Run's own
	// RoundPlay.tsx (and the daily game's PlayScreen.tsx) -- identical
	// markup and classes (.give-up-link/.give-up-confirm, global in
	// App.css) so remote play's give-up looks and behaves exactly like the
	// one players already know, rather than a remote-specific variant.
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

	async function handleGuess(text: string) {
		if (submitting || !text.trim()) return;
		setSubmitting(true);
		const result = await onGuess(text);
		setSubmitting(false);
		if (result) setFeedback(result);
		if (result === "wrong") setValue("");
	}

	async function confirmGiveUp() {
		if (submitting) return;
		setConfirmingGiveUp(false);
		setSubmitting(true);
		await onGiveUp();
		setSubmitting(false);
	}

	return (
		<>
			{feedback === "wrong" && <p className="remote-feedback remote-feedback--wrong">Not quite -- try again!</p>}
			<GuessInput value={value} onChange={setValue} onPick={handleGuess} disabled={submitting} suggestUrl="/api/club-badges/suggest" />
			{/* .give-up-link/.give-up-confirm center themselves with align-self,
			    which only works inside a flex column (RoundPlay's .cb-play is
			    one; this screen's .screen isn't) -- hence the wrapper. */}
			<div className="remote-give-up">
				{confirmingGiveUp ? (
					<div className="give-up-confirm">
						<span>Give up on this one?</span>
						<button type="button" className="give-up-confirm__yes" onClick={confirmGiveUp} disabled={submitting}>
							Yes, give up
						</button>
						<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirmingGiveUp(false)} disabled={submitting}>
							Cancel
						</button>
					</div>
				) : (
					<button type="button" className="give-up-link" onClick={() => setConfirmingGiveUp(true)} disabled={submitting}>
						Give up
					</button>
				)}
			</div>
		</>
	);
}

interface LeaderboardProps {
	players: PublicPlayer[];
	myPlayerId: string;
	// The open round, when there is one -- only for the per-player Away/
	// Gave up tags; the final-results screen passes nothing.
	round?: RoundInfo | null;
	compact?: boolean;
	// When given, a 💬 button sits next to the local player's own name --
	// the way into ChatModal. The final-results screen passes nothing.
	onOpenChat?: () => void;
}

// Ranked standings, on screen for the whole game (2026-09-13 -- asked for
// after a real session where the plain join-order roster, with its bare
// wins count, didn't read as a leaderboard at all), and the same list the
// final-results screen shows -- one component so "who's winning" mid-game
// and "who won" at the end are visibly the same thing. Ordered by wins,
// ties broken by join order (state.players order) so a tie doesn't shuffle
// people around between polls; tied players share a rank rather than one
// arbitrarily ranking above the other.
function Leaderboard({ players, myPlayerId, round, compact, onOpenChat }: LeaderboardProps) {
	const ranked = [...players].sort((a, b) => b.wins - a.wins);
	return (
		<ol className={compact ? "remote-standings remote-standings--compact" : "remote-standings"}>
			{ranked.map((p, i) => {
				const rank = i > 0 && ranked[i - 1].wins === p.wins ? null : i + 1;
				const message = shouldShowMessage(p.id, p.message) ? p.message : null;
				return (
					<li key={p.id} className={message ? "remote-standings__item remote-standings__item--speaking" : "remote-standings__item"}>
						<span className="remote-standings__rank">{rank ?? "="}</span>
						<span className="remote-players__color" style={{ background: colorForPlayerIndex(players.indexOf(p)) }} />
						<span className="remote-standings__name">
							{p.name}
							{p.id === myPlayerId && " (you)"}
						</span>
						{onOpenChat && p.id === myPlayerId && (
							<button type="button" className="remote-chat-launch" onClick={onOpenChat} aria-label="Send a message" title="Send a message">
								💬
							</button>
						)}
						{/* Always rendered (empty or not) so it's what takes up the
						    row's spare width -- the message bubble scrolls off into
						    its left edge, i.e. visually behind the name. */}
						<span className="remote-standings__chat">
							{message && <ChatBubble key={messageKey(p.id, message)} playerId={p.id} message={message} />}
						</span>
						{p.away && <span className="remote-badge remote-badge--away">Away</span>}
						{round && round.answerName === null && round.givenUpPlayerIds.includes(p.id) && (
							<span className="remote-badge remote-badge--gave-up">Gave up</span>
						)}
						<span className="remote-standings__wins">
							{p.wins} win{p.wins === 1 ? "" : "s"}
						</span>
					</li>
				);
			})}
		</ol>
	);
}

interface LeaveControlProps {
	isHost: boolean;
	onLeave: () => void;
}

// The lobby's own "Leave game" (RemoteLobby.tsx), carried into the game
// itself (2026-09-13) so nobody's stuck in a round with no way out. Two
// differences from the lobby's plain button: the host's version is
// labelled for what it actually does (remoteGameSession.ts's /leave ends
// the session for EVERYONE when the host calls it -- see its own doc),
// and both get the same two-step confirm as give-up -- a host mis-tap
// would end everyone's game, and a guest who leaves comes back (via the
// code or join link, mid-game joining is open) as a fresh seat on zero
// wins, their tally gone.
function LeaveControl({ isHost, onLeave }: LeaveControlProps) {
	const [confirming, setConfirming] = useState(false);
	if (confirming) {
		return (
			<div className="remote-leave-confirm">
				<span>{isHost ? "End the game for everyone?" : "Leave this game? Rejoining starts you back on 0 wins."}</span>
				<button type="button" className="give-up-confirm__yes" onClick={onLeave}>
					{isHost ? "Yes, end game" : "Yes, leave"}
				</button>
				<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirming(false)}>
					Cancel
				</button>
			</div>
		);
	}
	return (
		<button type="button" className="remote-leave-button" onClick={() => setConfirming(true)}>
			{isHost ? "End game" : "Leave game"}
		</button>
	);
}

interface Props {
	state: SessionState;
	myPlayerId: string;
	error: string | null;
	onGuess: (guess: string) => Promise<"correct" | "wrong" | null>;
	onGiveUp: () => Promise<void>;
	onPostMessage: (text: string) => Promise<{ error: string; retryAfterMs?: number } | null>;
	onSetReady: (ready: boolean) => void;
	onLeave: () => void;
}

// The live round, plus the final standings once the whole game is done --
// both share this one screen since they're really the same "in-progress
// or just-finished game" view, not two separate places to navigate
// between.
export function RemoteGame({ state, myPlayerId, error, onGuess, onGiveUp, onPostMessage, onSetReady, onLeave }: Props) {
	// Ticks once a second, for the whole in-progress game, purely to
	// re-render the display-only clocks: the start countdown, "next hint
	// in Ns" (the actual hint reveal is decided server-side -- see
	// remoteGameSession.ts's publicQuestion -- this is never the source of
	// truth for what's revealed) and the chat composer's post cooldown.
	// Used to stop between rounds, before chat existed; a 1/s re-render of
	// this one screen isn't worth the bookkeeping of restarting it for
	// each clock that needs it. `now` (not a bare re-render counter) so
	// each clock's own math can read it instead of calling Date.now()
	// directly during render, which React's purity rules disallow.
	const [now, setNow] = useState(() => Date.now());
	const inProgress = state.status === "in_progress";
	const [chatOpen, setChatOpen] = useState(false);
	// See ChatModalProps.cooldownUntil on why this lives here.
	const [chatCooldownUntil, setChatCooldownUntil] = useState<number | null>(null);

	useEffect(() => {
		if (!inProgress) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [inProgress]);

	const round = state.round;

	if (state.status === "finished") {
		return (
			<div className="screen">
				<h2>Final results</h2>
				<Leaderboard players={state.players} myPlayerId={myPlayerId} />
				<button type="button" className="remote-primary-button" onClick={onLeave}>
					Done
				</button>
			</div>
		);
	}

	if (!round) return null; // status is "in_progress" but round data hasn't arrived yet -- a one-poll gap at worst.

	const question = round.question;
	const winner = round.winnerId ? state.players.find((p) => p.id === round.winnerId) : null;
	const roundDecided = round.answerName !== null;
	const me = state.players.find((p) => p.id === myPlayerId);
	const iGaveUp = round.givenUpPlayerIds.includes(myPlayerId);
	const secondsToNextHint =
		round.hintsRevealed < HINT_TIER_COUNT && round.startedAt
			? Math.max(0, Math.ceil((round.startedAt + (round.hintsRevealed + 1) * HINT_REVEAL_INTERVAL_MS - now) / 1000))
			: null;
	const secondsToGuessUnlock = round.startedAt
		? Math.max(0, Math.ceil((round.startedAt + ROUND_START_GRACE_MS - now) / 1000))
		: 0;
	// The whole question -- not just the guess box -- stays hidden until
	// the grace window closes (2026-09-13). Locking only the guess box
	// still let whoever's poll (or own /ready call) caught the new round
	// first START READING the badges seconds before everyone else, a real
	// head start in a race that's mostly recognition. Timed off the
	// server's roundStartedAt on every device, so the reveal lands at the
	// same wall-clock instant everywhere rather than staggered by poll
	// timing -- which is also why this is a client-side hide and NOT the
	// server withholding the question the way it withholds hints: a
	// server-side reveal would only reach each client on its next poll,
	// re-staggering the very thing this exists to line up. The server's
	// own guess rejection for this same window still stands regardless.
	const revealPending = !roundDecided && secondsToGuessUnlock > 0;

	return (
		<div className="screen">
			<div className="remote-round-header">
				<span>
					Question {round.index + 1} of {round.total}
				</span>
				{!revealPending && secondsToNextHint !== null && <span className="remote-hint-timer">Next hint in {secondsToNextHint}s</span>}
			</div>

			<Leaderboard players={state.players} myPlayerId={myPlayerId} round={round} compact onOpenChat={() => setChatOpen(true)} />

			{revealPending ? (
				<div className="remote-countdown" aria-live="polite">
					<p className="remote-countdown__label">{round.index === 0 ? "First question in" : "Next question in"}</p>
					<p className="remote-countdown__value">{secondsToGuessUnlock}</p>
				</div>
			) : (
				<>
					<BadgeChain question={question} countryRevealed={round.hintsRevealed >= 1} transferDateRevealed={round.hintsRevealed >= 3} />
					{question.nationality && <p className="remote-hint">Nationality: {question.nationality}</p>}
				</>
			)}

			{revealPending ? null : roundDecided ? (
				<div className="remote-round-result">
					{winner ? (
						<p>
							🎉 {winner.name} got it -- <strong>{round.answerName}</strong>
						</p>
					) : (
						// Everyone still in the room gave up -- same reveal Club
						// Run's own give-up shows ("It was X"), no ❌ since nobody
						// guessed wrong, they just stopped.
						<p>
							Nobody got this one -- it was <strong>{round.answerName}</strong>
						</p>
					)}
					{me?.isHost ? (
						<p className="remote-subtitle">Waiting for everyone to be ready for the next question…</p>
					) : (
						<button
							type="button"
							className={me?.ready ? "remote-ready-toggle remote-ready-toggle--active" : "remote-ready-toggle"}
							onClick={() => onSetReady(!me?.ready)}
						>
							{me?.ready ? "Not ready" : "Ready for next question"}
						</button>
					)}
				</div>
			) : iGaveUp ? (
				// Mirrors RoundPlay.tsx's mid-question pass-and-play copy ("You
				// gave up on this one.") -- and, like there, the answer itself
				// stays hidden while others are still racing for it; it arrives
				// with the round result above once the round is decided.
				<p className="remote-subtitle">You gave up on this one. Waiting for the others…</p>
			) : (
				<GuessArea key={round.index} onGuess={onGuess} onGiveUp={onGiveUp} />
			)}

			{error && <p className="remote-error">{error}</p>}

			<LeaveControl isHost={me?.isHost ?? false} onLeave={onLeave} />

			{chatOpen && (
				<ChatModal
					onPost={onPostMessage}
					now={now}
					cooldownUntil={chatCooldownUntil}
					onCooldown={setChatCooldownUntil}
					onClose={() => setChatOpen(false)}
				/>
			)}
		</div>
	);
}

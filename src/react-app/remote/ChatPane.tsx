import { useEffect, useRef, useState } from "react";
import { colorForPlayerIndex } from "../components/playerColors";
import { getSafeViewport, type SafeViewport } from "../lib/safeViewport";
import type { FeedEntry, PublicPlayer } from "./remoteApi";

const CHAT_MAX_WORDS = 20; // Matches remoteGameSession.ts's MESSAGE_MAX_WORDS.
const CHAT_COOLDOWN_MS = 30_000; // Matches remoteGameSession.ts's MESSAGE_COOLDOWN_MS.
// Above this the pane is a permanent side column next to the game rather
// than a drawer over it -- see remote.css's matching media query.
const SIDE_COLUMN_MIN_WIDTH = 960;

// The emoji picker's set -- a fixed, hand-picked grid rather than a full
// Unicode picker library: reactions and football, which is what a 20-word
// heckle mid-round actually wants, and nothing to download.
const CHAT_EMOJIS = [
	"😂", "🤣", "😅", "😭", "😍", "🤔", "🤯", "😱", "🙄", "😴", "🤡", "😎",
	"🥳", "😤", "🤷", "🤦", "😬", "🥴", "🫣", "🤫", "👀", "🙏", "👏", "🙌",
	"👍", "👎", "💪", "🤝", "🔥", "💀", "🐐", "🐢", "⚽", "🥅", "🧤", "🏆",
	"🥇", "👑", "🎯", "⏰", "🍀", "❤️", "💚", "🎉",
];

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

// The visible viewport (see lib/safeViewport.ts), kept live -- the pane
// is sized to THIS, not to 100vh, so on a phone the composer at its foot
// rides up above the on-screen keyboard instead of disappearing behind
// it, and the whole pane stays inside what's actually on screen when iOS
// collapses/expands its address bar.
function useSafeViewport(): SafeViewport {
	const [safe, setSafe] = useState<SafeViewport>(() => getSafeViewport());
	useEffect(() => {
		const update = () => setSafe(getSafeViewport());
		const vv = window.visualViewport;
		vv?.addEventListener("resize", update);
		vv?.addEventListener("scroll", update);
		window.addEventListener("resize", update);
		return () => {
			vv?.removeEventListener("resize", update);
			vv?.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, []);
	return safe;
}

function useIsSideColumn(): boolean {
	const [wide, setWide] = useState(() => window.matchMedia(`(min-width: ${SIDE_COLUMN_MIN_WIDTH}px)`).matches);
	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${SIDE_COLUMN_MIN_WIDTH}px)`);
		const onChange = () => setWide(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	return wide;
}

function formatTime(at: number): string {
	const d = new Date(at);
	return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

interface Props {
	feed: FeedEntry[];
	players: PublicPlayer[];
	myPlayerId: string;
	onPost: (text: string) => Promise<{ error: string; retryAfterMs?: number } | null>;
	now: number;
}

// Chat + activity, as a side pane (2026-09-14 -- replaced the one-message
// modal, which was hard to use on a phone and easy to miss). Holds the
// whole session's history (every chat message, every guess with its
// verdict, give-ups, round and game events -- see remoteGameSession.ts's
// FeedEntry), fed by useRemoteSession's accumulated `feed`. On a phone it's
// a drawer over the game, opened from a floating 💬 that carries an
// unread-messages badge; from SIDE_COLUMN_MIN_WIDTH up it's a permanent
// column beside the game (remote.css shifts the game over). The composer
// keeps the same 20-word / 30s-cooldown rules the server enforces, shown
// as feedback only.
export function ChatDock({ feed, players, myPlayerId, onPost, now }: Props) {
	const sideColumn = useIsSideColumn();
	const [open, setOpen] = useState(sideColumn);
	const safe = useSafeViewport();
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emojiOpen, setEmojiOpen] = useState(false);
	const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
	// The newest feed id this player has had on screen -- unread = chat
	// from others newer than this. Starts at whatever's already there on
	// mount (history isn't "unread").
	const [lastSeenId, setLastSeenId] = useState(() => (feed.length ? feed[feed.length - 1].id : 0));
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const visible = open || sideColumn;
	const latestId = feed.length ? feed[feed.length - 1].id : 0;
	const unread = visible ? 0 : feed.filter((e) => e.id > lastSeenId && e.kind === "chat" && e.playerId !== myPlayerId).length;

	// While on screen, everything that arrives counts as seen -- React's
	// "adjust state during render" pattern (guarded), same as RoundPlay.tsx
	// -- and the list stays pinned to the newest entry (a DOM effect).
	if (visible && lastSeenId !== latestId) setLastSeenId(latestId);
	useEffect(() => {
		if (!visible) return;
		const el = listRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [visible, latestId]);

	// Desktop: the game makes room for the column (see remote.css).
	useEffect(() => {
		document.body.classList.toggle("remote-pane-open", sideColumn);
		return () => document.body.classList.remove("remote-pane-open");
	}, [sideColumn]);

	// Escape closes the drawer (phones only -- the column has no "closed").
	useEffect(() => {
		if (!open || sideColumn) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, sideColumn]);

	const words = countWords(text);
	const overLimit = words > CHAT_MAX_WORDS;
	const cooldownLeftMs = cooldownUntil !== null ? Math.max(0, cooldownUntil - now) : 0;
	const coolingDown = cooldownLeftMs > 0;

	async function send() {
		const trimmed = text.trim();
		if (!trimmed || overLimit || coolingDown || sending) return;
		setSending(true);
		setError(null);
		const result = await onPost(trimmed);
		setSending(false);
		if (result) {
			setError(result.error);
			if (result.retryAfterMs) setCooldownUntil(Date.now() + result.retryAfterMs);
			return;
		}
		setText("");
		setEmojiOpen(false);
		setCooldownUntil(Date.now() + CHAT_COOLDOWN_MS);
		inputRef.current?.focus();
	}

	function addEmoji(emoji: string) {
		setText((t) => (t === "" || /\s$/.test(t) ? t + emoji : `${t} ${emoji}`));
		inputRef.current?.focus();
	}

	const nameOf = (id: string | null) => (id ? players.find((p) => p.id === id)?.name ?? "Someone" : "");
	const colorOf = (id: string | null) => {
		const i = players.findIndex((p) => p.id === id);
		return i >= 0 ? colorForPlayerIndex(i) : "#9ca3af";
	};

	return (
		<>
			{!visible && (
				<button
					type="button"
					className={unread > 0 ? "remote-chat-fab remote-chat-fab--unread" : "remote-chat-fab"}
					onClick={() => setOpen(true)}
					aria-label={unread > 0 ? `Open chat, ${unread} new message${unread === 1 ? "" : "s"}` : "Open chat"}
					// Kept inside the safe zone too: above the keyboard if one is up.
					style={{ bottom: `calc(${Math.max(0, window.innerHeight - safe.bottom)}px + 1rem)` }}
				>
					💬
					{unread > 0 && <span className="remote-chat-fab__badge">{unread}</span>}
				</button>
			)}

			{visible && (
				<aside
					className={sideColumn ? "remote-pane remote-pane--column" : "remote-pane"}
					role="complementary"
					aria-label="Chat and activity"
					// Sized to the visible viewport, not 100vh -- see useSafeViewport.
					style={sideColumn ? undefined : { top: safe.top, height: safe.height }}
				>
					<div className="remote-pane__header">
						<h3 className="remote-pane__title">Chat &amp; activity</h3>
						{!sideColumn && (
							<button type="button" className="remote-modal__close" onClick={() => setOpen(false)} aria-label="Close chat">
								×
							</button>
						)}
					</div>

					<div className="remote-pane__list" ref={listRef} aria-live="polite">
						{feed.length === 0 && <p className="remote-pane__empty">Nothing yet -- say hello, or make a guess.</p>}
						{feed.map((e) => {
							if (e.kind === "system") {
								return (
									<p key={e.id} className="remote-pane__entry remote-pane__entry--system">
										{e.text}
									</p>
								);
							}
							const mine = e.playerId === myPlayerId;
							const color = colorOf(e.playerId);
							if (e.kind === "chat") {
								return (
									<p key={e.id} className={mine ? "remote-pane__entry remote-pane__entry--chat remote-pane__entry--mine" : "remote-pane__entry remote-pane__entry--chat"}>
										<span className="remote-pane__who" style={{ color }}>
											{mine ? "You" : nameOf(e.playerId)}
										</span>
										<span className="remote-pane__bubble" style={mine ? undefined : { borderColor: color }}>
											{e.text}
										</span>
										<span className="remote-pane__time">{formatTime(e.at)}</span>
									</p>
								);
							}
							if (e.kind === "give-up") {
								return (
									<p key={e.id} className="remote-pane__entry remote-pane__entry--event">
										<span className="remote-pane__dot" style={{ background: color }} />
										<span className="remote-pane__who" style={{ color }}>
											{nameOf(e.playerId)}
										</span>{" "}
										gave up
									</p>
								);
							}
							// A guess, right or wrong.
							return (
								<p key={e.id} className={e.correct ? "remote-pane__entry remote-pane__entry--event remote-pane__entry--right" : "remote-pane__entry remote-pane__entry--event"}>
									<span className="remote-pane__dot" style={{ background: color }} />
									<span className="remote-pane__who" style={{ color }}>
										{nameOf(e.playerId)}
									</span>{" "}
									{e.correct ? "✓" : "✗"}
									{e.season ? ` ${e.season}:` : ""} <span className="remote-pane__guess">{e.text}</span>
								</p>
							);
						})}
					</div>

					<form
						className="remote-pane__composer"
						onSubmit={(ev) => {
							ev.preventDefault();
							void send();
						}}
					>
						<div className="remote-chat-composer">
							<input
								ref={inputRef}
								type="text"
								className="remote-chat-composer__input"
								value={text}
								onChange={(ev) => setText(ev.target.value)}
								placeholder={coolingDown ? `You can post again in ${Math.ceil(cooldownLeftMs / 1000)}s` : "Type a message…"}
								disabled={sending || coolingDown}
								aria-label="Chat message"
								enterKeyHint="send"
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
						</div>
						{emojiOpen && (
							<div className="remote-emoji-grid" role="group" aria-label="Emojis">
								{CHAT_EMOJIS.map((emoji) => (
									<button key={emoji} type="button" className="remote-emoji-grid__item" onClick={() => addEmoji(emoji)}>
										{emoji}
									</button>
								))}
							</div>
						)}
					</form>
				</aside>
			)}
		</>
	);
}

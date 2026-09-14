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

// Chat + activity (2026-09-14). Holds the whole session's history (every
// chat message, every guess with its verdict, give-ups, round and game
// events -- see remoteGameSession.ts's FeedEntry), fed by
// useRemoteSession's accumulated `feed`. Two layouts:
//   - phones/tablets (below SIDE_COLUMN_MIN_WIDTH): a fixed bar across the
//     top of the game, always visible -- the last three lines of activity
//     (scrollable back through the history) and the composer -- pinned to
//     the VISIBLE viewport's top so it stays put when iOS collapses its
//     address bar or the keyboard comes up. It replaced a drawer behind a
//     floating button, which was awkward on a phone and easy to miss. The
//     ticker is hidden while a game screen is up so the bar has the top.
//   - from SIDE_COLUMN_MIN_WIDTH up: a permanent column beside the game
//     (remote.css shifts the game over), full bubbles and timestamps.
// The composer keeps the 20-word / 30s-cooldown rules the server enforces,
// shown as feedback only.
export function ChatDock({ feed, players, myPlayerId, onPost, now }: Props) {
	const sideColumn = useIsSideColumn();
	const safe = useSafeViewport();
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emojiOpen, setEmojiOpen] = useState(false);
	const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const barRef = useRef<HTMLElement>(null);

	const latestId = feed.length ? feed[feed.length - 1].id : 0;

	// Pinned to the newest entry as history arrives (a DOM effect).
	useEffect(() => {
		const el = listRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [latestId, sideColumn]);

	// A game screen is up: hide the ticker (remote.css) and, on desktop,
	// make room for the column.
	useEffect(() => {
		document.body.classList.add("remote-in-game");
		document.body.classList.toggle("remote-pane-open", sideColumn);
		return () => {
			document.body.classList.remove("remote-in-game", "remote-pane-open");
		};
	}, [sideColumn]);

	// Phones: the game is padded down by however tall the bar currently is
	// (it grows when the emoji grid or an error line is open), measured
	// rather than guessed, via a CSS variable remote.css reads.
	useEffect(() => {
		const el = barRef.current;
		if (!el || sideColumn) {
			document.body.style.removeProperty("--remote-chat-bar-height");
			return;
		}
		const apply = () => document.body.style.setProperty("--remote-chat-bar-height", `${el.getBoundingClientRect().height}px`);
		apply();
		const ro = new ResizeObserver(apply);
		ro.observe(el);
		return () => {
			ro.disconnect();
			document.body.style.removeProperty("--remote-chat-bar-height");
		};
	}, [sideColumn]);

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

	const composer = (
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
	);

	if (!sideColumn) {
		// Phone bar: one line per entry, newest at the bottom, three visible.
		return (
			<header ref={barRef} className="remote-chat-bar" role="complementary" aria-label="Chat and activity" style={{ top: safe.top }}>
				<div className="remote-chat-bar__list" ref={listRef} aria-live="polite">
					{feed.map((e) => {
						if (e.kind === "system") {
							return (
								<p key={e.id} className="remote-pane__entry remote-pane__entry--line remote-pane__entry--system">
									{e.text}
								</p>
							);
						}
						const color = colorOf(e.playerId);
						const who = e.playerId === myPlayerId ? "You" : nameOf(e.playerId);
						if (e.kind === "chat") {
							return (
								<p key={e.id} className="remote-pane__entry remote-pane__entry--line remote-pane__entry--chat">
									<span className="remote-pane__who" style={{ color }}>
										{who}:
									</span>{" "}
									<span className="remote-pane__bubble-text">{e.text}</span>
								</p>
							);
						}
						if (e.kind === "give-up") {
							return (
								<p key={e.id} className="remote-pane__entry remote-pane__entry--line remote-pane__entry--event">
									<span className="remote-pane__who" style={{ color }}>
										{who}
									</span>{" "}
									gave up
								</p>
							);
						}
						return (
							<p key={e.id} className={e.correct ? "remote-pane__entry remote-pane__entry--line remote-pane__entry--event remote-pane__entry--right" : "remote-pane__entry remote-pane__entry--line remote-pane__entry--event"}>
								<span className="remote-pane__who" style={{ color }}>
									{who}
								</span>{" "}
								{e.correct ? "✓" : "✗"}
								{e.season ? ` ${e.season}:` : ""} <span className="remote-pane__guess">{e.text}</span>
							</p>
						);
					})}
				</div>
				{composer}
			</header>
		);
	}

	return (
		<aside className="remote-pane remote-pane--column" role="complementary" aria-label="Chat and activity">
			<div className="remote-pane__header">
				<h3 className="remote-pane__title">Chat &amp; activity</h3>
			</div>

			<div className="remote-pane__list" ref={listRef} aria-live="polite">
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

			{composer}
		</aside>
	);
}

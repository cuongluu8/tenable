import { useEffect, useState } from "react";
import { BadgeChain } from "../components/BadgeChain";
import { GuessInput } from "../components/GuessInput";
import { colorForPlayerIndex } from "../components/playerColors";
import type { SessionState } from "./remoteApi";

const HINT_REVEAL_INTERVAL_MS = 30_000; // Matches remoteGameSession.ts's own HINT_REVEAL_INTERVAL_MS.
const HINT_TIER_COUNT = 3;
// Matches remoteGameSession.ts's own ROUND_START_GRACE_MS -- see that
// constant's own doc for why this exists (a poll-timing head start,
// confirmed live across three real devices) and why it's enforced
// server-side too, not just here: this only disables the LEGITIMATE
// guess box for this window, it isn't itself what makes guessing early
// impossible.
const ROUND_START_GRACE_MS = 5_000;

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

interface Props {
	state: SessionState;
	myPlayerId: string;
	error: string | null;
	onGuess: (guess: string) => Promise<"correct" | "wrong" | null>;
	onGiveUp: () => Promise<void>;
	onSetReady: (ready: boolean) => void;
	onLeave: () => void;
}

// The live round, plus the final standings once the whole game is done --
// both share this one screen since they're really the same "in-progress
// or just-finished game" view, not two separate places to navigate
// between.
export function RemoteGame({ state, myPlayerId, error, onGuess, onGiveUp, onSetReady, onLeave }: Props) {
	// Ticks once a second purely to re-render the "next hint in Ns"
	// countdown -- the actual hint reveal is decided server-side (see
	// remoteGameSession.ts's publicQuestion), this is display-only and
	// never itself the source of truth for what's revealed. `now` (not a
	// bare re-render counter) so the countdown's own math can read it
	// instead of calling Date.now() directly during render, which React's
	// purity rules disallow.
	const [now, setNow] = useState(() => Date.now());

	const round = state.round;
	// answerName, not winnerId, is the "round decided" signal -- a round
	// where everyone gave up has an answer to show but no winner (see
	// remoteGameSession.ts's isRoundDecided).
	const roundOpen = round !== null && round.answerName === null;

	useEffect(() => {
		if (!roundOpen || (round && round.hintsRevealed >= HINT_TIER_COUNT)) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [roundOpen, round]);

	if (state.status === "finished") {
		const standings = [...state.players].sort((a, b) => b.wins - a.wins);
		return (
			<div className="screen">
				<h2>Final results</h2>
				<ol className="remote-standings">
					{standings.map((p, i) => (
						<li key={p.id} className="remote-standings__item">
							<span className="remote-standings__rank">{i + 1}</span>
							<span className="remote-players__color" style={{ background: colorForPlayerIndex(state.players.indexOf(p)) }} />
							<span className="remote-standings__name">
								{p.name}
								{p.id === myPlayerId && " (you)"}
							</span>
							<span className="remote-standings__wins">
								{p.wins} win{p.wins === 1 ? "" : "s"}
							</span>
						</li>
					))}
				</ol>
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

	return (
		<div className="screen">
			<div className="remote-round-header">
				<span>
					Question {round.index + 1} of {round.total}
				</span>
				{secondsToNextHint !== null && <span className="remote-hint-timer">Next hint in {secondsToNextHint}s</span>}
			</div>

			<ul className="remote-players remote-players--sidebar">
				{state.players.map((p, i) => (
					<li key={p.id} className="remote-players__item">
						<span className="remote-players__color" style={{ background: colorForPlayerIndex(i) }} />
						<span className="remote-players__name">
							{p.name}
							{p.id === myPlayerId && " (you)"}
						</span>
						{p.away && <span className="remote-badge remote-badge--away">Away</span>}
						{!roundDecided && round.givenUpPlayerIds.includes(p.id) && (
							<span className="remote-badge remote-badge--gave-up">Gave up</span>
						)}
						<span className="remote-players__wins">{p.wins}</span>
					</li>
				))}
			</ul>

			<BadgeChain question={question} countryRevealed={round.hintsRevealed >= 1} transferDateRevealed={round.hintsRevealed >= 3} />

			{question.nationality && <p className="remote-hint">Nationality: {question.nationality}</p>}

			{roundDecided ? (
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
			) : secondsToGuessUnlock > 0 ? (
				// Every client sees this same countdown, timed off the server's
				// own roundStartedAt rather than whenever each one's own poll
				// happened to first notice the round -- see ROUND_START_GRACE_MS's
				// own doc on the head start this closes.
				<p className="remote-subtitle">Get ready… guessing unlocks in {secondsToGuessUnlock}s</p>
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
		</div>
	);
}

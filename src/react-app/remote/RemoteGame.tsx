import { useEffect, useState } from "react";
import { BadgeChain } from "../components/BadgeChain";
import { GuessInput } from "../components/GuessInput";
import { colorForPlayerIndex } from "../components/playerColors";
import type { SessionState } from "./remoteApi";

const HINT_REVEAL_INTERVAL_MS = 30_000; // Matches remoteGameSession.ts's own HINT_REVEAL_INTERVAL_MS.
const HINT_TIER_COUNT = 3;

interface GuessAreaProps {
	onGuess: (guess: string) => Promise<"correct" | "wrong" | null>;
}

// Owns the guess box's own local state (the typed value, in-flight/
// feedback status) -- split out from RemoteGame and remounted fresh via
// `key={round.index}` there, rather than an effect resetting this state
// when the round changes: React's own recommended way to reset local
// state on a prop change is a fresh component instance, not a
// setState-in-an-effect that would otherwise cause an extra render.
function GuessArea({ onGuess }: GuessAreaProps) {
	const [value, setValue] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

	async function handleGuess(text: string) {
		if (submitting || !text.trim()) return;
		setSubmitting(true);
		const result = await onGuess(text);
		setSubmitting(false);
		if (result) setFeedback(result);
		if (result === "wrong") setValue("");
	}

	return (
		<>
			{feedback === "wrong" && <p className="remote-feedback remote-feedback--wrong">Not quite -- try again!</p>}
			<GuessInput value={value} onChange={setValue} onPick={handleGuess} disabled={submitting} suggestUrl="/api/club-badges/suggest" />
		</>
	);
}

interface Props {
	state: SessionState;
	myPlayerId: string;
	error: string | null;
	onGuess: (guess: string) => Promise<"correct" | "wrong" | null>;
	onSetReady: (ready: boolean) => void;
	onLeave: () => void;
}

// The live round, plus the final standings once the whole game is done --
// both share this one screen since they're really the same "in-progress
// or just-finished game" view, not two separate places to navigate
// between.
export function RemoteGame({ state, myPlayerId, error, onGuess, onSetReady, onLeave }: Props) {
	// Ticks once a second purely to re-render the "next hint in Ns"
	// countdown -- the actual hint reveal is decided server-side (see
	// remoteGameSession.ts's publicQuestion), this is display-only and
	// never itself the source of truth for what's revealed. `now` (not a
	// bare re-render counter) so the countdown's own math can read it
	// instead of calling Date.now() directly during render, which React's
	// purity rules disallow.
	const [now, setNow] = useState(() => Date.now());

	const round = state.round;
	const roundOpen = round !== null && round.winnerId === null;

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
	const me = state.players.find((p) => p.id === myPlayerId);
	const secondsToNextHint =
		round.hintsRevealed < HINT_TIER_COUNT && round.startedAt
			? Math.max(0, Math.ceil((round.startedAt + (round.hintsRevealed + 1) * HINT_REVEAL_INTERVAL_MS - now) / 1000))
			: null;

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
						<span className="remote-players__wins">{p.wins}</span>
					</li>
				))}
			</ul>

			<BadgeChain question={question} countryRevealed={round.hintsRevealed >= 1} transferDateRevealed={round.hintsRevealed >= 3} />

			{question.nationality && <p className="remote-hint">Nationality: {question.nationality}</p>}

			{winner ? (
				<div className="remote-round-result">
					<p>
						🎉 {winner.name} got it -- <strong>{round.answerName}</strong>
					</p>
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
			) : (
				<GuessArea key={round.index} onGuess={onGuess} />
			)}

			{error && <p className="remote-error">{error}</p>}
		</div>
	);
}

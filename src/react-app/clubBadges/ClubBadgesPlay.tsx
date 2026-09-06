import { useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { BadgeTile } from "./BadgeTile";
import { currentTurnIndex, HINT_KEYS, type CbBadge, type CbState, type HintKey } from "./state";

// Tiles are a fixed 64x64 (see clubBadges.css's .cb-badge) so a row's width
// is predictable regardless of viewport -- 4 fits comfortably even on a
// narrow phone screen without needing to measure the actual container.
const ROW_SIZE = 4;

interface BadgeRowItem {
	badge: CbBadge;
	originalIndex: number;
}

// Splits a chronological badge sequence into fixed-size rows for a
// boustrophedon ("snake") layout: odd rows (2nd, 4th, ...) are reversed for
// display, so the path reads left-to-right, then right-to-left, then
// left-to-right again -- continuing visually from wherever the previous row
// ended, instead of every wrapped row restarting at the left the way plain
// flex-wrap would. See the render below for how the arrow direction and
// row alignment flip to match.
function buildBadgeRows(badges: CbBadge[]): BadgeRowItem[][] {
	const rows: BadgeRowItem[][] = [];
	for (let i = 0; i < badges.length; i += ROW_SIZE) {
		const row = badges.slice(i, i + ROW_SIZE).map((badge, j) => ({ badge, originalIndex: i + j }));
		const rowNumber = i / ROW_SIZE;
		rows.push(rowNumber % 2 === 1 ? row.reverse() : row);
	}
	return rows;
}

interface Props {
	state: CbState;
	onGuess: (guess: string) => void;
	onGiveUp: () => void;
	onNext: () => void;
	submitting: boolean;
	onQuit: () => void;
}

// Active-round screen. Two sub-views depending on state.lastResult: the
// guess box (nothing answered yet this question) or the reveal (answered,
// waiting for "Next" to hand the device to the next player) -- see
// state.ts's doc on why that's what lastResult's presence means.
export function ClubBadgesPlay({ state, onGuess, onGiveUp, onNext, submitting, onQuit }: Props) {
	const [guessInput, setGuessInput] = useState("");
	// Same "confirm before it costs you" pattern as single-player's give-up
	// (PlayScreen.tsx) -- a stray tap here loses a point on this question
	// just as surely as give-up loses the round there, so it gets the same
	// two-step guard rather than acting immediately.
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
	// Which of HINT_KEYS this question has revealed so far. Per-question:
	// reset whenever the question changes rather than staying revealed into
	// the next one, same "starts fresh each question" reasoning as
	// guessInput/confirmingGiveUp already get via their own dead-end paths.
	// React's own "adjusting state when a prop changes" pattern (setState
	// during render, guarded by comparing against a tracked previous value)
	// rather than a useEffect -- an effect here would commit the stale
	// "still revealed" render first and only reset on the render after,
	// which the lint rule (react-hooks/set-state-in-effect) flags for
	// exactly that reason.
	const [revealedHints, setRevealedHints] = useState<Set<HintKey>>(new Set());
	const [hintQuestionIndex, setHintQuestionIndex] = useState(state.questionIndex);
	if (state.questionIndex !== hintQuestionIndex) {
		setHintQuestionIndex(state.questionIndex);
		setRevealedHints(new Set());
	}

	function revealHint(key: HintKey) {
		setRevealedHints((prev) => new Set(prev).add(key));
	}

	const question = state.questions[state.questionIndex];
	if (!question) return null;
	const badgeRows = buildBadgeRows(question.badges);
	// A hint key existing (HINT_KEYS) doesn't guarantee it's offered for
	// THIS question -- nationality is skipped outright when the server sent
	// null for it (see state.ts's CbQuestion doc), rather than showing a
	// button that would reveal nothing. country has no such gate: every club
	// in the actual game data has a real one (verified directly against
	// production when this hint was built).
	const availableHints = HINT_KEYS.filter((key) => key !== "nationality" || question.nationality !== null);
	const turnIndex = currentTurnIndex(state);
	const current = state.players[turnIndex];
	const isLastQuestion = state.questionIndex + 1 >= state.questions.length;
	// Solo Single Player has exactly one "player" (see App.tsx) -- no one to
	// pass the device to and no roster worth listing, so that chrome only
	// makes sense once there's a real multiplayer roster.
	const solo = state.players.length === 1;

	function pick(name: string) {
		setGuessInput(name);
		onGuess(name);
		setGuessInput("");
	}

	function next() {
		setGuessInput("");
		onNext();
	}

	function confirmGiveUp() {
		setConfirmingGiveUp(false);
		onGiveUp();
	}

	return (
		<div className="cb-play">
			<button type="button" className="back-link" onClick={onQuit}>
				← New game
			</button>

			<p className="cb-progress">
				Question {state.questionIndex + 1} of {state.questions.length}
			</p>

			{!solo && (
				<ul className="mp-players">
					{state.players.map((player, i) => (
						<li
							key={i}
							className={i === turnIndex ? "mp-players__item--active" : undefined}
							style={{ "--player-color": player.color } as React.CSSProperties}
						>
							<span className="mp-players__name">{player.name}</span>
							<span className="cb-players__correct">{player.correct} correct</span>
						</li>
					))}
				</ul>
			)}

			<p className="cb-turn-banner" style={{ "--player-color": current.color } as React.CSSProperties}>
				{solo
					? "Who is this?"
					: state.lastResult
						? isLastQuestion
							? "Last question — see how everyone did"
							: `Pass the device to ${state.players[(turnIndex + 1) % state.players.length].name}`
						: `${current.name}'s turn — who is this?`}
			</p>

			<div className="cb-badges">
				{badgeRows.map((row, rowIndex) => {
					const reversed = rowIndex % 2 === 1;
					return (
						<div className={reversed ? "cb-badges__row cb-badges__row--reversed" : "cb-badges__row"} key={rowIndex}>
							{row.map(({ badge, originalIndex }, posInRow) => (
								<div className="cb-badge-step" key={originalIndex}>
									{posInRow > 0 && (
										<span className="cb-arrow" aria-hidden="true">
											{reversed ? "←" : "→"}
										</span>
									)}
									<BadgeTile badge={badge} showCountryHint={revealedHints.has("country")} />
								</div>
							))}
						</div>
					);
				})}
			</div>

			{revealedHints.has("nationality") && (
				<p className="cb-hint-text">Nationality: {question.nationality}</p>
			)}

			{/* One hint at a time, in HINT_KEYS order -- not every available hint
			    at once, and no label naming what it is (that would itself be a
			    hint). Already-revealed hints (their ribbon/text above) stay up
			    regardless; only the button for whichever's next disappears once
			    used, then the next hint's button (if any) takes its place. */}
			{!state.lastResult &&
				(() => {
					const nextHint = availableHints.find((key) => !revealedHints.has(key));
					return (
						nextHint && (
							<button type="button" className="cb-hint-button" onClick={() => revealHint(nextHint)}>
								💡 Hint
							</button>
						)
					);
				})()}

			{!state.lastResult ? (
				<>
					<GuessInput
						value={guessInput}
						onChange={setGuessInput}
						onPick={pick}
						disabled={submitting}
						suggestUrl="/api/club-badges/suggest"
					/>
					{confirmingGiveUp ? (
						<div className="give-up-confirm">
							<span>Give up on this one?</span>
							<button type="button" className="give-up-confirm__yes" onClick={confirmGiveUp} disabled={submitting}>
								Yes, give up
							</button>
							<button
								type="button"
								className="give-up-confirm__cancel"
								onClick={() => setConfirmingGiveUp(false)}
								disabled={submitting}
							>
								Cancel
							</button>
						</div>
					) : (
						<button type="button" className="give-up-link" onClick={() => setConfirmingGiveUp(true)} disabled={submitting}>
							Give up
						</button>
					)}
				</>
			) : (
				<div className="cb-reveal">
					<p className={state.lastResult.outcome === "correct" ? "cb-reveal__correct" : "cb-reveal__wrong"}>
						{state.lastResult.outcome === "correct"
							? "✅ Correct!"
							: state.lastResult.gaveUp
								? `It was ${state.lastResult.correctName}`
								: `❌ Not quite — it was ${state.lastResult.correctName}`}
					</p>
					<p className="cb-reveal__clubs">{state.lastResult.clubNames.join(" → ")}</p>
					<button type="button" className="cb-next-button" onClick={next}>
						{isLastQuestion ? "See results" : "Next question"}
					</button>
				</div>
			)}
		</div>
	);
}

import { Fragment, useCallback, useRef, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { BadgeTile } from "./BadgeTile";
import { currentTurnIndex, HINT_KEYS, type CbBadge, type CbState, type HintKey } from "./state";

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
// row alignment flip to match. `cols` is however many tiles actually fit
// across the real container -- see useResponsiveCols below -- not a fixed
// number: an earlier version hardcoded this (first 4, then 3 after 4 turned
// out to overflow every standard iPhone) by checking it against a handful of
// phone widths, which is exactly the kind of thing that breaks the next time
// someone opens this on a tablet, a resized browser window, or a phone that
// wasn't in the list.
function buildBadgeRows(badges: CbBadge[], cols: number): BadgeRowItem[][] {
	const rows: BadgeRowItem[][] = [];
	for (let i = 0; i < badges.length; i += cols) {
		const row = badges.slice(i, i + cols).map((badge, j) => ({ badge, originalIndex: i + j }));
		const rowNumber = i / cols;
		rows.push(rowNumber % 2 === 1 ? row.reverse() : row);
	}
	return rows;
}

// Resolves a CSS length (e.g. "0.4rem", "64px") to actual on-screen pixels by
// briefly rendering it and measuring the result -- robust to whatever the
// current root font-size actually is (browser zoom, an accessibility text
// -size setting) rather than assuming a fixed px-per-rem conversion, which
// would just be a different flavor of the same "hardcoded number that only
// matches what was tested" problem this hook exists to avoid.
function resolveCssLength(value: string): number {
	const probe = document.createElement("div");
	probe.style.cssText = `position:absolute;visibility:hidden;height:0;width:${value}`;
	document.body.appendChild(probe);
	const px = probe.getBoundingClientRect().width;
	probe.remove();
	return px;
}

interface ResponsiveCols {
	cols: number;
	// A full row's own natural width in px (cols tiles, tight fixed gaps,
	// never stretched) -- every row, full or partial, is rendered at exactly
	// this width (see the render below) so they all share one reference
	// frame and get centered identically, rather than each row's own visible
	// content deciding its width. See buildBadgeRows/render for why a shared
	// frame is what makes the snake's rows line up.
	rowWidth: number;
}

// How many tiles actually fit across .cb-badges's own (live) width, kept up
// to date via ResizeObserver -- a real measurement of the real container, so
// it's correct on a phone, a tablet, a resized desktop window, after a
// rotation, after a browser zoom change, or on any device this was never
// specifically checked against. --cb-tile/--cb-gap/--cb-arrow (clubBadges.css)
// are read back from the element's own computed style rather than a second
// hardcoded copy here, so this can't quietly disagree with what the CSS
// actually renders at (exactly the bug that made an earlier, formula-only
// version of this fix wrong -- see clubBadges.css's .cb-badges history).
//
// Earlier versions of this fix tried to make a full row's *own* content
// stretch to exactly fill the container (via a computed width, then
// space-between, then center) so its edges would land flush against the
// box's padding. All of those made the same mistake: `cols` is a floor, so
// there's almost always real leftover width, and stretching a row's
// internal gaps to soak that up looks exactly like what it is -- tiles
// wrenched apart with visibly oversized, uneven-looking gaps, worse than
// the plain padding mismatch this was meant to fix. Rows now keep their
// natural, tight, always-fixed spacing (see .cb-badges__row/.cb-arrow in
// clubBadges.css -- no stretching class needed there anymore) and instead
// all render at the same explicit width (a full row's width) with
// .cb-badges centering that shared-width block -- so every row, whatever
// it actually contains, gets identical left/right margins by construction,
// without a single gap ever being pulled wider than it renders elsewhere.
function useResponsiveCols(): [(node: HTMLDivElement | null) => void, ResponsiveCols] {
	// Reasonable guesses for the instant before the first real measurement.
	const [state, setState] = useState<ResponsiveCols>({ cols: 3, rowWidth: 0 });
	const observerRef = useRef<ResizeObserver | null>(null);

	const setNode = useCallback((node: HTMLDivElement | null) => {
		observerRef.current?.disconnect();
		observerRef.current = null;
		if (!node) return;

		function recompute(containerWidth: number) {
			const style = getComputedStyle(node!);
			const tile = resolveCssLength(style.getPropertyValue("--cb-tile") || "64px");
			const gap = resolveCssLength(style.getPropertyValue("--cb-gap") || "0.4rem");
			const arrow = resolveCssLength(style.getPropertyValue("--cb-arrow") || "1rem");
			// Every tile after the first also costs an arrow plus the two row
			// gaps flanking it (badges and arrows are direct, alternating
			// children of the row -- see .cb-badges__row in clubBadges.css and
			// the render below); solving "how many tiles fit" for that
			// per-tile cost gives this floor.
			const stepExtra = arrow + 2 * gap;
			const cols = Math.max(1, Math.floor((containerWidth + stepExtra) / (tile + stepExtra)));
			const rowWidth = cols * tile + (cols - 1) * stepExtra;
			setState({ cols, rowWidth });
		}

		// contentRect excludes padding/border regardless of box-sizing -- the
		// same "space actually available for tiles" this formula needs.
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width;
			if (width) recompute(width);
		});
		observer.observe(node);
		observerRef.current = observer;
	}, []);

	return [setNode, state];
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
	const [badgesRef, { cols, rowWidth }] = useResponsiveCols();
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
	const badgeRows = buildBadgeRows(question.badges, cols);
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

			{/* ref hands the live element to useResponsiveCols so it can measure
			    the real available width and observe it for resizes -- see that
			    hook above for why this replaced a fixed column count. Rows are
			    centered as a block (see .cb-badges's align-items in
			    clubBadges.css) rather than individually stretched, so every row
			    below is given the SAME explicit width (rowWidth, a full row's
			    natural width) regardless of how many tiles it actually holds --
			    that shared frame is what keeps left/right margins identical
			    across every row instead of each row's own content deciding it. */}
			<div className="cb-badges" ref={badgesRef}>
				{badgeRows.map((row, rowIndex) => {
					const reversed = rowIndex % 2 === 1;
					// Within its own shared-width frame, a row just packs its tiles
					// to whichever side continues the snake -- flex-start reads on
					// from the left, flex-end from the right -- at their natural,
					// always-fixed spacing (no stretching, see useResponsiveCols's
					// comment on why that was the actual bug in two earlier attempts
					// at this). A full row's tiles already span the entire frame on
					// their own, so flex-start/flex-end make no visible difference
					// for one; only a short trailing row visibly hugs one side,
					// leaving blank space on the other within the shared frame --
					// that's the snake's "picks up where the last row ended" look.
					const rowClassName = ["cb-badges__row", reversed && "cb-badges__row--reversed"].filter(Boolean).join(" ");
					return (
						<div className={rowClassName} key={rowIndex} style={{ width: rowWidth }}>
							{row.map(({ badge, originalIndex }, posInRow) => (
								<Fragment key={originalIndex}>
									{posInRow > 0 && (
										<span className="cb-arrow" aria-hidden="true">
											{reversed ? "←" : "→"}
										</span>
									)}
									<BadgeTile badge={badge} showCountryHint={revealedHints.has("country")} />
								</Fragment>
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

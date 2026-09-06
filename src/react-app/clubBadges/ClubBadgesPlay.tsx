import { Fragment, useCallback, useLayoutEffect, useRef, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import { BadgeTile } from "./BadgeTile";
import { currentTurnIndex, HINT_KEYS, MAX_WRONG_LIVES, type CbBadge, type CbState, type HintKey } from "./state";

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
//
// `wideArrows` widens --cb-arrow (clubBadges.css's .cb-badges--wide-arrows)
// once the transfer-date hint is revealed, since each arrow then carries a
// two-line date label above the glyph (see the render below) that needs
// more than the plain arrow's normal width -- cols/rowWidth need to be
// recomputed against that new width the moment it changes, not just on the
// next resize, so a change to this flag forces a remeasurement below even
// though the container's actual size didn't move.
function useResponsiveCols(wideArrows: boolean): [(node: HTMLDivElement | null) => void, ResponsiveCols] {
	// Reasonable guesses for the instant before the first real measurement.
	const [state, setState] = useState<ResponsiveCols>({ cols: 3, rowWidth: 0 });
	const nodeRef = useRef<HTMLDivElement | null>(null);
	const observerRef = useRef<ResizeObserver | null>(null);

	// clientWidth (border-box minus border, i.e. padding+content) minus the
	// element's own padding -- the same "space actually available for
	// tiles" ResizeObserver's contentRect gives on its own callback, kept
	// consistent here since this path (unlike the observer) needs to read
	// the current width on demand rather than wait for one to be delivered.
	const recompute = useCallback(() => {
		const node = nodeRef.current;
		if (!node) return;
		const style = getComputedStyle(node);
		const paddingLeft = resolveCssLength(style.paddingLeft);
		const paddingRight = resolveCssLength(style.paddingRight);
		const containerWidth = node.clientWidth - paddingLeft - paddingRight;
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
	}, []);

	const setNode = useCallback(
		(node: HTMLDivElement | null) => {
			observerRef.current?.disconnect();
			observerRef.current = null;
			nodeRef.current = node;
			if (!node) return;
			const observer = new ResizeObserver(() => recompute());
			observer.observe(node);
			observerRef.current = observer;
			recompute();
		},
		[recompute],
	);

	// Runs synchronously before paint, right after wideArrows's class change
	// has already been committed to the DOM (React applies className during
	// the same commit this effect fires after), so there's no visible frame
	// with the old column count still in effect.
	useLayoutEffect(() => {
		recompute();
	}, [wideArrows, recompute]);

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
	// Declared after revealedHints since useResponsiveCols needs its current
	// value (whether to widen the arrow columns for the date labels) --
	// hooks still run unconditionally every render either way.
	const [badgesRef, { cols, rowWidth }] = useResponsiveCols(revealedHints.has("transferDate"));

	function revealHint(key: HintKey) {
		setRevealedHints((prev) => new Set(prev).add(key));
	}

	const question = state.questions[state.questionIndex];
	if (!question) return null;
	const badgeRows = buildBadgeRows(question.badges, cols);
	// A hint key existing (HINT_KEYS) doesn't guarantee it's offered for
	// THIS question -- nationality is skipped outright when the server sent
	// null for it (see state.ts's CbQuestion doc), and transferDate the same
	// way when every entry in it is null, rather than showing a button that
	// would reveal nothing. country has no such gate: every club in the
	// actual game data has a real one (verified directly against production
	// when this hint was built).
	const availableHints = HINT_KEYS.filter((key) => {
		if (key === "nationality") return question.nationality !== null;
		if (key === "transferDate") return question.transferDates.some((d) => d !== null);
		return true;
	});
	const turnIndex = currentTurnIndex(state);
	const current = state.players[turnIndex];
	// Solo Single Player has exactly one "player" (see App.tsx) -- no one to
	// pass the device to and no roster worth listing, so that chrome only
	// makes sense once there's a real multiplayer roster.
	const solo = state.players.length === 1;
	// Lives (solo only -- see state.ts's MAX_WRONG_LIVES) can end the round
	// on this question even though more are technically left in the deck,
	// same "no Next question after this one" reveal ClubBadgesPlay already
	// shows once questionIndex reaches the real end.
	const outOfLives = solo && state.wrongCount >= MAX_WRONG_LIVES;
	const isLastQuestion = state.questionIndex + 1 >= state.questions.length || outOfLives;

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

			{/* Solo only, same as the daily categories game's tension mode
			    (PlayScreen.tsx) this mirrors -- 5 lives, one wrong guess (or
			    give-up, see state.ts's guessResult case) too many and the round
			    ends right there rather than continuing to a question that
			    doesn't matter anymore. Multiplayer has no such cap (see
			    state.ts's "next" case), so there's nothing meaningful to show
			    here for a real roster. */}
			{solo && <LivesIndicator total={MAX_WRONG_LIVES} remaining={MAX_WRONG_LIVES - state.wrongCount} />}

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
			    across every row instead of each row's own content deciding it.
			    --wide-arrows only actually shows a label on an arrow whose own
			    transfer has one (dateFor below can still return null even while
			    this class is active for an earlier one), but the column width
			    itself is all-or-nothing per clubBadges.css's comment. */}
			<div
				className={["cb-badges", revealedHints.has("transferDate") && "cb-badges--wide-arrows"].filter(Boolean).join(" ")}
				ref={badgesRef}
			>
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
					// A row wrap is still a step in the same sequence, so it gets an
					// arrow too -- just pointing down instead of sideways, sitting
					// between this row and the next one. It has to land under
					// whichever tile the sequence actually continues from: this
					// row's last tile if it's *not* reversed (which is at the
					// frame's right edge -- see .cb-badges__row--reversed's comment
					// on why full rows fill the frame edge to edge), or the frame's
					// left edge if it is. That's exactly the side the *next* row's
					// own reversed flag reads from, so reusing it here keeps the two
					// in sync automatically instead of duplicating the logic.
					const nextRowReversed = (rowIndex + 1) % 2 === 1;
					const isLastRow = rowIndex === badgeRows.length - 1;
					// transferDates[i] is the transfer FROM badges[i] TO badges[i+1]
					// (state.ts), so the arrow arriving at a given originalIndex
					// reads the entry one before it; the row-wrap connector below
					// reads off this row's chronologically-last originalIndex (the
					// max in the row, regardless of display order) for the same
					// reason -- it represents that same transfer, just drawn between
					// rows instead of between two side-by-side tiles.
					const dateFor = (toOriginalIndex: number) =>
						revealedHints.has("transferDate") ? question.transferDates[toOriginalIndex - 1] : null;
					const connectorDate = dateFor(Math.max(...row.map((r) => r.originalIndex)) + 1);
					return (
						<Fragment key={rowIndex}>
							<div className={rowClassName} style={{ width: rowWidth }}>
								{row.map(({ badge, originalIndex }, posInRow) => {
									const arrowDate = posInRow > 0 ? dateFor(originalIndex) : null;
									return (
										<Fragment key={originalIndex}>
											{posInRow > 0 && (
												<span className="cb-arrow-stack">
													{arrowDate && <span className="cb-arrow-date">{arrowDate}</span>}
													<span className="cb-arrow" aria-hidden="true">
														{reversed ? "←" : "→"}
													</span>
												</span>
											)}
											<BadgeTile badge={badge} showCountryHint={revealedHints.has("country")} />
										</Fragment>
									);
								})}
							</div>
							{!isLastRow && (
								<div
									className={["cb-badges__connector", nextRowReversed && "cb-badges__connector--right"]
										.filter(Boolean)
										.join(" ")}
									style={{ width: rowWidth }}
								>
									<span className="cb-arrow-stack cb-arrow-stack--down">
										{connectorDate && <span className="cb-arrow-date">{connectorDate}</span>}
										<span className="cb-arrow" aria-hidden="true">
											↓
										</span>
									</span>
								</div>
							)}
						</Fragment>
					);
				})}
			</div>

			{/* The sequence shown is whatever club_badge_questions curated, not
			    necessarily the player's full career -- a current player may have
			    joined more clubs since the question was written, and a
			    since-retired one may have played on past the last club shown
			    here without ever being recorded. Without this, the sequence
			    could read as a claim that the last badge is where they ended up,
			    which isn't guaranteed.
			    club_sequence is also de-duplicated at the source (see
			    db/schema.sql's own comment on it) -- a club a player returned to
			    only shows its badge once, at its first appearance, not again at
			    the point they actually rejoined. A loan spell is the case this
			    bites players the most: Courtois reads as Chelsea -> Atletico
			    Madrid -> Real Madrid here, silently skipping the mandatory
			    return to Chelsea before Real Madrid actually happened, which a
			    knowledgeable player could reasonably expect to see and take as
			    the puzzle being wrong rather than simplified. */}
			<p className="cb-disclaimer">
				This may not show their full career, and a club may repeat later on even though it's only shown once
				here (e.g. after a loan).
			</p>

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
							? // Confirms the canonical name, not just that the guess counted --
								// a guess can match via an alias or loose/typo-tolerant matching
								// (normalize.ts), so "Correct!" alone wouldn't actually confirm
								// who the player thinks they just named.
								`✅ Correct! It was ${state.lastResult.correctName}`
							: state.lastResult.gaveUp
								? `It was ${state.lastResult.correctName}`
								: `❌ Not quite — it was ${state.lastResult.correctName}`}
					</p>
					<button type="button" className="cb-next-button" onClick={next}>
						{isLastQuestion ? "See results" : "Next question"}
					</button>
				</div>
			)}

			{/* Same list, same classes, as the daily categories game's own
			    incorrect-guesses list (App.css's .wrong-guesses -- global, not
			    category-specific) -- the lives indicator up top already shows
			    that something went wrong, this is what actually shows what was
			    tried. Kept visible through the reveal too (not just while still
			    guessing), same as categories' own placement -- it's still
			    useful context for what didn't work on this question. Cleared by
			    "next", not per-guess -- see state.ts's CbState doc. */}
			{state.wrongGuesses.length > 0 && (
				<div className="wrong-guesses" aria-live="polite">
					<h4 className="wrong-guesses__heading">Incorrect guesses</h4>
					<ul className="wrong-guesses__list">
						{state.wrongGuesses.map((name, i) => (
							<li key={`${name}-${i}`}>{name}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

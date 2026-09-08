import { Fragment, useCallback, useRef, useState } from "react";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import { BadgeTile } from "./BadgeTile";
import {
	currentTurnIndex,
	HINT_KEYS,
	MAX_WRONG_LIVES,
	type CbBadge,
	type CbState,
	type HintKey,
} from "./state";

// Rebuilt from scratch 2026-09-07, deleting an earlier version (manual
// row-packing sized against a ResizeObserver-measured container, plus a
// separately-computed "bypass arrow" overlay for loan runs, built up over
// many rounds of layout rules) that had grown far more complex than this
// screen actually needs. This version: one flat list of tiles, one plain
// flex row that wraps on its own (clubBadges.css's .cb-badges), a normal
// inline arrow between every pair -- nothing measured, nothing absolutely
// positioned.

// One club actually shown in the chain, plus whether the move INTO it was
// a loan (state.ts's loanMoves) and its index into question.badges (used
// to look up its own incoming transfer date).
interface ChainTile {
	badge: CbBadge;
	originalIndex: number;
	isLoan: boolean;
}

// Collapses a genuine return to the same parent right after a loan
// (build_club_badge_questions.py's insert_loan_returns -- e.g. Chelsea ->
// loan Genk -> Chelsea) into the loan spell it's continuing, rather than
// showing the same club a second time. Everything else becomes its own
// tile, in order.
function buildChainTiles(badges: CbBadge[], loanMoves: boolean[]): ChainTile[] {
	const tiles: ChainTile[] = [];
	const sameClub = (a: CbBadge, b: CbBadge) => (a.url && b.url ? a.url === b.url : a.name === b.name);
	badges.forEach((badge, i) => {
		const isLoan = i > 0 && loanMoves[i - 1];
		if (!isLoan && tiles.length > 0 && tiles[tiles.length - 1].isLoan) {
			let j = tiles.length - 1;
			while (j >= 0 && tiles[j].isLoan) j--;
			const parent = tiles[j];
			if (parent && sameClub(badge, parent.badge)) return;
		}
		tiles.push({ badge, originalIndex: i, isLoan });
	});
	return tiles;
}

// A permanent tile's width and the space one arrow takes between two
// tiles (clubBadges.css's .cb-badges__row/.cb-arrow-stack). N tiles in a row need
// N of the former but only N-1 of the latter -- there's no arrow trailing
// the last tile -- so the budget for N tiles is N*TILE_WIDTH +
// (N-1)*ARROW_WIDTH, not N*(TILE_WIDTH+ARROW_WIDTH) (confirmed the wrong
// way, 2026-09-07: that overcounted by one arrow's width and undercounted
// how many tiles actually fit -- a 390px-wide row should hold 4 tiles
// (4*64 + 3*32 = 352, leaving 38px as outer padding), not 3).
const TILE_WIDTH = 64;
const ARROW_WIDTH = 48;

// How many grid columns actually fit in .cb-badges's real width, kept up
// to date via ResizeObserver -- correct on a phone, a tablet, a resized
// desktop window, or after a rotation, rather than a guess baked in at
// build time. The grid itself (clubBadges.css's .cb-badges) then wraps
// into as many rows as the tile count needs at that column count -- there
// isn't a separate "how many rows" calculation, that's just what a grid
// with a fixed column count does on its own once more items exist than
// fit in one row.
function useGridColumns(): [(node: HTMLDivElement | null) => void, number] {
	const [columns, setColumns] = useState(1);
	const observerRef = useRef<ResizeObserver | null>(null);

	const setNode = useCallback((node: HTMLDivElement | null) => {
		observerRef.current?.disconnect();
		observerRef.current = null;
		if (!node) return;
		const recompute = () => {
			const style = getComputedStyle(node);
			const availableWidth =
				node.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
			// Solving N*TILE_WIDTH + (N-1)*ARROW_WIDTH <= availableWidth for N.
			const columns = Math.floor((availableWidth + ARROW_WIDTH) / (TILE_WIDTH + ARROW_WIDTH));
			setColumns(Math.max(1, columns));
		};
		recompute();
		const observer = new ResizeObserver(recompute);
		observer.observe(node);
		observerRef.current = observer;
	}, []);

	return [setNode, columns];
}

// Splits the flat, chronological tile sequence into rows of exactly
// `columns` tiles each (the last row however many are left over) -- what
// actually produces "N rows" isn't a separate calculation, just chunking
// the tile count by the per-row count useGridColumns already worked out.
function chunkRows(tiles: ChainTile[], columns: number): ChainTile[][] {
	const rows: ChainTile[][] = [];
	for (let i = 0; i < tiles.length; i += columns) {
		rows.push(tiles.slice(i, i + columns));
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
	const question = state.questions[state.questionIndex];
	const [gridRef, columns] = useGridColumns();

	function revealHint(key: HintKey) {
		setRevealedHints((prev) => new Set(prev).add(key));
	}

	if (!question) return null;
	const chainTiles = buildChainTiles(question.badges, question.loanMoves);
	const rows = chunkRows(chainTiles, columns);
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
			{solo && (
				<LivesIndicator total={MAX_WRONG_LIVES} remaining={MAX_WRONG_LIVES - state.wrongCount} />
			)}

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

			<p
				className="cb-turn-banner"
				style={{ "--player-color": current.color } as React.CSSProperties}
			>
				{solo
					? "Who is this?"
					: state.lastResult
						? isLastQuestion
							? "Last question — see how everyone did"
							: `Pass the device to ${state.players[(turnIndex + 1) % state.players.length].name}`
						: `${current.name}'s turn — who is this?`}
			</p>

			{/* useGridColumns computes how many tiles fit per row; chunking
			    chainTiles into rows of that many (clubBadges.css's
			    .cb-badges, a plain flex column) is what actually determines
			    row count -- as many rows as the tile count needs at that
			    per-row count, the last one however short. Each row is its
			    own grid with an explicit alternating template -- a tile
			    track, then an arrow track, repeating -- so an arrow renders
			    in its own dedicated (narrow) column between two tiles
			    rather than living inside either tile's own box. */}
			<div className="cb-badges" ref={gridRef}>
				{rows.map((row, rowIndex) => {
					// Boustrophedon ("snake"): odd rows read right-to-left instead
					// of left-to-right, continuing visually from wherever the row
					// above it ended, rather than always wrapping back to the
					// left. `direction: rtl` on the row (clubBadges.css) is what
					// actually flips it -- DOM/tile order below stays exactly
					// chronological regardless, so there's no separate "which
					// tile comes before this one" bookkeeping to get wrong the
					// way an earlier version of this screen's reversed rows did.
					const reversed = rowIndex % 2 === 1;
					const rowTemplate = `repeat(${columns - 1}, ${TILE_WIDTH}px ${ARROW_WIDTH}px) ${TILE_WIDTH}px`;
					return (
						<Fragment key={rowIndex}>
						<div
							className={["cb-badges__row", reversed && "cb-badges__row--reversed"].filter(Boolean).join(" ")}
							// Always the full `columns` width, not row.length -- the
							// last row can hold fewer tiles than the rest, but every
							// row still needs the SAME template so tiles actually
							// line up into vertical columns across rows instead of
							// each row's (potentially narrower) content being
							// centered independently. A short row's own cells (its
							// trailing tracks, or leading ones under direction: rtl)
							// just stay empty.
							style={{ gridTemplateColumns: rowTemplate }}
						>
						{row.map((tile, posInRow) => {
							const isRowFirst = posInRow === 0;
							// The only arrow that needs the extra breathing room:
							// leaving a permanent tile to START a loan spell. A
							// loan-to-loan arrow (two consecutive loan tiles) sits
							// between two tiles that are already both inset within
							// their own 64px wrap, so it doesn't read as cramped
							// against its left neighbor the way this one does.
							const isEnteringLoan = !isRowFirst && tile.isLoan && !row[posInRow - 1].isLoan;
							const arrowDate =
								!isRowFirst && revealedHints.has("transferDate")
									? question.transferDates[tile.originalIndex - 1]
									: null;
							return (
								<Fragment key={tile.originalIndex}>
									{!isRowFirst && (
										<span
											className={[
												"cb-arrow-stack",
												tile.isLoan && "cb-arrow-stack--loan-target",
												isEnteringLoan && "cb-arrow-stack--entering-loan",
											]
												.filter(Boolean)
												.join(" ")}
										>
											{arrowDate && <span className="cb-arrow-date">{arrowDate}</span>}
											<span
												className={["cb-arrow", tile.isLoan && "cb-arrow--loan"].filter(Boolean).join(" ")}
												aria-hidden="true"
											>
												{reversed ? "←" : "→"}
											</span>
											{tile.isLoan && <span className="cb-arrow-loan">loan</span>}
										</span>
									)}
									<BadgeTile
										badge={tile.badge}
										showCountryHint={revealedHints.has("country")}
										small={tile.isLoan}
									/>
								</Fragment>
							);
						})}
						</div>
						{rowIndex < rows.length - 1 && (() => {
							// Links this row to the next one -- the same grid
							// template as a tile row (so its columns line up with
							// theirs) and the same direction as THIS row, with a
							// single "↓" placed in the last column. That's always
							// where this row's own last tile landed (a full row
							// always fills every column), and -- since the next
							// row's direction is always the opposite of this
							// one's -- it's also exactly where the next row's
							// first tile lands, direction flipping the visual
							// edge right back to the same spot (confirmed on
							// paper before writing this, not just eyeballed: row
							// N's last tile is always at raw column 2*columns-1;
							// under direction: rtl that's the left edge, under
							// ltr the right edge; row N+1 starts at raw column 1,
							// which is the left edge under ltr and the right
							// edge under rtl -- alternating directions makes
							// those the same physical edge every time).
							//
							// The tile this arrow actually leads into is the next
							// row's own first tile, not anything in this row -- so
							// whether it needs the loan styling (color, "LOAN" tag,
							// date) depends on THAT tile, same as every other arrow
							// in this chain, just crossing a row boundary instead
							// of sitting between two tiles in the same row.
							const target = rows[rowIndex + 1][0];
							const targetDate =
								revealedHints.has("transferDate") ? question.transferDates[target.originalIndex - 1] : null;
							return (
								<div
									className={["cb-badges__row", "cb-badges__connector", reversed && "cb-badges__row--reversed"]
										.filter(Boolean)
										.join(" ")}
									style={{ gridTemplateColumns: rowTemplate }}
								>
									{/* No --entering-loan margin here, unlike the same
									    case within a row -- that nudge is a horizontal
									    breathing-room fix, but this arrow's horizontal
									    position is alignment-critical (it has to land
									    exactly on the target tile's own column above/
									    below it), so shifting it sideways would misalign
									    it instead of just adding space. */}
									<span className="cb-arrow-stack" style={{ gridColumnStart: 2 * columns - 1 }}>
										{targetDate && <span className="cb-arrow-date">{targetDate}</span>}
										<span
											className={["cb-arrow", target.isLoan && "cb-arrow--loan"].filter(Boolean).join(" ")}
											aria-hidden="true"
										>
											↓
										</span>
										{target.isLoan && <span className="cb-arrow-loan">loan</span>}
									</span>
								</div>
							);
						})()}
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
			    which isn't guaranteed. A real return to an earlier club (most
			    often after a loan) IS shown as its own step now rather than
			    collapsed away -- see db/schema.sql's club_sequence comment --
			    and a loan move itself is labeled right on its arrow (below) so
			    it doesn't read as a normal permanent transfer. */}
			<p className="cb-disclaimer">This may not show their full career.</p>

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
							<button
								type="button"
								className="give-up-confirm__yes"
								onClick={confirmGiveUp}
								disabled={submitting}
							>
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
						<button
							type="button"
							className="give-up-link"
							onClick={() => setConfirmingGiveUp(true)}
							disabled={submitting}
						>
							Give up
						</button>
					)}
				</>
			) : (
				<div className="cb-reveal">
					<p
						className={
							state.lastResult.outcome === "correct" ? "cb-reveal__correct" : "cb-reveal__wrong"
						}
					>
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

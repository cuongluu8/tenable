import { Fragment, useCallback, useRef, useState } from "react";
import { BadgeTile } from "./BadgeTile";
import type { CbBadge } from "./clubBadgesState";

// Rebuilt from scratch 2026-09-07, deleting an earlier version (manual
// row-packing sized against a ResizeObserver-measured container, plus a
// separately-computed "bypass arrow" overlay for loan runs, built up over
// many rounds of layout rules) that had grown far more complex than this
// screen actually needs. This version: one flat list of tiles, one plain
// flex row that wraps on its own (clubBadges.css's .cb-badges), a normal
// inline arrow between every pair -- nothing measured, nothing absolutely
// positioned.
//
// Split out of RoundPlay.tsx (2026-09-13) so remote multiplayer's own
// question screen (RemoteGame.tsx) renders the exact same badge chain --
// arrows, loan styling, transfer dates, the snake row layout, the
// responsive column count -- as solo/pass-and-play Club Run, instead of a
// second, visually different stand-in. RoundPlay.tsx still owns
// everything around this (lives, timer, turn banner, the hint button,
// Teammate Tell's `middle` override) -- this component is only the chain
// itself, reusable because it needs nothing from clubBadgesState.ts's
// RoundState/RoundAction.

// One club actually shown in the chain, plus whether the move INTO it was
// a loan (clubBadgesState.ts's loanMoves) and its index into
// question.badges (used to look up its own incoming transfer date).
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
// tiles (clubBadges.css's .cb-badges__row/.cb-arrow-stack). N tiles in a
// row need N of the former but only N-1 of the latter -- there's no arrow
// trailing the last tile -- so the budget for N tiles is N*TILE_WIDTH +
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

export interface BadgeChainQuestion {
	badges: CbBadge[];
	loanMoves: boolean[];
	transferDates: (string | null)[];
}

interface Props {
	question: BadgeChainQuestion;
	// Whether the country/transferDate hint tiers are currently revealed --
	// an explicit flag rather than inferred from the data itself (e.g.
	// "is transferDates[i] non-null"), since the two callers gate hints
	// two different ways: solo/pass-and-play always has the full data and
	// toggles DISPLAY client-side (nothing to cheat against on a shared or
	// solo device -- see clubBadgeRound.ts's own doc); remote multiplayer
	// has the server withhold the data itself until each tier's reveal
	// time (a real race across separate devices needs that enforced
	// server-side). Both still need to independently control the SAME
	// "reserve height for the name label even before it's shown" behavior
	// (BadgeTile's own showCountryHint prop) as their own hint state
	// changes, which only a real boolean -- not data presence -- can
	// drive correctly for the solo/pass-and-play case.
	countryRevealed: boolean;
	transferDateRevealed: boolean;
}

// The badge chain itself: tiles left to right (snaking into a new row,
// alternating direction, once more exist than fit on one line), with an
// arrow between every pair labeled with the transfer date once revealed,
// and loan spells drawn smaller with their own "loan" tag. Nothing here
// depends on which mode is asking (solo, pass-and-play, or remote) --
// only on the question's own badges/loanMoves/transferDates and whether
// this caller currently considers each hint tier revealed.
export function BadgeChain({ question, countryRevealed, transferDateRevealed }: Props) {
	const [gridRef, columns] = useGridColumns();
	const chainTiles = buildChainTiles(question.badges, question.loanMoves);
	const rows = chunkRows(chainTiles, columns);

	return (
		<>
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
									// The mirror case: leaving a loan club to enter a
									// permanent one. That arrow doesn't really originate
									// from the loan club at all -- the player actually
									// returned to the parent first (see db/schema.sql's
									// club_sequence comment), the loan tile just happens
									// to be the nearest thing drawn next to it. Lowering
									// it to the loan tile's own lower half (rather than
									// the row's vertical center) reads as "this comes
									// from underneath/behind the loan step, not from it."
									const isLeavingLoan = !isRowFirst && !tile.isLoan && row[posInRow - 1].isLoan;
									const arrowDate = !isRowFirst && transferDateRevealed ? question.transferDates[tile.originalIndex - 1] : null;
									return (
										<Fragment key={tile.originalIndex}>
											{!isRowFirst && (
												<span
													className={[
														"cb-arrow-stack",
														tile.isLoan && "cb-arrow-stack--loan-target",
														isEnteringLoan && "cb-arrow-stack--entering-loan",
														isLeavingLoan && "cb-arrow-stack--leaving-loan",
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
											<BadgeTile badge={tile.badge} showCountryHint={countryRevealed} small={tile.isLoan} />
										</Fragment>
									);
								})}
							</div>
							{rowIndex < rows.length - 1 &&
								(() => {
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
									const targetDate = transferDateRevealed ? question.transferDates[target.originalIndex - 1] : null;
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
		</>
	);
}

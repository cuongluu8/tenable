import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getSafeViewport } from "../lib/safeViewport";
import { useKeepInSafeZone } from "../hooks/useKeepInSafeZone";

interface Props {
	value: string;
	onChange: (value: string) => void;
	// Called when the player picks a suggestion (click, or Enter while one is
	// highlighted) — the parent fills the input and submits immediately, since
	// picking from the list exists specifically to skip typing out the guess.
	onPick: (name: string) => void;
	disabled: boolean;
	// The suggest endpoint to hit — "/api/suggest" (categories, scoped by
	// entity_type via `extraQuery`'s category slug) or
	// "/api/club-badges/suggest" (always players, no category to scope by).
	// Kept as a plain base path + extra params rather than a single
	// pre-built URL so this component owns exactly one place that appends
	// `q`, regardless of which endpoint or how many other params a caller
	// needs.
	suggestUrl: string;
	extraQuery?: Record<string, string>;
	// Canonical names already found this round. /api/suggest searches the
	// whole reference pool, not this category's remaining answers (see
	// suggest.ts), so it has no idea what's already been found — an
	// already-found name would otherwise still show up as pickable, and
	// since picking is the *only* way to submit a guess, picking it just
	// burns a turn on something the server was always going to reject as a
	// duplicate. Filtering it out here means it can't be picked at all.
	excludeNames?: string[];
	// Where the list opens. "above" (the default, and every original
	// caller): position: fixed above the input, placed by reposition()
	// against the visual viewport -- see there for why that's the right
	// call on a normal scrolling page. "below": a plain absolutely-
	// positioned list hanging off the input's own wrapper, no viewport
	// maths at all -- for an input inside a modal (remote/RollOfHonourGame
	// .tsx, 2026-09-13), where the fixed-position approach kept landing
	// the list over the input on real phones once the keyboard was up,
	// and where the modal's own placement already guarantees room below.
	placement?: "above" | "below";
	// When given, suggestions come from THIS list, filtered in the browser,
	// and `suggestUrl` is never fetched -- for pools small enough to ship
	// whole (Roll of Honour's ~700 clubs; see rollOfHonour/useClubIndex.ts).
	// Matches the way the server does: a word of the name starting with
	// the typed text, or an alias starting with it. Same 20-row cap and
	// `truncated` hint.
	localIndex?: LocalSuggestEntry[];
}

export interface LocalSuggestEntry {
	name: string;
	aliases: string[];
}

const LOCAL_MAX_RESULTS = 20; // Matches suggest.ts's MAX_RESULTS.

// The client-side twin of normalize.ts's normalize(): lowercase, strip
// diacritics and punctuation, collapse whitespace.
function localNormalize(s: string): string {
	return s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function localSuggest(index: LocalSuggestEntry[], query: string): { suggestions: string[]; truncated: boolean } {
	const q = localNormalize(query);
	if (!q) return { suggestions: [], truncated: false };
	const hits: string[] = [];
	for (const entry of index) {
		const name = localNormalize(entry.name);
		const wordHit = name.startsWith(q) || name.split(" ").some((w) => w.startsWith(q));
		const aliasHit = !wordHit && entry.aliases.some((a) => localNormalize(a).startsWith(q));
		if (wordHit || aliasHit) {
			hits.push(entry.name);
			if (hits.length > LOCAL_MAX_RESULTS) break;
		}
	}
	return { suggestions: hits.slice(0, LOCAL_MAX_RESULTS), truncated: hits.length > LOCAL_MAX_RESULTS };
}

const DEBOUNCE_MS = 200;
// Must match MIN_QUERY_LENGTH in src/worker/routes/suggest.ts — below this,
// the backend returns no suggestions regardless, so there's no point firing
// the request (or showing the dropdown/skeleton) yet.
const MIN_QUERY_LENGTH = 3;

// Dropdown placement, in fixed-position (viewport) pixels — see
// reposition() below for why this can't just be CSS.
//
// Flush against the input (0 gap), not floating a few pixels off it: a
// visible gap reads as two separate panels that happen to be near each
// other, where flush + a shared border + squared touching corners (see the
// CSS) reads as one control that grew a list — the standard "attached
// popover" treatment.
const DROPDOWN_GAP = 0;
const DROPDOWN_MAX_HEIGHT = 224; // 14rem at the default 16px root, matches the old CSS max-height
// Floor on how short the list is allowed to get, even when the input sits
// right at the top of the safe zone (little space above it). Sized to fit 4
// suggestion rows without scrolling — measured empirically (row height ~35px
// + inter-row gap + container padding, see .guess-suggestions in App.css)
// rather than derived from those CSS values, since this constant has to be
// known in JS before layout happens.
const MIN_USABLE_SPACE = 160;

// Varied widths so the loading skeleton reads as placeholder text rather
// than a repeated decorative bar.
const SKELETON_ROW_WIDTHS = ["70%", "45%", "58%"];

interface DropdownRect {
	left: number;
	width: number;
	maxHeight: number;
	// "above" only -- anchors the list's bottom edge to the input's top.
	// Unused for "below", which is positioned by CSS.
	bottom?: number;
}

export function GuessInput({ value, onChange, onPick, disabled, suggestUrl, extraQuery = {}, excludeNames = [], placement = "above", localIndex }: Props) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	// True when the server cut the list short (more real matches exist than
	// were returned) — see suggest.ts's `truncated` flag. Shown as a hint
	// rather than silently presenting a partial list as if it were complete.
	const [truncated, setTruncated] = useState(false);
	// Explicitly closed by the player (Escape, blur, picking one) — separate
	// from `suggestions` so a short query or a dismissal hides the list
	// without needing to clear fetched data just to sync visibility.
	const [dismissed, setDismissed] = useState(false);
	const [highlight, setHighlight] = useState(-1);
	const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
	// True once a suggestion request has actually been dispatched and hasn't
	// resolved yet — set right when the fetch fires (after the debounce
	// delay), not while the debounce timer is still counting down, so the
	// skeleton reflects "we're asking the server", not "you're still
	// typing".
	const [loading, setLoading] = useState(false);
	const requestId = useRef(0);
	const inputRef = useRef<HTMLInputElement>(null);
	// Picking a suggestion may change `value` too (a caller that fills the
	// input with the picked name), which would otherwise re-trigger the
	// lookup below right after selection. Holds the picked name so that
	// ONLY that value change is skipped -- a boolean here swallowed the
	// player's next real query whenever the caller cleared the input
	// instead of filling it (Roll of Honour's answer modal after a wrong
	// answer), leaving them typing with no suggestions until the next
	// keystroke; found by the e2e suite once suggestions became
	// synchronous (2026-09-14).
	const pickedValueRef = useRef<string | null>(null);
	// The blur handler dismisses the list on a short delay (so a click on a
	// suggestion lands before the list goes). That delay outlives a blur
	// caused by the input being DISABLED while a guess is graded -- so a
	// player who starts typing again within ~150ms of the input coming
	// back had their fresh list hidden under them by the stale timer, with
	// nothing to bring it back until the next keystroke (found by the
	// Roll of Honour e2e, which retypes instantly after a wrong answer).
	// Tracked so focus and a new query can cancel it.
	const blurTimerRef = useRef<number | null>(null);
	function cancelPendingDismiss() {
		if (blurTimerRef.current !== null) {
			window.clearTimeout(blurTimerRef.current);
			blurTimerRef.current = null;
		}
	}
	useEffect(() => cancelPendingDismiss, []);

	// Already-found names are dropped from the fetched list entirely — see
	// the `excludeNames` prop doc above — rather than just being marked
	// unpickable, so they don't clutter a short list with entries that can
	// never be selected. Memoized (not just a plain const) so this stays a
	// stable reference across renders that don't change either input —
	// reposition()'s effect below depends on it, and an unmemoized new array
	// every render would re-run that effect on every keystroke for reasons
	// unrelated to the dropdown's actual size.
	const excludeSet = useMemo(
		() => new Set(excludeNames.map((n) => n.trim().toLowerCase())),
		[excludeNames],
	);
	const visibleSuggestions = useMemo(
		() => suggestions.filter((s) => !excludeSet.has(s.trim().toLowerCase())),
		[suggestions, excludeSet],
	);

	const query = value.trim();
	const visible = !dismissed && query.length >= MIN_QUERY_LENGTH && (visibleSuggestions.length > 0 || loading);

	// Scrolls the input into the safe zone as soon as it's focused — before
	// the player has even typed anything, independent of whether suggestions
	// are showing. See useKeepInSafeZone for why this can't just be the
	// browser's native scroll-into-view.
	useKeepInSafeZone(inputRef);

	// Recomputes where the dropdown should render: always directly above the
	// input (position: fixed, anchored to its on-screen rect), clamped to
	// the safe zone (see safeViewport.ts) rather than window.innerHeight —
	// the on-screen keyboard, and on iOS the address bar, can cover part of
	// the screen without shrinking the layout viewport that plain CSS
	// positioning is measured against, so a naive fixed-position dropdown
	// can end up rendered behind either one. Always opening above (never
	// below) keeps this predictable — no per-render judgment call about
	// which side has "enough" room that could differ from what actually
	// rendered, which is what made the previous flip-if-needed version feel
	// inconsistent in practice.
	const reposition = useCallback(() => {
		const el = inputRef.current;
		if (!el) return;
		const inputRect = el.getBoundingClientRect();
		const safe = getSafeViewport();
		if (placement === "below") {
			// In-flow (see the placement prop doc) -- only the height cap is
			// set from here; left/width/top come from CSS.
			setDropdownRect({ left: 0, width: 0, maxHeight: DROPDOWN_MAX_HEIGHT });
			return;
		}
		const spaceAbove = inputRect.top - safe.top - DROPDOWN_GAP;

		setDropdownRect({
			bottom: window.innerHeight - inputRect.top + DROPDOWN_GAP,
			left: inputRect.left,
			width: inputRect.width,
			maxHeight: Math.max(Math.min(spaceAbove, DROPDOWN_MAX_HEIGHT), MIN_USABLE_SPACE),
		});
	}, [placement]);

	// Reposition synchronously before paint whenever the list (re)appears or
	// its content changes size, and keep it pinned while open. Three things
	// can move the input relative to the safe zone while the keyboard is up,
	// and each needs its own listener: the keyboard opening/closing
	// (visualViewport resize), a pinch-zoom pan (visualViewport scroll), and
	// a plain window scroll — including the one useKeepInSafeZone itself
	// triggers, and possibly the browser's own native scroll-into-view on
	// top of that, so this needs to react to it regardless of source.
	//
	// Depends on visibleSuggestions.length, not visibleSuggestions itself --
	// the dropdown's rendered height (what actually needs repositioning for)
	// only depends on the row *count*, but the array reference is a brand
	// new one on every render regardless of whether the count changed (a
	// useMemo recomputing because its own excludeNames/suggestions inputs
	// are themselves fresh references every render at every current caller
	// -- PlayScreen.tsx's Array.from(...), MultiplayerPlay.tsx's .map(...),
	// and RoundPlay.tsx's unpassed-prop default all produce one).
	// Depending on that reference here means this effect reruns on every
	// render while the dropdown is open, calling reposition() ->
	// setDropdownRect -> another render -> reruns again: a genuine infinite
	// loop (confirmed live -- typing three characters into the club-badges
	// guess box reliably crashed the whole page with React's "Maximum
	// update depth exceeded"). The dependency array only needs a primitive
	// that actually reflects "did the count change", which .length is.
	useLayoutEffect(() => {
		if (!visible) return;
		reposition();
		const vv = window.visualViewport;
		vv?.addEventListener("resize", reposition);
		vv?.addEventListener("scroll", reposition);
		window.addEventListener("resize", reposition);
		window.addEventListener("scroll", reposition, { capture: true, passive: true });
		return () => {
			vv?.removeEventListener("resize", reposition);
			vv?.removeEventListener("scroll", reposition);
			window.removeEventListener("resize", reposition);
			window.removeEventListener("scroll", reposition, true);
		};
	}, [visible, visibleSuggestions.length, reposition]);

	useEffect(() => {
		// A blur-dismiss scheduled just before this query arrived (the input
		// is disabled while a guess is graded, which blurs it) must not hide
		// the list this query is about to show -- see blurTimerRef.
		cancelPendingDismiss();
		if (pickedValueRef.current !== null) {
			const wasPickFill = query === pickedValueRef.current.trim();
			pickedValueRef.current = null;
			if (wasPickFill) return;
		}
		if (query.length < MIN_QUERY_LENGTH) return; // `visible` already hides any stale list

		const id = ++requestId.current;
		if (localIndex) {
			// No network, no debounce, no skeleton -- the answer is a few
			// hundred string comparisons away.
			const data = localSuggest(localIndex, query);
			setSuggestions(data.suggestions);
			setTruncated(data.truncated);
			setDismissed(false);
			setHighlight(-1);
			return;
		}
		const timer = setTimeout(() => {
			setLoading(true); // the request is actually going out now
			const params = new URLSearchParams({ q: query, ...extraQuery });
			fetch(`${suggestUrl}?${params}`)
				.then((res) => (res.ok ? (res.json() as Promise<{ suggestions: string[]; truncated: boolean }>) : null))
				.then((data) => {
					if (!data || id !== requestId.current) return; // stale response
					setSuggestions(data.suggestions);
					setTruncated(data.truncated);
					setDismissed(false);
					setHighlight(-1);
				})
				.catch(() => {})
				.finally(() => {
					if (id === requestId.current) setLoading(false); // guard: a newer request may already own loading
				});
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
		// extraQuery is compared by value (JSON.stringify), not identity — a
		// caller passing a fresh object literal every render (e.g.
		// `extraQuery={{ category: slug }}`) would otherwise re-fire this
		// effect, and re-debounce, on every unrelated parent re-render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, suggestUrl, JSON.stringify(extraQuery), localIndex]);

	function pick(name: string) {
		pickedValueRef.current = name;
		setDismissed(true);
		setSuggestions([]);
		setTruncated(false);
		onPick(name);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!visible) return;

		if (e.key === "Escape") {
			setDismissed(true);
			return;
		}
		// The dropdown can be visible (open, showing the loading skeleton)
		// before any suggestions have arrived — nothing to navigate to yet.
		if (visibleSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight((h) => (h + 1) % visibleSuggestions.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight((h) => (h <= 0 ? visibleSuggestions.length - 1 : h - 1));
		} else if (e.key === "Enter" && highlight >= 0) {
			e.preventDefault();
			pick(visibleSuggestions[highlight]);
		}
	}

	return (
		<div className="guess-input">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
				onFocus={() => {
					cancelPendingDismiss();
					if (visibleSuggestions.length > 0) setDismissed(false);
				}}
				onBlur={() => {
					cancelPendingDismiss();
					blurTimerRef.current = window.setTimeout(() => {
						blurTimerRef.current = null;
						setDismissed(true);
					}, 150);
				}}
				placeholder="Type your guess…"
				autoFocus
				disabled={disabled}
				autoComplete="off"
				role="combobox"
				aria-expanded={visible}
				aria-autocomplete="list"
				// While open, the border/bottom corners flush with the list
				// above (see .guess-suggestions) so the input and its
				// suggestions read as one control, not two floating panels.
				className={visible ? (placement === "below" ? "guess-input__field--open guess-input__field--open-below" : "guess-input__field--open") : undefined}
			/>
			{visible && dropdownRect && (
				<ul
					className={placement === "below" ? "guess-suggestions guess-suggestions--below" : "guess-suggestions"}
					role="listbox"
					style={
						placement === "below"
							? { maxHeight: dropdownRect.maxHeight }
							: { left: dropdownRect.left, width: dropdownRect.width, maxHeight: dropdownRect.maxHeight, bottom: dropdownRect.bottom }
					}
				>
					{visibleSuggestions.length > 0
						? visibleSuggestions.map((name, i) => (
								<li key={name}>
									<button
										type="button"
										role="option"
										aria-selected={i === highlight}
										className={i === highlight ? "guess-suggestions__item--active" : undefined}
										// onMouseDown (not onClick) fires before the input's onBlur closes the list
										onMouseDown={(e) => {
											e.preventDefault();
											pick(name);
										}}
									>
										{name}
									</button>
								</li>
							))
						: // Still waiting on a response — placeholder rows in place of
							// real results, so the open-but-empty dropdown reads as "still
							// searching" rather than "no matches" or a rendering glitch.
							SKELETON_ROW_WIDTHS.map((width, i) => (
								<li key={i} className="guess-suggestions__skeleton-row" aria-hidden="true">
									<span className="guess-suggestions__skeleton-bar" style={{ width }} />
								</li>
							))}
					{/* Not a selectable option (no role="option", excluded from
					    visibleSuggestions.length so arrow-key navigation skips it) — a
					    plain hint that the list above is a cut-off subset, not the
					    complete match set, so the player knows to keep typing rather
					    than trust a partial list as if it were exhaustive. */}
					{visibleSuggestions.length > 0 && truncated && (
						<li className="guess-suggestions__hint" aria-live="polite">
							Type a few more letters to narrow the results…
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

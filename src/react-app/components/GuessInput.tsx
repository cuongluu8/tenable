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
	// The category being played — sent with every suggest request so results
	// are scoped to that category's entity_type (e.g. players never suggest
	// clubs). See suggest.ts.
	categorySlug: string;
	// Canonical names already found this round. /api/suggest searches the
	// whole reference pool, not this category's remaining answers (see
	// suggest.ts), so it has no idea what's already been found — an
	// already-found name would otherwise still show up as pickable, and
	// since picking is the *only* way to submit a guess, picking it just
	// burns a turn on something the server was always going to reject as a
	// duplicate. Filtering it out here means it can't be picked at all.
	excludeNames?: string[];
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
	bottom: number;
}

export function GuessInput({ value, onChange, onPick, disabled, categorySlug, excludeNames = [] }: Props) {
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
	// Picking a suggestion changes `value` too (it fills the input), which
	// would otherwise re-trigger the fetch below right after selection.
	const justPickedRef = useRef(false);

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
		const spaceAbove = inputRect.top - safe.top - DROPDOWN_GAP;

		setDropdownRect({
			bottom: window.innerHeight - inputRect.top + DROPDOWN_GAP,
			left: inputRect.left,
			width: inputRect.width,
			maxHeight: Math.max(Math.min(spaceAbove, DROPDOWN_MAX_HEIGHT), MIN_USABLE_SPACE),
		});
	}, []);

	// Reposition synchronously before paint whenever the list (re)appears or
	// its content changes size, and keep it pinned while open. Three things
	// can move the input relative to the safe zone while the keyboard is up,
	// and each needs its own listener: the keyboard opening/closing
	// (visualViewport resize), a pinch-zoom pan (visualViewport scroll), and
	// a plain window scroll — including the one useKeepInSafeZone itself
	// triggers, and possibly the browser's own native scroll-into-view on
	// top of that, so this needs to react to it regardless of source.
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
	}, [visible, visibleSuggestions, reposition]);

	useEffect(() => {
		if (justPickedRef.current) {
			justPickedRef.current = false;
			return;
		}
		if (query.length < MIN_QUERY_LENGTH) return; // `visible` already hides any stale list

		const id = ++requestId.current;
		const timer = setTimeout(() => {
			setLoading(true); // the request is actually going out now
			const params = new URLSearchParams({ q: query, category: categorySlug });
			fetch(`/api/suggest?${params}`)
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
	}, [query, categorySlug]);

	function pick(name: string) {
		justPickedRef.current = true;
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
				onFocus={() => visibleSuggestions.length > 0 && setDismissed(false)}
				onBlur={() => setTimeout(() => setDismissed(true), 150)}
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
				className={visible ? "guess-input__field--open" : undefined}
			/>
			{visible && dropdownRect && (
				<ul
					className="guess-suggestions"
					role="listbox"
					style={{
						left: dropdownRect.left,
						width: dropdownRect.width,
						maxHeight: dropdownRect.maxHeight,
						bottom: dropdownRect.bottom,
					}}
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

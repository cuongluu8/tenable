import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
}

const DEBOUNCE_MS = 200;

// Dropdown placement, in fixed-position (viewport) pixels — see
// reposition() below for why this can't just be CSS.
const DROPDOWN_GAP = 6;
const DROPDOWN_MAX_HEIGHT = 224; // 14rem at the default 16px root, matches the old CSS max-height
const MIN_USABLE_SPACE = 80; // below this, prefer flipping even if it's not the bigger side

interface DropdownRect {
	left: number;
	width: number;
	maxHeight: number;
	// Exactly one of these is set: `top` opens downward from the input
	// (the common case), `bottom` opens upward (the flipped case, used when
	// there isn't room below within the visible viewport).
	top?: number;
	bottom?: number;
}

export function GuessInput({ value, onChange, onPick, disabled, categorySlug }: Props) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	// Explicitly closed by the player (Escape, blur, picking one) — separate
	// from `suggestions` so a short query or a dismissal hides the list
	// without needing to clear fetched data just to sync visibility.
	const [dismissed, setDismissed] = useState(false);
	const [highlight, setHighlight] = useState(-1);
	const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
	const requestId = useRef(0);
	const inputRef = useRef<HTMLInputElement>(null);
	// Picking a suggestion changes `value` too (it fills the input), which
	// would otherwise re-trigger the fetch below right after selection.
	const justPickedRef = useRef(false);

	const query = value.trim();
	const visible = !dismissed && query.length >= 2 && suggestions.length > 0;

	// Recomputes where the dropdown should render, anchored to the input's
	// on-screen position via `position: fixed` rather than the `position:
	// absolute` this used before. The reason is mobile: opening the on-screen
	// keyboard shrinks `window.visualViewport` (the actually-visible area)
	// without shrinking `window.innerHeight`/the layout viewport that plain
	// `absolute`/`fixed` CSS is measured against — so a dropdown that always
	// opens downward from the input (which typically sits low on the page,
	// below the answer grid) can end up positioned behind the keyboard, out
	// of reach. Anchoring against `visualViewport` and flipping to open
	// *above* the input when there isn't room below fixes both: the
	// dropdown always lands within what the player can actually see and tap.
	const reposition = useCallback(() => {
		const el = inputRef.current;
		if (!el) return;
		const inputRect = el.getBoundingClientRect();
		const vv = window.visualViewport;
		const viewportTop = vv?.offsetTop ?? 0;
		const viewportBottom = viewportTop + (vv?.height ?? window.innerHeight);

		const spaceBelow = viewportBottom - inputRect.bottom - DROPDOWN_GAP;
		const spaceAbove = inputRect.top - viewportTop - DROPDOWN_GAP;

		if (spaceBelow >= MIN_USABLE_SPACE || spaceBelow >= spaceAbove) {
			setDropdownRect({
				top: inputRect.bottom + DROPDOWN_GAP,
				left: inputRect.left,
				width: inputRect.width,
				maxHeight: Math.max(Math.min(spaceBelow, DROPDOWN_MAX_HEIGHT), MIN_USABLE_SPACE),
			});
		} else {
			setDropdownRect({
				bottom: window.innerHeight - inputRect.top + DROPDOWN_GAP,
				left: inputRect.left,
				width: inputRect.width,
				maxHeight: Math.max(Math.min(spaceAbove, DROPDOWN_MAX_HEIGHT), MIN_USABLE_SPACE),
			});
		}
	}, []);

	// Reposition synchronously before paint whenever the list (re)appears or
	// its content changes size, and keep it pinned while open. Three things
	// can move the input relative to what's visible while the keyboard is
	// up, and each needs its own listener: the keyboard opening/closing
	// (visualViewport resize), a pinch-zoom pan (visualViewport scroll), and
	// — the one that actually matters most here — the browser's own
	// scroll-focused-input-into-view behavior when the keyboard opens over
	// an input positioned low on the page (a plain window scroll; relying on
	// visualViewport's scroll event alone isn't reliable for this across
	// browsers). The window-resize listener is a fallback for browsers
	// without visualViewport support at all.
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
	}, [visible, suggestions, reposition]);

	useEffect(() => {
		if (justPickedRef.current) {
			justPickedRef.current = false;
			return;
		}
		if (query.length < 2) return; // `visible` already hides any stale list

		const id = ++requestId.current;
		const timer = setTimeout(() => {
			const params = new URLSearchParams({ q: query, category: categorySlug });
			fetch(`/api/suggest?${params}`)
				.then((res) => (res.ok ? (res.json() as Promise<{ suggestions: string[] }>) : null))
				.then((data) => {
					if (!data || id !== requestId.current) return; // stale response
					setSuggestions(data.suggestions);
					setDismissed(false);
					setHighlight(-1);
				})
				.catch(() => {});
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [query, categorySlug]);

	function pick(name: string) {
		justPickedRef.current = true;
		setDismissed(true);
		setSuggestions([]);
		onPick(name);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!visible) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight((h) => (h + 1) % suggestions.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
		} else if (e.key === "Enter" && highlight >= 0) {
			e.preventDefault();
			pick(suggestions[highlight]);
		} else if (e.key === "Escape") {
			setDismissed(true);
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
				onFocus={() => suggestions.length > 0 && setDismissed(false)}
				onBlur={() => setTimeout(() => setDismissed(true), 150)}
				placeholder="Type your guess…"
				autoFocus
				disabled={disabled}
				autoComplete="off"
				role="combobox"
				aria-expanded={visible}
				aria-autocomplete="list"
			/>
			{visible && dropdownRect && (
				<ul
					className="guess-suggestions"
					role="listbox"
					style={{
						left: dropdownRect.left,
						width: dropdownRect.width,
						maxHeight: dropdownRect.maxHeight,
						...(dropdownRect.top !== undefined
							? { top: dropdownRect.top }
							: { bottom: dropdownRect.bottom }),
					}}
				>
					{suggestions.map((name, i) => (
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
					))}
				</ul>
			)}
		</div>
	);
}

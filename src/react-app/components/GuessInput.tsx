import { useEffect, useRef, useState } from "react";

interface Props {
	value: string;
	onChange: (value: string) => void;
	// Called when the player picks a suggestion (click, or Enter while one is
	// highlighted) — the parent fills the input and submits immediately, since
	// picking from the list exists specifically to skip typing out the guess.
	onPick: (name: string) => void;
	disabled: boolean;
}

const DEBOUNCE_MS = 200;

export function GuessInput({ value, onChange, onPick, disabled }: Props) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	// Explicitly closed by the player (Escape, blur, picking one) — separate
	// from `suggestions` so a short query or a dismissal hides the list
	// without needing to clear fetched data just to sync visibility.
	const [dismissed, setDismissed] = useState(false);
	const [highlight, setHighlight] = useState(-1);
	const requestId = useRef(0);
	const inputRef = useRef<HTMLInputElement>(null);
	// Picking a suggestion changes `value` too (it fills the input), which
	// would otherwise re-trigger the fetch below right after selection.
	const justPickedRef = useRef(false);

	const query = value.trim();
	const visible = !dismissed && query.length >= 2 && suggestions.length > 0;

	useEffect(() => {
		if (justPickedRef.current) {
			justPickedRef.current = false;
			return;
		}
		if (query.length < 2) return; // `visible` already hides any stale list

		const id = ++requestId.current;
		const timer = setTimeout(() => {
			fetch(`/api/suggest?q=${encodeURIComponent(query)}`)
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
	}, [query]);

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
			{visible && (
				<ul className="guess-suggestions" role="listbox">
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

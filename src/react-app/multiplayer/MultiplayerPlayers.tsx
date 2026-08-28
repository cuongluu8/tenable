import { useEffect, useState } from "react";
import { colorForPlayerIndex } from "./state";

interface Props {
	onNext: (playerNames: string[]) => void;
	onBack: () => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8; // a sane upper bound for pass-and-play — no real limit demanded, just guards the UI from growing unbounded

// Remembers the last roster in this browser so the same group doesn't have
// to retype their names every game — purely a client-side convenience (no
// device ID, no server round-trip), same "one browser tab" scope as the
// rest of multiplayer's state. Wrapped in try/catch: private browsing or a
// blocked storage permission can make localStorage throw on read or write,
// and losing the remembered roster is a fine fallback for that, not worth
// surfacing an error over.
const STORAGE_KEY = "tenable-mp-players";

function loadStoredPlayers(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		const names = parsed.filter((n): n is string => typeof n === "string" && n.trim().length > 0);
		// De-duplicate defensively (case-insensitive, matching addPlayer's own
		// check below) in case an older version of this list was saved before
		// that check existed.
		const seen = new Set<string>();
		const deduped = names.filter((n) => {
			const key = n.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		return deduped.slice(0, MAX_PLAYERS);
	} catch {
		return [];
	}
}

function saveStoredPlayers(names: string[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
	} catch {
		// Nothing to persist to — next game just starts with an empty roster.
	}
}

// First step of multiplayer setup: build the player roster before ever
// touching category selection (see MultiplayerCategoryPick.tsx for the
// second step) — home page picks single-player vs multiplayer, single-
// player goes straight to categories, multiplayer collects players first.
export function MultiplayerPlayers({ onNext, onBack }: Props) {
	const [playerNames, setPlayerNames] = useState<string[]>(loadStoredPlayers);
	const [nameInput, setNameInput] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);

	// Keep the remembered roster in sync with whatever's currently shown —
	// covers adds, removes, and moving on, so the *next* time this screen
	// mounts (a fresh game, or coming back from the category step) it picks
	// up right where this one left off.
	useEffect(() => {
		saveStoredPlayers(playerNames);
	}, [playerNames]);

	function addPlayer(e: React.FormEvent) {
		e.preventDefault();
		const name = nameInput.trim();
		if (!name || playerNames.length >= MAX_PLAYERS) return;
		// Two players with the same name can't be told apart on the "whose
		// turn" banner or in the final standings — reject rather than silently
		// add a second, indistinguishable entry.
		if (playerNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
			setNameError(`"${name}" is already in the game.`);
			return;
		}
		setNameError(null);
		setPlayerNames((prev) => [...prev, name]);
		setNameInput("");
	}

	function removePlayer(index: number) {
		setPlayerNames((prev) => prev.filter((_, i) => i !== index));
	}

	const canProceed = playerNames.length >= MIN_PLAYERS;

	return (
		<div className="mp-setup">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Multiplayer — pass and play</h2>
			<p className="mp-setup__hint">
				Everyone plays on this device, taking turns. {MIN_PLAYERS}-{MAX_PLAYERS} players, 3 lives each.
			</p>

			<form className="mp-setup__add-player" onSubmit={addPlayer}>
				<label className="mp-setup__field">
					Add player
					<input
						type="text"
						value={nameInput}
						onChange={(e) => {
							setNameInput(e.target.value);
							setNameError(null);
						}}
						placeholder="Player name"
						disabled={playerNames.length >= MAX_PLAYERS}
					/>
				</label>
				<button type="submit" disabled={!nameInput.trim() || playerNames.length >= MAX_PLAYERS}>
					Add
				</button>
			</form>
			{nameError && <p className="mp-setup__error">{nameError}</p>}

			{playerNames.length > 0 && (
				<ul className="mp-setup__players">
					{playerNames.map((name, i) => (
						<li key={i}>
							<span className="mp-setup__player-name">
								<span
									className="mp-setup__color-dot"
									style={{ background: colorForPlayerIndex(i) }}
									aria-hidden="true"
								/>
								{name}
							</span>
							<button type="button" className="mp-setup__remove" onClick={() => removePlayer(i)} aria-label={`Remove ${name}`}>
								✕
							</button>
						</li>
					))}
				</ul>
			)}

			<button type="button" className="mp-setup__start" onClick={() => onNext(playerNames)} disabled={!canProceed}>
				Next: choose a category
			</button>
			{playerNames.length > 0 && !canProceed && (
				<p className="mp-setup__hint">Add at least {MIN_PLAYERS} players to continue.</p>
			)}
		</div>
	);
}

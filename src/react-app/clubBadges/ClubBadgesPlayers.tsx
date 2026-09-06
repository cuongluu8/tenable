import { useEffect, useState } from "react";
import { colorForPlayerIndex } from "../multiplayer/state";

interface Props {
	onStart: (playerNames: string[]) => void;
	onBack: () => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8; // matches multiplayer's cap -- same "sane pass-and-play upper bound", no real limit demanded

// Own localStorage key, own module -- same reasoning as state.ts's module
// doc: this is solving the same "remember the roster" problem
// MultiplayerPlayers.tsx does, not sharing code with it, since the two
// screens' next steps diverge immediately after (this one starts the round
// directly; multiplayer's goes on to a category-pick step).
const STORAGE_KEY = "tenable-cb-players";

function loadStoredPlayers(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		const names = parsed.filter((n): n is string => typeof n === "string" && n.trim().length > 0);
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
		// Nothing to persist to -- next game just starts with an empty roster.
	}
}

// Roster step for "Guess the player" -- no category step after this one
// (unlike multiplayer's setup wizard): the round is always 10 random
// questions from the whole pool, so there's nothing to pick.
export function ClubBadgesPlayers({ onStart, onBack }: Props) {
	const [playerNames, setPlayerNames] = useState<string[]>(loadStoredPlayers);
	const [nameInput, setNameInput] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);

	useEffect(() => {
		saveStoredPlayers(playerNames);
	}, [playerNames]);

	function addPlayer(e: React.FormEvent) {
		e.preventDefault();
		const name = nameInput.trim();
		if (!name || playerNames.length >= MAX_PLAYERS) return;
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
			<h2>Guess the player</h2>
			<p className="mp-setup__hint">
				Everyone plays on this device, taking turns. {MIN_PLAYERS}-{MAX_PLAYERS} players, 10 questions per round.
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

			<button type="button" className="mp-setup__start" onClick={() => onStart(playerNames)} disabled={!canProceed}>
				Start round
			</button>
			{playerNames.length > 0 && !canProceed && (
				<p className="mp-setup__hint">Add at least {MIN_PLAYERS} players to continue.</p>
			)}
		</div>
	);
}

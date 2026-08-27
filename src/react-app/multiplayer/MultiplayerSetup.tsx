import { useEffect, useState } from "react";
import type { CategoriesResponse, CategorySummary } from "../types";
import type { MpCategory } from "./state";

interface Props {
	onStart: (category: MpCategory, playerNames: string[]) => void;
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

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; categories: CategorySummary[] };

// Setup screen for single-device pass-and-play: pick a category (same list
// single-player already offers, via the same /api/categories endpoint —
// status/group aren't meaningful here so this ignores both, just a flat
// picker), then build a player roster before starting. No slug, no joining
// from another device — see the plan this was built from.
export function MultiplayerSetup({ onStart }: Props) {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [categorySlug, setCategorySlug] = useState("");
	const [playerNames, setPlayerNames] = useState<string[]>(loadStoredPlayers);
	const [nameInput, setNameInput] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);

	// Keep the remembered roster in sync with whatever's currently shown —
	// covers adds, removes, and starting a game, so the *next* setup screen
	// (a fresh mount, whether from "New game" or reloading the page) picks up
	// right where this one left off.
	useEffect(() => {
		saveStoredPlayers(playerNames);
	}, [playerNames]);

	useEffect(() => {
		fetch("/api/categories")
			.then((res) => {
				if (!res.ok) throw new Error("Couldn't load categories");
				return res.json() as Promise<CategoriesResponse>;
			})
			.then((data) => {
				setLoad({ status: "ready", categories: data.categories });
				if (data.categories.length > 0) setCategorySlug(data.categories[0].slug);
			})
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, []);

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

	function start() {
		if (load.status !== "ready") return;
		const category = load.categories.find((c) => c.slug === categorySlug);
		if (!category || playerNames.length < MIN_PLAYERS) return;
		onStart(
			{
				slug: category.slug,
				title: category.title,
				subtitle: category.subtitle,
				statLabel: category.statLabel,
				answerCount: category.answerCount,
			},
			playerNames,
		);
	}

	const canStart = load.status === "ready" && categorySlug !== "" && playerNames.length >= MIN_PLAYERS;

	return (
		<div className="mp-setup">
			<h2>Multiplayer — pass and play</h2>
			<p className="mp-setup__hint">
				Everyone plays on this device, taking turns. {MIN_PLAYERS}-{MAX_PLAYERS} players, 3 lives each.
			</p>

			{load.status === "loading" && <p>Loading categories…</p>}
			{load.status === "error" && <p>{load.message}</p>}
			{load.status === "ready" && (
				<label className="mp-setup__field">
					Category
					<select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
						{load.categories.map((cat) => (
							<option key={cat.slug} value={cat.slug}>
								{cat.title}
							</option>
						))}
					</select>
				</label>
			)}

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
							<span>{name}</span>
							<button type="button" className="mp-setup__remove" onClick={() => removePlayer(i)} aria-label={`Remove ${name}`}>
								✕
							</button>
						</li>
					))}
				</ul>
			)}

			<button type="button" className="mp-setup__start" onClick={start} disabled={!canStart}>
				Start Game
			</button>
			{playerNames.length > 0 && playerNames.length < MIN_PLAYERS && (
				<p className="mp-setup__hint">Add at least {MIN_PLAYERS} players to start.</p>
			)}
		</div>
	);
}

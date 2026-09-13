import { useEffect, useState } from "react";
import "../remote/remote.css";
import "./rollOfHonour.css";
import { GuessInput } from "../components/GuessInput";
import { LivesIndicator } from "../components/LivesIndicator";
import { HonourTile } from "./HonourTile";

const MAX_LIVES = 5;
const MY_COLOR = "#4ade80";

interface Competition {
	id: string;
	name: string;
	seasonCount: number;
}

// Everything about one solo game that has to survive a refresh -- keyed
// per competition in localStorage (a game per competition can be in
// flight at once). `revealed` is filled at game over from /reveal so the
// finished board comes back intact too.
interface SavedGame {
	answered: Record<string, { winner: string; imageUrl: string | null }>;
	hints: Record<string, string>; // season -> country, once asked for
	lives: number;
	over: boolean;
	gaveUp: boolean;
	revealed: Record<string, { winner: string; imageUrl: string | null }> | null;
}

const FRESH_GAME: SavedGame = { answered: {}, hints: {}, lives: MAX_LIVES, over: false, gaveUp: false, revealed: null };
const storageKey = (competitionId: string) => `rollOfHonour.solo.${competitionId}`;

function loadGame(competitionId: string): SavedGame {
	try {
		const raw = localStorage.getItem(storageKey(competitionId));
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<SavedGame>;
			if (parsed && typeof parsed.lives === "number" && parsed.answered) return { ...FRESH_GAME, ...parsed };
		}
	} catch {
		// Corrupt/foreign value -- start fresh, same as a first visit.
	}
	return FRESH_GAME;
}

function saveGame(competitionId: string, game: SavedGame): void {
	try {
		localStorage.setItem(storageKey(competitionId), JSON.stringify(game));
	} catch {
		// Storage full/blocked -- the game still plays, it just won't survive a refresh.
	}
}

interface Props {
	basePath: string;
	onExit: () => void;
}

// Roll of Honour, single player (2026-09-13): the same grid remote play
// races on (remote/RollOfHonourGame.tsx -- same tiles, same answer modal,
// same server-side grading via routes/rollOfHonour.ts's solo endpoints),
// played alone against 5 lives. Tap a season, name the winner; wrong
// costs a life but the season stays open to retry; the one hint is the
// winner's country; Give up or running out of lives ends the game and
// reveals the whole roll. Two screens under one route: the competition
// picker at `basePath`, the board at `basePath/<competitionId>`.
export function RollOfHonourSolo({ basePath, onExit }: Props) {
	const [competitionId, setCompetitionId] = useState<string | null>(() => competitionFromPath(basePath));
	useEffect(() => {
		const onPop = () => setCompetitionId(competitionFromPath(basePath));
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [basePath]);

	if (!competitionId) {
		return (
			<CompetitionPicker
				onExit={onExit}
				onPick={(id) => {
					window.history.pushState(null, "", `${basePath}/${id}`);
					setCompetitionId(id);
				}}
			/>
		);
	}
	return (
		<Board
			key={competitionId}
			competitionId={competitionId}
			onBack={() => {
				window.history.pushState(null, "", basePath);
				setCompetitionId(null);
			}}
		/>
	);
}

function competitionFromPath(basePath: string): string | null {
	const rest = window.location.pathname.slice(basePath.length).replace(/^\//, "");
	return rest || null;
}

function CompetitionPicker({ onPick, onExit }: { onPick: (id: string) => void; onExit: () => void }) {
	const [competitions, setCompetitions] = useState<Competition[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		let cancelled = false;
		fetch("/api/roll-of-honour/competitions")
			.then((r) => (r.ok ? (r.json() as Promise<{ competitions: Competition[] }>) : Promise.reject(new Error())))
			.then((d) => {
				if (!cancelled) setCompetitions(d.competitions);
			})
			.catch(() => {
				if (!cancelled) setError("Couldn't load the competitions right now — try again in a moment.");
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onExit}>
				← Back
			</button>
			<h2>Roll of Honour</h2>
			<p className="remote-subtitle">Fill in every season's champion. Five lives; the hint is the winner's country.</p>
			{error && <p className="load-error">{error}</p>}
			{!competitions && !error && <p>Loading…</p>}
			{competitions && (
				<div className="mode-picker">
					{competitions.map((c) => {
						const saved = loadGame(c.id);
						const done = Object.keys(saved.answered).length;
						return (
							<button key={c.id} type="button" className="mode-button" onClick={() => onPick(c.id)}>
								<strong>🏆 {c.name}</strong>
								<span>{c.seasonCount} seasons</span>
								{done > 0 && (
									<span className="roh-comp-progress">
										{saved.over
											? `Finished: ${done} of ${c.seasonCount}`
											: `In progress: ${done} of ${c.seasonCount}, ${saved.lives} ${saved.lives === 1 ? "life" : "lives"} left`}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

interface BoardData {
	id: string;
	name: string;
	seasons: string[];
}

type Feedback = { kind: "correct" | "wrong" | "info"; text: string } | null;

function Board({ competitionId, onBack }: { competitionId: string; onBack: () => void }) {
	const [board, setBoard] = useState<BoardData | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [game, setGame] = useState<SavedGame>(() => loadGame(competitionId));
	const [selected, setSelected] = useState<string | null>(null);
	const [guess, setGuess] = useState("");
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState<Feedback>(null);
	const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetch(`/api/roll-of-honour/board?competition=${encodeURIComponent(competitionId)}`)
			.then((r) => (r.ok ? (r.json() as Promise<BoardData>) : Promise.reject(new Error())))
			.then((d) => {
				if (!cancelled) setBoard(d);
			})
			.catch(() => {
				if (!cancelled) setLoadError("Couldn't load this competition right now — try again in a moment.");
			});
		return () => {
			cancelled = true;
		};
	}, [competitionId]);

	// Every state change is persisted -- the one place saveGame is called.
	function update(next: SavedGame) {
		setGame(next);
		saveGame(competitionId, next);
	}

	function closeModal() {
		setSelected(null);
		setGuess("");
	}

	async function endGame(gaveUp: boolean, current: SavedGame) {
		let revealed: SavedGame["revealed"] = null;
		try {
			const r = await fetch("/api/roll-of-honour/reveal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ competitionId }),
			});
			if (r.ok) {
				const d = (await r.json()) as { tiles: { season: string; winner: string; imageUrl: string | null }[] };
				revealed = Object.fromEntries(d.tiles.map((t) => [t.season, { winner: t.winner, imageUrl: t.imageUrl }]));
			}
		} catch {
			// Reveal is a courtesy -- the game is still over without it.
		}
		update({ ...current, over: true, gaveUp, revealed });
		closeModal();
	}

	async function answer(name: string) {
		if (!selected || busy || game.over) return;
		setBusy(true);
		setFeedback(null);
		try {
			const r = await fetch("/api/roll-of-honour/check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ competitionId, season: selected, guess: name }),
			});
			const d = (await r.json()) as { result: "correct"; winner: string; imageUrl: string | null } | { result: "wrong" } | { error: string };
			if ("error" in d) {
				setFeedback({ kind: "info", text: d.error });
				return;
			}
			if (d.result === "correct") {
				const next: SavedGame = { ...game, answered: { ...game.answered, [selected]: { winner: d.winner, imageUrl: d.imageUrl } } };
				setFeedback({ kind: "correct", text: `✅ ${selected}: ${d.winner}` });
				closeModal();
				if (board && Object.keys(next.answered).length === board.seasons.length) await endGame(false, next);
				else update(next);
				return;
			}
			const lives = game.lives - 1;
			setGuess("");
			setFeedback({ kind: "wrong", text: `❌ Not ${name}` });
			if (lives <= 0) await endGame(false, { ...game, lives: 0 });
			else update({ ...game, lives });
		} catch {
			setFeedback({ kind: "info", text: "Couldn't check that — try again." });
		} finally {
			setBusy(false);
		}
	}

	async function hint() {
		if (!selected || busy || game.hints[selected]) return;
		setBusy(true);
		try {
			const r = await fetch("/api/roll-of-honour/hint", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ competitionId, season: selected }),
			});
			if (r.ok) {
				const d = (await r.json()) as { country: string };
				update({ ...game, hints: { ...game.hints, [selected]: d.country } });
			}
		} finally {
			setBusy(false);
		}
	}

	function reset() {
		update(FRESH_GAME);
		setFeedback(null);
		closeModal();
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onBack}>
					← Back
				</button>
				<p className="load-error">{loadError}</p>
			</div>
		);
	}
	if (!board) {
		return (
			<div className="screen">
				<p>Loading…</p>
			</div>
		);
	}

	const done = Object.keys(game.answered).length;
	const total = board.seasons.length;

	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onBack}>
				← Competitions
			</button>
			<div className="roh-solo-header">
				<span>
					{board.name} · {done} of {total} filled
				</span>
				<LivesIndicator total={MAX_LIVES} remaining={game.lives} />
			</div>

			{game.over ? (
				<div className="roh-over">
					<p className="remote-subtitle" style={{ margin: 0 }}>
						{done === total ? "You filled the whole roll!" : game.gaveUp ? "You gave up." : "Out of lives."}
					</p>
					<p className="roh-over__score">
						{done} of {total}
					</p>
					<div className="roh-over__actions">
						<button type="button" className="remote-primary-button" onClick={reset}>
							Play again
						</button>
						<button type="button" onClick={onBack}>
							Another competition
						</button>
					</div>
				</div>
			) : (
				<p className="remote-subtitle roh-hint">Tap a season, then name the champion. A wrong answer costs a life.</p>
			)}

			{feedback && !game.over && !selected && <p className={`roh-feedback roh-feedback--${feedback.kind}`}>{feedback.text}</p>}

			<div className="roh-grid">
				{board.seasons.map((season) => {
					const got = game.answered[season];
					const shown = got ?? (game.over ? game.revealed?.[season] : undefined);
					return (
						<HonourTile
							key={season}
							tile={{ season, status: shown ? "answered" : "open", winner: shown?.winner ?? null, imageUrl: shown?.imageUrl ?? null }}
							ownerColor={got ? MY_COLOR : undefined}
							missed={Boolean(shown && !got)}
							disabled={busy || game.over}
							onSelect={() => {
								setSelected(season);
								setGuess("");
								setFeedback(null);
							}}
						/>
					);
				})}
			</div>

			{!game.over && (
				<div className="remote-give-up">
					{confirmingGiveUp ? (
						<div className="give-up-confirm">
							<span>Give up and reveal the roll?</span>
							<button type="button" className="give-up-confirm__yes" onClick={() => void endGame(true, game)} disabled={busy}>
								Yes, give up
							</button>
							<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirmingGiveUp(false)} disabled={busy}>
								Cancel
							</button>
						</div>
					) : (
						<button type="button" className="give-up-link" onClick={() => setConfirmingGiveUp(true)} disabled={busy}>
							Give up
						</button>
					)}
				</div>
			)}

			{/* Same answer modal as remote play (see RollOfHonourGame.tsx on
			    the 25%-down placement and the list opening below), plus the
			    solo mode's hint. Stays open after a wrong answer so a retry
			    is one pick away -- there are lives to spend, unlike remote. */}
			{selected && !game.over && (
				<div className="remote-modal-backdrop remote-modal-backdrop--upper" onClick={closeModal}>
					<div className="remote-modal" role="dialog" aria-modal="true" aria-label={`Who won in ${selected}?`} onClick={(e) => e.stopPropagation()}>
						<div className="remote-modal__header">
							<h3 className="remote-modal__title">Who won in {selected}?</h3>
							<button type="button" className="remote-modal__close" onClick={closeModal} aria-label="Close">
								×
							</button>
						</div>
						<GuessInput value={guess} onChange={setGuess} onPick={answer} disabled={busy} suggestUrl="/api/roll-of-honour/suggest" placement="below" />
						{feedback && feedback.kind !== "correct" && <p className={`roh-feedback roh-feedback--${feedback.kind}`}>{feedback.text}</p>}
						{game.hints[selected] ? (
							<p className="roh-hint-text">Country: {game.hints[selected]}</p>
						) : (
							<div className="roh-modal-actions">
								<button type="button" className="cb-hint-button" onClick={() => void hint()} disabled={busy}>
									💡 Hint: show the country
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

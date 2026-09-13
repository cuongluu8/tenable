import { useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../components/clubBadges.css";
import "../remote/remote.css";
import "./rollOfHonour.css";
import { GuessInput } from "../components/GuessInput";
import { HonourTile } from "./HonourTile";
import { initialPassPlayState, passPlayReducer, rankPassPlayers } from "./passPlayState";

interface Competition {
	id: string;
	name: string;
	seasonCount: number;
}

interface PickProps {
	onStart: (competitionId: string) => void;
	onBack: () => void;
}

// Third step of pass-and-play's Roll of Honour setup (after roster and
// game type): which competition's grid the group fills in. Same list the
// solo picker and the remote lobby read (/api/roll-of-honour/competitions).
export function RollOfHonourCompetitionPick({ onStart, onBack }: PickProps) {
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
		<div className="mp-setup">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Choose a competition</h2>
			<p className="mp-setup__hint">Take turns naming each season's champion. One attempt per turn; most tiles wins.</p>
			{error && <p className="load-error">{error}</p>}
			{!competitions && !error && <p>Loading…</p>}
			{competitions && (
				<div className="mode-picker">
					{competitions.map((c) => (
						<button key={c.id} type="button" className="mode-button" onClick={() => onStart(c.id)}>
							<strong>🏆 {c.name}</strong>
							<span>{c.seasonCount} seasons</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

interface Props {
	playerNames: string[];
	competitionId: string;
	onExit: () => void;
}

interface BoardData {
	id: string;
	name: string;
	seasons: string[];
}

type Feedback = { kind: "correct" | "wrong" | "info"; text: string } | null;

// Roll of Honour, pass-and-play -- the rules live in passPlayState.ts;
// this is the grid (shared with solo and remote via HonourTile), the
// roster/turn chrome Club Run's pass-and-play uses (.mp-players, the
// .cb-turn-banner), and the same answer modal.
export function RollOfHonourPassPlay({ playerNames, competitionId, onExit }: Props) {
	const [board, setBoard] = useState<BoardData | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [state, dispatch] = useReducer(passPlayReducer, initialPassPlayState);
	const [selected, setSelected] = useState<string | null>(null);
	const [guess, setGuess] = useState("");
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState<Feedback>(null);
	const [confirmingEnd, setConfirmingEnd] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetch(`/api/roll-of-honour/board?competition=${encodeURIComponent(competitionId)}`)
			.then((r) => (r.ok ? (r.json() as Promise<BoardData>) : Promise.reject(new Error())))
			.then((d) => {
				if (cancelled) return;
				setBoard(d);
				dispatch({ type: "start", playerNames, seasons: d.seasons });
			})
			.catch(() => {
				if (!cancelled) setLoadError("Couldn't load this competition right now — try again in a moment.");
			});
		return () => {
			cancelled = true;
		};
		// playerNames is fixed for this component's life (Multiplayer.tsx
		// remounts it for a new roster) -- the fetch is really mount-once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [competitionId]);

	// Reveal the whole roll the moment the game ends, however it ended.
	useEffect(() => {
		if (!state.over || state.revealed) return;
		let cancelled = false;
		fetch("/api/roll-of-honour/reveal", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ competitionId }),
		})
			.then((r) => (r.ok ? (r.json() as Promise<{ tiles: { season: string; winner: string; imageUrl: string | null }[] }>) : null))
			.then((d) => {
				if (!cancelled && d) dispatch({ type: "revealed", tiles: d.tiles });
			})
			.catch(() => {
				// The standings still show without the reveal.
			});
		return () => {
			cancelled = true;
		};
	}, [state.over, state.revealed, competitionId]);

	function closeModal() {
		setSelected(null);
		setGuess("");
	}

	async function answer(name: string) {
		if (!selected || busy || state.over) return;
		const season = selected;
		const player = state.players[state.turnIndex];
		setBusy(true);
		try {
			const r = await fetch("/api/roll-of-honour/check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ competitionId, season, guess: name }),
			});
			const d = (await r.json()) as { result: "correct"; winner: string; imageUrl: string | null } | { result: "wrong" } | { error: string };
			if ("error" in d) {
				setFeedback({ kind: "info", text: d.error });
				return;
			}
			closeModal();
			if (d.result === "correct") {
				dispatch({ type: "correct", season, winner: d.winner, imageUrl: d.imageUrl });
				setFeedback({ kind: "correct", text: `✅ ${player.name} got ${season}: ${d.winner}` });
			} else {
				dispatch({ type: "wrong" });
				setFeedback({ kind: "wrong", text: `❌ Not ${name}` });
			}
		} catch {
			setFeedback({ kind: "info", text: "Couldn't check that — try again." });
		} finally {
			setBusy(false);
		}
	}

	if (loadError) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={onExit}>
					← Back
				</button>
				<p className="load-error">{loadError}</p>
			</div>
		);
	}
	if (!board || state.players.length === 0) {
		return (
			<div className="screen">
				<p>Loading…</p>
			</div>
		);
	}

	const current = state.players[state.turnIndex];
	const done = Object.keys(state.answered).length;
	const total = board.seasons.length;

	if (state.over) {
		const ranked = rankPassPlayers(state.players);
		return (
			<div className="screen">
				<h2>Final results</h2>
				<p className="remote-subtitle">
					{board.name} · {done === total ? "every season filled" : state.gaveUp ? `the group gave up at ${done} of ${total}` : `${done} of ${total}`}
				</p>
				<ol className="remote-standings">
					{ranked.map((r) => (
						<li key={r.index} className="remote-standings__item">
							<span className="remote-standings__rank">{r.rank}</span>
							<span className="remote-players__color" style={{ background: r.player.color }} />
							<span className="remote-standings__name">{r.player.name}</span>
							<span className="remote-standings__wins">
								{r.player.correct} tile{r.player.correct === 1 ? "" : "s"}
							</span>
						</li>
					))}
				</ol>
				<div className="roh-grid roh-grid--final">
					{board.seasons.map((season) => {
						const got = state.answered[season];
						const shown = got ?? state.revealed?.[season];
						return (
							<HonourTile
								key={season}
								tile={{ season, status: shown ? "answered" : "open", winner: shown?.winner ?? null, imageUrl: shown?.imageUrl ?? null }}
								ownerColor={got ? state.players[got.playerIndex].color : undefined}
								missed={Boolean(shown && !got)}
								disabled
								onSelect={() => undefined}
							/>
						);
					})}
				</div>
				<button type="button" className="remote-primary-button" onClick={onExit}>
					Play again
				</button>
			</div>
		);
	}

	return (
		<div className="screen cb-play">
			<button type="button" className="back-link" onClick={onExit}>
				← New game
			</button>
			<p className="cb-progress">
				{board.name} — {done} of {total} filled
			</p>

			<ul className="mp-players">
				{state.players.map((player, i) => (
					<li key={i} className={i === state.turnIndex ? "mp-players__item--active" : undefined} style={{ "--player-color": player.color } as React.CSSProperties}>
						<span className="mp-players__name">{player.name}</span>
						<span className="cb-players__correct">
							{player.correct} tile{player.correct === 1 ? "" : "s"}
						</span>
					</li>
				))}
			</ul>

			<p className="cb-turn-banner" style={{ "--player-color": current.color } as React.CSSProperties}>
				{current.name}'s turn — tap a season
			</p>

			{feedback && !selected && <p className={`roh-feedback roh-feedback--${feedback.kind}`}>{feedback.text}</p>}

			<div className="roh-grid">
				{board.seasons.map((season) => {
					const got = state.answered[season];
					return (
						<HonourTile
							key={season}
							tile={{ season, status: got ? "answered" : "open", winner: got?.winner ?? null, imageUrl: got?.imageUrl ?? null }}
							ownerColor={got ? state.players[got.playerIndex].color : undefined}
							disabled={busy}
							onSelect={() => {
								setSelected(season);
								setGuess("");
								setFeedback(null);
							}}
						/>
					);
				})}
			</div>

			<div className="roh-pass-actions">
				<button
					type="button"
					className="give-up-confirm__cancel"
					onClick={() => {
						dispatch({ type: "skip" });
						setFeedback({ kind: "info", text: `${current.name} passed.` });
					}}
					disabled={busy}
				>
					Skip turn
				</button>
				{confirmingEnd ? (
					<div className="give-up-confirm">
						<span>End the game and reveal the roll?</span>
						<button type="button" className="give-up-confirm__yes" onClick={() => dispatch({ type: "giveUp" })} disabled={busy}>
							Yes, end it
						</button>
						<button type="button" className="give-up-confirm__cancel" onClick={() => setConfirmingEnd(false)} disabled={busy}>
							Cancel
						</button>
					</div>
				) : (
					<button type="button" className="give-up-link" onClick={() => setConfirmingEnd(true)} disabled={busy}>
						Give up
					</button>
				)}
			</div>

			{selected && (
				<div className="remote-modal-backdrop remote-modal-backdrop--upper" onClick={closeModal}>
					<div className="remote-modal" role="dialog" aria-modal="true" aria-label={`${current.name}: who won in ${selected}?`} onClick={(e) => e.stopPropagation()}>
						<div className="remote-modal__header">
							<h3 className="remote-modal__title">
								<span style={{ color: current.color }}>{current.name}</span>: who won in {selected}?
							</h3>
							<button type="button" className="remote-modal__close" onClick={closeModal} aria-label="Close">
								×
							</button>
						</div>
						<GuessInput value={guess} onChange={setGuess} onPick={answer} disabled={busy} suggestUrl="/api/roll-of-honour/suggest" placement="below" />
						{feedback?.kind === "info" && <p className="roh-feedback roh-feedback--info">{feedback.text}</p>}
						<p className="roh-sheet__hint">One attempt -- right or wrong, the turn passes.</p>
					</div>
				</div>
			)}
		</div>
	);
}

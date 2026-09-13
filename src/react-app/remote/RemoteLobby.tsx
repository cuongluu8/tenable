import { useEffect, useState } from "react";
import { colorForPlayerIndex } from "../components/playerColors";
import { apiHonourCompetitions, REMOTE_GAME_LABELS, type HonourCompetitionOption, type SessionState } from "./remoteApi";
import { shareSessionViaWhatsApp } from "./shareSession";

const DEFAULT_QUESTION_COUNT = 5;
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20; // Matches remoteGameSession.ts's own bound.

interface Props {
	state: SessionState;
	sessionCode: string;
	myPlayerId: string;
	isHost: boolean;
	error: string | null;
	onSetReady: (ready: boolean) => void;
	// competitionId only means anything for Roll of Honour (see
	// apiStartGame); undefined for the round formats.
	onStart: (questionCount: number, competitionId?: string) => void;
	onRemovePlayer: (playerId: string) => void;
	onLeave: () => void;
}

// The waiting room: share the code, watch players join and ready up, and
// (host only) pick a question count and start. Kept entirely dumb -- all
// the actual gating logic (who's ready, who's away, whether starting is
// currently allowed) already happened server-side; this only renders
// whatever `state` says and lets the host retry once told no.
export function RemoteLobby({ state, sessionCode, myPlayerId, isHost, error, onSetReady, onStart, onRemovePlayer, onLeave }: Props) {
	const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
	const me = state.players.find((p) => p.id === myPlayerId);
	// Roll of Honour's competition picker -- loaded once for a Roll of
	// Honour lobby, from the server's own list, so the lobby never has to
	// know which competitions exist. Empty until it arrives (the Start
	// button waits on it).
	const isHonour = state.gameType === "roll-of-honour";
	const [competitions, setCompetitions] = useState<HonourCompetitionOption[]>([]);
	const [competitionId, setCompetitionId] = useState<string | null>(null);
	useEffect(() => {
		if (!isHonour) return;
		let cancelled = false;
		apiHonourCompetitions().then((res) => {
			if (cancelled || res.status !== 200 || !("competitions" in res.body)) return;
			setCompetitions(res.body.competitions);
			// Default to the most recent era (last in the server's
			// chronological list) rather than the first.
			setCompetitionId((current) => current ?? res.body.competitions[res.body.competitions.length - 1]?.id ?? null);
		});
		return () => {
			cancelled = true;
		};
	}, [isHonour]);

	return (
		<div className="screen">
			<h2>Waiting room</h2>
			<p className="remote-subtitle">{REMOTE_GAME_LABELS[state.gameType]}</p>

			<div className="remote-code-display">
				<span className="remote-code-display__label">Session code</span>
				<span className="remote-code-display__value">{sessionCode}</span>
				<button type="button" onClick={() => shareSessionViaWhatsApp(sessionCode, REMOTE_GAME_LABELS[state.gameType])}>
					Share via WhatsApp
				</button>
			</div>

			{error && <p className="remote-error">{error}</p>}

			<ul className="remote-players">
				{state.players.map((p, i) => (
					<li key={p.id} className="remote-players__item">
						<span className="remote-players__color" style={{ background: colorForPlayerIndex(i) }} />
						<span className="remote-players__name">
							{p.isHost && "👑 "}
							{p.name}
							{p.id === myPlayerId && " (you)"}
						</span>
						{p.away && <span className="remote-badge remote-badge--away">Away</span>}
						{!p.isHost && <span className={`remote-badge ${p.ready ? "remote-badge--ready" : "remote-badge--not-ready"}`}>{p.ready ? "Ready" : "Not ready"}</span>}
						{isHost && !p.isHost && (
							<button type="button" className="remote-remove-button" onClick={() => onRemovePlayer(p.id)} aria-label={`Remove ${p.name}`}>
								×
							</button>
						)}
					</li>
				))}
			</ul>

			{isHost ? (
				<div className="remote-host-controls">
					{isHonour ? (
						// No question count -- the grid is the game; the competition
						// is the one choice.
						<label className="remote-field">
							Competition
							<select value={competitionId ?? ""} onChange={(e) => setCompetitionId(e.target.value)} disabled={competitions.length === 0}>
								{competitions.length === 0 && <option value="">Loading…</option>}
								{competitions.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name} · {c.seasonCount} seasons
									</option>
								))}
							</select>
						</label>
					) : (
						<label className="remote-field">
							Number of questions
							<input
								type="number"
								min={MIN_QUESTION_COUNT}
								max={MAX_QUESTION_COUNT}
								value={questionCount}
								onChange={(e) => setQuestionCount(Number(e.target.value))}
							/>
						</label>
					)}
					<button
						type="button"
						className="remote-primary-button"
						disabled={isHonour && !competitionId}
						onClick={() => onStart(questionCount, isHonour ? (competitionId ?? undefined) : undefined)}
					>
						Start game
					</button>
				</div>
			) : (
				<button
					type="button"
					className={me?.ready ? "remote-ready-toggle remote-ready-toggle--active" : "remote-ready-toggle"}
					onClick={() => onSetReady(!me?.ready)}
				>
					{me?.ready ? "Not ready" : "I'm ready"}
				</button>
			)}

			<button type="button" className="remote-leave-button" onClick={onLeave}>
				Leave game
			</button>
		</div>
	);
}

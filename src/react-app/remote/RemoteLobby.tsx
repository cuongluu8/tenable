import { useState } from "react";
import { colorForPlayerIndex } from "../components/playerColors";
import type { SessionState } from "./remoteApi";

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
	onStart: (questionCount: number) => void;
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

	return (
		<div className="screen">
			<h2>Waiting room</h2>

			<div className="remote-code-display">
				<span className="remote-code-display__label">Session code</span>
				<span className="remote-code-display__value">{sessionCode}</span>
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
					<button type="button" className="remote-primary-button" onClick={() => onStart(questionCount)}>
						Start game
					</button>
				</div>
			) : (
				<button type="button" className="remote-primary-button" onClick={() => onSetReady(!me?.ready)}>
					{me?.ready ? "Not ready" : "I'm ready"}
				</button>
			)}

			<button type="button" className="back-link" onClick={onLeave}>
				Leave session
			</button>
		</div>
	);
}

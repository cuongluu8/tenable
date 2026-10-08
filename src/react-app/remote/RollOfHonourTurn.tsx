import { useState } from "react";
import { GuessInput } from "../components/GuessInput";
import type { LocalSuggestEntry } from "../components/localSuggest";
import type { HonourTile, HonourTurn, SessionState } from "./remoteApi";

interface Props {
	turn: HonourTurn;
	// The season in play, as the grid has it -- carries the winner once
	// the tile is on its reveal.
	tile: HonourTile | undefined;
	players: SessionState["players"];
	myPlayerId: string;
	// False once this player has given up on the game.
	canAnswer: boolean;
	now: number;
	busy: boolean;
	clubIndex: LocalSuggestEntry[] | undefined;
	colorFor: (id: string | null) => string | undefined;
	onAnswer: (name: string) => Promise<void>;
}

// Turn mode's one moving part (see remoteGameSession.ts's class doc): the
// season in play, whose turn it is and how long they have, the hints so
// far, and -- only on the device whose turn it is -- the answer box. Sits
// above the grid, which in this mode just shows progress. The parent
// remounts it per turn (key), so the guess box starts empty each time.
export function TurnPanel({ turn, tile, players, myPlayerId, canAnswer, now, busy, clubIndex, colorFor, onAnswer }: Props) {
	const [guess, setGuess] = useState("");
	const player = players.find((p) => p.id === turn.playerId);
	const mine = turn.playerId === myPlayerId;
	const secondsLeft = turn.deadline !== null ? Math.max(0, Math.ceil((turn.deadline - now) / 1000)) : null;
	const answeredBy = players.find((p) => p.id === tile?.answeredBy);

	return (
		<div className={mine && !turn.revealed ? "roh-turn roh-turn--mine" : "roh-turn"} style={{ "--owner-color": colorFor(turn.revealed ? (tile?.answeredBy ?? null) : turn.playerId) } as React.CSSProperties} aria-live="polite">
			<p className="roh-turn__season">{turn.season}</p>
			{turn.revealed ? (
				<p className="roh-turn__who">{tile?.answeredBy ? `✅ ${answeredBy?.id === myPlayerId ? "You" : (answeredBy?.name ?? "Someone")} got it: ${tile.winner}` : `Nobody got it -- it was ${tile?.winner ?? "…"}`}</p>
			) : player ? (
				<p className="roh-turn__who">
					{mine ? "Your turn" : `${player.name}'s turn`}
					{secondsLeft !== null && <span className="roh-answer__timer">{secondsLeft}s</span>}
				</p>
			) : (
				<p className="roh-turn__who">Waiting for someone to come back…</p>
			)}

			{turn.hints.map((hint) => (
				<p key={hint} className="roh-turn__hint">
					{hint}
				</p>
			))}

			{mine && canAnswer && !turn.revealed && (
				<GuessInput
					value={guess}
					onChange={setGuess}
					onPick={(name) => {
						setGuess("");
						void onAnswer(name);
					}}
					disabled={busy}
					suggestUrl="/api/roll-of-honour/suggest"
					localIndex={clubIndex}
					placement="below"
				/>
			)}
		</div>
	);
}

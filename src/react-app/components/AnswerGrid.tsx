import type { Progress, RevealAnswer } from "../types";

interface Props {
	answerCount: number;
	statLabel: string;
	progress: Progress;
	// Present once the round is complete: fills in slots the player missed.
	revealed: RevealAnswer[] | null;
	// Correct guesses made this session, keyed by rank, so we can show the
	// name without re-fetching /reveal until the round actually ends.
	found: Map<number, { name: string; statValue: string }>;
	// Multiplayer only: tints a found slot's border/background with the
	// color of whichever player found it (see MultiplayerPlay.tsx). Single-
	// player never passes this, so a found slot's default green is
	// completely untouched — the tint only ever applies via the separate
	// .answer-slot--player-tinted modifier below, never by changing
	// .answer-slot--found itself.
	foundColorByRank?: Map<number, string>;
}

export function AnswerGrid({ answerCount, statLabel, progress, revealed, found, foundColorByRank }: Props) {
	const revealedByRank = new Map(revealed?.map((a) => [a.rank, a]) ?? []);
	const ranks = Array.from({ length: answerCount }, (_, i) => i + 1);

	return (
		<ol className="answer-grid" aria-label="Top 10 answers">
			{ranks.map((rank) => {
				const isFound = progress.foundRanks.includes(rank);
				const entry = found.get(rank) ?? revealedByRank.get(rank);
				const isMissed = !isFound && revealedByRank.has(rank);
				const playerColor = isFound ? foundColorByRank?.get(rank) : undefined;

				return (
					<li
						key={rank}
						className={
							"answer-slot" +
							(isFound ? " answer-slot--found" : "") +
							(isMissed ? " answer-slot--missed" : "") +
							(playerColor ? " answer-slot--player-tinted" : "")
						}
						style={playerColor ? ({ "--found-color": playerColor } as React.CSSProperties) : undefined}
					>
						<span className="answer-slot__rank">{rank}</span>
						{entry ? (
							<>
								<span className="answer-slot__name">{entry.name}</span>
								<span className="answer-slot__stat">
									{entry.statValue} {statLabel}
								</span>
							</>
						) : (
							<span className="answer-slot__placeholder">?</span>
						)}
					</li>
				);
			})}
		</ol>
	);
}

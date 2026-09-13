import "./teammates.css";

export interface ClueCardHint {
	club: string | null;
	image: string | null; // ready /api/media URL, or null if no badge sourced
	years: string | null; // overlap years, e.g. "2019–2021" / "2021–present"
}

interface Props {
	teammates: string[];
	// Parallel to `teammates`; may be shorter/empty for a row with no
	// hints yet. Fields may also be null when the SERVER is withholding
	// them (remote play) rather than this component -- either way a null
	// simply renders nothing for that piece.
	cardHints: ClueCardHint[];
	showClub: boolean;
	showYears: boolean;
}

// The "I played with..." clue list that fills RoundPlay's `middle` slot
// in Teammate Tell (TeammateSetPlay.tsx), and the same list in remote play
// (remote/RemoteGame.tsx) -- extracted 2026-09-13 so both render the
// exact same cards. Hint 1 (club + badge) and hint 3 (overlap years)
// appear INSIDE each card, right of the name; who decides they're
// revealed (a hint press locally, a 30s server tier remotely) is the
// caller's business.
export function TeammateClueCards({ teammates, cardHints, showClub, showYears }: Props) {
	return (
		<>
			<p className="tm-sub">I played with…</p>
			<ul className="tm-clues">
				{teammates.map((name, i) => {
					const card = cardHints[i];
					const club = showClub && card ? card.club : null;
					const image = showClub && card ? card.image : null;
					const years = showYears && card ? card.years : null;
					return (
						<li key={i} className="tm-clue">
							<span className="tm-clue__name">{name}</span>
							{(club || years) && (
								<span className="tm-clue__meta">
									{club && (
										<>
											{image && <img src={image} alt="" className="tm-clue__badge" />}
											{club}
										</>
									)}
									{years && <span className="tm-clue__years">{years}</span>}
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</>
	);
}

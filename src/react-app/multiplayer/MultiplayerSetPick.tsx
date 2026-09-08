import { useEffect, useState } from "react";

interface SetSummary {
	id: number;
	name: string;
	questionIds: number[];
}

interface SetsResponse {
	sets: SetSummary[];
}

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; sets: SetSummary[] };

interface Props {
	// null means "random round" -- club-badges/round's own original,
	// unchanged behavior. A number is one of the fixed sets from
	// clubBadgeSets.ts, passed straight through to GuessThePlayer as its new
	// setId prop.
	onStart: (setId: number | null) => void;
	// Back to the game-type picker (MultiplayerGameTypePick.tsx), same
	// "one step back" pattern as MultiplayerCategoryPick.tsx's own onBack.
	onBack: () => void;
}

// Third step of multiplayer's club-badges setup, between choosing that game
// type and actually starting GuessThePlayer -- lets the group play one of
// the same fixed, curated Sets single-player's own Sets mode uses (see
// clubBadgeSets.ts) instead of always getting a random 10. Reuses the exact
// same /api/club-badges/sets index ClubBadgeSets.tsx reads (already filtered
// to only the sets with a full 10 questions), but nothing about per-question
// progress, retries, or averages -- multiplayer has no per-device account to
// track that against, and a pass-and-play session was never going to persist
// across visits the way solo's does. This screen's only job is picking WHICH
// ten questions the round uses, not tracking how anyone did in them
// afterward (MultiplayerResult.tsx already shows standings for the round,
// same as it does for a random one).
export function MultiplayerSetPick({ onStart, onBack }: Props) {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	// null is its own real selectable choice ("Random round"), not "nothing
	// picked yet" -- so this can't reuse the empty-string-means-unselected
	// pattern MultiplayerCategoryPick.tsx uses for its category slug.
	// Undefined is what actually means "nothing picked yet" here.
	const [selected, setSelected] = useState<number | null | undefined>(undefined);

	useEffect(() => {
		fetch("/api/club-badges/sets")
			.then((res) => {
				if (!res.ok) throw new Error("Couldn't load sets");
				return res.json() as Promise<SetsResponse>;
			})
			.then((data) => setLoad({ status: "ready", sets: data.sets }))
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, []);

	return (
		<div className="mp-setup">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Choose a round</h2>

			{load.status === "loading" && <p>Loading sets…</p>}
			{load.status === "error" && <p>{load.message}</p>}
			{load.status === "ready" && (
				<div className="cb-sets-list">
					<button
						type="button"
						className={`cb-set-card cb-set-card--pickable${selected === null ? " cb-set-card--selected" : ""}`}
						onClick={() => setSelected(null)}
					>
						<span className="cb-set-card__title">🎲 Random round</span>
						<span className="cb-set-card__progress">A fresh random draw of 10, like before</span>
					</button>
					{load.sets.map((set) => (
						<button
							type="button"
							key={set.id}
							className={`cb-set-card cb-set-card--pickable${selected === set.id ? " cb-set-card--selected" : ""}`}
							onClick={() => setSelected(set.id)}
						>
							<span className="cb-set-card__title">
								Set {set.id}: {set.name}
							</span>
						</button>
					))}
				</div>
			)}

			<button type="button" className="mp-setup__start" onClick={() => selected !== undefined && onStart(selected)} disabled={selected === undefined}>
				Start Game
			</button>
		</div>
	);
}

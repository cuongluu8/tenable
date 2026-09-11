import "../components/clubBadges.css";
import "./teammates.css";
import { ClubBadgesPlay } from "../components/ClubBadgesPlay";
import { SetCompleteScreen } from "../components/SetCompleteScreen";
import { useSetRound } from "../components/useSetRound";
import { getSetResults, recordResult } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

interface CardHint {
	club: string;
	image: string | null; // ready /api/media URL, or null if no badge sourced
	years: string; // overlap years, e.g. "2019–2021" / "2021–present"
}
// The raw shape of one question in GET /api/teammates/round?setId=N.
interface RoundQuestion {
	id: number;
	teammates: string[]; // clue names only -- club/nationality/years are hints
	cardHints: CardHint[]; // hints 1 & 3 -- shown in each clue's card, same order as teammates
	nationality: string | null; // hint 2 -- shown as text below
}
// useSetRound's generic `extra` for this mode -- the clue names + hint
// data the reducer's plain CbQuestion has no room for.
interface Extra {
	clues: string[];
	cardHints: CardHint[];
	nationality: string | null;
}

interface Props {
	setId: number;
	// When given, play ONLY this one question (its teammate_questions.id)
	// regardless of what else in the set is unanswered -- TeammateSets.tsx's
	// per-question "Retry". Omitted for the normal "Play"/"Resume" path.
	onlyQuestionId?: number;
	onExit: () => void;
}

// Plays through a single "Who am I?" Set, one question at a time -- see
// components/useSetRound.ts for the shared design (also driving
// clubBadges/ClubBadgeSetPlay.tsx). This file owns the endpoints, how to
// split a raw round question into a CbQuestion + this mode's own Extra,
// and what fills ClubBadgesPlay's `middle` slot -- the "I played
// with..." clue cards instead of a badge chain -- plus the mode's own
// hint nodes (`extraHints`): hint 1 (club + badge) and hint 3 (overlap
// years) render INSIDE each clue card, so they're null slots that still
// cost 15 each; hint 2 (nationality) is the only one shown as text.
export function TeammateSetPlay({ setId, onlyQuestionId, onExit }: Props) {
	const {
		state,
		submitting,
		loadError,
		queue,
		queueIndex,
		setSize,
		setName,
		completionAverage,
		submitGuess,
		giveUp,
		nextQuestion,
	} = useSetRound<RoundQuestion, Extra>({
		setId,
		onlyQuestionId,
		roundUrl: `/api/teammates/round?setId=${setId}`,
		checkGuessUrl: "/api/teammates/check-guess",
		toQueueItem: (q, originalIndex) => ({
			question: { id: q.id, badges: [], nationality: null, transferDates: [], loanMoves: [] },
			extra: { clues: q.teammates, cardHints: q.cardHints, nationality: q.nationality },
			originalIndex,
		}),
		store: { getSetResults, recordResult },
		onExit,
	});

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

	if (completionAverage !== null) {
		return (
			<SetCompleteScreen
				setId={setId}
				setName={setName}
				average={completionAverage}
				onShare={() => shareSetViaWhatsApp(setId, setName, completionAverage)}
				onExit={onExit}
			/>
		);
	}

	if (!queue || !queue[queueIndex]) {
		return (
			<div className="screen">
				<p>Loading…</p>
			</div>
		);
	}

	const current = queue[queueIndex];
	// The ordered hint nodes for this question. Hints 1 (club + badge) and
	// 3 (overlap years) are `null` -- their content goes INTO the clue
	// cards (the `middle` render prop), not a list underneath, but each
	// null still counts as a hint press (and -15). Only hint 2 (the
	// mystery player's country) renders as text, and it's skipped when the
	// country isn't on record -- so a question is 3 hints normally, 2
	// without a country.
	const hints: React.ReactNode[] = [
		null,
		...(current.extra.nationality ? [`They represent ${current.extra.nationality}`] : []),
		null,
	];

	return (
		<div className="screen">
			{/* Keyed on the question id so React fully remounts between
			    questions -- see ClubBadgeSetPlay.tsx's own comment on why. */}
			<ClubBadgesPlay
				key={current.question.id}
				state={state}
				onGuess={submitGuess}
				onGiveUp={giveUp}
				onNext={nextQuestion}
				submitting={submitting}
				onQuit={onExit}
				progressLabel={`Set ${setId}: ${setName} — Question ${current.originalIndex + 1} of ${setSize}`}
				isLastOverride={queueIndex === queue.length - 1}
				soloBanner="Who am I?"
				extraHints={hints}
				middle={(hintsRevealed) => (
					<>
						<p className="tm-sub">I played with…</p>
						<ul className="tm-clues">
							{current.extra.clues.map((name, i) => {
								const card = current.extra.cardHints[i];
								// Hint 1 -> club + badge in the card; hint 3 (the last
								// hint) -> the overlap years after it.
								const showClub = hintsRevealed >= 1;
								const showYears = hints.length > 0 && hintsRevealed >= hints.length;
								return (
									<li key={i} className="tm-clue">
										<span className="tm-clue__name">{name}</span>
										{card && (showClub || showYears) && (
											<span className="tm-clue__meta">
												{showClub && (
													<>
														{card.image && <img src={card.image} alt="" className="tm-clue__badge" />}
														{card.club}
													</>
												)}
												{showYears && <span className="tm-clue__years">{card.years}</span>}
											</span>
										)}
									</li>
								);
							})}
						</ul>
					</>
				)}
			/>
		</div>
	);
}

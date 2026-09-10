import { useCallback, useEffect, useReducer, useState } from "react";
import "../multiplayer/multiplayer.css";
import "../components/clubBadges.css";
import { ClubBadgesPlay } from "../components/ClubBadgesPlay";
import { ClubBadgesResult } from "../components/ClubBadgesResult";
import { clubBadgesReducer, initialCbState, MAX_WRONG_LIVES, type CbQuestion } from "../components/clubBadgesState";

interface RoundResponse {
	questions: CbQuestion[];
	// Only present when the round was resolved from a fixed set (setId
	// below) -- clubBadges.ts's /round doc. Threaded through to the
	// progress label below so a multiplayer group playing "Set 3: Velvet
	// Wolf" sees which set they're actually on, same as solo's own
	// ClubBadgeSetPlay.tsx does.
	setName?: string;
}

interface CheckGuessResponse {
	result: "correct" | "wrong";
	name: string;
}

interface Props {
	// Roster is already decided by whichever screen got here -- a single
	// "You" entry for the solo Single Player variant, or a real multi-name
	// roster collected by Multiplayer's own roster step. This component
	// owns nothing about how the roster was gathered, only the game itself
	// (round fetching, guessing, scoring) -- see ClubBadgesPlay.tsx/
	// ClubBadgesResult.tsx for how they adapt their display for a
	// single-player roster (no turn-passing, no per-player standings).
	playerNames: string[];
	// When given, plays through this fixed set (see clubBadgeSets.ts)
	// instead of a random 10 -- Multiplayer.tsx's own MultiplayerSetPick.tsx
	// step, threaded straight through to /round?setId=N. Omitted for Single
	// Player's own random-round entry point (App.tsx never passes this;
	// single-player's fixed sets go through ClubBadgeSetPlay.tsx instead,
	// which has its own reasons -- see that file's doc -- for not reusing
	// this component at all). Unlike playerNames, this genuinely never
	// changes across this component's lifetime (Multiplayer.tsx remounts
	// GuessThePlayer fresh via its own gameType/rosterNames gate rather than
	// changing setId under an existing instance), so "Play again" replaying
	// the SAME set rather than falling back to random is simply what
	// re-running startRound below against an unchanged prop already does,
	// no extra logic needed.
	setId?: number;
	// Leaves the game entirely, back to whichever screen chose to start it
	// (SinglePlayerHome or Multiplayer's game-type picker) -- distinct from
	// "Play again" below, which stays in the game with a fresh round.
	onExit: () => void;
}

// The actual "guess the player from their clubs" engine, reusable from
// both Single Player (one name, no pass-and-play) and Multiplayer (a real
// roster) -- see App.tsx and Multiplayer.tsx for the two entry points. Same
// round-fetch-then-grade-guesses shape the previous single-entry-point
// version had, just without owning its own roster-collection step anymore.
export function GuessThePlayer({ playerNames, setId, onExit }: Props) {
	const [state, dispatch] = useReducer(clubBadgesReducer, initialCbState);
	const [submitting, setSubmitting] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	// "Crimson Falcon" etc, only ever set when setId is given -- see
	// RoundResponse's own doc on why this rides along on /round rather than
	// a separate /sets lookup.
	const [setName, setSetName] = useState<string | null>(null);

	const startRound = useCallback(async () => {
		setLoadError(null);
		try {
			// Dev/test-only: opening this screen with ?playerId=547 in the page
			// URL forces the round to just that player's question instead of a
			// random 10 -- see clubBadges.ts's /round comment. Nothing about
			// normal play reads or sets this; it only exists to reach a specific
			// layout case (a loan sequence, say) directly instead of clicking
			// "give up" through questions hoping to land on it. Takes priority
			// over setId below since the two are never actually combined in
			// practice -- this is a debug-only override, setId a real user
			// choice -- but if they ever were, landing on one specific player's
			// question is the more useful thing to actually get.
			const playerId = new URLSearchParams(window.location.search).get("playerId");
			const url = playerId
				? `/api/club-badges/round?playerId=${encodeURIComponent(playerId)}`
				: setId
					? `/api/club-badges/round?setId=${setId}`
					: "/api/club-badges/round";
			const res = await fetch(url);
			const data = (await res.json()) as RoundResponse | { error: string };
			if (!res.ok || "error" in data || data.questions.length === 0) {
				setLoadError("Couldn't load a round right now — try again in a moment.");
				return;
			}
			setSetName(data.setName ?? null);
			dispatch({ type: "start", playerNames, questions: data.questions });
		} catch {
			setLoadError("Couldn't load a round right now — try again in a moment.");
		}
		// playerNames is a fresh array from the caller on every render in
		// practice (built from user input), but its actual contents only
		// change when a genuinely new roster is chosen -- re-running this on
		// referential changes alone would just re-fetch on unrelated
		// re-renders, so it's intentionally left out of the dependency list;
		// this effect's own mount-once trigger below is what actually starts
		// the round. setId is likewise omitted -- see this component's own
		// prop doc on why it never actually changes under a live instance.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		startRound();
	}, [startRound]);

	// Shared by submitGuess and giveUp below -- the server call is identical
	// either way (giveUp just skips the matching entirely and always grades
	// wrong -- see clubBadges.ts) -- but what happens to the result differs:
	// a wrong guess with a life still left on the current player's current
	// attempt doesn't end their turn at all (see the "wrongAttempt" branch
	// below, dispatched for solo AND multiplayer since 2026-09-08 -- fixing
	// a real bug where multiplayer only ever got one guess), everything
	// else does.
	// `points` is whatever ClubBadgesPlay.tsx's computeScore(elapsedSeconds,
	// hintsUsed) read at the moment the guess/give-up button was actually
	// pressed -- not recomputed here after the fetch resolves, so the
	// score reflects how long the player took to answer, not how long the
	// network took to grade it.
	async function checkQuestion(body: { guess: string } | { giveUp: true }, points: number) {
		const question = state.questions[state.questionIndex];
		if (!question || submitting) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/club-badges/check-guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionId: question.id, ...body }),
			});
			const data = (await res.json()) as CheckGuessResponse | { error: string };
			if (!res.ok || "error" in data) return;

			const gaveUp = !("guess" in body);
			// A give-up is a deliberate "stop trying this one" -- it always
			// ends the current player's turn, lives or not, unlike an actual
			// wrong guess (which only ends it once their lives run out).
			// wrongCount+1 here mirrors what the reducer is about to do to it
			// (see "wrongAttempt"/"guessResult" in state.ts) so this can decide
			// which of the two to dispatch *before* that update lands. Applies
			// equally to solo and multiplayer since 2026-09-08 -- multiplayer
			// used to have no retry at all (every wrong guess ended the
			// question and revealed the answer after a single attempt), a real
			// reported bug, not an intentional design difference from solo.
			const retryable = !gaveUp && data.result === "wrong" && state.wrongCount + 1 < MAX_WRONG_LIVES;

			if (retryable) {
				dispatch({ type: "wrongAttempt", guess: "guess" in body ? body.guess : "" });
				return;
			}

			dispatch({
				type: "guessResult",
				guess: "guess" in body ? body.guess : "(gave up)",
				outcome: data.result,
				gaveUp,
				correctName: data.name,
				points,
			});
		} catch {
			// Network error mid-question: nothing to apply, player just tries again.
		} finally {
			setSubmitting(false);
		}
	}

	function submitGuess(guess: string, points: number) {
		return checkQuestion({ guess }, points);
	}

	function giveUp(points: number) {
		return checkQuestion({ giveUp: true }, points);
	}

	function nextQuestion() {
		dispatch({ type: "next" });
	}

	function playAgain() {
		dispatch({ type: "reset" });
		startRound();
	}

	return (
		<div className="screen">
			{state.phase === "setup" &&
				(loadError ? (
					<>
						<button type="button" className="back-link" onClick={onExit}>
							← Back
						</button>
						<p className="mp-setup__error">{loadError}</p>
						<button type="button" onClick={startRound}>
							Try again
						</button>
					</>
				) : (
					<p>Loading a round…</p>
				))}
			{state.phase === "playing" && (
				<ClubBadgesPlay
					state={state}
					onGuess={submitGuess}
					onGiveUp={giveUp}
					onNext={nextQuestion}
					submitting={submitting}
					onQuit={onExit}
					progressLabel={
						setId && setName
							? `Set ${setId}: ${setName} — Question ${state.questionIndex + 1} of ${state.questions.length}`
							: undefined
					}
				/>
			)}
			{state.phase === "finished" && <ClubBadgesResult state={state} onPlayAgain={playAgain} onExit={onExit} />}
		</div>
	);
}

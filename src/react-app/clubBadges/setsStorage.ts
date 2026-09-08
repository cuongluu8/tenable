// Persistence for club-badges "Sets" mode (single player only) --
// entirely client-side, same "no server session" philosophy as the rest
// of this game (see state.ts's own module doc): a set's progress is
// meaningful to one browser/device, not something worth a server round
// trip or an account system to track.
//
// Keyed by (setId, questionId) rather than (setId, position) on purpose:
// club_badge_questions.id is what the server already hands back per
// question (see clubBadges.ts's /round and /sets), and staying keyed to
// the actual row means a stored result keeps pointing at the same real
// question even if CLUB_BADGE_SETS's own array ever gets reordered --
// keying by plain array position would silently attach an old result to
// whatever question happens to occupy that slot after such a change.
const STORAGE_KEY = "tenable:club-badges:sets:v1";

export interface SetQuestionResult {
	outcome: "correct" | "wrong";
	// The score to count toward this SET's average -- 0 for any non-
	// correct outcome (a wrong guess/give-up's own computeScore value is
	// about pacing, not achievement; averaging that in as if it were a
	// real score would reward, say, a fast wrong guess over a slow
	// correct one). Only ever a real, positive-or-negative computeScore
	// value when outcome is "correct" -- same non-guessed convention
	// CbResult.points already uses elsewhere in this game.
	points: number;
}

type SetsStorageShape = Record<number, Record<number, SetQuestionResult>>;

function readAll(): SetsStorageShape {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SetsStorageShape) : {};
	} catch {
		// Malformed JSON (shouldn't happen -- nothing but this module ever
		// writes this key) or storage unavailable (private browsing, quota) --
		// either way, treat it as "no progress yet" rather than crashing the
		// Sets page. writeAll below has the same fallback for the same reasons.
		return {};
	}
}

function writeAll(data: SetsStorageShape): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Progress just won't persist across reloads -- not worth surfacing
		// as an error to the player over a game's local high-score tracking.
	}
}

export function getSetResults(setId: number): Record<number, SetQuestionResult> {
	return readAll()[setId] ?? {};
}

export function recordResult(setId: number, questionId: number, result: SetQuestionResult): void {
	const all = readAll();
	all[setId] = { ...all[setId], [questionId]: result };
	writeAll(all);
}

// Clears one question's result within a set -- "retry this one" (see
// ClubBadgeSets.tsx) works by deleting the stored result and re-playing
// that single question; there's no separate "resettable" flag to track,
// an absent entry already means "not yet answered" everywhere this is
// read.
export function resetQuestion(setId: number, questionId: number): void {
	const all = readAll();
	if (!all[setId]) return;
	const remaining = { ...all[setId] };
	delete remaining[questionId];
	all[setId] = remaining;
	writeAll(all);
}

export function resetSet(setId: number): void {
	const all = readAll();
	delete all[setId];
	writeAll(all);
}

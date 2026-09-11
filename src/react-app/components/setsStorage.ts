// Per-set progress persistence for any "Sets" mode (club-badges' "Guess
// the Player -- Sets", teammates' "Who am I? -- Sets"). Entirely
// client-side, same "no server session" philosophy as the rest of this
// game (see clubBadgesState.ts's module doc): a set's progress is
// meaningful to one browser/device, not worth a server round trip or an
// account system.
//
// Keyed by (setId, questionId) rather than (setId, position) on purpose:
// the question row id is what the server already hands back per question
// (see each mode's /round and /sets), and staying keyed to the actual
// row means a stored result keeps pointing at the same real question
// even if the SETS array ever gets reordered -- keying by plain array
// position would silently attach an old result to whatever question
// happens to occupy that slot after such a change.
//
// One store per mode, created via createSetsStore(key) in that mode's
// own thin setsStorage.ts wrapper -- the storage key is the only thing
// that differs, and giving each mode its own key keeps their progress
// from ever colliding.

export interface SetQuestionResult {
	outcome: "correct" | "wrong";
	// The score to count toward this SET's average -- 0 for any non-
	// correct outcome (a wrong guess/give-up's own computeScore value is
	// about pacing, not achievement; averaging that in as if it were a
	// real score would reward, say, a fast wrong guess over a slow
	// correct one). Only ever a real, positive-or-negative computeScore
	// value when outcome is "correct" -- same non-guessed convention
	// RoundResult.points already uses elsewhere in this game.
	points: number;
}

export interface SetsStore {
	getSetResults(setId: number): Record<number, SetQuestionResult>;
	recordResult(setId: number, questionId: number, result: SetQuestionResult): void;
	// Clears one question's result within a set -- "retry this one" works
	// by deleting the stored result and re-playing that single question;
	// there's no separate "resettable" flag, an absent entry already means
	// "not yet answered" everywhere this is read.
	resetQuestion(setId: number, questionId: number): void;
	resetSet(setId: number): void;
}

type SetsStorageShape = Record<number, Record<number, SetQuestionResult>>;

export function createSetsStore(storageKey: string): SetsStore {
	function readAll(): SetsStorageShape {
		try {
			const raw = localStorage.getItem(storageKey);
			return raw ? (JSON.parse(raw) as SetsStorageShape) : {};
		} catch {
			// Malformed JSON (shouldn't happen -- nothing but this module
			// ever writes this key) or storage unavailable (private
			// browsing, quota) -- either way, treat it as "no progress yet"
			// rather than crashing the Sets page. writeAll has the same
			// fallback for the same reasons.
			return {};
		}
	}

	function writeAll(data: SetsStorageShape): void {
		try {
			localStorage.setItem(storageKey, JSON.stringify(data));
		} catch {
			// Progress just won't persist across reloads -- not worth
			// surfacing as an error over a game's local high-score tracking.
		}
	}

	return {
		getSetResults(setId) {
			return readAll()[setId] ?? {};
		},
		recordResult(setId, questionId, result) {
			const all = readAll();
			all[setId] = { ...all[setId], [questionId]: result };
			writeAll(all);
		},
		resetQuestion(setId, questionId) {
			const all = readAll();
			if (!all[setId]) return;
			const remaining = { ...all[setId] };
			delete remaining[questionId];
			all[setId] = remaining;
			writeAll(all);
		},
		resetSet(setId) {
			const all = readAll();
			delete all[setId];
			writeAll(all);
		},
	};
}

// Persistence for "Who am I?" Sets mode -- a straight sibling of
// clubBadges/setsStorage.ts (see that file's own doc): entirely
// client-side, keyed by (setId, teammate_questions.id) rather than
// (setId, position) so a stored result keeps pointing at the same real
// question even if TEAMMATE_SETS ever gets reordered. Its own storage
// key so the two modes' progress never collide.
const STORAGE_KEY = "tenable:teammates:sets:v1";

export interface SetQuestionResult {
	outcome: "correct" | "wrong";
	// Score to count toward this SET's average -- 0 for any non-correct
	// outcome, a real computeScore value only when correct, same
	// convention as clubBadges/setsStorage.ts.
	points: number;
}

type SetsStorageShape = Record<number, Record<number, SetQuestionResult>>;

function readAll(): SetsStorageShape {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SetsStorageShape) : {};
	} catch {
		// Malformed JSON or storage unavailable (private browsing, quota) --
		// treat as "no progress yet" rather than crashing the picker.
		return {};
	}
}

function writeAll(data: SetsStorageShape): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Progress just won't persist -- not worth surfacing over local
		// high-score tracking.
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

// Clears one question's result within a set -- "retry this one" works by
// deleting the stored result and re-playing that single question; an
// absent entry already means "not yet answered" everywhere this is read.
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

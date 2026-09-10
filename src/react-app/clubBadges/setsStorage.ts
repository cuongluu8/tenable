// club-badges "Guess the Player -- Sets" progress. Thin wrapper around
// the shared store (components/setsStorage.ts) -- this file owns nothing
// but the storage key. Keyed by club_badge_questions.id (see
// clubBadges.ts's /round and /sets).
import { createSetsStore } from "../components/setsStorage";

export type { SetQuestionResult } from "../components/setsStorage";

export const { getSetResults, recordResult, resetQuestion, resetSet } = createSetsStore(
	"tenable:club-badges:sets:v1",
);

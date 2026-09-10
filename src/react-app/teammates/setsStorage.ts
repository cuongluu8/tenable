// "Who am I? -- Sets" progress. Thin wrapper around the shared store
// (components/setsStorage.ts) -- this file owns nothing but the storage
// key. Keyed by teammate_questions.id (see teammates.ts's /round and
// /sets). Its own key so club-badges' and this mode's progress never
// collide.
import { createSetsStore } from "../components/setsStorage";

export type { SetQuestionResult } from "../components/setsStorage";

export const { getSetResults, recordResult, resetQuestion, resetSet } = createSetsStore(
	"tenable:teammates:sets:v1",
);

import { Hono } from "hono";
import { normalize, toFtsPrefixQuery } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/rateLimits";
import { CLUB_BADGE_SETS, CLUB_BADGE_SET_NAMES } from "../lib/clubBadgeSets";
import { buildSetsIndex, resolveSetQuestions } from "../lib/setsIndex";
import { checkPlayerGuess } from "../lib/checkPlayerGuess";
import { buildClubBadgeQuestions, pickRandomEligibleQuestions, type QuestionRow } from "../lib/clubBadgeRound";

const clubBadges = new Hono<{ Bindings: Env }>();

// A full round's size -- doubles as Sets mode's own "is this set actually
// complete" threshold below (/sets), since both concepts mean the same
// thing: ten questions, not nine or eleven.
const QUESTIONS_PER_ROUND = 10;

// "Guess the player from the clubs they played for" -- same stateless,
// client-holds-the-round philosophy as multiplayer.ts: no session to
// persist, no device id, the server's only job is (1) hand out a random
// round's worth of question shells with nothing that gives the answer away,
// and (2) grade a guess against the one question it names. See
// db/schema.sql's club_badge_questions comment for why this is a curated
// pool sampled at play time rather than a daily-locked "today's 10" the way
// categories work.
clubBadges.get("/round", async (c) => {
	const { results: questions } = await c.env.DB
		.prepare("SELECT id, player_id, club_sequence FROM club_badge_questions")
		.all<QuestionRow>();

	// Dev/test-only override -- the real client never sends this (see
	// GuessThePlayer.tsx, which only appends it when the *page* was opened
	// with ?playerId=... in the first place), so normal play is exactly as
	// random as ever. Forces the round to just that one player's question
	// instead of a random 10, so a specific layout case (a loan sequence,
	// say) can be reached directly instead of clicking "give up" through
	// questions hoping to land on it. Bypasses MIN_CLUBS_FOR_QUESTION on
	// purpose -- wanting to look at a short/edge-case sequence is exactly
	// when this gets used.
	const rawPlayerId = c.req.query("playerId");
	const debugPlayerId = rawPlayerId ? Number(rawPlayerId) : NaN;
	// Sets mode (single player, ClubBadgeSets.tsx/ClubBadgeSetPlay.tsx) --
	// a real feature, not a debug override: hands back exactly one curated
	// set's players (see clubBadgeSets.ts), in that FIXED order rather than
	// shuffled, so "Set 3" means the same ten questions every time a player
	// opens it, not a fresh random draw. 1-indexed to match the "Set 1"/
	// "Set 2" labels shown in the UI.
	const rawSetId = c.req.query("setId");
	const setIndex = rawSetId ? Number(rawSetId) - 1 : NaN;
	const set = Number.isInteger(setIndex) ? CLUB_BADGE_SETS[setIndex] : undefined;
	let picked: QuestionRow[];
	if (set) {
		picked = resolveSetQuestions(questions ?? [], set);
	} else if (Number.isInteger(debugPlayerId)) {
		picked = (questions ?? []).filter((q) => q.player_id === debugPlayerId);
	} else {
		// See pickRandomEligibleQuestions's own doc (clubBadgeRound.ts) for
		// the MIN_CLUBS_FOR_QUESTION filter + Fisher-Yates sampling this does
		// -- shared with RemoteGameSession's own question selection.
		picked = pickRandomEligibleQuestions(questions ?? [], QUESTIONS_PER_ROUND);
	}

	if (picked.length === 0) {
		return c.json({ questions: [] });
	}

	const builtQuestions = await buildClubBadgeQuestions(c.env.DB, picked);
	return c.json({
		// Only present for a Sets-mode request -- ClubBadgeSetPlay.tsx's own
		// display name for this round, fetched here rather than via a
		// separate /sets lookup since this response already has to resolve
		// setId to the same CLUB_BADGE_SETS entry anyway.
		setName: set ? CLUB_BADGE_SET_NAMES[setIndex] : undefined,
		questions: builtQuestions,
	});
});

// Sets mode's own index -- ClubBadgeSets.tsx (the set-picker page) calls
// this once to learn how many sets exist and which club_badge_questions.
// id belongs to each slot, so it can compute "7/10 done" and a completed
// set's average score purely from localStorage (setsStorage.ts) without
// a network round-trip per set. questionIds only -- never a player id or
// name -- same non-spoiler reasoning as CbQuestion.id itself: which
// opaque row a slot maps to isn't the answer, and Sets mode's whole
// pitch (a stable "Set 3" you can return to) requires the client to know
// that mapping up front anyway.
//
// Only ever returns sets that resolve to exactly 10 questions -- per
// explicit instruction, 2026-09-08: CLUB_BADGE_SETS' last entry is only
// 6 (96 eligible players doesn't divide evenly by 10, see that file's
// own doc), and a short set shouldn't show up in the picker at all
// rather than display as an odd "0/6 answered" card. Checked against
// the ACTUAL resolved count (after the questionIdByPlayerId lookup
// below), not just CLUB_BADGE_SETS[i].length, so a future set that
// drops below 10 for some other reason (a referenced player's
// club_badge_questions row deleted, say) gets hidden the same way
// without needing a second, separate check for that case. The route a
// set's own play view uses (/round?setId=N above) is unaffected --
// this only controls what the LIST shows, not whether a set can still
// be played directly if something already links to it.
clubBadges.get("/sets", async (c) => {
	// A plain, unfiltered SELECT rather than `WHERE player_id IN (...)` --
	// deliberately, not just for simplicity: with 30 sets (2026-09-09)
	// CLUB_BADGE_SETS.flat() is 293 distinct ids, and binding that many
	// placeholders in one query hit D1's own bind-parameter ceiling ("too
	// many SQL variables"), a real 500 in production confirmed while
	// testing this exact change locally. club_badge_questions is small and
	// only grows via manual curation (349 rows as of this fix, nowhere
	// near entities' own scale) -- see /round's own unfiltered SELECT
	// above for the same reasoning already applied there -- so filtering
	// in JS after fetching everything is both simpler and immune to this
	// limit regardless of how many sets get added later.
	const { results } = await c.env.DB
		.prepare(`SELECT id, player_id FROM club_badge_questions`)
		.all<{ id: number; player_id: number }>();

	const sets = buildSetsIndex(results ?? [], CLUB_BADGE_SETS, CLUB_BADGE_SET_NAMES, QUESTIONS_PER_ROUND);

	return c.json({ sets });
});

interface CheckGuessBody {
	questionId?: number;
	guess?: string;
	// Give-up: skips the guess requirement/matching below entirely and
	// always grades as wrong -- still returns the real answer, same as any
	// other wrong guess (see the shared response comment below), just
	// without needing a guess string to compare against nothing.
	giveUp?: boolean;
}

clubBadges.post("/check-guess", async (c) => {
	const body = await c.req.json<CheckGuessBody>().catch(() => ({}) as CheckGuessBody);

	const questionId = body.questionId;
	if (typeof questionId !== "number" || !Number.isInteger(questionId)) {
		return c.json({ error: "Missing question id" }, 400);
	}
	const givingUp = body.giveUp === true;
	const rawGuess = (body.guess ?? "").trim();
	if (!givingUp && !rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const result = await checkPlayerGuess(
		c.env.DB,
		"club_badge_questions",
		questionId,
		givingUp ? { giveUp: true } : { guess: rawGuess },
	);
	if (!result) {
		return c.json({ error: "Unknown question" }, 404);
	}

	// The correct name is revealed either way ("results shown after each
	// question" applies to a wrong guess too, same as a normal quiz reveal)
	// -- only the `result` field tells the client whether to count it as a
	// point. The club sequence itself isn't repeated here -- the player
	// already saw it, badge by badge, while answering (RoundPlay.tsx).
	return c.json(result);
});

// Typeahead scoped to players, for the guess box -- reuses the same
// suggestNames() the category-based /api/suggest route does, just without
// needing a fake categories row to hang entityType/scope off of (this game
// has no categories row at all).
clubBadges.get("/suggest", enforceSuggestRateLimit, async (c) => {
	const raw = c.req.query("q") ?? "";
	const prefix = normalize(raw.slice(0, 60));
	if (prefix.length < 3 || !toFtsPrefixQuery(prefix)) {
		return c.json({ suggestions: [], truncated: false });
	}

	const { names, truncated } = await suggestNames(c.env.DB, prefix, "player", 20, null);
	return c.json({ suggestions: names, truncated });
});

export default clubBadges;

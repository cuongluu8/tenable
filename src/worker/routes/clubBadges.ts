import { Hono } from "hono";
import { normalize, collapseToAlnum, toFtsPrefixQuery } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/suggestRateLimit";
import { CLUB_BADGE_SETS, CLUB_BADGE_SET_NAMES } from "../lib/clubBadgeSets";

const clubBadges = new Hono<{ Bindings: Env }>();

// A full round's size -- doubles as Sets mode's own "is this set actually
// complete" threshold below (/sets), since both concepts mean the same
// thing: ten questions, not nine or eleven.
const QUESTIONS_PER_ROUND = 10;
// A 2-club sequence ("played for A, then B") reads as barely a career --
// this keeps the pool to players with a real path to trace. 92 of the 107
// questions clear this bar as of 2026-09-06, comfortably more than one
// round's worth.
const MIN_CLUBS_FOR_QUESTION = 3;

interface QuestionRow {
	id: number;
	player_id: number;
	club_sequence: string; // JSON array of club entity ids
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// transfers.transfer_date is a plain "YYYY-MM-DD" string -- parsed by hand
// rather than `new Date(...)` specifically to avoid that constructor
// treating a date-only string as UTC midnight and then a Workers-runtime
// locale/timezone formatting it back to the previous day's month.
function formatMonthYear(isoDate: string): string | null {
	const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(isoDate);
	if (!match) return null;
	const monthName = MONTH_NAMES[Number(match[2]) - 1];
	return monthName ? `${monthName} ${match[1]}` : null;
}

// player_career_stats.years_display is free text as sourced ("2009–2012",
// "1984", "2024–" for a still-active stint, ...) -- see db/schema.sql's own
// comment on why this was never normalized. Every format actually in use
// leads with a 4-digit year, so pulling that (and nothing more ambitious)
// is the only part reliable enough to build a hint on.
function leadingYear(yearsDisplay: string): number | null {
	const match = /^(\d{4})/.exec(yearsDisplay);
	return match ? Number(match[1]) : null;
}

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
		const byPlayerId = new Map((questions ?? []).map((q) => [q.player_id, q]));
		// .filter(Boolean) rather than assuming every id resolves -- a set
		// referencing a player whose club_badge_questions row got deleted
		// out from under it should just quietly shrink that set by one
		// question, not 500 the whole page.
		picked = set.map((playerId) => byPlayerId.get(playerId)).filter((q): q is QuestionRow => q !== undefined);
	} else if (Number.isInteger(debugPlayerId)) {
		picked = (questions ?? []).filter((q) => q.player_id === debugPlayerId);
	} else {
		const eligible = (questions ?? []).filter((q) => (JSON.parse(q.club_sequence) as number[]).length >= MIN_CLUBS_FOR_QUESTION);
		// Fisher-Yates, take the first N -- fine at this scale (~107 rows) and
		// avoids ORDER BY RANDOM() in SQL.
		const shuffled = [...eligible];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		picked = shuffled.slice(0, QUESTIONS_PER_ROUND);
	}

	if (picked.length === 0) {
		return c.json({ questions: [] });
	}

	// Every question is eligible regardless of badge coverage -- a club with
	// no image_key (not sourced yet, or a stale URL that 404s at render
	// time) degrades to a text placeholder client-side (see
	// ClubBadgesPlay.tsx) rather than the question being excluded outright.
	// club names are sent alongside each badge on purpose: they're not the
	// answer (the player is), so showing one as text when its image is
	// missing gives away nothing a working badge wouldn't have anyway.
	const allClubIds = [...new Set(picked.flatMap((q): number[] => JSON.parse(q.club_sequence)))];
	const clubPlaceholders = allClubIds.map(() => "?").join(",");
	const playerIds = [...new Set(picked.map((q) => q.player_id))];
	const playerPlaceholders = playerIds.map(() => "?").join(",");
	const [{ results: clubRows }, { results: playerRows }, { results: transferRows }, { results: pcsRows }] = await Promise.all([
		c.env.DB
			.prepare(`SELECT id, canonical_name, image_key, scope FROM entities WHERE id IN (${clubPlaceholders})`)
			.bind(...allClubIds)
			.all<{ id: number; canonical_name: string; image_key: string | null; scope: string | null }>(),
		c.env.DB
			.prepare(`SELECT id, scope FROM entities WHERE id IN (${playerPlaceholders})`)
			.bind(...playerIds)
			.all<{ id: number; scope: string | null }>(),
		// Third hint: when a transfer happened. Real month+day precision only
		// exists for players sourced via `transfers` (db/schema.sql) -- fetch
		// every transfers row for these players and match by (player, from,
		// to) client-side below rather than building a per-pair IN clause.
		c.env.DB
			.prepare(
				`SELECT player_id, from_club_id, to_club_id, transfer_date, transfer_type FROM transfers WHERE player_id IN (${playerPlaceholders})`,
			)
			.bind(...playerIds)
			.all<{ player_id: number; from_club_id: number | null; to_club_id: number | null; transfer_date: string; transfer_type: string }>(),
		// Fallback for every player not covered above: a year-only estimate
		// from player_career_stats.years_display (see leadingYear's comment).
		// team_name_raw is fetched too -- see yearQueueByClub's own comment on
		// why this is no longer the loan-blind source transferDatesFor's doc
		// used to describe it as.
		c.env.DB
			.prepare(
				`SELECT player_id, team_id, years_display, team_name_raw FROM player_career_stats WHERE player_id IN (${playerPlaceholders}) AND competition_type = 'club' AND team_id IS NOT NULL AND years_display IS NOT NULL`,
			)
			.bind(...playerIds)
			.all<{ player_id: number; team_id: number; years_display: string; team_name_raw: string }>(),
	]);
	const clubById = new Map((clubRows ?? []).map((r) => [r.id, r]));
	const playerScopeById = new Map((playerRows ?? []).map((r) => [r.id, r.scope]));

	// One entry per transfer (badges[i-1] -> badges[i]): `date` is a
	// formatted "Mon YYYY" when an exact transfer_date is on record, a
	// "~YYYY" estimate from a coarser year-only source when it isn't, or
	// null when neither has anything usable for that step -- same
	// graceful-skip the nationality hint already uses for missing data,
	// just per-transfer instead of per-question. `loan` is true when this
	// exact step is a transfers row with transfer_type='loan', OR (fixed
	// 2026-09-08 -- confirmed live, John Terry's real 2000 loan to
	// Nottingham Forest was showing as a plain permanent move) the
	// player_career_stats row for the destination club has a
	// "→ <Club> (loan)" team_name_raw -- see yearQueueByClub's own doc.
	// This file used to claim player_career_stats had no per-move
	// classification at all to draw a loan flag from; that was wrong --
	// the sourcing convention already writes it as literal text in that
	// exact, consistent format (confirmed against all 60 rows carrying it
	// in production before relying on it here), it just wasn't being read.
	//
	// club_sequence can now repeat a club (a genuine return, most often
	// after a loan -- see db/schema.sql's comment on club_sequence), so a
	// club id showing up twice in one player's clubIds no longer means
	// "match whichever row/transfer has this club, there's only one".
	// Both branches below instead consume their source rows in chronological
	// order, once each, so the Nth time a club is arrived at picks the Nth
	// matching row rather than always the same (usually earliest) one.
	function transferDatesFor(playerId: number, clubIds: number[]): { date: string | null; loan: boolean }[] {
		// Exact-date branch: transfers rows for this player, oldest first --
		// the same order build_club_badge_questions.py's from_transfers()
		// chained them in, so walking both in lockstep lines a chain step up
		// with the one transfer row that produced it. A step this doesn't
		// advance past (fromClubId/toClubId don't match the next unconsumed
		// row) is a synthetic "returned to parent" step build_club_badge_
		// questions.py inferred from a date range rather than a dedicated
		// transfer row -- there's no exact date for those, so it falls
		// through to the estimate below (rarely anything, for a
		// transfers-sourced player -- see build_club_badge_questions.py).
		// A row with a null from/to club (an early move whose other end
		// wasn't resolved to an entity -- e.g. Salah's first pro move, "Basel
		// not found in local club pool") can never match a real club_sequence
		// transition, since neither side is ever actually null there. Left
		// in, it sits at transferPtr's starting position and never gets
		// consumed (no fromClubId/toClubId comparison against null ever
		// succeeds) -- permanently blocking every real match after it, not
		// just skipping the one row itself. Confirmed the hard way,
		// 2026-09-08: this silently marked Salah's real Chelsea -> Fiorentina
		// loan (and every transfer after it) as non-loans, because his
		// unresolved 2012 Basel-era row was sitting first in line. Dropping
		// unmatchable rows before the walk starts is what actually fixes
		// this, not just this one player -- anyone with an early unresolved
		// move has the same latent bug.
		const playerTransfers = (transferRows ?? [])
			.filter((t) => t.player_id === playerId && t.from_club_id !== null && t.to_club_id !== null)
			.sort((a, b) => (a.transfer_date < b.transfer_date ? -1 : a.transfer_date > b.transfer_date ? 1 : 0));
		let transferPtr = 0;

		// Estimate branch: player_career_stats rows for this player already
		// come back in source (insertion) order -- group into a same-club
		// queue per team_id so a repeat visit consumes the next stint's own
		// year instead of every visit re-using the first one's.
		//
		// Each queue entry also carries whether ITS OWN row was a loan (its
		// team_name_raw starts "→ " and ends "(loan)" -- confirmed the exact,
		// consistent format across all 60 real rows carrying it before
		// relying on the pattern here, not just eyeballing a few).
		//
		// Two adjacent rows for the SAME club (no other team's row between
		// them) collapse into a single queue entry, keeping the first row's
		// year/loan -- this is exactly the shape build_club_badge_questions.
		// py's collapse_adjacent_duplicates merges into one club_sequence
		// tile too (most often a loan immediately followed by that club's
		// own permanent-conversion row), so the queue and club_sequence
		// stay in 1:1 correspondence for that club: one entry per tile, not
		// one entry per underlying row. Skipping this step doesn't lose
		// data -- the collapsed tile is never queried a second time -- but
		// LEAVING the second row as its own separate entry does real harm:
		// it sits there unconsumed until some much-later, genuinely
		// separate visit to the same club wrongly claims it instead of its
		// own real year. Confirmed live, 2026-09-08: Zlatan Ibrahimović's
		// real 2019 THIRD spell at AC Milan (its own row) was showing 2011
		// -- the leftover second half of his 2010 loan-then-signed spell
		// there, collapsed into one tile years earlier in the same chain.
		const yearQueueByClub = new Map<number, { year: number; loan: boolean }[]>();
		let lastTeamId: number | null = null;
		for (const r of pcsRows ?? []) {
			if (r.player_id !== playerId) continue;
			const year = leadingYear(r.years_display);
			if (year === null) continue;
			if (r.team_id === lastTeamId) continue;
			lastTeamId = r.team_id;
			const loan = /\(loan\)\s*$/.test(r.team_name_raw);
			const queue = yearQueueByClub.get(r.team_id) ?? [];
			queue.push({ year, loan });
			yearQueueByClub.set(r.team_id, queue);
		}

		// Three real bugs, all confirmed live 2026-09-08 by replaying this
		// exact function against every club_badge_questions row, not just
		// caught by a human happening to notice one: this per-club queue
		// only actually reflects reality when every club_sequence position
		// that visits a given club corresponds to exactly one of that
		// club's own real rows, consumed in order. Three shapes break that
		// (the adjacent-duplicate collapse above is the third; the other
		// two follow):
		//
		// 1. clubIds[0]'s own row is never consumed at all -- this function
		//    only ever computes a date for arriving at clubIds[1] onward,
		//    so if that starting club is ever visited again later (a real,
		//    independently-documented return -- e.g. Wayne Rooney: Everton
		//    2002-2004, Man Utd, Everton again 2017-2018, each its own row),
		//    the later visit's `.shift()` wrongly grabs the FIRST club's
		//    own entry (2002) instead of skipping past it to its real one
		//    (2017) -- everything is off by one slot for that club from
		//    then on. Fixed by pre-consuming clubIds[0]'s own slot before
		//    the walk starts, exactly once, since arriving there is never
		//    dated anyway.
		yearQueueByClub.get(clubIds[0])?.shift();
		//
		// 2. A synthetic "returned to parent" step (build_club_badge_
		//    questions.py's insert_loan_returns -- the previous step was a
		//    loan, and this one goes straight back to the exact club that
		//    loan came from) has no backing row of its own, ever -- but
		//    that club's queue can still hold a real, UNRELATED leftover
		//    entry at this point, most often the "quick permanent
		//    conversion" half of a loan-then-signed pair that collapsed
		//    into a single tile earlier in the same chain (e.g. Casemiro:
		//    loaned to Real Madrid in 2013, signed permanently a few months
		//    later the same year, then later loaned OUT to Porto and back
		//    -- that "back" step was showing 2013, the original signing,
		//    not null). Recognized below by shape (previous step was a
		//    loan, this one returns to exactly the club that preceded it)
		//    rather than guessed at, and short-circuited to null before it
		//    ever touches the queue -- not just given the right answer, but
		//    kept from stealing a real entry meant for something else.
		const results: { date: string | null; loan: boolean }[] = [];
		for (let i = 0; i < clubIds.length - 1; i++) {
			const fromClubId = clubIds[i];
			const toClubId = clubIds[i + 1];
			const next = playerTransfers[transferPtr];
			if (next && next.from_club_id === fromClubId && next.to_club_id === toClubId) {
				transferPtr++;
				const loan = next.transfer_type === "loan";
				const formatted = formatMonthYear(next.transfer_date);
				if (formatted) {
					results.push({ date: formatted, loan });
					continue;
				}
				// transfer_date itself failed to format (malformed, in practice
				// never happens against the real data) -- still fall through to
				// the estimate below rather than losing the date hint entirely,
				// but keep the loan classification: that came from this matched
				// row, not from whichever estimate ends up filling the date in.
				const entry = yearQueueByClub.get(toClubId)?.shift();
				results.push({ date: entry === undefined ? null : `~${entry.year}`, loan });
				continue;
			}
			if (i >= 1 && results[i - 1].loan && clubIds[i - 1] === toClubId) {
				results.push({ date: null, loan: false });
				continue;
			}
			const entry = yearQueueByClub.get(toClubId)?.shift();
			results.push({ date: entry === undefined ? null : `~${entry.year}`, loan: entry?.loan ?? false });
		}
		return results;
	}

	return c.json({
		// Only present for a Sets-mode request -- ClubBadgeSetPlay.tsx's own
		// display name for this round, fetched here rather than via a
		// separate /sets lookup since this response already has to resolve
		// setId to the same CLUB_BADGE_SETS entry anyway.
		setName: set ? CLUB_BADGE_SET_NAMES[setIndex] : undefined,
		questions: picked.map((q) => {
			const transfers = transferDatesFor(q.player_id, JSON.parse(q.club_sequence));
			return {
				id: q.id,
				// Deliberately no player_id/name here -- that's the answer.
				// `country` is entities.scope -- always sent (it's not a spoiler,
				// same reasoning as club name), just held back from view
				// client-side until the hint button reveals it (see
				// ClubBadgesPlay.tsx).
				badges: (JSON.parse(q.club_sequence) as number[]).map((clubId) => {
					const club = clubById.get(clubId);
					return {
						name: club?.canonical_name ?? "Unknown club",
						url: club?.image_key ? `/api/media/${club.image_key}` : null,
						country: club?.scope ?? null,
					};
				}),
				// Second hint: the player's nationality. entities.scope for a
				// player entity holds the country they represent internationally
				// (confirmed against real dual-nationality cases -- e.g. Diego
				// Costa, born Brazil, scope is "Spain", who he actually plays for
				// -- not birthplace), which is exactly the first choice the user
				// asked for. There's no separate birth-country field anywhere in
				// the schema to fall back to yet (every player in the actual game
				// pool already has scope set, so this fallback has never actually
				// been needed) -- null here is the "skip the hint" case once a
				// second data source exists and still comes up empty, not
				// currently a real path.
				nationality: playerScopeById.get(q.player_id) ?? null,
				// Third hint: one entry per transfer (badges[i-1] -> badges[i+1's
				// predecessor]), see transferDatesFor's comment on precision/
				// fallback. Always sent alongside the rest -- like club names and
				// country, a transfer date isn't the answer, so nothing here is
				// held back for spoiler reasons, only by whether the hint's been
				// used yet (ClubBadgesPlay.tsx).
				transferDates: transfers.map((t) => t.date),
				// Not itself a hint (never gated behind the hint button, unlike
				// the array above) -- a loan is drawn differently (dashed arrow,
				// see ClubBadgesPlay.tsx) purely so the sequence doesn't read as
				// a normal permanent move when it wasn't one, same non-spoiler
				// reasoning as club names/country: which clubs a player was at
				// isn't the answer, so how they got between them isn't either.
				loanMoves: transfers.map((t) => t.loan),
			};
		}),
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
	const allPlayerIds = [...new Set(CLUB_BADGE_SETS.flat())];
	const { results } = await c.env.DB
		.prepare(`SELECT id, player_id FROM club_badge_questions WHERE player_id IN (${allPlayerIds.map(() => "?").join(",")})`)
		.bind(...allPlayerIds)
		.all<{ id: number; player_id: number }>();
	const questionIdByPlayerId = new Map((results ?? []).map((r) => [r.player_id, r.id]));

	const sets = CLUB_BADGE_SETS.map((playerIds, i) => ({
		id: i + 1,
		name: CLUB_BADGE_SET_NAMES[i],
		// .filter(Boolean) mirrors /round's own "quietly shrink, don't
		// crash" handling of a set referencing a now-missing player.
		questionIds: playerIds.map((playerId) => questionIdByPlayerId.get(playerId)).filter((id): id is number => id !== undefined),
	})).filter((set) => set.questionIds.length === QUESTIONS_PER_ROUND);

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
	if (!Number.isInteger(questionId)) {
		return c.json({ error: "Missing question id" }, 400);
	}
	const givingUp = body.giveUp === true;
	const rawGuess = (body.guess ?? "").trim();
	if (!givingUp && !rawGuess) {
		return c.json({ error: "Missing guess" }, 400);
	}

	const question = await c.env.DB.prepare("SELECT player_id FROM club_badge_questions WHERE id = ?")
		.bind(questionId)
		.first<{ player_id: number }>();
	if (!question) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const [player, aliasRows] = await Promise.all([
		c.env.DB.prepare("SELECT canonical_name FROM entities WHERE id = ?").bind(question.player_id).first<{
			canonical_name: string;
		}>(),
		c.env.DB.prepare("SELECT alias FROM entity_aliases WHERE entity_id = ?").bind(question.player_id).all<{
			alias: string;
		}>(),
	]);

	if (!player) {
		return c.json({ error: "Unknown question" }, 404);
	}

	const collapsedGuess = collapseToAlnum(normalize(rawGuess));
	const matchStrings = [player.canonical_name, ...(aliasRows.results ?? []).map((r) => r.alias)];
	const isCorrect = !givingUp && matchStrings.some((s) => collapseToAlnum(s) === collapsedGuess);

	// The correct name is revealed either way ("results shown after each
	// question" applies to a wrong guess too, same as a normal quiz reveal)
	// -- only the `result` field tells the client whether to count it as a
	// point. The club sequence itself isn't repeated here -- the player
	// already saw it, badge by badge, while answering (ClubBadgesPlay.tsx).
	return c.json({
		result: (isCorrect ? "correct" : "wrong") as "correct" | "wrong",
		name: player.canonical_name,
	});
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

import { Hono } from "hono";
import { normalize, collapseToAlnum, toFtsPrefixQuery } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/suggestRateLimit";

const clubBadges = new Hono<{ Bindings: Env }>();

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
	let picked: QuestionRow[];
	if (Number.isInteger(debugPlayerId)) {
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
		c.env.DB
			.prepare(
				`SELECT player_id, team_id, years_display FROM player_career_stats WHERE player_id IN (${playerPlaceholders}) AND competition_type = 'club' AND team_id IS NOT NULL AND years_display IS NOT NULL`,
			)
			.bind(...playerIds)
			.all<{ player_id: number; team_id: number; years_display: string }>(),
	]);
	const clubById = new Map((clubRows ?? []).map((r) => [r.id, r]));
	const playerScopeById = new Map((playerRows ?? []).map((r) => [r.id, r.scope]));

	// One entry per transfer (badges[i-1] -> badges[i]): `date` is a
	// formatted "Mon YYYY" when an exact transfer_date is on record, a
	// "~YYYY" estimate from a coarser year-only source when it isn't, or
	// null when neither has anything usable for that step -- same
	// graceful-skip the nationality hint already uses for missing data,
	// just per-transfer instead of per-question. `loan` is true only when
	// this exact step is a transfers row with transfer_type='loan' --
	// player_career_stats has no equivalent per-move classification (just
	// stint records), so every step derived from it is always false rather
	// than guessed at (same graceful-degrade as the rest of this file).
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
		const playerTransfers = (transferRows ?? [])
			.filter((t) => t.player_id === playerId)
			.sort((a, b) => (a.transfer_date < b.transfer_date ? -1 : a.transfer_date > b.transfer_date ? 1 : 0));
		let transferPtr = 0;

		// Estimate branch: player_career_stats rows for this player already
		// come back in source (insertion) order -- group into a same-club
		// queue per team_id so a repeat visit consumes the next stint's own
		// year instead of every visit re-using the first one's. Not perfectly
		// precise: build_club_badge_questions.py's insert_loan_returns can
		// infer a return with no row of its own at all (see its doc), and
		// when an earlier occurrence of the same club already absorbed two
		// real rows (e.g. a loan row immediately followed by that club's own
		// permanent one, collapsed into a single appearance), this queue has
		// no way to know that and hands the second real row's year to the
		// later, actually-unbacked occurrence instead of returning null for
		// it. Rare in practice (needs both a same-club adjacent double *and*
		// a later inferred return), and still an estimate either way -- worth
		// a fully row-level replay of that script's logic here if it turns
		// out to matter, not before.
		const yearQueueByClub = new Map<number, number[]>();
		for (const r of pcsRows ?? []) {
			if (r.player_id !== playerId) continue;
			const year = leadingYear(r.years_display);
			if (year === null) continue;
			const queue = yearQueueByClub.get(r.team_id) ?? [];
			queue.push(year);
			yearQueueByClub.set(r.team_id, queue);
		}

		return clubIds.slice(1).map((toClubId, i) => {
			const fromClubId = clubIds[i];
			const next = playerTransfers[transferPtr];
			if (next && next.from_club_id === fromClubId && next.to_club_id === toClubId) {
				transferPtr++;
				const loan = next.transfer_type === "loan";
				const formatted = formatMonthYear(next.transfer_date);
				if (formatted) return { date: formatted, loan };
				// transfer_date itself failed to format (malformed, in practice
				// never happens against the real data) -- still fall through to
				// the estimate below rather than losing the date hint entirely,
				// but keep the loan classification: that came from this matched
				// row, not from whichever estimate ends up filling the date in.
				const queue = yearQueueByClub.get(toClubId);
				const year = queue?.shift();
				return { date: year === undefined ? null : `~${year}`, loan };
			}
			const queue = yearQueueByClub.get(toClubId);
			const year = queue?.shift();
			return { date: year === undefined ? null : `~${year}`, loan: false };
		});
	}

	return c.json({
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

// Keeps the scrolling ticker (routes/ticker.ts / components/Ticker.tsx)
// showing this week's Premier League results, refreshed periodically by a
// Cron Trigger (see index.ts's scheduled(), wrangler.json's triggers.crons)
// rather than fetched live on every request -- football-data.org's free
// tier is rate-limited (10 req/min) and shared with scripts/verify-content-
// source.ts's own use of it, and there's no reason a page view should ever
// wait on an external API just to render a ticker banner.
//
// Stored in the PROGRESS KV namespace under one fixed key (epl-ticker) --
// the one genuinely global value in there; everything else is scoped
// per-device (see progressStore.ts's key helpers). expirationTtl (see
// LIVE_TTL_SECONDS/FINISHED_TTL_SECONDS below) means a cron that stops
// firing (or keeps failing) makes the ticker fade out on its own rather
// than showing an increasingly stale score forever -- no separate "is
// this data fresh" check needed anywhere that reads it.
//
// Built without the ability to test a live call against this API from the
// development sandbox this was written in (same egress restriction noted
// in verify-content-source.ts's own header). Unlike that script, this runs
// unattended on a schedule, not as a CI gate someone watches -- so instead
// of "fail loudly", any unexpected shape or network error here logs and
// leaves the ticker exactly as it was (see refreshEplTicker's early
// returns), letting the expirationTtl below be the actual safety net if
// football-data.org's real response ever differs from what's assumed
// below.

const API_BASE = "https://api.football-data.org/v4";
const TICKER_KV_KEY = "epl-ticker";
// Two different TTLs, not one -- a live score and a finished score go
// stale in very different ways:
//   - LIVE: a genuinely wrong answer the moment the real score moves on,
//     so if the cron stops running mid-match, this needs to disappear
//     quickly rather than keep showing a score that's since changed.
//   - FINISHED: a final score never changes, so there's no correctness
//     downside to it sticking around -- only "how long until this looks
//     stale", and the real gap it needs to survive is the days between
//     one Premier League round and the next, not minutes. Still bounded
//     (not infinite) so a genuinely abandoned cron eventually goes quiet
//     instead of showing last month's scores forever.
const LIVE_TTL_SECONDS = 20 * 60;
const FINISHED_TTL_SECONDS = 3 * 24 * 60 * 60;
// Keeps a full round of Premier League results (10 matches) from producing
// an unreasonably long scroll -- generous enough that this never actually
// trims anything a normal matchday produces.
const MAX_MATCHES = 10;

// Exported (along with the formatting functions below) purely so
// eplTicker.test.ts can construct fixture matches directly -- these are
// otherwise only ever produced by parsing football-data.org's own JSON.
export interface FdTeam {
	name: string;
	shortName?: string | null;
}

export interface FdScoreLine {
	home: number | null;
	away: number | null;
}

export interface FdMatch {
	utcDate: string;
	status: string;
	matchday: number | null;
	homeTeam: FdTeam;
	awayTeam: FdTeam;
	score: {
		fullTime: FdScoreLine;
		halfTime?: FdScoreLine;
	};
}

interface FdMatchesResponse {
	matches: FdMatch[];
}

export function teamLabel(team: FdTeam): string {
	return team.shortName?.trim() || team.name;
}

// A match's live score during IN_PLAY/PAUSED lives in the same `fullTime`
// field a finished match's final score does (football-data.org doesn't
// expose a separate "current score" field) -- fall back to `halfTime` only
// for the unlikely case `fullTime` isn't populated yet. Returns null (not
// "0-0") when neither is available, so formatMatch can show "vs" instead
// of fabricating a score nobody has confirmed.
export function currentScore(match: FdMatch): FdScoreLine | null {
	const { fullTime, halfTime } = match.score;
	if (typeof fullTime?.home === "number" && typeof fullTime?.away === "number") return fullTime;
	if (typeof halfTime?.home === "number" && typeof halfTime?.away === "number") return halfTime;
	return null;
}

// "LIVE" for IN_PLAY/PAUSED, "FT" (full time) for FINISHED -- every match
// reaching here is one of those three (see the `started` filter above),
// so there's no other status to account for.
export function formatMatch(match: FdMatch): string {
	const score = currentScore(match);
	const scoreText = score ? `${score.home}-${score.away}` : "vs";
	const tag = match.status === "IN_PLAY" || match.status === "PAUSED" ? "LIVE" : "FT";
	return `${tag}: ${teamLabel(match.homeTeam)} ${scoreText} ${teamLabel(match.awayTeam)}`;
}

function isoDate(d: Date): string {
	return d.toISOString().slice(0, 10);
}

// Called from index.ts's scheduled() on its own, more frequent cron (see
// wrangler.json) -- never from a request path. Writes the formatted
// message to KV, or leaves whatever's already there untouched on any
// failure (see file header).
export async function refreshEplTicker(kv: KVNamespace, apiKey: string | undefined): Promise<void> {
	if (!apiKey) {
		console.log("eplTicker: FOOTBALL_DATA_API_KEY not set -- leaving the ticker as whatever it last was");
		return;
	}

	// A Premier League gameweek's fixtures can span several days (often
	// Friday through Monday) and, checked mid-week, the most recent one
	// might have finished up to several days ago -- a 6-day lookback plus a
	// 1-day lookahead comfortably spans "this week's results" without
	// needing to know the current matchday number ourselves.
	const now = new Date();
	const dateFrom = new Date(now);
	dateFrom.setUTCDate(dateFrom.getUTCDate() - 6);
	const dateTo = new Date(now);
	dateTo.setUTCDate(dateTo.getUTCDate() + 1);

	let data: FdMatchesResponse;
	try {
		const res = await fetch(
			`${API_BASE}/competitions/PL/matches?dateFrom=${isoDate(dateFrom)}&dateTo=${isoDate(dateTo)}`,
			{ headers: { "X-Auth-Token": apiKey } },
		);
		if (!res.ok) {
			console.error(`eplTicker: football-data.org returned ${res.status} -- leaving the ticker as-is this run`);
			return;
		}
		data = await res.json();
	} catch (err) {
		console.error("eplTicker: fetch failed -- leaving the ticker as-is this run", err);
		return;
	}
	if (!Array.isArray(data?.matches)) {
		console.error("eplTicker: unexpected response shape (no matches array) -- leaving the ticker as-is this run", data);
		return;
	}

	// Only matches that have actually kicked off count as "results" --
	// not-yet-played fixtures (SCHEDULED/TIMED) are excluded on purpose.
	const started = data.matches.filter((m) => m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "FINISHED");
	if (started.length === 0) {
		// Nothing has started in the window (an international break,
		// preseason, etc.) -- hide the ticker rather than show something
		// stale or misleading.
		await kv.delete(TICKER_KV_KEY);
		return;
	}

	// The whole current gameweek -- every match that's kicked off, live or
	// finished, not just whichever ones happen to be live right now --
	// grouped by matchday (a round's fixtures don't all kick off the same
	// day, so a date slice alone can't tell "this round" from "last
	// round") rather than assumed from today's date.
	const latestMatchday = Math.max(...started.map((m) => m.matchday ?? -Infinity));
	const thisWeek = latestMatchday === -Infinity ? started : started.filter((m) => m.matchday === latestMatchday);
	thisWeek.sort((a, b) => a.utcDate.localeCompare(b.utcDate));

	// A live match anywhere in the set makes the whole message time-
	// sensitive -- see LIVE_TTL_SECONDS/FINISHED_TTL_SECONDS above.
	const anyLive = thisWeek.some((m) => m.status === "IN_PLAY" || m.status === "PAUSED");
	// No leading "Premier League" label -- the ticker only ever shows this
	// one competition, so restating that in every message is redundant.
	const message = thisWeek.slice(0, MAX_MATCHES).map(formatMatch).join("   •   ");
	await kv.put(TICKER_KV_KEY, message, { expirationTtl: anyLive ? LIVE_TTL_SECONDS : FINISHED_TTL_SECONDS });
}

// Called from routes/ticker.ts on every request -- just a KV read, no
// network call, so a page view never waits on football-data.org.
export async function getEplTickerMessage(kv: KVNamespace): Promise<string> {
	return (await kv.get(TICKER_KV_KEY)) ?? "";
}

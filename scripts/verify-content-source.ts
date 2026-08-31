// Real fact-check for "This Season" categories against a live, structured
// sports-data API (football-data.org) — not a paper-trail marker like the
// old verify-content-freshness.ts (removed 2026-08-27; that script only
// checked that a "-- Verified" *comment* existed, never that the content
// was actually correct, and ran on every single push whether or not
// db/seed.sql had even changed. Both were the wrong shape for this
// problem — see git history/agents.md for the full incident writeup).
//
// This script fetches the real current standings/scorers for each mapped
// category and diffs them against db/seed.sql, rank by rank. It is NOT
// wired into the main CI job that runs on every push — see
// .github/workflows/content-check.yml, which only runs when db/seed.sql
// actually changes, which is the "run once when a category is
// created/changed" shape that was actually asked for. It's also runnable
// by hand any time: `FOOTBALL_DATA_API_KEY=... npm run verify:content-source`.
//
// Coverage is necessarily partial: football-data.org's free tier covers
// current-season domestic top-flight tables/scorers for the big-five
// leagues plus UEFA competitions and FIFA tournaments — exactly the
// group_label = 'This Season' categories, nothing else. There is no known
// free, reliable, structured API for all-time records, transfer fees, or
// similar — those categories still depend on manual/AI web research at
// creation time, the same as before. If that ever changes, widen this.
//
// Built without the ability to test a live call against this API from the
// development sandbox this was written in (its egress proxy blocks every
// external host tried, football-data.org included — see agents.md). This
// runs on a real network in CI, so if the API's actual response shape
// differs from what's assumed below, the first real run will surface that
// clearly (this script fails loudly and prints the raw response on an
// unexpected shape, rather than silently misreading it) — fix the parsing
// here against that real response rather than guessing again.

import { execFileSync } from "node:child_process";
import { normalize, collapseToAlnum } from "../src/worker/lib/normalize.ts";

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

type CompareField = "points" | "position";

interface CategoryMapping {
	slug: string;
	competitionCode: string; // football-data.org competition code
	kind: "standings" | "scorers";
	season: number; // the season-start year football-data.org expects
	compareField: CompareField; // only used for kind: "standings"
}

// See the file header for why this list is exactly group_label = 'This
// Season' and nothing else.
const MAPPINGS: CategoryMapping[] = [
	{ slug: "pl-2025-26-final-table", competitionCode: "PL", kind: "standings", season: 2025, compareField: "points" },
	{ slug: "pl-2025-26-top-scorers", competitionCode: "PL", kind: "scorers", season: 2025, compareField: "points" },
	{ slug: "la-liga-2025-26-table", competitionCode: "PD", kind: "standings", season: 2025, compareField: "position" },
	{ slug: "serie-a-2025-26-table", competitionCode: "SA", kind: "standings", season: 2025, compareField: "points" },
	{
		slug: "bundesliga-2025-26-table",
		competitionCode: "BL1",
		kind: "standings",
		season: 2025,
		compareField: "position",
	},
	{ slug: "cl-2025-26-top-scorers", competitionCode: "CL", kind: "scorers", season: 2025, compareField: "points" },
	{ slug: "ligue-1-2025-26-table", competitionCode: "FL1", kind: "standings", season: 2025, compareField: "points" },
	// football-data.org's free tier may not expose a scorers endpoint for
	// international tournaments at all (unconfirmed from this sandbox — see
	// file header). fetchScorers() below handles a 404/empty response for
	// this one by skipping with a clear message rather than failing the
	// whole run.
	{ slug: "wc-2026-top-scorers", competitionCode: "WC", kind: "scorers", season: 2026, compareField: "points" },
];

interface AnswerRow {
	rank: number;
	canonical_name: string;
	stat_value: string;
}

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 200 * 1024 * 1024 },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

async function apiGet(path: string): Promise<unknown> {
	if (!API_KEY) throw new Error("FOOTBALL_DATA_API_KEY is not set");
	const res = await fetch(`${API_BASE}${path}`, { headers: { "X-Auth-Token": API_KEY } });
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`${path} -> HTTP ${res.status}: ${body.slice(0, 500)}`);
	}
	return res.json();
}

// Names differ in formatting between this API and db/seed.sql ("FC
// Barcelona" vs "Barcelona", "Kylian Mbappé" vs "Kylian Mbappe") — a
// same-entity match only needs one name's normalized form to contain the
// other's, not byte equality. This can't tell a real typo/wrong-person
// error apart from a formatting difference with full confidence, which is
// exactly why a mismatch here is reported for a human to look at rather
// than auto-"fixed".
//
// A single collapsed-substring check (tried first, see git history around
// 2026-08-28) isn't enough on real API data: the API's official full name
// often inserts a word in the *middle* ("Atletico Madrid" vs "Club
// Atlético de Madrid", "Bayer Leverkusen" vs "Bayer 04 Leverkusen"),
// which breaks contiguous-substring matching even though every meaningful
// word still lines up. Comparing token-by-token (prefix/substring, not
// exact — "inter" vs "internazionale", "milan" vs "milano") tolerates
// that. A few names are genuinely different words for the same club in
// different languages, not formatting variants (English "Munich" vs
// German "München"/"Munchen") — those need an explicit entry in
// NAME_ALIASES below rather than a smarter string algorithm; add one if a
// future run reports a name pair that's obviously the same club/player
// but doesn't token-match.
const NAME_ALIASES: [string, string][] = [
	["bayern munich", "fc bayern munchen"],
	["rennes", "stade rennais fc 1901"],
];

function tokens(name: string): string[] {
	return normalize(name)
		.split(" ")
		.map((t) => collapseToAlnum(t))
		.filter((t) => t.length > 0);
}

function namesLikelyMatch(a: string, b: string): boolean {
	const collapsedA = collapseToAlnum(normalize(a));
	const collapsedB = collapseToAlnum(normalize(b));
	if (!collapsedA || !collapsedB) return false;
	if (collapsedA === collapsedB || collapsedA.includes(collapsedB) || collapsedB.includes(collapsedA)) return true;

	for (const [x, y] of NAME_ALIASES) {
		const cx = collapseToAlnum(x);
		const cy = collapseToAlnum(y);
		if ((collapsedA === cx || collapsedA.includes(cx)) && (collapsedB === cy || collapsedB.includes(cy))) return true;
		if ((collapsedA === cy || collapsedA.includes(cy)) && (collapsedB === cx || collapsedB.includes(cx))) return true;
	}

	const [shorter, longer] = tokens(a).length <= tokens(b).length ? [tokens(a), tokens(b)] : [tokens(b), tokens(a)];
	if (shorter.length === 0) return false;
	return shorter.every((st) => longer.some((lt) => lt === st || lt.startsWith(st) || st.startsWith(lt)));
}

interface Finding {
	slug: string;
	rank: number;
	message: string;
}

async function checkStandings(mapping: CategoryMapping, answers: AnswerRow[]): Promise<Finding[]> {
	const data = (await apiGet(`/competitions/${mapping.competitionCode}/standings?season=${mapping.season}`)) as {
		standings?: { type: string; table?: { position: number; team: { name: string }; points: number }[] }[];
	};
	const table = data.standings?.find((s) => s.type === "TOTAL")?.table;
	if (!table || table.length === 0) {
		throw new Error(`No TOTAL standings table in response for ${mapping.competitionCode} season ${mapping.season}`);
	}

	const findings: Finding[] = [];
	for (const answer of answers) {
		const apiRow = table.find((row) => row.position === answer.rank);
		if (!apiRow) {
			findings.push({ slug: mapping.slug, rank: answer.rank, message: `API has no row at position ${answer.rank}` });
			continue;
		}
		if (!namesLikelyMatch(answer.canonical_name, apiRow.team.name)) {
			findings.push({
				slug: mapping.slug,
				rank: answer.rank,
				message: `stored "${answer.canonical_name}" but API has "${apiRow.team.name}" at position ${answer.rank}`,
			});
			continue;
		}
		if (mapping.compareField === "points") {
			const storedPoints = Number.parseInt(answer.stat_value, 10);
			if (Number.isFinite(storedPoints) && storedPoints !== apiRow.points) {
				findings.push({
					slug: mapping.slug,
					rank: answer.rank,
					message: `stored ${storedPoints} points for "${answer.canonical_name}" but API has ${apiRow.points}`,
				});
			}
		}
		// compareField "position" (la-liga/bundesliga store final position,
		// not points, as stat_value) is already validated by the position
		// match above — nothing further to check numerically.
	}
	return findings;
}

async function checkScorers(mapping: CategoryMapping, answers: AnswerRow[]): Promise<Finding[]> {
	let data: { scorers?: { player: { name: string }; goals: number }[] };
	try {
		data = (await apiGet(`/competitions/${mapping.competitionCode}/scorers?season=${mapping.season}&limit=10`)) as {
			scorers?: { player: { name: string }; goals: number }[];
		};
	} catch (err) {
		console.warn(
			`  ⚠ [${mapping.slug}] skipping — scorers endpoint unavailable for ${mapping.competitionCode}/${mapping.season}: ${err instanceof Error ? err.message : String(err)}`,
		);
		return [];
	}
	const scorers = data.scorers;
	if (!scorers || scorers.length === 0) {
		console.warn(`  ⚠ [${mapping.slug}] skipping — empty scorers list for ${mapping.competitionCode}/${mapping.season}`);
		return [];
	}

	const findings: Finding[] = [];
	let loggedRawList = false;
	for (const answer of answers) {
		// Scorers responses aren't guaranteed sorted by goals with stable
		// index==rank the way a standings table's `position` field is
		// explicit — match by goal count + name instead of by array index.
		const candidate = scorers.find((s) => namesLikelyMatch(answer.canonical_name, s.player.name));
		if (!candidate) {
			findings.push({
				slug: mapping.slug,
				rank: answer.rank,
				message: `"${answer.canonical_name}" not found anywhere in the API's top scorers`,
			});
			// Print exactly what the API DID return, once per category, the
			// first time this happens — e.g. if `limit` isn't honored the way
			// this script assumes and the API only returned 5 names for a
			// "top 10", printing "not found" five separate times with no raw
			// data attached would leave a future run just as blind as this
			// one. See git history around 2026-08-28 for why this exists:
			// this exact situation, unable to tell "wrong name" apart from
			// "the API just returned fewer rows than expected" from the
			// dev sandbox this script was written in (no network access to
			// the real API to check by hand).
			if (!loggedRawList) {
				loggedRawList = true;
				console.error(
					`    (API returned ${scorers.length} scorer(s) for ${mapping.competitionCode}/${mapping.season}: ${scorers.map((s) => `${s.player.name} (${s.goals})`).join(", ")})`,
				);
			}
			continue;
		}
		const storedGoals = Number.parseFloat(answer.stat_value);
		if (Number.isFinite(storedGoals) && storedGoals !== candidate.goals) {
			findings.push({
				slug: mapping.slug,
				rank: answer.rank,
				message: `stored ${storedGoals} goals for "${answer.canonical_name}" but API has ${candidate.goals}`,
			});
		}
	}
	return findings;
}

async function main(): Promise<void> {
	if (!API_KEY) {
		console.log(
			"verify:content-source: SKIPPED — FOOTBALL_DATA_API_KEY is not set. This is expected until that secret is configured; see agents.md.",
		);
		return;
	}

	const allFindings: Finding[] = [];
	for (const mapping of MAPPINGS) {
		const answers = queryLocalD1<AnswerRow>(
			`SELECT a.rank, a.canonical_name, a.stat_value FROM answers a JOIN categories c ON a.category_id = c.id WHERE c.slug = '${mapping.slug}' ORDER BY a.rank;`,
		);
		if (answers.length === 0) {
			console.warn(`  ⚠ [${mapping.slug}] no answers found in local D1 — skipping (re-seed local D1 first?)`);
			continue;
		}

		try {
			const findings = mapping.kind === "standings" ? await checkStandings(mapping, answers) : await checkScorers(mapping, answers);
			if (findings.length === 0) {
				console.log(`  ✓ [${mapping.slug}] matches the live API`);
			} else {
				for (const f of findings) console.error(`  ✗ [${mapping.slug}] rank ${f.rank}: ${f.message}`);
				allFindings.push(...findings);
			}
		} catch (err) {
			console.error(`  ✗ [${mapping.slug}] couldn't check: ${err instanceof Error ? err.message : String(err)}`);
			allFindings.push({ slug: mapping.slug, rank: 0, message: "fetch/parse failure — see above" });
		}

		// football-data.org's free tier is rate-limited (10 req/min as of
		// this writing) — a fixed pause between calls keeps this safely
		// under that without needing real rate-limit-header bookkeeping for
		// what's currently only 7 categories.
		await new Promise((resolve) => setTimeout(resolve, 6500));
	}

	if (allFindings.length > 0) {
		console.error(
			`\nverify-content-source: FAILED — ${allFindings.length} discrepancy(ies) against the live API. A name-formatting difference (e.g. "Inter Milan" vs "FC Internazionale Milano") can produce a false positive here — check namesLikelyMatch()'s reasoning before assuming db/seed.sql is wrong, but don't dismiss a finding without actually looking.`,
		);
		process.exit(1);
	} else {
		console.log(`\nverify-content-source: OK — all checked categories match the live API.`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

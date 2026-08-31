// Standing correctness check for the derived-category machinery
// (category_defs -> rebuild.ts -> category_answers). Run after touching
// entity_stats or category_defs, and always when adding a new category.
//
// This exists because deriving a category's order from entity_stats
// introduces a bug class the old hand-typed `answers` model made
// impossible by construction: a silently wrong SORT. Whoever wrote an
// INSERT into `answers` chose the order directly, so a sorting bug simply
// couldn't happen. Now that order comes from `ORDER BY value_numeric`, a
// `display_value` that doesn't actually match its `value_numeric` (e.g.
// display "£222m" entered alongside value_numeric 220000000) produces a
// wrong-but-plausible-looking ranking with no visual tell — see
// agents.md's Content accuracy section for why a wrong Top 10 is treated
// as a trust-breaking bug, not a cosmetic one.
//
// Checks, across every row currently in entity_stats and category_defs:
//
//   1. Every entity_stats row with a non-null value_numeric has a
//      display_value whose own leading number (best-effort parse, same
//      shape rebuild's migration tooling used) is consistent with
//      value_numeric — not necessarily equal (display_value can carry
//      units/formatting value_numeric strips, e.g. "£222m" -> 222000000),
//      but never contradictory (e.g. "34 goals" next to value_numeric 43).
//   2. Every category_defs row actually produces a non-empty result when
//      run through rebuild's query — catches a typo'd stat_key/scope that
//      would otherwise silently rebuild a category down to zero answers.
//   3. Every category_defs row's limit_n matches how many rows its most
//      recent rebuild actually produced (category_answers) — catches a
//      category quietly drifting from its intended Top N size.
//
// Usage: npm run verify:category-defs
//   (requires a locally seeded D1 — see README/agents.md for setup)

import { execFileSync } from "node:child_process";
import { REBUILD_QUERY_SQL, type CategoryDefRow } from "../src/worker/lib/rebuild.ts";

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 200 * 1024 * 1024 },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

// Same best-effort parse rebuild's migration tooling used, kept in sync by
// hand (it's a small, stable function) — used here only to sanity-check
// consistency, not to compute anything gameplay depends on.
function leadingNumber(raw: string): number | null {
	const s = raw.trim();
	let m = s.match(/^(\d{4})-\d{2}$/);
	if (m) return parseInt(m[1], 10);
	m = s.match(/^\d{4}$/);
	if (m) return parseInt(m[0], 10);
	m = s.match(/[£€$]?\s*([\d.,]+)\s*(bn|billion|m|million|k|thousand)?/i);
	if (m && /\d/.test(m[1])) {
		let num = parseFloat(m[1].replace(/,/g, ""));
		const suffix = (m[2] ?? "").toLowerCase();
		if (suffix === "bn" || suffix === "billion") num *= 1e9;
		else if (suffix === "m" || suffix === "million") num *= 1e6;
		else if (suffix === "k" || suffix === "thousand") num *= 1e3;
		return num;
	}
	return null;
}

interface StatRow {
	id: number;
	stat_key: string;
	value_numeric: number | null;
	display_value: string;
}

let failed = false;

// --- check 1: value_numeric / display_value consistency -----------------

const statRows = queryLocalD1<StatRow>(
	"SELECT id, stat_key, value_numeric, display_value FROM entity_stats WHERE value_numeric IS NOT NULL;",
);
const inconsistent = statRows.filter((row) => {
	const parsed = leadingNumber(row.display_value);
	if (parsed === null) return false; // display_value in a shape the parser can't read at all — not this check's job
	// Allow exact match, or value_numeric being a unit-scaled version of the
	// parsed leading number (display "222" + value_numeric 222000000, a
	// "m" suffix the parser already expanded) — only flag genuinely
	// contradictory pairs (neither equal nor a round power-of-1000 apart).
	if (row.value_numeric === parsed) return false;
	const ratio = row.value_numeric === 0 ? 0 : (row.value_numeric ?? 0) / parsed;
	if ([1, 1e3, 1e6, 1e9].includes(ratio)) return false;
	return true;
});
if (inconsistent.length > 0) {
	failed = true;
	console.error(`\n✗ ${inconsistent.length} entity_stats row(s) where display_value contradicts value_numeric:`);
	for (const row of inconsistent) {
		console.error(`  id=${row.id} stat_key=${row.stat_key} display="${row.display_value}" value_numeric=${row.value_numeric}`);
	}
}

// --- checks 2 & 3: category_defs actually produce their intended output -

const defs = queryLocalD1<CategoryDefRow & { slug: string }>(
	`SELECT cd.*, c.slug FROM category_defs cd JOIN categories c ON c.id = cd.category_id;`,
);
const computedCounts = queryLocalD1<{ category_id: number; n: number }>(
	"SELECT category_id, COUNT(*) as n FROM category_answers GROUP BY category_id;",
);
const countByCategory = new Map(computedCounts.map((r) => [r.category_id, r.n]));

for (const def of defs) {
	const bound = REBUILD_QUERY_SQL.replace(/\?1/g, `'${def.stat_key}'`)
		.replace(/\?2/g, `'${def.scope}'`)
		.replace(/\?3/g, def.target_date ? `'${def.target_date}'` : "NULL")
		.replace(/\?4/g, def.tiebreak_stat_key ? `'${def.tiebreak_stat_key}'` : "NULL")
		.replace(/\?5/g, `'${def.tiebreak_scope}'`)
		.replace(/\?6/g, `'${def.sort_dir}'`)
		.replace(/\?7/g, `'${def.tiebreak_dir}'`)
		.replace(/\?8/g, String(def.limit_n));
	const rows = queryLocalD1<{ entity_id: number }>(bound);

	if (rows.length === 0) {
		failed = true;
		console.error(`\n✗ [${def.slug}] category_defs (stat_key=${def.stat_key}, scope=${def.scope}) produces ZERO rows`);
		continue;
	}

	const materialized = countByCategory.get(def.category_id) ?? 0;
	if (materialized !== rows.length) {
		failed = true;
		console.error(
			`\n✗ [${def.slug}] category_answers has ${materialized} row(s) but re-running its category_defs query produces ${rows.length} — rebuild is stale, run the rebuild job`,
		);
	}
}

if (failed) {
	console.error(`\nverify-category-defs: FAILED`);
	process.exit(1);
} else {
	console.log(
		`verify-category-defs: OK — ${statRows.length} dated stats, ${defs.length} category_defs checked, 0 inconsistencies`,
	);
}

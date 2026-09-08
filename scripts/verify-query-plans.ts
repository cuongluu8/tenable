// Standing check that specific, previously-regressed queries still produce
// the query plan they're supposed to -- not just that they return correct
// results (verify-guess-matching.ts/verify-category-defs.ts already cover
// correctness) but that they don't silently read far more rows than
// necessary, which correctness checks have no way to catch at all.
//
// Exists because of suggestNames() (src/worker/lib/categories.ts): its
// curated-alias branch was fixed once (2026-09-06, explicit >=/< bounds
// meant to force a bounded index range scan on entity_aliases.alias) and
// verified via a one-off EXPLAIN QUERY PLAN at the time -- then silently
// drifted back to a full ~18,500-row player-table scan on every single
// keystroke (2026-09-08), with no code change in between, no test failure,
// and no error anywhere. It was only caught because that second regression
// happened to burn through D1's entire daily free-tier quota and take the
// whole app down. A one-off EXPLAIN check that's never run again is exactly
// as much protection as no check at all against a planner that's free to
// re-cost a query differently as row-count statistics change over time --
// this script is what makes that check actually standing, not one-off.
//
// The 2026-09-08 fix itself (`INDEXED BY idx_entity_aliases_alias`) also
// changes the failure mode for next time: if that index is ever dropped or
// renamed, the query now fails outright rather than silently degrading, so
// in principle this check is a belt-and-braces backstop, not the only
// thing standing between a code change and another outage. Still worth
// having: it fails loudly and immediately (right here, before a deploy)
// instead of "loudly" via a production 500 an unknown amount of time
// later, and it protects against ever removing the `INDEXED BY` hint
// itself as some future cleanup ("this looks like an unnecessary
// micro-optimization") without understanding why it's there.
//
// Usage: npm run verify:query-plans
//   (requires a locally seeded D1 — see README/agents.md for setup)

import { execFileSync } from "node:child_process";
import { SUGGEST_NAMES_SQL } from "../src/worker/lib/suggestNamesSql.ts";

interface PlanRow {
	id: number;
	parent: number;
	notused: number;
	detail: string;
}

function explainQueryPlan(sql: string): PlanRow[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", `EXPLAIN QUERY PLAN ${sql}`],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 20 * 1024 * 1024 },
	);
	const parsed = JSON.parse(raw) as { results: PlanRow[] }[];
	return parsed[0]?.results ?? [];
}

// `wrangler d1 execute --command` has no parameter-binding of its own, so
// SUGGEST_NAMES_SQL's ?1.."?6" placeholders are substituted with literal,
// representative values here -- the exact values don't matter to the shape
// of the plan (SQLite picks a plan based on the query's structure and the
// table's own statistics, not the literal values bound to it), only that
// every placeholder is filled in with *something* of the right type so the
// query is syntactically complete.
const LITERAL_VALUES: Record<string, string> = {
	"?1": "'mes*'", // ftsQuery
	"?2": "'player'", // entityType
	"?3": "'mes'", // normalizedPrefix
	"?4": "NULL", // scope
	"?5": "21", // limit + 1
	"?6": "'mes￿'", // prefixUpperBound
};

function withLiterals(sql: string): string {
	let out = sql;
	for (const [placeholder, literal] of Object.entries(LITERAL_VALUES)) {
		out = out.replaceAll(placeholder, literal);
	}
	return out;
}

interface PlanCheck {
	name: string;
	sql: string;
	// Every pattern here must match at least one plan row's `detail`.
	mustContain: RegExp[];
	// No plan row's `detail` may match any pattern here.
	mustNotContain: RegExp[];
}

const CHECKS: PlanCheck[] = [
	{
		name: "suggestNames() curated-alias branch",
		sql: withLiterals(SUGGEST_NAMES_SQL),
		mustContain: [/SEARCH al USING INDEX idx_entity_aliases_alias \(alias>\? AND alias<\?\)/],
		// The exact signature of both past incidents (2026-09-06 and
		// 2026-09-08): driving the join from every player-typed entity
		// instead of the narrow alias range, however that happens to get
		// spelled in a future SQLite plan-string version -- checking both
		// the specific bad access path on `al` AND the tell-tale broad scan
		// on `e` catches either one recurring, not just the exact wording
		// seen so far.
		mustNotContain: [/SEARCH al USING INDEX idx_entity_aliases_entity/, /SEARCH e USING INDEX idx_entities_type/],
	},
];

let failed = false;

for (const check of CHECKS) {
	const plan = explainQueryPlan(check.sql);
	const details = plan.map((row) => row.detail);

	const missing = check.mustContain.filter((pattern) => !details.some((d) => pattern.test(d)));
	const forbidden = details.filter((d) => check.mustNotContain.some((pattern) => pattern.test(d)));

	if (missing.length > 0 || forbidden.length > 0) {
		failed = true;
		console.error(`\n✗ [${check.name}] query plan regressed:`);
		if (missing.length > 0) {
			console.error(`  expected plan step(s) not found:`);
			for (const pattern of missing) console.error(`    ${pattern}`);
		}
		if (forbidden.length > 0) {
			console.error(`  forbidden plan step(s) present:`);
			for (const d of forbidden) console.error(`    ${d}`);
		}
		console.error(`  full plan:`);
		for (const d of details) console.error(`    ${d}`);
	}
}

if (failed) {
	console.error(
		`\nverify-query-plans: FAILED — a query's plan no longer matches what it's supposed to. ` +
			`This means it's likely reading far more rows than necessary again (see this script's own ` +
			`header comment for the 2026-09-06/2026-09-08 incidents this exists to catch) — fix the query, ` +
			`don't just update this check to match the new plan.`,
	);
	process.exit(1);
} else {
	console.log(`verify-query-plans: OK — ${CHECKS.length} quer${CHECKS.length === 1 ? "y" : "ies"} checked`);
}

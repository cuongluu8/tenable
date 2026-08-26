// Standing correctness check for the guess-matching logic — run this
// after touching db/seed.sql (new answers/aliases), or after touching
// matchGuess()/normalize.ts, not just once by hand. It exists because two
// real bugs (Paris Saint-Germain, then Karl-Heinz Rummenigge and Oleg
// Salenko & Hristo Stoichkov) shipped to production before anyone actually
// ran this check — see git history around 2026-08-26. A one-off audit
// someone claims to have run is not a guarantee; this is.
//
// Imports the REAL production functions (not a re-derived copy that could
// silently drift out of sync with what matchGuess() actually does), pulls
// every current answer + alias from local D1, and asserts two invariants:
//
//   1. Every answer's own canonical name — what the typeahead shows and
//      what a player would reasonably type or select — resolves to that
//      answer via collapseToAlnum() against its aliases. This is exactly
//      the bug class that shipped three times: a real, displayed name that
//      the matching logic would silently reject.
//   2. No two DIFFERENT answers in the SAME category collapse to the same
//      alias. This isn't a missed-match bug, it's a wrong-match bug — the
//      matchGuess() rewrite made this theoretically possible (collapsing
//      punctuation could make two distinct names collide), so it has to be
//      checked, not assumed, every time the data changes.
//
// Usage: npm run verify:matching
//   (requires a locally seeded D1 — see README/agents.md for setup)

import { normalize, collapseToAlnum } from "../src/worker/lib/normalize.ts";
import { execFileSync } from "node:child_process";

interface AnswerRow {
	answer_id: number;
	slug: string;
	canonical_name: string;
}

interface AliasRow {
	answer_id: number;
	alias: string;
}

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

const answers = queryLocalD1<AnswerRow>(
	"SELECT a.id AS answer_id, c.slug, a.canonical_name FROM answers a JOIN categories c ON a.category_id = c.id;",
);
const aliasRows = queryLocalD1<AliasRow>("SELECT answer_id, alias FROM answer_aliases;");

const answerById = new Map(answers.map((a) => [a.answer_id, a]));
const aliasesByAnswer = new Map<number, string[]>();
for (const row of aliasRows) {
	const list = aliasesByAnswer.get(row.answer_id) ?? [];
	list.push(row.alias);
	aliasesByAnswer.set(row.answer_id, list);
}

let failed = false;

// Invariant 1: every answer's own canonical name is reachable.
const unreachable: { answer_id: number; slug: string; canonical_name: string }[] = [];
for (const a of answers) {
	const expected = collapseToAlnum(normalize(a.canonical_name));
	const aliases = aliasesByAnswer.get(a.answer_id) ?? [];
	const reachable = aliases.some((alias) => collapseToAlnum(alias) === expected);
	if (!reachable) unreachable.push(a);
}

if (unreachable.length > 0) {
	failed = true;
	console.error(`\n✗ ${unreachable.length} answer(s) whose own canonical name doesn't match any of their aliases:`);
	for (const a of unreachable) {
		console.error(`  answer_id=${a.answer_id} [${a.slug}] "${a.canonical_name}" (aliases: ${JSON.stringify(aliasesByAnswer.get(a.answer_id) ?? [])})`);
	}
}

// Invariant 2: no cross-answer collision within a category.
const groups = new Map<string, Set<string>>();
for (const row of aliasRows) {
	const a = answerById.get(row.answer_id);
	if (!a) continue;
	const key = `${a.slug}::${collapseToAlnum(row.alias)}`;
	const names = groups.get(key) ?? new Set<string>();
	names.add(a.canonical_name);
	groups.set(key, names);
}
const collisions = [...groups.entries()].filter(([, names]) => names.size > 1);

if (collisions.length > 0) {
	failed = true;
	console.error(`\n✗ ${collisions.length} same-category alias collision(s) between different answers:`);
	for (const [key, names] of collisions) {
		console.error(`  ${key} -> ${JSON.stringify([...names])}`);
	}
}

if (failed) {
	console.error(`\nverify-guess-matching: FAILED (${answers.length} answers, ${aliasRows.length} aliases checked)`);
	process.exit(1);
} else {
	console.log(`verify-guess-matching: OK — ${answers.length} answers, ${aliasRows.length} aliases, 0 unreachable, 0 collisions`);
}

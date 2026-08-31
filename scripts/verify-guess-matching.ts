// Standing correctness check for the guess-matching logic — run this after
// touching db/seed.sql (new entity_stats/category_defs), or after touching
// matchGuess()/normalize.ts/rebuild.ts, not just once by hand.
//
// The old version of this check existed because a real answer's own
// canonical name could fail to match any of its own aliases — a bug that
// shipped three times in production before this check existed (Paris
// Saint-Germain, then Karl-Heinz Rummenigge, then Oleg Salenko & Hristo
// Stoichkov — see git history around 2026-08-26). That's now structurally
// impossible: matchGuess() always tests a category_answers entity's own
// canonical_name as a match candidate directly (see schema.sql's
// entity_aliases comment and categories.ts's matchGuess), no alias row
// required. So the check that remains meaningful is the other one —
// pulls every current answer for every category and asserts:
//
//   No two DIFFERENT entities answering the SAME category collapse to the
//   same match string (canonical_name or alias) via collapseToAlnum(). If
//   they did, matchGuess() would have to pick one arbitrarily for a guess
//   that's genuinely ambiguous between them — a wrong-match bug, not a
//   missed-match one.
//
// Also checks basic referential integrity of the materialized snapshot
// (every category_answers row points at a real entity; ranks are a
// contiguous 1..N per category) — cheap to check and would otherwise be a
// silent way for rebuild.ts (or a hand-written category_defs row) to
// produce a broken category with no error anywhere else.
//
// Usage: npm run verify:matching
//   (requires a locally seeded D1 — see README/agents.md for setup)

import { collapseToAlnum } from "../src/worker/lib/normalize.ts";
import { execFileSync } from "node:child_process";

interface AnswerRow {
	entity_id: number;
	rank: number;
	slug: string;
	canonical_name: string;
}
interface AliasRow {
	entity_id: number;
	alias: string;
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

const answers = queryLocalD1<AnswerRow>(
	`SELECT ca.entity_id, ca.rank, c.slug, e.canonical_name
	 FROM category_answers ca
	 JOIN categories c ON c.id = ca.category_id
	 JOIN entities e ON e.id = ca.entity_id;`,
);
const aliasRows = queryLocalD1<AliasRow>("SELECT entity_id, alias FROM entity_aliases;");

const aliasesByEntity = new Map<number, string[]>();
for (const row of aliasRows) {
	const list = aliasesByEntity.get(row.entity_id) ?? [];
	list.push(row.alias);
	aliasesByEntity.set(row.entity_id, list);
}

let failed = false;

// Referential integrity: every category_answers row resolved to a real
// entity (an orphaned entity_id would silently show up as `null` in the
// API instead of erroring anywhere).
const missingEntity = answers.filter((a) => !a.canonical_name);
if (missingEntity.length > 0) {
	failed = true;
	console.error(`\n✗ ${missingEntity.length} category_answers row(s) with no matching entities row:`);
	for (const a of missingEntity) console.error(`  [${a.slug}] rank=${a.rank} entity_id=${a.entity_id}`);
}

// Ranks should be a contiguous 1..N per category — rebuild.ts always writes
// them that way, but a hand patch to category_answers or a category_defs
// row with a bad limit_n could silently produce a gap.
const ranksByCategory = new Map<string, number[]>();
for (const a of answers) {
	const list = ranksByCategory.get(a.slug) ?? [];
	list.push(a.rank);
	ranksByCategory.set(a.slug, list);
}
for (const [slug, ranks] of ranksByCategory) {
	const sorted = [...ranks].sort((x, y) => x - y);
	const expected = sorted.map((_, i) => i + 1);
	const contiguous = sorted.every((r, i) => r === expected[i]);
	if (!contiguous) {
		failed = true;
		console.error(`\n✗ [${slug}] ranks aren't a contiguous 1..N: ${JSON.stringify(sorted)}`);
	}
}

// No cross-entity collision within a category: build every match string
// (canonical name + aliases) per entity, per category, and check none of
// them are shared with a DIFFERENT entity in that same category.
const matchStringsByCategoryEntity = new Map<string, Map<number, Set<string>>>();
for (const a of answers) {
	const byEntity = matchStringsByCategoryEntity.get(a.slug) ?? new Map<number, Set<string>>();
	const strings = byEntity.get(a.entity_id) ?? new Set<string>();
	strings.add(collapseToAlnum(a.canonical_name));
	for (const alias of aliasesByEntity.get(a.entity_id) ?? []) strings.add(collapseToAlnum(alias));
	byEntity.set(a.entity_id, strings);
	matchStringsByCategoryEntity.set(a.slug, byEntity);
}

const collisions: string[] = [];
for (const [slug, byEntity] of matchStringsByCategoryEntity) {
	const entities = [...byEntity.entries()];
	for (let i = 0; i < entities.length; i++) {
		for (let j = i + 1; j < entities.length; j++) {
			const [entityA, stringsA] = entities[i];
			const [entityB, stringsB] = entities[j];
			const shared = [...stringsA].filter((s) => stringsB.has(s));
			if (shared.length > 0) {
				collisions.push(`[${slug}] entity ${entityA} and entity ${entityB} both match ${JSON.stringify(shared)}`);
			}
		}
	}
}

if (collisions.length > 0) {
	failed = true;
	console.error(`\n✗ ${collisions.length} same-category alias/name collision(s) between different entities:`);
	for (const c of collisions) console.error(`  ${c}`);
}

if (failed) {
	console.error(`\nverify-guess-matching: FAILED (${answers.length} answers, ${aliasRows.length} aliases checked)`);
	process.exit(1);
} else {
	console.log(
		`verify-guess-matching: OK — ${answers.length} answers, ${aliasRows.length} aliases, 0 integrity issues, 0 collisions`,
	);
}

// Standing check: every answer whose alias overlaps a reference_entities
// row for the same real-world entity must use the SAME canonical_name as
// that row. Run this after adding/changing any category's answers, not
// just once by hand — see below for why "someone audited it manually" isn't
// good enough on its own.
//
// Incident this exists to catch (2026-08-26): a user guessed "Igor Thiago"
// in pl-2025-26-top-scorers and was told he wasn't on the list, even though
// he genuinely was — the answer row's canonical_name was truncated to just
// "Thiago" (a name shared by many players), so the correctly-spelled guess
// never matched. The same answer/reference-pool mismatch was also confusing
// typeahead: the reference pool's real "Igor Thiago" row and the answer's
// broken "Thiago" row are two DIFFERENT strings for the SAME person, so they
// didn't collapse into one suggestion the way matching names do — a user
// reasonably read that as "two different, possibly-wrong entries" rather
// than "one entry with an inconsistent name". A manual audit at the time
// found two more of the same class already live (Daniel Welbeck vs. the
// real "Danny Welbeck"; Raul Gonzalez vs. the reference pool's "Raul") — see
// git history around 2026-08-26 for the fixes. A one-off audit someone
// claims to have run is not a guarantee that the next category won't
// reintroduce this; this script is.
//
// This is a heuristic, not a hard invariant like verify-guess-matching.ts:
// a shared alias between an answer and a DIFFERENT real person who happens
// to share a surname (e.g. "Cahill" for both Tim and Gary) is expected and
// correct — it's the reference pool's decoy behavior working as intended,
// not a bug. Those confirmed, reviewed collisions are listed in
// KNOWN_COLLISIONS below with a one-line reason each. Anything NOT in that
// list is a genuine new finding that needs a human decision: either sync
// the canonical_name (and add any alias forms that changed — see the
// Thiago/Welbeck/Raul fixes for the pattern) because it's the same real
// person, or add it to KNOWN_COLLISIONS with a reason because it's
// confirmed to be someone else. Default assumption when this fires should
// be "probably a real mismatch" — that's what it was in 2 of the 3 actual
// same-person cases found the one time this was audited by hand.
//
// Usage: npm run verify:name-sync
//   (requires a locally seeded D1 — see README/agents.md for setup)

import { collapseToAlnum } from "../src/worker/lib/normalize.ts";
import { execFileSync } from "node:child_process";

interface AnswerRow {
	answer_id: number;
	slug: string;
	entity_type: string;
	canonical_name: string;
}

interface AnswerAliasRow {
	answer_id: number;
	alias: string;
}

interface ReferenceAliasRow {
	entity_type: string;
	alias: string;
	canonical_name: string;
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

// Confirmed-different-people collisions, found by manual review — a shared
// alias that resolves to someone other than the answer, on purpose. Key:
// `${slug}::${answer canonical_name}::${conflicting reference canonical_name}`.
const KNOWN_COLLISIONS = new Set<string>([
	// Tim Cahill (Everton/Australia) vs. Gary Cahill (Chelsea/England) —
	// different players; only Gary Cahill is in the reference pool under
	// the bare "cahill" alias.
	"everton-pl-top-scorers::Tim Cahill::Gary Cahill",
	// Sándor Kocsis (Hungary, 1954 World Cup) vs. Gergő Kocsis — different
	// players; Sandor Kocsis isn't in the reference pool at all.
	"wc-alltime-goalscorers::Sandor Kocsis::Gergő Kocsis",
	// Ronaldo Nazário (Brazil) vs. Cristiano Ronaldo (Portugal) — different
	// players; the bare "ronaldo" alias is claimed by Cristiano Ronaldo in
	// the reference pool, while Ronaldo Nazário's own full-name reference
	// row already matches this answer's canonical_name exactly.
	"wc-recent-golden-boot::Ronaldo Nazario::Cristiano Ronaldo",
	// Inter Milan (Italy) vs. Internacional (Brazil) — different clubs that
	// both go by "Inter"; appears in every category where Inter Milan is an
	// answer.
	"ucl-titles-by-club::Inter Milan::Internacional",
	"serie-a-2025-26-table::Inter Milan::Internacional",
	"serie-a-alltime-titles::Inter Milan::Internacional",
	"ucl-recent-unique-winners::Inter Milan::Internacional",
	// DR Congo vs. Congo (Republic of the Congo) — two different countries;
	// both are correctly separate rows in the reference pool.
	"afcon-titles-by-country::DR Congo::Congo",
	// Andy/Andrew Cole (Man Utd/Newcastle) vs. Ashley Cole (Arsenal/Chelsea)
	// — different players; only Ashley Cole is in the reference pool under
	// the bare "cole" alias. Appears under both spellings the answers table
	// uses for Andy Cole across two categories.
	"pl-alltime-top-scorers::Andrew Cole::Ashley Cole",
	"man-utd-pl-top-scorers::Andy Cole::Ashley Cole",
	// Phil Neville vs. Gary Neville — brothers, different players; only
	// Gary Neville is in the reference pool under the bare "neville" alias.
	"pl-alltime-appearances::Phil Neville::Gary Neville",
	// Duncan Ferguson (Everton, 1990s-2000s) vs. Lewis Ferguson (modern
	// player) — different players; only Lewis Ferguson is in the reference
	// pool under the bare "ferguson" alias.
	"everton-pl-top-scorers::Duncan Ferguson::Lewis Ferguson",
	// Kevin Campbell (Everton/Arsenal) vs. Sol Campbell (Arsenal/Spurs) —
	// different players; only Sol Campbell is in the reference pool under
	// the bare "campbell" alias.
	"everton-pl-top-scorers::Kevin Campbell::Sol Campbell",
	// A shared-title answer row (two players tied for a World Cup Golden
	// Boot) whose combined canonical_name legitimately differs from either
	// individual co-winner's own name — the "hristo stoichkov" alias lets a
	// guess of just his name register, by design (see matchGuess's rank
	// tie-break comment in categories.ts), not a naming error.
	"wc-recent-golden-boot::Oleg Salenko & Hristo Stoichkov::Hristo Stoichkov",
]);

const answers = queryLocalD1<AnswerRow>(
	"SELECT a.id AS answer_id, c.slug, c.entity_type, a.canonical_name FROM answers a JOIN categories c ON a.category_id = c.id;",
);
const answerAliasRows = queryLocalD1<AnswerAliasRow>(
	"SELECT answer_id, alias FROM answer_aliases;",
);
const referenceAliasRows = queryLocalD1<ReferenceAliasRow>(
	"SELECT re.entity_type, rel.alias, re.canonical_name FROM reference_entity_aliases rel JOIN reference_entities re ON re.id = rel.entity_id;",
);

const answerById = new Map(answers.map((a) => [a.answer_id, a]));

const answerAliasesByAnswer = new Map<number, string[]>();
for (const row of answerAliasRows) {
	const list = answerAliasesByAnswer.get(row.answer_id) ?? [];
	list.push(row.alias);
	answerAliasesByAnswer.set(row.answer_id, list);
}

// "entity_type::collapsed_alias" -> distinct reference canonical names that
// claim that alias. Only an UNAMBIGUOUS owner (exactly one) is usable
// evidence — an alias claimed by several different reference entities (a
// common surname shared by multiple unrelated real players) can't tell us
// which one, if any, an answer actually refers to.
const refOwners = new Map<string, Set<string>>();
for (const row of referenceAliasRows) {
	const key = `${row.entity_type}::${collapseToAlnum(row.alias)}`;
	const owners = refOwners.get(key) ?? new Set<string>();
	owners.add(row.canonical_name);
	refOwners.set(key, owners);
}

const findings: {
	slug: string;
	answer_id: number;
	answer_name: string;
	ref_name: string;
	via_alias: string;
}[] = [];
const seen = new Set<string>(); // one finding per (answer, conflicting name)

for (const [answerId, aliases] of answerAliasesByAnswer) {
	const answer = answerById.get(answerId);
	if (!answer) continue;
	for (const alias of aliases) {
		const key = `${answer.entity_type}::${collapseToAlnum(alias)}`;
		const owners = refOwners.get(key);
		if (!owners || owners.size !== 1) continue;
		const [refName] = owners;
		if (refName === answer.canonical_name) continue;
		const dedupeKey = `${answer.slug}::${answer.canonical_name}::${refName}`;
		if (seen.has(dedupeKey) || KNOWN_COLLISIONS.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		findings.push({
			slug: answer.slug,
			answer_id: answerId,
			answer_name: answer.canonical_name,
			ref_name: refName,
			via_alias: alias,
		});
	}
}

if (findings.length > 0) {
	console.error(
		`\n✗ ${findings.length} answer(s) whose canonical name doesn't match a same-alias reference_entities row (and isn't in KNOWN_COLLISIONS):`,
	);
	for (const f of findings) {
		console.error(
			`  [${f.slug}] answer_id=${f.answer_id} "${f.answer_name}" vs. reference "${f.ref_name}" (shared alias "${f.via_alias}")`,
		);
	}
	console.error(
		`\nFor each one: if it's the SAME real person, sync the names (usually: change answers.canonical_name to ` +
			`match the reference_entities row, or vice versa — see the Igor Thiago/Danny Welbeck/Raul fixes around ` +
			`2026-08-26 for the pattern) and add any alias forms that changed. If it's confirmed to be a DIFFERENT ` +
			`real person who happens to share that alias, add it to KNOWN_COLLISIONS in this script with a one-line reason.`,
	);
	console.error(
		`\nverify-name-sync: FAILED (${answers.length} answers checked, ${findings.length} unresolved finding(s))`,
	);
	process.exit(1);
} else {
	console.log(
		`verify-name-sync: OK — ${answers.length} answers checked, 0 unresolved findings (${KNOWN_COLLISIONS.size} known collisions allowlisted)`,
	);
}

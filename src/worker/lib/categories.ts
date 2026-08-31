import type { CategoryPublic } from "./types";
import { toFtsPrefixQuery, collapseToAlnum } from "./normalize";

interface CategoryRow {
	id: number;
	slug: string;
	title: string;
	subtitle: string | null;
	stat_label: string;
	entity_type: string;
	reference_scope: string | null;
}

interface CategoryRowWithCount extends CategoryRow {
	answer_count: number;
	group_label: string;
	as_of_date: string | null;
}

// The full category library, grouped for the "pick a category" list on the
// client (see schema.sql's group_label/group_order) — categories stay in id
// order within a group, so adding a new one to an existing group is just an
// UPDATE, never a reshuffle of the others.
//
// answer_count/as_of_date come from category_answers (the materialized
// snapshot), never computed live from entity_stats — see rebuild.ts for why
// gameplay always reads the snapshot. as_of_date is the actual currency
// guarantee shown to players: the latest date any of this category's
// answers are accurate up to, not a hand-written claim in the subtitle.
export async function getAllCategories(
	db: D1Database,
): Promise<CategoryRowWithCount[]> {
	const result = await db
		.prepare(
			`SELECT c.id, c.slug, c.title, c.subtitle, c.stat_label, c.group_label,
			        COUNT(ca.id) as answer_count, MAX(ca.as_of_date) as as_of_date
			 FROM categories c
			 LEFT JOIN category_answers ca ON ca.category_id = c.id
			 GROUP BY c.id
			 ORDER BY c.group_order ASC, c.id ASC`,
		)
		.all<CategoryRowWithCount>();
	return result.results ?? [];
}

export async function getCategoryBySlug(
	db: D1Database,
	slug: string,
): Promise<CategoryRow | null> {
	const row = await db
		.prepare(
			`SELECT id, slug, title, subtitle, stat_label, entity_type, reference_scope
			 FROM categories WHERE slug = ?`,
		)
		.bind(slug)
		.first<CategoryRow>();
	return row ?? null;
}

export async function getAnswerCount(
	db: D1Database,
	categoryId: number,
): Promise<number> {
	const row = await db
		.prepare(`SELECT COUNT(*) as count FROM category_answers WHERE category_id = ?`)
		.bind(categoryId)
		.first<{ count: number }>();
	return row?.count ?? 0;
}

// Companion to getAnswerCount for the two player-facing GET routes, which
// also need to show the "data as of" date — a single aggregate query rather
// than a second round trip.
export async function getCategoryMeta(
	db: D1Database,
	categoryId: number,
): Promise<{ answerCount: number; asOfDate: string | null }> {
	const row = await db
		.prepare(
			`SELECT COUNT(*) as answer_count, MAX(as_of_date) as as_of_date
			 FROM category_answers WHERE category_id = ?`,
		)
		.bind(categoryId)
		.first<{ answer_count: number; as_of_date: string | null }>();
	return { answerCount: row?.answer_count ?? 0, asOfDate: row?.as_of_date ?? null };
}

export function toPublic(
	row: CategoryRow,
	answerCount: number,
	asOfDate: string | null = null,
): CategoryPublic {
	return {
		slug: row.slug,
		title: row.title,
		subtitle: row.subtitle,
		statLabel: row.stat_label,
		answerCount,
		asOfDate,
	};
}

interface AnswerMatchRow {
	entity_id: number;
	rank: number;
	canonical_name: string;
	stat_value: string;
}

// Server-authoritative guess check: normalize the guess and look it up
// against this category's current answers (category_answers), matching
// either an entity's own canonical name or one of its curated aliases.
// Answers are never sent to the client, so this is the only place a guess
// can be validated.
//
// Unlike the old answers/answer_aliases model, an entity's own name is
// ALWAYS a valid match target here — there's no separate "did someone
// remember to add the self-alias" step (see entity_aliases' comment in
// schema.sql). That closes off the exact bug class that shipped three times
// in production (a real, displayed name the matching logic silently
// rejected because no alias row for it existed).
//
// Comparison is on collapseToAlnum() (letters/digits only, see
// normalize.ts) for the same reason as before: it sidesteps which
// punctuation mark joins two words in a name ("Paris Saint-Germain", "Oleg
// Salenko & Hristo Stoichkov") without needing to special-case each one.
export async function matchGuess(
	db: D1Database,
	categoryId: number,
	normalizedGuess: string,
	foundRanks: number[] = [],
): Promise<AnswerMatchRow | null> {
	const collapsedGuess = collapseToAlnum(normalizedGuess);
	if (!collapsedGuess) return null;

	const result = await db
		.prepare(
			`SELECT ca.entity_id, ca.rank, e.canonical_name, ca.display_value AS stat_value, al.alias
			 FROM category_answers ca
			 JOIN entities e ON e.id = ca.entity_id
			 LEFT JOIN entity_aliases al ON al.entity_id = e.id
			 WHERE ca.category_id = ?`,
		)
		.bind(categoryId)
		.all<AnswerMatchRow & { alias: string | null }>();

	// A category tops out around 10 answers with a handful of aliases each —
	// tens of rows, not worth filtering in SQL. Group by RANK, not entity —
	// `category_answers` is UNIQUE(category_id, rank), so rank is already the
	// right per-row key; a "one row per occurrence" category (see below)
	// deliberately has the SAME entity_id at two different ranks, and
	// grouping by entity_id instead would collapse those two occurrences
	// into one candidate, permanently losing the second one (caught by
	// playtest against wc-recent-golden-boot's repeat winner). Each rank is
	// tested once against its entity's name + every alias, not once per
	// alias row.
	const byRank = new Map<number, AnswerMatchRow & { matchStrings: string[] }>();
	for (const row of result.results ?? []) {
		let entry = byRank.get(row.rank);
		if (!entry) {
			entry = { ...row, matchStrings: [row.canonical_name] };
			byRank.set(row.rank, entry);
		}
		if (row.alias) entry.matchStrings.push(row.alias);
	}

	const candidates = [...byRank.values()].filter((entry) =>
		entry.matchStrings.some((s) => collapseToAlnum(s) === collapsedGuess),
	);
	if (candidates.length === 0) return null;

	// A handful of categories are "one row per occurrence" rather than "one
	// row per entity" — e.g. a World Cup Golden Boot winner who won it in
	// two different tournaments gets two category_answers rows for the same
	// entity, one per rank. Preferring a not-yet-found rank (falling back to
	// an already-found one, so guess.ts's existing "duplicate" handling
	// still applies once every occurrence is found) means each repeat guess
	// of the name advances a different occurrence, rather than always
	// resolving to the same one and permanently capping that category below
	// 100%.
	candidates.sort((a, b) => {
		const aFound = foundRanks.includes(a.rank) ? 1 : 0;
		const bFound = foundRanks.includes(b.rank) ? 1 : 0;
		return aFound - bFound || a.rank - b.rank;
	});
	return candidates[0];
}

interface FullAnswerRow {
	rank: number;
	canonical_name: string;
	stat_value: string;
}

export async function getAllAnswers(
	db: D1Database,
	categoryId: number,
): Promise<FullAnswerRow[]> {
	const result = await db
		.prepare(
			`SELECT ca.rank, e.canonical_name, ca.display_value AS stat_value
			 FROM category_answers ca
			 JOIN entities e ON e.id = ca.entity_id
			 WHERE ca.category_id = ? ORDER BY ca.rank ASC`,
		)
		.bind(categoryId)
		.all<FullAnswerRow>();
	return result.results ?? [];
}

// Typeahead suggestions for the guess box. Deliberately searches across every
// entity, not just the current category's own answers — scoping it to the
// current category would turn "which names autocomplete" into a list of the
// correct answers. This only helps with spelling, not with cheating.
//
// Every entity is fair game (there's no separate "reference pool" table any
// more — see schema.sql): the distinction the old two-table version drew
// between "a correct answer somewhere" and "typeahead-only" is now just a
// tier computed via EXISTS against category_answers, not a different source
// table. That keeps the actual answer set bounded (Top N, via category_defs)
// while letting players type/select any real name, right or wrong.
//
// Both entity_search (tokenized match) and entity_aliases (curated
// nicknames not derivable from tokenizing the name — "psg", "vvd") are
// filtered to `entityType` (the *playing* category's own entity_type) so a
// player-guessing category never suggests a club name and vice versa.
//
// Ranked: an entity that's a real answer in ANY category first, then
// entities sharing this category's scope (e.g. `entities.scope = 'Spain'`
// for a La Liga table — see categories.reference_scope), then everything
// else, then by name length within a tier — a name that's a real answer
// somewhere is definitionally notable, so it wins the tiebreak regardless of
// how short an unrelated reference-only name is (see git history around
// 2026-08-26 for why: without this, short obscure names buried real
// answers, e.g. "Ronald Matarrita" ahead of "Cristiano Ronaldo").
export interface SuggestResult {
	names: string[];
	// True when more rows matched than `limit` allowed through — i.e. the
	// list below was cut short, not exhaustive. Detected by asking for one
	// extra row (`limit + 1`) and slicing it back off rather than a separate
	// COUNT(*) query, so this stays a single round trip.
	truncated: boolean;
}

export async function suggestNames(
	db: D1Database,
	normalizedPrefix: string,
	entityType: string,
	limit: number,
	scope: string | null,
): Promise<SuggestResult> {
	const ftsQuery = toFtsPrefixQuery(normalizedPrefix);
	if (!ftsQuery) return { names: [], truncated: false };

	const result = await db
		.prepare(
			`SELECT name FROM (
				SELECT name, MIN(priority) AS priority
				FROM (
					-- Tokenized full-text match against every entity's canonical
					-- name: any word of the name, not just its start.
					SELECT es.name,
					       CASE
					           WHEN EXISTS (SELECT 1 FROM category_answers WHERE entity_id = es.entity_id) THEN 0
					           WHEN ?4 IS NOT NULL AND e.scope = ?4 THEN 1
					           ELSE 2
					       END AS priority
					FROM entity_search es
					JOIN entities e ON e.id = es.entity_id
					WHERE es.entity_search MATCH ?1 AND es.entity_type = ?2
					UNION ALL
					-- Curated nickname aliases — not derivable by tokenizing the
					-- canonical name itself, so these still need a curated row.
					SELECT e.canonical_name AS name,
					       CASE
					           WHEN EXISTS (SELECT 1 FROM category_answers WHERE entity_id = e.id) THEN 0
					           WHEN ?4 IS NOT NULL AND e.scope = ?4 THEN 1
					           ELSE 2
					       END AS priority
					FROM entity_aliases al
					JOIN entities e ON al.entity_id = e.id
					WHERE al.alias LIKE ?3 || '%' AND e.entity_type = ?2
				 )
				 GROUP BY name
			 )
			 ORDER BY priority ASC, LENGTH(name) ASC, name ASC
			 LIMIT ?5`,
		)
		.bind(ftsQuery, entityType, normalizedPrefix, scope, limit + 1)
		.all<{ name: string }>();
	const names = (result.results ?? []).map((r) => r.name);
	const truncated = names.length > limit;
	return { names: truncated ? names.slice(0, limit) : names, truncated };
}

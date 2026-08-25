import type { CategoryPublic } from "./types";

interface CategoryRow {
	id: number;
	slug: string;
	title: string;
	subtitle: string | null;
	stat_label: string;
}

interface CategoryRowWithCount extends CategoryRow {
	answer_count: number;
}

// The full category library, in a stable order — every category is playable
// any time (no per-day gating), so this is what powers the "pick a category"
// list on the client.
export async function getAllCategories(
	db: D1Database,
): Promise<CategoryRowWithCount[]> {
	const result = await db
		.prepare(
			`SELECT c.id, c.slug, c.title, c.subtitle, c.stat_label,
			        COUNT(a.id) as answer_count
			 FROM categories c
			 LEFT JOIN answers a ON a.category_id = c.id
			 GROUP BY c.id
			 ORDER BY c.id ASC`,
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
			`SELECT id, slug, title, subtitle, stat_label
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
		.prepare(`SELECT COUNT(*) as count FROM answers WHERE category_id = ?`)
		.bind(categoryId)
		.first<{ count: number }>();
	return row?.count ?? 0;
}

export function toPublic(
	row: CategoryRow,
	answerCount: number,
): CategoryPublic {
	return {
		slug: row.slug,
		title: row.title,
		subtitle: row.subtitle,
		statLabel: row.stat_label,
		answerCount,
	};
}

interface AnswerMatchRow {
	id: number;
	rank: number;
	canonical_name: string;
	stat_value: string;
}

// Server-authoritative guess check: normalize the guess and look it up
// against both canonical names and aliases for this category. Answers are
// never sent to the client, so this is the only place a guess can be
// validated.
export async function matchGuess(
	db: D1Database,
	categoryId: number,
	normalizedGuess: string,
): Promise<AnswerMatchRow | null> {
	// Matching goes through answer_aliases only (never canonical_name directly)
	// because aliases are pre-normalized the same way guesses are; seed data
	// always includes the full normalized name as one of a name's aliases.
	const row = await db
		.prepare(
			`SELECT a.id, a.rank, a.canonical_name, a.stat_value
			 FROM answers a
			 JOIN answer_aliases al ON al.answer_id = a.id
			 WHERE a.category_id = ? AND al.alias = ?
			 LIMIT 1`,
		)
		.bind(categoryId, normalizedGuess)
		.first<AnswerMatchRow>();
	return row ?? null;
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
			`SELECT rank, canonical_name, stat_value FROM answers
			 WHERE category_id = ? ORDER BY rank ASC`,
		)
		.bind(categoryId)
		.all<FullAnswerRow>();
	return result.results ?? [];
}

// Typeahead suggestions for the guess box. Deliberately searches across every
// category's names/aliases, not just the one being played — scoping it to
// the current category would turn "which names autocomplete" into a list of
// the correct answers. This only helps with spelling, not with cheating.
//
// Also unions in `reference_entities` — real names that aren't necessarily a
// correct answer anywhere (e.g. clubs that have never won the category
// they'd be guessed in). That keeps the answer set itself bounded (Top N)
// while letting players type/select any real name, right or wrong. See the
// "Generic rule" section in agents.md.
export async function suggestNames(
	db: D1Database,
	normalizedPrefix: string,
	limit: number,
): Promise<string[]> {
	const result = await db
		.prepare(
			`SELECT name FROM (
				SELECT a.canonical_name AS name
				FROM answer_aliases al
				JOIN answers a ON al.answer_id = a.id
				WHERE al.alias LIKE ?1 || '%'
				UNION
				SELECT re.canonical_name AS name
				FROM reference_entity_aliases rel
				JOIN reference_entities re ON rel.entity_id = re.id
				WHERE rel.alias LIKE ?1 || '%'
			 )
			 ORDER BY LENGTH(name) ASC, name ASC
			 LIMIT ?2`,
		)
		.bind(normalizedPrefix, limit)
		.all<{ name: string }>();
	return (result.results ?? []).map((r) => r.name);
}

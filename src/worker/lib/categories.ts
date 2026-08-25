import type { CategoryPublic } from "./types";
import { toFtsPrefixQuery } from "./normalize";

interface CategoryRow {
	id: number;
	slug: string;
	title: string;
	subtitle: string | null;
	stat_label: string;
	entity_type: string;
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
			`SELECT id, slug, title, subtitle, stat_label, entity_type
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
//
// Both sources are filtered to `entityType` (the *playing* category's own
// entity_type, e.g. 'club' or 'player') so a player-guessing category never
// suggests a club name and vice versa — matching the kind of answer a player
// is actually looking for, without touching which guess is correct.
//
// The main match is `entity_search`, an FTS5 index (see schema.sql) that
// tokenizes every canonical name on word boundaries, so a prefix query finds
// ANY word in the name — "szo" finds "Dominik Szoboszlai" via its second
// word — without a per-name alias row. The alias tables are still unioned in
// on top of that, but only earn their keep for real nicknames that aren't a
// substring of the canonical name at all ("psg", "barca", "vvd") — those
// can't be derived by tokenizing the name, so they still need a curated row.
//
// Ranked "answer" matches first, THEN by name length: `limit` is small (the
// guess box only shows a handful of suggestions), and the reference pool
// (~7,800+ players, most of them not famous — a bulk FIFA-dataset load, see
// agents.md) is far bigger than the actual quiz answers. Sorting by length
// alone let short, obscure reference-pool names bury a real answer — e.g.
// searching "ronal" put "Ronald Matarrita" and "Ronald de la Fuente" ahead
// of "Cristiano Ronaldo", an actual Top-10 answer in three categories,
// pushing him to the edge of the limit. A name that's a real answer
// somewhere is definitionally notable (it's the correct answer to a
// trivia question); one that's only in the reference pool might not be —
// so answers win the tiebreak regardless of name length. `source` already
// distinguishes the two on every entity_search row; the alias branches are
// tagged to match since they draw from the same two tables.
export async function suggestNames(
	db: D1Database,
	normalizedPrefix: string,
	entityType: string,
	limit: number,
): Promise<string[]> {
	const ftsQuery = toFtsPrefixQuery(normalizedPrefix);
	if (!ftsQuery) return [];

	const result = await db
		.prepare(
			`SELECT name FROM (
				SELECT name, MIN(CASE WHEN source = 'answer' THEN 0 ELSE 1 END) AS priority
				FROM (
					-- Tokenized full-text match: any word of the name, not just its start
					SELECT name, source FROM entity_search
					WHERE entity_search MATCH ?1 AND entity_type = ?3
					UNION ALL
					-- Curated nickname aliases (answers)
					SELECT a.canonical_name AS name, 'answer' AS source
					FROM answer_aliases al
					JOIN answers a ON al.answer_id = a.id
					JOIN categories c ON a.category_id = c.id
					WHERE al.alias LIKE ?2 || '%' AND c.entity_type = ?3
					UNION ALL
					-- Curated nickname aliases (reference pool)
					SELECT re.canonical_name AS name, 'reference' AS source
					FROM reference_entity_aliases rel
					JOIN reference_entities re ON rel.entity_id = re.id
					WHERE rel.alias LIKE ?2 || '%' AND re.entity_type = ?3
				 )
				 GROUP BY name
			 )
			 ORDER BY priority ASC, LENGTH(name) ASC, name ASC
			 LIMIT ?4`,
		)
		.bind(ftsQuery, normalizedPrefix, entityType, limit)
		.all<{ name: string }>();
	return (result.results ?? []).map((r) => r.name);
}

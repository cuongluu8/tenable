import type { CategoryPublic } from "./types";
import { toFtsPrefixQuery } from "./normalize";

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
}

// The full category library, grouped for the "pick a category" list on the
// client (see schema.sql's group_label/group_order) — categories stay in id
// order within a group, so adding a new one to an existing group is just an
// UPDATE, never a reshuffle of the others.
export async function getAllCategories(
	db: D1Database,
): Promise<CategoryRowWithCount[]> {
	const result = await db
		.prepare(
			`SELECT c.id, c.slug, c.title, c.subtitle, c.stat_label, c.group_label,
			        COUNT(a.id) as answer_count
			 FROM categories c
			 LEFT JOIN answers a ON a.category_id = c.id
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
	foundRanks: number[] = [],
): Promise<AnswerMatchRow | null> {
	// Matching goes through answer_aliases only (never canonical_name directly)
	// because aliases are pre-normalized the same way guesses are; seed data
	// always includes the full normalized name as one of a name's aliases.
	//
	// The fallback OR clause is a safety net found 2026-08-26: normalize()
	// strips ALL punctuation without ever inserting a space, so any
	// canonical name with a punctuation-joined word boundary — a hyphen
	// ("Paris Saint-Germain" -> "paris saintgermain"), an ampersand
	// ("Oleg Salenko & Hristo Stoichkov" -> "oleg salenko hristo
	// stoichkov", both halves collapsed into one phrase since the spaces
	// around the "&" survive but the "&" itself doesn't) — normalizes a
	// real guess (including one selected verbatim off the typeahead, which
	// is exactly how the PSG case was first reported) to a form that isn't
	// guaranteed to be among that answer's authored aliases unless someone
	// remembered to add that *exact* collapsed spelling by hand. Audited
	// every answer in the database for this on 2026-08-26 and found two
	// real gaps (PSG, Karl-Heinz Rummenigge — both backfilled in seed.sql);
	// this compares both sides with spaces AND the handful of word-joining
	// punctuation marks seen in this data (hyphen, ampersand) stripped
	// entirely, so the same authoring mistake on the next name like this
	// doesn't silently reject a correct guess again. Purely additive (only
	// ever matches more, never less), and scoped to this one category's
	// answers like the exact match already is.
	//
	// A handful of categories are "one row per occurrence" rather than "one
	// row per entity" — e.g. a World Cup Golden Boot winner who won it in
	// two different tournaments gets two answer rows with the same
	// canonical_name/alias, one per rank. Without foundRanks, `LIMIT 1` with
	// no ORDER BY always resolves an ambiguous alias to the same row, so a
	// repeat name's other rank could never be found — permanently capping
	// that category below 100%. Ordering not-yet-found ranks first fixes
	// that (each guess of the name advances a different occurrence) while
	// still falling back to an already-found rank — and so still hitting
	// guess.ts's existing "duplicate" handling — once every occurrence of
	// that name is found. `rank IN ()` is valid SQLite and always false, so
	// this is a no-op for the common case for foundRanks = [].
	const foundList = foundRanks.length > 0 ? foundRanks.map(() => "?").join(",") : "";
	const row = await db
		.prepare(
			`SELECT a.id, a.rank, a.canonical_name, a.stat_value
			 FROM answers a
			 JOIN answer_aliases al ON al.answer_id = a.id
			 WHERE a.category_id = ?
			   AND (
			     al.alias = ?
			     OR REPLACE(REPLACE(REPLACE(al.alias, ' ', ''), '-', ''), '&', '')
			        = REPLACE(REPLACE(REPLACE(?, ' ', ''), '-', ''), '&', '')
			   )
			 ORDER BY (a.rank IN (${foundList})) ASC
			 LIMIT 1`,
		)
		.bind(categoryId, normalizedGuess, normalizedGuess, ...foundRanks)
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
// Ranked "answer" matches first, THEN reference matches that share this
// category's `scope` (e.g. 'Spain' for a La Liga table — see
// categories.reference_scope), THEN everything else, THEN by name length
// within a tier: `limit` is small (the guess box only shows a handful of
// suggestions), and the reference pool (~7,800+ players, most of them not
// famous — a bulk FIFA-dataset load, see agents.md) is far bigger than the
// actual quiz answers. Sorting by length alone let short, obscure
// reference-pool names bury a real answer — e.g. searching "ronal" put
// "Ronald Matarrita" and "Ronald de la Fuente" ahead of "Cristiano Ronaldo",
// an actual Top-10 answer in three categories, pushing him to the edge of
// the limit. A name that's a real answer somewhere is definitionally
// notable (it's the correct answer to a trivia question); one that's only
// in the reference pool might not be — so answers win the tiebreak
// regardless of name length.
//
// The `scope` tier (found 2026-08-26) fixes the same kind of burying one
// level down: playing the La Liga table and typing "re" returned Remo
// (Brazil), Rennes (France), Reading (England) and Recoleta (Argentina)
// ahead of Real Oviedo — an actual 2025-26 La Liga club — purely because
// they're shorter names, with no notion that Real Oviedo is the one
// actually relevant to what's being played. `scope` (nullable — most
// categories, e.g. pan-European or all-time-across-many-countries ones,
// have none and this tier is a no-op for them) lets a same-country
// reference match win that tiebreak without hiding the rest of the world's
// names outright, which would undo the "type any name for spelling help"
// behavior global search was deliberately built for.
export async function suggestNames(
	db: D1Database,
	normalizedPrefix: string,
	entityType: string,
	limit: number,
	scope: string | null,
): Promise<string[]> {
	const ftsQuery = toFtsPrefixQuery(normalizedPrefix);
	if (!ftsQuery) return [];

	const result = await db
		.prepare(
			`SELECT name FROM (
				SELECT name, MIN(priority) AS priority
				FROM (
					-- Tokenized full-text match against answers: any word of the
					-- name, not just its start. Always top-tier.
					SELECT name, 0 AS priority
					FROM entity_search
					WHERE entity_search MATCH ?1 AND entity_type = ?3 AND source = 'answer'
					UNION ALL
					-- Tokenized full-text match against the reference pool, ranked
					-- ahead of the rest of the world when it shares this category's
					-- scope (e.g. reference_entities.category = 'Spain').
					SELECT es.name,
					       CASE WHEN ?5 IS NOT NULL AND re.category = ?5 THEN 1 ELSE 2 END AS priority
					FROM entity_search es
					JOIN reference_entities re ON re.id = es.source_id AND es.source = 'reference'
					WHERE es.entity_search MATCH ?1 AND es.entity_type = ?3
					UNION ALL
					-- Curated nickname aliases (answers)
					SELECT a.canonical_name AS name, 0 AS priority
					FROM answer_aliases al
					JOIN answers a ON al.answer_id = a.id
					JOIN categories c ON a.category_id = c.id
					WHERE al.alias LIKE ?2 || '%' AND c.entity_type = ?3
					UNION ALL
					-- Curated nickname aliases (reference pool)
					SELECT re.canonical_name AS name,
					       CASE WHEN ?5 IS NOT NULL AND re.category = ?5 THEN 1 ELSE 2 END AS priority
					FROM reference_entity_aliases rel
					JOIN reference_entities re ON rel.entity_id = re.id
					WHERE rel.alias LIKE ?2 || '%' AND re.entity_type = ?3
				 )
				 GROUP BY name
			 )
			 ORDER BY priority ASC, LENGTH(name) ASC, name ASC
			 LIMIT ?4`,
		)
		.bind(ftsQuery, normalizedPrefix, entityType, limit, scope)
		.all<{ name: string }>();
	return (result.results ?? []).map((r) => r.name);
}

// Computes category_answers from category_defs + entity_stats — the "run
// the query" step that turns dated entity_stats observations into the
// materialized Top N gameplay actually reads and grades against.
//
// Never call this from a player-facing route. It's driven by the scheduled
// Cron handler (see index.ts's scheduled()) and by the one-time migration
// tooling (scripts/migrate-to-entities.ts). Materializing into a real table,
// rather than computing this live on every request, is deliberate: it keeps
// a round's answer set stable while entity_stats keeps accumulating new
// dated observations underneath it (see schema.sql's category_answers
// comment), and it keeps the read-heavy public routes cheap enough to sit
// behind the Cache API instead of hitting D1 every time.

export interface CategoryDefRow {
	category_id: number;
	stat_key: string;
	scope: string;
	sort_dir: "ASC" | "DESC";
	tiebreak_stat_key: string | null;
	tiebreak_scope: string;
	tiebreak_dir: "ASC" | "DESC";
	limit_n: number;
	target_date: string | null;
}

interface RebuildRow {
	entity_id: number;
	value_numeric: number | null;
	display_value: string;
	as_of_date: string;
	origin_rank: number | null;
}

// The core query, exported as text (not just used inline below) so the
// one-time Node migration script can run the *exact same* logic via the
// wrangler D1 CLI during the answers/reference_entities -> entities
// migration and confirm it reproduces the original hand-curated order —
// one query to keep correct, not two implementations that could drift.
//
// For each (entity, origin_rank) group, takes its most recent dated
// observation (by as_of_date, id as a tiebreak for same-day writes) for the
// requested stat_key/scope, optionally capped at target_date (NULL = always
// the latest known value). Sorts by that value, then an optional secondary
// stat the same way, then origin_rank itself, then entity_id as a
// last-resort deterministic tiebreak so a genuinely-unresolved tie is at
// least stable across rebuilds rather than arbitrary.
//
// Grouping by (entity_id, origin_rank) rather than entity_id alone is
// deliberate, not just a tiebreak detail: origin_rank doubles as occurrence
// identity. A handful of categories are "one row per occurrence" rather
// than "one row per entity" (e.g. a World Cup Golden Boot winner who won it
// twice gets two entity_stats rows for the same entity_id/stat_key, one per
// tournament) — those rows share stat_key/scope but must stay two separate
// results, not collapse into whichever is more recent. Grouping by entity_id
// alone did exactly that (caught during the entities/category_answers
// migration — see git history — wc-recent-golden-boot silently lost an
// occurrence). Two entity_stats rows that really are the same fact
// re-observed over time (a season total ticking up) should share the same
// origin_rank so they collapse correctly; two rows that are genuinely
// different occurrences need distinct origin_rank values so they don't.
export const REBUILD_QUERY_SQL = `
WITH latest AS (
	SELECT es.entity_id, es.value_numeric, es.display_value, es.as_of_date, es.origin_rank,
	       ROW_NUMBER() OVER (PARTITION BY es.entity_id, es.origin_rank ORDER BY es.as_of_date DESC, es.id DESC) AS rn
	FROM entity_stats es
	WHERE es.stat_key = ?1 AND es.scope = ?2
	  AND (?3 IS NULL OR es.as_of_date <= ?3)
),
tiebreak AS (
	SELECT es.entity_id, es.origin_rank, es.value_numeric AS tb_value,
	       ROW_NUMBER() OVER (PARTITION BY es.entity_id, es.origin_rank ORDER BY es.as_of_date DESC, es.id DESC) AS rn
	FROM entity_stats es
	WHERE es.stat_key = ?4 AND es.scope = ?5
	  AND (?3 IS NULL OR es.as_of_date <= ?3)
)
SELECT l.entity_id, l.value_numeric, l.display_value, l.as_of_date, l.origin_rank
FROM latest l
LEFT JOIN tiebreak t ON t.entity_id = l.entity_id AND t.origin_rank IS l.origin_rank AND t.rn = 1
WHERE l.rn = 1
ORDER BY
	CASE WHEN ?6 = 'ASC' THEN l.value_numeric END ASC,
	CASE WHEN ?6 = 'DESC' THEN l.value_numeric END DESC,
	CASE WHEN ?7 = 'ASC' THEN t.tb_value END ASC,
	CASE WHEN ?7 = 'DESC' THEN t.tb_value END DESC,
	l.origin_rank ASC,
	l.entity_id ASC
LIMIT ?8
`;

export async function rebuildCategory(
	db: D1Database,
	def: CategoryDefRow,
): Promise<{ rows: number; asOfDate: string | null }> {
	const result = await db
		.prepare(REBUILD_QUERY_SQL)
		.bind(
			def.stat_key,
			def.scope,
			def.target_date,
			def.tiebreak_stat_key,
			def.tiebreak_scope,
			def.sort_dir,
			def.tiebreak_dir,
			def.limit_n,
		)
		.all<RebuildRow>();

	const rows = result.results ?? [];
	const now = new Date().toISOString();

	await db.batch([
		db.prepare(`DELETE FROM category_answers WHERE category_id = ?`).bind(def.category_id),
		...rows.map((row, i) =>
			db
				.prepare(
					`INSERT INTO category_answers
					 (category_id, rank, entity_id, value_numeric, display_value, as_of_date, computed_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					def.category_id,
					i + 1,
					row.entity_id,
					row.value_numeric,
					row.display_value,
					row.as_of_date,
					now,
				),
		),
	]);

	const asOfDate =
		rows.length > 0
			? rows.reduce((max, r) => (r.as_of_date > max ? r.as_of_date : max), rows[0].as_of_date)
			: null;
	return { rows: rows.length, asOfDate };
}

// Rebuilds every category and bumps content_version once at the end (not
// per-category) — the Cache API layer only needs to know "did anything
// change since this request was cached", not which category changed.
export async function rebuildAll(db: D1Database): Promise<{ categoriesRebuilt: number }> {
	const defs = await db.prepare(`SELECT * FROM category_defs`).all<CategoryDefRow>();
	let count = 0;
	for (const def of defs.results ?? []) {
		await rebuildCategory(db, def);
		count += 1;
	}
	await db
		.prepare(`UPDATE content_version SET version = version + 1, updated_at = ? WHERE id = 1`)
		.bind(new Date().toISOString())
		.run();
	return { categoriesRebuilt: count };
}

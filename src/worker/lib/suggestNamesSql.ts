// Just the one exported SQL string, deliberately kept dependency-free (no
// imports at all) so scripts/verify-query-plans.ts can import it directly
// under Node's native module loader, the same way scripts/verify-category-
// defs.ts already does with rebuild.ts's REBUILD_QUERY_SQL. categories.ts
// itself uses the usual extension-less relative imports (./normalize,
// ./types — the convention across this whole worker codebase), which
// Node's loader can't resolve on its own; splitting this one constant out
// into its own import-free module sidesteps that without changing that
// convention anywhere else just to suit a verify script.
//
// See categories.ts's suggestNames() for how this is actually used
// (db.prepare(SUGGEST_NAMES_SQL).bind(...)) and its own doc for why this
// exact string existing as a single source of truth matters: it silently
// regressed to a bad query plan twice (2026-09-06, 2026-09-08) with no code
// change in between either time, and verify-query-plans.ts's whole point is
// running EXPLAIN QUERY PLAN against the EXACT string this app executes,
// not a hand-copied approximation of it that could itself drift out of
// sync and give false confidence.
export const SUGGEST_NAMES_SQL = `SELECT name FROM (
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
		FROM entity_aliases al INDEXED BY idx_entity_aliases_alias
		JOIN entities e ON al.entity_id = e.id
		WHERE al.alias >= ?3 AND al.alias < ?6 AND e.entity_type = ?2
	 )
	 GROUP BY name
 )
 ORDER BY priority ASC, LENGTH(name) ASC, name ASC
 LIMIT ?5`;

// One shard of the player typeahead index (routes/clubBadges.ts's
// /players/:prefix, 2026-09-15): every player whose canonical name has a
// word starting with the two-character prefix, or a curated alias
// starting with it -- with the aliases, so the browser can filter the
// shard exactly as suggestNames() would filter the whole table, and in
// suggestNames()'s order (answers first, then shorter names) so taking
// the first 20 local hits gives the same list. Placeholders: ?1 fts
// query, ?2 entity type, ?3 prefix, ?4 prefix upper bound (D1 needs them
// contiguous). The id list is a derived table so the plan probes
// `entities` by primary key per matched id rather than scanning every
// player-typed row per shard -- ~400 shards get built per content
// version, and a full scan each would be millions of rows read.
export const PLAYER_INDEX_SHARD_SQL = `SELECT e.canonical_name AS name,
       (SELECT GROUP_CONCAT(alias, char(31)) FROM entity_aliases WHERE entity_id = e.id) AS aliases,
       CASE WHEN EXISTS (SELECT 1 FROM category_answers WHERE entity_id = e.id) THEN 0 ELSE 2 END AS priority
FROM (
	SELECT es.entity_id AS id FROM entity_search es WHERE es.entity_search MATCH ?1 AND es.entity_type = ?2
	UNION
	SELECT al.entity_id AS id FROM entity_aliases al INDEXED BY idx_entity_aliases_alias WHERE al.alias >= ?3 AND al.alias < ?4
) ids
JOIN entities e ON e.id = ids.id
WHERE e.entity_type = ?2
ORDER BY priority ASC, LENGTH(name) ASC, name ASC`;

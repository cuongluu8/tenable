-- One-off migration: fixes entity_search_ai/au/ad (see db/schema.sql's full
-- comment) to delete/replace by rowid instead of the UNINDEXED entity_id
-- column. Rebuilds entity_search from scratch since the fix requires every
-- row's rowid to equal its entities.id, which the existing rows don't
-- reliably have (they were inserted with auto-assigned rowids).
--
-- Safe to run more than once (DROP ... IF EXISTS / CREATE ... IF NOT EXISTS
-- throughout), but each run does one full read of `entities` (~19,364 rows,
-- a one-time cost -- exactly the cost this migration exists to stop paying
-- on every future write instead) to repopulate the table.
--
-- Run against local first, verify, then production:
--   wrangler d1 execute tenable-content --local --file=data/research/migration_fix_entity_search_rowid.sql
--   wrangler d1 execute tenable-content --remote --file=data/research/migration_fix_entity_search_rowid.sql

DROP TRIGGER IF EXISTS entity_search_ai;
DROP TRIGGER IF EXISTS entity_search_au;
DROP TRIGGER IF EXISTS entity_search_ad;
DROP TABLE IF EXISTS entity_search;

CREATE VIRTUAL TABLE entity_search USING fts5(
	name,
	entity_type UNINDEXED,
	entity_id UNINDEXED,
	tokenize = 'unicode61 remove_diacritics 2'
);

INSERT INTO entity_search (rowid, name, entity_type, entity_id)
SELECT id, canonical_name, entity_type, id FROM entities;

CREATE TRIGGER entity_search_ai AFTER INSERT ON entities BEGIN
	INSERT INTO entity_search (rowid, name, entity_type, entity_id)
	VALUES (NEW.id, NEW.canonical_name, NEW.entity_type, NEW.id);
END;

CREATE TRIGGER entity_search_au AFTER UPDATE ON entities BEGIN
	DELETE FROM entity_search WHERE rowid = OLD.id;
	INSERT INTO entity_search (rowid, name, entity_type, entity_id)
	VALUES (NEW.id, NEW.canonical_name, NEW.entity_type, NEW.id);
END;

CREATE TRIGGER entity_search_ad AFTER DELETE ON entities BEGIN
	DELETE FROM entity_search WHERE rowid = OLD.id;
END;

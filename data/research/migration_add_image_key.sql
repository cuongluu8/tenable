-- One-off migration: adds entities.image_key (see db/schema.sql for the
-- full column comment). schema.sql's CREATE TABLE IF NOT EXISTS is a no-op
-- against a database that already has `entities`, so this ALTER has to run
-- separately once against any existing database (local D1 + production).
--
-- Safe to run more than once? NO -- ALTER TABLE ADD COLUMN fails if the
-- column already exists. Check first if unsure:
--   SELECT sql FROM sqlite_master WHERE name = 'entities';
ALTER TABLE entities ADD COLUMN image_key TEXT;

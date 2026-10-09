-- One-off migration (2026-10-09): add transfers.date_precision to a database that predates it.
-- A fresh db/schema.sql install already has the column -- do NOT run this against one.
-- Apply to local D1 first, then production, BEFORE players_batch1_transfers_part2.sql
-- (that file writes the column).
--
-- The 85 existing rows (players 530-547) become 'unverified': their dates were never
-- cross-checked against a second source, so they must not feed a "when did X move" question
-- until someone re-checks them. See the column's comment in db/schema.sql.

ALTER TABLE transfers ADD COLUMN date_precision TEXT NOT NULL DEFAULT 'unverified'
	CHECK (date_precision IN ('day', 'month', 'inconclusive', 'unverified'));

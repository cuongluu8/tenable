-- One-off migration (2026-10-09, same day as v1): allow date_precision = 'year', and clear the
-- 72 rows for players 548-559 so players_batch1_transfers_part2.sql can be re-applied with its
-- corrected labels.
--
-- Why a table rebuild: SQLite cannot change a CHECK constraint in place, and v1 created the
-- column with only ('day','month','inconclusive','unverified').
-- Why the 548-559 rows are not copied: they were applied under a stricter rule that marked 42 of
-- them 'inconclusive'. Re-inserting from the corrected file is simpler and safer than 47
-- hand-written UPDATEs. Nothing references transfers.id, so the new ids do not matter.
--
-- Order, on local D1 first and then production:
--   1. this file
--   2. players_batch1_transfers_part2.sql
--   3. players_batch1_transfers_part3.sql
-- Do NOT run this against a database built from the current db/schema.sql -- it already has the
-- new CHECK, and this would only delete the 548-559 rows.

CREATE TABLE transfers_new (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL REFERENCES entities(id),
	from_club_id INTEGER REFERENCES entities(id),
	to_club_id INTEGER REFERENCES entities(id),
	transfer_date TEXT NOT NULL,
	transfer_type TEXT NOT NULL DEFAULT 'permanent'
		CHECK (transfer_type IN ('permanent', 'loan', 'free', 'undisclosed')),
	fee_eur_value REAL,
	fee_gbp_value REAL,
	display_value TEXT NOT NULL,
	source TEXT NOT NULL,
	verified_at TEXT NOT NULL,
	date_precision TEXT NOT NULL DEFAULT 'unverified'
		CHECK (date_precision IN ('day', 'month', 'year', 'inconclusive', 'unverified'))
);

INSERT INTO transfers_new (id, player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision)
SELECT id, player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision
FROM transfers
WHERE player_id NOT BETWEEN 548 AND 559;

DROP TABLE transfers;
ALTER TABLE transfers_new RENAME TO transfers;

CREATE INDEX IF NOT EXISTS idx_transfers_player ON transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_club ON transfers(from_club_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_club ON transfers(to_club_id);

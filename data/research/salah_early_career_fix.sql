-- Adds Mohamed Salah's two unresolved early clubs (transfers.id=49's
-- from_club_id/to_club_id were both NULL -- "Al-Mokawloon, Basel not
-- found in local club pool", per that row's own display_value) and links
-- them up. This is what let his career badge chain skip straight to
-- Chelsea, and separately (via src/worker/routes/clubBadges.ts's own
-- fix, 2026-09-08) is why transferDatesFor's pointer got permanently
-- stuck on this row -- neither bug's fix required the other, but both
-- trace back to these two clubs never having been resolved.
--
-- Facts verified via web search before writing this (not guessed):
-- El Mokawloon Al Arab SC (Egypt) -> FC Basel (Switzerland), 1 July 2012,
-- permanent, ~€2.5m. Naming matches this DB's existing convention for
-- plain common names (Barcelona, Porto -- no "FC"/"SC" prefix). Fee/exact
-- date deliberately NOT written into the transfers row here -- the
-- existing "not confidently sourced" fee note stands; resolving the club
-- ids is the actual fix this file exists for, not tightening every field
-- on the row.
--
-- 19365/19366 confirmed free in both local and production (both maxed at
-- 19364) before this was written -- explicit ids, not AUTOINCREMENT, so
-- both databases end up with the identical id for the same club.
--
-- Run against local first, verify, then production:
--   wrangler d1 execute tenable-content --local  --file=data/research/salah_early_career_fix.sql
--   wrangler d1 execute tenable-content --remote --file=data/research/salah_early_career_fix.sql

INSERT INTO entities (id, canonical_name, entity_type, scope, image_key) VALUES
	(19365, 'Al Mokawloon', 'club', 'Egypt', NULL),
	(19366, 'Basel', 'club', 'Switzerland', NULL);

UPDATE transfers SET from_club_id = 19365, to_club_id = 19366 WHERE id = 49;

-- transfers.id=50 (Basel -> Chelsea, 2014) had its OWN from_club_id NULL
-- for the same reason (Basel unresolved) -- caught only by re-checking
-- the live API output after applying the above, not planned for upfront.
-- Without this too, that transition still had no matchable row and fell
-- back to no exact date.
UPDATE transfers SET from_club_id = 19366 WHERE id = 50;

-- Was '[189, 228, 189, 239, 194]' (Chelsea, Fiorentina, Chelsea, Roma,
-- Liverpool) -- prepends the two now-resolved early clubs. No extra
-- "return to parent" synthetic step needed here: Al Mokawloon -> Basel
-- and Basel -> Chelsea are both plain permanent moves (that convention is
-- only for a loan's own return, see db/schema.sql's club_sequence
-- comment).
UPDATE club_badge_questions SET club_sequence = '[19365, 19366, 189, 228, 189, 239, 194]' WHERE player_id = 542;

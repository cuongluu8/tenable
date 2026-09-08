-- Resolves the 5 players verify:club-badges flagged with unresolved
-- clubs on their transfers rows (2026-09-08 run, same shape as the
-- Salah fix in salah_early_career_fix.sql). club_badge_questions itself
-- is NOT updated here -- see the regenerate step in agents.md/this
-- session's notes: club_sequence for these players (especially Eto'o,
-- whose chain has three consecutive loans from the same parent, one of
-- them later converted to a permanent deal with the same club) is
-- derived by re-running data/research/build_club_badge_questions.py
-- against local D1 after this file, not hand-written.
--
-- Facts not guessed -- all five are well-documented top-level moves
-- (unlike Salah's more obscure early Egyptian-league step, no web
-- search was needed to confirm these): Haaland's Bryne -> Molde,
-- Lewandowski's Znicz Pruszkow -> Lech Poznan, Modric's Zadar -> Dinamo
-- Zagreb, Drogba's Le Mans and his 2012-13 Shanghai Shenhua spell, and
-- Eto'o's 2011-13 Anzhi Makhachkala spell are all widely reported. Naming
-- matches this DB's existing plain-common-name convention (Basel not "FC
-- Basel", Porto not "FC Porto").
--
-- Next free entity ids confirmed (both DBs maxed at 19366 after Salah's
-- fix) -- explicit, not autoincrement, so local/production match.
--
-- Run against local first, regenerate club_badge_questions, verify, then
-- production (both this file AND the regenerated club_sequence values):
--   wrangler d1 execute tenable-content --local --file=data/research/unresolved_clubs_fix_batch1.sql

INSERT INTO entities (id, canonical_name, entity_type, scope, image_key) VALUES
	(19367, 'Bryne', 'club', 'Norway', NULL),
	(19368, 'Molde', 'club', 'Norway', NULL),
	(19369, 'Znicz Pruszkow', 'club', 'Poland', NULL),
	(19370, 'Lech Poznan', 'club', 'Poland', NULL),
	(19371, 'Zadar', 'club', 'Croatia', NULL),
	(19372, 'Le Mans', 'club', 'France', NULL),
	(19373, 'Shanghai Shenhua', 'club', 'China', NULL),
	(19374, 'Anzhi Makhachkala', 'club', 'Russia', NULL);

-- Haaland: Bryne -> Molde -> Salzburg (id=29 already resolves to Salzburg).
UPDATE transfers SET from_club_id = 19367, to_club_id = 19368 WHERE id = 28;
UPDATE transfers SET from_club_id = 19368 WHERE id = 29;

-- Lewandowski: Znicz Pruszkow -> Lech Poznan -> Dortmund (id=33 already
-- resolves to Dortmund).
UPDATE transfers SET from_club_id = 19369, to_club_id = 19370 WHERE id = 32;
UPDATE transfers SET from_club_id = 19370 WHERE id = 33;

-- Modric: Zadar -> Dinamo Zagreb.
UPDATE transfers SET from_club_id = 19371 WHERE id = 39;

-- Drogba: Le Mans -> Guingamp (id=69), and his separate 2012-13 Shanghai
-- Shenhua spell, referenced from both sides across two different rows
-- (Chelsea -> Shenhua in 2012, Shenhua -> Galatasaray in 2013).
UPDATE transfers SET from_club_id = 19372 WHERE id = 69;
UPDATE transfers SET to_club_id = 19373 WHERE id = 72;
UPDATE transfers SET from_club_id = 19373 WHERE id = 73;

-- Eto'o: his 2011-13 Anzhi Makhachkala spell, same "referenced from both
-- sides across two rows" shape as Drogba's Shenhua above.
UPDATE transfers SET to_club_id = 19374 WHERE id = 82;
UPDATE transfers SET from_club_id = 19374 WHERE id = 83;

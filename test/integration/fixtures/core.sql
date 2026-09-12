-- Small, hand-authored fixture for integration tests -- NOT a slice of the
-- real db/seed.sql. That file is ~7.8MB / 63k statements, and applying it
-- inside a test's isolated D1 (via env.DB.batch()) turned out to hang or
-- crash the test worker at that scale (confirmed by bisection: fine at
-- 30k lines, hangs at 55k, crashes outright at the full 63k) -- a genuine
-- scaling limit in this test tool as of @cloudflare/vitest-plugin 1.1.8,
-- not a bug in the seeding approach itself (see setup.ts). Integration
-- tests don't need production-scale data anyway: a handful of rows
-- exercising each route's actual query shape is both enough and more
-- deterministic than depending on however many real rows currently exist.
--
-- 10 clubs (ids 1-10), 10 players (ids 11-20), 10 club_badge_questions --
-- exactly QUESTIONS_PER_ROUND (clubBadges.ts) so a random /round draw is
-- deterministic (every eligible row gets picked, just in shuffled order),
-- each with a 3-club sequence (>= MIN_CLUBS_FOR_QUESTION).
INSERT INTO entities (id, canonical_name, entity_type, scope) VALUES
	(1, 'Fixture Club A', 'club', 'Fixture Country'),
	(2, 'Fixture Club B', 'club', 'Fixture Country'),
	(3, 'Fixture Club C', 'club', 'Fixture Country'),
	(4, 'Fixture Club D', 'club', 'Fixture Country'),
	(5, 'Fixture Club E', 'club', 'Fixture Country'),
	(6, 'Fixture Club F', 'club', 'Fixture Country'),
	(7, 'Fixture Club G', 'club', 'Fixture Country'),
	(8, 'Fixture Club H', 'club', 'Fixture Country'),
	(9, 'Fixture Club I', 'club', 'Fixture Country'),
	(10, 'Fixture Club J', 'club', 'Fixture Country'),
	(11, 'Fixture Player One', 'player', 'Fixture Country'),
	(12, 'Fixture Player Two', 'player', 'Fixture Country'),
	(13, 'Fixture Player Three', 'player', 'Fixture Country'),
	(14, 'Fixture Player Four', 'player', 'Fixture Country'),
	(15, 'Fixture Player Five', 'player', 'Fixture Country'),
	(16, 'Fixture Player Six', 'player', 'Fixture Country'),
	(17, 'Fixture Player Seven', 'player', 'Fixture Country'),
	(18, 'Fixture Player Eight', 'player', 'Fixture Country'),
	(19, 'Fixture Player Nine', 'player', 'Fixture Country'),
	(20, 'Fixture Player Ten', 'player', 'Fixture Country');

INSERT INTO club_badge_questions (id, player_id, club_sequence, source) VALUES
	(1, 11, '[1,2,3]', 'transfers'),
	(2, 12, '[2,3,4]', 'transfers'),
	(3, 13, '[3,4,5]', 'transfers'),
	(4, 14, '[4,5,6]', 'transfers'),
	(5, 15, '[5,6,7]', 'transfers'),
	(6, 16, '[6,7,8]', 'transfers'),
	(7, 17, '[7,8,9]', 'transfers'),
	(8, 18, '[8,9,10]', 'transfers'),
	(9, 19, '[9,10,1]', 'transfers'),
	(10, 20, '[10,1,2]', 'transfers');

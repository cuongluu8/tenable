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

-- "Who am I? I played with..." -- reuses the same 10 fixture players as
-- club_badge_questions (independent tables, fine to reuse ids); each
-- mystery player's teammate_ids point at three of the others. hints
-- populated for two rows only, on purpose -- teammateQuestions.test.ts
-- covers both the "hints present" and "hints null" (a pre-2026-09-10 row,
-- see teammate_questions' own schema comment) response shapes.
INSERT INTO teammate_questions (id, player_id, teammate_ids, hints, source) VALUES
	(1, 11, '[12,13,14]', '{"clubs":["Fixture Club A","Fixture Club B","Fixture Club C"],"clubImages":[null,null,null],"nationality":"Fixture Country","years":["2019","2020","2021"]}', 'player_career_stats'),
	(2, 12, '[13,14,15]', NULL, 'player_career_stats');

-- One curated content category (a small, pre-materialized Top 3 rather
-- than the app's real Top 10) driving categories.ts/category.ts/guess.ts/
-- giveUp.ts/reveal.ts/reset.ts's tests -- these routes only ever read
-- category_answers (the materialized snapshot), never entity_stats
-- directly, so this alone is enough for them; rebuild.ts's own tests
-- below need a second category with its source data instead.
INSERT INTO categories (id, slug, title, subtitle, stat_label, entity_type, group_label, group_order, reference_scope) VALUES
	(1, 'fixture-top-3', 'Fixture Top 3', 'A tiny fixture category', 'points', 'player', 'Fixture Group', 0, NULL);

INSERT INTO category_answers (category_id, rank, entity_id, value_numeric, display_value, as_of_date, computed_at) VALUES
	(1, 1, 11, 100, '100', '2026-01-01', '2026-01-01T00:00:00.000Z'),
	(1, 2, 12, 90, '90', '2026-01-01', '2026-01-01T00:00:00.000Z'),
	(1, 3, 13, 80, '80', '2026-01-01', '2026-01-01T00:00:00.000Z');

-- A nickname distinct from the canonical name, for suggestNames()/
-- matchGuess() coverage (typeahead + "guess by alias" both go through
-- entity_aliases).
INSERT INTO entity_aliases (entity_id, alias) VALUES (11, 'fp1');

-- Second category, NOT pre-materialized -- category_defs + entity_stats
-- only, so rebuild.test.ts can verify rebuildAll() actually produces the
-- right category_answers rather than reading a snapshot this fixture
-- already handed it.
INSERT INTO categories (id, slug, title, subtitle, stat_label, entity_type, group_label, group_order, reference_scope) VALUES
	(2, 'fixture-rebuild', 'Fixture Rebuild Category', NULL, 'goals', 'player', 'Fixture Group', 0, NULL);

INSERT INTO category_defs (category_id, stat_key, scope, sort_dir, tiebreak_stat_key, tiebreak_scope, tiebreak_dir, limit_n, target_date) VALUES
	(2, 'fixture-goals', 'default', 'DESC', NULL, 'default', 'DESC', 3, NULL);

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, origin_rank, source, verified_at) VALUES
	(11, 'fixture-goals', 'default', 50, '50', '2026-01-01', NULL, 'fixture', '2026-01-01'),
	(12, 'fixture-goals', 'default', 40, '40', '2026-01-01', NULL, 'fixture', '2026-01-01'),
	(13, 'fixture-goals', 'default', 30, '30', '2026-01-01', NULL, 'fixture', '2026-01-01');

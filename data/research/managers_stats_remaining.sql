-- Remaining (not-yet-applied to production) portion of managers_stats.sql
-- Cut at manager_id 19192 through end of file — everything before this
-- (manager_id up to 19191) is already applied to production D1, verified via:
--   SELECT entity_id, stat_key FROM entity_stats WHERE stat_key IN
--     ('manager-status','career-titles-count') ORDER BY entity_id, stat_key;
-- Apply this file ONCE only (no uniqueness constraint on entity_stats — re-running
-- it would duplicate rows). See docs/stats-enrichment.md for the apply commands.

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19192, 'career-titles-count', 'career', 49, '49', '2026-08-31', 'Goal.com', '2026-08-31'),
(19192, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19193, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19194, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19195, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19196, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19197, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19198, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19199, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Olympics.com', '2026-08-31'),
(19200, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19201, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19202, 'career-titles-count', 'career', 25, '25', '2026-08-31', 'Sportpesa Blog', '2026-08-31'),
(19202, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19203, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19204, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19205, 'career-titles-count', 'career', 7, '7', '2026-08-31', 'PTSC.org.uk', '2026-08-31'),
(19207, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19208, 'career-titles-count', 'career', 5, '5', '2026-08-31', 'Wikipedia-derived summary', '2026-08-31'),
(19208, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19209, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19210, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'ESPN', '2026-08-31'),
(19211, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19212, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19213, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19214, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19215, 'career-titles-count', 'career', 14, '14', '2026-08-31', 'FourFourTwo', '2026-08-31'),
(19216, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19218, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Sportbible', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19219, 'career-titles-count', 'career', 36, '36', '2026-08-31', 'Olympics.com', '2026-08-31'),
(19219, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Olympics.com', '2026-08-31'),
(19222, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19223, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19224, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19227, 'career-titles-count', 'career', 14, '14', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19227, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'ESPN', '2026-08-31'),
(19228, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19229, 'career-titles-count', 'career', 2, '2', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19229, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19230, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19232, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19233, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19234, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19235, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19236, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19237, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19238, 'career-titles-count', 'career', 20, '20', '2026-08-31', 'SI.com', '2026-08-31'),
(19238, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'SI.com', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19244, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19246, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19247, 'career-titles-count', 'career', 11, '11', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19247, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'FIFA.com', '2026-08-31'),
(19248, 'career-titles-count', 'career', 3, '3', '2026-08-31', 'Goal.com', '2026-08-31'),
(19248, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19249, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19251, 'career-titles-count', 'career', 6, '6', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19251, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'beIN Sports', '2026-08-31'),
(19252, 'career-titles-count', 'career', 7, '7', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19252, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'US Soccer', '2026-08-31'),
(19253, 'career-titles-count', 'career', 11, '11', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19253, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');
-- Note: Marcelo Gallardo (19254) resigned from River Plate Feb 2026; no clear source states career retirement, so manager-status omitted.

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19255, 'career-titles-count', 'career', 15, '15', '2026-08-31', 'SI.com', '2026-08-31'),
(19255, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19256, 'career-titles-count', 'career', 18, '18', '2026-08-31', 'Bundesliga.com', '2026-08-31'),
(19256, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Bundesliga.com', '2026-08-31'),
(19257, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19258, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19259, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19260, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19261, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19262, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19263, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19264, 'career-titles-count', 'career', 4, '4', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19265, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19266, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19267, 'career-titles-count', 'career', 11, '11', '2026-08-31', 'Bundesliga.com', '2026-08-31'),
(19267, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19268, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19269, 'career-titles-count', 'career', 3, '3', '2026-08-31', 'Goal.com', '2026-08-31'),
(19269, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19270, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19271, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19272, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19273, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19274, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19276, 'career-titles-count', 'career', 10, '10', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19277, 'career-titles-count', 'career', 4, '4', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19278, 'career-titles-count', 'career', 18, '18', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19278, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Sky Sports', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19322, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19323, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19324, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19345, 'career-titles-count', 'career', 35, '35', '2026-08-31', 'News.az', '2026-08-31'),
(19345, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Shakhtar.com', '2026-08-31'),
(19346, 'career-titles-count', 'career', 30, '30', '2026-08-31', 'FourFourTwo (via Footie Central)', '2026-08-31'),
(19346, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19347, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19348, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19349, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'beIN Sports', '2026-08-31'),
(19350, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19351, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31');

INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(19352, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19353, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19354, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19355, 'manager-status', 'career', NULL, 'retired', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19356, 'career-titles-count', 'career', 3, '3', '2026-08-31', 'Wikipedia', '2026-08-31'),
(19356, 'manager-status', 'career', NULL, 'active', '2026-08-31', 'Wikipedia', '2026-08-31');


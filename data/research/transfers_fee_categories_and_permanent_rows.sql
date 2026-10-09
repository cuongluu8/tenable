-- 2026-10-09. Two fixes found by auditing the transfers table against the live game.
-- Applied to production once; every statement is guarded, so repeating it is harmless.
--
-- PART 1: the two transfer-fee categories were last verified 2026-08-27 and missed the last two
-- big deals of the summer 2026 window:
--   - Bradley Barcola, PSG -> Liverpool, 31 Aug 2026: £123m (£106m plus up to £17m add-ons).
--     AP and Al Jazeera both give £123m; Sports Illustrated gives £120m. Rank is the same either way.
--   - Enzo Fernandez, Chelsea -> Manchester City, 1 Sep 2026: £125m, a joint British record with
--     Isak. Sky Sports, Al Jazeera, The Athletic (via theScore) and Sports Illustrated agree.
-- Whole list re-checked against Sports Illustrated (updated 2 Sep 2026) and FootballTransfers
-- (4 Oct 2026); the window is closed, so nothing later can enter.
-- Both categories count add-ons, and the euro list converts pound fees (Isak £125m = €145m).
-- Euro figures: Enzo €146m (Wikipedia's list has €145.8m; FootballTransfers €145m -- he ranks
-- just above Isak either way, by value or by recency). Barcola €143m is £123m at the same rate;
-- a PSG-side report of "€125m plus €20m" would make it €145m. Every pound and dollar figure puts
-- him below Isak, so he is ranked below Isak.
-- origin_rank: 0 pins Enzo's £125m above Isak's (tie, more recent first). The other new rows have
-- no tie and just need an origin_rank no other row of that entity uses. Enzo now appears twice in
-- the Premier League list (2026 and 2023), as two occurrences.
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, origin_rank, source, verified_at)
SELECT 780, 'pl-alltime-transfers', 'default', 125, '125', '2026-10-09', 0, 'Sky Sports/Al Jazeera/Sports Illustrated: Chelsea to Manchester City, 1 Sep 2026', '2026-10-09'
WHERE NOT EXISTS (SELECT 1 FROM entity_stats WHERE entity_id = 780 AND stat_key = 'pl-alltime-transfers' AND origin_rank = 0);
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, origin_rank, source, verified_at)
SELECT 1139, 'pl-alltime-transfers', 'default', 123, '123', '2026-10-09', 11, 'AP/Al Jazeera: PSG to Liverpool, 31 Aug 2026, £106m plus up to £17m add-ons', '2026-10-09'
WHERE NOT EXISTS (SELECT 1 FROM entity_stats WHERE entity_id = 1139 AND stat_key = 'pl-alltime-transfers');
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, origin_rank, source, verified_at)
SELECT 780, 'world-alltime-transfers', 'default', 146, '146', '2026-10-09', 11, 'Wikipedia list (€145.8m)/FootballTransfers (€145m): £125m, Chelsea to Manchester City, 1 Sep 2026', '2026-10-09'
WHERE NOT EXISTS (SELECT 1 FROM entity_stats WHERE entity_id = 780 AND stat_key = 'world-alltime-transfers');
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, origin_rank, source, verified_at)
SELECT 1139, 'world-alltime-transfers', 'default', 143, '143', '2026-10-09', 12, 'AP/Al Jazeera: £123m incl. add-ons, converted at the rate used for Enzo Fernandez; PSG to Liverpool, 31 Aug 2026', '2026-10-09'
WHERE NOT EXISTS (SELECT 1 FROM entity_stats WHERE entity_id = 1139 AND stat_key = 'world-alltime-transfers');

-- Rebuild the two categories' answers (same ordering as REBUILD_QUERY_SQL in rebuild.ts; neither
-- has a tiebreak stat), so the seed export and the game match before the 03:00 UTC cron.
DELETE FROM category_answers WHERE category_id IN (34, 35);
INSERT INTO category_answers (category_id, rank, entity_id, value_numeric, display_value, as_of_date, computed_at)
SELECT 34, ROW_NUMBER() OVER (ORDER BY value_numeric DESC, origin_rank ASC, entity_id ASC), entity_id, value_numeric, display_value, as_of_date, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM (SELECT es.*, ROW_NUMBER() OVER (PARTITION BY entity_id, origin_rank ORDER BY as_of_date DESC, id DESC) AS rn FROM entity_stats es WHERE stat_key = 'world-alltime-transfers' AND scope = 'default')
WHERE rn = 1 ORDER BY value_numeric DESC, origin_rank ASC, entity_id ASC LIMIT 10;
INSERT INTO category_answers (category_id, rank, entity_id, value_numeric, display_value, as_of_date, computed_at)
SELECT 35, ROW_NUMBER() OVER (ORDER BY value_numeric DESC, origin_rank ASC, entity_id ASC), entity_id, value_numeric, display_value, as_of_date, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM (SELECT es.*, ROW_NUMBER() OVER (PARTITION BY entity_id, origin_rank ORDER BY as_of_date DESC, id DESC) AS rn FROM entity_stats es WHERE stat_key = 'pl-alltime-transfers' AND scope = 'default')
WHERE rn = 1 ORDER BY value_numeric DESC, origin_rank ASC, entity_id ASC LIMIT 10;
UPDATE content_version SET version = version + 1, updated_at = strftime('%Y-%m-%d', 'now') WHERE id = 1;

-- PART 2: loans that became permanent but had no second row, so the player's chain jumped clubs.
-- Edinson Cavani (595), Palermo -> Napoli. Neither Wikipedia article dates the purchase; Football
-- Italia puts it in July 2011. Total reported as €17m (en; Goal: €5m loan + €12m), €16m (Blitz
-- Quotidiano: 6 + 10) or €19m (es), so no fee is written.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision)
SELECT 595, 19054, 236, '2011-07-01', 'permanent', NULL, NULL, 'Loan made permanent; obligation reported as €10m-€12m (total €16m-€19m with the loan fee)', 'Football Italia/Goal/Wikipedia (en, es)', '2026-10-09', 'month'
WHERE NOT EXISTS (SELECT 1 FROM transfers WHERE player_id = 595 AND from_club_id = 19054 AND to_club_id = 236 AND transfer_type <> 'loan');
-- Fernando Torres (605), Chelsea -> AC Milan. Both articles: announced 27 December 2014; en adds
-- that it took effect on 5 January 2015. Stored at the announcement so it sorts before the loan
-- to Atletico agreed two days later.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision)
SELECT 605, 189, 235, '2014-12-27', 'undisclosed', NULL, NULL, 'Loan made permanent; announced 27 Dec 2014, effective 5 Jan 2015; terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'
WHERE NOT EXISTS (SELECT 1 FROM transfers WHERE player_id = 605 AND from_club_id = 189 AND to_club_id = 235 AND transfer_type <> 'loan');
-- Bruno Fernandes (686), Udinese -> Sampdoria. Sources agree only on 2017 (Soccerway: 1 July 2017,
-- which is after the stored date of his sale to Sporting). Year precision; the stored month is a
-- placeholder chosen to sort before that sale. Fee €6m (Soccerway) vs €7m (Sky Sport Italia).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision)
SELECT 686, 242, 19053, '2017-01-01', 'permanent', NULL, NULL, 'Obligation to buy exercised; reported as €6m or €7m', 'Soccerway/Sky Sport Italia', '2026-10-09', 'year'
WHERE NOT EXISTS (SELECT 1 FROM transfers WHERE player_id = 686 AND from_club_id = 242 AND to_club_id = 19053 AND transfer_type <> 'loan');
-- Beto (871), Portimonense -> Udinese. July 2022 (Calciodangolo); 2022 (de.wikipedia, Goal).
-- €7m per Calciodangolo and Sky Sport Italia.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision)
SELECT 871, 18994, 242, '2022-07-01', 'permanent', 7000000, 6000000, 'Obligation to buy exercised; €7m (~£6.0m, approx.)', 'Calciodangolo/Sky Sport Italia/Wikipedia (de)', '2026-10-09', 'month'
WHERE NOT EXISTS (SELECT 1 FROM transfers WHERE player_id = 871 AND from_club_id = 18994 AND to_club_id = 242 AND transfer_type <> 'loan');
-- Casemiro (634): no row added. The sources disagree on whether Porto ever bought him: en says
-- Real Madrid paid Porto €7m to cancel Porto's option; pt says Porto chose to pay €15m and Real
-- Madrid then bought him back for €7.5m. The existing 2015 row already says this.

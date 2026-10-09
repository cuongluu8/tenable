-- Date recheck (2026-10-09) -- supersedes the dates in players_batch1_transfers.sql and some
-- rows of players_batch1_transfers_part8.sql. Applied to production once; safe to re-run (every
-- statement is guarded) but there is no reason to.
--
-- PART 1: the 85 rows for players 530-547 (ids 1-85), which had date_precision 'unverified'.
-- Each was compared against the player's English Wikipedia article and, for most, a second
-- article (pt / fr / de / es / nl), then relabelled under the rule in docs/stats-enrichment.md.
-- The original rows came from search-engine summaries of aggregator sites and several were wrong
-- by months; where the two Wikipedia sources agree with each other and not with the old row, the
-- old row loses. Notable corrections:
--   13  Ronaldo -> Corinthians      was 2009-01-01, now 9 Dec 2008 (en and pt agree)
--   22  Neymar -> Barcelona         was 3 June 2013 (his unveiling); signed in late May
--   40  Modric -> Tottenham         stored as the agreement date, 26 Apr 2008; he joined that summer
--   49  Salah -> Basel              was 2012-01-01, now 15 June 2012 (contract start)
--   52  Salah -> Roma               sources give June or 3 Aug 2016; earlier month kept
--   54-56 Mane                      all three were a month or more out
--   59, 61, 62 Kane loans           Leyton Orient was Jan 2011 not Aug; Leicester Feb 2013
--   78  Eto'o -> Mallorca loan      was 1999, now Jan 2000 (en and fr agree)
--   85  Eto'o -> Sampdoria          was Aug 2015, now Jan 2015
-- Fees were NOT rechecked row by row; only four glaring ones are fixed in PART 2.

UPDATE transfers SET transfer_date = '2021-08-10', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 1 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-07-15', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 2 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2003-08-12', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 3 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2009-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 4 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2018-07-10', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 5 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2021-08-27', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 6 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 7 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1994-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 8 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1996-07-17', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 9 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1997-06-20', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 10 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2002-08-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 11 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2007-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 12 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2008-12-09', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 13 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2001-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 14 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2003-07-19', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 15 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2008-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 16 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2011-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 17 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-06-04', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 18 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1992-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 19 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1996-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 20 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2001-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 21 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2013-05-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 22 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2017-08-03', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 23 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-08-15', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 24 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2025-01-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 25 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2017-08-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 26 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2024-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 27 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2017-02-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 28 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2019-01-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 29 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2020-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 30 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2022-07-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 31 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2008-06-18', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 32 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2010-06-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 33 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 34 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2022-07-19', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 35 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2009-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 36 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-06-06', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 37 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2026-01-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 38 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2001-01-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 39 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2008-04-26', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 40 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-08-27', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 41 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2025-07-14', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 42 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-01-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 43 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-01-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 44 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 45 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-01-18', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 46 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2015-08-30', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 47 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2025-06-12', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 48 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-06-15', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 49 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-01-23', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 50 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2015-02-02', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 51 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2016-06-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 52 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2017-07-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 53 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-08-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 54 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-09-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 55 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2016-06-28', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 56 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2022-06-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 57 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-08-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 58 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2011-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 59 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-01-01', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 60 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-08-31', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 61 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2013-02-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 62 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2023-08-12', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 63 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1999-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 64 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1999-08-03', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 65 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2007-06-25', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 66 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2010-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 67 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-01-06', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 68 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2002-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 69 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2003-06-30', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 70 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2004-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 71 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2012-06-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 72 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2013-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 73 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 74 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2015-07-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 75 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1997-08-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 76 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '1999-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 77 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2000-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 78 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2000-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 79 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2004-07-01', date_precision = 'year', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 80 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2009-07-27', date_precision = 'day', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 81 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2011-08-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 82 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2013-08-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 83 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2014-08-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 84 AND date_precision = 'unverified';
UPDATE transfers SET transfer_date = '2015-01-01', date_precision = 'month', verified_at = '2026-10-09', source = source || '; dates rechecked vs Wikipedia' WHERE id = 85 AND date_precision = 'unverified';

-- PART 2: fee corrections where the old figure is contradicted by both Wikipedia sources.
-- Zidane: the old rows had Cannes -> Bordeaux at EUR 7.0m and Bordeaux -> Juventus at EUR 3.5m.
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = '3m francs (about €460,000)', source = 'Wikipedia (en, fr)' WHERE id = 19 AND display_value LIKE '€7.0m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = '35m francs (about €5.3m)', source = 'Wikipedia (en, fr)' WHERE id = 20 AND display_value LIKE '€3.5m%';
-- Benzema -> Al-Hilal: en.wikipedia says a free transfer; the old row had EUR 25m from an aggregator.
UPDATE transfers SET transfer_type = 'undisclosed', fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as a free transfer (en.wikipedia); an earlier aggregator figure of €25m is unconfirmed', source = 'Wikipedia (en, fr)' WHERE id = 38 AND display_value LIKE '€25m%';
-- Eto'o -> Barcelona: EUR 24m in both en and fr Wikipedia; the old row had EUR 27m.
UPDATE transfers SET fee_eur_value = 24000000, fee_gbp_value = 16300000, display_value = '€24m (~£16.3m, approx.)', source = 'Wikipedia (en, fr)' WHERE id = 80 AND display_value LIKE '€27.0m%';

-- PART 3: players 635-650, after reading a second Wikipedia article for each (nl / pt / es / de /
-- da / it / fr; Fabinho's was unreachable, so his rows still rest on one source).
-- Dates:
UPDATE transfers SET transfer_date = '2013-06-01', date_precision = 'month' WHERE player_id = 636 AND to_club_id = 287 AND transfer_date = '2013-06-21';  -- van Dijk -> Celtic: 21 June (en) vs 22 June (nl)
UPDATE transfers SET transfer_date = '2011-07-16', date_precision = 'day' WHERE player_id = 639 AND to_club_id = 189 AND transfer_date = '2011-07-01';   -- Courtois -> Chelsea: 16 July 2011 (nl)
UPDATE transfers SET transfer_date = '2011-07-01', date_precision = 'month' WHERE player_id = 639 AND to_club_id = 205 AND transfer_date = '2011-08-01'; -- Courtois loan: presented 26 July 2011 (nl)
UPDATE transfers SET date_precision = 'month' WHERE player_id = 650 AND to_club_id = 246 AND transfer_date = '1999-07-01' AND date_precision = 'day';       -- Ballack -> Leverkusen: 1 July (en) vs 16 July (de)
UPDATE transfers SET date_precision = 'day', display_value = 'About €6m (12m DM) per two sources, €12.9m per another; announced Dec 2001' WHERE player_id = 650 AND to_club_id = 243 AND transfer_date = '2002-07-01' AND date_precision = 'year'; -- Ballack -> Bayern: effective 1 July 2002 (de)
UPDATE transfers SET transfer_date = '1977-10-01', date_precision = 'month' WHERE player_id = 646 AND to_club_id = 19453 AND transfer_date = '1977-07-01'; -- Banks -> St Patrick's: October 1977 (de)
UPDATE transfers SET date_precision = 'year', display_value = 'Loan' WHERE player_id = 646 AND to_club_id = 19448 AND date_precision = 'inconclusive';        -- Banks -> Cleveland Stokers: 1967 in two of three statements
-- Fees where the second source disagrees:
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as £66.8m / €72.5m (en) or €62.5m (pt)' WHERE player_id = 637 AND to_club_id = 194 AND display_value = '£66.8m (€72.5m)';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as £35m / €38.8m (en) or about €35m (nl)' WHERE player_id = 639 AND to_club_id = 217 AND display_value LIKE 'Believed to be £35m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as about £18.9m (en) or €19m-€23m (es)' WHERE player_id = 641 AND to_club_id = 196 AND display_value LIKE 'About £18.9m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as £7m (en) or €13m (de); agreed Feb 2004' WHERE player_id = 642 AND to_club_id = 189 AND display_value LIKE '£7m (~€10.3m%';
UPDATE transfers SET display_value = '120m-130m lire plus Claudio Bandoni (sources differ; not converted)' WHERE player_id = 648 AND to_club_id = 236 AND display_value LIKE '130m lire%';
-- Record the second source on every 636-650 row.
UPDATE transfers SET source = source || ' + second-language Wikipedia' WHERE player_id BETWEEN 636 AND 650 AND source = 'Wikipedia (en)';

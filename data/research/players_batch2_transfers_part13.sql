-- Research output: transfer history for players 831-845 (Schar to Amadou Onana).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / fr / sv / es / nl) for dates and fees.
-- All of these players are active: history as of 2026-10-09.

-- Fabian Schar (entity_id 831)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(831, NULL, 19366, '2012-07-04', 'undisclosed', NULL, NULL, 'Fee not stated [FC Wil not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(831, 19366, 250, '2015-06-04', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(831, 250, 401, '2017-07-21', 'undisclosed', NULL, NULL, 'Undisclosed; later reported as €3m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(831, 401, 197, '2018-07-26', 'permanent', 3400000, 3000000, '£3m buy-out clause (about €4m per one source)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Kieran Trippier (entity_id 832)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(832, 195, 346, '2010-02-01', 'loan', NULL, NULL, 'One-month loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(832, 195, 346, '2010-08-01', 'loan', NULL, NULL, 'Six-month loan, extended to the end of 2010-11', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(832, 195, 188, '2011-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(832, 195, 188, '2012-01-03', 'undisclosed', NULL, NULL, 'Loan made permanent; undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(832, 188, 200, '2015-06-19', 'permanent', 4800000, 3500000, '£3.5m reported (~€4.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(832, 200, 205, '2019-07-17', 'permanent', 22700000, 20000000, '£20m (~€22.7m, approx.) plus add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(832, 205, 197, '2022-01-07', 'permanent', 14100000, 12000000, '£12m (~€14.1m, approx.) plus add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(832, 197, 202, '2026-06-08', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Dan Burn (entity_id 833)
-- Fulham: agreed 14 April 2011 for the end of that season.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(833, NULL, 192, '2011-07-01', 'permanent', 402000, 350000, 'About £350,000 (~€402,000, approx.); agreed 14 Apr 2011 [Darlington not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(833, 192, NULL, '2012-09-25', 'loan', NULL, NULL, 'Youth loan, later extended [Yeovil Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(833, 192, 318, '2013-07-03', 'loan', NULL, NULL, 'Season-long loan (recalled 2 Jan 2014)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(833, 192, 364, '2016-07-01', 'free', NULL, NULL, 'Free transfer (Fulham contract expired)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(833, 364, 187, '2018-08-09', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(833, 187, 364, '2018-08-09', 'loan', NULL, NULL, 'Loaned back until January 2019', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(833, 187, 197, '2022-01-31', 'permanent', 15300000, 13000000, '£13m agreed (~€15.3m, approx.); officially undisclosed', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Tino Livramento (entity_id 834)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(834, 189, 306, '2021-08-01', 'undisclosed', NULL, NULL, 'Fee not stated (buy-back and sell-on clauses reported)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(834, 306, 197, '2023-08-08', 'permanent', 36800000, 32000000, 'Undisclosed; reported as £32m (~€36.8m, approx.) plus £8m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Nick Woltemade (entity_id 835)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(835, 255, NULL, '2022-08-01', 'loan', NULL, NULL, 'One-year loan [SV Elversberg not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(835, 255, 247, '2024-07-01', 'free', NULL, NULL, 'Free transfer (announced May 2024)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(835, 247, 197, '2025-08-30', 'permanent', 75000000, 63000000, '€75m initial reported (~£63m, approx.) plus €5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(835, 197, 232, '2026-09-01', 'loan', NULL, NULL, 'Loan (£3.5m fee)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Yoane Wissa (entity_id 836)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(836, 19137, 274, '2016-06-27', 'undisclosed', NULL, NULL, 'First professional contract; fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(836, 274, NULL, '2017-01-01', 'loan', NULL, NULL, 'Six-month loan [Laval not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(836, 274, 19131, '2017-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(836, 274, 277, '2018-01-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(836, 277, 186, '2021-08-10', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £8.5m', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(836, 186, 197, '2025-09-01', 'permanent', 59500000, 50000000, '£50m (~€59.5m, approx.) plus add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Anthony Elanga (entity_id 837)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(837, 196, 198, '2023-07-25', 'permanent', 17200000, 15000000, '£15m reported (~€17.2m, approx.)', 'Wikipedia (en, sv)', '2026-10-09', 'day'),
(837, 198, 197, '2025-07-11', 'permanent', 65500000, 55000000, '£55m reported (~€65.5m, approx.)', 'Wikipedia (en, sv)', '2026-10-09', 'day');

-- Malick Thiaw (entity_id 838)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(838, 19057, 235, '2022-08-29', 'permanent', 5000000, 4250000, 'Believed to be €5m (~£4.3m, approx.) plus €2m in bonuses', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(838, 235, 197, '2025-08-12', 'permanent', 35000000, 30000000, 'Estimated £30m (€35m) plus £4.3m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Emiliano Martinez (entity_id 839)
-- Wolves loan: 11 August 2015 (en) vs 2 August (es). Chelsea fee: £7.5m (en) vs €7.5m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(839, 183, 367, '2012-05-01', 'loan', NULL, NULL, 'Emergency loan', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(839, 183, 309, '2013-10-15', 'loan', NULL, NULL, 'Emergency loan, extended to the end of the season', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(839, 183, 359, '2015-03-20', 'loan', NULL, NULL, 'Emergency loan until the end of the season', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(839, 183, 202, '2015-08-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(839, 183, 210, '2017-08-02', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(839, 183, 344, '2019-01-23', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(839, 183, 184, '2020-09-16', 'permanent', 22500000, 20000000, 'Up to £20m (~€22.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(839, 184, 189, '2026-08-30', 'permanent', NULL, NULL, 'Reported as £7.5m (en) or €7.5m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Ollie Watkins (entity_id 840)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(840, 351, NULL, '2014-12-08', 'loan', NULL, NULL, 'One-month loan, later extended [Weston-super-Mare not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(840, 351, 186, '2017-07-18', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £1.8m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(840, 186, 184, '2020-09-09', 'permanent', 31500000, 28000000, '£28m (~€31.5m, approx.), rising to £33m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(840, 184, 328, '2026-08-30', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about £51m', 'Wikipedia (en)', '2026-10-09', 'day');

-- Morgan Rogers (entity_id 841)
-- Exact dates are from en.wikipedia; de.wikipedia confirms each move by year.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(841, 317, 195, '2019-08-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 195, 353, '2021-01-04', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 195, 185, '2021-08-23', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 195, 347, '2023-01-04', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 195, 312, '2023-07-07', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 312, 184, '2024-02-01', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £8m, rising to £15m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(841, 184, 189, '2026-07-21', 'permanent', 139300000, 117000000, '£117m (~€139.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Youri Tielemans (entity_id 842)
-- Leicester permanent fee: estimated £32m (en) vs about €45m (nl).
-- Aston Villa: announced 10 June 2023, joined 1 July when his Leicester contract expired.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(842, 293, 264, '2017-05-24', 'permanent', 25000000, 22000000, 'About €25m (~£22m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(842, 264, 305, '2019-01-31', 'loan', NULL, NULL, 'Loan until the end of the season (Adrien Silva went the other way)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(842, 264, 305, '2019-07-08', 'permanent', NULL, NULL, 'Reported as about £32m (en) or about €45m (nl)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(842, 305, 184, '2023-07-01', 'free', NULL, NULL, 'Free transfer (announced 10 June 2023)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(842, 184, 196, '2026-07-14', 'permanent', 41700000, 35000000, '£35m release clause (~€41.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- John McGinn (entity_id 843)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(843, 400, 395, '2015-07-31', 'undisclosed', NULL, NULL, 'Undisclosed development fee plus 30% of a future sale', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(843, 395, 184, '2018-08-08', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Boubacar Kamara (entity_id 844)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(844, 262, 184, '2022-05-23', 'free', NULL, NULL, 'Free transfer (Marseille contract ending)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Amadou Onana (entity_id 845)
-- Hamburg: first professional contract signed January 2020, joined that summer.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(845, 250, 260, '2020-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (from Hoffenheim''s reserves)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(845, 260, 265, '2021-08-05', 'permanent', 9000000, 7700000, 'About €9m per one source (~£7.7m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(845, 265, 191, '2022-08-09', 'permanent', 38800000, 33000000, '£33m reported including add-ons (~€38.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(845, 191, 184, '2024-07-22', 'permanent', 58800000, 50000000, '£50m reported (~€58.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

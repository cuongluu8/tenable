-- Research output: transfer history for players 846-860 (Konsa to Guehi).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / es / pl / fr / nl / pt) for dates and fees.
-- All of these players are active: history as of 2026-10-09.

-- Ezri Konsa (entity_id 846)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(846, 366, 186, '2018-06-12', 'permanent', 2840000, 2500000, 'Undisclosed; reported as £2.5m (~€2.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(846, 186, 184, '2019-07-11', 'permanent', 13600000, 12000000, '£12m (~€13.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(846, 184, 183, '2026-08-21', 'undisclosed', NULL, NULL, 'Undisclosed; believed to be about £51m', 'Wikipedia (en)', '2026-10-09', 'day');

-- Pau Torres (entity_id 847)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(847, 222, 402, '2018-08-06', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(847, 222, 184, '2023-07-12', 'permanent', 36200000, 31500000, '£31.5m reported (~€36.2m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Matty Cash (entity_id 848)
-- Not written: how he joined Nottingham Forest. en.wikipedia gives only a contract dated 5 August 2016;
-- pl.wikipedia says he arrived in October 2014.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(848, 198, NULL, '2016-03-04', 'loan', NULL, NULL, 'One-month loan [Dagenham & Redbridge not in local club pool]', 'Wikipedia (en, pl)', '2026-10-09', 'day'),
(848, 198, 184, '2020-09-03', 'permanent', 15700000, 14000000, '£14m reported (~€15.7m, approx.), rising to £16m', 'Wikipedia (en, pl)', '2026-10-09', 'day');

-- Lucas Digne (entity_id 849)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(849, 265, 261, '2013-07-17', 'permanent', 15000000, 12800000, 'Believed to be about €15m (~£12.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(849, 261, 239, '2015-08-26', 'loan', NULL, NULL, 'Season-long loan (€2.5m fee) with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(849, 261, 206, '2016-07-13', 'permanent', 16500000, 13800000, '€16.5m (£13.8m), rising to €20.5m', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(849, 206, 191, '2018-08-01', 'permanent', 20500000, 18000000, '£18m initial (~€20.5m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(849, 191, 184, '2022-01-13', 'permanent', 30000000, 25000000, '£25m (about €30m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(849, 184, 261, '2026-08-09', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'day');

-- Emiliano Buendia (entity_id 850)
-- Norwich: 8 June 2018 (en) vs July 2018 (es); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(850, 210, NULL, '2017-07-27', 'loan', NULL, NULL, 'One-year loan [Cultural Leonesa not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(850, 210, 310, '2018-06-01', 'undisclosed', NULL, NULL, 'Fee not stated (four-year deal)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(850, 310, 184, '2021-06-10', 'permanent', 38400000, 33000000, 'About £33m (~€38.4m, approx.), rising to £38m with bonuses', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(850, 184, 246, '2025-01-29', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Donyell Malen (entity_id 851)
-- Aston Villa: 13 January 2025 (en) vs 14 January (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(851, 183, 284, '2017-08-31', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(851, 284, 244, '2021-07-27', 'permanent', 30000000, 25800000, '€30m per one source (~£25.8m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(851, 244, 184, '2025-01-01', 'permanent', 25000000, 21000000, 'Undisclosed; reported as £21m (€25m) plus add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(851, 184, 239, '2026-01-16', 'loan', NULL, NULL, 'Loan (about €2m fee) with a €25m obligation to buy', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(851, 184, 239, '2026-05-25', 'permanent', 25000000, 21000000, '€25m (~£21m, approx.); obligation to buy triggered', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Evann Guessand (entity_id 852)
-- Nantes loan: 12 July 2022 (en) vs 9 July (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(852, 266, NULL, '2020-09-30', 'loan', NULL, NULL, 'Loan [Lausanne-Sport not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(852, 266, 271, '2022-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(852, 266, 184, '2025-08-08', 'permanent', 35000000, 30500000, 'Undisclosed; reported as €35m (£30.5m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(852, 184, 190, '2026-01-30', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(852, 184, 190, '2026-08-12', 'loan', NULL, NULL, 'Season-long loan with a conditional obligation to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Leon Bailey (entity_id 853)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(853, NULL, 18996, '2015-08-01', 'undisclosed', NULL, NULL, 'Fee not stated [Trencin not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(853, 18996, 246, '2017-01-31', 'permanent', 20000000, 17600000, '€20m (~£17.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(853, 246, 184, '2021-08-04', 'permanent', 34900000, 30000000, 'About £30m (~€34.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(853, 184, 239, '2025-08-20', 'loan', NULL, NULL, 'Loan with option to buy (recalled 20 Jan 2026)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(853, 184, 297, '2026-09-02', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jarrod Bowen (entity_id 854)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(854, NULL, 322, '2014-07-08', 'free', NULL, NULL, 'Free transfer [Hereford United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(854, 322, 201, '2020-01-31', 'permanent', 24700000, 22000000, 'About £22m reported (~€24.7m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Lucas Paqueta (entity_id 855)
-- Milan: agreed 10 October 2018, joined 4 January 2019.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(855, 31, 235, '2019-01-04', 'permanent', 35000000, 30800000, '€35m (~£30.8m, approx.); agreed 10 Oct 2018', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(855, 235, 263, '2020-09-30', 'permanent', 20000000, 17800000, '€20m (~£17.8m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(855, 263, 201, '2022-08-29', 'permanent', NULL, NULL, 'Club record, undisclosed; reported as more than £50m with add-ons, or €60m', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(855, 201, 31, '2026-01-28', 'permanent', 41000000, 35500000, '£35.5m (€41m) reported', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- James Ward-Prowse (entity_id 856)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(856, 306, 201, '2023-08-14', 'permanent', 34500000, 30000000, '£30m reported (~€34.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(856, 201, 198, '2024-08-30', 'loan', NULL, NULL, 'Season-long loan (terminated 3 Feb 2025)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(856, 201, 188, '2026-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(856, 201, 306, '2026-08-28', 'undisclosed', NULL, NULL, 'Two-year contract; fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Niclas Fullkrug (entity_id 857)
-- Werder 2019: announced April 2019 for the 2019-20 season; fee €6.3m or €7m depending on the report.
-- West Ham fee: £27m (en) vs about €27m (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(857, 255, 19115, '2013-08-24', 'loan', NULL, NULL, 'One-year loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(857, 255, 19060, '2014-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(857, 19060, 19111, '2016-07-01', 'permanent', 2000000, 1640000, '€2m reported (~£1.6m, approx.) plus bonuses', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(857, 19111, 255, '2019-07-01', 'permanent', NULL, NULL, 'Reported as €6.3m-€7m; announced April 2019', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(857, 255, 244, '2023-08-31', 'permanent', 13000000, 11300000, '€13m reported (~£11.3m, approx.) plus €2m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(857, 244, 201, '2024-08-05', 'permanent', NULL, NULL, 'Reported as £27m (en) or about €27m (de)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(857, 201, 235, '2026-01-02', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(857, 201, 255, '2026-08-18', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Max Kilman (entity_id 858)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(858, NULL, 378, '2015-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Welling United not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(858, 378, NULL, '2016-07-01', 'loan', NULL, NULL, 'Loan [Marlow not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(858, 378, 202, '2018-08-01', 'undisclosed', NULL, NULL, 'Undisclosed fee (transfer deadline day)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(858, 202, 201, '2024-07-06', 'permanent', 47100000, 40000000, '£40m reported (~€47.1m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jean-Philippe Mateta (entity_id 859)
-- Mainz: 29 June 2018 (en) vs 28 June (fr); fee from fr.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(859, 19137, 263, '2016-09-15', 'permanent', 2000000, 1640000, '€2m (~£1.6m, approx.) plus up to €3m in bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(859, 263, 275, '2017-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(859, 263, 252, '2018-06-01', 'permanent', NULL, NULL, '€8m per one source', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(859, 252, 190, '2021-01-21', 'loan', NULL, NULL, '18-month loan (reported €3m fee, €15m option to buy)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(859, 252, 190, '2022-01-31', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Marc Guehi (entity_id 860)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(860, 189, 321, '2020-01-10', 'loan', NULL, NULL, 'Loan for the rest of 2019-20', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(860, 189, 321, '2020-08-26', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(860, 189, 190, '2021-07-18', 'permanent', 20900000, 18000000, '£18m reported (~€20.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(860, 190, 195, '2026-01-19', 'permanent', 23800000, 20000000, '£20m reported (~€23.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

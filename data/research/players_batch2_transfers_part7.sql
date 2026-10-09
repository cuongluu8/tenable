-- Research output: transfer history for players 741-755 (Harvey Elliott to Matheus Nunes).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / es / pt / nl / fr) for dates and fees.
-- All of these players are active: history as of 2026-10-09.

-- Harvey Elliott (entity_id 741)
-- Aston Villa loan: 1 September 2025 (en); the club announcement de.wikipedia cites is dated 2 September.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(741, 192, 194, '2019-07-28', 'undisclosed', NULL, NULL, 'Undisclosed; a tribunal later set £1.5m plus £2.8m in bonuses', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(741, 194, 313, '2020-10-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(741, 194, 184, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan with a conditional £35m obligation to buy', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(741, 194, 221, '2026-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Caoimhin Kelleher (entity_id 742)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(742, 194, 186, '2025-06-03', 'permanent', 14900000, 12500000, 'Undisclosed; reported as £12.5m (~€14.9m, approx.), rising to £18m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Rodri (entity_id 743)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(743, 222, 205, '2018-05-24', 'permanent', 20000000, 17600000, 'About €20m (~£17.6m, approx.) plus €5m in variables', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(743, 205, 195, '2019-07-03', 'permanent', 70000000, 62600000, '€70m release clause (£62.6m)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(743, 195, 206, '2026-08-18', 'permanent', 60000000, 50400000, '€60m fixed (~£50.4m, approx.) plus €16.5m in add-ons, reported', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Bernardo Silva (entity_id 744)
-- Manchester City: confirmed 26 May 2017, joined 1 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(744, 280, 264, '2014-08-07', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(744, 280, 264, '2015-01-20', 'permanent', 15750000, 11500000, '€15.75m (~£11.5m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(744, 264, 195, '2017-07-01', 'permanent', 50000000, 43500000, 'Undisclosed; reported as about £43.5m (€48m-€50m); confirmed 26 May 2017', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(744, 195, 217, '2026-06-17', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Ruben Dias (entity_id 745)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(745, 280, 195, '2020-09-29', 'permanent', 68000000, 61640000, '€68m (£61.6m), with Nicolas Otamendi moving the other way for €15m', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Josko Gvardiol (entity_id 746)
-- Leipzig: agreed 28 September 2020; he stayed at Dinamo Zagreb on loan and joined in July 2021.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(746, 245, 300, '2020-09-28', 'loan', NULL, NULL, 'Loaned back for 2020-21 as part of the Leipzig deal', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(746, 300, 245, '2021-07-01', 'permanent', 16000000, 13800000, '€16m (~£13.8m, approx.) plus add-ons; agreed 28 Sept 2020', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(746, 245, 195, '2023-08-05', 'permanent', 90000000, 77000000, 'Undisclosed; reported as about £77m (€90m)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- John Stones (entity_id 747)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(747, 346, 191, '2013-01-31', 'permanent', 3500000, 3000000, 'About £3m (~€3.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(747, 191, 195, '2016-08-09', 'permanent', 55000000, 47500000, '£47.5m (about €55m) plus £2.5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(747, 195, 231, '2026-07-30', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Nathan Ake (entity_id 748)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(748, 189, 344, '2015-03-25', 'loan', NULL, NULL, 'One-month loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(748, 189, 311, '2015-08-14', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(748, 189, 185, '2016-06-29', 'loan', NULL, NULL, 'Season-long loan (recalled 8 Jan 2017)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(748, 189, 185, '2017-06-30', 'permanent', 22700000, 20000000, '£20m (about €22.7m), club record', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(748, 185, 195, '2020-08-05', 'permanent', 45000000, 41000000, '£41m (€45m)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(748, 195, 290, '2026-07-03', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Jack Grealish (entity_id 749)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(749, 184, 379, '2013-09-13', 'loan', NULL, NULL, 'Youth loan, later extended to the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(749, 184, 195, '2021-08-05', 'permanent', 118000000, 100000000, '£100m (about €118m)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(749, 195, 191, '2025-08-12', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(749, 195, 191, '2026-09-01', 'loan', NULL, NULL, 'Second season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Savinho (entity_id 750)
-- Troyes held his registration within City Football Group until he joined Manchester City.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(750, 38, 19128, '2022-06-30', 'permanent', 6500000, 5500000, '€6.5m (~£5.5m, approx.) plus €6m in variables', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(750, 19128, 284, '2022-07-22', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(750, 19128, 211, '2023-07-13', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(750, 19128, 195, '2024-07-18', 'permanent', 36200000, 30800000, '£30.8m reported (~€36.2m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(750, 195, 200, '2026-08-25', 'permanent', 89300000, 75000000, '£75m reported (~€89.3m, approx.), £85m with add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Jeremy Doku (entity_id 751)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(751, 293, 268, '2020-10-05', 'permanent', NULL, NULL, 'Reported as €26m-€27m plus bonuses (sources differ)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(751, 268, 195, '2023-08-24', 'permanent', 65000000, 55000000, '£55m (€65m)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Rayan Cherki (entity_id 752)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(752, 263, 195, '2025-06-10', 'permanent', 36500000, 30700000, '€36.5m reported (~£30.7m, approx.) plus €6m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Tijjani Reijnders (entity_id 753)
-- Milan: 19 July 2023 (en) vs 29 July (nl). Manchester City: 11 June 2025 (en) vs 10 June (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(753, 18982, 286, '2017-08-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(753, 286, 18979, '2020-01-01', 'loan', NULL, NULL, 'Six-month loan', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(753, 286, 235, '2023-07-01', 'permanent', NULL, NULL, 'More than €20m per one source', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(753, 235, 195, '2025-06-01', 'permanent', 55000000, 46500000, '£46.5m reported (€55m)', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(753, 195, NULL, '2026-08-19', 'permanent', 61900000, 52000000, '£52m reported (~€61.9m, approx.) [Al-Qadsiah not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day');

-- Omar Marmoush (entity_id 754)
-- Frankfurt: announced 15 May 2023, joined for 2023-24. Manchester City fee: £59m (en) vs about €75m (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(754, NULL, 256, '2017-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Wadi Degla not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(754, 256, 257, '2021-01-05', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(754, 256, 247, '2021-08-30', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(754, 256, 248, '2023-07-01', 'free', NULL, NULL, 'Free transfer (announced 15 May 2023)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(754, 248, 195, '2025-01-23', 'permanent', NULL, NULL, 'Reported as £59m (en) or about €75m (de)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(754, 195, 200, '2026-08-27', 'loan', NULL, NULL, 'Loan with an obligation to buy', 'Wikipedia (en)', '2026-10-09', 'day');

-- Matheus Nunes (entity_id 755)
-- Manchester City fee: £53m (en) vs €53m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(755, NULL, 18989, '2018-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Ericeirense not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(755, 18989, 281, '2019-01-29', 'permanent', 500000, 440000, '€500,000 for half of his rights (~£440,000, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(755, 281, 202, '2022-08-17', 'permanent', 45000000, 38000000, '€45m (£38m)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(755, 202, 195, '2023-09-01', 'permanent', NULL, NULL, 'Reported as £53m (en) or €53m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Research output: transfer history for players 801-815 (Maddison to Tel).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / it / pt / es / nl / fr) for dates and fees.
-- All of these players are active: history as of 2026-10-09.
-- A loan with an obligation to buy gets a second, permanent row only when a source dates the purchase.

-- James Maddison (entity_id 801)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(801, 315, 310, '2016-02-01', 'undisclosed', NULL, NULL, 'Undisclosed; £6.5m per one source', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(801, 310, 315, '2016-02-01', 'loan', NULL, NULL, 'Loaned back for the rest of 2015-16', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(801, 310, 391, '2016-08-31', 'loan', NULL, NULL, 'Loan to January 2017', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(801, 310, 305, '2018-06-20', 'permanent', 22700000, 20000000, 'Undisclosed; thought to be about £20m (~€22.7m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(801, 305, 200, '2023-06-28', 'permanent', 46000000, 40000000, 'Undisclosed; reported as £40m (~€46.0m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Dejan Kulusevski (entity_id 802)
-- Juventus bought him from Atalanta on 2 January 2020 and left him at Parma for the rest of the season.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(802, 223, 237, '2019-07-18', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(802, 223, 232, '2020-01-02', 'permanent', 35000000, 31200000, '€35m (~£31.2m, approx.), rising to €44m with variables', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(802, 232, 237, '2020-01-02', 'loan', NULL, NULL, 'Left on loan at Parma for the rest of the season', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(802, 232, 200, '2022-01-31', 'loan', NULL, NULL, 'Loan (€10m fee) with a conditional €35m obligation to buy', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(802, 232, 200, '2023-06-17', 'permanent', 30000000, 26100000, '€30m per one source (~£26.1m, approx.); loan made permanent', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Dominic Solanke (entity_id 803)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(803, 189, 18972, '2015-08-04', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(803, 189, 194, '2017-07-10', 'undisclosed', NULL, NULL, 'Out of contract; tribunal fee expected to be about £3m (agreed 30 May 2017)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(803, 194, 185, '2019-01-04', 'permanent', 21200000, 19000000, 'Undisclosed; reported as £19m (€21.2m)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(803, 185, 200, '2024-08-10', 'permanent', 64700000, 55000000, '£55m reported (~€64.7m, approx.) plus up to £10m in bonuses', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Brennan Johnson (entity_id 804)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(804, 198, 353, '2020-09-25', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(804, 198, 200, '2023-09-01', 'permanent', 54600000, 47500000, '£47.5m (~€54.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(804, 200, 190, '2026-01-02', 'permanent', 41700000, 35000000, '£35m reported (~€41.7m, approx.), club record', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(804, 190, 191, '2026-08-11', 'undisclosed', NULL, NULL, 'Straight swap for Dwight McNeil', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Richarlison (entity_id 805)
-- Everton fee: £35m rising to £50m (en) vs £45m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(805, 19068, 32, '2015-12-29', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(805, 32, 311, '2017-08-08', 'permanent', 12500000, 11200000, '£11.2m (€12.5m)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(805, 311, 191, '2018-07-24', 'permanent', NULL, NULL, 'Reported as £35m rising to £50m (en) or £45m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(805, 191, 200, '2022-07-01', 'permanent', 58800000, 50000000, '£50m (~€58.8m, approx.) plus up to £10m in add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Destiny Udogie (entity_id 806)
-- The Udinese loan carried an obligation to buy (reported €4m); neither source dates the purchase.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(806, 230, 242, '2021-07-15', 'loan', NULL, NULL, 'Loan with an obligation to buy (reported €4m)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(806, 242, 200, '2022-08-16', 'permanent', 20000000, 17000000, '€20m per one source (~£17m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(806, 200, 242, '2022-08-16', 'loan', NULL, NULL, 'Loaned back for 2022-23', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Pedro Porro (entity_id 807)
-- Tottenham: the January 2023 loan carried a €40m obligation to buy, completed that summer (not dated).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(807, 215, 211, '2017-08-10', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 211, 195, '2019-08-08', 'permanent', 12500000, 11000000, '£11m reported (~€12.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 195, 404, '2019-08-12', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 195, 281, '2020-08-16', 'loan', NULL, NULL, 'Two-year loan with an €8.5m option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 195, 281, '2022-05-16', 'permanent', 8500000, 7200000, '€8.5m (£7.2m); option exercised', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 281, 200, '2023-01-31', 'loan', NULL, NULL, 'Loan (€5m fee) with a €40m obligation to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(807, 281, 200, '2023-07-01', 'permanent', 40000000, 34800000, '€40m (~£34.8m, approx.); obligation to buy completed', 'Wikipedia (en, es)', '2026-10-09', 'year');

-- Micky van de Ven (entity_id 808)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(808, NULL, 256, '2021-08-31', 'permanent', 3500000, 3150000, '£3.15m (about €3.5m) [Volendam not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(808, 256, 200, '2023-08-08', 'permanent', 40000000, 34500000, '£34.5m initial (€40m), rising to £43m', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Cristian Romero (entity_id 809)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(809, 19, 229, '2018-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(809, 229, 232, '2019-07-12', 'permanent', 26000000, 22900000, '€26m (~£22.9m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 232, 229, '2019-07-12', 'loan', NULL, NULL, 'Loaned back for the 2019-20 season', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 232, 223, '2020-09-05', 'loan', NULL, NULL, 'Two-year loan with option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 232, 223, '2021-08-06', 'permanent', 16000000, 13800000, '€16m (~£13.8m, approx.); option exercised', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 223, 200, '2021-08-06', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 223, 200, '2022-08-30', 'permanent', 50000000, 42500000, 'About €50m per one report (~£42.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(809, 200, 205, '2026-08-15', 'permanent', 40700000, 34200000, '£34.2m reported (~€40.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Guglielmo Vicario (entity_id 810)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(810, 242, NULL, '2014-07-01', 'loan', NULL, NULL, 'Loan [Fontanafredda not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(810, 242, 19089, '2015-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(810, 242, 19089, '2016-07-05', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 19089, 225, '2019-07-17', 'undisclosed', NULL, NULL, 'Fee not stated (five-year contract)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 225, 19083, '2019-07-25', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 225, 19088, '2021-07-09', 'loan', NULL, NULL, 'Loan with a €10m option to buy', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 225, 19088, '2022-06-18', 'undisclosed', NULL, NULL, 'Option to buy exercised', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 19088, 200, '2023-06-27', 'permanent', 20000000, 17400000, '€20m plus bonuses per one source (~£17.4m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(810, 200, 232, '2026-08-18', 'loan', NULL, NULL, 'Season-long loan with an €8m option to buy', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Yves Bissouma (entity_id 811)
-- Tottenham fee: £30m (en) vs about €29m (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(811, NULL, 265, '2016-03-01', 'undisclosed', NULL, NULL, 'Joined the reserves; fee not stated [Real Bamako not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(811, 265, 187, '2018-07-17', 'undisclosed', NULL, NULL, 'Undisclosed; about €20m per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(811, 187, 200, '2022-06-17', 'permanent', NULL, NULL, 'Reported as £30m (en) or about €29m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(811, 200, 283, '2026-09-16', 'undisclosed', NULL, NULL, 'One-year contract; terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Pape Matar Sarr (entity_id 812)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(812, NULL, 276, '2020-09-15', 'undisclosed', NULL, NULL, 'Fee not stated [Generation Foot not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(812, 276, 200, '2021-08-27', 'permanent', 20000000, 17200000, 'About €20m per one source (~£17.2m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(812, 200, 276, '2021-08-27', 'loan', NULL, NULL, 'Loaned back for 2021-22', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(812, 200, 232, '2026-09-01', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en)', '2026-10-09', 'day');

-- Rodrigo Bentancur (entity_id 813)
-- Juventus held an option from Carlos Tevez's 2015 move; exercised 21 April 2017, effective 1 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(813, 22, 232, '2017-07-01', 'permanent', 9500000, 8400000, '€9.5m (~£8.4m, approx.) plus bonuses; signed 21 Apr 2017', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(813, 232, 200, '2022-01-31', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Wilson Odobert (entity_id 814)
-- The Burnley and Tottenham fees are fr.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(814, NULL, 19128, '2022-07-15', 'free', NULL, NULL, 'Free transfer (from Paris Saint-Germain youth)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(814, 19128, 188, '2023-08-12', 'permanent', 12000000, 10400000, 'About €12m per one source (~£10.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(814, 188, 200, '2024-08-16', 'permanent', 37000000, 31500000, 'About €37m plus bonuses per one source (~£31.5m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Mathys Tel (entity_id 815)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(815, 268, 243, '2022-07-26', 'permanent', 28500000, 24200000, '€28.5m including bonuses (~£24.2m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(815, 243, 200, '2025-02-03', 'loan', NULL, NULL, 'Loan for the rest of 2024-25 with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(815, 243, 200, '2025-06-15', 'permanent', 35700000, 30000000, '£30m reported (~€35.7m, approx.); loan made permanent', 'Wikipedia (en)', '2026-10-09', 'day');

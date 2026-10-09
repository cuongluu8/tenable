-- Research output: transfer history for players 889-900 (Damsgaard to Huijsen) -- the last slice
-- of candidate_players_batch2_part1.csv. Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (da / de / nl / fr / es) for dates and fees.
-- English article only for Ryan Christie (896) and Djordje Petrovic (898): the second article
-- fetched was a disambiguation page or missing.
-- All of these players are active: history as of 2026-10-09.

-- Mikkel Damsgaard (entity_id 889)
-- Sampdoria: agreed 6 February 2020, joined 1 July 2020.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(889, NULL, 19053, '2020-07-01', 'permanent', 6700000, 6000000, 'About €6.7m (DKK 50m; ~£6.0m, approx.); agreed 6 Feb 2020 [Nordsjaelland not in local club pool]', 'Wikipedia (en, da)', '2026-10-09', 'day'),
(889, 19053, 186, '2022-08-10', 'permanent', 15000000, 12800000, '€15m (~£12.8m, approx.)', 'Wikipedia (en, da)', '2026-10-09', 'day');

-- Nathan Collins (entity_id 890)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(890, 314, 188, '2021-06-24', 'permanent', 14000000, 12000000, '£12m (~€14.0m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(890, 188, 202, '2022-07-12', 'permanent', 24100000, 20500000, '£20.5m (~€24.1m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(890, 202, 186, '2023-07-04', 'permanent', 26400000, 23000000, '£23m (~€26.4m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Keane Lewis-Potter (entity_id 891)
-- Brentford fee: undisclosed (en); £16m rising to £20m (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(891, 322, NULL, '2019-03-01', 'loan', NULL, NULL, 'Loan to the end of 2018-19 [Bradford (Park Avenue) not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(891, 322, 186, '2022-07-12', 'permanent', 18800000, 16000000, 'Undisclosed; £16m per one source (~€18.8m, approx.), rising to £20m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Kevin Schade (entity_id 892)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(892, 249, 186, '2023-01-04', 'loan', NULL, NULL, 'Loan until the end of 2022-23 with an agreed permanent deal to follow', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(892, 249, 186, '2023-06-12', 'permanent', 25300000, 22000000, 'About £22m (~€25.3m, approx.), club record', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Antoine Semenyo (entity_id 893)
-- Not written: his first professional contract at Bristol City (January 2018, from Highworth Town).
-- Manchester City fee: £64m (en) vs £71m plus bonuses (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(893, 340, NULL, '2018-01-01', 'loan', NULL, NULL, 'Short-term loan [Bath City not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(893, 340, 384, '2018-07-18', 'loan', NULL, NULL, 'Season-long loan (recalled January 2019)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(893, 340, 199, '2020-01-31', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(893, 340, 185, '2023-01-27', 'permanent', 11500000, 10000000, '£10m (~€11.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(893, 185, 195, '2026-01-09', 'permanent', NULL, NULL, 'Reported as £64m (en) or £71m plus bonuses (de)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Justin Kluivert (entity_id 894)
-- Bournemouth bought him from Roma after his Valencia loan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(894, 283, 239, '2018-06-12', 'permanent', 17250000, 15200000, '€17.25m (~£15.2m, approx.) plus up to €1.5m in bonuses', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(894, 239, 245, '2020-10-05', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(894, 239, 266, '2021-07-20', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(894, 239, 221, '2022-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(894, 239, 185, '2023-06-23', 'permanent', 11000000, 9600000, 'Undisclosed; reported as about €11m (~£9.6m, approx.) plus €1.5m in add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Marcus Tavernier (entity_id 895)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(895, 312, 383, '2018-01-17', 'loan', NULL, NULL, 'Loan until the end of 2017-18', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(895, 312, 185, '2022-08-01', 'undisclosed', NULL, NULL, 'Fee not stated (five-year deal)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ryan Christie (entity_id 896) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(896, NULL, 287, '2015-09-01', 'undisclosed', NULL, NULL, 'Fee not stated [Inverness Caledonian Thistle not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(896, 287, NULL, '2015-09-01', 'loan', NULL, NULL, 'Loaned back to Inverness (recalled December 2015) [club not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(896, 287, 391, '2017-01-24', 'loan', NULL, NULL, 'Loan until the end of 2016-17', 'Wikipedia (en)', '2026-10-09', 'day'),
(896, 287, 391, '2017-06-01', 'loan', NULL, NULL, 'Season-long loan, part of the Jonny Hayes deal', 'Wikipedia (en)', '2026-10-09', 'month'),
(896, 287, 185, '2021-08-31', 'permanent', 1740000, 1500000, 'About £1.5m reported (~€1.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Adrien Truffert (entity_id 897)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(897, 268, 185, '2025-06-16', 'permanent', 13500000, 11400000, '£11.4m (€13.5m) plus up to £3m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Djordje Petrovic (entity_id 898) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(898, NULL, NULL, '2018-07-01', 'loan', NULL, NULL, 'Loan [Cukaricki, FK IMT not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(898, NULL, 19044, '2022-04-06', 'undisclosed', NULL, NULL, 'Undisclosed fee [Cukaricki not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(898, 19044, 189, '2023-08-26', 'permanent', 14400000, 12500000, 'Undisclosed; reported as £12.5m (~€14.4m, approx.) plus £1.5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day'),
(898, 189, 269, '2024-08-30', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(898, 189, 185, '2025-07-16', 'permanent', 29800000, 25000000, '£25m per a BBC report (~€29.8m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Ilya Zabarnyi (entity_id 899)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(899, 296, 185, '2023-01-31', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(899, 185, 261, '2025-08-12', 'permanent', 67000000, 57000000, '£57m (about €67m including bonuses)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Dean Huijsen (entity_id 900)
-- Not written: his 2021 move from Malaga's academy to Juventus's.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(900, 232, 239, '2024-01-06', 'loan', NULL, NULL, 'Loan until the end of 2023-24', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(900, 232, 185, '2024-07-30', 'permanent', 15200000, 12900000, '€15.2m initial (~£12.9m, approx.), rising to €18.2m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(900, 185, 217, '2025-05-17', 'permanent', 59500000, 50000000, '£50m release clause (€59.5m)', 'Wikipedia (en, es)', '2026-10-09', 'day');

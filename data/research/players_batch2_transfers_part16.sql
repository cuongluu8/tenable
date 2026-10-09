-- Research output: transfer history for players 876-888 (Andersen to Igor Thiago).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / es / nl / fr / sv / pt) for dates and fees.
-- English article only for Joachim Andersen (876) and Bart Verbruggen (881): the second article
-- fetched was a disambiguation page.
-- All of these players are active: history as of 2026-10-09.

-- Joachim Andersen (entity_id 876) -- English Wikipedia only
-- Crystal Palace bought him from Lyon after his Fulham loan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(876, NULL, 18971, '2013-08-01', 'undisclosed', NULL, NULL, 'Youth contract; rumoured 5m DKK (about €650,000) [Midtjylland not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(876, 18971, 19053, '2017-08-26', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(876, 19053, 263, '2019-07-12', 'permanent', 24000000, 21100000, '€24m (~£21.1m, approx.) plus €6m in bonuses', 'Wikipedia (en)', '2026-10-09', 'day'),
(876, 263, 192, '2020-10-05', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(876, 263, 190, '2021-07-28', 'permanent', 17500000, 15100000, '€17.5m (~£15.1m, approx.) plus €2.5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day'),
(876, 190, 192, '2024-08-23', 'permanent', 35300000, 30000000, '£30m reported (~€35.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Emile Smith Rowe (entity_id 877)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(877, 183, 245, '2019-01-31', 'loan', NULL, NULL, 'Loan until the end of 2018-19', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(877, 183, 341, '2020-01-10', 'loan', NULL, NULL, 'Loan until the end of 2019-20', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(877, 183, 192, '2024-08-02', 'permanent', 31800000, 27000000, '£27m reported (~€31.8m, approx.) plus up to £7m in add-ons; club record', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Alex Iwobi (entity_id 878)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(878, 183, 191, '2019-08-08', 'permanent', 31800000, 28000000, '£28m initial (~€31.8m, approx.), rising to £34m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(878, 191, 192, '2023-09-02', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £22m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Raul Jimenez (entity_id 879)
-- Wolves: the €38m option was announced on 4 April 2019 and took effect on 1 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(879, 334, 205, '2014-08-13', 'permanent', NULL, NULL, 'Reported as €10.5m-€11m (sources differ)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(879, 205, 280, '2015-08-13', 'permanent', NULL, NULL, 'Reported as €9.8m (en) or about €9m for 50% of his rights (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(879, 280, 202, '2018-06-12', 'loan', NULL, NULL, 'Season-long loan (€3m fee) with a €38m option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(879, 280, 202, '2019-07-01', 'permanent', 38000000, 30000000, '€38m option exercised (reported as a club-record £30m); announced 4 Apr 2019', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(879, 202, 192, '2023-07-25', 'permanent', 6300000, 5500000, '£5.5m reported (~€6.3m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(879, 192, 202, '2026-06-09', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Harry Wilson (entity_id 880)
-- Fulham 2021: en.wikipedia describes a loan that later became permanent; de.wikipedia a
-- permanent move for a reported £12m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(880, 194, 372, '2015-08-26', 'loan', NULL, NULL, 'Youth loan (recalled 1 Dec 2015)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(880, 194, 322, '2018-01-31', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(880, 194, 316, '2018-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(880, 194, 185, '2019-08-06', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(880, 194, 320, '2020-10-16', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(880, 194, 192, '2021-07-24', 'undisclosed', NULL, NULL, 'A loan made permanent per one source; a permanent £12m move per another', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(880, 192, 193, '2026-07-08', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Bart Verbruggen (entity_id 881) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(881, 18983, 293, '2020-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(881, 293, 187, '2023-07-03', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day');

-- Lewis Dunk (entity_id 882)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(882, 187, NULL, '2010-01-01', 'loan', NULL, NULL, 'Loan [Bognor Regis Town not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(882, 187, 340, '2013-10-04', 'loan', NULL, NULL, 'One-month loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jan Paul van Hecke (entity_id 883)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(883, 18983, 187, '2020-09-10', 'permanent', 2500000, 2200000, '€2.5m per one source (~£2.2m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(883, 187, 18973, '2020-09-18', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(883, 187, 313, '2021-08-29', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(883, 187, 200, '2026-06-18', 'permanent', 61900000, 52000000, '£52m reported (~€61.9m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Carlos Baleba (entity_id 884)
-- Manchester United fee: £70m including add-ons (en) vs about €75m (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(884, NULL, 265, '2022-01-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(884, 265, 187, '2023-08-29', 'permanent', 27000000, 23500000, '€27m (~£23.5m, approx.) plus up to €3m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(884, 187, 196, '2026-08-25', 'permanent', NULL, NULL, 'Reported as £70m including add-ons (en) or about €75m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Yasin Ayari (entity_id 885)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(885, NULL, 187, '2023-01-30', 'permanent', NULL, NULL, 'SEK 67.6m per one source (not converted) [AIK not in local club pool]', 'Wikipedia (en, sv)', '2026-10-09', 'day'),
(885, 187, 315, '2023-08-21', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, sv)', '2026-10-09', 'day'),
(885, 187, 313, '2024-01-05', 'loan', NULL, NULL, 'Loan until the end of 2023-24', 'Wikipedia (en, sv)', '2026-10-09', 'day');

-- Georginio Rutter (entity_id 886)
-- All three fees are fr.wikipedia estimates; en.wikipedia gives none.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(886, 268, 250, '2021-02-01', 'permanent', NULL, NULL, 'About €1m per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(886, 250, 193, '2023-01-14', 'permanent', 40000000, 34800000, 'Club record; about €40m per one source (~£34.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(886, 193, 187, '2024-08-19', 'permanent', 47000000, 40000000, 'Club record; about €47m (£40m)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Danny Welbeck (entity_id 887)
-- Arsenal: 2 September 2014 (en) vs 1 September (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(887, 196, 343, '2010-01-25', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(887, 196, 199, '2010-08-12', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(887, 196, 183, '2014-09-01', 'permanent', 19800000, 16000000, '£16m (~€19.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(887, 183, 311, '2019-08-07', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(887, 311, 187, '2020-10-18', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(887, 187, 189, '2026-08-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'day');

-- Igor Thiago (entity_id 888)
-- Brentford: agreed 14 February 2024, joined 1 July 2024.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(888, 40, NULL, '2022-03-02', 'undisclosed', NULL, NULL, 'Fee not stated [Ludogorets Razgrad not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(888, NULL, 292, '2023-06-12', 'permanent', 7900000, 6900000, 'About €7.9m (~£6.9m, approx.) [Ludogorets Razgrad not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(888, 292, 186, '2024-07-01', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about £30m; agreed 14 Feb 2024', 'Wikipedia (en, pt)', '2026-10-09', 'day');

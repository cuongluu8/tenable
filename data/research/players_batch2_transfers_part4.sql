-- Research output: transfer history for players 696-710 (Nuno Mendes to Odegaard).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (pt / fr / de / es) for dates and fees.
-- ONE SOURCE ONLY for Fabian Ruiz (701) and Vitinha (702): the second article fetched was a
-- disambiguation page or the wrong player.
-- All of these players are active: history as of 2026-10-09.
-- No rows for Lamine Yamal (704), who has only played for Barcelona.

-- Nuno Mendes (entity_id 696)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(696, 281, 261, '2021-08-31', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(696, 281, 261, '2022-05-31', 'permanent', NULL, NULL, 'Option exercised; reported as €38m (en) or more than €40m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Joao Neves (entity_id 697)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(697, 280, 261, '2024-08-05', 'permanent', 59900000, 50900000, '€59.9m (~£50.9m, approx.); sources differ on whether €10m of add-ons is included', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Michael Olise (entity_id 698)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(698, 344, 190, '2021-07-08', 'permanent', 9300000, 8000000, '£8m release clause (~€9.3m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(698, 190, 243, '2024-07-07', 'permanent', 60000000, 50800000, '€60m (£50.8m) reported', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Cole Palmer (entity_id 699)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(699, 195, 189, '2023-09-01', 'permanent', 46000000, 40000000, '£40m (~€46.0m, approx.) plus £2.5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Raphinha (entity_id 700)
-- Barcelona: 15 July 2022 (en) vs 13 July (pt); fee £50m (en) vs £49m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(700, 19146, 18984, '2016-02-02', 'permanent', 600000, 492000, '€600,000 per one source (~£492,000, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(700, 18984, 281, '2018-05-23', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(700, 281, 268, '2019-09-01', 'permanent', 21000000, 18500000, 'About €21m (~£18.5m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(700, 268, 193, '2020-10-05', 'permanent', 20000000, 17000000, 'Undisclosed; reported as about £17m (€20m)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(700, 193, 206, '2022-07-01', 'permanent', NULL, NULL, 'Reported as £49m-£50m, rising to £55m with add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Fabian Ruiz (entity_id 701) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(701, 216, 208, '2016-12-23', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(701, 216, 236, '2018-07-05', 'permanent', 30000000, 26400000, '€30m buyout clause (~£26.4m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(701, 236, 261, '2022-08-30', 'undisclosed', NULL, NULL, 'Fee not stated (five-year contract)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Vitinha (entity_id 702) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(702, 279, 202, '2020-09-09', 'loan', NULL, NULL, 'Season-long loan (€20m option to buy, not taken up)', 'Wikipedia (en)', '2026-10-09', 'day'),
(702, 279, 261, '2022-06-30', 'permanent', 41500000, 35300000, '€41.5m release clause (~£35.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Florian Wirtz (entity_id 703)
-- Not written: his January 2020 move from Cologne's academy to Leverkusen's.
-- Liverpool: 20 June 2025 (en) vs July 2025 (de); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(703, 246, 194, '2025-06-01', 'permanent', NULL, NULL, 'Reported as £100m-£107m (€117.5m-€125m) plus bonuses', 'Wikipedia (en, de)', '2026-10-09', 'month');

-- David Raya (entity_id 705)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(705, 313, NULL, '2014-08-01', 'loan', NULL, NULL, 'Five-month loan [Southport not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(705, 313, 186, '2019-07-06', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about £3m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(705, 186, 183, '2023-08-15', 'loan', NULL, NULL, 'Season-long loan (£3m loan fee, £27m option to buy)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(705, 186, 183, '2024-07-04', 'permanent', NULL, NULL, 'Option to buy exercised (set at £27m)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- William Saliba (entity_id 706)
-- Loan back to Saint-Etienne: the 2019-20 season per en.wikipedia, "early 2020" per fr.wikipedia.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(706, 19061, 183, '2019-07-25', 'permanent', 30700000, 27000000, '£27m reported (~€30.7m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(706, 183, 19061, '2019-07-25', 'loan', NULL, NULL, 'Loaned back for 2019-20 (sources differ on when it began)', 'Wikipedia (en, fr)', '2026-10-09', 'inconclusive'),
(706, 183, 266, '2021-01-04', 'loan', NULL, NULL, 'Loan for the rest of 2020-21', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(706, 183, 262, '2021-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'month');

-- Cristhian Mosquera (entity_id 707)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(707, 221, 183, '2025-07-24', 'permanent', 15500000, 13000000, 'About £13m initially (~€15.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Ben White (entity_id 708)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(708, 187, 384, '2017-08-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(708, 187, 356, '2019-01-03', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(708, 187, 193, '2019-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(708, 187, 183, '2021-07-30', 'permanent', 58100000, 50000000, '£50m (~€58.1m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Gabriel Magalhaes (entity_id 709)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(709, 19146, 265, '2017-01-31', 'undisclosed', NULL, NULL, 'Fee not stated (Avai kept 15% of his rights)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(709, 265, 19128, '2017-08-01', 'loan', NULL, NULL, 'Loan (ended early)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(709, 265, 300, '2018-01-01', 'loan', NULL, NULL, 'Loan until the end of 2017-18', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(709, 265, 183, '2020-09-01', 'permanent', 30000000, 27000000, 'About £27m after add-ons (€30m)', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Martin Odegaard (entity_id 710)
-- Real Madrid: 21 Jan 2015 (en) vs 22 Jan (es); fee about €3m in Spanish media, €4m in Norwegian.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(710, NULL, 217, '2015-01-01', 'permanent', NULL, NULL, 'Reported as about €3m-€4m [Stromsgodset not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(710, 217, 18973, '2017-01-10', 'loan', NULL, NULL, '18-month loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(710, 217, 18972, '2018-08-21', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(710, 217, 219, '2019-07-05', 'loan', NULL, NULL, 'Season-long loan (recalled in 2020)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(710, 217, 183, '2021-01-27', 'loan', NULL, NULL, 'Loan until the end of 2020-21', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(710, 217, 183, '2021-08-20', 'permanent', 35000000, 30000000, '€35m (£30m), rising to about €40m with add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day');

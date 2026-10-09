-- Research output: transfer history for players 771-785 (Matheus Cunha to Chalobah).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (pt / de / fr / es / nl / da) for dates and fees.
-- Reece James (782) rests on the English article only.
-- All of these players are active: history as of 2026-10-09.

-- Matheus Cunha (entity_id 771)
-- Wolves: the loan carried an obligation to buy, completed in summer 2023; neither source dates it.
-- Manchester United: 12 June 2025 (en) vs 1 June (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(771, NULL, NULL, '2017-07-01', 'undisclosed', NULL, NULL, 'Terms not stated; from Coritiba youth [Sion not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(771, NULL, 245, '2018-06-24', 'permanent', 15000000, 13200000, '€15m per one source (~£13.2m, approx.) [Sion not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(771, 245, 19058, '2020-01-31', 'undisclosed', NULL, NULL, 'Undisclosed; about €20m per one source', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(771, 19058, 205, '2021-08-25', 'permanent', 30000000, 25800000, '€30m (~£25.8m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(771, 205, 202, '2023-01-01', 'loan', NULL, NULL, 'Loan with an obligation to buy (announced 25 Dec 2022)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(771, 205, 202, '2023-07-01', 'permanent', NULL, NULL, 'Obligation to buy completed; about €50m per one source', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(771, 202, 196, '2025-06-01', 'permanent', 74400000, 62500000, '£62.5m reported (~€74.4m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Benjamin Sesko (entity_id 772)
-- Leipzig: announced 9 August 2022, joined 1 July 2023.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(772, NULL, 294, '2019-06-03', 'undisclosed', NULL, NULL, 'Fee not stated [Domzale not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(772, 294, NULL, '2019-07-01', 'loan', NULL, NULL, 'Sent to the affiliated FC Liefering until 2021 [club not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(772, 294, 245, '2023-07-01', 'permanent', 24000000, 20900000, 'About €24m reported (~£20.9m, approx.); announced 9 Aug 2022', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(772, 245, 196, '2025-08-09', 'permanent', 76500000, 64300000, '€76.5m initial reported (~£64.3m, approx.) plus €8.5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Amad Diallo (entity_id 773)
-- Agreed 5 October 2020; he joined on 7 January 2021.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(773, 223, 196, '2021-01-07', 'permanent', NULL, NULL, 'Reported as €21m-€25m plus bonuses, up to about €40m; agreed Oct 2020', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(773, 196, 288, '2022-01-27', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(773, 196, 199, '2022-08-31', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Alejandro Garnacho (entity_id 774)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(774, 196, 189, '2025-08-30', 'permanent', 47600000, 40000000, '£40m reported (~€47.6m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(774, 189, 184, '2026-07-23', 'loan', NULL, NULL, 'Season-long loan with a conditional obligation to buy', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Andre Onana (entity_id 775)
-- Ajax: announced January 2015 (en), joined February 2015 (fr); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(775, NULL, 283, '2015-01-01', 'undisclosed', NULL, NULL, 'Fee not stated (from Barcelona youth)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(775, 283, 231, '2022-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(775, 231, 196, '2023-07-20', 'permanent', 50300000, 43800000, '£43.8m initial (~€50.3m, approx.) plus £3.4m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(775, 196, 19003, '2025-09-11', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(775, 196, 19003, '2026-07-03', 'loan', NULL, NULL, 'Second season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Leny Yoro (entity_id 776)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(776, 265, 196, '2024-07-18', 'permanent', 62000000, 52200000, '€62m (£52.2m) plus up to €8m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Joshua Zirkzee (entity_id 777)
-- Parma loan: 31 January 2021 (en) vs 1 February (nl); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(777, 243, 237, '2021-01-01', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(777, 243, 293, '2021-08-03', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(777, 243, 224, '2022-08-30', 'undisclosed', NULL, NULL, 'Permanent; fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(777, 224, 196, '2024-07-14', 'permanent', 42500000, 36500000, '£36.5m (€42.5m)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Patrick Dorgu (entity_id 778)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(778, NULL, 234, '2022-07-01', 'undisclosed', NULL, NULL, 'Joined Lecce''s under-19s; fee not stated [Nordsjaelland not in local club pool]', 'Wikipedia (en, da)', '2026-10-09', 'month'),
(778, 234, 196, '2025-02-02', 'permanent', 29800000, 25000000, '£25m reported (~€29.8m, approx.)', 'Wikipedia (en, da)', '2026-10-09', 'day');

-- Senne Lammens (entity_id 779)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(779, 292, 18998, '2023-06-08', 'free', NULL, NULL, 'Free transfer (contract ended)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(779, 18998, 196, '2025-09-01', 'permanent', 21500000, 18100000, '£18.1m reported (about €21.5m)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Enzo Fernandez (entity_id 780)
-- Benfica: 14 July 2022 (en) vs 15 July (es); fee €10m for 75% plus €8m add-ons (en) vs €44m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(780, 23, 7, '2020-08-22', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(780, 23, 280, '2022-07-01', 'permanent', NULL, NULL, 'Reported as €10m for 75% of his rights plus €8m add-ons (en) or €44m (es)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(780, 280, 189, '2023-01-31', 'permanent', 121000000, 106800000, '£106.8m (€121m)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(780, 189, 195, '2026-09-01', 'permanent', 146000000, 125000000, '£125m (about €146m)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Moises Caicedo (entity_id 781)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(781, 122, 187, '2021-02-01', 'permanent', 4500000, 4000000, '£4m (€4.5m)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(781, 187, NULL, '2021-08-31', 'loan', NULL, NULL, 'Season-long loan, recalled 12 Jan 2022 [Beerschot not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(781, 187, 189, '2023-08-14', 'permanent', 114900000, 100000000, 'Undisclosed; reported as £100m base (~€114.9m, approx.), rising to £115m', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Reece James (entity_id 782) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(782, 189, 364, '2018-06-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'month');

-- Levi Colwill (entity_id 783)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(783, 189, 341, '2021-06-25', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(783, 189, 187, '2022-08-05', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Wesley Fofana (entity_id 784)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(784, 19061, 305, '2020-10-02', 'permanent', 35000000, 31200000, '€35m (~£31.2m, approx.) plus €5m in bonuses; up to £36.5m in all', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(784, 305, 189, '2022-08-31', 'permanent', 81000000, 70000000, '£70m initial (€81m) plus £5m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Trevoh Chalobah (entity_id 785)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(785, 189, 307, '2018-06-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(785, 189, 341, '2019-08-08', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(785, 189, 277, '2020-08-18', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(785, 189, 190, '2024-08-30', 'loan', NULL, NULL, 'Season-long loan, recalled 15 Jan 2025', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(785, 189, 226, '2026-08-09', 'undisclosed', NULL, NULL, 'Fee not stated (deal until 2031)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Research output: transfer history for players 786-800 (Cucurella to Hazard).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (es / fr / pt / de / nl) for dates and fees.
-- Joao Pedro (793) rests on the English article only.
-- Most of these players are active: history as of 2026-10-09.

-- Marc Cucurella (entity_id 786)
-- Getafe permanent fee: €6m (en) vs €10m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(786, 206, 411, '2018-08-31', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 206, 411, '2019-05-27', 'permanent', 2000000, 1760000, '€2m (~£1.8m, approx.); option exercised', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 411, 206, '2019-07-16', 'permanent', 4000000, 3520000, '€4m buy-back clause (~£3.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 206, 210, '2019-07-18', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 206, 210, '2020-06-30', 'permanent', NULL, NULL, 'Option exercised; reported as €6m (en) or €10m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 210, 187, '2021-08-31', 'undisclosed', NULL, NULL, 'Fee not stated (five-year contract)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 187, 189, '2022-08-05', 'permanent', 65900000, 56000000, '£56m initial (~€65.9m, approx.), rising to £63m with add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(786, 189, 217, '2026-06-15', 'permanent', 55000000, 46200000, '€55m initial (~£46.2m, approx.) plus €5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day');

-- Malo Gusto (entity_id 787)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(787, 263, 189, '2023-01-29', 'permanent', 30000000, 26100000, '€30m (~£26.1m, approx.) plus €5m in bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(787, 189, 263, '2023-01-29', 'loan', NULL, NULL, 'Loaned back until the end of 2022-23', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Robert Sanchez (entity_id 788)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(788, 187, 374, '2018-06-01', 'loan', NULL, NULL, 'Season-long loan (recalled January 2019)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(788, 187, NULL, '2019-07-24', 'loan', NULL, NULL, 'Season-long loan [Rochdale not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(788, 187, 189, '2023-08-05', 'permanent', 23000000, 20000000, '£20m initial (~€23.0m, approx.) plus £5m in add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(788, 189, 226, '2026-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day');

-- Nicolas Jackson (entity_id 789)
-- Aston Villa: he was still a Chelsea player after his Bayern loan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(789, NULL, 222, '2019-09-01', 'undisclosed', NULL, NULL, 'Fee not stated [Casa Sports not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(789, 222, NULL, '2020-10-05', 'loan', NULL, NULL, 'Season-long loan [Mirandes not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(789, 222, 189, '2023-06-30', 'permanent', 36800000, 32000000, '£32m reported (~€36.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(789, 189, 243, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan (reported €16.5m loan fee)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(789, 189, 184, '2026-08-28', 'permanent', 55500000, 47500000, 'Undisclosed; reported as £47.5m initial (€55.5m), rising to £65m', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Christopher Nkunku (entity_id 790)
-- Chelsea: signed 20 June 2023, contract from 1 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(790, 261, 245, '2019-07-18', 'permanent', 13000000, 11400000, 'About €13m (~£11.4m, approx.) plus bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(790, 245, 189, '2023-07-01', 'permanent', 60000000, 52000000, '£52m reported (about €60m); signed 20 June 2023', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(790, 189, 235, '2025-08-30', 'permanent', 37000000, 31100000, '€42m including bonuses (€37m plus €5m; ~£31.1m, approx. for the fixed part)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(790, 235, 245, '2026-08-25', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Pedro Neto (entity_id 791)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(791, 282, 233, '2017-08-31', 'loan', NULL, NULL, 'Two-year loan with an obligation to buy (€26m combined with Bruno Jordao)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(791, 233, 202, '2019-08-02', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(791, 202, 189, '2024-08-11', 'permanent', 60400000, 51300000, '£51.3m reported (~€60.4m, approx.) plus £2.6m in bonuses', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Jamie Gittens (entity_id 792)
-- Not written: his 2020 move from Manchester City's academy to Dortmund's.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(792, 244, 189, '2025-07-05', 'permanent', 57700000, 48500000, '£48.5m (~€57.7m, approx.) plus £3.5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Joao Pedro (entity_id 793) -- English Wikipedia only
-- Watford: agreed 19 October 2018; he moved in January 2020.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(793, 32, 311, '2020-01-01', 'undisclosed', NULL, NULL, 'Fee not stated; agreed 19 Oct 2018', 'Wikipedia (en)', '2026-10-09', 'month'),
(793, 311, 187, '2023-05-05', 'undisclosed', NULL, NULL, 'Undisclosed; reported as a club record of about £30m', 'Wikipedia (en)', '2026-10-09', 'day'),
(793, 187, 189, '2025-07-02', 'permanent', 65500000, 55000000, '£55m reported (~€65.5m, approx.) plus £5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day');

-- Estevao (entity_id 794)
-- Agreed 22 June 2024; he joined in July 2025 after turning 18 and was unveiled on 5 August.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(794, 30, 189, '2025-07-01', 'permanent', NULL, NULL, 'Reported as €34m plus €23m incentives (en) or €45m plus €16.5m (pt); agreed 22 June 2024', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Romeo Lavia (entity_id 795)
-- Chelsea: 18 August 2023 (en) vs 16 August (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(795, 195, 306, '2022-07-06', 'permanent', 12400000, 10500000, 'Undisclosed; reported as £10.5m (~€12.4m, approx.) plus £3.5m in add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(795, 306, 189, '2023-08-01', 'permanent', 62000000, 53000000, '£53m initial reported (€62m) plus add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'month');

-- Liam Delap (entity_id 796)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(796, 195, 314, '2022-08-18', 'loan', NULL, NULL, 'Loan (recalled 12 Jan 2023)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(796, 195, 343, '2023-01-12', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(796, 195, 322, '2023-07-02', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(796, 195, 307, '2024-07-13', 'permanent', NULL, NULL, 'Worth up to £20m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(796, 307, 189, '2025-06-04', 'permanent', 35700000, 30000000, '£30m release clause reported (~€35.7m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(796, 189, 198, '2026-08-27', 'permanent', 53600000, 45000000, '£45m initial (~€53.6m, approx.) plus £5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day');

-- Tosin Adarabioyo (entity_id 797)
-- Chelsea: announced 7 June 2024, joined 1 July when his Fulham contract ended.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(797, 195, 317, '2018-08-03', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(797, 195, 313, '2019-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(797, 195, 192, '2020-10-05', 'undisclosed', NULL, NULL, 'Undisclosed; reported as up to £2m plus a 20% sell-on', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(797, 192, 189, '2024-07-01', 'free', NULL, NULL, 'Free transfer (announced 7 June 2024)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(797, 189, 200, '2026-09-01', 'permanent', 14300000, 12000000, '£12m (~€14.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Raheem Sterling (entity_id 798)
-- Feyenoord: his Chelsea contract was ended by mutual agreement on 28 January 2026, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(798, 194, 195, '2015-07-14', 'permanent', 60300000, 44000000, '£44m initial (~€60.3m, approx.) plus up to £5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(798, 195, 189, '2022-07-13', 'permanent', 55900000, 47500000, '£47.5m (~€55.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(798, 189, 183, '2024-08-30', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(798, NULL, 285, '2026-02-12', 'free', NULL, NULL, 'Free agent (contract to the end of 2025-26)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Cesar Azpilicueta (entity_id 799)
-- Chelsea fee: undisclosed, reported as £7m (en) or €10m (es). He retired in May 2026.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(799, 214, 262, '2010-06-21', 'permanent', 7000000, 6000000, '€7m (~£6.0m, approx.), rising to €9.5m with appearances', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(799, 262, 189, '2012-08-24', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £7m (en) or €10m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(799, 189, 205, '2023-07-06', 'undisclosed', NULL, NULL, 'Terms not stated (one-year contract)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(799, 205, 220, '2025-08-29', 'undisclosed', NULL, NULL, 'Terms not stated (one-year deal)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Eden Hazard (entity_id 800)
-- Chelsea: 4 June 2012 (en) vs 28 May (fr); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(800, 265, 189, '2012-05-01', 'permanent', 40000000, 32000000, '£32m reported (about €40m)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(800, 189, 217, '2019-06-07', 'permanent', 100000000, 88000000, '€100m reported (~£88m, approx.), rising to €146.1m with add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

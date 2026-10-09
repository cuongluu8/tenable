-- Research output: transfer history for players 816-830 (Kudus to Botman).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (nl / fr / sv / pt / it / de) for dates and fees.
-- English article only for Archie Gray (819), Anthony Gordon (825) and Harvey Barnes (826).
-- All of these players are active: history as of 2026-10-09.

-- Mohammed Kudus (entity_id 816)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(816, NULL, NULL, '2018-01-01', 'undisclosed', NULL, NULL, 'From the Right to Dream Academy [Nordsjaelland not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(816, NULL, 283, '2020-07-16', 'permanent', 9000000, 8000000, '€9m (~£8.0m, approx.) [Nordsjaelland not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(816, 283, 201, '2023-08-27', 'permanent', 44500000, 38000000, 'Undisclosed; reported as €44.5m (£38m) plus add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(816, 201, 200, '2025-07-10', 'permanent', 63800000, 55000000, '£55m (about €63.8m)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Xavi Simons (entity_id 817)
-- PSV: 28 June 2022 (en) vs 29 June (nl). PSG buy-back fee: €6m (en) vs €12m (a headline cited by nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(817, 261, 284, '2022-06-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(817, 284, 261, '2023-07-19', 'permanent', NULL, NULL, 'Buy-back clause, reported as €6m or €12m', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(817, 261, 245, '2023-07-19', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(817, 261, 245, '2024-08-05', 'loan', NULL, NULL, 'Second season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(817, 261, 245, '2025-01-30', 'permanent', 50000000, 42000000, '€50m (~£42m, approx.) plus up to €31m in bonuses', 'Wikipedia (en)', '2026-10-09', 'day'),
(817, 245, 200, '2025-08-29', 'permanent', 61700000, 51800000, 'Believed to be about £51.8m (~€61.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Randal Kolo Muani (entity_id 818)
-- Frankfurt: pre-contract 4 March 2022, joined when his Nantes contract ended. PSG: 1 Sept 2023 (en) vs 2 Sept (fr).
-- Juventus 2026: he was still a PSG player after his Tottenham loan; fee €38m plus €12m (en) vs €41.2m (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(818, 271, 19386, '2019-08-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(818, 271, 248, '2022-07-01', 'free', NULL, NULL, 'Free transfer (pre-contract agreed 4 Mar 2022)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(818, 248, 261, '2023-09-01', 'permanent', 75000000, 65300000, '€75m (~£65.3m, approx.) plus €15m in bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(818, 261, 232, '2025-01-23', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(818, 261, 200, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(818, 261, 232, '2026-08-02', 'permanent', NULL, NULL, 'Reported as €38m plus up to €12m (en) or €41.2m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Archie Gray (entity_id 819) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(819, 193, 200, '2024-07-02', 'permanent', 47100000, 40000000, 'Undisclosed; reported as about £40m (~€47.1m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Lucas Bergvall (entity_id 820)
-- Tottenham: agreed 2 February 2024, joined 1 July 2024.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(820, NULL, NULL, '2022-12-09', 'permanent', NULL, NULL, 'SEK 10m per one source [IF Brommapojkarna, Djurgarden not in local club pool]', 'Wikipedia (en, sv)', '2026-10-09', 'day'),
(820, NULL, 200, '2024-07-01', 'permanent', 10000000, 8500000, '£8.5m reported (~€10.0m, approx.); agreed 2 Feb 2024 [Djurgarden not in local club pool]', 'Wikipedia (en, sv)', '2026-10-09', 'day');

-- Joao Palhinha (entity_id 821)
-- Fulham fee: £20m (en) vs about €20m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(821, 281, 18990, '2015-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(821, 281, NULL, '2016-07-01', 'loan', NULL, NULL, 'Loan [Belenenses not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(821, 281, 282, '2018-08-01', 'loan', NULL, NULL, 'Two-year loan', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(821, 281, 192, '2022-07-04', 'permanent', NULL, NULL, 'Reported as £20m (en) or about €20m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(821, 192, 243, '2024-07-11', 'permanent', 51000000, 43400000, '€51m (~£43.4m, approx.) plus €5m in add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(821, 243, 200, '2025-08-03', 'loan', NULL, NULL, 'Season-long loan with a €30m option to buy', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(821, 243, 280, '2026-08-26', 'permanent', 14000000, 11800000, '€14m per one source (~£11.8m, approx.) plus up to €5m in add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Bruno Guimaraes (entity_id 822)
-- Lyon: 29 Jan 2020 (en) vs 30 Jan (pt). Newcastle: 30 Jan 2022 (en) vs 31 Jan (pt); fee up to £40m (en) vs about €52m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(822, NULL, 33, '2017-05-11', 'loan', NULL, NULL, 'Loan until April 2018 [Audax (Osasco) not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(822, NULL, 33, '2018-03-01', 'undisclosed', NULL, NULL, 'Bought outright; fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(822, 33, 263, '2020-01-01', 'permanent', 20000000, 17800000, '€20m reported (~£17.8m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(822, 263, 197, '2022-01-01', 'permanent', NULL, NULL, 'Reported as up to £40m (en) or about €52m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(822, 197, 183, '2026-08-08', 'permanent', 89300000, 75000000, 'About £75m reported (~€89.3m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Sandro Tonali (entity_id 823)
-- Newcastle fee: about €70m (en) vs about €64m (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(823, 19056, 235, '2020-09-09', 'loan', NULL, NULL, 'Loan (€10m fee) with a €15m option to buy', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(823, 19056, 235, '2021-07-08', 'undisclosed', NULL, NULL, 'Loan made permanent on renegotiated terms; fee not stated', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(823, 235, 197, '2023-07-03', 'permanent', NULL, NULL, 'Undisclosed; reported as €64m-€70m', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(823, 197, 200, '2026-07-06', 'permanent', 108000000, 100000000, '£100m (€108m)', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Joelinton (entity_id 824)
-- Newcastle fee: £40m (en) vs about €40m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(824, 19067, 250, '2015-06-05', 'permanent', NULL, NULL, 'About R$7m per one source (not converted)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(824, 250, NULL, '2016-06-23', 'loan', NULL, NULL, 'Two-year loan [Rapid Wien not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(824, 250, 197, '2019-07-23', 'permanent', NULL, NULL, 'Club record; reported as £40m (en) or about €40m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Anthony Gordon (entity_id 825) -- English Wikipedia only
-- Barcelona: announced 29 May 2026, contract from 1 July 2026.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(825, 191, 343, '2021-02-01', 'loan', NULL, NULL, 'Loan for the rest of 2020-21', 'Wikipedia (en)', '2026-10-09', 'day'),
(825, 191, 197, '2023-01-29', 'permanent', 46000000, 40000000, '£40m (~€46.0m, approx.), rising to £45m with add-ons', 'Wikipedia (en)', '2026-10-09', 'day'),
(825, 197, 206, '2026-07-01', 'permanent', 80000000, 67200000, '€80m reported (~£67.2m, approx.); announced 29 May 2026', 'Wikipedia (en)', '2026-10-09', 'day');

-- Harvey Barnes (entity_id 826) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(826, 305, 383, '2017-01-20', 'loan', NULL, NULL, 'Loan for the rest of 2016-17', 'Wikipedia (en)', '2026-10-09', 'day'),
(826, 305, 346, '2017-08-11', 'loan', NULL, NULL, 'Season-long loan (recalled 1 Jan 2018)', 'Wikipedia (en)', '2026-10-09', 'day'),
(826, 305, 317, '2018-07-24', 'loan', NULL, NULL, 'Season-long loan (recalled 11 Jan 2019)', 'Wikipedia (en)', '2026-10-09', 'day'),
(826, 305, 197, '2023-07-23', 'permanent', 43700000, 38000000, 'Undisclosed; believed to be about £38m (~€43.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Jacob Murphy (entity_id 827)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(827, 310, 381, '2014-02-07', 'loan', NULL, NULL, 'One-month loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 310, 386, '2014-03-27', 'loan', NULL, NULL, 'Loan for the rest of 2013-14', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 310, 347, '2014-11-03', 'loan', NULL, NULL, 'Loan (cut short 31 Dec 2014)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 310, NULL, '2015-01-01', 'loan', NULL, NULL, 'One-month loan [Scunthorpe United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(827, 310, 371, '2015-03-01', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(827, 310, 315, '2015-08-14', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 310, 197, '2017-07-19', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 197, 317, '2019-01-31', 'loan', NULL, NULL, 'Loan until the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(827, 197, 309, '2019-08-08', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Nick Pope (entity_id 828)
-- Exact loan dates are from en.wikipedia; de.wikipedia confirms each loan by year. None of the
-- non-league clubs he was loaned to are in the pool.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(828, NULL, 366, '2011-05-24', 'undisclosed', NULL, NULL, 'Compensation agreed, amount not stated [Bury Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2011-08-01', 'loan', NULL, NULL, 'Loan [Harrow Borough not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(828, 366, NULL, '2011-12-21', 'loan', NULL, NULL, '28-day loan [Welling United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2013-03-07', 'loan', NULL, NULL, 'One-month loan [Cambridge United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2013-09-26', 'loan', NULL, NULL, 'One-month loan [Aldershot Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2013-11-21', 'loan', NULL, NULL, 'One-month loan [York City not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2014-01-16', 'loan', NULL, NULL, 'Loan for the rest of 2013-14 [York City not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, NULL, '2015-01-06', 'loan', NULL, NULL, 'Loan for the rest of 2014-15 [Bury not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 366, 188, '2016-07-19', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(828, 188, 197, '2022-06-23', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £10m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Aaron Ramsdale (entity_id 829)
-- Bournemouth fee: about £800,000 (en) vs £1m (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(829, 308, NULL, '2015-12-01', 'loan', NULL, NULL, 'Loan [Worksop Town not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(829, 308, 185, '2017-01-31', 'permanent', NULL, NULL, 'Undisclosed; reported as £800,000 (en) or £1m (de)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(829, 185, 19392, '2018-01-01', 'loan', NULL, NULL, 'Loan for the rest of 2017-18', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(829, 185, 345, '2019-01-04', 'loan', NULL, NULL, 'Loan for the rest of 2018-19', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(829, 185, 308, '2020-08-19', 'permanent', 20800000, 18500000, '£18.5m reported (~€20.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(829, 308, 183, '2021-08-20', 'permanent', NULL, NULL, 'Up to £30m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(829, 183, 306, '2024-08-30', 'permanent', 29400000, 25000000, '£25m reported (~€29.4m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(829, 306, 197, '2025-08-02', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Sven Botman (entity_id 830)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(830, 283, 18973, '2019-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(830, 283, 265, '2020-07-31', 'permanent', 7000000, 6200000, 'About €7m (~£6.2m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(830, 265, 197, '2022-06-28', 'permanent', 37000000, 31500000, '€37m (~£31.5m, approx.), rising to €40m with bonuses', 'Wikipedia (en, nl)', '2026-10-09', 'day');

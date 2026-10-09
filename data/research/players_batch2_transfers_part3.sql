-- Research output: transfer history for players 681-695 (Gabriel Jesus to McTominay).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (pt / es / nl / de / it / fr) for dates and fees.
-- All of these players are active (Diogo Jota died in July 2025): history as of 2026-10-09.
-- Where a move was agreed ahead of time, transfer_date is the date the player joined.
-- NULL club id = club not in the local club pool; named in display_value.

-- Gabriel Jesus (entity_id 681)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(681, 30, 195, '2017-01-19', 'permanent', 33000000, 27000000, '£27m (€33m) reported, plus add-ons; announced 3 Aug 2016', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(681, 195, 183, '2022-07-04', 'permanent', 52900000, 45000000, 'Undisclosed; reported as £45m (~€52.9m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(681, 183, 206, '2026-09-01', 'permanent', 10000000, 8400000, 'Undisclosed; reported as €10m (~£8.4m, approx.) plus add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Roberto Firmino (entity_id 682)
-- Hoffenheim: signed December 2010, joined 1 January 2011.
-- Liverpool: agreed 23-24 June 2015, finalised 4 July. Al Sadd: 24 July 2025 (en) vs 23 July (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(682, 19147, 250, '2011-01-01', 'undisclosed', NULL, NULL, 'Fee not stated (signed December 2010)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(682, 250, 194, '2015-07-04', 'permanent', 41000000, 29000000, 'Up to £29m (€41m); agreed 24 June 2015', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(682, 194, 330, '2023-07-04', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(682, 330, 19447, '2025-07-01', 'undisclosed', NULL, NULL, 'Two-year deal; fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Diogo Jota (entity_id 683)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(683, NULL, 205, '2016-07-01', 'undisclosed', NULL, NULL, 'Fee not stated; agreed 14 Mar 2016 [Pacos de Ferreira not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(683, 205, 279, '2016-08-26', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(683, 205, 202, '2017-07-25', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(683, 205, 202, '2018-07-01', 'permanent', 14000000, 12300000, '€14m reported (~£12.3m, approx.); announced 30 Jan 2018', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(683, 202, 194, '2020-09-19', 'permanent', 46100000, 41000000, '£41m (~€46.1m, approx.), rising to £45m with add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Darwin Nunez (entity_id 684)
-- Almeria: 29 Aug 2019 (en) vs 27 Aug (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(684, 66, 408, '2019-08-01', 'permanent', NULL, NULL, 'About US$6m including variables (reported in USD)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(684, 408, 280, '2020-09-04', 'permanent', 24000000, 21400000, '€24m (~£21.4m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(684, 280, 194, '2022-06-13', 'permanent', 75000000, 64000000, '€75m (£64m) plus €25m in add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(684, 194, 328, '2025-08-09', 'permanent', 53000000, 44500000, '€53m excluding bonuses (~£44.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(684, 328, NULL, '2026-08-22', 'loan', NULL, NULL, 'Season-long loan [Al-Diriyah not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Cody Gakpo (entity_id 685)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(685, 284, 194, '2023-01-01', 'permanent', NULL, NULL, 'Reported as €40m-€50m (£35.4m-£44.3m); agreed late Dec 2022', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Bruno Fernandes (entity_id 686)
-- Sampdoria: the 2016 loan carried an obligation to buy; no date is given for the purchase, so
-- there is no separate row. Sporting: 27 June 2017 (en) vs 27 July (pt); earlier month kept.
-- Manchester United: agreed 29 Jan 2020, completed 30 Jan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(686, NULL, 19097, '2012-08-27', 'undisclosed', NULL, NULL, 'Fee not stated (from Boavista youth)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(686, 19097, 242, '2013-07-01', 'undisclosed', NULL, NULL, 'Co-ownership deal; fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(686, 242, 19053, '2016-08-16', 'loan', NULL, NULL, 'Loan with an obligation to buy', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(686, 19053, 281, '2017-06-01', 'permanent', 8500000, 7500000, '€8.5m (~£7.5m, approx.) plus bonuses', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(686, 281, 196, '2020-01-01', 'permanent', 55000000, 47000000, '€55m (£47m) plus up to €25m in add-ons', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Rasmus Hojlund (entity_id 687)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(687, 301, NULL, '2022-01-01', 'permanent', 1800000, 1530000, '€1.8m reported (~£1.5m, approx.) [Sturm Graz not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(687, NULL, 223, '2022-08-27', 'permanent', 17000000, 14500000, '€17m reported (~£14.5m, approx.) [Sturm Graz not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(687, 223, 196, '2023-08-05', 'permanent', 75000000, 64000000, '£64m (about €75m) plus £8m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(687, 196, 236, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan with an obligation to buy (€6m loan fee)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(687, 196, 236, '2026-06-03', 'permanent', 44000000, 38000000, 'About €44m (£38m); obligation to buy triggered', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Gianluigi Donnarumma (entity_id 688)
-- PSG: 15 July 2021 (en) vs 14 July (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(688, 235, 261, '2021-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(688, 261, 195, '2025-09-02', 'permanent', 30000000, 26000000, '£26m (€30m)', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Desire Doue (entity_id 689)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(689, 268, 261, '2024-08-17', 'permanent', 50000000, 42500000, '€50m excluding bonuses (~£42.5m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Denzel Dumfries (entity_id 690)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(690, NULL, 18976, '2014-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Barendrecht not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(690, 18976, 18973, '2017-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(690, 18973, 284, '2018-06-19', 'permanent', 5500000, 4800000, 'About €5.5m (~£4.8m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(690, 284, 231, '2021-08-14', 'permanent', 12500000, 10800000, '€12.5m (~£10.8m, approx.) plus €2.5m bonus', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(690, 231, 217, '2026-07-05', 'permanent', 20000000, 16800000, 'About €20m release clause (~£16.8m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Serhou Guirassy (entity_id 691)
-- Exact days come from fr.wikipedia; en.wikipedia gives months. The Cologne, Rennes and
-- Stuttgart purchase fees are fr.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(691, NULL, 265, '2015-07-02', 'permanent', 1000000, 730000, 'About €1m (~£730,000, approx.) [Laval not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 265, 273, '2016-01-20', 'loan', NULL, NULL, 'Six-month loan', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 265, 259, '2016-07-20', 'permanent', 6000000, 4900000, 'About €6m (~£4.9m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 259, 19125, '2019-01-31', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 259, 19125, '2019-06-30', 'permanent', 6000000, 5300000, 'About €6m (~£5.3m, approx.); option exercised', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 19125, 268, '2020-08-27', 'permanent', 15000000, 13400000, '€15m (~£13.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 268, 247, '2022-09-01', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 268, 247, '2023-05-31', 'permanent', 9000000, 7800000, '€9m (~£7.8m, approx.); option exercised', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(691, 247, 244, '2024-07-18', 'permanent', 18000000, 15300000, '€18m (~£15.3m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Viktor Gyokeres (entity_id 692)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(692, NULL, 187, '2018-01-01', 'undisclosed', NULL, NULL, 'Fee not stated; signed 6 Sept 2017 [IF Brommapojkarna not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(692, 187, 257, '2019-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(692, 187, 321, '2020-10-02', 'loan', NULL, NULL, 'Loan (recalled 14 Jan 2021)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(692, 187, 315, '2021-01-15', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(692, 187, 315, '2021-07-09', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(692, 315, 281, '2023-07-13', 'permanent', 20000000, 17400000, '€20m (~£17.4m, approx.) plus €4m in bonuses', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(692, 281, 183, '2025-07-26', 'permanent', 65500000, 55000000, '£55m (~€65.5m, approx.), rising to £63.5m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Khvicha Kvaratskhelia (entity_id 693)
-- None of his clubs before Napoli are in the pool.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(693, NULL, NULL, '2018-03-01', 'free', NULL, NULL, 'Free transfer [Dinamo Tbilisi, Rustavi not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(693, NULL, NULL, '2019-02-15', 'loan', NULL, NULL, 'Loan [Rustavi, Lokomotiv Moscow not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(693, NULL, NULL, '2019-07-06', 'undisclosed', NULL, NULL, 'Five-year contract; fee not stated [Rubin Kazan not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(693, NULL, NULL, '2022-03-24', 'undisclosed', NULL, NULL, 'Rubin Kazan contract suspended [Rubin Kazan, Dinamo Batumi not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(693, NULL, 236, '2022-07-01', 'permanent', NULL, NULL, 'Reported as €10m-€12m [Dinamo Batumi not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(693, 236, 261, '2025-01-17', 'permanent', 70000000, 58800000, '€70m (~£58.8m, approx.) plus bonuses', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Alexis Mac Allister (entity_id 694)
-- Brighton: 24 Jan 2019 (en) vs 21 Jan (es); he stayed at Argentinos Juniors on loan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(694, 1, 187, '2019-01-01', 'undisclosed', NULL, NULL, 'Fee not stated (record sale for Argentinos Juniors)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(694, 187, 1, '2019-01-01', 'loan', NULL, NULL, 'Loaned back for the rest of 2018-19', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(694, 187, 22, '2019-06-01', 'loan', NULL, NULL, 'Loan (ended early, 31 Jan 2020)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(694, 187, 194, '2023-06-08', 'permanent', 40000000, 35000000, 'Undisclosed; reported as £35m (about €40m), rising with add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Scott McTominay (entity_id 695)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(695, 196, 236, '2024-08-30', 'permanent', 30500000, 25700000, '£25.7m (€30.5m) reported', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Research output: transfer history for players 861-875 (Wharton to Antonee Robinson).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / fr) for dates and fees.
-- English article only for Daniel Munoz (864), Chris Richards (866), Idrissa Gueye (868) and
-- Beto (871): the second article fetched was a disambiguation page or missing.
-- All of these players are active: history as of 2026-10-09.

-- Adam Wharton (entity_id 861)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(861, 313, 190, '2024-02-01', 'permanent', 21200000, 18000000, 'Undisclosed; reported as £18m initial (~€21.2m, approx.), rising to £22m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Daichi Kamada (entity_id 862)
-- Sagan Tosu: signing announced 17 November 2014 for the 2015 season.
-- Sint-Truiden loan: 1 September 2018 (en) vs 31 August (de); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(862, NULL, 19430, '2015-01-01', 'undisclosed', NULL, NULL, 'First professional contract, from high school (announced 17 Nov 2014)', 'Wikipedia (en)', '2026-10-09', 'year'),
(862, 19430, 248, '2017-06-01', 'permanent', 2500000, 2200000, '€2.5m reported (~£2.2m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(862, 248, NULL, '2018-08-01', 'loan', NULL, NULL, 'Season-long loan [Sint-Truiden not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(862, 248, 233, '2023-08-03', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(862, 233, 190, '2024-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ismaila Sarr (entity_id 863)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(863, NULL, 276, '2016-07-13', 'undisclosed', NULL, NULL, 'First professional contract [Generation Foot not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(863, 276, 268, '2017-07-26', 'permanent', 17000000, 15000000, 'About €17m (~£15.0m, approx.) plus bonuses; some reports say €20m', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(863, 268, 311, '2019-08-08', 'permanent', 30000000, 26400000, 'About €30m (~£26.4m, approx.) plus bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(863, 311, 262, '2023-07-24', 'undisclosed', NULL, NULL, 'Undisclosed; about €13m per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(863, 262, 190, '2024-08-01', 'undisclosed', NULL, NULL, 'Fee not stated; about €15m per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Daniel Munoz (entity_id 864) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(864, 103, 107, '2019-06-26', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(864, 107, 18996, '2020-05-28', 'permanent', 4500000, 4000000, '€4.5m reported (~£4.0m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(864, 18996, 190, '2024-01-30', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en)', '2026-10-09', 'day'),
(864, 190, 198, '2026-08-31', 'permanent', NULL, NULL, 'Up to £22m', 'Wikipedia (en)', '2026-10-09', 'day');

-- Dean Henderson (entity_id 865)
-- Exact loan dates are from en.wikipedia; de.wikipedia confirms each by season.
-- Crystal Palace: he was still a Manchester United player after his Forest loan.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(865, 196, 362, '2016-01-12', 'loan', NULL, NULL, 'One-month loan, later resumed', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, 376, '2016-08-31', 'loan', NULL, NULL, 'Loan (recalled 3 Feb 2017)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, NULL, '2017-07-10', 'loan', NULL, NULL, 'Season-long loan [Shrewsbury Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, 308, '2018-06-18', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, 308, '2019-07-25', 'loan', NULL, NULL, 'Second season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, 198, '2022-07-02', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(865, 196, 190, '2023-08-31', 'permanent', 17200000, 15000000, '£15m reported (~€17.2m, approx.) plus £5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Chris Richards (entity_id 866) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(866, NULL, 243, '2018-07-01', 'loan', NULL, NULL, 'One-year loan [FC Dallas not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(866, NULL, 243, '2019-01-19', 'permanent', NULL, NULL, '$1.5m (reported in USD) [FC Dallas not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(866, 243, 250, '2021-02-01', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en)', '2026-10-09', 'day'),
(866, 243, 250, '2021-08-30', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(866, 243, 190, '2022-07-27', 'permanent', 12000000, 10200000, '€12m (~£10.2m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Jordan Pickford (entity_id 867)
-- Exact loan dates are from en.wikipedia; de.wikipedia confirms each by year.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(867, 199, NULL, '2012-01-01', 'loan', NULL, NULL, 'Loan (debut 21 Jan 2012) [Darlington not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(867, 199, NULL, '2013-02-25', 'loan', NULL, NULL, 'Loan [Alfreton Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, 349, '2013-08-02', 'loan', NULL, NULL, 'Loan (recalled 17 Aug 2013)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, 349, '2013-09-13', 'loan', NULL, NULL, 'Second loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, NULL, '2014-02-08', 'loan', NULL, NULL, 'Loan [Carlisle United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, 348, '2014-07-21', 'loan', NULL, NULL, 'Season-long loan (recalled 9 Mar 2015)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, 343, '2015-07-31', 'loan', NULL, NULL, 'Season-long loan (recalled 1 Jan 2016)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(867, 199, 191, '2017-06-15', 'permanent', 28400000, 25000000, '£25m (~€28.4m, approx.), rising to £30m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Idrissa Gueye (entity_id 868) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(868, NULL, 265, '2008-08-01', 'undisclosed', NULL, NULL, 'Fee not stated [Diambars not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(868, 265, 184, '2015-07-10', 'permanent', 12300000, 9000000, '£9m (~€12.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(868, 184, 191, '2016-08-02', 'permanent', 8660000, 7100000, '£7.1m release clause reported (~€8.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(868, 191, 261, '2019-07-30', 'permanent', 34100000, 30000000, '£30m (~€34.1m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(868, 261, 191, '2022-09-01', 'permanent', 2350000, 2000000, '£2m reported (~€2.4m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(868, 191, NULL, '2026-08-09', 'free', NULL, NULL, 'Free agent (one-year contract) [Al-Diriyah not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day');

-- Dwight McNeil (entity_id 869)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(869, 188, 191, '2022-07-28', 'permanent', 23500000, 20000000, 'About £20m including add-ons (~€23.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(869, 191, 190, '2026-08-11', 'undisclosed', NULL, NULL, 'Straight swap for Brennan Johnson', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Iliman Ndiaye (entity_id 870)
-- Marseille fee: £20m (en) vs €17.25m (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(870, NULL, 308, '2019-08-31', 'undisclosed', NULL, NULL, 'Fee not stated [Boreham Wood not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(870, 308, NULL, '2020-01-01', 'loan', NULL, NULL, 'Loan for the second half of 2019-20 [Hyde United not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(870, 308, 262, '2023-08-01', 'permanent', NULL, NULL, 'Reported as £20m (en) or €17.25m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(870, 262, 191, '2024-07-03', 'undisclosed', NULL, NULL, 'Undisclosed; about €18.5m plus bonuses per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(870, 191, 195, '2026-09-01', 'permanent', 71400000, 60000000, '£60m base reported (~€71.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Beto (entity_id 871) -- English Wikipedia only
-- Udinese: a loan with an obligation to buy on the last day of the 2021 summer window; the
-- purchase itself is not dated.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(871, NULL, NULL, '2018-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Uniao Tires, Olimpico Montijo not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(871, NULL, 18994, '2019-06-03', 'undisclosed', NULL, NULL, 'Fee not stated [Olimpico Montijo not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(871, 18994, 242, '2021-08-01', 'loan', NULL, NULL, 'Loan with an obligation to buy', 'Wikipedia (en)', '2026-10-09', 'month'),
(871, 242, 191, '2023-08-29', 'permanent', 30000000, 25800000, 'About £25.8m (€30m) reported', 'Wikipedia (en)', '2026-10-09', 'day'),
(871, 191, 228, '2026-09-01', 'undisclosed', NULL, NULL, 'Undisclosed; reported as €18m', 'Wikipedia (en)', '2026-10-09', 'day');

-- James Tarkowski (entity_id 872)
-- Not written: his 2009 youth scholarship at Oldham Athletic.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(872, 380, 186, '2014-01-31', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(872, 186, 188, '2016-02-01', 'undisclosed', NULL, NULL, 'Undisclosed; about €4m per one source', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(872, 188, 191, '2022-07-02', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jarrad Branthwaite (entity_id 873)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(873, NULL, 191, '2020-01-13', 'undisclosed', NULL, NULL, 'About €1m per one source [Carlisle United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(873, 191, 313, '2021-01-14', 'loan', NULL, NULL, 'Loan for the rest of 2020-21', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(873, 191, 284, '2022-07-17', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Bernd Leno (entity_id 874)
-- Leverkusen: made permanent on 30 November 2011, effective 1 January 2012.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(874, 247, 246, '2011-08-10', 'loan', NULL, NULL, 'Loan until the end of 2011', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(874, 247, 246, '2012-01-01', 'undisclosed', NULL, NULL, 'Loan made permanent (agreed 30 Nov 2011); fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(874, 246, 183, '2018-06-19', 'permanent', 25600000, 22500000, '£22.5m (~€25.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(874, 183, 192, '2022-08-02', 'permanent', 9400000, 8000000, '£8m reported (~€9.4m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Antonee Robinson (entity_id 875)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(875, 191, 326, '2017-08-04', 'loan', NULL, NULL, 'Loan until January 2018', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(875, 191, 364, '2018-07-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(875, 191, 364, '2019-07-15', 'undisclosed', NULL, NULL, 'Permanent; fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(875, 364, 192, '2020-08-20', 'permanent', 2250000, 2000000, '£2m (~€2.3m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

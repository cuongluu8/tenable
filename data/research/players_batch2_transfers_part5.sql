-- Research output: transfer history for players 711-725 (Martinelli to Eze).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (pt / nl / es / pl / da / de / it) for dates and fees.
-- Ethan Nwaneri (724) rests on the English article only.
-- All of these players are active: history as of 2026-10-09.
-- No rows for Myles Lewis-Skelly (723), who has only played for Arsenal.

-- Gabriel Martinelli (entity_id 711)
-- Arsenal fee: £6m (en) vs €6m (pt). Al-Hilal: English article only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(711, NULL, 183, '2019-07-02', 'permanent', NULL, NULL, 'Reported as £6m (en) or €6m (pt) [Ituano not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(711, 183, 328, '2026-09-03', 'permanent', 71400000, 60000000, '£60m (~€71.4m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Jurrien Timber (entity_id 712)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(712, 283, 183, '2023-07-14', 'permanent', 40000000, 34000000, '£34m (about €40m), rising to £38.5m with add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Kepa Arrizabalaga (entity_id 713)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(713, 204, NULL, '2015-01-05', 'loan', NULL, NULL, 'Loan until June [Ponferradina not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(713, 204, 404, '2015-07-20', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(713, 204, 189, '2018-08-08', 'permanent', 80000000, 71600000, '€80m release clause (£71.6m)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(713, 189, 217, '2023-08-14', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(713, 189, 185, '2024-08-29', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(713, 189, 183, '2025-07-01', 'permanent', 6000000, 5000000, '£5m release clause (~€6.0m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Jakub Kiwior (entity_id 714)
-- Podbrezova: 2018 (en) vs 16 January 2019 (pl). Arsenal fee: £20m (en) vs €25m (pl).
-- Porto: obligation triggered 5 May 2026, permanent from 1 July 2026.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(714, NULL, NULL, '2019-01-16', 'undisclosed', NULL, NULL, 'From Anderlecht youth; sources differ on the year (2018 or 2019) [Podbrezova not in local club pool]', 'Wikipedia (en, pl)', '2026-10-09', 'inconclusive'),
(714, NULL, NULL, '2019-08-02', 'permanent', NULL, NULL, '€250,000 per one source [Podbrezova, MSK Zilina not in local club pool]', 'Wikipedia (en, pl)', '2026-10-09', 'day'),
(714, NULL, 19092, '2021-08-31', 'permanent', 1500000, 1290000, '€1.5m per one source (~£1.3m, approx.) [MSK Zilina not in local club pool]', 'Wikipedia (en, pl)', '2026-10-09', 'day'),
(714, 19092, 183, '2023-01-23', 'permanent', NULL, NULL, 'Reported as £20m (en) or €25m (pl)', 'Wikipedia (en, pl)', '2026-10-09', 'day'),
(714, 183, 279, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan with an obligation to buy', 'Wikipedia (en, pl)', '2026-10-09', 'day'),
(714, 183, 279, '2026-07-01', 'permanent', 17000000, 14700000, '€17m (£14.7m) plus up to €5m in add-ons; obligation triggered 5 May 2026', 'Wikipedia (en, pl)', '2026-10-09', 'day');

-- Christian Norgaard (entity_id 715)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(715, NULL, 260, '2012-01-01', 'permanent', 400000, 324000, '€400,000 (~£324,000, approx.) [Lyngby not in local club pool]', 'Wikipedia (en, da)', '2026-10-09', 'month'),
(715, 260, 19388, '2013-08-21', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, da)', '2026-10-09', 'day'),
(715, 19388, 228, '2018-07-19', 'permanent', 3500000, 3080000, 'About €3.5m (~£3.1m, approx.)', 'Wikipedia (en, da)', '2026-10-09', 'day'),
(715, 228, 186, '2019-05-28', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £2.8m', 'Wikipedia (en, da)', '2026-10-09', 'day'),
(715, 186, 183, '2025-07-10', 'permanent', 11900000, 10000000, '£10m reported (~€11.9m, approx.) plus £5m in add-ons', 'Wikipedia (en, da)', '2026-10-09', 'day'),
(715, 183, 191, '2026-08-01', 'permanent', 8300000, 7000000, '£7m (~€8.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'month');

-- Oleksandr Zinchenko (entity_id 716)
-- Ufa: 12 February 2015 (en) vs 2014 (de). Not written: a 2017 spell with PSV's reserve side.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(716, 295, NULL, '2015-02-12', 'undisclosed', NULL, NULL, 'Sources differ on the year (2014 or 2015) [FC Ufa not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'inconclusive'),
(716, NULL, 195, '2016-07-04', 'undisclosed', NULL, NULL, 'Undisclosed; believed to be about £1.7m [FC Ufa not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(716, 195, 284, '2016-08-26', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(716, 195, 183, '2022-07-22', 'permanent', 35300000, 30000000, '£30m reported (~€35.3m, approx.), rising to £32m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(716, 183, 198, '2025-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(716, 183, 283, '2026-02-01', 'undisclosed', NULL, NULL, 'Contract to the end of the season; fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Leandro Trossard (entity_id 717)
-- Besiktas: agreed 14 July 2026, official 15 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(717, 18996, NULL, '2013-01-01', 'loan', NULL, NULL, 'Half-season loan [Lommel United not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(717, 18996, NULL, '2013-07-01', 'loan', NULL, NULL, 'Season-long loan [Westerlo not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(717, 18996, NULL, '2014-07-01', 'loan', NULL, NULL, 'Loan [Lommel United not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(717, 18996, NULL, '2015-07-01', 'loan', NULL, NULL, 'Loan [OH Leuven not in local club pool]', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(717, 18996, 187, '2019-06-26', 'undisclosed', NULL, NULL, 'Fee not stated (four-year deal)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(717, 187, 183, '2023-01-20', 'permanent', 30000000, 27000000, '£27m including add-ons (about €30m); £20m guaranteed', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(717, 183, 291, '2026-07-15', 'permanent', 18200000, 15300000, 'About £15.3m (~€18.2m, approx.) plus £1.7m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day');

-- Noni Madueke (entity_id 718)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(718, 284, 189, '2023-01-20', 'permanent', 33000000, 28500000, 'Estimated £28.5m (€33m); one source says about €35m', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(718, 189, 183, '2025-07-18', 'permanent', 57700000, 48500000, '£48.5m initial (~€57.7m, approx.), rising to £52m with add-ons', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Mikel Merino (entity_id 719)
-- Dortmund: signed 15 February 2016, joined 1 July. The Dortmund and Newcastle fees are es.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(719, 214, 244, '2016-07-01', 'permanent', 3700000, 3030000, '€3.7m (~£3.0m, approx.) plus €1.3m variables; signed 15 Feb 2016', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(719, 244, 197, '2017-07-01', 'loan', NULL, NULL, 'Season-long loan with an obligation to buy', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(719, 244, 197, '2017-10-13', 'permanent', 7000000, 6160000, '€7m (~£6.2m, approx.); purchase clause invoked', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(719, 197, 219, '2018-07-12', 'undisclosed', NULL, NULL, 'Undisclosed; reported as €12m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(719, 219, 183, '2024-08-27', 'permanent', 37200000, 31600000, '£31.6m reported (~€37.2m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Kai Havertz (entity_id 720)
-- Chelsea fee: £62m rising to £71m (en) vs about €80m rising to €100m (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(720, 246, 189, '2020-09-04', 'permanent', NULL, NULL, 'Reported as £62m rising to £71m (en) or about €80m rising to €100m (de)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(720, 189, 183, '2023-06-28', 'permanent', 74700000, 65000000, '£65m reported (~€74.7m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Riccardo Calafiori (entity_id 721)
-- Basel: 30 August 2022 (en) vs 31 August (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(721, 239, 229, '2022-01-14', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(721, 239, 19366, '2022-08-01', 'permanent', NULL, NULL, '€1.5m plus 40% of a future sale, per one source', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(721, 19366, 224, '2023-08-31', 'permanent', NULL, NULL, 'About €4m plus bonuses, per one source', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(721, 224, 183, '2024-07-29', 'permanent', 39500000, 33600000, '£33.6m initial (~€39.5m, approx.), rising to £42m with add-ons', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Martin Zubimendi (entity_id 722)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(722, 219, 183, '2025-07-06', 'permanent', 65000000, 55800000, 'About €65m (£55.8m) reported', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Ethan Nwaneri (entity_id 724) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(724, 183, 262, '2026-01-23', 'loan', NULL, NULL, 'Loan until the end of 2025-26', 'Wikipedia (en)', '2026-10-09', 'day'),
(724, 183, 244, '2026-09-01', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day');

-- Eberechi Eze (entity_id 725)
-- Crystal Palace fee: about £17m in en.wikipedia's text; a BBC headline cited by de.wikipedia says £19.5m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(725, NULL, 323, '2016-08-03', 'free', NULL, NULL, 'Signed after a trial', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(725, 323, 365, '2017-08-30', 'loan', NULL, NULL, 'Loan until January 2018', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(725, 323, 190, '2020-08-28', 'permanent', NULL, NULL, 'Reported as about £17m, or £19.5m in another report', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(725, 190, 183, '2025-08-23', 'permanent', 71400000, 60000000, '£60m (~€71.4m, approx.) plus up to £7.5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

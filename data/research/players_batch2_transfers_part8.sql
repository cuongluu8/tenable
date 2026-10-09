-- Research output: transfer history for players 756-770 (Rico Lewis to Mbeumo).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (es / de / nl / pt / fr / no) for dates and fees.
-- Abdukodir Khusanov (761) rests on the English article only.
-- All of these players are active: history as of 2026-10-09.
-- No rows for Rico Lewis (756) or Kobbie Mainoo (768), who have each played for one club.

-- Nico Gonzalez (entity_id 757)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(757, 206, 221, '2022-08-13', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(757, 206, 279, '2023-07-29', 'permanent', 8500000, 7400000, '€8.5m reported (~£7.4m, approx.), with a buy-back clause', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(757, 279, 195, '2025-02-03', 'permanent', 59500000, 50000000, '£50m reported (~€59.5m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(757, 195, 197, '2026-08-26', 'permanent', 61900000, 52000000, '£52m reported (~€61.9m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Kyle Walker (entity_id 758)
-- Tottenham: a combined £9m with Kyle Naughton per en.wikipedia; de.wikipedia calls it a free transfer.
-- He was loaned straight back to Sheffield United for 2009-10.
-- Manchester City: 14 July 2017 (en) vs June 2017 (de); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(758, 308, 355, '2008-11-01', 'loan', NULL, NULL, 'One-month loan, extended into January 2009', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(758, 308, 200, '2009-07-22', 'permanent', NULL, NULL, 'Combined £9m with Kyle Naughton (en); a free transfer per one source', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(758, 200, 308, '2009-07-22', 'loan', NULL, NULL, 'Loaned back for the 2009-10 season', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(758, 200, 323, '2010-09-13', 'loan', NULL, NULL, 'Loan, extended to 3 January 2011', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(758, 200, 184, '2011-01-06', 'loan', NULL, NULL, 'Loan until the end of 2010-11', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(758, 200, 195, '2017-06-01', 'permanent', 51100000, 45000000, '£45m initial (~€51.1m, approx.), rising to £50m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(758, 195, 235, '2025-01-24', 'loan', NULL, NULL, 'Loan until the end of 2024-25 with option to buy (not taken up)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(758, 195, 188, '2025-07-05', 'permanent', NULL, NULL, 'Up to £5m if bonuses are met', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- James Trafford (entity_id 759)
-- Burnley: agreed 3 July 2023, completed 20 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(759, 195, 368, '2021-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(759, 195, 326, '2022-01-13', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(759, 195, 326, '2022-06-15', 'loan', NULL, NULL, 'Second loan, for 2022-23', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(759, 195, 188, '2023-07-20', 'permanent', 17200000, 15000000, '£15m (~€17.2m, approx.), rising to £19m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(759, 188, 195, '2025-07-29', 'permanent', 36900000, 31000000, '£31m buy-back clause (~€36.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(759, 195, 193, '2026-08-06', 'permanent', 53600000, 45000000, '£45m reported (~€53.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Oscar Bobb (entity_id 760)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(760, 195, 192, '2026-01-30', 'permanent', 32100000, 27000000, '£27m (~€32.1m, approx.)', 'Wikipedia (en, no)', '2026-10-09', 'day');

-- Abdukodir Khusanov (entity_id 761) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(761, 19390, NULL, '2022-03-01', 'undisclosed', NULL, NULL, 'Terms not stated; from Bunyodkor youth [Energetik-BGU not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(761, NULL, 267, '2023-07-24', 'undisclosed', NULL, NULL, 'Fee not stated [Energetik-BGU not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
(761, 267, 195, '2025-01-20', 'permanent', 40000000, 33600000, '€40m initial reported (~£33.6m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Matthijs de Ligt (entity_id 762)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(762, 283, 232, '2019-07-18', 'permanent', 75000000, 66000000, '€75m (~£66m, approx.) plus €10.5m in additional costs', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(762, 232, 243, '2022-07-19', 'permanent', 67000000, 57000000, '€67m initial reported (~£57m, approx.), rising to €77m', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(762, 243, 196, '2024-08-13', 'permanent', 45000000, 38300000, '€45m reported (~£38.3m, approx.) plus €5m in bonuses', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Lisandro Martinez (entity_id 763)
-- Ajax: agreed 17 May 2019, effective 1 July. Manchester United: agreed 16-17 July 2022, completed 27 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(763, 14, 7, '2017-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(763, 14, 7, '2018-06-01', 'undisclosed', NULL, NULL, 'Defensa bought 50% of his rights; fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(763, 7, 283, '2019-07-01', 'permanent', 7000000, 6160000, '€7m (~£6.2m, approx.); agreed 17 May 2019', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(763, 283, 196, '2022-07-27', 'permanent', 57370000, 48800000, '€57.37m (about £48.8m) plus €10m in add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Harry Maguire (entity_id 764)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(764, 308, 322, '2014-07-29', 'permanent', 3100000, 2500000, '£2.5m (~€3.1m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(764, 322, 364, '2015-02-10', 'loan', NULL, NULL, 'Loan, extended to the end of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(764, 322, 305, '2017-06-15', 'permanent', 13600000, 12000000, '£12m initial (~€13.6m, approx.), rising to £17m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(764, 305, 196, '2019-08-05', 'permanent', 90900000, 80000000, 'Believed to be £80m (~€90.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Luke Shaw (entity_id 765)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(765, 306, 196, '2014-06-27', 'permanent', 37000000, 30000000, 'Undisclosed; thought to be about £30m (€37m)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Diogo Dalot (entity_id 766)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(766, 279, 196, '2018-06-06', 'permanent', 21600000, 19000000, '£19m (~€21.6m, approx.)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(766, 196, 235, '2020-10-04', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Noussair Mazraoui (entity_id 767)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(767, 283, 243, '2022-07-01', 'free', NULL, NULL, 'Free transfer (signed 24 May 2022)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(767, 243, 196, '2024-08-13', 'permanent', 15000000, 12800000, 'About €15m per one source (~£12.8m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Mason Mount (entity_id 769)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(769, 189, 18972, '2017-07-24', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(769, 189, 316, '2018-07-17', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(769, 189, 196, '2023-07-05', 'permanent', 64000000, 55000000, '£55m guaranteed (€64m) plus £5m in add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Bryan Mbeumo (entity_id 770)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(770, 19128, 186, '2019-08-05', 'permanent', 6600000, 5800000, '£5.8m (~€6.6m, approx.), club record', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(770, 186, 196, '2025-07-21', 'permanent', 77400000, 65000000, '£65m guaranteed (~€77.4m, approx.) plus £6m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

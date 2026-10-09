-- Research output: transfer history for players 666-680 (Makelele to Moussa Dembele).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, French Wikipedia as the second source for every player in this slice.
-- NULL club id = club not in the local club pool; named in display_value.

-- Claude Makelele (entity_id 666)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(666, NULL, 271, '1991-12-01', 'undisclosed', NULL, NULL, 'Fee not stated (from Brest youth)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(666, 271, 262, '1997-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(666, 262, 207, '1998-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(666, 207, 217, '2000-07-01', 'permanent', 14000000, 8500000, '€14m (~£8.5m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(666, 217, 189, '2003-07-01', 'permanent', 24300000, 16800000, '£16.8m (~€24.3m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(666, 189, 261, '2008-07-21', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Marcel Desailly (entity_id 667)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(667, 271, 262, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(667, 262, 235, '1993-11-11', 'permanent', NULL, NULL, '30m francs per one source (not converted)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(667, 235, 189, '1998-07-01', 'permanent', NULL, 4600000, '£4.6m', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(667, 189, 19378, '2004-10-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(667, 19378, NULL, '2005-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Qatar SC not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year');

-- Lilian Thuram (entity_id 668)
-- Juventus fee: 80bn lire / €41.3m (en) vs 240m francs / €36.6m (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(668, 264, 237, '1996-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(668, 237, 232, '2001-07-01', 'permanent', NULL, NULL, 'Reported as €41.3m / 80bn lire (en) or €36.6m / 240m francs (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(668, 232, 206, '2006-07-24', 'permanent', 5000000, 3400000, '€5m (~£3.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Youri Djorkaeff (entity_id 669)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(669, 19133, 269, '1989-07-01', 'permanent', NULL, NULL, '5m francs per one source (not converted)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 269, 264, '1990-10-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(669, 264, 261, '1995-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (Monaco contract had ended)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 261, 231, '1996-07-01', 'permanent', NULL, NULL, '38m francs per one source (not converted)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 231, 19059, '1999-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 19059, 326, '2002-01-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 326, 313, '2004-09-01', 'undisclosed', NULL, NULL, 'Three-month contract', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(669, 313, 19032, '2005-02-01', 'undisclosed', NULL, NULL, 'One-year contract (MetroStars)', 'Wikipedia (en, fr)', '2026-10-09', 'month');

-- David Trezeguet (entity_id 670)
-- Juventus fee: £20m (en) vs 150m francs (fr). River Plate: 19 Dec 2011 (en) vs 20 Dec (fr).
-- Baniyas terminated his contract on 21 Nov 2011, so from_club is NULL for the River Plate move.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(670, 17, 264, '1995-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(670, 264, 232, '2000-07-01', 'permanent', NULL, NULL, 'Reported as £20m (en) or 150m francs (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(670, 232, 416, '2010-08-28', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(670, 416, NULL, '2011-08-30', 'undisclosed', NULL, NULL, 'Terms not stated [Baniyas not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(670, NULL, 23, '2011-12-01', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(670, 23, 14, '2013-07-22', 'loan', NULL, NULL, 'One-year loan', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(670, 23, NULL, '2014-07-30', 'undisclosed', NULL, NULL, 'One-year contract [FC Pune City not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Nicolas Anelka (entity_id 671)
-- Liverpool loan: December 2001 in en.wikipedia's body, January 2002 in its lead and in fr.
-- Manchester City: 24 May 2002 (en) vs July 2002 (fr); earlier month kept.
-- Juventus 2013: a loan per en.wikipedia, a short contract per fr.wikipedia.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(671, 261, 183, '1997-02-01', 'permanent', NULL, 500000, '£500,000 (5m francs)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(671, 183, 217, '1999-08-02', 'permanent', NULL, 22300000, '£22.3m (220m francs)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 217, 261, '2000-07-01', 'permanent', NULL, NULL, 'Reported as £20m-£22m (en) or about €34m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(671, 261, 194, '2001-12-01', 'loan', NULL, NULL, 'Six-month loan (sources differ: December 2001 or January 2002)', 'Wikipedia (en, fr)', '2026-10-09', 'inconclusive'),
(671, 261, 195, '2002-05-01', 'permanent', 20000000, 13000000, '£13m (€20m)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(671, 195, 290, '2005-01-01', 'permanent', 10300000, 7000000, '£7m (~€10.3m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(671, 290, 326, '2006-08-25', 'permanent', 12000000, 8000000, '£8m (€12m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 326, 189, '2008-01-11', 'permanent', 18800000, 15000000, '£15m (~€18.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 189, 19373, '2012-01-01', 'undisclosed', NULL, NULL, 'Fee not stated (confirmed 12 Dec 2011)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 19373, 232, '2013-01-26', 'loan', NULL, NULL, 'Loan (described as a short contract by one source)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 19373, 317, '2013-07-04', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(671, 317, 19417, '2014-09-15', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- William Gallas (entity_id 672)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(672, 19124, 262, '1997-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(672, 262, 189, '2001-07-01', 'permanent', 10000000, 6200000, '£6.2m (~€10.0m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(672, 189, 183, '2006-09-01', 'undisclosed', NULL, NULL, 'Part-exchange for Ashley Cole (Arsenal also received £5m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(672, 183, 200, '2010-08-22', 'free', NULL, NULL, 'Free agent (one-year contract)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(672, 200, NULL, '2013-10-23', 'undisclosed', NULL, NULL, 'One-year deal [Perth Glory not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Bacary Sagna (entity_id 673)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(673, 273, 183, '2007-07-12', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about €9m rising to €11m', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(673, 183, 195, '2014-06-13', 'undisclosed', NULL, NULL, 'Terms not stated (three-year contract)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(673, 195, 19093, '2018-02-03', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(673, 19093, 19050, '2018-08-08', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Hugo Lloris (entity_id 674)
-- Lyon fee: €8.5m (en) vs about €10m (fr). LAFC: announced 30 Dec 2023 for the 2024 season.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(674, 266, 263, '2008-07-01', 'permanent', NULL, NULL, 'Reported as €8.5m (en) or about €10m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(674, 263, 200, '2012-08-31', 'permanent', 10000000, 8100000, '€10m (~£8.1m, approx.) plus €5m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(674, 200, 333, '2023-12-30', 'undisclosed', NULL, NULL, 'Terms not stated (announced 30 Dec 2023 for the 2024 season)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Raphael Varane (entity_id 675)
-- Both fees come from fr.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(675, 267, 217, '2011-06-27', 'permanent', 10000000, 8700000, '€10m (~£8.7m, approx.) excluding bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(675, 217, 196, '2021-08-14', 'permanent', 40000000, 34400000, 'About €40m (~£34.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(675, 196, 226, '2024-07-28', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Paul Pogba (entity_id 676)
-- Not written: his 2009 move from Le Havre to Manchester United's academy.
-- Manchester United 2016: 8 Aug (en) vs 9 Aug (fr). Juventus 2022: 11 July (en) vs 8 July (fr).
-- Monaco: his Juventus contract was terminated on 30 Nov 2024, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(676, 196, 232, '2012-08-03', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(676, 232, 196, '2016-08-01', 'permanent', 105000000, 89300000, '€105m (£89.3m) plus €5m in bonuses, world record', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(676, 196, 232, '2022-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (four-year contract)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(676, NULL, 264, '2025-06-28', 'free', NULL, NULL, 'Free agent (two-year contract)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Olivier Giroud (entity_id 677)
-- Montpellier: 26 Jan 2010 (en) vs 25 Jan (fr); he was loaned straight back to Tours.
-- LAFC: announced 14 May 2024, joined that July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(677, 19133, NULL, '2007-07-01', 'loan', NULL, NULL, 'Loan [Istres not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(677, 19133, NULL, '2008-05-28', 'undisclosed', NULL, NULL, 'Fee not stated [Tours not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(677, NULL, 19120, '2010-01-01', 'permanent', 2000000, 1720000, '€2m (~£1.7m, approx.) [Tours not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(677, 19120, NULL, '2010-01-01', 'loan', NULL, NULL, 'Loaned back to Tours until the end of 2009-10 [club not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(677, 19120, 183, '2012-06-26', 'permanent', 12400000, 9600000, 'About £9.6m (€12.4m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(677, 183, 189, '2018-01-31', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £18m (€20.7m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(677, 189, 235, '2021-07-17', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(677, 235, 333, '2024-07-01', 'undisclosed', NULL, NULL, 'Terms not stated (announced 14 May 2024)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(677, 333, 265, '2025-07-01', 'free', NULL, NULL, 'Free agent (one-year contract)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Alexandre Lacazette (entity_id 678)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(678, 263, 183, '2017-07-05', 'permanent', 53000000, 46500000, '€53m (£46.5m) plus up to €7m in bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(678, 183, 263, '2022-06-09', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(678, 263, NULL, '2025-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Neom SC not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Wissam Ben Yedder (entity_id 679)
-- Monaco released him in June 2024, so from_club is NULL for the Sepahan move.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(679, NULL, NULL, '2009-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [US Saint-Denis, UJA Alfortville not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(679, NULL, 270, '2010-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [UJA Alfortville not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(679, 270, 220, '2016-07-30', 'permanent', 9000000, 7400000, '€9m (~£7.4m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(679, 220, 264, '2019-08-14', 'permanent', 40000000, 35200000, '€40m release clause (~£35.2m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(679, NULL, NULL, '2025-04-01', 'free', NULL, NULL, 'Free agent [Sepahan not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(679, NULL, NULL, '2025-09-08', 'undisclosed', NULL, NULL, 'Terms not stated [Sepahan, Sakaryaspor not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(679, NULL, NULL, '2026-01-01', 'undisclosed', NULL, NULL, 'Six-month contract [Sakaryaspor, Wydad AC not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'month');

-- Moussa Dembele (entity_id 680)
-- Not written: his 2012 move from PSG's academy to Fulham's.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(680, 192, 287, '2016-06-28', 'undisclosed', NULL, NULL, 'About €1m in compensation per one source', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(680, 287, 263, '2018-08-31', 'permanent', 22000000, 19700000, '€22m (£19.7m) reported', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(680, 263, 205, '2021-01-13', 'loan', NULL, NULL, 'Loan with option to buy (reported €1.5m loan fee)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(680, 263, NULL, '2023-07-26', 'undisclosed', NULL, NULL, 'Four-year deal [Al-Ettifaq not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day');

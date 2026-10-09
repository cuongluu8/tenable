-- Research output: transfer history for players 584-595 (Puyol to Cavani).
-- Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same method, sources and date_precision rules as players_batch1_transfers_part2.sql.
-- Second sources here: Italian / Spanish / Portuguese Wikipedia, UEFA.com, ESPN, Soccerway.
--
-- No rows for three one-club players: Carles Puyol (584), Paolo Maldini (587),
-- Francesco Totti (589).

-- Iker Casillas (entity_id 585)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(585, 217, 279, '2015-07-11', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Gianluigi Buffon (entity_id 586)
-- Juventus fee: 100bn lire / €52.9m (en) vs 75bn lire plus Jonathan Bachini, valued at 30bn (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(586, 237, 232, '2001-07-03', 'permanent', NULL, NULL, 'World record for a goalkeeper: reported as €52.9m / 100bn lire, or 75bn lire plus Jonathan Bachini', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(586, 232, 261, '2018-07-06', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(586, 261, 232, '2019-07-04', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(586, 232, 237, '2021-06-17', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Alessandro Del Piero (entity_id 588)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(588, NULL, 232, '1993-07-01', 'permanent', NULL, NULL, '5bn lire (not converted) [Padova not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(588, 232, NULL, '2012-09-05', 'free', NULL, NULL, 'Free agent [Sydney FC not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(588, NULL, 19395, '2014-08-28', 'free', NULL, NULL, 'Free agent (released by Sydney FC) [Sydney FC not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Andrea Pirlo (entity_id 590)
-- Milan fee: 33bn lire / €17.0m (en) vs about 35bn lire (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(590, 19056, 231, '1998-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(590, 231, 19081, '1999-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(590, 231, 19056, '2001-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(590, 231, 235, '2001-06-30', 'permanent', NULL, NULL, 'Reported as 33bn lire / €17.0m (en) or about 35bn lire (it)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(590, 235, 232, '2011-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(590, 232, 19031, '2015-07-06', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Gianfranco Zola (entity_id 591)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(591, NULL, 19422, '1984-07-01', 'undisclosed', NULL, NULL, 'First professional contract', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(591, 19422, 19438, '1986-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(591, 19438, 236, '1989-07-01', 'permanent', NULL, NULL, '2bn lire (not converted)', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(591, 236, 237, '1993-06-01', 'permanent', NULL, NULL, '13bn lire (not converted)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(591, 237, 189, '1996-11-01', 'permanent', NULL, 4500000, '£4.5m (12.5bn lire)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(591, 189, 225, '2003-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, it)', '2026-10-09', 'year');

-- Roberto Carlos (entity_id 592)
-- Fenerbahce: 19 June 2007 (en) vs 5 June 2007 (pt).
-- Delhi Dynamos: he had not played since leaving Anzhi, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(592, 19439, 38, '1992-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(592, 19439, 30, '1993-01-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(592, 30, 231, '1995-07-01', 'permanent', NULL, NULL, '$7m per one source (reported in USD)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(592, 231, 217, '1996-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(592, 217, 290, '2007-06-01', 'undisclosed', NULL, NULL, 'Terms not stated (two-year contract)', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(592, 290, 39, '2010-01-04', 'free', NULL, NULL, 'Free transfer (Fenerbahce contract expired)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(592, 39, 19374, '2011-02-12', 'free', NULL, NULL, 'Released by Corinthians at his request; no fee stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(592, NULL, 19395, '2015-07-05', 'undisclosed', NULL, NULL, 'Signed as head coach and player', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Cafu (entity_id 593)
-- Palmeiras: June 1995 (pt) and 1995 in en.wikipedia's table, though its text says 1996.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(593, 37, 403, '1995-01-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(593, 403, 19148, '1995-05-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(593, 19148, 30, '1995-06-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(593, 30, 239, '1997-07-01', 'permanent', 7600000, NULL, '€7.6m', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(593, 239, 235, '2003-06-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Luis Suarez (entity_id 594)
-- No second Wikipedia source was reachable; dates after 2014 come from en.wikipedia (years only)
-- plus ESPN and a transfer table for the Nacional return.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(594, 67, 18973, '2006-07-11', 'permanent', 800000, 544000, '€800,000 (~£544,000, approx.)', 'Wikipedia (en)/UEFA', '2026-10-09', 'day'),
(594, 18973, 283, '2007-08-09', 'permanent', 7500000, 5100000, '€7.5m (~£5.1m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(594, 283, 194, '2011-01-31', 'permanent', 26500000, 22800000, '€26.5m (£22.8m)', 'Wikipedia (en)', '2026-10-09', 'day'),
(594, 194, 206, '2014-07-11', 'undisclosed', NULL, NULL, 'Undisclosed (a leaked document put it at £64.98m)', 'Wikipedia (en)', '2026-10-09', 'day'),
(594, 206, 205, '2020-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(594, 205, 67, '2022-07-27', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)/ESPN', '2026-10-09', 'day'),
(594, 67, 45, '2023-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(594, 45, 331, '2024-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year');

-- Edinson Cavani (entity_id 595)
-- Napoli: a loan with an obligation to buy; total €17m (en) vs €19m (es).
-- PSG: about €64m in en.wikipedia and the body of es.wikipedia; es.wikipedia's intro says €68m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(595, 68, 19054, '2007-01-31', 'permanent', 4475000, 3000000, '€4.475m (~£3.0m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(595, 19054, 236, '2010-07-17', 'loan', NULL, NULL, 'Loan with obligation to buy; total reported as €17m (en) or €19m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(595, 236, 261, '2013-07-16', 'permanent', 64000000, 54400000, 'About €64m (~£54.4m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(595, 261, 196, '2020-10-05', 'free', NULL, NULL, 'Free agent (PSG contract expired 30 June 2020)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(595, 196, 221, '2022-08-29', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(595, 221, 22, '2023-07-29', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, es)', '2026-10-09', 'day');

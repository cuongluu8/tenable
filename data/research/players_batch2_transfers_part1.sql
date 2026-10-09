-- Research output: transfer history for players 651-665 (Matthaus to Vieira), the first slice of
-- candidate_players_batch2_part1.csv. Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: the English Wikipedia
-- article for the move list, a second-language article (de / es / fr) for dates and fees.
-- Many batch-2 players' lesser clubs are not in the local club pool; those ids are NULL and the
-- club is named in display_value. A row with both ids NULL is still written so the player's
-- sequence of moves stays complete.

-- Lothar Matthaus (entity_id 651)
-- Not written: one league game for 1. FC Herzogenaurach in 2018, long after retiring.
-- MetroStars is the former name of the New York Red Bulls (the pool entry used here).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(651, NULL, 254, '1979-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (from 1. FC Herzogenaurach)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(651, 254, 243, '1984-07-01', 'permanent', NULL, NULL, '2.4m DM (not converted)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(651, 243, 231, '1988-07-01', 'permanent', NULL, NULL, '8.4m DM (not converted)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(651, 231, 243, '1992-08-01', 'permanent', NULL, NULL, '4.2m DM (not converted)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(651, 243, 19032, '2000-03-01', 'undisclosed', NULL, NULL, 'Terms not stated (MetroStars)', 'Wikipedia (en, de)', '2026-10-09', 'month');

-- Jurgen Klinsmann (entity_id 652)
-- Tottenham loan: "winter of 1997-98" -- neither source says which side of New Year.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(652, NULL, 247, '1984-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (from Stuttgarter Kickers)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(652, 247, 231, '1989-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(652, 231, 264, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(652, 264, 200, '1994-07-01', 'permanent', NULL, 2000000, '£2m', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(652, 200, 243, '1995-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(652, 243, 19053, '1997-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(652, 19053, 200, '1997-12-01', 'loan', NULL, NULL, 'Loan (winter of 1997-98)', 'Wikipedia (en, de)', '2026-10-09', 'inconclusive'),
(652, NULL, NULL, '2003-07-01', 'undisclosed', NULL, NULL, 'Brief comeback with Orange County Blue Star [club not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Rudi Voller (entity_id 653)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(653, NULL, 19109, '1980-07-01', 'permanent', NULL, NULL, '700,000 DM (not converted) [Kickers Offenbach not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(653, 19109, 255, '1982-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(653, 255, 239, '1987-07-01', 'permanent', NULL, NULL, '9.3m DM (not converted)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(653, 239, 262, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(653, 262, 246, '1994-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Karl-Heinz Rummenigge (entity_id 654)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(654, NULL, 243, '1974-07-01', 'permanent', NULL, NULL, 'About €10,000 per one source [Borussia Lippstadt not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(654, 243, 231, '1984-07-01', 'permanent', 5700000, NULL, '€5.7m (reported as 10m-11m DM)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(654, 231, NULL, '1987-07-01', 'undisclosed', NULL, NULL, 'Fee not stated [Servette not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Uwe Seeler (entity_id 655)
-- A one-club player; six years after retiring he played one match for Cork Celtic.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(655, NULL, 19394, '1978-01-01', 'undisclosed', NULL, NULL, 'One-off guest appearance', 'Wikipedia (en)', '2026-10-09', 'year');

-- Bobby Moore (entity_id 656)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(656, 201, 192, '1974-03-01', 'permanent', NULL, 25000, '£25,000', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(656, 192, NULL, '1976-07-01', 'loan', NULL, NULL, 'Loan [San Antonio Thunder not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(656, NULL, NULL, '1978-04-01', 'undisclosed', NULL, NULL, 'Terms not stated [Herning Fremad not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(656, NULL, NULL, '1978-05-01', 'undisclosed', NULL, NULL, 'Terms not stated [Edmonton Black Gold not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month'),
(656, NULL, 19028, '1978-07-07', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(656, NULL, NULL, '1981-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Eastern (Hong Kong) not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(656, NULL, NULL, '1983-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Carolina Lightnin'' not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year');

-- Geoff Hurst (entity_id 657)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(657, 201, 314, '1972-08-01', 'permanent', NULL, 80000, '£80,000', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(657, 314, NULL, '1973-01-01', 'loan', NULL, NULL, 'Loan [Cape Town City not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(657, 314, 317, '1975-07-01', 'permanent', NULL, 20000, '£20,000', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(657, 317, 19394, '1976-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(657, 19394, 19028, '1976-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(657, 19028, NULL, '1976-08-01', 'undisclosed', NULL, NULL, 'Player-manager [Telford United not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Kenny Dalglish (entity_id 658)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(658, 287, 194, '1977-08-10', 'permanent', NULL, 440000, '£440,000, British record', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ian Rush (entity_id 659)
-- Juventus signed him on 2 July 1986 and loaned him straight back to Liverpool for 1986-87,
-- which is why de.wikipedia dates his Juventus spell from 1987.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(659, NULL, 194, '1980-04-01', 'permanent', NULL, 300000, '£300,000 [Chester not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(659, 194, 232, '1986-07-02', 'permanent', NULL, 3200000, '£3.2m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(659, 232, 194, '1986-07-02', 'loan', NULL, NULL, 'Loaned back for the 1986-87 season', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(659, 232, 194, '1988-08-18', 'permanent', NULL, 2800000, '£2.8m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(659, 194, 193, '1996-05-20', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(659, 193, 197, '1997-07-01', 'undisclosed', NULL, NULL, 'One-year contract; terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(659, 197, 308, '1998-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(659, 197, 319, '1998-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(659, 319, NULL, '1999-07-01', 'undisclosed', NULL, NULL, 'Terms not stated [Sydney Olympic not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Peter Crouch (entity_id 660)
-- Portsmouth 2001 fee: £1.5m (en) vs £1.25m (de). Portsmouth 2008: agreed 7 July, unveiled 11 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(660, 200, NULL, '2000-01-01', 'loan', NULL, NULL, 'Loan [Dulwich Hamlet not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(660, 200, NULL, '2000-06-01', 'loan', NULL, NULL, 'Loan [IFK Hassleholm not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(660, 200, 323, '2000-07-28', 'permanent', 98000, 60000, '£60,000 (~€98,000, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(660, 323, 324, '2001-07-01', 'permanent', NULL, NULL, 'Reported as £1.5m (en) or £1.25m (de)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(660, 324, 184, '2002-03-01', 'permanent', 7900000, 5000000, '£5m (~€7.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(660, 184, 310, '2003-09-01', 'loan', NULL, NULL, 'Loan (to December 2003)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(660, 184, 306, '2004-07-01', 'permanent', 2900000, 2000000, '£2m (~€2.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(660, 306, 194, '2005-07-19', 'permanent', 10300000, 7000000, '£7m (~€10.3m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(660, 194, 324, '2008-07-01', 'permanent', 13800000, 11000000, 'Up to £11m (~€13.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(660, 324, 200, '2009-07-27', 'permanent', 11200000, 10000000, '£10m (~€11.2m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(660, 200, 314, '2011-08-31', 'permanent', 11500000, 10000000, '£10m (~€11.5m, approx.), rising to £12m', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(660, 314, 188, '2019-01-31', 'undisclosed', NULL, NULL, 'Exchange for Sam Vokes', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jamie Vardy (entity_id 661)
-- Fleetwood fee: undisclosed (en), about €200,000 (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(661, NULL, NULL, '2010-06-01', 'permanent', NULL, 15000, '£15,000 [Stocksbridge Park Steels, FC Halifax Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(661, NULL, NULL, '2011-08-26', 'undisclosed', NULL, NULL, 'Undisclosed; about €200,000 per one source [FC Halifax Town, Fleetwood Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(661, NULL, 305, '2012-05-18', 'permanent', 1230000, 1000000, '£1m reported (~€1.2m, approx.) [Fleetwood Town not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(661, 305, 227, '2025-09-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(661, 227, 188, '2026-09-06', 'free', NULL, NULL, 'Free agent (one-season contract)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Sergio Busquets (entity_id 662)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(662, 206, 331, '2023-07-16', 'undisclosed', NULL, NULL, 'Terms not stated (announced 23 June 2023)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Marc-Andre ter Stegen (entity_id 663)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(663, 254, 206, '2014-05-22', 'permanent', 12000000, 9700000, '€12m (£9.7m); announced 19 May 2014', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(663, 206, 211, '2026-01-20', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(663, 206, 283, '2026-08-04', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Robert Pires (entity_id 664)
-- Aston Villa: he had been without a club since leaving Villarreal that summer.
-- FC Goa: he came out of retirement, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(664, 19129, 276, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(664, 276, 262, '1998-07-01', 'permanent', NULL, 5000000, '£5m', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(664, 262, 183, '2000-07-01', 'permanent', 10000000, 6000000, '£6m (about €10m; 66m francs)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(664, 183, 222, '2006-05-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(664, 222, 184, '2010-11-18', 'free', NULL, NULL, 'Free agent (six-month contract)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(664, NULL, NULL, '2014-09-02', 'undisclosed', NULL, NULL, 'Came out of retirement for FC Goa [club not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Patrick Vieira (entity_id 665)
-- Milan: "summer 1995" (en) vs November 1995 (fr) -- year only.
-- Arsenal: en.wikipedia says four days after 10 August 1996.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(665, 19136, 235, '1995-07-01', 'permanent', NULL, NULL, '32m francs (about €4m; not converted)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(665, 235, 183, '1996-08-14', 'permanent', NULL, 3500000, '£3.5m', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(665, 183, 232, '2005-08-15', 'permanent', 20000000, 13750000, '£13.75m (€20m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(665, 232, 231, '2006-08-02', 'permanent', 9500000, 6500000, '€9.5m (~£6.5m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(665, 231, 195, '2010-01-08', 'undisclosed', NULL, NULL, 'Fee not stated (six-month deal)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

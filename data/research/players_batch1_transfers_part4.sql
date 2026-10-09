-- Research output: transfer history for players 572-583 (van Nistelrooy to Pique).
-- Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same method, sources and date_precision rules as players_batch1_transfers_part2.sql.
-- Second sources here: Dutch / Spanish Wikipedia, Soccerway, club and press reports.
--
-- Announced vs effective: several of these moves were announced months before they happened
-- (Beckham, Gerrard, Lampard and Xavi all signed pre-contracts). transfer_date is the date the
-- player actually joined, where a source states it; the announcement date is in display_value.
--
-- No rows for two players:
--   Ryan Giggs (573)   -- one-club player, no transfer or loan.
--   Paul Scholes (574) -- one-club professional; his 2018 amateur appearances for Royton Town
--                         (club not in pool) are not written.

-- Ruud van Nistelrooy (entity_id 572)
-- Fees for the two Dutch moves and the Real Madrid move differ between en and nl Wikipedia.
-- Manchester United: nl.wikipedia dates the news of the deal to 23 April 2001.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(572, 19396, 18973, '1997-07-01', 'permanent', NULL, NULL, 'Reported as €360,000 (en) or just over 1m guilders (nl)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(572, 18973, 284, '1998-07-01', 'permanent', NULL, NULL, 'Reported as €6.3m (en) or 12m guilders / €5.4m (nl)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(572, 284, 196, '2001-04-01', 'permanent', 30400000, 19000000, '£19m (€30.4m), British record', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(572, 196, 217, '2006-07-28', 'permanent', NULL, NULL, 'Reported as €14m-€15m (sources differ)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(572, 217, 260, '2010-01-23', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(572, 260, 402, '2011-06-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- David Beckham (entity_id 575)
-- Real Madrid: €35m (about £25m) in the Manchester United statement and es.wikipedia;
-- en.wikipedia says €37m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(575, 196, 343, '1995-03-01', 'loan', NULL, NULL, 'Loan (debut 4 Mar 1995)', 'Wikipedia (en, es)/Lancashire Evening Post', '2026-10-09', 'year'),
(575, 196, 217, '2003-07-01', 'permanent', 35000000, 25000000, '€35m (£25m)', 'Wikipedia (en, es)/PA', '2026-10-09', 'day'),
(575, 217, 332, '2007-07-01', 'undisclosed', NULL, NULL, 'No transfer fee stated (announced 11 Jan 2007; joined when his Real Madrid contract ended)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(575, 332, 235, '2009-01-07', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(575, 332, 235, '2010-01-01', 'loan', NULL, NULL, 'Loan (confirmed Nov 2009)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(575, 332, 261, '2013-01-31', 'free', NULL, NULL, 'Free agent (five-month contract)', 'Wikipedia (es)/AP', '2026-10-09', 'day');

-- Steven Gerrard (entity_id 576)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(576, 194, 332, '2015-07-01', 'free', NULL, NULL, 'Free transfer (announced 7 Jan 2015)', 'Wikipedia (en)/LA Galaxy/AFP', '2026-10-09', 'month');

-- Frank Lampard (entity_id 577)
-- Chelsea: 14 June 2001 in one source, 11 June in another.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(577, 201, 321, '1995-10-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'month'),
(577, 201, 189, '2001-06-01', 'permanent', 17700000, 11000000, '£11m (~€17.7m, approx.)', 'Wikipedia (en)/Sports Illustrated', '2026-10-09', 'month'),
(577, 189, 195, '2014-08-03', 'free', NULL, NULL, 'Short-term contract as a free agent', 'Wikipedia (en)', '2026-10-09', 'day'),
(577, 195, 19031, '2015-07-01', 'free', NULL, NULL, 'Free transfer (pre-contract signed 10 Jan 2015)', 'Wikipedia (en)', '2026-10-09', 'day');

-- John Terry (entity_id 578)
-- Forest loan: 21 March 2000 in one database, 23 March in another.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(578, 189, 198, '2000-03-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)/Chelsea FC/Soccerway', '2026-10-09', 'month'),
(578, 189, 184, '2017-07-03', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/Huddersfield Daily Examiner', '2026-10-09', 'day');

-- Rio Ferdinand (entity_id 579)
-- Leeds: Soccerway says 26 November 2000; another report says it was completed days later.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(579, 201, 185, '1996-11-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'month'),
(579, 201, 193, '2000-11-01', 'permanent', 29500000, 18000000, '£18m (~€29.5m, approx.), British record', 'Wikipedia (en)/Yorkshire Evening Post/Soccerway', '2026-10-09', 'month'),
(579, 193, 196, '2002-07-22', 'permanent', 46500000, 29300000, '£29.3m (~€46.5m, approx.), rising to £33.3m with add-ons', 'Wikipedia (en)', '2026-10-09', 'day'),
(579, 196, 323, '2014-07-17', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/AP/Soccerway', '2026-10-09', 'day');

-- Xavi Hernandez (entity_id 580)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(580, 206, 19447, '2015-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (announced 21 May 2015; joined at the end of 2014-15)', 'Wikipedia (en)', '2026-10-09', 'year');

-- Andres Iniesta (entity_id 581)
-- Emirates Club: arrived 7 August 2023 (en), made official 9 August (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(581, 206, 19441, '2018-05-24', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(581, 19441, NULL, '2023-08-01', 'undisclosed', NULL, NULL, 'Fee not stated [Emirates Club not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'month');

-- Sergio Ramos (entity_id 582)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(582, 220, 217, '2005-07-01', 'permanent', 27000000, 18400000, '€27m (~£18.4m, approx.), record for a Spanish defender', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(582, 217, 261, '2021-07-08', 'free', NULL, NULL, 'Free transfer (out of contract)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(582, 261, 220, '2023-09-04', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(582, 220, 338, '2025-02-06', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Gerard Pique (entity_id 583)
-- Not written: his 2004 move from Barcelona's academy to Manchester United (youth, no fee).
-- Barcelona: 27 May 2008 (en) vs 25 May (es); fee £5m (en) vs €5m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(583, 196, 403, '2006-08-04', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(583, 196, 206, '2008-05-01', 'permanent', NULL, NULL, 'Reported as £5m (en) or €5m (es)', 'Wikipedia (en, es)', '2026-10-09', 'month');

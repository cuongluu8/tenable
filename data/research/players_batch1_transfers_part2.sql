-- Research output: transfer history for players 548-559 (the next 12 rows of
-- candidate_players_batch1.csv after the original 18). Researched 2026-10-09.
-- FOR HUMAN REVIEW BEFORE APPLYING. Requires migration_transfers_date_precision.sql first.
--
-- Sources: each player's English Wikipedia article read in full for the move list and fees,
-- then a second source for dates -- the Italian/Portuguese/French Wikipedia article, Soccerway's
-- transfer log, or contemporary press (UEFA.com, Reuters, PA, club sites).
--
-- date_precision (rule set by the user 2026-10-09; says how much of transfer_date is real):
--   'day'          a source states the day and no other source contradicts it
--   'month'        a source states the month and the others agree on the year; transfer_date is
--                  the 1st. Also used when two sources give different days in one month, and
--                  when they give different months in one year (the EARLIER month is stored).
--   'year'         sources give only the year (or "summer", "early", a debut date). The month
--                  and day of transfer_date are a placeholder that keeps the moves in order.
--   'inconclusive' sources disagree on the year, or none states one. Never use the date.
-- These rows were first applied with a stricter labelling (42 'inconclusive');
-- migration_transfers_date_precision_v2.sql removes those rows so this file can be re-applied.
--
-- Fees: written only when sources agree. Where they conflict, or only one weak source gives a
-- figure, both fee columns are NULL and display_value says what was reported. A single-currency
-- fee from 2000 onwards is converted with the approximate annual table in
-- docs/stats-enrichment.md and marked "approx."; pre-2000 fees are not converted.
-- Loan returns are not written as rows (same as players_batch1_transfers.sql).
-- NULL club id = club not in the local entity pool; named in display_value.

-- George Weah (entity_id 548)
-- Not written: his 1984-87 moves between Liberian/Ivorian/Cameroonian clubs (Young Survivors,
-- Bong Range United, Mighty Barrolle, Invincible Eleven, Africa Sports, Tonnerre Yaoundé) --
-- none of the clubs are in the pool and the sources give years only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(548, NULL, 264, '1988-07-01', 'permanent', NULL, 12000, '£12,000 [Tonnerre Yaoundé not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(548, 264, 261, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not found in any source checked', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(548, 261, 235, '1995-07-01', 'permanent', NULL, NULL, 'Fee disputed: about £5m (11v11) vs €7m (Il Post)', 'Wikipedia (en, fr)/11v11/Il Post', '2026-10-09', 'year'),
(548, 235, 189, '2000-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)/11v11', '2026-10-09', 'month'),
(548, 235, 195, '2000-08-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(548, 195, 262, '2000-10-01', 'undisclosed', NULL, NULL, 'Terms not stated (left Manchester City 16 Oct 2000, Marseille debut 22 Oct 2000)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(548, 262, 19377, '2001-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year');

-- Roberto Baggio (entity_id 549)
-- Inter -> Brescia: Soccerway's 1 July 2000 is a season-start placeholder, not a signing date.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(549, 19084, 228, '1985-05-01', 'permanent', NULL, 1500000, '£1.5m (2.7bn lire)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(549, 228, 232, '1990-05-01', 'permanent', NULL, 8000000, '£8m (about 25bn lire plus Renato Buso)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(549, 232, 235, '1995-07-01', 'permanent', NULL, 6800000, '£6.8m (18bn lire)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(549, 235, 224, '1997-07-18', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)/Soccerway', '2026-10-09', 'day'),
(549, 224, 231, '1998-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)/Soccerway', '2026-10-09', 'year'),
(549, 231, 19056, '2000-07-01', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en)/Soccerway', '2026-10-09', 'year');

-- Michael Owen (entity_id 550)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(550, 194, 217, '2004-08-13', 'permanent', 11800000, 8000000, '£8m (~€11.8m, approx.) plus Antonio Núñez', 'Wikipedia (en)/Soccerway', '2026-10-09', 'day'),
(550, 217, 197, '2005-08-31', 'permanent', 24700000, 16800000, '£16.8m (~€24.7m, approx.), club record', 'Wikipedia (en)/Soccerway', '2026-10-09', 'day'),
(550, 197, 196, '2009-07-03', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/Soccerway', '2026-10-09', 'day'),
(550, 196, 314, '2012-09-04', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/Soccerway', '2026-10-09', 'day');

-- Alan Shearer (entity_id 551)
-- Blackburn -> Newcastle: 30 July (en.wikipedia) vs "clinched 28 July" (Lancashire Telegraph);
-- one biography says 6 August. July 1996 is the agreed month.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(551, 306, 313, '1992-07-27', 'permanent', NULL, 3600000, '£3.6m, British record', 'Wikipedia (en)/PA', '2026-10-09', 'day'),
(551, 313, 197, '1996-07-01', 'permanent', NULL, 15000000, '£15m, world record', 'Wikipedia (en)/Lancashire Telegraph', '2026-10-09', 'month');

-- Wayne Rooney (entity_id 552)
-- Everton -> Manchester United: £25.6m is the commonly quoted figure (user decision 2026-10-09);
-- the club statement was £20m plus up to £7m in contingent payments.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(552, 191, 196, '2004-08-31', 'permanent', 37600000, 25600000, '£25.6m (~€37.6m, approx.), rising to £27m with add-ons', 'Wikipedia (en)/Manchester Evening News', '2026-10-09', 'day'),
(552, 196, 191, '2017-07-09', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/Reuters', '2026-10-09', 'day'),
(552, 191, 19034, '2018-06-28', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)/Sports Illustrated', '2026-10-09', 'day'),
(552, 19034, 316, '2020-01-01', 'undisclosed', NULL, NULL, 'Joined as player-coach; fee not stated', 'Wikipedia (en)/AFP', '2026-10-09', 'month');

-- Andriy Shevchenko (entity_id 553)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(553, 296, 235, '1999-05-01', 'permanent', NULL, NULL, '$25m (reported in USD; EUR/GBP not sourced)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(553, 235, 189, '2006-05-01', 'permanent', 43875000, 30800000, '€43.875m (£30.8m)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(553, 189, 235, '2008-08-23', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(553, 189, 296, '2009-08-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)/Soccerway/UEFA', '2026-10-09', 'month');

-- Pavel Nedved (entity_id 554)
-- Not written: his 2017 amateur comeback with FK Skalná, eight years after retiring.
-- Plzeň -> Dukla: en.wikipedia says 1990, it.wikipedia says 1991.
-- Košice -> Lazio: en.wikipedia prints the fee as "₤1.2 million", it.wikipedia as 9bn lire.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(554, 19445, 19449, '1990-07-01', 'loan', NULL, NULL, 'Loan (sources differ on the year: 1990 or 1991)', 'Wikipedia (en, it)', '2026-10-09', 'inconclusive'),
(554, 19449, 302, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(554, 302, NULL, '1996-07-01', 'permanent', NULL, NULL, '1.5m CZK (not converted) [1. FC Košice not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'year'),
(554, NULL, 233, '1996-07-01', 'permanent', NULL, NULL, 'Fee unclear: "₤1.2 million" (en) vs 9bn lire (it) [1. FC Košice not in local club pool]', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(554, 233, 232, '2001-07-01', 'permanent', 38700000, 24000000, '€38.7m (75bn lire; ~£24.0m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'month');

-- Fabio Cannavaro (entity_id 555)
-- Not written: the 2012 Siliguri (India) deal -- the league never started.
-- Parma -> Inter: €23m in en/it Wikipedia and UEFA.com; Gazzetta dello Sport reported €15m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(555, 236, 237, '1995-07-01', 'permanent', NULL, NULL, '13bn lire (not converted)', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(555, 237, 231, '2002-08-01', 'permanent', 23000000, 14500000, '€23m (~£14.5m, approx.)', 'Wikipedia (en, it)/UEFA', '2026-10-09', 'month'),
(555, 231, 232, '2004-08-01', 'permanent', NULL, NULL, 'Swap for Fabián Carini (each valued at €10m, no cash)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(555, 232, 217, '2006-07-19', 'permanent', 7000000, 4800000, '€7m (~£4.8m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(555, 217, 232, '2009-05-19', 'free', NULL, NULL, 'Free transfer (confirmed 19 May 2009, effective that summer)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(555, 232, 19376, '2010-06-02', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Kaka (entity_id 556)
-- São Paulo -> Milan: UEFA.com says June 2003; both Wikipedias give the year only.
-- Milan -> Real Madrid: €67m (en.wikipedia) vs an estimated €65m (pt.wikipedia).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(556, 37, 235, '2003-06-01', 'permanent', 8500000, 5900000, '€8.5m (~£5.9m, approx.)', 'Wikipedia (en, pt)/UEFA', '2026-10-09', 'month'),
(556, 235, 217, '2009-06-08', 'permanent', NULL, NULL, 'Fee reported as €65m-€67m (sources differ)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(556, 217, 235, '2013-09-02', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(556, 235, 19038, '2014-07-01', 'free', NULL, NULL, 'Free transfer (Milan contract terminated)', 'Wikipedia (pt)/Orlando City/AP', '2026-10-09', 'day'),
(556, 19038, 37, '2014-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, pt)/AP', '2026-10-09', 'month');

-- Rivaldo (entity_id 557)
-- Not written: Santa Cruz -> Mogi Mirim (1992, swapped for five players) -- pt.wikipedia only.
-- Bunyodkor -> São Paulo: en.wikipedia calls it a loan, but he had left Bunyodkor in Aug 2010.
-- AEK -> Bunyodkor: pt.wikipedia calls €10m a fee; en.wikipedia says it was the contract value.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(557, 19416, 39, '1993-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(557, 19416, 30, '1994-08-11', 'permanent', NULL, NULL, 'About US$2.5m / R$2.3m-2.4m (sources differ slightly; not converted)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(557, 30, 401, '1996-07-01', 'permanent', NULL, NULL, '$7m per one source (unconfirmed)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(557, 401, 206, '1997-07-01', 'permanent', NULL, NULL, '4bn pesetas (about $26m-$30m; EUR/GBP not sourced)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(557, 206, 235, '2002-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (pt)/UEFA', '2026-10-09', 'month'),
(557, 235, 40, '2004-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(557, 40, 297, '2004-07-22', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(557, 297, 19011, '2007-05-01', 'free', NULL, NULL, 'Released by Olympiacos', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(557, 19011, 19390, '2008-08-25', 'undisclosed', NULL, NULL, 'Fee unclear: €10m reported as a fee (pt) or as the contract value (en)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(557, 19390, 37, '2011-01-23', 'undisclosed', NULL, NULL, 'Terms unclear', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(557, 37, NULL, '2012-01-01', 'undisclosed', NULL, NULL, 'Terms not stated [Kabuscorp not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(557, NULL, NULL, '2013-01-16', 'undisclosed', NULL, NULL, 'Terms not stated [Kabuscorp, São Caetano not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(557, NULL, 19416, '2013-12-01', 'undisclosed', NULL, NULL, 'Terms not stated [São Caetano not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Romario (entity_id 558)
-- Fees: Vasco -> PSV is $4m, $5m or $6m depending on the source; PSV -> Barcelona ranges from
-- $4.1m to $12m. Neither is written.
-- Flamengo -> Vasco: en.wikipedia says 2000, pt.wikipedia says "still in 1999".
-- Fluminense -> Al Sadd: February 2003 (en) vs March (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(558, 46, 284, '1988-10-01', 'permanent', NULL, NULL, 'Fee disputed: $4m-$6m depending on source', 'Wikipedia (en, pt)/El Gráfico', '2026-10-09', 'year'),
(558, 284, 206, '1993-07-01', 'permanent', NULL, NULL, 'Fee disputed: $4.1m-$12m depending on source', 'Wikipedia (en, pt)/El Gráfico/Trivela', '2026-10-09', 'year'),
(558, 206, 31, '1995-01-01', 'permanent', NULL, NULL, 'About US$4.5m per one source (unconfirmed)', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(558, 31, 221, '1996-06-10', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(558, 221, 31, '1996-10-26', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(558, 221, 31, '1997-12-18', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(558, 31, 46, '2000-01-01', 'undisclosed', NULL, NULL, 'Terms not stated (sources differ on the year: late 1999 or 2000)', 'Wikipedia (en, pt)', '2026-10-09', 'inconclusive'),
(558, 46, 32, '2002-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(558, 32, 19447, '2003-02-01', 'loan', NULL, NULL, 'Loan (three-month contract)', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(558, 32, 46, '2005-01-01', 'undisclosed', NULL, NULL, 'Terms not stated (left Fluminense 21 Oct 2004)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(558, 46, 19414, '2006-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(558, 19414, 19446, '2006-11-01', 'loan', NULL, NULL, 'Loan (guest stint)', 'Wikipedia (en)', '2026-10-09', 'year'),
(558, 19414, 46, '2007-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(558, 46, NULL, '2009-08-01', 'undisclosed', NULL, NULL, 'Terms not stated [America-RJ not in local club pool]', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Pele (entity_id 559)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(559, NULL, 44, '1956-06-01', 'undisclosed', NULL, NULL, 'First professional contract (from Bauru AC youth); no fee recorded', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(559, 44, 19419, '1975-06-10', 'undisclosed', NULL, NULL, 'Signed out of semi-retirement; no transfer fee recorded', 'Wikipedia (en)/New York Times/Trivela', '2026-10-09', 'day');

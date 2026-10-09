-- Research output: transfer history for players 596-607 (Falcao to Sneijder).
-- Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same method, sources and date_precision rules as players_batch1_transfers_part2.sql.
-- Second sources here: Spanish / Italian / German / Dutch Wikipedia.
-- Loan fees are in display_value only; the fee columns stay NULL for loans (see db/schema.sql).
-- A loan later made permanent is a second row dated when it became permanent.

-- Radamel Falcao (entity_id 596)
-- Porto fee: €3.93m for 60% of his rights (en) vs €5.5m (es). Monaco: about €60m (en) vs €63m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(596, 19409, 23, '2001-02-01', 'permanent', NULL, NULL, '$500,000 (reported in USD)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(596, 23, 279, '2009-07-15', 'permanent', NULL, NULL, 'Reported as €3.93m for 60% of his rights (en) or €5.5m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 279, 205, '2011-08-18', 'permanent', 40000000, 34800000, '€40m (~£34.8m, approx.), rising to €50m with clauses', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 205, 264, '2013-05-31', 'undisclosed', NULL, NULL, 'Undisclosed; reported as €60m-€63m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 264, 196, '2014-09-01', 'loan', NULL, NULL, 'Season-long loan (£6m loan fee)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(596, 264, 189, '2015-07-03', 'loan', NULL, NULL, 'Season-long loan (£4m loan fee)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 264, 289, '2019-09-02', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 289, 215, '2021-09-04', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, 215, 119, '2024-06-20', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(596, NULL, 119, '2026-01-07', 'free', NULL, NULL, 'Rejoined after six months as a free agent', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- James Rodriguez (entity_id 597)
-- Banfield: es.wikipedia describes it as a two-year loan; en.wikipedia just says "signed".
-- Monaco: 25 May 2013 (en) vs 24 May (es). Atletico Nacional: 12 Sept 2026 (en) vs 10 Sept (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(597, 113, 15, '2008-02-01', 'undisclosed', NULL, NULL, 'Terms unclear (one source describes a loan)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(597, 15, 279, '2010-07-06', 'permanent', 5100000, 4400000, '€5.1m (~£4.4m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 279, 264, '2013-05-01', 'permanent', 45000000, 38300000, '€45m (~£38.3m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(597, 264, 217, '2014-07-22', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about €80m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 217, 243, '2017-07-11', 'loan', NULL, NULL, 'Two-season loan (€13m loan fee)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 217, 191, '2020-09-07', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 191, 19379, '2021-09-22', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 19379, 297, '2022-09-15', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 297, 37, '2023-07-29', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 37, 215, '2024-08-26', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 215, 19017, '2025-01-13', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 19017, 19049, '2026-02-06', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(597, 19049, 107, '2026-09-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'month');

-- Diego Forlan (entity_id 598)
-- Villarreal: 21 Aug 2004 (en) vs 20 Aug (es). Atletico fee: about €21m (en) vs €23m plus bonuses (es).
-- Mumbai City: August 2016 (en); es.wikipedia's infobox says 2016 but its text says 2017.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(598, 20, 196, '2002-01-22', 'permanent', 11000000, 6900000, '£6.9m (~€11.0m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 196, 222, '2004-08-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(598, 222, 205, '2007-06-30', 'permanent', NULL, NULL, 'Reported as about €21m (en) or €23m plus bonuses (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 205, 231, '2011-08-29', 'undisclosed', NULL, NULL, 'No financial details announced', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 231, 43, '2012-07-06', 'free', NULL, NULL, 'Free transfer (Inter contract terminated)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 43, 19391, '2014-01-22', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 19391, 66, '2015-07-10', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(598, 66, 19417, '2016-08-01', 'undisclosed', NULL, NULL, 'Terms not stated (three-month deal)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(598, 19417, 19408, '2018-01-04', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Zlatan Ibrahimovic (entity_id 599)
-- Ajax: announced 22 March 2001, joined July 2001; fee €8.7m (en) vs €7.8m (it).
-- Barcelona: 23-27 July 2009 depending on source; €46m (en) vs €49m (it), plus Samuel Eto'o.
-- PSG: 17 July 2012 for €20m (en) vs 18 July for €21m (it).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(599, 19412, 283, '2001-07-01', 'permanent', NULL, NULL, 'Reported as €8.7m (en) or €7.8m (it); announced 22 Mar 2001', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(599, 283, 232, '2004-07-01', 'permanent', 16000000, 10900000, '€16m (~£10.9m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'year'),
(599, 232, 231, '2006-08-10', 'permanent', 24800000, 16900000, '€24.8m (~£16.9m, approx.)', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(599, 231, 206, '2009-07-01', 'permanent', NULL, NULL, 'About €46m-€49m plus Samuel Eto''o (sources differ)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(599, 206, 235, '2010-08-28', 'loan', NULL, NULL, 'Loan with a €24m option to buy', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(599, 206, 235, '2011-06-18', 'undisclosed', NULL, NULL, 'Loan made permanent (option had been set at €24m)', 'Wikipedia (en)', '2026-10-09', 'day'),
(599, 235, 261, '2012-07-01', 'permanent', NULL, NULL, 'Reported as €20m-€21m (sources differ)', 'Wikipedia (en, it)', '2026-10-09', 'month'),
(599, 261, 196, '2016-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(599, 196, 332, '2018-03-23', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(599, 332, 235, '2020-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, it)', '2026-10-09', 'month');

-- Thomas Muller (entity_id 600)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(600, 243, 19051, '2025-08-06', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en)', '2026-10-09', 'day');

-- Manuel Neuer (entity_id 601)
-- Fee from de.wikipedia only; en.wikipedia states none.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(601, 19057, 243, '2011-06-01', 'permanent', 20000000, 17400000, '€20m (~£17.4m, approx.), rising to €30m with bonuses', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Toni Kroos (entity_id 602)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(602, 243, 246, '2009-01-31', 'loan', NULL, NULL, '18-month loan', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(602, 243, 217, '2014-07-17', 'undisclosed', NULL, NULL, 'Undisclosed; reported as €24m-€30m', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Sergio Aguero (entity_id 603)
-- Manchester City fee: about £35m (en) vs €35m (es).
-- Barcelona: agreed 31 May 2021, contract from 1 July 2021.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(603, 20, 205, '2006-05-30', 'permanent', 20000000, 13600000, '€20m (~£13.6m, approx.), club record', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(603, 205, 195, '2011-07-28', 'permanent', NULL, NULL, 'Reported as about £35m (en) or €35m (es)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(603, 195, 206, '2021-07-01', 'free', NULL, NULL, 'Free transfer (agreed 31 May 2021)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- David Villa (entity_id 604)
-- Zaragoza fee: about €3m (en) vs €2.7m (es). Barcelona: 19 May 2010 (en) vs 21 May (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(604, 405, 403, '2003-07-01', 'permanent', NULL, NULL, 'Reported as about €3m (en) or €2.7m (es)', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(604, 403, 221, '2005-06-01', 'permanent', 12000000, 8200000, '€12m (~£8.2m, approx.), release clause', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(604, 221, 206, '2010-05-01', 'permanent', 40000000, 34400000, '€40m (~£34.4m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(604, 206, 205, '2013-07-08', 'permanent', 5100000, 4300000, 'Up to €5.1m (~£4.3m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(604, 205, 19031, '2014-06-02', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(604, 19031, 19451, '2014-06-05', 'loan', NULL, NULL, 'Loan (guest stint)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(604, 19031, 19441, '2018-12-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Fernando Torres (entity_id 605)
-- Liverpool fee: rumoured £25m, about £20m per Benitez, €36m per es.wikipedia.
-- Milan loan: 31 Aug 2014 (en) vs 29 Aug (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(605, 205, 194, '2007-07-01', 'permanent', NULL, NULL, 'Fee disputed: £20m-£25m, or €36m, depending on source', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(605, 194, 189, '2011-01-31', 'permanent', 58000000, 50000000, 'Undisclosed; reported as £50m (€58m)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(605, 189, 235, '2014-08-01', 'loan', NULL, NULL, 'Two-year loan', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(605, 235, 205, '2014-12-29', 'loan', NULL, NULL, 'Loan until the end of 2015-16', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(605, 235, 205, '2016-07-05', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(605, 205, 19430, '2018-07-10', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Xabi Alonso (entity_id 606)
-- Liverpool: £10.7m in both sources (en.wikipedia's lead says £10.5m); not converted because
-- es.wikipedia's own euro figure ("about €12m") does not match the conversion table.
-- Real Madrid: 5 Aug 2009 (en) vs 4 Aug (es). Bayern: undisclosed (en) vs €10m (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(606, 219, 411, '2000-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(606, 219, 194, '2004-08-20', 'permanent', NULL, 10700000, '£10.7m', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(606, 194, 217, '2009-08-01', 'permanent', 35000000, 30000000, '£30m (about €35m)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(606, 217, 243, '2014-08-29', 'undisclosed', NULL, NULL, 'Undisclosed; reported as €10m', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Wesley Sneijder (entity_id 607)
-- Inter: 27 Aug 2009 (en) vs 26 Aug (nl). Galatasaray: 20 Jan 2013 (en) vs 22 Jan (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(607, 283, 217, '2007-08-12', 'permanent', 27000000, 18400000, '€27m (~£18.4m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(607, 217, 231, '2009-08-01', 'permanent', 15000000, 13400000, '€15m reported (~£13.4m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(607, 231, 289, '2013-01-01', 'permanent', 7500000, 6500000, '€7.5m (~£6.5m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(607, 289, 266, '2017-08-07', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(607, 266, 19378, '2018-01-01', 'free', NULL, NULL, 'Free agent (released by Nice)', 'Wikipedia (en, nl)', '2026-10-09', 'month');

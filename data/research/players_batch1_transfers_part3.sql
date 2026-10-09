-- Research output: transfer history for players 560-571 (Maradona to Bergkamp).
-- Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same method, sources and date_precision rules as players_batch1_transfers_part2.sql: the
-- English Wikipedia article for the move list, then a second source for dates (Spanish / Dutch /
-- German / Portuguese Wikipedia, contemporary or retrospective press).
--
-- These are mostly 1950s-80s careers and the sources rarely give more than a year, so most
-- dates here are 'year': the month and day are then a placeholder (YYYY-01-01 / YYYY-07-01, or
-- an approximate month) chosen only to keep a player's moves in order. The five 'inconclusive'
-- rows are the ones where sources disagree on the year itself.
-- Pre-2000 fees are not converted; a fee in guilders, pesetas, escudos, DM or USD is left in
-- display_value with both fee columns NULL.

-- Diego Maradona (entity_id 560)
-- Napoli: "confirmed 29 June 1984" (es) vs "presented 5 July 1984" (en) -- different events.
-- Sevilla: es.wikipedia gives a fee of about €5.7m, a later conversion from a single source.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(560, 1, 22, '1981-02-20', 'permanent', NULL, NULL, 'US$4m (reported in USD)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(560, 22, 206, '1982-07-01', 'permanent', NULL, 5000000, '£5m ($7.6m; 1,200m pesetas), world record', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(560, 206, 236, '1984-06-29', 'permanent', NULL, 6900000, '£6.9m ($10.48m; 1,185m pesetas), world record', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(560, 236, 220, '1992-09-01', 'permanent', NULL, NULL, 'About €5.7m per one source (later conversion, unconfirmed)', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(560, 220, 14, '1993-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(560, 14, 22, '1995-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, es)', '2026-10-09', 'year');

-- Johan Cruyff (entity_id 561)
-- Barcelona: "mid-1973" (en) vs contract signed 22 August 1973 (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(561, 283, 206, '1973-08-22', 'permanent', NULL, NULL, '6m guilders (about US$2m)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(561, 206, 19411, '1979-05-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(561, 19411, 19442, '1980-02-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(561, 19442, 212, '1981-02-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(561, 19442, 283, '1981-12-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(561, 283, 285, '1983-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'year');

-- Franz Beckenbauer (entity_id 562)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(562, 243, 19419, '1977-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(562, 19419, 260, '1980-05-23', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(562, 260, 19419, '1983-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'year');

-- Gerd Muller (entity_id 563)
-- Bayern: en.wikipedia text says 1963; de.wikipedia says he signed on 10 July 1964.
-- Not written: Smith Brothers Lounge (1981) -- de.wikipedia only, year only, club not in pool.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(563, NULL, 243, '1964-07-10', 'permanent', NULL, NULL, '4,400 DM per one source (sources differ on the year: 1963 or 1964) [TSV 1861 Nördlingen not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'inconclusive'),
(563, 243, 19399, '1979-03-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'month');

-- Eusebio (entity_id 564)
-- Benfica: en.wikipedia says finalised 13 May 1961 for 400,000 escudos; pt.wikipedia places the
-- signing in 1960 and mentions 250,000 escudos paid to his mother.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(564, 19433, 280, '1961-05-13', 'permanent', NULL, NULL, 'Fee unclear: 400,000 escudos (en) vs 250,000 escudos (pt); sources also differ on 1960 or 1961', 'Wikipedia (en, pt)', '2026-10-09', 'inconclusive'),
(564, 280, 19385, '1975-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19385, 338, '1975-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'inconclusive'),
(564, 338, 19437, '1976-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19437, 19382, '1976-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19382, 19410, '1977-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19410, 19440, '1977-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19440, 19418, '1978-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(564, 19418, 19389, '1979-07-01', 'undisclosed', NULL, NULL, 'Terms not stated (indoor season)', 'Wikipedia (en, pt)', '2026-10-09', 'year');

-- Bobby Charlton (entity_id 565)
-- Not written: an unnamed South African club after 1983.
-- Perth Azzurri: 1979 in en.wikipedia's career table, 1980 in its infobox.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(565, 196, 343, '1974-07-01', 'undisclosed', NULL, NULL, 'Joined Preston as manager in 1973; player-manager from 1974-75', 'Wikipedia (en)/Blackpool Gazette', '2026-10-09', 'year'),
(565, 343, 19443, '1976-01-11', 'undisclosed', NULL, NULL, 'Short-term contract', 'Wikipedia (en)/These Football Times', '2026-10-09', 'day'),
(565, 19443, 19420, '1978-01-01', 'undisclosed', NULL, NULL, 'Guest stint; terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(565, 19420, 19425, '1980-01-01', 'undisclosed', NULL, NULL, 'Guest stint; terms not stated', 'Wikipedia (en)', '2026-10-09', 'inconclusive'),
(565, 19425, 19383, '1980-07-01', 'undisclosed', NULL, NULL, 'Guest stint; terms not stated', 'Wikipedia (en)', '2026-10-09', 'year');

-- Garrincha (entity_id 566)
-- Not written: Portuguesa Santista (1967), Fortaleza (1968), Novo Hamburgo, Riograndense,
-- Cordeiros (pt.wikipedia only, clubs not in pool) and Sacrofano (en.wikipedia infobox only).
-- Because of those gaps, from_club is NULL for the Atlético Junior move.
-- Flamengo: 1968 (en) vs 1969 (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(566, NULL, 41, '1953-07-01', 'permanent', NULL, NULL, '2,000 cruzeiros per one source', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(566, 41, 39, '1966-03-01', 'permanent', NULL, NULL, 'Sold; fee not stated', 'Wikipedia (en, pt)', '2026-10-09', 'month'),
(566, NULL, 19381, '1968-08-01', 'undisclosed', NULL, NULL, 'Terms not stated (one match)', 'Wikipedia (en, pt)', '2026-10-09', 'year'),
(566, 19381, 31, '1968-12-01', 'undisclosed', NULL, NULL, 'Terms not stated (sources differ on the year: 1968 or 1969)', 'Wikipedia (en, pt)', '2026-10-09', 'inconclusive'),
(566, 31, 19423, '1972-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'year');

-- George Best (entity_id 567)
-- Almost every move is a short guest or pay-per-play stint known only by year.
-- Hibernian: he was still registered with Fulham, who received the fee.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(567, 196, 19405, '1974-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 196, 19397, '1974-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)/RSSSF', '2026-10-09', 'year'),
(567, 19397, 362, '1975-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)/RSSSF', '2026-10-09', 'year'),
(567, 362, 19394, '1975-12-01', 'undisclosed', NULL, NULL, 'Rolling contract', 'Wikipedia (en)', '2026-10-09', 'month'),
(567, 19394, 19411, '1976-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)/RSSSF', '2026-10-09', 'year'),
(567, 19411, 192, '1976-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)/RSSSF', '2026-10-09', 'year'),
(567, 192, 19411, '1977-01-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 19411, 19399, '1978-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 192, 395, '1979-11-16', 'permanent', NULL, 57500, '£57,500 paid to Fulham, who held his registration (pay-per-play deal)', 'Wikipedia (en)/The Courier/The Scotsman', '2026-10-09', 'day'),
(567, 395, 19043, '1980-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 19043, 19431, '1982-01-01', 'undisclosed', NULL, NULL, 'Guest player', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 19043, 19402, '1982-01-01', 'undisclosed', NULL, NULL, 'Guest player', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 19402, 185, '1982-12-01', 'undisclosed', NULL, NULL, 'Terms not stated (signed late 1982)', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 185, 19387, '1983-07-01', 'undisclosed', NULL, NULL, 'Four-match stint', 'Wikipedia (en)', '2026-10-09', 'year'),
(567, 19387, 19435, '1984-02-11', 'undisclosed', NULL, NULL, 'One match', 'Wikipedia (en)', '2026-10-09', 'day');

-- Marco van Basten (entity_id 568)
-- nl.wikipedia: the Milan contract was settled in March 1987, the move followed that summer.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(568, 283, 235, '1987-07-01', 'permanent', NULL, NULL, 'Buyout clause of at most 1.7m guilders per one source', 'Wikipedia (en, nl)', '2026-10-09', 'year');

-- Ruud Gullit (entity_id 569)
-- PSV -> Milan: 18m guilders (en) vs 16.5m guilders (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(569, NULL, 19401, '1978-09-22', 'undisclosed', NULL, NULL, 'First professional contract (from DWS youth)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(569, 19401, 285, '1982-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(569, 285, 284, '1985-07-01', 'permanent', NULL, NULL, '1.2m guilders (not converted)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(569, 284, 235, '1987-07-01', 'permanent', NULL, NULL, 'World record, reported as 16.5m-18m guilders (sources differ)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(569, 235, 19053, '1993-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(569, 235, 19053, '1994-11-01', 'undisclosed', NULL, NULL, 'Terms not stated (rejoined before the midpoint of 1994-95)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(569, 19053, 189, '1995-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, nl)', '2026-10-09', 'month');

-- Frank Rijkaard (entity_id 570)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(570, 283, 281, '1987-09-01', 'undisclosed', NULL, NULL, 'Fee not stated (signed too late to be registered)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(570, 281, 403, '1987-09-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(570, 281, 235, '1988-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(570, 235, 283, '1993-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'month');

-- Dennis Bergkamp (entity_id 571)
-- Inter: the deal was agreed on 16 February 1993 and took effect that summer.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(571, 283, 231, '1993-07-01', 'permanent', NULL, 7100000, '£7.1m (agreed 16 Feb 1993; deal included Wim Jonk)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(571, 231, 183, '1995-06-01', 'permanent', NULL, 7500000, '£7.5m (estimated), club record', 'Wikipedia (en, nl)', '2026-10-09', 'month');

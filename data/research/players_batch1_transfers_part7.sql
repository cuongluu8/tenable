-- Research output: transfer history for players 608-619 (Robben to Vinicius Junior).
-- Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same method, sources and date_precision rules as players_batch1_transfers_part2.sql.
-- Second sources here: Dutch / German / French / Spanish / Portuguese Wikipedia.
-- Where a move was announced ahead of time, transfer_date is the date the player joined and the
-- announcement is in display_value. Most of these players are still active: this is their
-- history as of 2026-10-09.

-- Arjen Robben (entity_id 608)
-- PSV fee: €3.9m (en) vs 9.5m guilders (nl). Real Madrid: 22 Aug 2007 (en) vs 27 Aug (nl).
-- Bayern: 28 Aug 2009 (en) vs 27 Aug (nl). Groningen 2020: he had retired in 2019, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(608, 18973, 284, '2002-07-01', 'permanent', NULL, NULL, 'Reported as €3.9m (en) or 9.5m guilders (nl)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(608, 284, 189, '2004-07-01', 'permanent', 18000000, 12100000, '€18m (£12.1m)', 'Wikipedia (en, nl)', '2026-10-09', 'year'),
(608, 189, 217, '2007-08-01', 'permanent', 35000000, 24000000, '€35m (£24m)', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(608, 217, 243, '2009-08-01', 'permanent', 25000000, 22300000, 'About €25m (~£22.3m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'month'),
(608, NULL, 18973, '2020-06-27', 'undisclosed', NULL, NULL, 'Came out of retirement; terms not stated', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Marco Reus (entity_id 609)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(609, 19428, 254, '2009-05-25', 'undisclosed', NULL, NULL, 'Fee not stated (signed 25 May 2009 for the 2009-10 season)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(609, 254, 244, '2012-07-01', 'permanent', 17100000, 13900000, '€17.1m (~£13.9m, approx.); announced 4 Jan 2012', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(609, 244, 332, '2024-08-15', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Mario Gotze (entity_id 610)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(610, 244, 243, '2013-07-01', 'permanent', 37000000, 31500000, '€37m release clause (~£31.5m, approx.); announced 23 Apr 2013', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(610, 243, 244, '2016-07-21', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(610, 244, 284, '2020-10-06', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(610, 284, 248, '2022-06-21', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Mesut Ozil (entity_id 611)
-- Arsenal fee was officially undisclosed; a 2016 leak put the base at £37.4m (€44m).
-- Fenerbahce: 27 Jan 2021 (en) vs 24 Jan (de).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(611, 19057, 255, '2008-01-31', 'permanent', 5000000, 4000000, '€5m reported (~£4.0m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(611, 255, 217, '2010-08-17', 'permanent', 15000000, 12900000, 'About €15m (~£12.9m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(611, 217, 183, '2013-09-02', 'permanent', 50000000, 42500000, 'Undisclosed; reported as about £42.5m (€50m)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(611, 183, 290, '2021-01-01', 'free', NULL, NULL, 'Free transfer (Arsenal contract terminated)', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(611, 290, 19004, '2022-07-14', 'free', NULL, NULL, 'Free transfer (Fenerbahce contract terminated)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ilkay Gundogan (entity_id 612)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(612, 19102, 19060, '2009-01-01', 'undisclosed', NULL, NULL, 'Fee not stated (2008-09 winter break)', 'Wikipedia (en, de)', '2026-10-09', 'year'),
(612, 19060, 244, '2011-05-05', 'undisclosed', NULL, NULL, 'Fee not stated (signed 5 May 2011 for the 2011-12 season)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(612, 244, 195, '2016-06-02', 'permanent', 24400000, 20000000, 'About £20m (~€24.4m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(612, 195, 206, '2023-06-26', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(612, 206, 195, '2024-08-23', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(612, 195, 289, '2025-09-02', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- N'Golo Kante (entity_id 613)
-- Leicester: 3 Aug 2015 (en) vs 31 July (fr) -- different months, so the earlier one is stored.
-- Al-Ittihad: agreed 21 June 2023, joined 1 July.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(613, NULL, 19386, '2010-07-01', 'undisclosed', NULL, NULL, 'Amateur contract (from JS Suresnes youth)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(613, 19386, 19124, '2013-06-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(613, 19124, 305, '2015-07-01', 'permanent', 8000000, 5600000, 'Undisclosed; reported as €8m (£5.6m)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(613, 305, 189, '2016-07-16', 'permanent', 38000000, 32000000, 'Reported as £32m (about €38m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(613, 189, 329, '2023-07-01', 'free', NULL, NULL, 'Free transfer (agreed 21 June 2023)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(613, 329, 290, '2026-02-03', 'undisclosed', NULL, NULL, 'Swap involving Youssef En-Nesyri', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Antoine Griezmann (entity_id 614)
-- Atletico 2014: 27-29 July depending on source. Barcelona: 12 July 2019 (en) vs 11 July (fr).
-- Orlando City: announced 24 March 2026, joined 13 July 2026.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(614, 219, 205, '2014-07-01', 'permanent', 30000000, 24000000, 'About €30m (£24m), his release clause', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(614, 205, 206, '2019-07-01', 'permanent', 120000000, 105600000, '€120m buy-out clause (~£105.6m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(614, 206, 205, '2021-08-31', 'loan', NULL, NULL, 'Loan with a conditional €40m obligation to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(614, 206, 205, '2022-10-10', 'permanent', 20000000, 17000000, '€20m reported (~£17m, approx.); loan made permanent', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(614, 205, 19038, '2026-07-13', 'undisclosed', NULL, NULL, 'Terms not stated (announced 24 Mar 2026)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Ousmane Dembele (entity_id 615)
-- Dortmund fee from fr.wikipedia only. Barcelona: announced 25 Aug 2017, signed 28 Aug.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(615, 268, 244, '2016-07-01', 'permanent', 15000000, 12300000, '€15m (~£12.3m, approx.); signed 12 May 2016', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(615, 244, 206, '2017-08-28', 'permanent', 105000000, 92400000, '€105m (~£92.4m, approx.) plus a reported €40m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(615, 206, 261, '2023-08-12', 'permanent', 50400000, 43800000, '€50.4m release clause (~£43.8m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Riyad Mahrez (entity_id 616)
-- 2026: his Al-Ahli contract was terminated on 4 July 2026 (en); fr.wikipedia's infobox lists
-- Al-Shamal from 2026 with no month. Single source for the new club.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(616, NULL, 19426, '2009-07-01', 'undisclosed', NULL, NULL, 'Terms not stated (from AAS Sarcelles)', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(616, 19426, 275, '2010-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, fr)', '2026-10-09', 'year'),
(616, 275, 305, '2014-01-11', 'permanent', 500000, 450000, 'About £450,000 (about €500,000)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(616, 305, 195, '2018-07-10', 'permanent', 68000000, 60000000, '£60m (€68m)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(616, 195, 330, '2023-07-28', 'permanent', 34500000, 30000000, '£30m (~€34.5m, approx.)', 'Wikipedia (en, fr)/BBC', '2026-10-09', 'day'),
(616, 330, NULL, '2026-07-01', 'free', NULL, NULL, 'Free agent after Al-Ahli contract was terminated [Al-Shamal not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'year');

-- Victor Osimhen (entity_id 617)
-- Napoli fee: €70m rising to €80m (en) vs about €75m (fr).
-- Galatasaray permanent: 31 July 2025 (en) vs 30 July (fr).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(617, NULL, 256, '2017-01-05', 'undisclosed', NULL, NULL, 'Fee not stated (from Ultimate Strikers Academy; pre-contract agreed Jan 2016)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(617, 256, 19000, '2018-08-22', 'loan', NULL, NULL, 'Season-long loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(617, 256, 19000, '2019-05-01', 'undisclosed', NULL, NULL, 'Option to buy exercised; fee not stated', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(617, 19000, 265, '2019-08-01', 'permanent', 12000000, 10600000, '€12m (~£10.6m, approx.) plus €3m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(617, 265, 236, '2020-07-31', 'permanent', NULL, NULL, 'Club record; reported as €70m rising to €80m (en) or about €75m (fr)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(617, 236, 289, '2024-09-04', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(617, 236, 289, '2025-07-01', 'permanent', 75000000, 63000000, '€75m (~£63m, approx.)', 'Wikipedia (en, fr)', '2026-10-09', 'month');

-- Achraf Hakimi (entity_id 618)
-- PSG: €60m initial plus up to €11m in add-ons; en.wikipedia's lead says €68m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(618, 217, 244, '2018-07-11', 'loan', NULL, NULL, 'Two-year loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(618, 217, 231, '2020-07-02', 'permanent', 40000000, 35600000, 'About €40m (~£35.6m, approx.)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(618, 231, 261, '2021-07-06', 'permanent', 60000000, 51600000, '€60m initial (~£51.6m, approx.) plus up to €11m in add-ons', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Vinicius Junior (entity_id 619)
-- Agreed in May 2017 (23 May per en, 20 May per pt); he joined on 12 July 2018, his 18th birthday.
-- Fee: €46m (en) vs €45m (pt); en.wikipedia's lead says £38m.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(619, 31, 217, '2018-07-12', 'permanent', NULL, NULL, 'Reported as €45m-€46m; agreed May 2017, joined on turning 18', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Research output: transfer history for players 620-650 (Bellingham to Ballack) -- the last
-- slice of candidate_players_batch1.csv. Researched 2026-10-09. FOR HUMAN REVIEW BEFORE APPLYING.
--
-- Same date_precision rules as players_batch1_transfers_part2.sql.
-- WEAKER SOURCING THAN EARLIER SLICES: players 620-634 were checked against a second Wikipedia
-- (German / Spanish / Portuguese) where their rows say so, but players 635-650 rest on the
-- English Wikipedia article alone. Under the agreed rule a single-source date stands unless
-- contradicted -- but no second source was read here that could have contradicted it.
-- Most players up to 641 are still active: this is their history as of 2026-10-09.
--
-- No rows for four one-club players: Gavi (622), Bukayo Saka (623), Phil Foden (624),
-- Lev Yashin (647).

-- Jude Bellingham (entity_id 620)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(620, 318, 244, '2020-07-20', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £25m (Sky Sports) or about €25m (Kicker) plus add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(620, 244, 217, '2023-06-14', 'permanent', 103000000, 89600000, '€103m (~£89.6m, approx.), rising to about €133.9m with add-ons', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Pedri (entity_id 621)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(621, 409, 206, '2020-07-01', 'permanent', 5000000, 4500000, '€5m (~£4.5m, approx.) plus add-ons; agreed 2 Sept 2019', 'Wikipedia (en)', '2026-10-09', 'day');

-- Declan Rice (entity_id 625)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(625, 201, 183, '2023-07-15', 'permanent', 114900000, 100000000, '£100m (~€114.9m, approx.) plus £5m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day');

-- Marcus Rashford (entity_id 626)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(626, 196, 184, '2025-02-02', 'loan', NULL, NULL, 'Loan (reported £40m option to buy)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(626, 196, 206, '2025-07-23', 'loan', NULL, NULL, 'Season-long loan (€35m option to buy, not taken up)', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Son Heung-min (entity_id 627)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(627, 260, 246, '2013-06-13', 'permanent', 10000000, 8500000, '€10m reported (~£8.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(627, 246, 200, '2015-08-28', 'permanent', 30000000, 22000000, '£22m (€30m)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(627, 200, 333, '2025-08-06', 'permanent', NULL, NULL, '$26.5m (reported in USD)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Kaoru Mitoma (entity_id 628)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(628, 19407, 187, '2021-08-10', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(628, 187, 18999, '2021-08-10', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day');

-- Takefusa Kubo (entity_id 629)
-- Villarreal loan: 10 Aug 2020 (en) vs 8 Aug (es).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(629, 19398, 19455, '2018-08-16', 'loan', NULL, NULL, 'Half-season loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(629, 19398, 217, '2019-06-14', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(629, 217, 213, '2019-08-22', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(629, 217, 222, '2020-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, es)', '2026-10-09', 'month'),
(629, 217, 210, '2021-01-08', 'loan', NULL, NULL, 'Loan for the rest of the season', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(629, 217, 213, '2021-08-12', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(629, 217, 219, '2022-07-19', 'undisclosed', NULL, NULL, 'Permanent; fee not stated', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Lautaro Martinez (entity_id 630)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(630, 27, 231, '2018-07-04', 'permanent', 22700000, 20000000, '€22.7m reported (~£20.0m, approx.); sale confirmed 5 May 2018', 'Wikipedia (en)', '2026-10-09', 'day');

-- Julian Alvarez (entity_id 631)
-- He was loaned straight back to River Plate until July 2022; no start date is stated for it.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(631, 23, 195, '2022-01-31', 'permanent', 16500000, 14000000, 'About £14m (~€16.5m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(631, 195, 23, '2022-02-01', 'loan', NULL, NULL, 'Loaned back until July 2022', 'Wikipedia (en)', '2026-10-09', 'year'),
(631, 195, 205, '2024-08-12', 'permanent', 95000000, 81800000, 'Up to €95m (£81.8m) reported', 'Wikipedia (en)', '2026-10-09', 'day');

-- Rodrygo (entity_id 632)
-- Fee: rumoured €45m (en) vs €50m (pt); both say Santos received €40m for its 80% share.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(632, 44, 217, '2019-06-01', 'permanent', NULL, NULL, 'Reported as €45m-€50m; agreed 15 June 2018, joined a year later', 'Wikipedia (en, pt)', '2026-10-09', 'month');

-- Federico Valverde (entity_id 633)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(633, 66, 217, '2016-07-28', 'undisclosed', NULL, NULL, 'Fee not stated (joined Real Madrid Castilla)', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(633, 217, 401, '2017-06-22', 'loan', NULL, NULL, 'One-year loan', 'Wikipedia (en, es)', '2026-10-09', 'day');

-- Casemiro (entity_id 634)
-- Manchester United fee: £60m plus £10m add-ons (en) vs about €60m (pt).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(634, 37, 217, '2013-01-31', 'loan', NULL, NULL, 'Loan (Real Madrid Castilla)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(634, 37, 217, '2013-06-10', 'permanent', NULL, NULL, 'Loan made permanent; reported as R$18.7m (about £5.1m)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(634, 217, 279, '2014-07-19', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(634, 279, 217, '2015-06-05', 'permanent', NULL, NULL, 'Buy-back clause exercised; reported as €7m-€7.5m', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(634, 217, 196, '2022-08-19', 'permanent', NULL, NULL, 'Reported as £60m plus £10m add-ons (en) or about €60m (pt)', 'Wikipedia (en, pt)', '2026-10-09', 'day'),
(634, 196, 331, '2026-07-22', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, pt)', '2026-10-09', 'day');

-- Fabinho (entity_id 635)
-- Trabzonspor: listed from 2026 with no date; his Al-Ittihad contract expired on 5 Aug 2026.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(635, 32, 18987, '2012-06-08', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 18987, 217, '2012-07-19', 'loan', NULL, NULL, 'Season-long loan (Real Madrid Castilla)', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 18987, 264, '2013-07-19', 'loan', NULL, NULL, 'Season-long loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 18987, 264, '2014-07-02', 'loan', NULL, NULL, 'Second season-long loan', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 18987, 264, '2015-05-19', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 264, 194, '2018-07-01', 'permanent', 44300000, 39000000, '£39m reported (~€44.3m, approx.) plus up to £4m; announced 28 May 2018', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 194, 329, '2023-07-31', 'permanent', 46000000, 40000000, '£40m reported (~€46.0m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(635, 329, 19003, '2026-08-01', 'free', NULL, NULL, 'Free agent (Al-Ittihad contract expired 5 Aug 2026)', 'Wikipedia (en)', '2026-10-09', 'year');

-- Virgil van Dijk (entity_id 636)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(636, 18973, 287, '2013-06-21', 'permanent', 3100000, 2600000, 'About £2.6m (~€3.1m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(636, 287, 306, '2015-09-01', 'permanent', 17800000, 13000000, '£13m reported (~€17.8m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(636, 306, 194, '2018-01-01', 'permanent', 85200000, 75000000, '£75m reported (~€85.2m, approx.); announced 27 Dec 2017', 'Wikipedia (en)', '2026-10-09', 'day');

-- Alisson Becker (entity_id 637)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(637, 43, 239, '2016-07-01', 'permanent', 7500000, 6200000, '€7.5m (~£6.2m, approx.); pre-contract signed 4 Feb 2016', 'Wikipedia (en)', '2026-10-09', 'month'),
(637, 239, 194, '2018-07-19', 'permanent', 72500000, 66800000, '£66.8m (€72.5m)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Ederson (entity_id 638)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(638, NULL, 19427, '2011-07-01', 'undisclosed', NULL, NULL, 'Terms not stated (from Benfica youth)', 'Wikipedia (en)', '2026-10-09', 'year'),
(638, 19427, 18987, '2012-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(638, 18987, 280, '2015-06-27', 'permanent', 500000, 365000, '€500,000 (~£365,000, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(638, 280, 195, '2017-06-01', 'permanent', 40000000, 35000000, '£35m (€40m)', 'Wikipedia (en)', '2026-10-09', 'day'),
(638, 195, 290, '2025-09-02', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day');

-- Thibaut Courtois (entity_id 639)
-- The Atletico loan began "within weeks" of joining Chelsea and was renewed until 2014.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(639, 18996, 189, '2011-07-01', 'permanent', 9000000, 8000000, '€9m (£8m) reported', 'Wikipedia (en)', '2026-10-09', 'month'),
(639, 189, 205, '2011-08-01', 'loan', NULL, NULL, 'Season-long loan, later extended to 2014', 'Wikipedia (en)', '2026-10-09', 'year'),
(639, 189, 217, '2018-08-08', 'permanent', 38800000, 35000000, 'Believed to be £35m (€38.8m)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Jan Oblak (entity_id 640)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(640, 19424, 280, '2010-06-14', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(640, 280, 19382, '2010-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'month'),
(640, 280, 19452, '2011-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'month'),
(640, 280, 19454, '2011-07-01', 'loan', NULL, NULL, 'Loan (2011-12 season)', 'Wikipedia (en)', '2026-10-09', 'year'),
(640, 280, 18987, '2012-07-01', 'loan', NULL, NULL, 'Loan (2012-13 season)', 'Wikipedia (en)', '2026-10-09', 'year'),
(640, 280, 205, '2014-07-16', 'permanent', 16000000, 13000000, '€16m (~£13.0m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- David de Gea (entity_id 641)
-- He was without a club between leaving Manchester United (July 2023) and joining Fiorentina.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(641, 205, 196, '2011-06-29', 'permanent', 21700000, 18900000, 'About £18.9m (~€21.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(641, NULL, 228, '2024-08-09', 'free', NULL, NULL, 'Free agent (left Manchester United in July 2023)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Petr Cech (entity_id 642)
-- Sparta: contract signed January 2001, but he stayed at Blsany until the end of 2000-01.
-- Chelsea: agreed February 2004, contract from July 2004.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(642, NULL, 19393, '1999-06-01', 'undisclosed', NULL, NULL, 'Terms not stated (from Viktoria Plzen youth)', 'Wikipedia (en)', '2026-10-09', 'month'),
(642, 19393, 302, '2001-07-01', 'undisclosed', NULL, NULL, 'Fee not stated (signed Jan 2001, joined after the season)', 'Wikipedia (en)', '2026-10-09', 'year'),
(642, 302, 268, '2002-07-01', 'permanent', 5500000, 3500000, '€5.5m (CZK 150m; ~£3.5m, approx.)', 'Wikipedia (en)', '2026-10-09', 'month'),
(642, 268, 189, '2004-07-01', 'permanent', 10300000, 7000000, '£7m (~€10.3m, approx.); agreed Feb 2004', 'Wikipedia (en)', '2026-10-09', 'month'),
(642, 189, 183, '2015-06-29', 'permanent', 13700000, 10000000, 'About £10m (~€13.7m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Edwin van der Sar (entity_id 643)
-- Not written: Noordwijk -> Ajax (the source gives no year).
-- Noordwijk 2016: a one-match return five years after retiring, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(643, 283, 232, '1999-07-01', 'permanent', NULL, 5000000, 'About £5m', 'Wikipedia (en)', '2026-10-09', 'year'),
(643, 232, 192, '2001-08-01', 'permanent', 11300000, 7000000, '£7m (~€11.3m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(643, 192, 196, '2005-06-10', 'undisclosed', NULL, NULL, 'Undisclosed; reported as £2m', 'Wikipedia (en)', '2026-10-09', 'day'),
(643, NULL, 19421, '2016-03-12', 'undisclosed', NULL, NULL, 'One-match return to his boyhood club', 'Wikipedia (en)', '2026-10-09', 'day');

-- Oliver Kahn (entity_id 644)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(644, 19107, 243, '1994-07-01', 'permanent', 2385000, NULL, 'DM 4.6m (€2.385m)', 'Wikipedia (en)', '2026-10-09', 'year');

-- Peter Schmeichel (entity_id 645)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(645, NULL, 19403, '1984-01-01', 'undisclosed', NULL, NULL, 'Terms not stated (from Gladsaxe-Hero)', 'Wikipedia (en)', '2026-10-09', 'year'),
(645, 19403, 19388, '1987-01-01', 'undisclosed', NULL, NULL, 'Terms not stated (before the 1987 season)', 'Wikipedia (en)', '2026-10-09', 'year'),
(645, 19388, 196, '1991-08-06', 'permanent', NULL, 505000, '£505,000', 'Wikipedia (en)', '2026-10-09', 'day'),
(645, 196, 281, '1999-07-01', 'undisclosed', NULL, NULL, 'Terms not stated (left at the end of 1998-99)', 'Wikipedia (en)', '2026-10-09', 'year'),
(645, 281, 184, '2001-07-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'month'),
(645, 184, 195, '2002-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)', '2026-10-09', 'year');

-- Gordon Banks (entity_id 646)
-- Cleveland Stokers loan: 1967 in the infobox, "summer of 1968" in the text -- inconclusive.
-- Fort Lauderdale 1977: he had retired from league football in 1973, so from_club is NULL.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(646, 19392, 305, '1959-07-01', 'permanent', NULL, 7000, '£7,000', 'Wikipedia (en)', '2026-10-09', 'month'),
(646, 305, 314, '1967-04-01', 'permanent', NULL, 50000, '£50,000', 'Wikipedia (en)', '2026-10-09', 'month'),
(646, 314, 19448, '1967-07-01', 'loan', NULL, NULL, 'Loan (source gives both 1967 and 1968)', 'Wikipedia (en)', '2026-10-09', 'inconclusive'),
(646, 314, 19450, '1971-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'year'),
(646, NULL, 19399, '1977-04-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'month'),
(646, 19399, 19453, '1977-07-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'year');

-- Dino Zoff (entity_id 648)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(648, 242, 19413, '1963-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(648, 19413, 236, '1967-07-01', 'permanent', NULL, NULL, '130m lire plus Claudio Bandoni (not converted)', 'Wikipedia (en)', '2026-10-09', 'year'),
(648, 236, 232, '1972-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year');

-- Fabien Barthez (entity_id 649)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(649, 270, 262, '1992-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(649, 262, 264, '1995-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(649, 264, 196, '2000-07-01', 'permanent', 12800000, 7800000, '£7.8m (~€12.8m, approx.)', 'Wikipedia (en)', '2026-10-09', 'year'),
(649, 196, 262, '2004-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en)', '2026-10-09', 'month'),
(649, 196, 262, '2004-04-27', 'undisclosed', NULL, NULL, 'Loan made permanent; fee not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(649, 262, 271, '2006-12-17', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'day');

-- Michael Ballack (entity_id 650)
-- Bayern fee: en.wikipedia's lead says €12.9m, its Bayern section says €6m.
-- Chelsea: agreed 15 May 2006, joined that summer.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(650, 19119, 19059, '1997-07-01', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en)', '2026-10-09', 'year'),
(650, 19059, 246, '1999-07-01', 'permanent', 4100000, NULL, '€4.1m', 'Wikipedia (en)', '2026-10-09', 'day'),
(650, 246, 243, '2002-07-01', 'permanent', NULL, NULL, 'Fee unclear: €12.9m or €6m within the same source', 'Wikipedia (en)', '2026-10-09', 'year'),
(650, 243, 189, '2006-07-01', 'free', NULL, NULL, 'Free transfer (agreed 15 May 2006)', 'Wikipedia (en)', '2026-10-09', 'year'),
(650, 189, 246, '2010-06-25', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en)', '2026-10-09', 'day');

-- Research output: transfer history for players 726-740 (Alexander-Arnold to Endo).
-- Researched 2026-10-09. DO NOT RE-RUN once applied.
--
-- Method and date_precision rules as in players_batch1_transfers_part2.sql: English Wikipedia for
-- the move list, a second-language article (de / fr / nl / it / es) for dates and fees.
-- English article only for Curtis Jones (731) and Luis Diaz (732).
-- All of these players are active: history as of 2026-10-09.

-- Trent Alexander-Arnold (entity_id 726)
-- A fee was paid to release him a month before his contract expired.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(726, 194, 217, '2025-05-30', 'permanent', NULL, NULL, 'Reported as €6.2m-€10m for an early release', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Andrew Robertson (entity_id 727)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(727, NULL, 393, '2013-06-03', 'undisclosed', NULL, NULL, 'Sell-on share later worth £300,000 [Queen''s Park not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(727, 393, 322, '2014-07-29', 'permanent', 3520000, 2850000, '£2.85m (~€3.5m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(727, 322, 194, '2017-07-21', 'permanent', 9100000, 8000000, 'Undisclosed; reported as an initial £8m (~€9.1m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(727, 194, 200, '2026-06-05', 'free', NULL, NULL, 'Free agent', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ibrahima Konate (entity_id 728)
-- Leipzig: 12 June 2017 (en) vs 1 July 2017 (fr); earlier month kept.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(728, 19063, 245, '2017-06-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(728, 245, 194, '2021-07-01', 'permanent', NULL, 36000000, 'About £36m release clause (€35m-€40m); announced 28 May 2021', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(728, 194, 217, '2026-06-18', 'free', NULL, NULL, 'Free transfer (contract expired)', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Dominik Szoboszlai (entity_id 729)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(729, NULL, 294, '2018-01-01', 'undisclosed', NULL, NULL, 'Promoted from the affiliated FC Liefering [club not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(729, 294, 245, '2021-01-01', 'permanent', 20000000, 17200000, '€20m reported (~£17.2m, approx.); announced 17 Dec 2020', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(729, 245, 194, '2023-07-02', 'permanent', 70000000, 60000000, '€70m release clause (£60m)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Ryan Gravenberch (entity_id 730)
-- Bayern fee: €18m plus €5m (en) vs €18.5m rising to €24m (nl).
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(730, 283, 243, '2022-06-13', 'permanent', NULL, NULL, 'About €18m-€18.5m plus bonuses (sources differ slightly)', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(730, 243, 194, '2023-09-01', 'permanent', 40000000, 34800000, 'Undisclosed; reported as about €40m (~£34.8m, approx.)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Curtis Jones (entity_id 731) -- English Wikipedia only
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(731, 194, 231, '2026-08-21', 'permanent', 30000000, 25200000, 'About €30m (~£25.2m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Luis Diaz (entity_id 732) -- English Wikipedia only
-- Not written: his 2017 promotion from Barranquilla, Atletico Junior's feeder club.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(732, 19381, 279, '2019-07-10', 'permanent', 7000000, 6160000, '€7m for 80% of his rights (~£6.2m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day'),
(732, 279, 194, '2022-01-30', 'permanent', 45000000, 37500000, '€45m (£37.5m) reported, plus €15m in add-ons', 'Wikipedia (en)', '2026-10-09', 'day'),
(732, 194, 243, '2025-07-30', 'permanent', 75000000, 63000000, '€75m reported including add-ons (~£63m, approx.)', 'Wikipedia (en)', '2026-10-09', 'day');

-- Federico Chiesa (entity_id 733)
-- The Juventus loan carried a conditional obligation to buy; neither source dates the purchase,
-- so there is no separate row for it.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(733, 228, 232, '2020-10-05', 'loan', NULL, NULL, 'Two-year loan (€10m in loan fees) with a conditional €40m obligation to buy', 'Wikipedia (en, it)', '2026-10-09', 'day'),
(733, 232, 194, '2024-08-29', 'permanent', 12000000, 10000000, '£10m (€12m) plus £2.5m in add-ons', 'Wikipedia (en, it)', '2026-10-09', 'day');

-- Hugo Ekitike (entity_id 734)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(734, 19129, NULL, '2021-01-29', 'loan', NULL, NULL, 'Loan for the rest of the season [Vejle not in local club pool]', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(734, 19129, 261, '2022-07-16', 'loan', NULL, NULL, 'Loan with an obligation to buy (about €35m including bonuses)', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(734, 19129, 261, '2023-06-01', 'permanent', 28500000, 24800000, '€28.5m (~£24.8m, approx.) plus €6.5m in bonuses', 'Wikipedia (en, fr)', '2026-10-09', 'month'),
(734, 261, 248, '2024-02-01', 'loan', NULL, NULL, 'Loan with option to buy', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(734, 261, 248, '2024-04-26', 'permanent', 16500000, 14000000, '€16.5m (~£14.0m, approx.); option exercised', 'Wikipedia (en, fr)', '2026-10-09', 'day'),
(734, 248, 194, '2025-07-23', 'permanent', 80000000, 69000000, '€80m (£69m) plus up to €15m in add-ons', 'Wikipedia (en, fr)', '2026-10-09', 'day');

-- Alexander Isak (entity_id 735)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(735, NULL, 244, '2017-01-23', 'undisclosed', NULL, NULL, 'Undisclosed; reported as about €9m [AIK not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(735, 244, 18974, '2019-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(735, 244, 219, '2019-06-12', 'undisclosed', NULL, NULL, 'Fee not stated (five-year deal)', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(735, 219, 197, '2022-08-26', 'undisclosed', NULL, NULL, 'Club-record fee; amount not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(735, 197, 194, '2025-09-01', 'permanent', 144000000, 125000000, '£125m reported (about €144m)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Jeremie Frimpong (entity_id 736)
-- Celtic and Leverkusen fees are nl.wikipedia only.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(736, 195, 287, '2019-09-02', 'permanent', 398000, 350000, '£350,000 per one source (~€398,000, approx.), rising to £1m', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(736, 287, 246, '2021-01-27', 'undisclosed', NULL, NULL, 'Undisclosed; about €11m per one source', 'Wikipedia (en, nl)', '2026-10-09', 'day'),
(736, 246, 194, '2025-05-30', 'permanent', 35000000, 29500000, '€35m (£29.5m)', 'Wikipedia (en, nl)', '2026-10-09', 'day');

-- Milos Kerkez (entity_id 737)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(737, NULL, 235, '2021-02-02', 'undisclosed', NULL, NULL, 'Fee not stated [Gyor not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(737, 235, 286, '2022-01-29', 'undisclosed', NULL, NULL, 'Fee not stated', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(737, 286, 185, '2023-07-20', 'undisclosed', NULL, NULL, 'Undisclosed fee', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(737, 185, 194, '2025-06-26', 'permanent', 47600000, 40000000, 'Believed to be £40m (~€47.6m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Giorgi Mamardashvili (entity_id 738)
-- Liverpool: agreed 27 August 2024; he joined for the 2025-26 season, exact date not stated.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(738, NULL, NULL, '2019-07-01', 'loan', NULL, NULL, 'Loan [Dinamo Tbilisi, Rustavi not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(738, NULL, NULL, '2020-07-01', 'loan', NULL, NULL, 'Loan [Dinamo Tbilisi, Locomotive Tbilisi not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(738, NULL, 221, '2021-06-07', 'loan', NULL, NULL, 'One-year loan with option to buy [Dinamo Tbilisi not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(738, NULL, 221, '2021-12-31', 'permanent', NULL, NULL, 'Just under €1m per one source; option exercised', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(738, 221, 194, '2025-07-01', 'undisclosed', NULL, NULL, 'Fee not stated; agreed 27 Aug 2024, joined for 2025-26', 'Wikipedia (en, es)', '2026-10-09', 'year');

-- Joe Gomez (entity_id 739)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(739, 366, 194, '2015-06-20', 'permanent', 4800000, 3500000, '£3.5m (~€4.8m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

-- Wataru Endo (entity_id 740)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(740, NULL, NULL, '2016-01-01', 'undisclosed', NULL, NULL, 'Fee not stated [Shonan Bellmare, Urawa Red Diamonds not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(740, NULL, NULL, '2018-07-01', 'undisclosed', NULL, NULL, 'Fee not stated [Urawa Red Diamonds, Sint-Truiden not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(740, NULL, 247, '2019-08-13', 'loan', NULL, NULL, 'Loan with option to buy [Sint-Truiden not in local club pool]', 'Wikipedia (en, de)', '2026-10-09', 'day'),
(740, NULL, 247, '2020-04-01', 'permanent', NULL, NULL, 'Option exercised; €1.7m per one source', 'Wikipedia (en, de)', '2026-10-09', 'month'),
(740, 247, 194, '2023-08-18', 'permanent', 18400000, 16000000, '£16m (~€18.4m, approx.)', 'Wikipedia (en, de)', '2026-10-09', 'day');

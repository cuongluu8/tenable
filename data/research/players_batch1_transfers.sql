-- Research output: transfer history for players_batch1.csv
-- Sourced from web search synthesis of Transfermarkt / Wikipedia / ESPN / StatMuse etc.
-- Club IDs resolved against local D1 mirror (entities WHERE entity_type='club').
-- NULL club_id = could not confidently match club name in the local entity pool.
-- FOR HUMAN REVIEW BEFORE APPLYING. Not applied to any database by the research agent.

-- Lionel Messi (entity_id 530)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(530, 206, 261, '2021-08-10', 'free', NULL, NULL, 'Free transfer', 'Wikipedia/ESPN', '2026-08-31'),
(530, 261, 331, '2023-07-15', 'free', NULL, NULL, 'Free transfer (MLS)', 'Wikipedia/ESPN', '2026-08-31');

-- Cristiano Ronaldo (entity_id 531)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(531, 281, 196, '2003-08-12', 'permanent', 19000000, 12000000, '€19m (£12m)', 'Goal.com', '2026-08-31'),
(531, 196, 217, '2009-07-01', 'permanent', 94000000, 80000000, '€94m (£80m), world record', 'Wikipedia/Transfermarkt', '2026-08-31'),
(531, 217, 232, '2018-07-10', 'permanent', 100000000, 88000000, '€100m (~£88m, approx.)', 'Wikipedia', '2026-08-31'),
(531, 232, 196, '2021-08-27', 'permanent', 17000000, 14600000, '€17m (~£14.6m, approx.)', 'Transfermarkt', '2026-08-31'),
(531, 196, 327, '2023-01-01', 'free', NULL, NULL, 'Free transfer (contract terminated)', 'Wikipedia', '2026-08-31');

-- Ronaldo Nazario (entity_id 532)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(532, 40, 284, '1994-06-01', 'permanent', NULL, NULL, 'Fee undisclosed/not confidently sourced', 'Wikipedia', '2026-08-31'),
(532, 284, 206, '1996-07-01', 'permanent', NULL, NULL, '$19.5m (reported in USD; EUR/GBP not confidently sourced), world record', 'Sportbible', '2026-08-31'),
(532, 206, 231, '1997-06-20', 'permanent', 23000000, 25000000, '€23m / £25m (separately sourced estimates for same transfer), world record', 'Football Italia/GiveMeSport', '2026-08-31'),
(532, 231, 217, '2002-08-01', 'permanent', 39000000, 24570000, '€39m (~£24.6m, approx.)', 'Sportskeeda', '2026-08-31'),
(532, 217, 235, '2007-01-30', 'permanent', 7500000, 5100000, '€7.5m (~£5.1m, approx.)', 'Sportskeeda', '2026-08-31'),
(532, 235, 39, '2009-01-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31');

-- Ronaldinho (entity_id 533)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(533, 45, 261, '2001-07-01', 'permanent', 5000000, 3100000, '€5.0m (~£3.1m, approx.)', 'BeSoccer', '2026-08-31'),
(533, 261, 206, '2003-07-01', 'permanent', 32300000, 22300000, '€32.3m (~£22.3m, approx.)', 'BeSoccer', '2026-08-31'),
(533, 206, 235, '2008-07-01', 'permanent', 24200000, 19400000, '€24.2m (~£19.4m, approx.)', 'BeSoccer', '2026-08-31'),
(533, 235, 31, '2011-01-01', 'permanent', 3000000, 2600000, '€3.0m (~£2.6m, approx.)', 'BeSoccer', '2026-08-31'),
(533, 31, 38, '2012-06-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31');

-- Zinedine Zidane (entity_id 534)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(534, 19136, 19062, '1992-07-01', 'permanent', 7000000, NULL, '€7.0m (pre-2000, GBP approx. not available)', 'Grokipedia aggregate', '2026-08-31'),
(534, 19062, 232, '1996-06-30', 'permanent', 3500000, NULL, '€3.5m (pre-2000, GBP approx. not available)', 'Grokipedia aggregate', '2026-08-31'),
(534, 232, 217, '2001-08-01', 'permanent', 77500000, 48050000, '€77.5m (~£48m, approx.), world record', 'Wikipedia', '2026-08-31');

-- Neymar (entity_id 535)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(535, 44, 206, '2013-06-03', 'permanent', 57100000, 48600000, '€57.1m (£48.6m)', 'Al Jazeera/Bleacher Report', '2026-08-31'),
(535, 206, 261, '2017-08-03', 'permanent', 222000000, 195000000, '€222m (~£195m, approx.), world record', 'Wikipedia', '2026-08-31'),
(535, 261, 328, '2023-08-15', 'permanent', 90000000, 78300000, '€90m (~£78.3m, approx.)', 'Front Office Sports', '2026-08-31'),
(535, 328, 44, '2025-01-31', 'free', NULL, NULL, 'Free transfer', 'World Soccer Talk', '2026-08-31');

-- Kylian Mbappe (entity_id 536)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(536, 264, 261, '2017-08-31', 'permanent', 180000000, 165700000, '€180m (£165.7m)', 'Transfermarkt/Sportico', '2026-08-31'),
(536, 261, 217, '2024-07-01', 'free', NULL, NULL, 'Free transfer (contract expired)', 'ESPN', '2026-08-31');

-- Erling Haaland (entity_id 537)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(537, NULL, NULL, '2017-02-01', 'permanent', 100000, 88000, '€0.1m (~£0.09m, approx.) [Bryne/Molde not found in local club pool]', 'BeSoccer', '2026-08-31'),
(537, NULL, 294, '2019-01-01', 'permanent', 8000000, 7040000, '€8.0m (~£7.0m, approx.) [Molde not found in local club pool]', 'BeSoccer', '2026-08-31'),
(537, 294, 244, '2020-01-01', 'permanent', 20000000, 17800000, '€20.0m (~£17.8m, approx.)', 'BeSoccer/Wikipedia', '2026-08-31'),
(537, 244, 195, '2022-07-01', 'permanent', 60000000, 51000000, '€60.0m (~£51m, approx., release clause)', 'BeSoccer/Wikipedia', '2026-08-31');

-- Robert Lewandowski (entity_id 538)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(538, NULL, NULL, '2008-07-01', 'permanent', NULL, NULL, '1.5m PLN (fee not confidently convertible to EUR/GBP) [Znicz Pruszkow, Lech Poznan not found in local club pool]', 'Wikipedia', '2026-08-31'),
(538, NULL, 244, '2010-06-01', 'permanent', 4500000, 3870000, '€4.5m (~£3.9m, approx.) [Lech Poznan not found in local club pool]', 'Bundesliga.com', '2026-08-31'),
(538, 244, 243, '2014-07-01', 'free', NULL, NULL, 'Free transfer', 'Bundesliga.com', '2026-08-31'),
(538, 243, 206, '2022-07-19', 'permanent', 45000000, 38000000, '€45m (£38m)', 'Goal.com/ESPN', '2026-08-31');

-- Karim Benzema (entity_id 539)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(539, 263, 217, '2009-07-09', 'permanent', 35000000, 31200000, '€35m (~£31.2m, approx.)', 'Wikipedia', '2026-08-31'),
(539, 217, 329, '2023-06-06', 'free', NULL, NULL, 'Free transfer', 'Al Jazeera', '2026-08-31'),
(539, 329, 328, '2026-01-01', 'permanent', 25000000, 21000000, '€25m (~£21m, approx.)', 'AiScore aggregate', '2026-08-31');

-- Luka Modric (entity_id 540)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(540, NULL, 300, '2001-01-01', 'permanent', NULL, NULL, 'Fee not confidently sourced [Zadar not found in local club pool]', 'Wikipedia', '2026-08-31'),
(540, 300, 200, '2008-07-01', 'permanent', 22500000, 18000000, '€22.5m (~£18m, approx.)', 'Wikipedia/AiScore', '2026-08-31'),
(540, 200, 217, '2012-08-27', 'permanent', 35000000, 28400000, '€35m (~£28.4m, approx.; reported as £35m in some contemporary UK press)', 'Wikipedia/Bleacher Report', '2026-08-31'),
(540, 217, 235, '2025-07-01', 'free', NULL, NULL, 'Free transfer', 'AiScore aggregate', '2026-08-31');

-- Kevin De Bruyne (entity_id 541)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(541, 18996, 189, '2012-01-31', 'permanent', 8000000, 6700000, '€8.0m (£6.7m)', 'Sky Sports/Wikipedia', '2026-08-31'),
(541, 189, 18996, '2012-02-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(541, 189, 255, '2012-08-02', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(541, 189, 256, '2014-01-18', 'permanent', 22000000, 18000000, '€22.0m (£18m)', 'Wikipedia', '2026-08-31'),
(541, 256, 195, '2015-08-30', 'permanent', 76000000, 54000000, '€76.0m (£54m)', 'Sky Sports/SI', '2026-08-31'),
(541, 195, 236, '2025-07-01', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31');

-- Mohamed Salah (entity_id 542)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(542, NULL, NULL, '2012-01-01', 'permanent', NULL, NULL, 'Fee not confidently sourced [Al-Mokawloon, Basel not found in local club pool]', 'Wikipedia', '2026-08-31'),
(542, NULL, 189, '2014-01-23', 'permanent', 13600000, 11000000, '£11m (~€13.6m, approx.) [Basel not found in local club pool]', 'This Is Anfield', '2026-08-31'),
(542, 189, 228, '2015-02-02', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(542, 189, 239, '2016-06-15', 'permanent', 15000000, 12200000, '€15m (~£12.2m, approx.)', 'This Is Anfield', '2026-08-31'),
(542, 239, 194, '2017-06-22', 'permanent', 41900000, 36900000, '£36.9m base (~€41.9m, approx.); further £7m in add-ons reported', 'This Is Anfield', '2026-08-31');

-- Sadio Mane (entity_id 543)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(543, 276, 294, '2012-07-01', 'permanent', 4000000, 3200000, '€4.0m (~£3.2m, approx.)', 'Wikipedia', '2026-08-31'),
(543, 294, 306, '2014-08-01', 'permanent', 14600000, 11800000, '£11.8m (~€14.6m, approx.)', 'Wikipedia', '2026-08-31'),
(543, 306, 194, '2016-07-01', 'permanent', 41200000, 33800000, '€41.2m (~£33.8m, approx.)', 'Wikipedia', '2026-08-31'),
(543, 194, 243, '2022-07-01', 'permanent', 32000000, 27200000, '€32.0m (~£27.2m, approx.)', 'Wikipedia', '2026-08-31'),
(543, 243, 327, '2023-08-01', 'permanent', 30000000, 26100000, '€30.0m (~£26.1m, approx.)', 'Wikipedia', '2026-08-31');

-- Harry Kane (entity_id 544)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(544, 200, 352, '2011-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(544, 200, 342, '2012-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(544, 200, 310, '2012-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(544, 200, 305, '2013-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(544, 200, 243, '2023-08-12', 'permanent', 98000000, 86000000, '€98m (£86m) base fee, rising to €114m (£100m) with add-ons', 'Goal.com/Sportbible', '2026-08-31');

-- Thierry Henry (entity_id 545)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(545, 264, 232, '1999-01-01', 'permanent', 12500000, NULL, '€12.5m (pre-2000, GBP approx. not available)', 'Wikipedia', '2026-08-31'),
(545, 232, 183, '1999-08-03', 'permanent', 16100000, 11000000, '€16.1m (£11m)', 'Wikipedia', '2026-08-31'),
(545, 183, 206, '2007-06-25', 'permanent', 24000000, 16300000, '€24m (~£16.3m, approx.)', 'Wikipedia', '2026-08-31'),
(545, 206, 19032, '2010-07-15', 'free', NULL, NULL, 'Free transfer', 'Britannica', '2026-08-31'),
(545, 19032, 183, '2012-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31');

-- Didier Drogba (entity_id 546)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(546, NULL, 19123, '2002-01-01', 'permanent', 100000, 63000, '€0.1m (~£0.063m, approx.) [Le Mans not found in local club pool]', 'Wikipedia', '2026-08-31'),
(546, 19123, 262, '2003-07-01', 'permanent', 6000000, 4140000, '€6m (~£4.1m, approx.)', 'Wikipedia', '2026-08-31'),
(546, 262, 189, '2004-07-01', 'permanent', 38500000, 26200000, '€38.5m (~£26.2m, approx.; widely reported as £24m)', 'Wikipedia', '2026-08-31'),
(546, 189, NULL, '2012-07-11', 'permanent', NULL, NULL, 'Fee not confidently sourced [Shanghai Shenhua not found in local club pool]', 'Wikipedia', '2026-08-31'),
(546, NULL, 289, '2013-01-24', 'permanent', NULL, NULL, 'Fee not confidently sourced [Shanghai Shenhua not found in local club pool]', 'Wikipedia', '2026-08-31'),
(546, 289, 189, '2014-07-24', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31'),
(546, 189, 19050, '2015-07-22', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31');

-- Samuel Eto'o (entity_id 547)
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at) VALUES
(547, 217, 412, '1997-08-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(547, 217, 209, '1999-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(547, 217, 213, '1999-01-01', 'loan', NULL, NULL, 'Loan', 'Wikipedia', '2026-08-31'),
(547, 217, 213, '2000-07-01', 'permanent', 7200000, 4400000, '£4.4m (~€7.2m, approx.), club record for Mallorca', 'Wikipedia', '2026-08-31'),
(547, 213, 206, '2004-07-01', 'permanent', 27000000, 18400000, '€27.0m (~£18.4m, approx.)', 'Wikipedia', '2026-08-31'),
(547, 206, 231, '2009-07-27', 'undisclosed', NULL, NULL, 'Part of swap deal with Zlatan Ibrahimovic plus €46m cash to Barcelona', 'Wikipedia', '2026-08-31'),
(547, 231, NULL, '2011-08-31', 'permanent', 27000000, 23500000, '€27.0m (~£23.5m, approx.) [Anzhi Makhachkala not found in local club pool]', 'Wikipedia', '2026-08-31'),
(547, NULL, 189, '2013-08-14', 'free', NULL, NULL, 'Free transfer [Anzhi Makhachkala not found in local club pool]', 'Wikipedia', '2026-08-31'),
(547, 189, 191, '2014-08-30', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31'),
(547, 191, 19053, '2015-08-31', 'free', NULL, NULL, 'Free transfer', 'Wikipedia', '2026-08-31');

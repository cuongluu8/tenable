-- Follow-up fixes (2026-10-09) for the gaps left open after transfers_date_recheck.sql.
-- Applied to production once. The UPDATEs are guarded and harmless to repeat; the INSERTs are
-- not -- DO NOT RE-RUN this file.
--
-- Sources throughout: the player's English Wikipedia article plus one second-language article
-- (pt / fr / de / es / nl), both read on 2026-10-09; press reports where named.

-- PART 1: fees for players 530-547, rechecked against both articles.
-- Rule as elsewhere: a fee is written only when the sources agree; otherwise both columns are
-- NULL and display_value says what was reported.
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = 12000000, display_value = '£12m (one source says £12.24m)', source = 'Wikipedia (en, pt)' WHERE id = 3 AND display_value = '€19m (£12m)';
UPDATE transfers SET display_value = 'US$6m per one source (reported in USD)', source = 'Wikipedia (en, pt)' WHERE id = 8 AND display_value LIKE 'Fee undisclosed%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'World record; reported as $27m (en) or $32m (pt)', source = 'Wikipedia (en, pt)' WHERE id = 10 AND display_value LIKE '€23m / £25m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €45m-€46m', source = 'Wikipedia (en, pt)' WHERE id = 11 AND display_value LIKE '€39m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €21m-€32m depending on source', source = 'Wikipedia (en, pt)' WHERE id = 15 AND display_value LIKE '€32.3m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €18.5m-€24m depending on source', source = 'Wikipedia (en, pt)' WHERE id = 16 AND display_value LIKE '€24.2m%';
UPDATE transfers SET fee_eur_value = 86200000, fee_gbp_value = 71500000, display_value = '€86.2m (£71.5m) per Barcelona''s later disclosure; first announced as €57.1m', source = 'Wikipedia (en, pt)' WHERE id = 22 AND display_value = '€57.1m (£48.6m)';
UPDATE transfers SET fee_eur_value = 20000000, fee_gbp_value = 16500000, display_value = '£16.5m (about €20m)', source = 'Wikipedia (en, es)' WHERE id = 40 AND display_value LIKE '€22.5m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as about £30m (en) or €42m (es)', source = 'Wikipedia (en, es)' WHERE id = 41 AND display_value LIKE '€35m (~£28.4m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = 10500000, display_value = '£10.5m (75m francs)', source = 'Wikipedia (en, fr)' WHERE id = 64 AND display_value LIKE '€12.5m%';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = 11000000, display_value = 'Estimated £11m (90m francs)', source = 'Wikipedia (en, fr)' WHERE id = 65 AND display_value = '€16.1m (£11m)';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as £3.3m (en) or €6m (earlier research)', source = 'Wikipedia (en, fr)' WHERE id = 70 AND display_value LIKE '€6m (~£4.1m%';
UPDATE transfers SET fee_eur_value = 37500000, fee_gbp_value = 24000000, display_value = '£24m (about €37.5m)', source = 'Wikipedia (en, fr)' WHERE id = 71 AND display_value LIKE '€38.5m%';
UPDATE transfers SET transfer_type = 'undisclosed', display_value = 'Undisclosed fee', source = 'Wikipedia (en, fr)' WHERE id = 83 AND transfer_type = 'free';
-- Still resting on the original single aggregator figure, with nothing in either article to
-- confirm or contradict it: id 6 (Ronaldo to Man Utd 2021, €17m), 17 (Ronaldinho to Flamengo,
-- €3m), 24 (Neymar to Al-Hilal, €90m), 28 and 29 (Haaland's first two moves).

-- PART 2: Mbappe's 2017 move was a loan with an obligation to buy, not a permanent transfer.
UPDATE transfers SET transfer_type = 'loan', fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Season-long loan with a €180m obligation to buy', source = 'Wikipedia (en, fr)' WHERE id = 26 AND transfer_type = 'permanent';
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
(536, 264, 261, '2018-07-01', 'permanent', 180000000, 165700000, '€180m (£165.7m); obligation to buy exercised at the end of the loan', 'Wikipedia (en, fr)', '2026-10-09', 'year');

-- PART 3: date corrections.
-- Salah -> Basel: contract from 15 June 2012 (en) vs August 2012 (es); earlier month kept.
UPDATE transfers SET transfer_date = '2012-06-01', date_precision = 'month' WHERE id = 49 AND transfer_date = '2012-06-15';
-- Salah -> Roma permanent: 3 August 2016 in en.wikipedia and in the report es.wikipedia cites;
-- the old row's June date had no source behind it.
UPDATE transfers SET transfer_date = '2016-08-03', date_precision = 'day', display_value = '€15m (~£12.2m, approx.); loan made permanent', source = 'Wikipedia (en, es)' WHERE id = 52 AND transfer_date = '2016-06-01';
-- Courtois loan to Atletico: presented 26 July 2011 (nl). Stored as that day so it sorts after
-- his 16 July move to Chelsea.
UPDATE transfers SET transfer_date = '2011-07-26', date_precision = 'day' WHERE player_id = 639 AND to_club_id = 205 AND transfer_date = '2011-07-01';

-- PART 4: Fabinho (635) now has his second source (es.wikipedia, "Fabinho Tavares").
-- Monaco permanent: 19 May 2015 (en) vs 23 August 2015 (es); earlier month kept.
UPDATE transfers SET transfer_date = '2015-05-01', date_precision = 'month', display_value = 'Loan made permanent; €6m per one source' WHERE player_id = 635 AND to_club_id = 264 AND transfer_date = '2015-05-19';
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as £39m plus add-ons (en) or about €50m (es); announced 28 May 2018' WHERE player_id = 635 AND to_club_id = 194 AND display_value LIKE '£39m reported%';
UPDATE transfers SET transfer_date = '2026-08-24', date_precision = 'day', display_value = 'Free transfer (two-year deal)' WHERE player_id = 635 AND to_club_id = 19003 AND date_precision = 'year';
UPDATE transfers SET source = 'Wikipedia (en, es)' WHERE player_id = 635 AND source = 'Wikipedia (en)';

-- PART 5: moves missing from the original 18 players' rows.
INSERT INTO transfers (player_id, from_club_id, to_club_id, transfer_date, transfer_type, fee_eur_value, fee_gbp_value, display_value, source, verified_at, date_precision) VALUES
-- Ronaldinho (533) after Atletico Mineiro. Ravenna: announced in Miami on 23 June 2026, ten years
-- after he last played; AP describes the role as part coaching.
(533, 38, 19023, '2014-09-05', 'undisclosed', NULL, NULL, 'Two-year contract; terms not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(533, 19023, 32, '2015-07-11', 'undisclosed', NULL, NULL, '18-month contract; terms not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(533, NULL, NULL, '2026-06-01', 'undisclosed', NULL, NULL, 'Came out of retirement at 46 to join Ravenna; role partly coaching [Ravenna not in local club pool]', 'Wikipedia (en)/AP/Reuters', '2026-10-09', 'month'),
-- Lewandowski (538): June 2026 (en), end of June 2026 (de).
(538, 206, 19041, '2026-06-01', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en, de)', '2026-10-09', 'month'),
-- Modric (540): two early loans from Dinamo Zagreb, known by season only.
(540, 300, NULL, '2003-07-01', 'loan', NULL, NULL, 'Loan [Zrinjski Mostar not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'year'),
(540, 300, NULL, '2004-07-01', 'loan', NULL, NULL, 'Loan [Inter Zapresic not in local club pool]', 'Wikipedia (en, es)', '2026-10-09', 'year'),
-- Salah (542): the 2015-16 Roma loan, and his 2026 move after his Liverpool contract ended.
(542, 189, 239, '2015-08-06', 'loan', NULL, NULL, 'Season-long loan (€5m loan fee) with a €15m option to buy', 'Wikipedia (en, es)', '2026-10-09', 'day'),
(542, 194, 19003, '2026-08-06', 'free', NULL, NULL, 'Free agent (two-year contract)', 'Wikipedia (en, es)/AFP', '2026-10-09', 'day'),
-- Drogba (546).
(546, 19050, NULL, '2017-04-12', 'free', NULL, NULL, 'Signed after nearly four months as a free agent [Phoenix Rising not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'day'),
-- Eto'o (547) after Sampdoria.
(547, 19053, 19007, '2015-06-25', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(547, 19007, 19005, '2018-01-31', 'undisclosed', NULL, NULL, 'Terms not stated', 'Wikipedia (en)', '2026-10-09', 'day'),
(547, 19005, NULL, '2018-08-01', 'undisclosed', NULL, NULL, 'Terms not stated [Qatar SC not in local club pool]', 'Wikipedia (en)', '2026-10-09', 'month');

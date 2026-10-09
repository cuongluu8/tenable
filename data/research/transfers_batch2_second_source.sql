-- Second-source pass (2026-10-09) for the 19 batch-2 players whose rows rested on the English
-- Wikipedia article alone. Each now has a second-language article read with the correct title.
-- Supersedes the affected rows in players_batch2_transfers_part4/5/6/8/9/10/12/15/16/17.sql.
-- Applied to production once; every statement is guarded, so repeating it is harmless.
--
-- Most rows were confirmed unchanged and only get their source updated (PART 2). PART 1 holds
-- the rows where the second source changed a date or a fee, under the usual rules: a different
-- day in the same month -> 'month'; a different month -> the earlier month; fees written only
-- when the sources agree.

-- PART 1: changes.
-- Vitinha -> PSG: €41.5m (en) vs €40m release clause (pt).
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €41.5m (en) or a €40m release clause (pt); announced 17 June 2022' WHERE player_id = 702 AND to_club_id = 261 AND display_value LIKE '€41.5m release clause%';
-- Luis Diaz -> Bayern: €75m including add-ons (en) vs €70m (fr).
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €70m-€75m including add-ons' WHERE player_id = 732 AND to_club_id = 243 AND display_value LIKE '€75m reported%';
-- Khusanov -> Manchester City: €40m initial (en) vs about €50m (fr).
UPDATE transfers SET fee_eur_value = NULL, fee_gbp_value = NULL, display_value = 'Reported as €40m initial (en) or about €50m (fr)' WHERE player_id = 761 AND to_club_id = 195 AND display_value LIKE '€40m initial reported%';
-- Joao Pedro -> Watford: contract effective 1 January 2020 (de).
UPDATE transfers SET date_precision = 'day' WHERE player_id = 793 AND to_club_id = 311 AND transfer_date = '2020-01-01' AND date_precision = 'month';
-- Joao Pedro -> Brighton: 5 May 2023 (en) vs June 2023 (de); earlier month kept. Both say about £30m.
UPDATE transfers SET transfer_date = '2023-05-01', date_precision = 'month', transfer_type = 'permanent', fee_eur_value = 34500000, fee_gbp_value = 30000000, display_value = 'Club record; about £30m (~€34.5m, approx.)' WHERE player_id = 793 AND to_club_id = 187 AND transfer_date = '2023-05-05';
-- Daniel Munoz -> Crystal Palace: 30 January 2024 (en) vs 29 January (es).
UPDATE transfers SET transfer_date = '2024-01-01', date_precision = 'month', display_value = 'Undisclosed; €10m per one source' WHERE player_id = 864 AND to_club_id = 190 AND transfer_date = '2024-01-30';
-- Chris Richards -> Bayern permanent: 19 January 2019 (en) vs 24 January (de).
UPDATE transfers SET transfer_date = '2019-01-01', date_precision = 'month' WHERE player_id = 866 AND to_club_id = 243 AND transfer_date = '2019-01-19';
-- Chris Richards, second Hoffenheim loan: 30 August 2021 (en) vs 31 August (de).
UPDATE transfers SET transfer_date = '2021-08-01', date_precision = 'month' WHERE player_id = 866 AND to_club_id = 250 AND transfer_date = '2021-08-30';
-- Joachim Andersen -> Twente: August 2013 (da).
UPDATE transfers SET date_precision = 'month' WHERE player_id = 876 AND to_club_id = 18971 AND transfer_date = '2013-08-01' AND date_precision = 'year';
-- Joachim Andersen, Fulham loan: 5 October 2020 (en) vs August 2020 (da); earlier month kept.
UPDATE transfers SET transfer_date = '2020-08-01', date_precision = 'month' WHERE player_id = 876 AND to_club_id = 192 AND transfer_date = '2020-10-05';
-- Bart Verbruggen: fees and the Anderlecht month from nl.wikipedia.
UPDATE transfers SET transfer_date = '2020-08-01', date_precision = 'month', display_value = '€300,000 per one source' WHERE player_id = 881 AND to_club_id = 293 AND date_precision = 'year';
UPDATE transfers SET transfer_type = 'permanent', fee_eur_value = 20000000, fee_gbp_value = 17400000, display_value = '€20m per one source (~£17.4m, approx.)' WHERE player_id = 881 AND to_club_id = 187 AND display_value = 'Fee not stated';
-- Ryan Christie -> Celtic: fee from de.wikipedia.
UPDATE transfers SET transfer_type = 'permanent', fee_eur_value = 685000, fee_gbp_value = 500000, display_value = '£500,000 per one source (~€685,000, approx.) [Inverness Caledonian Thistle not in local club pool]' WHERE player_id = 896 AND to_club_id = 287 AND display_value LIKE 'Fee not stated%';

-- PART 2: record the second source on every row for these 19 players.
UPDATE transfers SET source = 'Wikipedia (en, es)' WHERE player_id IN (701, 864) AND source = 'Wikipedia (en)';
UPDATE transfers SET source = 'Wikipedia (en, pt)' WHERE player_id = 702 AND source = 'Wikipedia (en)';
UPDATE transfers SET source = 'Wikipedia (en, fr)' WHERE player_id IN (732, 761, 868) AND source = 'Wikipedia (en)';
UPDATE transfers SET source = 'Wikipedia (en, da)' WHERE player_id = 876 AND source = 'Wikipedia (en)';
UPDATE transfers SET source = 'Wikipedia (en, nl)' WHERE player_id = 881 AND source = 'Wikipedia (en)';
UPDATE transfers SET source = 'Wikipedia (en, de)' WHERE player_id IN (724, 731, 782, 793, 819, 825, 826, 866, 871, 896, 898) AND source = 'Wikipedia (en)';

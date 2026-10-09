-- 2026-10-09. Two corrections from the user to transfers_fee_categories_and_permanent_rows.sql.
-- Applied to production once; safe to repeat.

-- Edinson Cavani (595), Palermo -> Napoli: the fee was €17m (€5m loan fee plus €12m obligation,
-- as en.wikipedia and Goal report). GBP at the 2011 rate (0.87).
UPDATE transfers SET fee_eur_value = 17000000, fee_gbp_value = 14800000, display_value = 'Loan made permanent; €17m in total (~£14.8m, approx.): €5m loan fee plus €12m obligation'
WHERE player_id = 595 AND from_club_id = 19054 AND to_club_id = 236 AND transfer_type = 'permanent';
UPDATE transfers SET display_value = 'Loan with obligation to buy (€17m in total)'
WHERE player_id = 595 AND from_club_id = 19054 AND to_club_id = 236 AND transfer_type = 'loan';

-- Fernando Torres (605), Chelsea -> AC Milan was a loan: the two-year loan row of August 2014
-- stands and the "made permanent" row added earlier today is removed.
DELETE FROM transfers WHERE player_id = 605 AND from_club_id = 189 AND to_club_id = 235 AND transfer_type <> 'loan' AND transfer_date = '2014-12-27';

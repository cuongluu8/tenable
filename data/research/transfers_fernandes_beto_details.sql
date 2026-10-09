-- 2026-10-09. User corrections to transfers_fee_categories_and_permanent_rows.sql.
-- Applied to production once; safe to repeat.

-- Bruno Fernandes (686), Udinese -> Sampdoria: the fee was €6m. GBP at the 2017 rate (0.88).
UPDATE transfers SET fee_eur_value = 6000000, fee_gbp_value = 5300000, display_value = 'Obligation to buy exercised; €6m (~£5.3m, approx.)'
WHERE player_id = 686 AND from_club_id = 242 AND to_club_id = 19053 AND transfer_type = 'permanent';

-- Beto (871), Portimonense -> Udinese: the fuller terms found in the audit.
-- Loan: en.wikipedia says the last day of the summer 2021 window (31 August); de says August 2021.
UPDATE transfers SET transfer_date = '2021-08-31', date_precision = 'day', display_value = 'Season-long loan with an obligation to buy at €7m', source = 'Wikipedia (en, de)/Calciodangolo'
WHERE player_id = 871 AND from_club_id = 18994 AND to_club_id = 242 AND transfer_type = 'loan';
-- Purchase: €7m (Calciodangolo, Sky Sport Italia); the bonus and sell-on are Calciodangolo only.
UPDATE transfers SET display_value = 'Obligation to buy exercised; €7m (~£6.0m, approx.). Per one source: up to €3m more in bonuses, and Portimonense keep 50% of a future sale'
WHERE player_id = 871 AND from_club_id = 18994 AND to_club_id = 242 AND transfer_type = 'permanent';

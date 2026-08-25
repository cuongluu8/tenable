-- Seed content for local/dev testing and to prove out the daily pipeline.
--
-- IMPORTANT: this is a small starter set, not a fact-checked content library.
-- Before real launch, expand this using FBref.com (manual research) and/or
-- the API-Football integration described in the project plan, and re-verify
-- every stat/rank — football records change every season.

INSERT INTO categories (slug, title, subtitle, stat_label, scheduled_date) VALUES
	('ucl-titles-by-club', 'Top 10 UEFA Champions League / European Cup winners', 'By club, through the 2023-24 final', 'titles', '2026-08-25'),
	('ballon-dor-most-wins', 'Top 10 most Ballon d''Or wins', 'By individual player, all-time', 'wins', '2026-08-26');

-- Category 1: UEFA Champions League / European Cup titles by club
INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 1, 'Real Madrid', '15'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 2, 'AC Milan', '7'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 3, 'Bayern Munich', '6'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 4, 'Liverpool', '6'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 5, 'Barcelona', '5'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 6, 'Ajax', '4'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 7, 'Inter Milan', '3'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 8, 'Manchester United', '3'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 9, 'Juventus', '2'),
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 10, 'Nottingham Forest', '2');

-- Category 2: Ballon d'Or wins by player
INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 1, 'Lionel Messi', '8'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 2, 'Cristiano Ronaldo', '5'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 3, 'Johan Cruyff', '3'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 4, 'Michel Platini', '3'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 5, 'Marco van Basten', '3'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 6, 'Alfredo Di Stefano', '2'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 7, 'Franz Beckenbauer', '2'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 8, 'Kevin Keegan', '2'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 9, 'Karl-Heinz Rummenigge', '2'),
	((SELECT id FROM categories WHERE slug = 'ballon-dor-most-wins'), 10, 'Ronaldo Nazario', '2');

-- Aliases: normalized (lowercase, accents stripped, punctuation removed) match strings.
-- The worker normalizes guesses the same way before comparing.
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'real madrid' FROM answers WHERE canonical_name = 'Real Madrid';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'madrid' FROM answers WHERE canonical_name = 'Real Madrid';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'ac milan' FROM answers WHERE canonical_name = 'AC Milan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'milan' FROM answers WHERE canonical_name = 'AC Milan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'bayern munich' FROM answers WHERE canonical_name = 'Bayern Munich';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'bayern' FROM answers WHERE canonical_name = 'Bayern Munich';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'liverpool' FROM answers WHERE canonical_name = 'Liverpool';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'barcelona' FROM answers WHERE canonical_name = 'Barcelona';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'barca' FROM answers WHERE canonical_name = 'Barcelona';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'ajax' FROM answers WHERE canonical_name = 'Ajax';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'inter milan' FROM answers WHERE canonical_name = 'Inter Milan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'inter' FROM answers WHERE canonical_name = 'Inter Milan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'manchester united' FROM answers WHERE canonical_name = 'Manchester United';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'man utd' FROM answers WHERE canonical_name = 'Manchester United';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'man united' FROM answers WHERE canonical_name = 'Manchester United';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'juventus' FROM answers WHERE canonical_name = 'Juventus';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'juve' FROM answers WHERE canonical_name = 'Juventus';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'nottingham forest' FROM answers WHERE canonical_name = 'Nottingham Forest';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'forest' FROM answers WHERE canonical_name = 'Nottingham Forest';

INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'lionel messi' FROM answers WHERE canonical_name = 'Lionel Messi';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'messi' FROM answers WHERE canonical_name = 'Lionel Messi';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'cristiano ronaldo' FROM answers WHERE canonical_name = 'Cristiano Ronaldo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'ronaldo' FROM answers WHERE canonical_name = 'Cristiano Ronaldo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'cr7' FROM answers WHERE canonical_name = 'Cristiano Ronaldo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'johan cruyff' FROM answers WHERE canonical_name = 'Johan Cruyff';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'cruyff' FROM answers WHERE canonical_name = 'Johan Cruyff';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'michel platini' FROM answers WHERE canonical_name = 'Michel Platini';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'platini' FROM answers WHERE canonical_name = 'Michel Platini';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'marco van basten' FROM answers WHERE canonical_name = 'Marco van Basten';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'van basten' FROM answers WHERE canonical_name = 'Marco van Basten';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'alfredo di stefano' FROM answers WHERE canonical_name = 'Alfredo Di Stefano';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'di stefano' FROM answers WHERE canonical_name = 'Alfredo Di Stefano';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'franz beckenbauer' FROM answers WHERE canonical_name = 'Franz Beckenbauer';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'beckenbauer' FROM answers WHERE canonical_name = 'Franz Beckenbauer';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'kevin keegan' FROM answers WHERE canonical_name = 'Kevin Keegan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'keegan' FROM answers WHERE canonical_name = 'Kevin Keegan';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'karl-heinz rummenigge' FROM answers WHERE canonical_name = 'Karl-Heinz Rummenigge';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'rummenigge' FROM answers WHERE canonical_name = 'Karl-Heinz Rummenigge';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'ronaldo nazario' FROM answers WHERE canonical_name = 'Ronaldo Nazario';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'r9' FROM answers WHERE canonical_name = 'Ronaldo Nazario';

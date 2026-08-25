-- Seed content for local/dev testing and to prove out the category-library
-- pipeline.
--
-- IMPORTANT: this is a small starter set, not a fact-checked content library.
-- Before real launch, expand this using FBref.com (manual research) and/or
-- the API-Football integration described in the project plan, and re-verify
-- every stat/rank — football records change every season.
--
-- scheduled_date is unused by the app now (categories are all playable any
-- time, not gated to a calendar date) — kept on existing rows only to avoid
-- churn; new categories below leave it NULL.

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

-- Category 3: UEFA European Championship (Euros) titles by country.
-- Exactly 10 nations have ever won it, so this fills a clean top 10 with no
-- padding — ties among 1-time winners are ordered by year of that win.
INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('euro-titles-by-country', 'Top 10 UEFA European Championship winners', 'By country, through Euro 2024', 'titles');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 1, 'Spain', '4'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 2, 'Germany', '3'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 3, 'Italy', '2'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 4, 'France', '2'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 5, 'Soviet Union', '1'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 6, 'Czechoslovakia', '1'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 7, 'Netherlands', '1'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 8, 'Denmark', '1'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 9, 'Greece', '1'),
	((SELECT id FROM categories WHERE slug = 'euro-titles-by-country'), 10, 'Portugal', '1');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'spain' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Spain';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'germany' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Germany';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'west germany' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Germany';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'italy' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Italy';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'france' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'France';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'soviet union' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Soviet Union';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ussr' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Soviet Union';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'czechoslovakia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Czechoslovakia';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'netherlands' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Netherlands';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'holland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Netherlands';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'denmark' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Denmark';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'greece' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Greece';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'portugal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'euro-titles-by-country' AND a.canonical_name = 'Portugal';

-- Category 4: Africa Cup of Nations (AFCON) titles by country. Lower
-- confidence than the others (more nations, more ties) — flagged here as an
-- extra reason to re-verify this one specifically before treating it as
-- authoritative.
INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('afcon-titles-by-country', 'Top 10 Africa Cup of Nations winners', 'By country, through AFCON 2023', 'titles');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 1, 'Egypt', '7'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 2, 'Cameroon', '5'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 3, 'Ghana', '4'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 4, 'Nigeria', '3'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 5, 'Ivory Coast', '3'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 6, 'DR Congo', '2'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 7, 'Algeria', '2'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 8, 'Zambia', '1'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 9, 'Tunisia', '1'),
	((SELECT id FROM categories WHERE slug = 'afcon-titles-by-country'), 10, 'Morocco', '1');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'egypt' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Egypt';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cameroon' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Cameroon';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ghana' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Ghana';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'nigeria' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Nigeria';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ivory coast' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Ivory Coast';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cote divoire' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Ivory Coast';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'dr congo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'DR Congo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'congo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'DR Congo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'zaire' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'DR Congo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'algeria' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Algeria';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'zambia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Zambia';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'tunisia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Tunisia';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'morocco' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'afcon-titles-by-country' AND a.canonical_name = 'Morocco';

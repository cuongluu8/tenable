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
	('ucl-titles-by-club', 'Top 10 UEFA Champions League / European Cup winners', 'By club, through the 2025-26 final. Ties broken by most recent title.', 'titles', '2026-08-25'),
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
	((SELECT id FROM categories WHERE slug = 'ucl-titles-by-club'), 10, 'Paris Saint-Germain', '2');
-- PSG reached 2 titles (2024-25, 2025-26 — beating Inter 5-0, then Arsenal on
-- penalties), tying Juventus and Nottingham Forest at 2. Ties broken by most
-- recent title, which drops Forest (last won 1980) from the top 10.

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
	SELECT id, 'paris saint-germain' FROM answers WHERE canonical_name = 'Paris Saint-Germain';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'paris saint germain' FROM answers WHERE canonical_name = 'Paris Saint-Germain';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'psg' FROM answers WHERE canonical_name = 'Paris Saint-Germain';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT id, 'paris' FROM answers WHERE canonical_name = 'Paris Saint-Germain';

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

-- Category 5: all-time FIFA World Cup career goalscorers, through the 2026
-- tournament (Kylian Mbappé passed Lionel Messi and Miroslav Klose's
-- previous record during the 2026 third-place playoff; Messi retired from
-- international duty after the 2026 final, ending on 21).
-- Ranks 9-10 are a 3-way tie at 11 goals (Kocsis, Klinsmann, Cristiano
-- Ronaldo) — Kocsis takes 9 as the outright next-highest tally holder isn't
-- tied, and Cristiano Ronaldo takes 10 over Klinsmann by pick (both valid).
INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('wc-alltime-goalscorers', 'Top 10 FIFA World Cup all-time goalscorers', 'Career total, through the 2026 tournament', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 1, 'Kylian Mbappe', '22'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 2, 'Lionel Messi', '21'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 3, 'Miroslav Klose', '16'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 4, 'Ronaldo Nazario', '15'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 5, 'Gerd Muller', '14'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 6, 'Harry Kane', '14'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 7, 'Just Fontaine', '13'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 8, 'Pele', '12'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 9, 'Sandor Kocsis', '11'),
	((SELECT id FROM categories WHERE slug = 'wc-alltime-goalscorers'), 10, 'Cristiano Ronaldo', '11');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kylian mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Kylian Mbappe';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Kylian Mbappe';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lionel messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Lionel Messi';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Lionel Messi';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'miroslav klose' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Miroslav Klose';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'klose' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Miroslav Klose';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ronaldo nazario' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Ronaldo Nazario';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'r9' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Ronaldo Nazario';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'gerd muller' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Gerd Muller';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'muller' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Gerd Muller';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'harry kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Harry Kane';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Harry Kane';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'just fontaine' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Just Fontaine';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'fontaine' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Just Fontaine';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'pele' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Pele';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sandor kocsis' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Sandor Kocsis';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kocsis' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Sandor Kocsis';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cristiano ronaldo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Cristiano Ronaldo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ronaldo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Cristiano Ronaldo';
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cr7' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-alltime-goalscorers' AND a.canonical_name = 'Cristiano Ronaldo';
-- 12 new categories added in response to a request for more, recent-stat content.
-- Sourced via web search (2025-26 season finals + the 2026 World Cup, cross-referenced
-- across multiple outlets) rather than training data, which predates most of this.
-- Several other proposed categories (most expensive transfers, most-capped players,
-- Europa League/La Liga title counts, PL single-season scoring records) were dropped:
-- either the data was incomplete/too volatile to trust for a full top 10, or --  for
-- single-season records -- the same player recurring across multiple ranks doesn't fit
-- this game's one-guess-per-slot format. Same caveat as existing seed data: re-verify
-- before treating as a permanent authoritative library, especially the Serie A all-time
-- table below rank 3 (Genoa/Torino/Bologna/Pro Vercelli), which is lower-confidence.

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('pl-2025-26-top-scorers', 'Top 10 Premier League 2025-26 top scorers', 'Golden Boot race, 2025-26 season', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 1, 'Erling Haaland', '27'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 2, 'Thiago', '22'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 3, 'Ollie Watkins', '16'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 4, 'Joao Pedro', '15'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 5, 'Morgan Gibbs-White', '15'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 6, 'Viktor Gyokeres', '14'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 7, 'Dominic Calvert-Lewin', '14'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 8, 'Daniel Welbeck', '13'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 9, 'Eli Kroupi', '13'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-top-scorers'), 10, 'Jean-Philippe Mateta', '12');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'erling haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'thiago' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ollie watkins' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'olly watkins' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'watkins' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'joao pedro' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'gibbswhite' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'morgan gibbswhite' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'gyokeres' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'viktor gyokeres' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'calvertlewin' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'dominic calvertlewin' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'daniel welbeck' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'welbeck' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'eli kroupi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kroupi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'jeanphilippe mateta' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mateta' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-top-scorers' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('la-liga-2025-26-table', 'Top 10 La Liga 2025-26 final table', 'Final standings, 2025-26 season', 'final position');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 1, 'Barcelona', '1st (Champions)'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 2, 'Real Madrid', '2nd'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 3, 'Villarreal', '3rd'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 4, 'Atletico Madrid', '4th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 5, 'Real Betis', '5th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 6, 'Celta Vigo', '6th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 7, 'Getafe', '7th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 8, 'Rayo Vallecano', '8th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 9, 'Valencia', '9th'),
	((SELECT id FROM categories WHERE slug = 'la-liga-2025-26-table'), 10, 'Real Sociedad', '10th');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'barca' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'barcelona' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'madrid' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'real madrid' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'villarreal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'atleti' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'atletico' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'atletico madrid' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'betis' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'real betis' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'celta' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'celta vigo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'getafe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'rayo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'rayo vallecano' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'valencia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'la real' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'real sociedad' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sociedad' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'la-liga-2025-26-table' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('serie-a-2025-26-table', 'Top 10 Serie A 2025-26 final table', 'Final standings, 2025-26 season', 'points');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 1, 'Inter Milan', '87 (Champions)'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 2, 'Napoli', '76'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 3, 'Roma', '73'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 4, 'Como', '71'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 5, 'AC Milan', '70'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 6, 'Juventus', '69'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 7, 'Atalanta', '59'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 8, 'Bologna', '56'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 9, 'Lazio', '54'),
	((SELECT id FROM categories WHERE slug = 'serie-a-2025-26-table'), 10, 'Udinese', '50');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'inter' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'inter milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'napoli' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'as roma' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'roma' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'como' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ac milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'juve' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'juventus' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'atalanta' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bologna' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lazio' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'udinese' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-2025-26-table' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('bundesliga-2025-26-table', 'Top 10 Bundesliga 2025-26 final table', 'Final standings, 2025-26 season', 'final position');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 1, 'Bayern Munich', '1st (Champions)'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 2, 'Borussia Dortmund', '2nd'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 3, 'RB Leipzig', '3rd'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 4, 'VfB Stuttgart', '4th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 5, 'TSG Hoffenheim', '5th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 6, 'Bayer Leverkusen', '6th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 7, 'SC Freiburg', '7th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 8, 'Eintracht Frankfurt', '8th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 9, 'FC Augsburg', '9th'),
	((SELECT id FROM categories WHERE slug = 'bundesliga-2025-26-table'), 10, 'Mainz 05', '10th');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bayern' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bayern munich' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'borussia dortmund' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bvb' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'dortmund' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'leipzig' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'rb leipzig' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'stuttgart' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vfb stuttgart' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'hoffenheim' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'tsg hoffenheim' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bayer leverkusen' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'leverkusen' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'freiburg' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sc freiburg' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'eintracht frankfurt' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'frankfurt' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'augsburg' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'fc augsburg' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mainz' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mainz 05' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'bundesliga-2025-26-table' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('cl-2025-26-top-scorers', 'Top 10 Champions League 2025-26 top scorers', 'Golden Boot, 2025-26 season', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 1, 'Kylian Mbappe', '15'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 2, 'Harry Kane', '14'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 3, 'Khvicha Kvaratskhelia', '10'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 4, 'Julian Alvarez', '10'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 5, 'Anthony Gordon', '10'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 6, 'Michael Olise', '8'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 7, 'Vinicius Junior', '8'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 8, 'Achraf Hakimi', '6'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 9, 'Pierre-Emerick Aubameyang', '5'),
	((SELECT id FROM categories WHERE slug = 'cl-2025-26-top-scorers'), 10, 'Antoine Griezmann', '5');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kylian mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'harry kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'khvicha kvaratskhelia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kvara' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kvaratskhelia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'alvarez' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'julian alvarez' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'anthony gordon' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'gordon' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'michael olise' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'olise' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vini jr' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vinicius' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vinicius junior' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'achraf hakimi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'hakimi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'aubameyang' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'pierreemerick aubameyang' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'antoine griezmann' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'griezmann' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-2025-26-top-scorers' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('wc-2026-top-scorers', 'Top 10 FIFA World Cup 2026 top scorers', 'Golden Boot, 2026 tournament', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 1, 'Kylian Mbappe', '10'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 2, 'Lionel Messi', '8'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 3, 'Jude Bellingham', '7'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 4, 'Erling Haaland', '7'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 5, 'Harry Kane', '6'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 6, 'Ousmane Dembele', '6'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 7, 'Mikel Oyarzabal', '5'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 8, 'Vinicius Junior', '4'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 9, 'Jonathan Quinones', '4'),
	((SELECT id FROM categories WHERE slug = 'wc-2026-top-scorers'), 10, 'Ismaila Sarr', '4');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kylian mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lionel messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bellingham' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'jude bellingham' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'erling haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'harry kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'dembele' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ousmane dembele' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mikel oyarzabal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'oyarzabal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vini jr' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vinicius' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vinicius junior' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'jonathan quinones' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ismaila sarr' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sarr' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'wc-2026-top-scorers' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('pl-2025-26-final-table', 'Top 10 Premier League 2025-26 final table', 'Final standings, 2025-26 season', 'points');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 1, 'Arsenal', '85 (Champions)'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 2, 'Manchester City', '78'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 3, 'Manchester United', '71'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 4, 'Aston Villa', '65'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 5, 'Liverpool', '60'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 6, 'Bournemouth', '57'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 7, 'Sunderland', '54'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 8, 'Brighton', '53'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 9, 'Fulham', '52'),
	((SELECT id FROM categories WHERE slug = 'pl-2025-26-final-table'), 10, 'Newcastle United', '49');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'arsenal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man city' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'manchester city' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man utd' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'manchester united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'aston villa' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'villa' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'liverpool' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bournemouth' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sunderland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'brighton' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'brighton and hove albion' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'brighton hove albion' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'fulham' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'newcastle' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'newcastle united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-2025-26-final-table' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('pl-alltime-top-scorers', 'Top 10 Premier League all-time top scorers', 'Career total, through 2025-26', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 1, 'Alan Shearer', '260'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 2, 'Harry Kane', '213'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 3, 'Wayne Rooney', '208'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 4, 'Mohamed Salah', '193'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 5, 'Andrew Cole', '187'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 6, 'Sergio Aguero', '184'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 7, 'Frank Lampard', '177'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 8, 'Thierry Henry', '175'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 9, 'Robbie Fowler', '163'),
	((SELECT id FROM categories WHERE slug = 'pl-alltime-top-scorers'), 10, 'Jermain Defoe', '162');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'alan shearer' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'shearer' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'harry kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kane' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'rooney' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'wayne rooney' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mohamed salah' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'salah' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'andrew cole' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'andy cole' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cole' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'aguero' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kun aguero' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sergio aguero' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'frank lampard' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lampard' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'henry' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'thierry henry' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'fowler' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'robbie fowler' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'defoe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'jermain defoe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'pl-alltime-top-scorers' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('cl-alltime-top-scorers', 'Top 10 UEFA Champions League all-time top scorers', 'Career total, through 2025-26', 'goals');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 1, 'Cristiano Ronaldo', '140'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 2, 'Lionel Messi', '129'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 3, 'Robert Lewandowski', '106'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 4, 'Karim Benzema', '90'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 5, 'Raul Gonzalez', '71'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 6, 'Kylian Mbappe', '70'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 7, 'Thomas Muller', '56'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 8, 'Ruud van Nistelrooy', '56'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 9, 'Thierry Henry', '50'),
	((SELECT id FROM categories WHERE slug = 'cl-alltime-top-scorers'), 10, 'Erling Haaland', '50');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cr7' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'cristiano ronaldo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ronaldo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lionel messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'messi' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lewandowski' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'robert lewandowski' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'benzema' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'karim benzema' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'raul' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'raul gonzalez' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'kylian mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'mbappe' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'muller' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'thomas muller' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ruud van nistelrooy' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'van nistelrooy' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'henry' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'thierry henry' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'erling haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 10;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'haaland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'cl-alltime-top-scorers' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('serie-a-alltime-titles', 'Top 10 Serie A all-time champions', 'Scudetti by club, through 2025-26', 'titles');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 1, 'Juventus', '36'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 2, 'Inter Milan', '21'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 3, 'AC Milan', '19'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 4, 'Genoa', '9'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 5, 'Torino', '7'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 6, 'Bologna', '7'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 7, 'Pro Vercelli', '7'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 8, 'Napoli', '4'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 9, 'Roma', '3'),
	((SELECT id FROM categories WHERE slug = 'serie-a-alltime-titles'), 10, 'Lazio', '2');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'juve' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'juventus' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'inter' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'inter milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'ac milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'milan' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'genoa' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'torino' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'bologna' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'pro vercelli' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'vercelli' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'napoli' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'as roma' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'roma' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'lazio' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'serie-a-alltime-titles' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('english-top-flight-alltime-titles', 'Top 10 English top-flight champions', 'All-time, including pre-Premier League era, through 2025-26', 'titles');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 1, 'Manchester United', '20'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 2, 'Liverpool', '20'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 3, 'Arsenal', '14'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 4, 'Manchester City', '10'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 5, 'Everton', '9'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 6, 'Aston Villa', '7'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 7, 'Sunderland', '6'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 8, 'Chelsea', '6'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 9, 'Newcastle United', '4'),
	((SELECT id FROM categories WHERE slug = 'english-top-flight-alltime-titles'), 10, 'Sheffield Wednesday', '4');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man utd' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'manchester united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'liverpool' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'arsenal' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'man city' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'manchester city' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'everton' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'aston villa' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'villa' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sunderland' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'chelsea' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'newcastle' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'newcastle united' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'sheffield wednesday' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'english-top-flight-alltime-titles' AND a.rank = 10;

INSERT INTO categories (slug, title, subtitle, stat_label) VALUES
	('copa-libertadores-alltime-titles', 'Top 10 Copa Libertadores champions by club', 'Ranked by titles won through the 2025 final; ties broken by most recent title (same convention as the Champions League and Serie A categories). Verified year-by-year (66 editions, 1960-2025) rather than aggregated from a single source.', 'titles');

INSERT INTO answers (category_id, rank, canonical_name, stat_value) VALUES
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 1, 'Independiente', '7'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 2, 'Boca Juniors', '6'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 3, 'Penarol', '5'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 4, 'Flamengo', '4'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 5, 'River Plate', '4'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 6, 'Estudiantes de La Plata', '4'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 7, 'Palmeiras', '3'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 8, 'Gremio', '3'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 9, 'Santos', '3'),
	((SELECT id FROM categories WHERE slug = 'copa-libertadores-alltime-titles'), 10, 'Olimpia', '3');

INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'independiente' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 1;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'boca' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'boca juniors' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 2;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'penarol' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 3;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'flamengo' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 4;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'river' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'river plate' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 5;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'estudiantes' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'estudiantes de la plata' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 6;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'palmeiras' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 7;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'gremio' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 8;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'santos' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 9;
INSERT INTO answer_aliases (answer_id, alias)
	SELECT a.id, 'olimpia' FROM answers a JOIN categories c ON a.category_id = c.id
	WHERE c.slug = 'copa-libertadores-alltime-titles' AND a.rank = 10;
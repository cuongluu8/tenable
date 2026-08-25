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
-- Reference clubs: a typeahead-only pool of real South American club names,
-- decoupled from the `answers` table. suggestNames() searches this alongside
-- answer_aliases so players can type/select any real club while guessing, not
-- just the current category's correct answers. This does NOT affect what
-- counts as a correct guess (matchGuess still only reads answer_aliases,
-- scoped to the category). Best-effort current top-flight rosters (Aug 2026) —
-- not held to the same fact-checking bar as answer content since it only
-- affects autocomplete, not scoring. See agents.md.

INSERT INTO reference_entities (canonical_name, category) VALUES
	('Argentinos Juniors', 'Argentina'),
	('Atletico Tucuman', 'Argentina'),
	('Aldosivi', 'Argentina'),
	('Estudiantes de Rio Cuarto', 'Argentina'),
	('Estudiantes de La Plata', 'Argentina'),
	('Velez Sarsfield', 'Argentina'),
	('Defensa y Justicia', 'Argentina'),
	('Gimnasia y Esgrima Mendoza', 'Argentina'),
	('Gimnasia y Esgrima La Plata', 'Argentina'),
	('Talleres Cordoba', 'Argentina'),
	('Union de Santa Fe', 'Argentina'),
	('Huracan', 'Argentina'),
	('Deportivo Riestra', 'Argentina'),
	('Newells Old Boys', 'Argentina'),
	('Banfield', 'Argentina'),
	('Barracas Central', 'Argentina'),
	('Platense', 'Argentina'),
	('Sarmiento Junin', 'Argentina'),
	('Belgrano', 'Argentina'),
	('Independiente', 'Argentina'),
	('Independiente Rivadavia', 'Argentina'),
	('Boca Juniors', 'Argentina'),
	('River Plate', 'Argentina'),
	('Rosario Central', 'Argentina'),
	('San Lorenzo', 'Argentina'),
	('Colon', 'Argentina'),
	('Racing Club', 'Argentina'),
	('Lanus', 'Argentina'),
	('Instituto', 'Argentina'),
	('Palmeiras', 'Brazil'),
	('Flamengo', 'Brazil'),
	('Fluminense', 'Brazil'),
	('Athletico Paranaense', 'Brazil'),
	('Red Bull Bragantino', 'Brazil'),
	('Bahia', 'Brazil'),
	('Coritiba', 'Brazil'),
	('Sao Paulo', 'Brazil'),
	('Atletico Mineiro', 'Brazil'),
	('Corinthians', 'Brazil'),
	('Cruzeiro', 'Brazil'),
	('Botafogo', 'Brazil'),
	('Vitoria', 'Brazil'),
	('Internacional', 'Brazil'),
	('Santos', 'Brazil'),
	('Gremio', 'Brazil'),
	('Vasco da Gama', 'Brazil'),
	('Remo', 'Brazil'),
	('Mirassol', 'Brazil'),
	('Chapecoense', 'Brazil'),
	('Audax Italiano', 'Chile'),
	('Cobresal', 'Chile'),
	('Colo-Colo', 'Chile'),
	('Coquimbo Unido', 'Chile'),
	('Deportes Concepcion', 'Chile'),
	('Deportes La Serena', 'Chile'),
	('Deportes Limache', 'Chile'),
	('Everton de Vina del Mar', 'Chile'),
	('Huachipato', 'Chile'),
	('Nublense', 'Chile'),
	('O''Higgins', 'Chile'),
	('Palestino', 'Chile'),
	('Union La Calera', 'Chile'),
	('Universidad Catolica', 'Chile'),
	('Universidad de Chile', 'Chile'),
	('Universidad de Concepcion', 'Chile'),
	('Penarol', 'Uruguay'),
	('Nacional', 'Uruguay'),
	('Danubio', 'Uruguay'),
	('Defensor Sporting', 'Uruguay'),
	('River Plate Montevideo', 'Uruguay'),
	('Montevideo Wanderers', 'Uruguay'),
	('Cerro', 'Uruguay'),
	('Progreso', 'Uruguay'),
	('Rampla Juniors', 'Uruguay'),
	('Liverpool Montevideo', 'Uruguay'),
	('Boston River', 'Uruguay'),
	('Racing Montevideo', 'Uruguay'),
	('Fenix', 'Uruguay'),
	('Plaza Colonia', 'Uruguay'),
	('Cerro Largo', 'Uruguay'),
	('Juventud de Las Piedras', 'Uruguay'),
	('Deportivo Maldonado', 'Uruguay'),
	('Albion', 'Uruguay'),
	('Central Espanol', 'Uruguay'),
	('Miramar Misiones', 'Uruguay'),
	('Torque', 'Uruguay'),
	('Cerro Porteno', 'Paraguay'),
	('Olimpia', 'Paraguay'),
	('Libertad', 'Paraguay'),
	('Guarani', 'Paraguay'),
	('Sportivo Luqueno', 'Paraguay'),
	('Nacional Paraguay', 'Paraguay'),
	('2 de Mayo', 'Paraguay'),
	('Sportivo Trinidense', 'Paraguay'),
	('Recoleta', 'Paraguay'),
	('General Caballero JLM', 'Paraguay'),
	('Tembetary', 'Paraguay'),
	('Rubio Nu', 'Paraguay'),
	('San Lorenzo Paraguay', 'Paraguay'),
	('Sol de America', 'Paraguay'),
	('Guairena', 'Paraguay'),
	('Independiente Campo Grande', 'Paraguay'),
	('Aguilas Doradas', 'Colombia'),
	('Alianza Petrolera', 'Colombia'),
	('America de Cali', 'Colombia'),
	('Atletico Bucaramanga', 'Colombia'),
	('Atletico Nacional', 'Colombia'),
	('Boyaca Chico', 'Colombia'),
	('Deportes Tolima', 'Colombia'),
	('Deportivo Cali', 'Colombia'),
	('Deportivo Pasto', 'Colombia'),
	('Deportivo Pereira', 'Colombia'),
	('Envigado', 'Colombia'),
	('Fortaleza CEIF', 'Colombia'),
	('Independiente Medellin', 'Colombia'),
	('Independiente Santa Fe', 'Colombia'),
	('Junior', 'Colombia'),
	('La Equidad', 'Colombia'),
	('Millonarios', 'Colombia'),
	('Once Caldas', 'Colombia'),
	('Cucuta Deportivo', 'Colombia'),
	('Independiente del Valle', 'Ecuador'),
	('Barcelona SC', 'Ecuador'),
	('Emelec', 'Ecuador'),
	('Universidad Catolica Ecuador', 'Ecuador'),
	('Aucas', 'Ecuador'),
	('Delfin SC', 'Ecuador'),
	('Deportivo Cuenca', 'Ecuador'),
	('LDU Quito', 'Ecuador'),
	('Macara', 'Ecuador'),
	('Mushuc Runa', 'Ecuador'),
	('Guayaquil City', 'Ecuador'),
	('Cumbaya', 'Ecuador'),
	('Tecnico Universitario', 'Ecuador'),
	('Alianza Lima', 'Peru'),
	('Alianza Atletico', 'Peru'),
	('Sporting Cristal', 'Peru'),
	('Universitario', 'Peru'),
	('Cusco FC', 'Peru'),
	('Cienciano', 'Peru'),
	('Sport Boys', 'Peru'),
	('Sport Huancayo', 'Peru'),
	('Deportivo Municipal', 'Peru'),
	('Melgar', 'Peru'),
	('Comerciantes Unidos', 'Peru'),
	('Cajamarca', 'Peru'),
	('Deportivo Moquegua', 'Peru'),
	('Deportivo Garcilaso', 'Peru'),
	('AD Tarma', 'Peru'),
	('Los Chankas', 'Peru'),
	('Juan Pablo II', 'Peru'),
	('Atletico Grau', 'Peru'),
	('ABB', 'Bolivia'),
	('Always Ready', 'Bolivia'),
	('Aurora', 'Bolivia'),
	('Blooming', 'Bolivia'),
	('Bolivar', 'Bolivia'),
	('Guabira', 'Bolivia'),
	('GV San Jose', 'Bolivia'),
	('Independiente Petrolero', 'Bolivia'),
	('Nacional Potosi', 'Bolivia'),
	('Oriente Petrolero', 'Bolivia'),
	('Real Oruro', 'Bolivia'),
	('Real Potosi', 'Bolivia'),
	('Real Tomayapo', 'Bolivia'),
	('San Antonio Bulo Bulo', 'Bolivia'),
	('The Strongest', 'Bolivia'),
	('Universidad de Vinto', 'Bolivia'),
	('Deportivo La Guaira', 'Venezuela'),
	('Metropolitanos FC', 'Venezuela'),
	('Deportivo Tachira', 'Venezuela'),
	('Universidad Central de Venezuela', 'Venezuela'),
	('Portuguesa FC', 'Venezuela'),
	('Estudiantes de Merida', 'Venezuela'),
	('Carabobo FC', 'Venezuela'),
	('Academia Puerto Cabello', 'Venezuela'),
	('Zamora FC', 'Venezuela'),
	('Caracas FC', 'Venezuela'),
	('Rayo Zuliano', 'Venezuela'),
	('Monagas SC', 'Venezuela'),
	('Academia Anzoategui', 'Venezuela'),
	('Trujillanos', 'Venezuela');

INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'argentinos' FROM reference_entities WHERE canonical_name = 'Argentinos Juniors' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'argentinos juniors' FROM reference_entities WHERE canonical_name = 'Argentinos Juniors' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico tucuman' FROM reference_entities WHERE canonical_name = 'Atletico Tucuman' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'aldosivi' FROM reference_entities WHERE canonical_name = 'Aldosivi' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'estudiantes de rio cuarto' FROM reference_entities WHERE canonical_name = 'Estudiantes de Rio Cuarto' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'estudiantes' FROM reference_entities WHERE canonical_name = 'Estudiantes de La Plata' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'estudiantes de la plata' FROM reference_entities WHERE canonical_name = 'Estudiantes de La Plata' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'velez' FROM reference_entities WHERE canonical_name = 'Velez Sarsfield' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'velez sarsfield' FROM reference_entities WHERE canonical_name = 'Velez Sarsfield' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'defensa y justicia' FROM reference_entities WHERE canonical_name = 'Defensa y Justicia' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gimnasia y esgrima mendoza' FROM reference_entities WHERE canonical_name = 'Gimnasia y Esgrima Mendoza' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gimnasia' FROM reference_entities WHERE canonical_name = 'Gimnasia y Esgrima La Plata' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gimnasia y esgrima la plata' FROM reference_entities WHERE canonical_name = 'Gimnasia y Esgrima La Plata' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'talleres' FROM reference_entities WHERE canonical_name = 'Talleres Cordoba' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'talleres cordoba' FROM reference_entities WHERE canonical_name = 'Talleres Cordoba' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'union de santa fe' FROM reference_entities WHERE canonical_name = 'Union de Santa Fe' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'union santa fe' FROM reference_entities WHERE canonical_name = 'Union de Santa Fe' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'huracan' FROM reference_entities WHERE canonical_name = 'Huracan' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo riestra' FROM reference_entities WHERE canonical_name = 'Deportivo Riestra' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'riestra' FROM reference_entities WHERE canonical_name = 'Deportivo Riestra' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'newells' FROM reference_entities WHERE canonical_name = 'Newells Old Boys' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'newells old boys' FROM reference_entities WHERE canonical_name = 'Newells Old Boys' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'banfield' FROM reference_entities WHERE canonical_name = 'Banfield' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'barracas central' FROM reference_entities WHERE canonical_name = 'Barracas Central' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'platense' FROM reference_entities WHERE canonical_name = 'Platense' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sarmiento' FROM reference_entities WHERE canonical_name = 'Sarmiento Junin' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sarmiento junin' FROM reference_entities WHERE canonical_name = 'Sarmiento Junin' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'belgrano' FROM reference_entities WHERE canonical_name = 'Belgrano' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente' FROM reference_entities WHERE canonical_name = 'Independiente' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente rivadavia' FROM reference_entities WHERE canonical_name = 'Independiente Rivadavia' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'boca' FROM reference_entities WHERE canonical_name = 'Boca Juniors' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'boca juniors' FROM reference_entities WHERE canonical_name = 'Boca Juniors' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'river' FROM reference_entities WHERE canonical_name = 'River Plate' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'river plate' FROM reference_entities WHERE canonical_name = 'River Plate' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rosario central' FROM reference_entities WHERE canonical_name = 'Rosario Central' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'san lorenzo' FROM reference_entities WHERE canonical_name = 'San Lorenzo' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'colon' FROM reference_entities WHERE canonical_name = 'Colon' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'racing' FROM reference_entities WHERE canonical_name = 'Racing Club' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'racing club' FROM reference_entities WHERE canonical_name = 'Racing Club' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lanus' FROM reference_entities WHERE canonical_name = 'Lanus' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'instituto' FROM reference_entities WHERE canonical_name = 'Instituto' AND category = 'Argentina';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'palmeiras' FROM reference_entities WHERE canonical_name = 'Palmeiras' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'flamengo' FROM reference_entities WHERE canonical_name = 'Flamengo' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fluminense' FROM reference_entities WHERE canonical_name = 'Fluminense' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'athletico paranaense' FROM reference_entities WHERE canonical_name = 'Athletico Paranaense' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico paranaense' FROM reference_entities WHERE canonical_name = 'Athletico Paranaense' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bragantino' FROM reference_entities WHERE canonical_name = 'Red Bull Bragantino' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'red bull bragantino' FROM reference_entities WHERE canonical_name = 'Red Bull Bragantino' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bahia' FROM reference_entities WHERE canonical_name = 'Bahia' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'coritiba' FROM reference_entities WHERE canonical_name = 'Coritiba' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sao paulo' FROM reference_entities WHERE canonical_name = 'Sao Paulo' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico mineiro' FROM reference_entities WHERE canonical_name = 'Atletico Mineiro' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'galo' FROM reference_entities WHERE canonical_name = 'Atletico Mineiro' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'corinthians' FROM reference_entities WHERE canonical_name = 'Corinthians' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cruzeiro' FROM reference_entities WHERE canonical_name = 'Cruzeiro' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'botafogo' FROM reference_entities WHERE canonical_name = 'Botafogo' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'vitoria' FROM reference_entities WHERE canonical_name = 'Vitoria' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'inter' FROM reference_entities WHERE canonical_name = 'Internacional' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'internacional' FROM reference_entities WHERE canonical_name = 'Internacional' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'santos' FROM reference_entities WHERE canonical_name = 'Santos' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gremio' FROM reference_entities WHERE canonical_name = 'Gremio' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'vasco' FROM reference_entities WHERE canonical_name = 'Vasco da Gama' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'vasco da gama' FROM reference_entities WHERE canonical_name = 'Vasco da Gama' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'remo' FROM reference_entities WHERE canonical_name = 'Remo' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mirassol' FROM reference_entities WHERE canonical_name = 'Mirassol' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'chapecoense' FROM reference_entities WHERE canonical_name = 'Chapecoense' AND category = 'Brazil';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'audax italiano' FROM reference_entities WHERE canonical_name = 'Audax Italiano' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cobresal' FROM reference_entities WHERE canonical_name = 'Cobresal' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'colo colo' FROM reference_entities WHERE canonical_name = 'Colo-Colo' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'colocolo' FROM reference_entities WHERE canonical_name = 'Colo-Colo' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'coquimbo unido' FROM reference_entities WHERE canonical_name = 'Coquimbo Unido' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportes concepcion' FROM reference_entities WHERE canonical_name = 'Deportes Concepcion' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportes la serena' FROM reference_entities WHERE canonical_name = 'Deportes La Serena' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportes limache' FROM reference_entities WHERE canonical_name = 'Deportes Limache' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'everton' FROM reference_entities WHERE canonical_name = 'Everton de Vina del Mar' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'everton de vina del mar' FROM reference_entities WHERE canonical_name = 'Everton de Vina del Mar' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'huachipato' FROM reference_entities WHERE canonical_name = 'Huachipato' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nublense' FROM reference_entities WHERE canonical_name = 'Nublense' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ohiggins' FROM reference_entities WHERE canonical_name = 'O''Higgins' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'palestino' FROM reference_entities WHERE canonical_name = 'Palestino' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'union la calera' FROM reference_entities WHERE canonical_name = 'Union La Calera' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad catolica' FROM reference_entities WHERE canonical_name = 'Universidad Catolica' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'la u' FROM reference_entities WHERE canonical_name = 'Universidad de Chile' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad de chile' FROM reference_entities WHERE canonical_name = 'Universidad de Chile' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad de concepcion' FROM reference_entities WHERE canonical_name = 'Universidad de Concepcion' AND category = 'Chile';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'penarol' FROM reference_entities WHERE canonical_name = 'Penarol' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nacional' FROM reference_entities WHERE canonical_name = 'Nacional' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'danubio' FROM reference_entities WHERE canonical_name = 'Danubio' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'defensor' FROM reference_entities WHERE canonical_name = 'Defensor Sporting' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'defensor sporting' FROM reference_entities WHERE canonical_name = 'Defensor Sporting' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'river plate montevideo' FROM reference_entities WHERE canonical_name = 'River Plate Montevideo' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'montevideo wanderers' FROM reference_entities WHERE canonical_name = 'Montevideo Wanderers' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'wanderers' FROM reference_entities WHERE canonical_name = 'Montevideo Wanderers' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cerro' FROM reference_entities WHERE canonical_name = 'Cerro' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'progreso' FROM reference_entities WHERE canonical_name = 'Progreso' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rampla juniors' FROM reference_entities WHERE canonical_name = 'Rampla Juniors' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'liverpool montevideo' FROM reference_entities WHERE canonical_name = 'Liverpool Montevideo' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'boston river' FROM reference_entities WHERE canonical_name = 'Boston River' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'racing montevideo' FROM reference_entities WHERE canonical_name = 'Racing Montevideo' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fenix' FROM reference_entities WHERE canonical_name = 'Fenix' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'plaza colonia' FROM reference_entities WHERE canonical_name = 'Plaza Colonia' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cerro largo' FROM reference_entities WHERE canonical_name = 'Cerro Largo' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'juventud de las piedras' FROM reference_entities WHERE canonical_name = 'Juventud de Las Piedras' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo maldonado' FROM reference_entities WHERE canonical_name = 'Deportivo Maldonado' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'albion' FROM reference_entities WHERE canonical_name = 'Albion' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'central espanol' FROM reference_entities WHERE canonical_name = 'Central Espanol' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'miramar misiones' FROM reference_entities WHERE canonical_name = 'Miramar Misiones' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'torque' FROM reference_entities WHERE canonical_name = 'Torque' AND category = 'Uruguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cerro porteno' FROM reference_entities WHERE canonical_name = 'Cerro Porteno' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'olimpia' FROM reference_entities WHERE canonical_name = 'Olimpia' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'libertad' FROM reference_entities WHERE canonical_name = 'Libertad' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guarani' FROM reference_entities WHERE canonical_name = 'Guarani' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sportivo luqueno' FROM reference_entities WHERE canonical_name = 'Sportivo Luqueno' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nacional paraguay' FROM reference_entities WHERE canonical_name = 'Nacional Paraguay' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, '2 de mayo' FROM reference_entities WHERE canonical_name = '2 de Mayo' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sportivo trinidense' FROM reference_entities WHERE canonical_name = 'Sportivo Trinidense' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'recoleta' FROM reference_entities WHERE canonical_name = 'Recoleta' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'general caballero jlm' FROM reference_entities WHERE canonical_name = 'General Caballero JLM' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'tembetary' FROM reference_entities WHERE canonical_name = 'Tembetary' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rubio nu' FROM reference_entities WHERE canonical_name = 'Rubio Nu' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'san lorenzo paraguay' FROM reference_entities WHERE canonical_name = 'San Lorenzo Paraguay' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sol de america' FROM reference_entities WHERE canonical_name = 'Sol de America' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guairena' FROM reference_entities WHERE canonical_name = 'Guairena' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente campo grande' FROM reference_entities WHERE canonical_name = 'Independiente Campo Grande' AND category = 'Paraguay';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'aguilas doradas' FROM reference_entities WHERE canonical_name = 'Aguilas Doradas' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alianza petrolera' FROM reference_entities WHERE canonical_name = 'Alianza Petrolera' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'america de cali' FROM reference_entities WHERE canonical_name = 'America de Cali' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico bucaramanga' FROM reference_entities WHERE canonical_name = 'Atletico Bucaramanga' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico nacional' FROM reference_entities WHERE canonical_name = 'Atletico Nacional' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'boyaca chico' FROM reference_entities WHERE canonical_name = 'Boyaca Chico' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportes tolima' FROM reference_entities WHERE canonical_name = 'Deportes Tolima' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo cali' FROM reference_entities WHERE canonical_name = 'Deportivo Cali' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo pasto' FROM reference_entities WHERE canonical_name = 'Deportivo Pasto' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo pereira' FROM reference_entities WHERE canonical_name = 'Deportivo Pereira' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'envigado' FROM reference_entities WHERE canonical_name = 'Envigado' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fortaleza ceif' FROM reference_entities WHERE canonical_name = 'Fortaleza CEIF' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente medellin' FROM reference_entities WHERE canonical_name = 'Independiente Medellin' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente santa fe' FROM reference_entities WHERE canonical_name = 'Independiente Santa Fe' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'santa fe' FROM reference_entities WHERE canonical_name = 'Independiente Santa Fe' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'junior' FROM reference_entities WHERE canonical_name = 'Junior' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'junior de barranquilla' FROM reference_entities WHERE canonical_name = 'Junior' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'la equidad' FROM reference_entities WHERE canonical_name = 'La Equidad' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'millonarios' FROM reference_entities WHERE canonical_name = 'Millonarios' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'once caldas' FROM reference_entities WHERE canonical_name = 'Once Caldas' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cucuta deportivo' FROM reference_entities WHERE canonical_name = 'Cucuta Deportivo' AND category = 'Colombia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente del valle' FROM reference_entities WHERE canonical_name = 'Independiente del Valle' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'barcelona sc' FROM reference_entities WHERE canonical_name = 'Barcelona SC' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'barcelona sporting club' FROM reference_entities WHERE canonical_name = 'Barcelona SC' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'emelec' FROM reference_entities WHERE canonical_name = 'Emelec' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad catolica ecuador' FROM reference_entities WHERE canonical_name = 'Universidad Catolica Ecuador' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'aucas' FROM reference_entities WHERE canonical_name = 'Aucas' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'delfin' FROM reference_entities WHERE canonical_name = 'Delfin SC' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'delfin sc' FROM reference_entities WHERE canonical_name = 'Delfin SC' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo cuenca' FROM reference_entities WHERE canonical_name = 'Deportivo Cuenca' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ldu' FROM reference_entities WHERE canonical_name = 'LDU Quito' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ldu quito' FROM reference_entities WHERE canonical_name = 'LDU Quito' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'liga de quito' FROM reference_entities WHERE canonical_name = 'LDU Quito' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'macara' FROM reference_entities WHERE canonical_name = 'Macara' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mushuc runa' FROM reference_entities WHERE canonical_name = 'Mushuc Runa' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guayaquil city' FROM reference_entities WHERE canonical_name = 'Guayaquil City' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cumbaya' FROM reference_entities WHERE canonical_name = 'Cumbaya' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'tecnico universitario' FROM reference_entities WHERE canonical_name = 'Tecnico Universitario' AND category = 'Ecuador';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alianza lima' FROM reference_entities WHERE canonical_name = 'Alianza Lima' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alianza atletico' FROM reference_entities WHERE canonical_name = 'Alianza Atletico' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sporting cristal' FROM reference_entities WHERE canonical_name = 'Sporting Cristal' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universitario' FROM reference_entities WHERE canonical_name = 'Universitario' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cusco fc' FROM reference_entities WHERE canonical_name = 'Cusco FC' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cienciano' FROM reference_entities WHERE canonical_name = 'Cienciano' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sport boys' FROM reference_entities WHERE canonical_name = 'Sport Boys' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sport huancayo' FROM reference_entities WHERE canonical_name = 'Sport Huancayo' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo municipal' FROM reference_entities WHERE canonical_name = 'Deportivo Municipal' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fbc melgar' FROM reference_entities WHERE canonical_name = 'Melgar' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'melgar' FROM reference_entities WHERE canonical_name = 'Melgar' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'comerciantes unidos' FROM reference_entities WHERE canonical_name = 'Comerciantes Unidos' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cajamarca' FROM reference_entities WHERE canonical_name = 'Cajamarca' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fc cajamarca' FROM reference_entities WHERE canonical_name = 'Cajamarca' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo moquegua' FROM reference_entities WHERE canonical_name = 'Deportivo Moquegua' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo garcilaso' FROM reference_entities WHERE canonical_name = 'Deportivo Garcilaso' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ad tarma' FROM reference_entities WHERE canonical_name = 'AD Tarma' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'los chankas' FROM reference_entities WHERE canonical_name = 'Los Chankas' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'juan pablo ii' FROM reference_entities WHERE canonical_name = 'Juan Pablo II' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'atletico grau' FROM reference_entities WHERE canonical_name = 'Atletico Grau' AND category = 'Peru';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'abb' FROM reference_entities WHERE canonical_name = 'ABB' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'always ready' FROM reference_entities WHERE canonical_name = 'Always Ready' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'aurora' FROM reference_entities WHERE canonical_name = 'Aurora' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'blooming' FROM reference_entities WHERE canonical_name = 'Blooming' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bolivar' FROM reference_entities WHERE canonical_name = 'Bolivar' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guabira' FROM reference_entities WHERE canonical_name = 'Guabira' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gv san jose' FROM reference_entities WHERE canonical_name = 'GV San Jose' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'independiente petrolero' FROM reference_entities WHERE canonical_name = 'Independiente Petrolero' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nacional potosi' FROM reference_entities WHERE canonical_name = 'Nacional Potosi' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'oriente petrolero' FROM reference_entities WHERE canonical_name = 'Oriente Petrolero' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'real oruro' FROM reference_entities WHERE canonical_name = 'Real Oruro' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'real potosi' FROM reference_entities WHERE canonical_name = 'Real Potosi' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'real tomayapo' FROM reference_entities WHERE canonical_name = 'Real Tomayapo' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'san antonio bulo bulo' FROM reference_entities WHERE canonical_name = 'San Antonio Bulo Bulo' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'the strongest' FROM reference_entities WHERE canonical_name = 'The Strongest' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad de vinto' FROM reference_entities WHERE canonical_name = 'Universidad de Vinto' AND category = 'Bolivia';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo la guaira' FROM reference_entities WHERE canonical_name = 'Deportivo La Guaira' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'metropolitanos' FROM reference_entities WHERE canonical_name = 'Metropolitanos FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'metropolitanos fc' FROM reference_entities WHERE canonical_name = 'Metropolitanos FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'deportivo tachira' FROM reference_entities WHERE canonical_name = 'Deportivo Tachira' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ucv' FROM reference_entities WHERE canonical_name = 'Universidad Central de Venezuela' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'universidad central de venezuela' FROM reference_entities WHERE canonical_name = 'Universidad Central de Venezuela' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'portuguesa' FROM reference_entities WHERE canonical_name = 'Portuguesa FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'portuguesa fc' FROM reference_entities WHERE canonical_name = 'Portuguesa FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'estudiantes de merida' FROM reference_entities WHERE canonical_name = 'Estudiantes de Merida' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'carabobo' FROM reference_entities WHERE canonical_name = 'Carabobo FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'carabobo fc' FROM reference_entities WHERE canonical_name = 'Carabobo FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'academia puerto cabello' FROM reference_entities WHERE canonical_name = 'Academia Puerto Cabello' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zamora' FROM reference_entities WHERE canonical_name = 'Zamora FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zamora fc' FROM reference_entities WHERE canonical_name = 'Zamora FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'caracas' FROM reference_entities WHERE canonical_name = 'Caracas FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'caracas fc' FROM reference_entities WHERE canonical_name = 'Caracas FC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rayo zuliano' FROM reference_entities WHERE canonical_name = 'Rayo Zuliano' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'monagas' FROM reference_entities WHERE canonical_name = 'Monagas SC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'monagas sc' FROM reference_entities WHERE canonical_name = 'Monagas SC' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'academia anzoategui' FROM reference_entities WHERE canonical_name = 'Academia Anzoategui' AND category = 'Venezuela';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'trujillanos' FROM reference_entities WHERE canonical_name = 'Trujillanos' AND category = 'Venezuela';

-- Categories default to entity_type = 'club' (schema.sql); fix up the ones
-- whose answers are actually players or countries so suggestNames() scopes
-- typeahead correctly (see agents.md's Generic rule / type-scoped typeahead).
UPDATE categories SET entity_type = 'player' WHERE slug IN (
	'ballon-dor-most-wins',
	'wc-alltime-goalscorers',
	'pl-2025-26-top-scorers',
	'cl-2025-26-top-scorers',
	'wc-2026-top-scorers',
	'pl-alltime-top-scorers',
	'cl-alltime-top-scorers'
);
UPDATE categories SET entity_type = 'country' WHERE slug IN (
	'euro-titles-by-country',
	'afcon-titles-by-country'
);

-- Reference countries: typeahead-only pool of national teams for
-- 'country' categories (Euro/AFCON winners), scoped to UEFA + CAF membership
-- (the confederations those categories actually cover). Same rules as the
-- reference club pool: typeahead-only, best-effort, doesn't affect scoring.
INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Albania', 'UEFA', 'country'),
	('Andorra', 'UEFA', 'country'),
	('Armenia', 'UEFA', 'country'),
	('Austria', 'UEFA', 'country'),
	('Azerbaijan', 'UEFA', 'country'),
	('Belarus', 'UEFA', 'country'),
	('Belgium', 'UEFA', 'country'),
	('Bosnia and Herzegovina', 'UEFA', 'country'),
	('Bulgaria', 'UEFA', 'country'),
	('Croatia', 'UEFA', 'country'),
	('Cyprus', 'UEFA', 'country'),
	('Czechia', 'UEFA', 'country'),
	('Denmark', 'UEFA', 'country'),
	('England', 'UEFA', 'country'),
	('Estonia', 'UEFA', 'country'),
	('Faroe Islands', 'UEFA', 'country'),
	('Finland', 'UEFA', 'country'),
	('France', 'UEFA', 'country'),
	('Georgia', 'UEFA', 'country'),
	('Germany', 'UEFA', 'country'),
	('Gibraltar', 'UEFA', 'country'),
	('Greece', 'UEFA', 'country'),
	('Hungary', 'UEFA', 'country'),
	('Iceland', 'UEFA', 'country'),
	('Israel', 'UEFA', 'country'),
	('Italy', 'UEFA', 'country'),
	('Kazakhstan', 'UEFA', 'country'),
	('Kosovo', 'UEFA', 'country'),
	('Latvia', 'UEFA', 'country'),
	('Liechtenstein', 'UEFA', 'country'),
	('Lithuania', 'UEFA', 'country'),
	('Luxembourg', 'UEFA', 'country'),
	('Malta', 'UEFA', 'country'),
	('Moldova', 'UEFA', 'country'),
	('Monaco', 'UEFA', 'country'),
	('Montenegro', 'UEFA', 'country'),
	('Netherlands', 'UEFA', 'country'),
	('North Macedonia', 'UEFA', 'country'),
	('Northern Ireland', 'UEFA', 'country'),
	('Norway', 'UEFA', 'country'),
	('Poland', 'UEFA', 'country'),
	('Portugal', 'UEFA', 'country'),
	('Republic of Ireland', 'UEFA', 'country'),
	('Romania', 'UEFA', 'country'),
	('Russia', 'UEFA', 'country'),
	('San Marino', 'UEFA', 'country'),
	('Scotland', 'UEFA', 'country'),
	('Serbia', 'UEFA', 'country'),
	('Slovakia', 'UEFA', 'country'),
	('Slovenia', 'UEFA', 'country'),
	('Spain', 'UEFA', 'country'),
	('Sweden', 'UEFA', 'country'),
	('Switzerland', 'UEFA', 'country'),
	('Turkey', 'UEFA', 'country'),
	('Ukraine', 'UEFA', 'country'),
	('Wales', 'UEFA', 'country'),
	('Algeria', 'CAF', 'country'),
	('Angola', 'CAF', 'country'),
	('Benin', 'CAF', 'country'),
	('Botswana', 'CAF', 'country'),
	('Burkina Faso', 'CAF', 'country'),
	('Burundi', 'CAF', 'country'),
	('Cameroon', 'CAF', 'country'),
	('Cape Verde', 'CAF', 'country'),
	('Central African Republic', 'CAF', 'country'),
	('Chad', 'CAF', 'country'),
	('Comoros', 'CAF', 'country'),
	('Congo', 'CAF', 'country'),
	('DR Congo', 'CAF', 'country'),
	('Djibouti', 'CAF', 'country'),
	('Egypt', 'CAF', 'country'),
	('Equatorial Guinea', 'CAF', 'country'),
	('Eritrea', 'CAF', 'country'),
	('Eswatini', 'CAF', 'country'),
	('Ethiopia', 'CAF', 'country'),
	('Gabon', 'CAF', 'country'),
	('Gambia', 'CAF', 'country'),
	('Ghana', 'CAF', 'country'),
	('Guinea', 'CAF', 'country'),
	('Guinea-Bissau', 'CAF', 'country'),
	('Ivory Coast', 'CAF', 'country'),
	('Kenya', 'CAF', 'country'),
	('Lesotho', 'CAF', 'country'),
	('Liberia', 'CAF', 'country'),
	('Libya', 'CAF', 'country'),
	('Madagascar', 'CAF', 'country'),
	('Malawi', 'CAF', 'country'),
	('Mali', 'CAF', 'country'),
	('Mauritania', 'CAF', 'country'),
	('Mauritius', 'CAF', 'country'),
	('Morocco', 'CAF', 'country'),
	('Mozambique', 'CAF', 'country'),
	('Namibia', 'CAF', 'country'),
	('Niger', 'CAF', 'country'),
	('Nigeria', 'CAF', 'country'),
	('Rwanda', 'CAF', 'country'),
	('Sao Tome and Principe', 'CAF', 'country'),
	('Senegal', 'CAF', 'country'),
	('Seychelles', 'CAF', 'country'),
	('Sierra Leone', 'CAF', 'country'),
	('Somalia', 'CAF', 'country'),
	('South Africa', 'CAF', 'country'),
	('South Sudan', 'CAF', 'country'),
	('Sudan', 'CAF', 'country'),
	('Tanzania', 'CAF', 'country'),
	('Togo', 'CAF', 'country'),
	('Tunisia', 'CAF', 'country'),
	('Uganda', 'CAF', 'country'),
	('Zambia', 'CAF', 'country'),
	('Zimbabwe', 'CAF', 'country');

INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'albania' FROM reference_entities WHERE canonical_name = 'Albania' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'andorra' FROM reference_entities WHERE canonical_name = 'Andorra' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'armenia' FROM reference_entities WHERE canonical_name = 'Armenia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'austria' FROM reference_entities WHERE canonical_name = 'Austria' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'azerbaijan' FROM reference_entities WHERE canonical_name = 'Azerbaijan' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'belarus' FROM reference_entities WHERE canonical_name = 'Belarus' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'belgium' FROM reference_entities WHERE canonical_name = 'Belgium' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bosnia and herzegovina' FROM reference_entities WHERE canonical_name = 'Bosnia and Herzegovina' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bulgaria' FROM reference_entities WHERE canonical_name = 'Bulgaria' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'croatia' FROM reference_entities WHERE canonical_name = 'Croatia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cyprus' FROM reference_entities WHERE canonical_name = 'Cyprus' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'czech republic' FROM reference_entities WHERE canonical_name = 'Czechia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'czechia' FROM reference_entities WHERE canonical_name = 'Czechia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'denmark' FROM reference_entities WHERE canonical_name = 'Denmark' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'england' FROM reference_entities WHERE canonical_name = 'England' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'estonia' FROM reference_entities WHERE canonical_name = 'Estonia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'faroe islands' FROM reference_entities WHERE canonical_name = 'Faroe Islands' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'finland' FROM reference_entities WHERE canonical_name = 'Finland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'france' FROM reference_entities WHERE canonical_name = 'France' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'georgia' FROM reference_entities WHERE canonical_name = 'Georgia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'germany' FROM reference_entities WHERE canonical_name = 'Germany' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gibraltar' FROM reference_entities WHERE canonical_name = 'Gibraltar' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'greece' FROM reference_entities WHERE canonical_name = 'Greece' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'hungary' FROM reference_entities WHERE canonical_name = 'Hungary' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'iceland' FROM reference_entities WHERE canonical_name = 'Iceland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'israel' FROM reference_entities WHERE canonical_name = 'Israel' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'italy' FROM reference_entities WHERE canonical_name = 'Italy' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kazakhstan' FROM reference_entities WHERE canonical_name = 'Kazakhstan' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kosovo' FROM reference_entities WHERE canonical_name = 'Kosovo' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'latvia' FROM reference_entities WHERE canonical_name = 'Latvia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'liechtenstein' FROM reference_entities WHERE canonical_name = 'Liechtenstein' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lithuania' FROM reference_entities WHERE canonical_name = 'Lithuania' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'luxembourg' FROM reference_entities WHERE canonical_name = 'Luxembourg' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'malta' FROM reference_entities WHERE canonical_name = 'Malta' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'moldova' FROM reference_entities WHERE canonical_name = 'Moldova' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'monaco' FROM reference_entities WHERE canonical_name = 'Monaco' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'montenegro' FROM reference_entities WHERE canonical_name = 'Montenegro' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'netherlands' FROM reference_entities WHERE canonical_name = 'Netherlands' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'north macedonia' FROM reference_entities WHERE canonical_name = 'North Macedonia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'northern ireland' FROM reference_entities WHERE canonical_name = 'Northern Ireland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'norway' FROM reference_entities WHERE canonical_name = 'Norway' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'poland' FROM reference_entities WHERE canonical_name = 'Poland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'portugal' FROM reference_entities WHERE canonical_name = 'Portugal' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ireland' FROM reference_entities WHERE canonical_name = 'Republic of Ireland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'republic of ireland' FROM reference_entities WHERE canonical_name = 'Republic of Ireland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'romania' FROM reference_entities WHERE canonical_name = 'Romania' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'russia' FROM reference_entities WHERE canonical_name = 'Russia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'san marino' FROM reference_entities WHERE canonical_name = 'San Marino' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'scotland' FROM reference_entities WHERE canonical_name = 'Scotland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'serbia' FROM reference_entities WHERE canonical_name = 'Serbia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'slovakia' FROM reference_entities WHERE canonical_name = 'Slovakia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'slovenia' FROM reference_entities WHERE canonical_name = 'Slovenia' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'spain' FROM reference_entities WHERE canonical_name = 'Spain' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sweden' FROM reference_entities WHERE canonical_name = 'Sweden' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'switzerland' FROM reference_entities WHERE canonical_name = 'Switzerland' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'turkey' FROM reference_entities WHERE canonical_name = 'Turkey' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ukraine' FROM reference_entities WHERE canonical_name = 'Ukraine' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'wales' FROM reference_entities WHERE canonical_name = 'Wales' AND category = 'UEFA' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'algeria' FROM reference_entities WHERE canonical_name = 'Algeria' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'angola' FROM reference_entities WHERE canonical_name = 'Angola' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'benin' FROM reference_entities WHERE canonical_name = 'Benin' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'botswana' FROM reference_entities WHERE canonical_name = 'Botswana' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'burkina faso' FROM reference_entities WHERE canonical_name = 'Burkina Faso' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'burundi' FROM reference_entities WHERE canonical_name = 'Burundi' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cameroon' FROM reference_entities WHERE canonical_name = 'Cameroon' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cape verde' FROM reference_entities WHERE canonical_name = 'Cape Verde' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'central african republic' FROM reference_entities WHERE canonical_name = 'Central African Republic' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'chad' FROM reference_entities WHERE canonical_name = 'Chad' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'comoros' FROM reference_entities WHERE canonical_name = 'Comoros' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'congo' FROM reference_entities WHERE canonical_name = 'Congo' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'congo dr' FROM reference_entities WHERE canonical_name = 'DR Congo' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'democratic republic of congo' FROM reference_entities WHERE canonical_name = 'DR Congo' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'dr congo' FROM reference_entities WHERE canonical_name = 'DR Congo' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'djibouti' FROM reference_entities WHERE canonical_name = 'Djibouti' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'egypt' FROM reference_entities WHERE canonical_name = 'Egypt' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'equatorial guinea' FROM reference_entities WHERE canonical_name = 'Equatorial Guinea' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'eritrea' FROM reference_entities WHERE canonical_name = 'Eritrea' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'eswatini' FROM reference_entities WHERE canonical_name = 'Eswatini' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ethiopia' FROM reference_entities WHERE canonical_name = 'Ethiopia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gabon' FROM reference_entities WHERE canonical_name = 'Gabon' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gambia' FROM reference_entities WHERE canonical_name = 'Gambia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ghana' FROM reference_entities WHERE canonical_name = 'Ghana' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guinea' FROM reference_entities WHERE canonical_name = 'Guinea' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'guineabissau' FROM reference_entities WHERE canonical_name = 'Guinea-Bissau' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cote divoire' FROM reference_entities WHERE canonical_name = 'Ivory Coast' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ivory coast' FROM reference_entities WHERE canonical_name = 'Ivory Coast' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kenya' FROM reference_entities WHERE canonical_name = 'Kenya' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lesotho' FROM reference_entities WHERE canonical_name = 'Lesotho' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'liberia' FROM reference_entities WHERE canonical_name = 'Liberia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'libya' FROM reference_entities WHERE canonical_name = 'Libya' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'madagascar' FROM reference_entities WHERE canonical_name = 'Madagascar' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'malawi' FROM reference_entities WHERE canonical_name = 'Malawi' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mali' FROM reference_entities WHERE canonical_name = 'Mali' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mauritania' FROM reference_entities WHERE canonical_name = 'Mauritania' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mauritius' FROM reference_entities WHERE canonical_name = 'Mauritius' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'morocco' FROM reference_entities WHERE canonical_name = 'Morocco' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mozambique' FROM reference_entities WHERE canonical_name = 'Mozambique' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'namibia' FROM reference_entities WHERE canonical_name = 'Namibia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'niger' FROM reference_entities WHERE canonical_name = 'Niger' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nigeria' FROM reference_entities WHERE canonical_name = 'Nigeria' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rwanda' FROM reference_entities WHERE canonical_name = 'Rwanda' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sao tome and principe' FROM reference_entities WHERE canonical_name = 'Sao Tome and Principe' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'senegal' FROM reference_entities WHERE canonical_name = 'Senegal' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'seychelles' FROM reference_entities WHERE canonical_name = 'Seychelles' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sierra leone' FROM reference_entities WHERE canonical_name = 'Sierra Leone' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'somalia' FROM reference_entities WHERE canonical_name = 'Somalia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'south africa' FROM reference_entities WHERE canonical_name = 'South Africa' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'south sudan' FROM reference_entities WHERE canonical_name = 'South Sudan' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sudan' FROM reference_entities WHERE canonical_name = 'Sudan' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'tanzania' FROM reference_entities WHERE canonical_name = 'Tanzania' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'togo' FROM reference_entities WHERE canonical_name = 'Togo' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'tunisia' FROM reference_entities WHERE canonical_name = 'Tunisia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'uganda' FROM reference_entities WHERE canonical_name = 'Uganda' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zambia' FROM reference_entities WHERE canonical_name = 'Zambia' AND category = 'CAF' AND entity_type = 'country';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zimbabwe' FROM reference_entities WHERE canonical_name = 'Zimbabwe' AND category = 'CAF' AND entity_type = 'country';

-- Reference players: typeahead-only pool for 'player' categories (top
-- scorers, Ballon d'Or). Best-effort and NOT exhaustive -- broadly
-- recognizable footballers across eras/nationalities, not a verified
-- complete roster of anything. Extend as needed; see agents.md.
INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Lionel Messi', 'Argentina', 'player'),
	('Cristiano Ronaldo', 'Portugal', 'player'),
	('Ronaldo Nazario', 'Brazil', 'player'),
	('Ronaldinho', 'Brazil', 'player'),
	('Zinedine Zidane', 'France', 'player'),
	('Neymar', 'Brazil', 'player'),
	('Kylian Mbappe', 'France', 'player'),
	('Erling Haaland', 'Norway', 'player'),
	('Robert Lewandowski', 'Poland', 'player'),
	('Karim Benzema', 'France', 'player'),
	('Luka Modric', 'Croatia', 'player'),
	('Kevin De Bruyne', 'Belgium', 'player'),
	('Mohamed Salah', 'Egypt', 'player'),
	('Sadio Mane', 'Senegal', 'player'),
	('Harry Kane', 'England', 'player'),
	('Thierry Henry', 'France', 'player'),
	('Didier Drogba', 'Ivory Coast', 'player'),
	('Samuel Eto''o', 'Cameroon', 'player'),
	('George Weah', 'Liberia', 'player'),
	('Roberto Baggio', 'Italy', 'player'),
	('Michael Owen', 'England', 'player'),
	('Alan Shearer', 'England', 'player'),
	('Wayne Rooney', 'England', 'player'),
	('Andriy Shevchenko', 'Ukraine', 'player'),
	('Pavel Nedved', 'Czechia', 'player'),
	('Fabio Cannavaro', 'Italy', 'player'),
	('Kaka', 'Brazil', 'player'),
	('Rivaldo', 'Brazil', 'player'),
	('Romario', 'Brazil', 'player'),
	('Pele', 'Brazil', 'player'),
	('Diego Maradona', 'Argentina', 'player'),
	('Johan Cruyff', 'Netherlands', 'player'),
	('Franz Beckenbauer', 'Germany', 'player'),
	('Gerd Muller', 'Germany', 'player'),
	('Eusebio', 'Portugal', 'player'),
	('Bobby Charlton', 'England', 'player'),
	('Garrincha', 'Brazil', 'player'),
	('George Best', 'Northern Ireland', 'player'),
	('Marco van Basten', 'Netherlands', 'player'),
	('Ruud Gullit', 'Netherlands', 'player'),
	('Frank Rijkaard', 'Netherlands', 'player'),
	('Dennis Bergkamp', 'Netherlands', 'player'),
	('Ruud van Nistelrooy', 'Netherlands', 'player'),
	('Ryan Giggs', 'Wales', 'player'),
	('Paul Scholes', 'England', 'player'),
	('David Beckham', 'England', 'player'),
	('Steven Gerrard', 'England', 'player'),
	('Frank Lampard', 'England', 'player'),
	('John Terry', 'England', 'player'),
	('Rio Ferdinand', 'England', 'player'),
	('Xavi Hernandez', 'Spain', 'player'),
	('Andres Iniesta', 'Spain', 'player'),
	('Sergio Ramos', 'Spain', 'player'),
	('Gerard Pique', 'Spain', 'player'),
	('Carles Puyol', 'Spain', 'player'),
	('Iker Casillas', 'Spain', 'player'),
	('Gianluigi Buffon', 'Italy', 'player'),
	('Paolo Maldini', 'Italy', 'player'),
	('Alessandro Del Piero', 'Italy', 'player'),
	('Francesco Totti', 'Italy', 'player'),
	('Andrea Pirlo', 'Italy', 'player'),
	('Gianfranco Zola', 'Italy', 'player'),
	('Roberto Carlos', 'Brazil', 'player'),
	('Cafu', 'Brazil', 'player'),
	('Luis Suarez', 'Uruguay', 'player'),
	('Edinson Cavani', 'Uruguay', 'player'),
	('Radamel Falcao', 'Colombia', 'player'),
	('James Rodriguez', 'Colombia', 'player'),
	('Diego Forlan', 'Uruguay', 'player'),
	('Zlatan Ibrahimovic', 'Sweden', 'player'),
	('Thomas Muller', 'Germany', 'player'),
	('Manuel Neuer', 'Germany', 'player'),
	('Toni Kroos', 'Germany', 'player'),
	('Sergio Aguero', 'Argentina', 'player'),
	('David Villa', 'Spain', 'player'),
	('Fernando Torres', 'Spain', 'player'),
	('Xabi Alonso', 'Spain', 'player'),
	('Wesley Sneijder', 'Netherlands', 'player'),
	('Arjen Robben', 'Netherlands', 'player'),
	('Marco Reus', 'Germany', 'player'),
	('Mario Gotze', 'Germany', 'player'),
	('Mesut Ozil', 'Germany', 'player'),
	('Ilkay Gundogan', 'Germany', 'player'),
	('N''Golo Kante', 'France', 'player'),
	('Antoine Griezmann', 'France', 'player'),
	('Ousmane Dembele', 'France', 'player'),
	('Riyad Mahrez', 'Algeria', 'player'),
	('Victor Osimhen', 'Nigeria', 'player'),
	('Achraf Hakimi', 'Morocco', 'player'),
	('Vinicius Junior', 'Brazil', 'player'),
	('Jude Bellingham', 'England', 'player'),
	('Pedri', 'Spain', 'player'),
	('Gavi', 'Spain', 'player'),
	('Bukayo Saka', 'England', 'player'),
	('Phil Foden', 'England', 'player'),
	('Declan Rice', 'England', 'player'),
	('Marcus Rashford', 'England', 'player'),
	('Son Heung-min', 'South Korea', 'player'),
	('Kaoru Mitoma', 'Japan', 'player'),
	('Takefusa Kubo', 'Japan', 'player'),
	('Lautaro Martinez', 'Argentina', 'player'),
	('Julian Alvarez', 'Argentina', 'player'),
	('Rodrygo', 'Brazil', 'player'),
	('Federico Valverde', 'Uruguay', 'player'),
	('Casemiro', 'Brazil', 'player'),
	('Fabinho', 'Brazil', 'player'),
	('Virgil van Dijk', 'Netherlands', 'player'),
	('Alisson Becker', 'Brazil', 'player'),
	('Ederson', 'Brazil', 'player'),
	('Thibaut Courtois', 'Belgium', 'player'),
	('Jan Oblak', 'Slovenia', 'player'),
	('David de Gea', 'Spain', 'player'),
	('Petr Cech', 'Czechia', 'player'),
	('Edwin van der Sar', 'Netherlands', 'player'),
	('Oliver Kahn', 'Germany', 'player'),
	('Peter Schmeichel', 'Denmark', 'player'),
	('Gordon Banks', 'England', 'player'),
	('Lev Yashin', 'Soviet Union', 'player'),
	('Dino Zoff', 'Italy', 'player'),
	('Fabien Barthez', 'France', 'player'),
	('Michael Ballack', 'Germany', 'player'),
	('Lothar Matthaus', 'Germany', 'player'),
	('Jurgen Klinsmann', 'Germany', 'player'),
	('Rudi Voller', 'Germany', 'player'),
	('Karl-Heinz Rummenigge', 'Germany', 'player'),
	('Uwe Seeler', 'Germany', 'player'),
	('Bobby Moore', 'England', 'player'),
	('Geoff Hurst', 'England', 'player'),
	('Kenny Dalglish', 'Scotland', 'player'),
	('Ian Rush', 'Wales', 'player'),
	('Peter Crouch', 'England', 'player'),
	('Jamie Vardy', 'England', 'player'),
	('Sergio Busquets', 'Spain', 'player'),
	('Marc-Andre ter Stegen', 'Germany', 'player'),
	('Robert Pires', 'France', 'player'),
	('Patrick Vieira', 'France', 'player'),
	('Claude Makelele', 'France', 'player'),
	('Marcel Desailly', 'France', 'player'),
	('Lilian Thuram', 'France', 'player'),
	('Youri Djorkaeff', 'France', 'player'),
	('David Trezeguet', 'France', 'player'),
	('Nicolas Anelka', 'France', 'player'),
	('William Gallas', 'France', 'player'),
	('Bacary Sagna', 'France', 'player'),
	('Hugo Lloris', 'France', 'player'),
	('Raphael Varane', 'France', 'player'),
	('Paul Pogba', 'France', 'player'),
	('Olivier Giroud', 'France', 'player'),
	('Alexandre Lacazette', 'France', 'player'),
	('Wissam Ben Yedder', 'France', 'player'),
	('Moussa Dembele', 'France', 'player'),
	('Gabriel Jesus', 'Brazil', 'player'),
	('Roberto Firmino', 'Brazil', 'player'),
	('Diogo Jota', 'Portugal', 'player'),
	('Darwin Nunez', 'Uruguay', 'player'),
	('Cody Gakpo', 'Netherlands', 'player'),
	('Bruno Fernandes', 'Portugal', 'player'),
	('Rasmus Hojlund', 'Denmark', 'player');

INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lionel messi' FROM reference_entities WHERE canonical_name = 'Lionel Messi' AND category = 'Argentina' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cr7' FROM reference_entities WHERE canonical_name = 'Cristiano Ronaldo' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cristiano' FROM reference_entities WHERE canonical_name = 'Cristiano Ronaldo' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cristiano ronaldo' FROM reference_entities WHERE canonical_name = 'Cristiano Ronaldo' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'r9' FROM reference_entities WHERE canonical_name = 'Ronaldo Nazario' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ronaldo nazario' FROM reference_entities WHERE canonical_name = 'Ronaldo Nazario' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ronaldinho' FROM reference_entities WHERE canonical_name = 'Ronaldinho' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zinedine zidane' FROM reference_entities WHERE canonical_name = 'Zinedine Zidane' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'neymar' FROM reference_entities WHERE canonical_name = 'Neymar' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'neymar jr' FROM reference_entities WHERE canonical_name = 'Neymar' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kylian mbappe' FROM reference_entities WHERE canonical_name = 'Kylian Mbappe' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'erling haaland' FROM reference_entities WHERE canonical_name = 'Erling Haaland' AND category = 'Norway' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'robert lewandowski' FROM reference_entities WHERE canonical_name = 'Robert Lewandowski' AND category = 'Poland' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'karim benzema' FROM reference_entities WHERE canonical_name = 'Karim Benzema' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'luka modric' FROM reference_entities WHERE canonical_name = 'Luka Modric' AND category = 'Croatia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kevin de bruyne' FROM reference_entities WHERE canonical_name = 'Kevin De Bruyne' AND category = 'Belgium' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mohamed salah' FROM reference_entities WHERE canonical_name = 'Mohamed Salah' AND category = 'Egypt' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sadio mane' FROM reference_entities WHERE canonical_name = 'Sadio Mane' AND category = 'Senegal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'harry kane' FROM reference_entities WHERE canonical_name = 'Harry Kane' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'thierry henry' FROM reference_entities WHERE canonical_name = 'Thierry Henry' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'didier drogba' FROM reference_entities WHERE canonical_name = 'Didier Drogba' AND category = 'Ivory Coast' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'samuel etoo' FROM reference_entities WHERE canonical_name = 'Samuel Eto''o' AND category = 'Cameroon' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'george weah' FROM reference_entities WHERE canonical_name = 'George Weah' AND category = 'Liberia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'roberto baggio' FROM reference_entities WHERE canonical_name = 'Roberto Baggio' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'michael owen' FROM reference_entities WHERE canonical_name = 'Michael Owen' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alan shearer' FROM reference_entities WHERE canonical_name = 'Alan Shearer' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'wayne rooney' FROM reference_entities WHERE canonical_name = 'Wayne Rooney' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'andriy shevchenko' FROM reference_entities WHERE canonical_name = 'Andriy Shevchenko' AND category = 'Ukraine' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'pavel nedved' FROM reference_entities WHERE canonical_name = 'Pavel Nedved' AND category = 'Czechia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fabio cannavaro' FROM reference_entities WHERE canonical_name = 'Fabio Cannavaro' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kaka' FROM reference_entities WHERE canonical_name = 'Kaka' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rivaldo' FROM reference_entities WHERE canonical_name = 'Rivaldo' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'romario' FROM reference_entities WHERE canonical_name = 'Romario' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'pele' FROM reference_entities WHERE canonical_name = 'Pele' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'diego maradona' FROM reference_entities WHERE canonical_name = 'Diego Maradona' AND category = 'Argentina' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'johan cruyff' FROM reference_entities WHERE canonical_name = 'Johan Cruyff' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'franz beckenbauer' FROM reference_entities WHERE canonical_name = 'Franz Beckenbauer' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gerd muller' FROM reference_entities WHERE canonical_name = 'Gerd Muller' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'eusebio' FROM reference_entities WHERE canonical_name = 'Eusebio' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bobby charlton' FROM reference_entities WHERE canonical_name = 'Bobby Charlton' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'garrincha' FROM reference_entities WHERE canonical_name = 'Garrincha' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'george best' FROM reference_entities WHERE canonical_name = 'George Best' AND category = 'Northern Ireland' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'marco van basten' FROM reference_entities WHERE canonical_name = 'Marco van Basten' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ruud gullit' FROM reference_entities WHERE canonical_name = 'Ruud Gullit' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'frank rijkaard' FROM reference_entities WHERE canonical_name = 'Frank Rijkaard' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'dennis bergkamp' FROM reference_entities WHERE canonical_name = 'Dennis Bergkamp' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ruud van nistelrooy' FROM reference_entities WHERE canonical_name = 'Ruud van Nistelrooy' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ryan giggs' FROM reference_entities WHERE canonical_name = 'Ryan Giggs' AND category = 'Wales' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'paul scholes' FROM reference_entities WHERE canonical_name = 'Paul Scholes' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'david beckham' FROM reference_entities WHERE canonical_name = 'David Beckham' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'steven gerrard' FROM reference_entities WHERE canonical_name = 'Steven Gerrard' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'frank lampard' FROM reference_entities WHERE canonical_name = 'Frank Lampard' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'john terry' FROM reference_entities WHERE canonical_name = 'John Terry' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rio ferdinand' FROM reference_entities WHERE canonical_name = 'Rio Ferdinand' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'xavi' FROM reference_entities WHERE canonical_name = 'Xavi Hernandez' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'xavi hernandez' FROM reference_entities WHERE canonical_name = 'Xavi Hernandez' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'andres iniesta' FROM reference_entities WHERE canonical_name = 'Andres Iniesta' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sergio ramos' FROM reference_entities WHERE canonical_name = 'Sergio Ramos' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gerard pique' FROM reference_entities WHERE canonical_name = 'Gerard Pique' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'carles puyol' FROM reference_entities WHERE canonical_name = 'Carles Puyol' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'iker casillas' FROM reference_entities WHERE canonical_name = 'Iker Casillas' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gianluigi buffon' FROM reference_entities WHERE canonical_name = 'Gianluigi Buffon' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'paolo maldini' FROM reference_entities WHERE canonical_name = 'Paolo Maldini' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alessandro del piero' FROM reference_entities WHERE canonical_name = 'Alessandro Del Piero' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'francesco totti' FROM reference_entities WHERE canonical_name = 'Francesco Totti' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'andrea pirlo' FROM reference_entities WHERE canonical_name = 'Andrea Pirlo' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gianfranco zola' FROM reference_entities WHERE canonical_name = 'Gianfranco Zola' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'roberto carlos' FROM reference_entities WHERE canonical_name = 'Roberto Carlos' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cafu' FROM reference_entities WHERE canonical_name = 'Cafu' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'luis suarez' FROM reference_entities WHERE canonical_name = 'Luis Suarez' AND category = 'Uruguay' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'edinson cavani' FROM reference_entities WHERE canonical_name = 'Edinson Cavani' AND category = 'Uruguay' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'radamel falcao' FROM reference_entities WHERE canonical_name = 'Radamel Falcao' AND category = 'Colombia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'james rodriguez' FROM reference_entities WHERE canonical_name = 'James Rodriguez' AND category = 'Colombia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'diego forlan' FROM reference_entities WHERE canonical_name = 'Diego Forlan' AND category = 'Uruguay' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'zlatan ibrahimovic' FROM reference_entities WHERE canonical_name = 'Zlatan Ibrahimovic' AND category = 'Sweden' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'thomas muller' FROM reference_entities WHERE canonical_name = 'Thomas Muller' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'manuel neuer' FROM reference_entities WHERE canonical_name = 'Manuel Neuer' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'toni kroos' FROM reference_entities WHERE canonical_name = 'Toni Kroos' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sergio aguero' FROM reference_entities WHERE canonical_name = 'Sergio Aguero' AND category = 'Argentina' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'david villa' FROM reference_entities WHERE canonical_name = 'David Villa' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fernando torres' FROM reference_entities WHERE canonical_name = 'Fernando Torres' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'xabi alonso' FROM reference_entities WHERE canonical_name = 'Xabi Alonso' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'wesley sneijder' FROM reference_entities WHERE canonical_name = 'Wesley Sneijder' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'arjen robben' FROM reference_entities WHERE canonical_name = 'Arjen Robben' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'marco reus' FROM reference_entities WHERE canonical_name = 'Marco Reus' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mario gotze' FROM reference_entities WHERE canonical_name = 'Mario Gotze' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'mesut ozil' FROM reference_entities WHERE canonical_name = 'Mesut Ozil' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ilkay gundogan' FROM reference_entities WHERE canonical_name = 'Ilkay Gundogan' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ngolo kante' FROM reference_entities WHERE canonical_name = 'N''Golo Kante' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'antoine griezmann' FROM reference_entities WHERE canonical_name = 'Antoine Griezmann' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ousmane dembele' FROM reference_entities WHERE canonical_name = 'Ousmane Dembele' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'riyad mahrez' FROM reference_entities WHERE canonical_name = 'Riyad Mahrez' AND category = 'Algeria' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'victor osimhen' FROM reference_entities WHERE canonical_name = 'Victor Osimhen' AND category = 'Nigeria' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'achraf hakimi' FROM reference_entities WHERE canonical_name = 'Achraf Hakimi' AND category = 'Morocco' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'vinicius junior' FROM reference_entities WHERE canonical_name = 'Vinicius Junior' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'jude bellingham' FROM reference_entities WHERE canonical_name = 'Jude Bellingham' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'pedri' FROM reference_entities WHERE canonical_name = 'Pedri' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gavi' FROM reference_entities WHERE canonical_name = 'Gavi' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bukayo saka' FROM reference_entities WHERE canonical_name = 'Bukayo Saka' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'phil foden' FROM reference_entities WHERE canonical_name = 'Phil Foden' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'declan rice' FROM reference_entities WHERE canonical_name = 'Declan Rice' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'marcus rashford' FROM reference_entities WHERE canonical_name = 'Marcus Rashford' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'son heungmin' FROM reference_entities WHERE canonical_name = 'Son Heung-min' AND category = 'South Korea' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kaoru mitoma' FROM reference_entities WHERE canonical_name = 'Kaoru Mitoma' AND category = 'Japan' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'takefusa kubo' FROM reference_entities WHERE canonical_name = 'Takefusa Kubo' AND category = 'Japan' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lautaro martinez' FROM reference_entities WHERE canonical_name = 'Lautaro Martinez' AND category = 'Argentina' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'julian alvarez' FROM reference_entities WHERE canonical_name = 'Julian Alvarez' AND category = 'Argentina' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rodrygo' FROM reference_entities WHERE canonical_name = 'Rodrygo' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'federico valverde' FROM reference_entities WHERE canonical_name = 'Federico Valverde' AND category = 'Uruguay' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'casemiro' FROM reference_entities WHERE canonical_name = 'Casemiro' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fabinho' FROM reference_entities WHERE canonical_name = 'Fabinho' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'virgil van dijk' FROM reference_entities WHERE canonical_name = 'Virgil van Dijk' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alisson' FROM reference_entities WHERE canonical_name = 'Alisson Becker' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alisson becker' FROM reference_entities WHERE canonical_name = 'Alisson Becker' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ederson' FROM reference_entities WHERE canonical_name = 'Ederson' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'thibaut courtois' FROM reference_entities WHERE canonical_name = 'Thibaut Courtois' AND category = 'Belgium' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'jan oblak' FROM reference_entities WHERE canonical_name = 'Jan Oblak' AND category = 'Slovenia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'david de gea' FROM reference_entities WHERE canonical_name = 'David de Gea' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'petr cech' FROM reference_entities WHERE canonical_name = 'Petr Cech' AND category = 'Czechia' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'edwin van der sar' FROM reference_entities WHERE canonical_name = 'Edwin van der Sar' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'oliver kahn' FROM reference_entities WHERE canonical_name = 'Oliver Kahn' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'peter schmeichel' FROM reference_entities WHERE canonical_name = 'Peter Schmeichel' AND category = 'Denmark' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gordon banks' FROM reference_entities WHERE canonical_name = 'Gordon Banks' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lev yashin' FROM reference_entities WHERE canonical_name = 'Lev Yashin' AND category = 'Soviet Union' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'dino zoff' FROM reference_entities WHERE canonical_name = 'Dino Zoff' AND category = 'Italy' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'fabien barthez' FROM reference_entities WHERE canonical_name = 'Fabien Barthez' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'michael ballack' FROM reference_entities WHERE canonical_name = 'Michael Ballack' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lothar matthaus' FROM reference_entities WHERE canonical_name = 'Lothar Matthaus' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'jurgen klinsmann' FROM reference_entities WHERE canonical_name = 'Jurgen Klinsmann' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rudi voller' FROM reference_entities WHERE canonical_name = 'Rudi Voller' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'karlheinz rummenigge' FROM reference_entities WHERE canonical_name = 'Karl-Heinz Rummenigge' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'uwe seeler' FROM reference_entities WHERE canonical_name = 'Uwe Seeler' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bobby moore' FROM reference_entities WHERE canonical_name = 'Bobby Moore' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'geoff hurst' FROM reference_entities WHERE canonical_name = 'Geoff Hurst' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'kenny dalglish' FROM reference_entities WHERE canonical_name = 'Kenny Dalglish' AND category = 'Scotland' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'ian rush' FROM reference_entities WHERE canonical_name = 'Ian Rush' AND category = 'Wales' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'peter crouch' FROM reference_entities WHERE canonical_name = 'Peter Crouch' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'jamie vardy' FROM reference_entities WHERE canonical_name = 'Jamie Vardy' AND category = 'England' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'sergio busquets' FROM reference_entities WHERE canonical_name = 'Sergio Busquets' AND category = 'Spain' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'marcandre ter stegen' FROM reference_entities WHERE canonical_name = 'Marc-Andre ter Stegen' AND category = 'Germany' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'robert pires' FROM reference_entities WHERE canonical_name = 'Robert Pires' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'patrick vieira' FROM reference_entities WHERE canonical_name = 'Patrick Vieira' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'claude makelele' FROM reference_entities WHERE canonical_name = 'Claude Makelele' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'marcel desailly' FROM reference_entities WHERE canonical_name = 'Marcel Desailly' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'lilian thuram' FROM reference_entities WHERE canonical_name = 'Lilian Thuram' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'youri djorkaeff' FROM reference_entities WHERE canonical_name = 'Youri Djorkaeff' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'david trezeguet' FROM reference_entities WHERE canonical_name = 'David Trezeguet' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'nicolas anelka' FROM reference_entities WHERE canonical_name = 'Nicolas Anelka' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'william gallas' FROM reference_entities WHERE canonical_name = 'William Gallas' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bacary sagna' FROM reference_entities WHERE canonical_name = 'Bacary Sagna' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'hugo lloris' FROM reference_entities WHERE canonical_name = 'Hugo Lloris' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'raphael varane' FROM reference_entities WHERE canonical_name = 'Raphael Varane' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'paul pogba' FROM reference_entities WHERE canonical_name = 'Paul Pogba' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'olivier giroud' FROM reference_entities WHERE canonical_name = 'Olivier Giroud' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'alexandre lacazette' FROM reference_entities WHERE canonical_name = 'Alexandre Lacazette' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'wissam ben yedder' FROM reference_entities WHERE canonical_name = 'Wissam Ben Yedder' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'moussa dembele' FROM reference_entities WHERE canonical_name = 'Moussa Dembele' AND category = 'France' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'gabriel jesus' FROM reference_entities WHERE canonical_name = 'Gabriel Jesus' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'roberto firmino' FROM reference_entities WHERE canonical_name = 'Roberto Firmino' AND category = 'Brazil' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'diogo jota' FROM reference_entities WHERE canonical_name = 'Diogo Jota' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'darwin nunez' FROM reference_entities WHERE canonical_name = 'Darwin Nunez' AND category = 'Uruguay' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'cody gakpo' FROM reference_entities WHERE canonical_name = 'Cody Gakpo' AND category = 'Netherlands' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'bruno fernandes' FROM reference_entities WHERE canonical_name = 'Bruno Fernandes' AND category = 'Portugal' AND entity_type = 'player';
INSERT INTO reference_entity_aliases (entity_id, alias)
	SELECT id, 'rasmus hojlund' FROM reference_entities WHERE canonical_name = 'Rasmus Hojlund' AND category = 'Denmark' AND entity_type = 'player';

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

-- Reference-pool expansion: European/world clubs + a much wider player
-- pool, all typeahead-only (see agents.md). Big-5 league memberships are
-- the 2025-26 seasons, cross-checked against promotion/relegation; player
-- selection draws on the Ballon d'Or 2025 shortlist, the all-time CAF
-- Player of the Year winners, recent South American FOTY winners, official
-- 2025-26 squad lists of major clubs, and well-known historical players.
-- Also adds surname aliases (e.g. 'kane', 'van dijk') for every player,
-- including the pre-existing 158, since matching is prefix-only.

INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Arsenal', 'England', 'club'),
	('Aston Villa', 'England', 'club'),
	('AFC Bournemouth', 'England', 'club'),
	('Brentford', 'England', 'club'),
	('Brighton & Hove Albion', 'England', 'club'),
	('Burnley', 'England', 'club'),
	('Chelsea', 'England', 'club'),
	('Crystal Palace', 'England', 'club'),
	('Everton', 'England', 'club'),
	('Fulham', 'England', 'club'),
	('Leeds United', 'England', 'club'),
	('Liverpool', 'England', 'club'),
	('Manchester City', 'England', 'club'),
	('Manchester United', 'England', 'club'),
	('Newcastle United', 'England', 'club'),
	('Nottingham Forest', 'England', 'club'),
	('Sunderland', 'England', 'club'),
	('Tottenham Hotspur', 'England', 'club'),
	('West Ham United', 'England', 'club'),
	('Wolverhampton Wanderers', 'England', 'club'),
	('Alaves', 'Spain', 'club'),
	('Athletic Club', 'Spain', 'club'),
	('Atletico Madrid', 'Spain', 'club'),
	('Barcelona', 'Spain', 'club'),
	('Celta Vigo', 'Spain', 'club'),
	('Elche', 'Spain', 'club'),
	('Espanyol', 'Spain', 'club'),
	('Getafe', 'Spain', 'club'),
	('Girona', 'Spain', 'club'),
	('Levante', 'Spain', 'club'),
	('Mallorca', 'Spain', 'club'),
	('Osasuna', 'Spain', 'club'),
	('Rayo Vallecano', 'Spain', 'club'),
	('Real Betis', 'Spain', 'club'),
	('Real Madrid', 'Spain', 'club'),
	('Real Oviedo', 'Spain', 'club'),
	('Real Sociedad', 'Spain', 'club'),
	('Sevilla', 'Spain', 'club'),
	('Valencia', 'Spain', 'club'),
	('Villarreal', 'Spain', 'club'),
	('Atalanta', 'Italy', 'club'),
	('Bologna', 'Italy', 'club'),
	('Cagliari', 'Italy', 'club'),
	('Como', 'Italy', 'club'),
	('Cremonese', 'Italy', 'club'),
	('Fiorentina', 'Italy', 'club'),
	('Genoa', 'Italy', 'club'),
	('Hellas Verona', 'Italy', 'club'),
	('Inter Milan', 'Italy', 'club'),
	('Juventus', 'Italy', 'club'),
	('Lazio', 'Italy', 'club'),
	('Lecce', 'Italy', 'club'),
	('AC Milan', 'Italy', 'club'),
	('Napoli', 'Italy', 'club'),
	('Parma', 'Italy', 'club'),
	('Pisa', 'Italy', 'club'),
	('Roma', 'Italy', 'club'),
	('Sassuolo', 'Italy', 'club'),
	('Torino', 'Italy', 'club'),
	('Udinese', 'Italy', 'club'),
	('Bayern Munich', 'Germany', 'club'),
	('Borussia Dortmund', 'Germany', 'club'),
	('RB Leipzig', 'Germany', 'club'),
	('Bayer Leverkusen', 'Germany', 'club'),
	('VfB Stuttgart', 'Germany', 'club'),
	('Eintracht Frankfurt', 'Germany', 'club'),
	('SC Freiburg', 'Germany', 'club'),
	('TSG Hoffenheim', 'Germany', 'club'),
	('FC Augsburg', 'Germany', 'club'),
	('Mainz 05', 'Germany', 'club'),
	('Union Berlin', 'Germany', 'club'),
	('Borussia Monchengladbach', 'Germany', 'club'),
	('Werder Bremen', 'Germany', 'club'),
	('VfL Wolfsburg', 'Germany', 'club'),
	('FC St. Pauli', 'Germany', 'club'),
	('Heidenheim', 'Germany', 'club'),
	('FC Koln', 'Germany', 'club'),
	('Hamburger SV', 'Germany', 'club'),
	('Paris Saint-Germain', 'France', 'club'),
	('Marseille', 'France', 'club'),
	('Lyon', 'France', 'club'),
	('AS Monaco', 'France', 'club'),
	('Lille', 'France', 'club'),
	('Nice', 'France', 'club'),
	('Lens', 'France', 'club'),
	('Rennes', 'France', 'club'),
	('Strasbourg', 'France', 'club'),
	('Toulouse', 'France', 'club'),
	('Nantes', 'France', 'club'),
	('Brest', 'France', 'club'),
	('Auxerre', 'France', 'club'),
	('Angers', 'France', 'club'),
	('Le Havre', 'France', 'club'),
	('Metz', 'France', 'club'),
	('Lorient', 'France', 'club'),
	('Paris FC', 'France', 'club'),
	('Porto', 'Portugal', 'club'),
	('Benfica', 'Portugal', 'club'),
	('Sporting CP', 'Portugal', 'club'),
	('Braga', 'Portugal', 'club'),
	('Ajax', 'Netherlands', 'club'),
	('PSV Eindhoven', 'Netherlands', 'club'),
	('Feyenoord', 'Netherlands', 'club'),
	('AZ Alkmaar', 'Netherlands', 'club'),
	('Celtic', 'Scotland', 'club'),
	('Rangers', 'Scotland', 'club'),
	('Galatasaray', 'Turkey', 'club'),
	('Fenerbahce', 'Turkey', 'club'),
	('Besiktas', 'Turkey', 'club'),
	('Club Brugge', 'Belgium', 'club'),
	('Anderlecht', 'Belgium', 'club'),
	('Red Bull Salzburg', 'Austria', 'club'),
	('Shakhtar Donetsk', 'Ukraine', 'club'),
	('Dynamo Kyiv', 'Ukraine', 'club'),
	('Olympiacos', 'Greece', 'club'),
	('Panathinaikos', 'Greece', 'club'),
	('Red Star Belgrade', 'Serbia', 'club'),
	('Dinamo Zagreb', 'Croatia', 'club'),
	('FC Copenhagen', 'Denmark', 'club'),
	('Sparta Prague', 'Czechia', 'club'),
	('Slavia Prague', 'Czechia', 'club'),
	('Young Boys', 'Switzerland', 'club'),
	('Leicester City', 'England', 'club'),
	('Southampton', 'England', 'club'),
	('Ipswich Town', 'England', 'club'),
	('Sheffield United', 'England', 'club'),
	('Sheffield Wednesday', 'England', 'club'),
	('Norwich City', 'England', 'club'),
	('Watford', 'England', 'club'),
	('Middlesbrough', 'England', 'club'),
	('Blackburn Rovers', 'England', 'club'),
	('Stoke City', 'England', 'club'),
	('Coventry City', 'England', 'club'),
	('Derby County', 'England', 'club'),
	('West Bromwich Albion', 'England', 'club'),
	('Birmingham City', 'England', 'club'),
	('Wrexham', 'Wales', 'club'),
	('Cardiff City', 'Wales', 'club'),
	('Swansea City', 'Wales', 'club'),
	('Hull City', 'England', 'club'),
	('Queens Park Rangers', 'England', 'club'),
	('Portsmouth', 'England', 'club'),
	('Luton Town', 'England', 'club'),
	('Bolton Wanderers', 'England', 'club'),
	('Al-Nassr', 'Saudi Arabia', 'club'),
	('Al-Hilal', 'Saudi Arabia', 'club'),
	('Al-Ittihad', 'Saudi Arabia', 'club'),
	('Al-Ahli', 'Saudi Arabia', 'club'),
	('Inter Miami', 'United States', 'club'),
	('LA Galaxy', 'United States', 'club'),
	('LAFC', 'United States', 'club'),
	('Club America', 'Mexico', 'club'),
	('Chivas Guadalajara', 'Mexico', 'club'),
	('Cruz Azul', 'Mexico', 'club'),
	('Pumas UNAM', 'Mexico', 'club'),
	('Monterrey', 'Mexico', 'club'),
	('Tigres UANL', 'Mexico', 'club');

INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Gianluigi Donnarumma', 'Italy', 'player'),
	('Desire Doue', 'France', 'player'),
	('Denzel Dumfries', 'Netherlands', 'player'),
	('Serhou Guirassy', 'Guinea', 'player'),
	('Viktor Gyokeres', 'Sweden', 'player'),
	('Khvicha Kvaratskhelia', 'Georgia', 'player'),
	('Alexis Mac Allister', 'Argentina', 'player'),
	('Scott McTominay', 'Scotland', 'player'),
	('Nuno Mendes', 'Portugal', 'player'),
	('Joao Neves', 'Portugal', 'player'),
	('Michael Olise', 'France', 'player'),
	('Cole Palmer', 'England', 'player'),
	('Raphinha', 'Brazil', 'player'),
	('Fabian Ruiz', 'Spain', 'player'),
	('Vitinha', 'Portugal', 'player'),
	('Florian Wirtz', 'Germany', 'player'),
	('Lamine Yamal', 'Spain', 'player'),
	('David Raya', 'Spain', 'player'),
	('William Saliba', 'France', 'player'),
	('Cristhian Mosquera', 'Spain', 'player'),
	('Ben White', 'England', 'player'),
	('Gabriel Magalhaes', 'Brazil', 'player'),
	('Martin Odegaard', 'Norway', 'player'),
	('Gabriel Martinelli', 'Brazil', 'player'),
	('Jurrien Timber', 'Netherlands', 'player'),
	('Kepa Arrizabalaga', 'Spain', 'player'),
	('Jakub Kiwior', 'Poland', 'player'),
	('Christian Norgaard', 'Denmark', 'player'),
	('Oleksandr Zinchenko', 'Ukraine', 'player'),
	('Leandro Trossard', 'Belgium', 'player'),
	('Noni Madueke', 'England', 'player'),
	('Mikel Merino', 'Spain', 'player'),
	('Kai Havertz', 'Germany', 'player'),
	('Riccardo Calafiori', 'Italy', 'player'),
	('Martin Zubimendi', 'Spain', 'player'),
	('Myles Lewis-Skelly', 'England', 'player'),
	('Ethan Nwaneri', 'England', 'player'),
	('Eberechi Eze', 'England', 'player'),
	('Trent Alexander-Arnold', 'England', 'player'),
	('Andrew Robertson', 'Scotland', 'player'),
	('Ibrahima Konate', 'France', 'player'),
	('Dominik Szoboszlai', 'Hungary', 'player'),
	('Ryan Gravenberch', 'Netherlands', 'player'),
	('Curtis Jones', 'England', 'player'),
	('Luis Diaz', 'Colombia', 'player'),
	('Federico Chiesa', 'Italy', 'player'),
	('Hugo Ekitike', 'France', 'player'),
	('Alexander Isak', 'Sweden', 'player'),
	('Jeremie Frimpong', 'Netherlands', 'player'),
	('Milos Kerkez', 'Hungary', 'player'),
	('Giorgi Mamardashvili', 'Georgia', 'player'),
	('Joe Gomez', 'England', 'player'),
	('Wataru Endo', 'Japan', 'player'),
	('Harvey Elliott', 'England', 'player'),
	('Caoimhin Kelleher', 'Republic of Ireland', 'player'),
	('Rodri', 'Spain', 'player'),
	('Bernardo Silva', 'Portugal', 'player'),
	('Ruben Dias', 'Portugal', 'player'),
	('Josko Gvardiol', 'Croatia', 'player'),
	('John Stones', 'England', 'player'),
	('Nathan Ake', 'Netherlands', 'player'),
	('Jack Grealish', 'England', 'player'),
	('Savinho', 'Brazil', 'player'),
	('Jeremy Doku', 'Belgium', 'player'),
	('Rayan Cherki', 'France', 'player'),
	('Tijjani Reijnders', 'Netherlands', 'player'),
	('Omar Marmoush', 'Egypt', 'player'),
	('Matheus Nunes', 'Portugal', 'player'),
	('Rico Lewis', 'England', 'player'),
	('Nico Gonzalez', 'Spain', 'player'),
	('Kyle Walker', 'England', 'player'),
	('James Trafford', 'England', 'player'),
	('Oscar Bobb', 'Norway', 'player'),
	('Abdukodir Khusanov', 'Uzbekistan', 'player'),
	('Matthijs de Ligt', 'Netherlands', 'player'),
	('Lisandro Martinez', 'Argentina', 'player'),
	('Harry Maguire', 'England', 'player'),
	('Luke Shaw', 'England', 'player'),
	('Diogo Dalot', 'Portugal', 'player'),
	('Noussair Mazraoui', 'Morocco', 'player'),
	('Kobbie Mainoo', 'England', 'player'),
	('Mason Mount', 'England', 'player'),
	('Bryan Mbeumo', 'Cameroon', 'player'),
	('Matheus Cunha', 'Brazil', 'player'),
	('Benjamin Sesko', 'Slovenia', 'player'),
	('Amad Diallo', 'Ivory Coast', 'player'),
	('Alejandro Garnacho', 'Argentina', 'player'),
	('Andre Onana', 'Cameroon', 'player'),
	('Leny Yoro', 'France', 'player'),
	('Joshua Zirkzee', 'Netherlands', 'player'),
	('Patrick Dorgu', 'Denmark', 'player'),
	('Senne Lammens', 'Belgium', 'player'),
	('Enzo Fernandez', 'Argentina', 'player'),
	('Moises Caicedo', 'Ecuador', 'player'),
	('Reece James', 'England', 'player'),
	('Levi Colwill', 'England', 'player'),
	('Wesley Fofana', 'France', 'player'),
	('Trevoh Chalobah', 'England', 'player'),
	('Marc Cucurella', 'Spain', 'player'),
	('Malo Gusto', 'France', 'player'),
	('Robert Sanchez', 'Spain', 'player'),
	('Nicolas Jackson', 'Senegal', 'player'),
	('Christopher Nkunku', 'France', 'player'),
	('Pedro Neto', 'Portugal', 'player'),
	('Jamie Gittens', 'England', 'player'),
	('Joao Pedro', 'Brazil', 'player'),
	('Estevao', 'Brazil', 'player'),
	('Romeo Lavia', 'Belgium', 'player'),
	('Liam Delap', 'England', 'player'),
	('Tosin Adarabioyo', 'England', 'player'),
	('Raheem Sterling', 'England', 'player'),
	('Cesar Azpilicueta', 'Spain', 'player'),
	('Eden Hazard', 'Belgium', 'player'),
	('James Maddison', 'England', 'player'),
	('Dejan Kulusevski', 'Sweden', 'player'),
	('Dominic Solanke', 'England', 'player'),
	('Brennan Johnson', 'Wales', 'player'),
	('Richarlison', 'Brazil', 'player'),
	('Destiny Udogie', 'Italy', 'player'),
	('Pedro Porro', 'Spain', 'player'),
	('Micky van de Ven', 'Netherlands', 'player'),
	('Cristian Romero', 'Argentina', 'player'),
	('Guglielmo Vicario', 'Italy', 'player'),
	('Yves Bissouma', 'Mali', 'player'),
	('Pape Matar Sarr', 'Senegal', 'player'),
	('Rodrigo Bentancur', 'Uruguay', 'player'),
	('Wilson Odobert', 'France', 'player'),
	('Mathys Tel', 'France', 'player'),
	('Mohammed Kudus', 'Ghana', 'player'),
	('Xavi Simons', 'Netherlands', 'player'),
	('Randal Kolo Muani', 'France', 'player'),
	('Archie Gray', 'England', 'player'),
	('Lucas Bergvall', 'Sweden', 'player'),
	('Joao Palhinha', 'Portugal', 'player'),
	('Bruno Guimaraes', 'Brazil', 'player'),
	('Sandro Tonali', 'Italy', 'player'),
	('Joelinton', 'Brazil', 'player'),
	('Anthony Gordon', 'England', 'player'),
	('Harvey Barnes', 'England', 'player'),
	('Jacob Murphy', 'England', 'player'),
	('Nick Pope', 'England', 'player'),
	('Aaron Ramsdale', 'England', 'player'),
	('Sven Botman', 'Netherlands', 'player'),
	('Fabian Schar', 'Switzerland', 'player'),
	('Kieran Trippier', 'England', 'player'),
	('Dan Burn', 'England', 'player'),
	('Tino Livramento', 'England', 'player'),
	('Nick Woltemade', 'Germany', 'player'),
	('Yoane Wissa', 'DR Congo', 'player'),
	('Anthony Elanga', 'Sweden', 'player'),
	('Malick Thiaw', 'Germany', 'player'),
	('Emiliano Martinez', 'Argentina', 'player'),
	('Ollie Watkins', 'England', 'player'),
	('Morgan Rogers', 'England', 'player'),
	('Youri Tielemans', 'Belgium', 'player'),
	('John McGinn', 'Scotland', 'player'),
	('Boubacar Kamara', 'France', 'player'),
	('Amadou Onana', 'Belgium', 'player'),
	('Ezri Konsa', 'England', 'player'),
	('Pau Torres', 'Spain', 'player'),
	('Matty Cash', 'Poland', 'player'),
	('Lucas Digne', 'France', 'player'),
	('Emiliano Buendia', 'Argentina', 'player'),
	('Donyell Malen', 'Netherlands', 'player'),
	('Evann Guessand', 'Ivory Coast', 'player'),
	('Leon Bailey', 'Jamaica', 'player'),
	('Jarrod Bowen', 'England', 'player'),
	('Lucas Paqueta', 'Brazil', 'player'),
	('James Ward-Prowse', 'England', 'player'),
	('Niclas Fullkrug', 'Germany', 'player'),
	('Max Kilman', 'England', 'player'),
	('Jean-Philippe Mateta', 'France', 'player'),
	('Marc Guehi', 'England', 'player'),
	('Adam Wharton', 'England', 'player'),
	('Daichi Kamada', 'Japan', 'player'),
	('Ismaila Sarr', 'Senegal', 'player'),
	('Daniel Munoz', 'Colombia', 'player'),
	('Dean Henderson', 'England', 'player'),
	('Chris Richards', 'United States', 'player'),
	('Jordan Pickford', 'England', 'player'),
	('Idrissa Gueye', 'Senegal', 'player'),
	('Dwight McNeil', 'England', 'player'),
	('Iliman Ndiaye', 'Senegal', 'player'),
	('Beto', 'Portugal', 'player'),
	('James Tarkowski', 'England', 'player'),
	('Jarrad Branthwaite', 'England', 'player'),
	('Bernd Leno', 'Germany', 'player'),
	('Antonee Robinson', 'United States', 'player'),
	('Joachim Andersen', 'Denmark', 'player'),
	('Emile Smith Rowe', 'England', 'player'),
	('Alex Iwobi', 'Nigeria', 'player'),
	('Raul Jimenez', 'Mexico', 'player'),
	('Harry Wilson', 'Wales', 'player'),
	('Bart Verbruggen', 'Netherlands', 'player'),
	('Lewis Dunk', 'England', 'player'),
	('Jan Paul van Hecke', 'Netherlands', 'player'),
	('Carlos Baleba', 'Cameroon', 'player'),
	('Yasin Ayari', 'Sweden', 'player'),
	('Georginio Rutter', 'France', 'player'),
	('Danny Welbeck', 'England', 'player'),
	('Igor Thiago', 'Brazil', 'player'),
	('Mikkel Damsgaard', 'Denmark', 'player'),
	('Nathan Collins', 'Republic of Ireland', 'player'),
	('Keane Lewis-Potter', 'England', 'player'),
	('Kevin Schade', 'Germany', 'player'),
	('Antoine Semenyo', 'Ghana', 'player'),
	('Justin Kluivert', 'Netherlands', 'player'),
	('Marcus Tavernier', 'England', 'player'),
	('Ryan Christie', 'Scotland', 'player'),
	('Adrien Truffert', 'France', 'player'),
	('Djordje Petrovic', 'Serbia', 'player'),
	('Ilya Zabarnyi', 'Ukraine', 'player'),
	('Dean Huijsen', 'Spain', 'player'),
	('Jorgen Strand Larsen', 'Norway', 'player'),
	('Jose Sa', 'Portugal', 'player'),
	('Marshall Munetsi', 'Zimbabwe', 'player'),
	('Jean-Ricner Bellegarde', 'France', 'player'),
	('Morgan Gibbs-White', 'England', 'player'),
	('Chris Wood', 'New Zealand', 'player'),
	('Callum Hudson-Odoi', 'England', 'player'),
	('Ola Aina', 'Nigeria', 'player'),
	('Murillo', 'Brazil', 'player'),
	('Nikola Milenkovic', 'Serbia', 'player'),
	('Matz Sels', 'Belgium', 'player'),
	('Elliot Anderson', 'England', 'player'),
	('Dan Ndoye', 'Switzerland', 'player'),
	('Omari Hutchinson', 'England', 'player'),
	('Illan Meslier', 'France', 'player'),
	('Wilfried Gnonto', 'Italy', 'player'),
	('Ethan Ampadu', 'Wales', 'player'),
	('Ao Tanaka', 'Japan', 'player'),
	('Joel Piroe', 'Netherlands', 'player'),
	('Dominic Calvert-Lewin', 'England', 'player'),
	('Anton Stach', 'Germany', 'player'),
	('Lukas Nmecha', 'Germany', 'player'),
	('Noah Okafor', 'Switzerland', 'player'),
	('Jayden Bogle', 'England', 'player'),
	('Pascal Struijk', 'Netherlands', 'player'),
	('Josh Cullen', 'Republic of Ireland', 'player'),
	('Zian Flemming', 'Netherlands', 'player'),
	('Jaidon Anthony', 'England', 'player'),
	('Lyle Foster', 'South Africa', 'player'),
	('Martin Dubravka', 'Slovakia', 'player'),
	('Granit Xhaka', 'Switzerland', 'player'),
	('Habib Diarra', 'Senegal', 'player'),
	('Wilson Isidor', 'France', 'player'),
	('Eliezer Mayenda', 'Spain', 'player'),
	('Robin Roefs', 'Netherlands', 'player'),
	('Reinildo', 'Mozambique', 'player'),
	('Omar Alderete', 'Paraguay', 'player'),
	('Nordi Mukiele', 'France', 'player'),
	('Antonio Rudiger', 'Germany', 'player'),
	('David Alaba', 'Austria', 'player'),
	('Eder Militao', 'Brazil', 'player'),
	('Ferland Mendy', 'France', 'player'),
	('Dani Carvajal', 'Spain', 'player'),
	('Alvaro Carreras', 'Spain', 'player'),
	('Aurelien Tchouameni', 'France', 'player'),
	('Eduardo Camavinga', 'France', 'player'),
	('Arda Guler', 'Turkey', 'player'),
	('Brahim Diaz', 'Morocco', 'player'),
	('Endrick', 'Brazil', 'player'),
	('Gonzalo Garcia', 'Spain', 'player'),
	('Franco Mastantuono', 'Argentina', 'player'),
	('Andriy Lunin', 'Ukraine', 'player'),
	('Joan Garcia', 'Spain', 'player'),
	('Wojciech Szczesny', 'Poland', 'player'),
	('Jules Kounde', 'France', 'player'),
	('Ronald Araujo', 'Uruguay', 'player'),
	('Pau Cubarsi', 'Spain', 'player'),
	('Alejandro Balde', 'Spain', 'player'),
	('Eric Garcia', 'Spain', 'player'),
	('Frenkie de Jong', 'Netherlands', 'player'),
	('Dani Olmo', 'Spain', 'player'),
	('Fermin Lopez', 'Spain', 'player'),
	('Ferran Torres', 'Spain', 'player'),
	('Alexander Sorloth', 'Norway', 'player'),
	('Marcos Llorente', 'Spain', 'player'),
	('Rodrigo De Paul', 'Argentina', 'player'),
	('Koke', 'Spain', 'player'),
	('Pablo Barrios', 'Spain', 'player'),
	('Conor Gallagher', 'England', 'player'),
	('Robin Le Normand', 'Spain', 'player'),
	('Jose Maria Gimenez', 'Uruguay', 'player'),
	('Clement Lenglet', 'France', 'player'),
	('David Hancko', 'Slovakia', 'player'),
	('Thiago Almada', 'Argentina', 'player'),
	('Alex Baena', 'Spain', 'player'),
	('Giacomo Raspadori', 'Italy', 'player'),
	('Mikel Oyarzabal', 'Spain', 'player'),
	('Nico Williams', 'Spain', 'player'),
	('Inaki Williams', 'Ghana', 'player'),
	('Unai Simon', 'Spain', 'player'),
	('Aymeric Laporte', 'Spain', 'player'),
	('Alex Remiro', 'Spain', 'player'),
	('Isco', 'Spain', 'player'),
	('Giovani Lo Celso', 'Argentina', 'player'),
	('Antony', 'Brazil', 'player'),
	('Gerard Moreno', 'Spain', 'player'),
	('Ayoze Perez', 'Spain', 'player'),
	('Jose Gaya', 'Spain', 'player'),
	('Hugo Duro', 'Spain', 'player'),
	('Santi Cazorla', 'Spain', 'player'),
	('Yann Sommer', 'Switzerland', 'player'),
	('Alessandro Bastoni', 'Italy', 'player'),
	('Benjamin Pavard', 'France', 'player'),
	('Stefan de Vrij', 'Netherlands', 'player'),
	('Federico Dimarco', 'Italy', 'player'),
	('Nicolo Barella', 'Italy', 'player'),
	('Hakan Calhanoglu', 'Turkey', 'player'),
	('Henrikh Mkhitaryan', 'Armenia', 'player'),
	('Piotr Zielinski', 'Poland', 'player'),
	('Marcus Thuram', 'France', 'player'),
	('Francesco Pio Esposito', 'Italy', 'player'),
	('Petar Sucic', 'Croatia', 'player'),
	('Mike Maignan', 'France', 'player'),
	('Christian Pulisic', 'United States', 'player'),
	('Rafael Leao', 'Portugal', 'player'),
	('Theo Hernandez', 'France', 'player'),
	('Fikayo Tomori', 'England', 'player'),
	('Matteo Gabbia', 'Italy', 'player'),
	('Youssouf Fofana', 'France', 'player'),
	('Adrien Rabiot', 'France', 'player'),
	('Santiago Gimenez', 'Mexico', 'player'),
	('Strahinja Pavlovic', 'Serbia', 'player'),
	('Alexis Saelemaekers', 'Belgium', 'player'),
	('Ruben Loftus-Cheek', 'England', 'player'),
	('Samuele Ricci', 'Italy', 'player'),
	('Michele Di Gregorio', 'Italy', 'player'),
	('Gleison Bremer', 'Brazil', 'player'),
	('Pierre Kalulu', 'France', 'player'),
	('Andrea Cambiaso', 'Italy', 'player'),
	('Manuel Locatelli', 'Italy', 'player'),
	('Khephren Thuram', 'France', 'player'),
	('Teun Koopmeiners', 'Netherlands', 'player'),
	('Kenan Yildiz', 'Turkey', 'player'),
	('Dusan Vlahovic', 'Serbia', 'player'),
	('Jonathan David', 'Canada', 'player'),
	('Francisco Conceicao', 'Portugal', 'player'),
	('Lois Openda', 'Belgium', 'player'),
	('Edon Zhegrova', 'Kosovo', 'player'),
	('Federico Gatti', 'Italy', 'player'),
	('Alex Meret', 'Italy', 'player'),
	('Vanja Milinkovic-Savic', 'Serbia', 'player'),
	('Giovanni Di Lorenzo', 'Italy', 'player'),
	('Amir Rrahmani', 'Kosovo', 'player'),
	('Sam Beukema', 'Netherlands', 'player'),
	('Stanislav Lobotka', 'Slovakia', 'player'),
	('Andre-Frank Zambo Anguissa', 'Cameroon', 'player'),
	('Matteo Politano', 'Italy', 'player'),
	('David Neres', 'Brazil', 'player'),
	('Romelu Lukaku', 'Belgium', 'player'),
	('Noa Lang', 'Netherlands', 'player'),
	('Paulo Dybala', 'Argentina', 'player'),
	('Gianluca Mancini', 'Italy', 'player'),
	('Evan Ndicka', 'Ivory Coast', 'player'),
	('Bryan Cristante', 'Italy', 'player'),
	('Manu Kone', 'France', 'player'),
	('Matias Soule', 'Argentina', 'player'),
	('Artem Dovbyk', 'Ukraine', 'player'),
	('Mile Svilar', 'Serbia', 'player'),
	('Lorenzo Pellegrini', 'Italy', 'player'),
	('Mattia Zaccagni', 'Italy', 'player'),
	('Valentin Castellanos', 'Argentina', 'player'),
	('Ivan Provedel', 'Italy', 'player'),
	('Alessio Romagnoli', 'Italy', 'player'),
	('Mateo Guendouzi', 'France', 'player'),
	('Ademola Lookman', 'Nigeria', 'player'),
	('Gianluca Scamacca', 'Italy', 'player'),
	('Mario Pasalic', 'Croatia', 'player'),
	('Marten de Roon', 'Netherlands', 'player'),
	('Charles De Ketelaere', 'Belgium', 'player'),
	('Berat Djimsiti', 'Albania', 'player'),
	('Marco Carnesecchi', 'Italy', 'player'),
	('Giorgio Scalvini', 'Italy', 'player'),
	('Moise Kean', 'Italy', 'player'),
	('Albert Gudmundsson', 'Iceland', 'player'),
	('Robin Gosens', 'Germany', 'player'),
	('Edin Dzeko', 'Bosnia and Herzegovina', 'player'),
	('Nico Paz', 'Argentina', 'player'),
	('Alvaro Morata', 'Spain', 'player'),
	('Riccardo Orsolini', 'Italy', 'player'),
	('Santiago Castro', 'Argentina', 'player'),
	('Lewis Ferguson', 'Scotland', 'player'),
	('Jhon Lucumi', 'Colombia', 'player'),
	('Ciro Immobile', 'Italy', 'player'),
	('Federico Bernardeschi', 'Italy', 'player'),
	('Duvan Zapata', 'Colombia', 'player'),
	('Serge Gnabry', 'Germany', 'player'),
	('Leroy Sane', 'Germany', 'player'),
	('Joshua Kimmich', 'Germany', 'player'),
	('Leon Goretzka', 'Germany', 'player'),
	('Aleksandar Pavlovic', 'Germany', 'player'),
	('Konrad Laimer', 'Austria', 'player'),
	('Dayot Upamecano', 'France', 'player'),
	('Kim Min-jae', 'South Korea', 'player'),
	('Jonathan Tah', 'Germany', 'player'),
	('Alphonso Davies', 'Canada', 'player'),
	('Jamal Musiala', 'Germany', 'player'),
	('Josip Stanisic', 'Croatia', 'player'),
	('Robert Andrich', 'Germany', 'player'),
	('Alejandro Grimaldo', 'Spain', 'player'),
	('Piero Hincapie', 'Ecuador', 'player'),
	('Edmond Tapsoba', 'Burkina Faso', 'player'),
	('Patrik Schick', 'Czechia', 'player'),
	('Victor Boniface', 'Nigeria', 'player'),
	('Exequiel Palacios', 'Argentina', 'player'),
	('Mark Flekken', 'Netherlands', 'player'),
	('Malik Tillman', 'United States', 'player'),
	('Jarell Quansah', 'England', 'player'),
	('Claudio Echeverri', 'Argentina', 'player'),
	('Gregor Kobel', 'Switzerland', 'player'),
	('Nico Schlotterbeck', 'Germany', 'player'),
	('Niklas Sule', 'Germany', 'player'),
	('Waldemar Anton', 'Germany', 'player'),
	('Ramy Bensebaini', 'Algeria', 'player'),
	('Julian Brandt', 'Germany', 'player'),
	('Felix Nmecha', 'Germany', 'player'),
	('Pascal Gross', 'Germany', 'player'),
	('Karim Adeyemi', 'Germany', 'player'),
	('Maximilian Beier', 'Germany', 'player'),
	('Fabio Silva', 'Portugal', 'player'),
	('Jobe Bellingham', 'England', 'player'),
	('Emre Can', 'Germany', 'player'),
	('Marcel Sabitzer', 'Austria', 'player'),
	('Peter Gulacsi', 'Hungary', 'player'),
	('Willi Orban', 'Hungary', 'player'),
	('David Raum', 'Germany', 'player'),
	('Castello Lukeba', 'France', 'player'),
	('Antonio Nusa', 'Norway', 'player'),
	('Xaver Schlager', 'Austria', 'player'),
	('Christoph Baumgartner', 'Austria', 'player'),
	('Johan Bakayoko', 'Belgium', 'player'),
	('Kevin Trapp', 'Germany', 'player'),
	('Robin Koch', 'Germany', 'player'),
	('Arthur Theate', 'Belgium', 'player'),
	('Can Uzun', 'Turkey', 'player'),
	('Ansgar Knauff', 'Germany', 'player'),
	('Jonathan Burkardt', 'Germany', 'player'),
	('Ritsu Doan', 'Japan', 'player'),
	('Deniz Undav', 'Germany', 'player'),
	('Ermedin Demirovic', 'Bosnia and Herzegovina', 'player'),
	('Angelo Stiller', 'Germany', 'player'),
	('Alexander Nubel', 'Germany', 'player'),
	('Jamie Leweling', 'Germany', 'player'),
	('Marquinhos', 'Brazil', 'player'),
	('Presnel Kimpembe', 'France', 'player'),
	('Willian Pacho', 'Ecuador', 'player'),
	('Lucas Beraldo', 'Brazil', 'player'),
	('Lucas Hernandez', 'France', 'player'),
	('Warren Zaire-Emery', 'France', 'player'),
	('Bradley Barcola', 'France', 'player'),
	('Goncalo Ramos', 'Portugal', 'player'),
	('Lee Kang-in', 'South Korea', 'player'),
	('Senny Mayulu', 'France', 'player'),
	('Lucas Chevalier', 'France', 'player'),
	('Mason Greenwood', 'England', 'player'),
	('Pierre-Emile Hojbjerg', 'Denmark', 'player'),
	('Leonardo Balerdi', 'Argentina', 'player'),
	('Geronimo Rulli', 'Argentina', 'player'),
	('Timothy Weah', 'United States', 'player'),
	('Igor Paixao', 'Brazil', 'player'),
	('Nayef Aguerd', 'Morocco', 'player'),
	('Amine Gouiri', 'Algeria', 'player'),
	('Pierre-Emerick Aubameyang', 'Gabon', 'player'),
	('Ansu Fati', 'Spain', 'player'),
	('Maghnes Akliouche', 'France', 'player'),
	('Denis Zakaria', 'Switzerland', 'player'),
	('Takumi Minamino', 'Japan', 'player'),
	('Folarin Balogun', 'United States', 'player'),
	('Vanderson', 'Brazil', 'player'),
	('Eric Dier', 'England', 'player'),
	('Lamine Camara', 'Senegal', 'player'),
	('Mika Biereth', 'Denmark', 'player'),
	('Aleksandr Golovin', 'Russia', 'player'),
	('Corentin Tolisso', 'France', 'player'),
	('Malick Fofana', 'Belgium', 'player'),
	('Georges Mikautadze', 'Georgia', 'player'),
	('Florian Thauvin', 'France', 'player'),
	('Breel Embolo', 'Switzerland', 'player'),
	('Diogo Costa', 'Portugal', 'player'),
	('Vangelis Pavlidis', 'Greece', 'player'),
	('Nicolas Otamendi', 'Argentina', 'player'),
	('Pedro Goncalves', 'Portugal', 'player'),
	('Morten Hjulmand', 'Denmark', 'player'),
	('Mauro Icardi', 'Argentina', 'player'),
	('Youssef En-Nesyri', 'Morocco', 'player'),
	('Joao Felix', 'Portugal', 'player'),
	('Ivan Toney', 'England', 'player'),
	('Ruben Neves', 'Portugal', 'player'),
	('Aleksandar Mitrovic', 'Serbia', 'player'),
	('Sergej Milinkovic-Savic', 'Serbia', 'player'),
	('Kingsley Coman', 'France', 'player'),
	('Jordi Alba', 'Spain', 'player'),
	('Lorenzo Insigne', 'Italy', 'player'),
	('Hirving Lozano', 'Mexico', 'player'),
	('Gabriel Barbosa', 'Brazil', 'player'),
	('Gonzalo Martinez', 'Argentina', 'player'),
	('Pedro', 'Brazil', 'player'),
	('German Cano', 'Argentina', 'player'),
	('Luiz Henrique', 'Brazil', 'player'),
	('Giorgian De Arrascaeta', 'Uruguay', 'player'),
	('Enner Valencia', 'Ecuador', 'player'),
	('Alexis Sanchez', 'Chile', 'player'),
	('Arturo Vidal', 'Chile', 'player'),
	('Claudio Bravo', 'Chile', 'player'),
	('Paolo Guerrero', 'Peru', 'player'),
	('Claudio Pizarro', 'Peru', 'player'),
	('Miguel Almiron', 'Paraguay', 'player'),
	('Julio Enciso', 'Paraguay', 'player'),
	('Salomon Rondon', 'Venezuela', 'player'),
	('Carlos Tevez', 'Argentina', 'player'),
	('Javier Mascherano', 'Argentina', 'player'),
	('Angel Di Maria', 'Argentina', 'player'),
	('Juan Roman Riquelme', 'Argentina', 'player'),
	('Juan Sebastian Veron', 'Argentina', 'player'),
	('Gabriel Batistuta', 'Argentina', 'player'),
	('Hernan Crespo', 'Argentina', 'player'),
	('Mario Kempes', 'Argentina', 'player'),
	('Daniel Passarella', 'Argentina', 'player'),
	('Thiago Silva', 'Brazil', 'player'),
	('Marcelo', 'Brazil', 'player'),
	('Oscar', 'Brazil', 'player'),
	('Philippe Coutinho', 'Brazil', 'player'),
	('Lucas Moura', 'Brazil', 'player'),
	('Bebeto', 'Brazil', 'player'),
	('Zico', 'Brazil', 'player'),
	('Socrates', 'Brazil', 'player'),
	('Yaya Toure', 'Ivory Coast', 'player'),
	('Kolo Toure', 'Ivory Coast', 'player'),
	('Emmanuel Adebayor', 'Togo', 'player'),
	('Frederic Kanoute', 'Mali', 'player'),
	('El Hadji Diouf', 'Senegal', 'player'),
	('Nwankwo Kanu', 'Nigeria', 'player'),
	('Jay-Jay Okocha', 'Nigeria', 'player'),
	('Michael Essien', 'Ghana', 'player'),
	('Asamoah Gyan', 'Ghana', 'player'),
	('Patrick M''Boma', 'Cameroon', 'player'),
	('Mustapha Hadji', 'Morocco', 'player'),
	('Victor Ikpeba', 'Nigeria', 'player'),
	('Emmanuel Amunike', 'Nigeria', 'player'),
	('Rashidi Yekini', 'Nigeria', 'player'),
	('Abedi Pele', 'Ghana', 'player'),
	('Hakim Ziyech', 'Morocco', 'player'),
	('Yassine Bounou', 'Morocco', 'player'),
	('Kalidou Koulibaly', 'Senegal', 'player'),
	('Wilfried Zaha', 'Ivory Coast', 'player'),
	('Michel Platini', 'France', 'player'),
	('Alfredo Di Stefano', 'Argentina', 'player'),
	('Ferenc Puskas', 'Hungary', 'player'),
	('Gheorghe Hagi', 'Romania', 'player'),
	('Hristo Stoichkov', 'Bulgaria', 'player'),
	('Davor Suker', 'Croatia', 'player'),
	('Miroslav Klose', 'Germany', 'player'),
	('Philipp Lahm', 'Germany', 'player'),
	('Bastian Schweinsteiger', 'Germany', 'player'),
	('Michael Laudrup', 'Denmark', 'player'),
	('Jari Litmanen', 'Finland', 'player'),
	('Henrik Larsson', 'Sweden', 'player'),
	('Rui Costa', 'Portugal', 'player'),
	('Luis Figo', 'Portugal', 'player'),
	('Deco', 'Portugal', 'player'),
	('Nani', 'Portugal', 'player'),
	('Pepe', 'Portugal', 'player'),
	('Clarence Seedorf', 'Netherlands', 'player'),
	('Patrick Kluivert', 'Netherlands', 'player'),
	('Ronald Koeman', 'Netherlands', 'player'),
	('Gianluca Vialli', 'Italy', 'player'),
	('Roberto Mancini', 'Italy', 'player'),
	('Christian Vieri', 'Italy', 'player'),
	('Filippo Inzaghi', 'Italy', 'player'),
	('Alessandro Nesta', 'Italy', 'player'),
	('Franco Baresi', 'Italy', 'player'),
	('Paolo Rossi', 'Italy', 'player'),
	('Mario Balotelli', 'Italy', 'player'),
	('Gary Lineker', 'England', 'player'),
	('Paul Gascoigne', 'England', 'player'),
	('David Seaman', 'England', 'player'),
	('Sol Campbell', 'England', 'player'),
	('Ashley Cole', 'England', 'player'),
	('Gary Neville', 'England', 'player'),
	('Robbie Fowler', 'England', 'player'),
	('Ian Wright', 'England', 'player'),
	('Eric Cantona', 'France', 'player'),
	('Just Fontaine', 'France', 'player'),
	('Raymond Kopa', 'France', 'player'),
	('Jean-Pierre Papin', 'France', 'player'),
	('David Ginola', 'France', 'player'),
	('Franck Ribery', 'France', 'player'),
	('Raul', 'Spain', 'player'),
	('Fernando Hierro', 'Spain', 'player'),
	('Cesc Fabregas', 'Spain', 'player'),
	('Juan Mata', 'Spain', 'player'),
	('Pedro Rodriguez', 'Spain', 'player'),
	('Diego Costa', 'Spain', 'player'),
	('Gareth Bale', 'Wales', 'player'),
	('Aaron Ramsey', 'Wales', 'player'),
	('Graeme Souness', 'Scotland', 'player'),
	('Roy Keane', 'Republic of Ireland', 'player'),
	('Robbie Keane', 'Republic of Ireland', 'player'),
	('Ole Gunnar Solskjaer', 'Norway', 'player'),
	('Christian Eriksen', 'Denmark', 'player'),
	('Kasper Schmeichel', 'Denmark', 'player'),
	('Dries Mertens', 'Belgium', 'player'),
	('Vincent Kompany', 'Belgium', 'player'),
	('Ivan Rakitic', 'Croatia', 'player'),
	('Mateo Kovacic', 'Croatia', 'player'),
	('Ivan Perisic', 'Croatia', 'player'),
	('Dimitar Berbatov', 'Bulgaria', 'player'),
	('Dusan Tadic', 'Serbia', 'player'),
	('Nemanja Vidic', 'Serbia', 'player'),
	('Xherdan Shaqiri', 'Switzerland', 'player'),
	('Marko Arnautovic', 'Austria', 'player'),
	('Tomas Soucek', 'Czechia', 'player'),
	('Hidetoshi Nakata', 'Japan', 'player'),
	('Shinji Kagawa', 'Japan', 'player'),
	('Keisuke Honda', 'Japan', 'player'),
	('Park Ji-sung', 'South Korea', 'player'),
	('Mehdi Taremi', 'Iran', 'player'),
	('Ali Daei', 'Iran', 'player'),
	('Sunil Chhetri', 'India', 'player'),
	('Weston McKennie', 'United States', 'player'),
	('Landon Donovan', 'United States', 'player'),
	('Clint Dempsey', 'United States', 'player'),
	('Javier Hernandez', 'Mexico', 'player'),
	('Rafael Marquez', 'Mexico', 'player'),
	('Hugo Sanchez', 'Mexico', 'player'),
	('Guillermo Ochoa', 'Mexico', 'player');

WITH v(name, cat, alias) AS (VALUES
	('Arsenal', 'England', 'arsenal'),
	('Aston Villa', 'England', 'aston villa'),
	('Aston Villa', 'England', 'villa'),
	('AFC Bournemouth', 'England', 'afc bournemouth'),
	('AFC Bournemouth', 'England', 'bournemouth'),
	('Brentford', 'England', 'brentford'),
	('Brighton & Hove Albion', 'England', 'brighton'),
	('Brighton & Hove Albion', 'England', 'brighton hove albion'),
	('Burnley', 'England', 'burnley'),
	('Chelsea', 'England', 'chelsea'),
	('Crystal Palace', 'England', 'crystal palace'),
	('Crystal Palace', 'England', 'palace'),
	('Everton', 'England', 'everton'),
	('Fulham', 'England', 'fulham'),
	('Leeds United', 'England', 'leeds united'),
	('Liverpool', 'England', 'liverpool'),
	('Manchester City', 'England', 'man city'),
	('Manchester City', 'England', 'manchester city'),
	('Manchester United', 'England', 'man united'),
	('Manchester United', 'England', 'man utd'),
	('Manchester United', 'England', 'manchester united'),
	('Newcastle United', 'England', 'newcastle united'),
	('Nottingham Forest', 'England', 'forest'),
	('Nottingham Forest', 'England', 'nottingham forest'),
	('Sunderland', 'England', 'sunderland'),
	('Tottenham Hotspur', 'England', 'spurs'),
	('Tottenham Hotspur', 'England', 'tottenham hotspur'),
	('West Ham United', 'England', 'west ham united'),
	('Wolverhampton Wanderers', 'England', 'wolverhampton wanderers'),
	('Wolverhampton Wanderers', 'England', 'wolves'),
	('Alaves', 'Spain', 'alaves'),
	('Alaves', 'Spain', 'deportivo alaves'),
	('Athletic Club', 'Spain', 'athletic bilbao'),
	('Athletic Club', 'Spain', 'athletic club'),
	('Atletico Madrid', 'Spain', 'atleti'),
	('Atletico Madrid', 'Spain', 'atletico'),
	('Atletico Madrid', 'Spain', 'atletico madrid'),
	('Barcelona', 'Spain', 'barca'),
	('Barcelona', 'Spain', 'barcelona'),
	('Barcelona', 'Spain', 'fc barcelona'),
	('Celta Vigo', 'Spain', 'celta'),
	('Celta Vigo', 'Spain', 'celta vigo'),
	('Elche', 'Spain', 'elche'),
	('Espanyol', 'Spain', 'espanyol'),
	('Getafe', 'Spain', 'getafe'),
	('Girona', 'Spain', 'girona'),
	('Levante', 'Spain', 'levante'),
	('Mallorca', 'Spain', 'mallorca'),
	('Osasuna', 'Spain', 'osasuna'),
	('Rayo Vallecano', 'Spain', 'rayo'),
	('Rayo Vallecano', 'Spain', 'rayo vallecano'),
	('Real Betis', 'Spain', 'betis'),
	('Real Betis', 'Spain', 'real betis'),
	('Real Madrid', 'Spain', 'real madrid'),
	('Real Oviedo', 'Spain', 'oviedo'),
	('Real Oviedo', 'Spain', 'real oviedo'),
	('Real Sociedad', 'Spain', 'real sociedad'),
	('Sevilla', 'Spain', 'sevilla'),
	('Valencia', 'Spain', 'valencia'),
	('Villarreal', 'Spain', 'villarreal'),
	('Atalanta', 'Italy', 'atalanta'),
	('Bologna', 'Italy', 'bologna'),
	('Cagliari', 'Italy', 'cagliari'),
	('Como', 'Italy', 'como'),
	('Cremonese', 'Italy', 'cremonese'),
	('Fiorentina', 'Italy', 'fiorentina'),
	('Genoa', 'Italy', 'genoa'),
	('Hellas Verona', 'Italy', 'hellas verona'),
	('Hellas Verona', 'Italy', 'verona'),
	('Inter Milan', 'Italy', 'inter milan'),
	('Juventus', 'Italy', 'juve'),
	('Juventus', 'Italy', 'juventus'),
	('Lazio', 'Italy', 'lazio'),
	('Lecce', 'Italy', 'lecce'),
	('AC Milan', 'Italy', 'ac milan'),
	('AC Milan', 'Italy', 'milan'),
	('Napoli', 'Italy', 'napoli'),
	('Parma', 'Italy', 'parma'),
	('Pisa', 'Italy', 'pisa'),
	('Roma', 'Italy', 'as roma'),
	('Roma', 'Italy', 'roma'),
	('Sassuolo', 'Italy', 'sassuolo'),
	('Torino', 'Italy', 'torino'),
	('Udinese', 'Italy', 'udinese'),
	('Bayern Munich', 'Germany', 'bayern'),
	('Bayern Munich', 'Germany', 'bayern munich'),
	('Borussia Dortmund', 'Germany', 'borussia dortmund'),
	('Borussia Dortmund', 'Germany', 'bvb'),
	('Borussia Dortmund', 'Germany', 'dortmund'),
	('RB Leipzig', 'Germany', 'leipzig'),
	('RB Leipzig', 'Germany', 'rb leipzig'),
	('Bayer Leverkusen', 'Germany', 'bayer leverkusen'),
	('Bayer Leverkusen', 'Germany', 'leverkusen'),
	('VfB Stuttgart', 'Germany', 'stuttgart'),
	('VfB Stuttgart', 'Germany', 'vfb stuttgart'),
	('Eintracht Frankfurt', 'Germany', 'eintracht frankfurt'),
	('Eintracht Frankfurt', 'Germany', 'frankfurt'),
	('SC Freiburg', 'Germany', 'freiburg'),
	('SC Freiburg', 'Germany', 'sc freiburg'),
	('TSG Hoffenheim', 'Germany', 'hoffenheim'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'club';
WITH v(name, cat, alias) AS (VALUES
	('TSG Hoffenheim', 'Germany', 'tsg hoffenheim'),
	('FC Augsburg', 'Germany', 'augsburg'),
	('FC Augsburg', 'Germany', 'fc augsburg'),
	('Mainz 05', 'Germany', 'mainz'),
	('Mainz 05', 'Germany', 'mainz 05'),
	('Union Berlin', 'Germany', 'union berlin'),
	('Borussia Monchengladbach', 'Germany', 'borussia monchengladbach'),
	('Borussia Monchengladbach', 'Germany', 'gladbach'),
	('Borussia Monchengladbach', 'Germany', 'monchengladbach'),
	('Werder Bremen', 'Germany', 'werder'),
	('Werder Bremen', 'Germany', 'werder bremen'),
	('VfL Wolfsburg', 'Germany', 'vfl wolfsburg'),
	('VfL Wolfsburg', 'Germany', 'wolfsburg'),
	('FC St. Pauli', 'Germany', 'fc st pauli'),
	('FC St. Pauli', 'Germany', 'st pauli'),
	('Heidenheim', 'Germany', 'heidenheim'),
	('FC Koln', 'Germany', 'cologne'),
	('FC Koln', 'Germany', 'fc koln'),
	('FC Koln', 'Germany', 'koln'),
	('Hamburger SV', 'Germany', 'hamburg'),
	('Hamburger SV', 'Germany', 'hamburger sv'),
	('Hamburger SV', 'Germany', 'hsv'),
	('Paris Saint-Germain', 'France', 'paris saint germain'),
	('Paris Saint-Germain', 'France', 'paris saintgermain'),
	('Paris Saint-Germain', 'France', 'psg'),
	('Marseille', 'France', 'marseille'),
	('Marseille', 'France', 'olympique marseille'),
	('Marseille', 'France', 'om'),
	('Lyon', 'France', 'lyon'),
	('Lyon', 'France', 'olympique lyonnais'),
	('AS Monaco', 'France', 'as monaco'),
	('AS Monaco', 'France', 'monaco'),
	('Lille', 'France', 'lille'),
	('Lille', 'France', 'losc'),
	('Nice', 'France', 'nice'),
	('Lens', 'France', 'lens'),
	('Rennes', 'France', 'rennes'),
	('Strasbourg', 'France', 'strasbourg'),
	('Toulouse', 'France', 'toulouse'),
	('Nantes', 'France', 'nantes'),
	('Brest', 'France', 'brest'),
	('Auxerre', 'France', 'auxerre'),
	('Angers', 'France', 'angers'),
	('Le Havre', 'France', 'le havre'),
	('Metz', 'France', 'metz'),
	('Lorient', 'France', 'lorient'),
	('Paris FC', 'France', 'paris fc'),
	('Porto', 'Portugal', 'fc porto'),
	('Porto', 'Portugal', 'porto'),
	('Benfica', 'Portugal', 'benfica'),
	('Sporting CP', 'Portugal', 'sporting'),
	('Sporting CP', 'Portugal', 'sporting cp'),
	('Sporting CP', 'Portugal', 'sporting lisbon'),
	('Braga', 'Portugal', 'braga'),
	('Ajax', 'Netherlands', 'ajax'),
	('PSV Eindhoven', 'Netherlands', 'psv'),
	('PSV Eindhoven', 'Netherlands', 'psv eindhoven'),
	('Feyenoord', 'Netherlands', 'feyenoord'),
	('AZ Alkmaar', 'Netherlands', 'az'),
	('AZ Alkmaar', 'Netherlands', 'az alkmaar'),
	('Celtic', 'Scotland', 'celtic'),
	('Rangers', 'Scotland', 'rangers'),
	('Galatasaray', 'Turkey', 'galatasaray'),
	('Fenerbahce', 'Turkey', 'fenerbahce'),
	('Besiktas', 'Turkey', 'besiktas'),
	('Club Brugge', 'Belgium', 'club brugge'),
	('Anderlecht', 'Belgium', 'anderlecht'),
	('Red Bull Salzburg', 'Austria', 'red bull salzburg'),
	('Red Bull Salzburg', 'Austria', 'salzburg'),
	('Shakhtar Donetsk', 'Ukraine', 'shakhtar'),
	('Shakhtar Donetsk', 'Ukraine', 'shakhtar donetsk'),
	('Dynamo Kyiv', 'Ukraine', 'dynamo kyiv'),
	('Olympiacos', 'Greece', 'olympiacos'),
	('Panathinaikos', 'Greece', 'panathinaikos'),
	('Red Star Belgrade', 'Serbia', 'red star'),
	('Red Star Belgrade', 'Serbia', 'red star belgrade'),
	('Dinamo Zagreb', 'Croatia', 'dinamo zagreb'),
	('FC Copenhagen', 'Denmark', 'copenhagen'),
	('FC Copenhagen', 'Denmark', 'fc copenhagen'),
	('Sparta Prague', 'Czechia', 'sparta prague'),
	('Slavia Prague', 'Czechia', 'slavia prague'),
	('Young Boys', 'Switzerland', 'young boys'),
	('Leicester City', 'England', 'leicester'),
	('Leicester City', 'England', 'leicester city'),
	('Southampton', 'England', 'southampton'),
	('Ipswich Town', 'England', 'ipswich'),
	('Ipswich Town', 'England', 'ipswich town'),
	('Sheffield United', 'England', 'sheffield united'),
	('Sheffield Wednesday', 'England', 'sheffield wednesday'),
	('Norwich City', 'England', 'norwich'),
	('Norwich City', 'England', 'norwich city'),
	('Watford', 'England', 'watford'),
	('Middlesbrough', 'England', 'middlesbrough'),
	('Blackburn Rovers', 'England', 'blackburn'),
	('Blackburn Rovers', 'England', 'blackburn rovers'),
	('Stoke City', 'England', 'stoke'),
	('Stoke City', 'England', 'stoke city'),
	('Coventry City', 'England', 'coventry'),
	('Coventry City', 'England', 'coventry city'),
	('Derby County', 'England', 'derby'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'club';
WITH v(name, cat, alias) AS (VALUES
	('Derby County', 'England', 'derby county'),
	('West Bromwich Albion', 'England', 'west brom'),
	('West Bromwich Albion', 'England', 'west bromwich albion'),
	('Birmingham City', 'England', 'birmingham'),
	('Birmingham City', 'England', 'birmingham city'),
	('Wrexham', 'Wales', 'wrexham'),
	('Cardiff City', 'Wales', 'cardiff'),
	('Cardiff City', 'Wales', 'cardiff city'),
	('Swansea City', 'Wales', 'swansea'),
	('Swansea City', 'Wales', 'swansea city'),
	('Hull City', 'England', 'hull'),
	('Hull City', 'England', 'hull city'),
	('Queens Park Rangers', 'England', 'qpr'),
	('Queens Park Rangers', 'England', 'queens park rangers'),
	('Portsmouth', 'England', 'portsmouth'),
	('Luton Town', 'England', 'luton'),
	('Luton Town', 'England', 'luton town'),
	('Bolton Wanderers', 'England', 'bolton'),
	('Bolton Wanderers', 'England', 'bolton wanderers'),
	('Al-Nassr', 'Saudi Arabia', 'al nassr'),
	('Al-Nassr', 'Saudi Arabia', 'alnassr'),
	('Al-Hilal', 'Saudi Arabia', 'al hilal'),
	('Al-Hilal', 'Saudi Arabia', 'alhilal'),
	('Al-Ittihad', 'Saudi Arabia', 'al ittihad'),
	('Al-Ittihad', 'Saudi Arabia', 'alittihad'),
	('Al-Ahli', 'Saudi Arabia', 'al ahli'),
	('Al-Ahli', 'Saudi Arabia', 'alahli'),
	('Inter Miami', 'United States', 'inter miami'),
	('LA Galaxy', 'United States', 'la galaxy'),
	('LAFC', 'United States', 'lafc'),
	('LAFC', 'United States', 'los angeles fc'),
	('Club America', 'Mexico', 'america'),
	('Club America', 'Mexico', 'club america'),
	('Chivas Guadalajara', 'Mexico', 'chivas'),
	('Chivas Guadalajara', 'Mexico', 'chivas guadalajara'),
	('Cruz Azul', 'Mexico', 'cruz azul'),
	('Pumas UNAM', 'Mexico', 'pumas'),
	('Pumas UNAM', 'Mexico', 'pumas unam'),
	('Monterrey', 'Mexico', 'monterrey'),
	('Tigres UANL', 'Mexico', 'tigres'),
	('Tigres UANL', 'Mexico', 'tigres uanl'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'club';

WITH v(name, cat, alias) AS (VALUES
	('Gianluigi Donnarumma', 'Italy', 'donnarumma'),
	('Gianluigi Donnarumma', 'Italy', 'gianluigi donnarumma'),
	('Desire Doue', 'France', 'desire doue'),
	('Desire Doue', 'France', 'doue'),
	('Denzel Dumfries', 'Netherlands', 'denzel dumfries'),
	('Denzel Dumfries', 'Netherlands', 'dumfries'),
	('Serhou Guirassy', 'Guinea', 'guirassy'),
	('Serhou Guirassy', 'Guinea', 'serhou guirassy'),
	('Viktor Gyokeres', 'Sweden', 'gyokeres'),
	('Viktor Gyokeres', 'Sweden', 'viktor gyokeres'),
	('Khvicha Kvaratskhelia', 'Georgia', 'khvicha kvaratskhelia'),
	('Khvicha Kvaratskhelia', 'Georgia', 'kvara'),
	('Khvicha Kvaratskhelia', 'Georgia', 'kvaratskhelia'),
	('Alexis Mac Allister', 'Argentina', 'alexis mac allister'),
	('Alexis Mac Allister', 'Argentina', 'allister'),
	('Scott McTominay', 'Scotland', 'mctominay'),
	('Scott McTominay', 'Scotland', 'scott mctominay'),
	('Nuno Mendes', 'Portugal', 'mendes'),
	('Nuno Mendes', 'Portugal', 'nuno mendes'),
	('Joao Neves', 'Portugal', 'joao neves'),
	('Joao Neves', 'Portugal', 'neves'),
	('Michael Olise', 'France', 'michael olise'),
	('Michael Olise', 'France', 'olise'),
	('Cole Palmer', 'England', 'cole palmer'),
	('Cole Palmer', 'England', 'palmer'),
	('Raphinha', 'Brazil', 'raphinha'),
	('Fabian Ruiz', 'Spain', 'fabian ruiz'),
	('Fabian Ruiz', 'Spain', 'ruiz'),
	('Vitinha', 'Portugal', 'vitinha'),
	('Florian Wirtz', 'Germany', 'florian wirtz'),
	('Florian Wirtz', 'Germany', 'wirtz'),
	('Lamine Yamal', 'Spain', 'lamine yamal'),
	('Lamine Yamal', 'Spain', 'yamal'),
	('David Raya', 'Spain', 'david raya'),
	('David Raya', 'Spain', 'raya'),
	('William Saliba', 'France', 'saliba'),
	('William Saliba', 'France', 'william saliba'),
	('Cristhian Mosquera', 'Spain', 'cristhian mosquera'),
	('Cristhian Mosquera', 'Spain', 'mosquera'),
	('Ben White', 'England', 'ben white'),
	('Ben White', 'England', 'white'),
	('Gabriel Magalhaes', 'Brazil', 'gabriel magalhaes'),
	('Gabriel Magalhaes', 'Brazil', 'magalhaes'),
	('Martin Odegaard', 'Norway', 'martin odegaard'),
	('Martin Odegaard', 'Norway', 'odegaard'),
	('Gabriel Martinelli', 'Brazil', 'gabriel martinelli'),
	('Gabriel Martinelli', 'Brazil', 'martinelli'),
	('Jurrien Timber', 'Netherlands', 'jurrien timber'),
	('Jurrien Timber', 'Netherlands', 'timber'),
	('Kepa Arrizabalaga', 'Spain', 'arrizabalaga'),
	('Kepa Arrizabalaga', 'Spain', 'kepa'),
	('Kepa Arrizabalaga', 'Spain', 'kepa arrizabalaga'),
	('Jakub Kiwior', 'Poland', 'jakub kiwior'),
	('Jakub Kiwior', 'Poland', 'kiwior'),
	('Christian Norgaard', 'Denmark', 'christian norgaard'),
	('Christian Norgaard', 'Denmark', 'norgaard'),
	('Oleksandr Zinchenko', 'Ukraine', 'oleksandr zinchenko'),
	('Oleksandr Zinchenko', 'Ukraine', 'zinchenko'),
	('Leandro Trossard', 'Belgium', 'leandro trossard'),
	('Leandro Trossard', 'Belgium', 'trossard'),
	('Noni Madueke', 'England', 'madueke'),
	('Noni Madueke', 'England', 'noni madueke'),
	('Mikel Merino', 'Spain', 'merino'),
	('Mikel Merino', 'Spain', 'mikel merino'),
	('Kai Havertz', 'Germany', 'havertz'),
	('Kai Havertz', 'Germany', 'kai havertz'),
	('Riccardo Calafiori', 'Italy', 'calafiori'),
	('Riccardo Calafiori', 'Italy', 'riccardo calafiori'),
	('Martin Zubimendi', 'Spain', 'martin zubimendi'),
	('Martin Zubimendi', 'Spain', 'zubimendi'),
	('Myles Lewis-Skelly', 'England', 'lewisskelly'),
	('Myles Lewis-Skelly', 'England', 'myles lewisskelly'),
	('Ethan Nwaneri', 'England', 'ethan nwaneri'),
	('Ethan Nwaneri', 'England', 'nwaneri'),
	('Eberechi Eze', 'England', 'eberechi eze'),
	('Eberechi Eze', 'England', 'eze'),
	('Trent Alexander-Arnold', 'England', 'alexanderarnold'),
	('Trent Alexander-Arnold', 'England', 'trent'),
	('Trent Alexander-Arnold', 'England', 'trent alexanderarnold'),
	('Andrew Robertson', 'Scotland', 'andrew robertson'),
	('Andrew Robertson', 'Scotland', 'robertson'),
	('Ibrahima Konate', 'France', 'ibrahima konate'),
	('Ibrahima Konate', 'France', 'konate'),
	('Dominik Szoboszlai', 'Hungary', 'dominik szoboszlai'),
	('Dominik Szoboszlai', 'Hungary', 'szoboszlai'),
	('Ryan Gravenberch', 'Netherlands', 'gravenberch'),
	('Ryan Gravenberch', 'Netherlands', 'ryan gravenberch'),
	('Curtis Jones', 'England', 'curtis jones'),
	('Curtis Jones', 'England', 'jones'),
	('Luis Diaz', 'Colombia', 'diaz'),
	('Luis Diaz', 'Colombia', 'luis diaz'),
	('Federico Chiesa', 'Italy', 'chiesa'),
	('Federico Chiesa', 'Italy', 'federico chiesa'),
	('Hugo Ekitike', 'France', 'ekitike'),
	('Hugo Ekitike', 'France', 'hugo ekitike'),
	('Alexander Isak', 'Sweden', 'alexander isak'),
	('Alexander Isak', 'Sweden', 'isak'),
	('Jeremie Frimpong', 'Netherlands', 'frimpong'),
	('Jeremie Frimpong', 'Netherlands', 'jeremie frimpong'),
	('Milos Kerkez', 'Hungary', 'kerkez'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Milos Kerkez', 'Hungary', 'milos kerkez'),
	('Giorgi Mamardashvili', 'Georgia', 'giorgi mamardashvili'),
	('Giorgi Mamardashvili', 'Georgia', 'mamardashvili'),
	('Joe Gomez', 'England', 'gomez'),
	('Joe Gomez', 'England', 'joe gomez'),
	('Wataru Endo', 'Japan', 'endo'),
	('Wataru Endo', 'Japan', 'wataru endo'),
	('Harvey Elliott', 'England', 'elliott'),
	('Harvey Elliott', 'England', 'harvey elliott'),
	('Caoimhin Kelleher', 'Republic of Ireland', 'caoimhin kelleher'),
	('Caoimhin Kelleher', 'Republic of Ireland', 'kelleher'),
	('Rodri', 'Spain', 'rodri'),
	('Bernardo Silva', 'Portugal', 'bernardo silva'),
	('Bernardo Silva', 'Portugal', 'silva'),
	('Ruben Dias', 'Portugal', 'dias'),
	('Ruben Dias', 'Portugal', 'ruben dias'),
	('Josko Gvardiol', 'Croatia', 'gvardiol'),
	('Josko Gvardiol', 'Croatia', 'josko gvardiol'),
	('John Stones', 'England', 'john stones'),
	('John Stones', 'England', 'stones'),
	('Nathan Ake', 'Netherlands', 'ake'),
	('Nathan Ake', 'Netherlands', 'nathan ake'),
	('Jack Grealish', 'England', 'grealish'),
	('Jack Grealish', 'England', 'jack grealish'),
	('Savinho', 'Brazil', 'savinho'),
	('Jeremy Doku', 'Belgium', 'doku'),
	('Jeremy Doku', 'Belgium', 'jeremy doku'),
	('Rayan Cherki', 'France', 'cherki'),
	('Rayan Cherki', 'France', 'rayan cherki'),
	('Tijjani Reijnders', 'Netherlands', 'reijnders'),
	('Tijjani Reijnders', 'Netherlands', 'tijjani reijnders'),
	('Omar Marmoush', 'Egypt', 'marmoush'),
	('Omar Marmoush', 'Egypt', 'omar marmoush'),
	('Matheus Nunes', 'Portugal', 'matheus nunes'),
	('Matheus Nunes', 'Portugal', 'nunes'),
	('Rico Lewis', 'England', 'lewis'),
	('Rico Lewis', 'England', 'rico lewis'),
	('Nico Gonzalez', 'Spain', 'gonzalez'),
	('Nico Gonzalez', 'Spain', 'nico gonzalez'),
	('Kyle Walker', 'England', 'kyle walker'),
	('Kyle Walker', 'England', 'walker'),
	('James Trafford', 'England', 'james trafford'),
	('James Trafford', 'England', 'trafford'),
	('Oscar Bobb', 'Norway', 'bobb'),
	('Oscar Bobb', 'Norway', 'oscar bobb'),
	('Abdukodir Khusanov', 'Uzbekistan', 'abdukodir khusanov'),
	('Abdukodir Khusanov', 'Uzbekistan', 'khusanov'),
	('Matthijs de Ligt', 'Netherlands', 'de ligt'),
	('Matthijs de Ligt', 'Netherlands', 'matthijs de ligt'),
	('Lisandro Martinez', 'Argentina', 'lisandro martinez'),
	('Lisandro Martinez', 'Argentina', 'martinez'),
	('Harry Maguire', 'England', 'harry maguire'),
	('Harry Maguire', 'England', 'maguire'),
	('Luke Shaw', 'England', 'luke shaw'),
	('Luke Shaw', 'England', 'shaw'),
	('Diogo Dalot', 'Portugal', 'dalot'),
	('Diogo Dalot', 'Portugal', 'diogo dalot'),
	('Noussair Mazraoui', 'Morocco', 'mazraoui'),
	('Noussair Mazraoui', 'Morocco', 'noussair mazraoui'),
	('Kobbie Mainoo', 'England', 'kobbie mainoo'),
	('Kobbie Mainoo', 'England', 'mainoo'),
	('Mason Mount', 'England', 'mason mount'),
	('Mason Mount', 'England', 'mount'),
	('Bryan Mbeumo', 'Cameroon', 'bryan mbeumo'),
	('Bryan Mbeumo', 'Cameroon', 'mbeumo'),
	('Matheus Cunha', 'Brazil', 'cunha'),
	('Matheus Cunha', 'Brazil', 'matheus cunha'),
	('Benjamin Sesko', 'Slovenia', 'benjamin sesko'),
	('Benjamin Sesko', 'Slovenia', 'sesko'),
	('Amad Diallo', 'Ivory Coast', 'amad'),
	('Amad Diallo', 'Ivory Coast', 'amad diallo'),
	('Amad Diallo', 'Ivory Coast', 'diallo'),
	('Alejandro Garnacho', 'Argentina', 'alejandro garnacho'),
	('Alejandro Garnacho', 'Argentina', 'garnacho'),
	('Andre Onana', 'Cameroon', 'andre onana'),
	('Andre Onana', 'Cameroon', 'onana'),
	('Leny Yoro', 'France', 'leny yoro'),
	('Leny Yoro', 'France', 'yoro'),
	('Joshua Zirkzee', 'Netherlands', 'joshua zirkzee'),
	('Joshua Zirkzee', 'Netherlands', 'zirkzee'),
	('Patrick Dorgu', 'Denmark', 'dorgu'),
	('Patrick Dorgu', 'Denmark', 'patrick dorgu'),
	('Senne Lammens', 'Belgium', 'lammens'),
	('Senne Lammens', 'Belgium', 'senne lammens'),
	('Enzo Fernandez', 'Argentina', 'enzo fernandez'),
	('Enzo Fernandez', 'Argentina', 'fernandez'),
	('Moises Caicedo', 'Ecuador', 'caicedo'),
	('Moises Caicedo', 'Ecuador', 'moises caicedo'),
	('Reece James', 'England', 'james'),
	('Reece James', 'England', 'reece james'),
	('Levi Colwill', 'England', 'colwill'),
	('Levi Colwill', 'England', 'levi colwill'),
	('Wesley Fofana', 'France', 'fofana'),
	('Wesley Fofana', 'France', 'wesley fofana'),
	('Trevoh Chalobah', 'England', 'chalobah'),
	('Trevoh Chalobah', 'England', 'trevoh chalobah'),
	('Marc Cucurella', 'Spain', 'cucurella'),
	('Marc Cucurella', 'Spain', 'marc cucurella'),
	('Malo Gusto', 'France', 'gusto'),
	('Malo Gusto', 'France', 'malo gusto'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Robert Sanchez', 'Spain', 'robert sanchez'),
	('Robert Sanchez', 'Spain', 'sanchez'),
	('Nicolas Jackson', 'Senegal', 'jackson'),
	('Nicolas Jackson', 'Senegal', 'nicolas jackson'),
	('Christopher Nkunku', 'France', 'christopher nkunku'),
	('Christopher Nkunku', 'France', 'nkunku'),
	('Pedro Neto', 'Portugal', 'neto'),
	('Pedro Neto', 'Portugal', 'pedro neto'),
	('Jamie Gittens', 'England', 'gittens'),
	('Jamie Gittens', 'England', 'jamie gittens'),
	('Joao Pedro', 'Brazil', 'joao pedro'),
	('Joao Pedro', 'Brazil', 'pedro'),
	('Estevao', 'Brazil', 'estevao'),
	('Estevao', 'Brazil', 'estevao willian'),
	('Romeo Lavia', 'Belgium', 'lavia'),
	('Romeo Lavia', 'Belgium', 'romeo lavia'),
	('Liam Delap', 'England', 'delap'),
	('Liam Delap', 'England', 'liam delap'),
	('Tosin Adarabioyo', 'England', 'adarabioyo'),
	('Tosin Adarabioyo', 'England', 'tosin adarabioyo'),
	('Raheem Sterling', 'England', 'raheem sterling'),
	('Raheem Sterling', 'England', 'sterling'),
	('Cesar Azpilicueta', 'Spain', 'azpilicueta'),
	('Cesar Azpilicueta', 'Spain', 'cesar azpilicueta'),
	('Eden Hazard', 'Belgium', 'eden hazard'),
	('Eden Hazard', 'Belgium', 'hazard'),
	('James Maddison', 'England', 'james maddison'),
	('James Maddison', 'England', 'maddison'),
	('Dejan Kulusevski', 'Sweden', 'dejan kulusevski'),
	('Dejan Kulusevski', 'Sweden', 'kulusevski'),
	('Dominic Solanke', 'England', 'dominic solanke'),
	('Dominic Solanke', 'England', 'solanke'),
	('Brennan Johnson', 'Wales', 'brennan johnson'),
	('Brennan Johnson', 'Wales', 'johnson'),
	('Richarlison', 'Brazil', 'richarlison'),
	('Destiny Udogie', 'Italy', 'destiny udogie'),
	('Destiny Udogie', 'Italy', 'udogie'),
	('Pedro Porro', 'Spain', 'pedro porro'),
	('Pedro Porro', 'Spain', 'porro'),
	('Micky van de Ven', 'Netherlands', 'micky van de ven'),
	('Micky van de Ven', 'Netherlands', 'van de ven'),
	('Cristian Romero', 'Argentina', 'cristian romero'),
	('Cristian Romero', 'Argentina', 'romero'),
	('Guglielmo Vicario', 'Italy', 'guglielmo vicario'),
	('Guglielmo Vicario', 'Italy', 'vicario'),
	('Yves Bissouma', 'Mali', 'bissouma'),
	('Yves Bissouma', 'Mali', 'yves bissouma'),
	('Pape Matar Sarr', 'Senegal', 'pape matar sarr'),
	('Pape Matar Sarr', 'Senegal', 'sarr'),
	('Rodrigo Bentancur', 'Uruguay', 'bentancur'),
	('Rodrigo Bentancur', 'Uruguay', 'rodrigo bentancur'),
	('Wilson Odobert', 'France', 'odobert'),
	('Wilson Odobert', 'France', 'wilson odobert'),
	('Mathys Tel', 'France', 'mathys tel'),
	('Mathys Tel', 'France', 'tel'),
	('Mohammed Kudus', 'Ghana', 'kudus'),
	('Mohammed Kudus', 'Ghana', 'mohammed kudus'),
	('Xavi Simons', 'Netherlands', 'simons'),
	('Xavi Simons', 'Netherlands', 'xavi simons'),
	('Randal Kolo Muani', 'France', 'muani'),
	('Randal Kolo Muani', 'France', 'randal kolo muani'),
	('Archie Gray', 'England', 'archie gray'),
	('Archie Gray', 'England', 'gray'),
	('Lucas Bergvall', 'Sweden', 'bergvall'),
	('Lucas Bergvall', 'Sweden', 'lucas bergvall'),
	('Joao Palhinha', 'Portugal', 'joao palhinha'),
	('Joao Palhinha', 'Portugal', 'palhinha'),
	('Bruno Guimaraes', 'Brazil', 'bruno guimaraes'),
	('Bruno Guimaraes', 'Brazil', 'guimaraes'),
	('Sandro Tonali', 'Italy', 'sandro tonali'),
	('Sandro Tonali', 'Italy', 'tonali'),
	('Joelinton', 'Brazil', 'joelinton'),
	('Anthony Gordon', 'England', 'anthony gordon'),
	('Anthony Gordon', 'England', 'gordon'),
	('Harvey Barnes', 'England', 'barnes'),
	('Harvey Barnes', 'England', 'harvey barnes'),
	('Jacob Murphy', 'England', 'jacob murphy'),
	('Jacob Murphy', 'England', 'murphy'),
	('Nick Pope', 'England', 'nick pope'),
	('Nick Pope', 'England', 'pope'),
	('Aaron Ramsdale', 'England', 'aaron ramsdale'),
	('Aaron Ramsdale', 'England', 'ramsdale'),
	('Sven Botman', 'Netherlands', 'botman'),
	('Sven Botman', 'Netherlands', 'sven botman'),
	('Fabian Schar', 'Switzerland', 'fabian schar'),
	('Fabian Schar', 'Switzerland', 'schar'),
	('Kieran Trippier', 'England', 'kieran trippier'),
	('Kieran Trippier', 'England', 'trippier'),
	('Dan Burn', 'England', 'burn'),
	('Dan Burn', 'England', 'dan burn'),
	('Tino Livramento', 'England', 'livramento'),
	('Tino Livramento', 'England', 'tino livramento'),
	('Nick Woltemade', 'Germany', 'nick woltemade'),
	('Nick Woltemade', 'Germany', 'woltemade'),
	('Yoane Wissa', 'DR Congo', 'wissa'),
	('Yoane Wissa', 'DR Congo', 'yoane wissa'),
	('Anthony Elanga', 'Sweden', 'anthony elanga'),
	('Anthony Elanga', 'Sweden', 'elanga'),
	('Malick Thiaw', 'Germany', 'malick thiaw'),
	('Malick Thiaw', 'Germany', 'thiaw'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Emiliano Martinez', 'Argentina', 'dibu'),
	('Emiliano Martinez', 'Argentina', 'emiliano martinez'),
	('Emiliano Martinez', 'Argentina', 'martinez'),
	('Ollie Watkins', 'England', 'ollie watkins'),
	('Ollie Watkins', 'England', 'watkins'),
	('Morgan Rogers', 'England', 'morgan rogers'),
	('Morgan Rogers', 'England', 'rogers'),
	('Youri Tielemans', 'Belgium', 'tielemans'),
	('Youri Tielemans', 'Belgium', 'youri tielemans'),
	('John McGinn', 'Scotland', 'john mcginn'),
	('John McGinn', 'Scotland', 'mcginn'),
	('Boubacar Kamara', 'France', 'boubacar kamara'),
	('Boubacar Kamara', 'France', 'kamara'),
	('Amadou Onana', 'Belgium', 'amadou onana'),
	('Amadou Onana', 'Belgium', 'onana'),
	('Ezri Konsa', 'England', 'ezri konsa'),
	('Ezri Konsa', 'England', 'konsa'),
	('Pau Torres', 'Spain', 'pau torres'),
	('Pau Torres', 'Spain', 'torres'),
	('Matty Cash', 'Poland', 'cash'),
	('Matty Cash', 'Poland', 'matty cash'),
	('Lucas Digne', 'France', 'digne'),
	('Lucas Digne', 'France', 'lucas digne'),
	('Emiliano Buendia', 'Argentina', 'buendia'),
	('Emiliano Buendia', 'Argentina', 'emiliano buendia'),
	('Donyell Malen', 'Netherlands', 'donyell malen'),
	('Donyell Malen', 'Netherlands', 'malen'),
	('Evann Guessand', 'Ivory Coast', 'evann guessand'),
	('Evann Guessand', 'Ivory Coast', 'guessand'),
	('Leon Bailey', 'Jamaica', 'bailey'),
	('Leon Bailey', 'Jamaica', 'leon bailey'),
	('Jarrod Bowen', 'England', 'bowen'),
	('Jarrod Bowen', 'England', 'jarrod bowen'),
	('Lucas Paqueta', 'Brazil', 'lucas paqueta'),
	('Lucas Paqueta', 'Brazil', 'paqueta'),
	('James Ward-Prowse', 'England', 'james wardprowse'),
	('James Ward-Prowse', 'England', 'wardprowse'),
	('Niclas Fullkrug', 'Germany', 'fullkrug'),
	('Niclas Fullkrug', 'Germany', 'niclas fullkrug'),
	('Max Kilman', 'England', 'kilman'),
	('Max Kilman', 'England', 'max kilman'),
	('Jean-Philippe Mateta', 'France', 'jeanphilippe mateta'),
	('Jean-Philippe Mateta', 'France', 'mateta'),
	('Marc Guehi', 'England', 'guehi'),
	('Marc Guehi', 'England', 'marc guehi'),
	('Adam Wharton', 'England', 'adam wharton'),
	('Adam Wharton', 'England', 'wharton'),
	('Daichi Kamada', 'Japan', 'daichi kamada'),
	('Daichi Kamada', 'Japan', 'kamada'),
	('Ismaila Sarr', 'Senegal', 'ismaila sarr'),
	('Ismaila Sarr', 'Senegal', 'sarr'),
	('Daniel Munoz', 'Colombia', 'daniel munoz'),
	('Daniel Munoz', 'Colombia', 'munoz'),
	('Dean Henderson', 'England', 'dean henderson'),
	('Dean Henderson', 'England', 'henderson'),
	('Chris Richards', 'United States', 'chris richards'),
	('Chris Richards', 'United States', 'richards'),
	('Jordan Pickford', 'England', 'jordan pickford'),
	('Jordan Pickford', 'England', 'pickford'),
	('Idrissa Gueye', 'Senegal', 'gueye'),
	('Idrissa Gueye', 'Senegal', 'idrissa gueye'),
	('Dwight McNeil', 'England', 'dwight mcneil'),
	('Dwight McNeil', 'England', 'mcneil'),
	('Iliman Ndiaye', 'Senegal', 'iliman ndiaye'),
	('Iliman Ndiaye', 'Senegal', 'ndiaye'),
	('Beto', 'Portugal', 'beto'),
	('James Tarkowski', 'England', 'james tarkowski'),
	('James Tarkowski', 'England', 'tarkowski'),
	('Jarrad Branthwaite', 'England', 'branthwaite'),
	('Jarrad Branthwaite', 'England', 'jarrad branthwaite'),
	('Bernd Leno', 'Germany', 'bernd leno'),
	('Bernd Leno', 'Germany', 'leno'),
	('Antonee Robinson', 'United States', 'antonee robinson'),
	('Antonee Robinson', 'United States', 'robinson'),
	('Joachim Andersen', 'Denmark', 'andersen'),
	('Joachim Andersen', 'Denmark', 'joachim andersen'),
	('Emile Smith Rowe', 'England', 'emile smith rowe'),
	('Emile Smith Rowe', 'England', 'rowe'),
	('Alex Iwobi', 'Nigeria', 'alex iwobi'),
	('Alex Iwobi', 'Nigeria', 'iwobi'),
	('Raul Jimenez', 'Mexico', 'jimenez'),
	('Raul Jimenez', 'Mexico', 'raul jimenez'),
	('Harry Wilson', 'Wales', 'harry wilson'),
	('Harry Wilson', 'Wales', 'wilson'),
	('Bart Verbruggen', 'Netherlands', 'bart verbruggen'),
	('Bart Verbruggen', 'Netherlands', 'verbruggen'),
	('Lewis Dunk', 'England', 'dunk'),
	('Lewis Dunk', 'England', 'lewis dunk'),
	('Jan Paul van Hecke', 'Netherlands', 'jan paul van hecke'),
	('Jan Paul van Hecke', 'Netherlands', 'van hecke'),
	('Carlos Baleba', 'Cameroon', 'baleba'),
	('Carlos Baleba', 'Cameroon', 'carlos baleba'),
	('Yasin Ayari', 'Sweden', 'ayari'),
	('Yasin Ayari', 'Sweden', 'yasin ayari'),
	('Georginio Rutter', 'France', 'georginio rutter'),
	('Georginio Rutter', 'France', 'rutter'),
	('Danny Welbeck', 'England', 'danny welbeck'),
	('Danny Welbeck', 'England', 'welbeck'),
	('Igor Thiago', 'Brazil', 'igor thiago'),
	('Igor Thiago', 'Brazil', 'thiago'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Mikkel Damsgaard', 'Denmark', 'damsgaard'),
	('Mikkel Damsgaard', 'Denmark', 'mikkel damsgaard'),
	('Nathan Collins', 'Republic of Ireland', 'collins'),
	('Nathan Collins', 'Republic of Ireland', 'nathan collins'),
	('Keane Lewis-Potter', 'England', 'keane lewispotter'),
	('Keane Lewis-Potter', 'England', 'lewispotter'),
	('Kevin Schade', 'Germany', 'kevin schade'),
	('Kevin Schade', 'Germany', 'schade'),
	('Antoine Semenyo', 'Ghana', 'antoine semenyo'),
	('Antoine Semenyo', 'Ghana', 'semenyo'),
	('Justin Kluivert', 'Netherlands', 'justin kluivert'),
	('Justin Kluivert', 'Netherlands', 'kluivert'),
	('Marcus Tavernier', 'England', 'marcus tavernier'),
	('Marcus Tavernier', 'England', 'tavernier'),
	('Ryan Christie', 'Scotland', 'christie'),
	('Ryan Christie', 'Scotland', 'ryan christie'),
	('Adrien Truffert', 'France', 'adrien truffert'),
	('Adrien Truffert', 'France', 'truffert'),
	('Djordje Petrovic', 'Serbia', 'djordje petrovic'),
	('Djordje Petrovic', 'Serbia', 'petrovic'),
	('Ilya Zabarnyi', 'Ukraine', 'ilya zabarnyi'),
	('Ilya Zabarnyi', 'Ukraine', 'zabarnyi'),
	('Dean Huijsen', 'Spain', 'dean huijsen'),
	('Dean Huijsen', 'Spain', 'huijsen'),
	('Jorgen Strand Larsen', 'Norway', 'jorgen strand larsen'),
	('Jorgen Strand Larsen', 'Norway', 'larsen'),
	('Jose Sa', 'Portugal', 'jose sa'),
	('Marshall Munetsi', 'Zimbabwe', 'marshall munetsi'),
	('Marshall Munetsi', 'Zimbabwe', 'munetsi'),
	('Jean-Ricner Bellegarde', 'France', 'bellegarde'),
	('Jean-Ricner Bellegarde', 'France', 'jeanricner bellegarde'),
	('Morgan Gibbs-White', 'England', 'gibbswhite'),
	('Morgan Gibbs-White', 'England', 'morgan gibbswhite'),
	('Chris Wood', 'New Zealand', 'chris wood'),
	('Chris Wood', 'New Zealand', 'wood'),
	('Callum Hudson-Odoi', 'England', 'callum hudsonodoi'),
	('Callum Hudson-Odoi', 'England', 'hudsonodoi'),
	('Ola Aina', 'Nigeria', 'aina'),
	('Ola Aina', 'Nigeria', 'ola aina'),
	('Murillo', 'Brazil', 'murillo'),
	('Nikola Milenkovic', 'Serbia', 'milenkovic'),
	('Nikola Milenkovic', 'Serbia', 'nikola milenkovic'),
	('Matz Sels', 'Belgium', 'matz sels'),
	('Matz Sels', 'Belgium', 'sels'),
	('Elliot Anderson', 'England', 'anderson'),
	('Elliot Anderson', 'England', 'elliot anderson'),
	('Dan Ndoye', 'Switzerland', 'dan ndoye'),
	('Dan Ndoye', 'Switzerland', 'ndoye'),
	('Omari Hutchinson', 'England', 'hutchinson'),
	('Omari Hutchinson', 'England', 'omari hutchinson'),
	('Illan Meslier', 'France', 'illan meslier'),
	('Illan Meslier', 'France', 'meslier'),
	('Wilfried Gnonto', 'Italy', 'gnonto'),
	('Wilfried Gnonto', 'Italy', 'wilfried gnonto'),
	('Ethan Ampadu', 'Wales', 'ampadu'),
	('Ethan Ampadu', 'Wales', 'ethan ampadu'),
	('Ao Tanaka', 'Japan', 'ao tanaka'),
	('Ao Tanaka', 'Japan', 'tanaka'),
	('Joel Piroe', 'Netherlands', 'joel piroe'),
	('Joel Piroe', 'Netherlands', 'piroe'),
	('Dominic Calvert-Lewin', 'England', 'calvertlewin'),
	('Dominic Calvert-Lewin', 'England', 'dominic calvertlewin'),
	('Anton Stach', 'Germany', 'anton stach'),
	('Anton Stach', 'Germany', 'stach'),
	('Lukas Nmecha', 'Germany', 'lukas nmecha'),
	('Lukas Nmecha', 'Germany', 'nmecha'),
	('Noah Okafor', 'Switzerland', 'noah okafor'),
	('Noah Okafor', 'Switzerland', 'okafor'),
	('Jayden Bogle', 'England', 'bogle'),
	('Jayden Bogle', 'England', 'jayden bogle'),
	('Pascal Struijk', 'Netherlands', 'pascal struijk'),
	('Pascal Struijk', 'Netherlands', 'struijk'),
	('Josh Cullen', 'Republic of Ireland', 'cullen'),
	('Josh Cullen', 'Republic of Ireland', 'josh cullen'),
	('Zian Flemming', 'Netherlands', 'flemming'),
	('Zian Flemming', 'Netherlands', 'zian flemming'),
	('Jaidon Anthony', 'England', 'anthony'),
	('Jaidon Anthony', 'England', 'jaidon anthony'),
	('Lyle Foster', 'South Africa', 'foster'),
	('Lyle Foster', 'South Africa', 'lyle foster'),
	('Martin Dubravka', 'Slovakia', 'dubravka'),
	('Martin Dubravka', 'Slovakia', 'martin dubravka'),
	('Granit Xhaka', 'Switzerland', 'granit xhaka'),
	('Granit Xhaka', 'Switzerland', 'xhaka'),
	('Habib Diarra', 'Senegal', 'diarra'),
	('Habib Diarra', 'Senegal', 'habib diarra'),
	('Wilson Isidor', 'France', 'isidor'),
	('Wilson Isidor', 'France', 'wilson isidor'),
	('Eliezer Mayenda', 'Spain', 'eliezer mayenda'),
	('Eliezer Mayenda', 'Spain', 'mayenda'),
	('Robin Roefs', 'Netherlands', 'robin roefs'),
	('Robin Roefs', 'Netherlands', 'roefs'),
	('Reinildo', 'Mozambique', 'reinildo'),
	('Omar Alderete', 'Paraguay', 'alderete'),
	('Omar Alderete', 'Paraguay', 'omar alderete'),
	('Nordi Mukiele', 'France', 'mukiele'),
	('Nordi Mukiele', 'France', 'nordi mukiele'),
	('Antonio Rudiger', 'Germany', 'antonio rudiger'),
	('Antonio Rudiger', 'Germany', 'rudiger'),
	('David Alaba', 'Austria', 'alaba'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('David Alaba', 'Austria', 'david alaba'),
	('Eder Militao', 'Brazil', 'eder militao'),
	('Eder Militao', 'Brazil', 'militao'),
	('Ferland Mendy', 'France', 'ferland mendy'),
	('Ferland Mendy', 'France', 'mendy'),
	('Dani Carvajal', 'Spain', 'carvajal'),
	('Dani Carvajal', 'Spain', 'dani carvajal'),
	('Alvaro Carreras', 'Spain', 'alvaro carreras'),
	('Alvaro Carreras', 'Spain', 'carreras'),
	('Aurelien Tchouameni', 'France', 'aurelien tchouameni'),
	('Aurelien Tchouameni', 'France', 'tchouameni'),
	('Eduardo Camavinga', 'France', 'camavinga'),
	('Eduardo Camavinga', 'France', 'eduardo camavinga'),
	('Arda Guler', 'Turkey', 'arda guler'),
	('Arda Guler', 'Turkey', 'guler'),
	('Brahim Diaz', 'Morocco', 'brahim diaz'),
	('Brahim Diaz', 'Morocco', 'diaz'),
	('Endrick', 'Brazil', 'endrick'),
	('Gonzalo Garcia', 'Spain', 'garcia'),
	('Gonzalo Garcia', 'Spain', 'gonzalo garcia'),
	('Franco Mastantuono', 'Argentina', 'franco mastantuono'),
	('Franco Mastantuono', 'Argentina', 'mastantuono'),
	('Andriy Lunin', 'Ukraine', 'andriy lunin'),
	('Andriy Lunin', 'Ukraine', 'lunin'),
	('Joan Garcia', 'Spain', 'garcia'),
	('Joan Garcia', 'Spain', 'joan garcia'),
	('Wojciech Szczesny', 'Poland', 'szczesny'),
	('Wojciech Szczesny', 'Poland', 'wojciech szczesny'),
	('Jules Kounde', 'France', 'jules kounde'),
	('Jules Kounde', 'France', 'kounde'),
	('Ronald Araujo', 'Uruguay', 'araujo'),
	('Ronald Araujo', 'Uruguay', 'ronald araujo'),
	('Pau Cubarsi', 'Spain', 'cubarsi'),
	('Pau Cubarsi', 'Spain', 'pau cubarsi'),
	('Alejandro Balde', 'Spain', 'alejandro balde'),
	('Alejandro Balde', 'Spain', 'balde'),
	('Eric Garcia', 'Spain', 'eric garcia'),
	('Eric Garcia', 'Spain', 'garcia'),
	('Frenkie de Jong', 'Netherlands', 'de jong'),
	('Frenkie de Jong', 'Netherlands', 'frenkie de jong'),
	('Dani Olmo', 'Spain', 'dani olmo'),
	('Dani Olmo', 'Spain', 'olmo'),
	('Fermin Lopez', 'Spain', 'fermin lopez'),
	('Fermin Lopez', 'Spain', 'lopez'),
	('Ferran Torres', 'Spain', 'ferran torres'),
	('Ferran Torres', 'Spain', 'torres'),
	('Alexander Sorloth', 'Norway', 'alexander sorloth'),
	('Alexander Sorloth', 'Norway', 'sorloth'),
	('Marcos Llorente', 'Spain', 'llorente'),
	('Marcos Llorente', 'Spain', 'marcos llorente'),
	('Rodrigo De Paul', 'Argentina', 'de paul'),
	('Rodrigo De Paul', 'Argentina', 'rodrigo de paul'),
	('Koke', 'Spain', 'koke'),
	('Pablo Barrios', 'Spain', 'barrios'),
	('Pablo Barrios', 'Spain', 'pablo barrios'),
	('Conor Gallagher', 'England', 'conor gallagher'),
	('Conor Gallagher', 'England', 'gallagher'),
	('Robin Le Normand', 'Spain', 'normand'),
	('Robin Le Normand', 'Spain', 'robin le normand'),
	('Jose Maria Gimenez', 'Uruguay', 'gimenez'),
	('Jose Maria Gimenez', 'Uruguay', 'jose maria gimenez'),
	('Clement Lenglet', 'France', 'clement lenglet'),
	('Clement Lenglet', 'France', 'lenglet'),
	('David Hancko', 'Slovakia', 'david hancko'),
	('David Hancko', 'Slovakia', 'hancko'),
	('Thiago Almada', 'Argentina', 'almada'),
	('Thiago Almada', 'Argentina', 'thiago almada'),
	('Alex Baena', 'Spain', 'alex baena'),
	('Alex Baena', 'Spain', 'baena'),
	('Giacomo Raspadori', 'Italy', 'giacomo raspadori'),
	('Giacomo Raspadori', 'Italy', 'raspadori'),
	('Mikel Oyarzabal', 'Spain', 'mikel oyarzabal'),
	('Mikel Oyarzabal', 'Spain', 'oyarzabal'),
	('Nico Williams', 'Spain', 'nico williams'),
	('Nico Williams', 'Spain', 'williams'),
	('Inaki Williams', 'Ghana', 'inaki williams'),
	('Inaki Williams', 'Ghana', 'williams'),
	('Unai Simon', 'Spain', 'simon'),
	('Unai Simon', 'Spain', 'unai simon'),
	('Aymeric Laporte', 'Spain', 'aymeric laporte'),
	('Aymeric Laporte', 'Spain', 'laporte'),
	('Alex Remiro', 'Spain', 'alex remiro'),
	('Alex Remiro', 'Spain', 'remiro'),
	('Isco', 'Spain', 'isco'),
	('Giovani Lo Celso', 'Argentina', 'celso'),
	('Giovani Lo Celso', 'Argentina', 'giovani lo celso'),
	('Antony', 'Brazil', 'antony'),
	('Gerard Moreno', 'Spain', 'gerard moreno'),
	('Gerard Moreno', 'Spain', 'moreno'),
	('Ayoze Perez', 'Spain', 'ayoze perez'),
	('Ayoze Perez', 'Spain', 'perez'),
	('Jose Gaya', 'Spain', 'gaya'),
	('Jose Gaya', 'Spain', 'jose gaya'),
	('Hugo Duro', 'Spain', 'duro'),
	('Hugo Duro', 'Spain', 'hugo duro'),
	('Santi Cazorla', 'Spain', 'cazorla'),
	('Santi Cazorla', 'Spain', 'santi cazorla'),
	('Yann Sommer', 'Switzerland', 'sommer'),
	('Yann Sommer', 'Switzerland', 'yann sommer'),
	('Alessandro Bastoni', 'Italy', 'alessandro bastoni'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Alessandro Bastoni', 'Italy', 'bastoni'),
	('Benjamin Pavard', 'France', 'benjamin pavard'),
	('Benjamin Pavard', 'France', 'pavard'),
	('Stefan de Vrij', 'Netherlands', 'de vrij'),
	('Stefan de Vrij', 'Netherlands', 'stefan de vrij'),
	('Federico Dimarco', 'Italy', 'dimarco'),
	('Federico Dimarco', 'Italy', 'federico dimarco'),
	('Nicolo Barella', 'Italy', 'barella'),
	('Nicolo Barella', 'Italy', 'nicolo barella'),
	('Hakan Calhanoglu', 'Turkey', 'calhanoglu'),
	('Hakan Calhanoglu', 'Turkey', 'hakan calhanoglu'),
	('Henrikh Mkhitaryan', 'Armenia', 'henrikh mkhitaryan'),
	('Henrikh Mkhitaryan', 'Armenia', 'mkhitaryan'),
	('Piotr Zielinski', 'Poland', 'piotr zielinski'),
	('Piotr Zielinski', 'Poland', 'zielinski'),
	('Marcus Thuram', 'France', 'marcus thuram'),
	('Marcus Thuram', 'France', 'thuram'),
	('Francesco Pio Esposito', 'Italy', 'esposito'),
	('Francesco Pio Esposito', 'Italy', 'francesco pio esposito'),
	('Petar Sucic', 'Croatia', 'petar sucic'),
	('Petar Sucic', 'Croatia', 'sucic'),
	('Mike Maignan', 'France', 'maignan'),
	('Mike Maignan', 'France', 'mike maignan'),
	('Christian Pulisic', 'United States', 'christian pulisic'),
	('Christian Pulisic', 'United States', 'pulisic'),
	('Rafael Leao', 'Portugal', 'leao'),
	('Rafael Leao', 'Portugal', 'rafael leao'),
	('Theo Hernandez', 'France', 'hernandez'),
	('Theo Hernandez', 'France', 'theo hernandez'),
	('Fikayo Tomori', 'England', 'fikayo tomori'),
	('Fikayo Tomori', 'England', 'tomori'),
	('Matteo Gabbia', 'Italy', 'gabbia'),
	('Matteo Gabbia', 'Italy', 'matteo gabbia'),
	('Youssouf Fofana', 'France', 'fofana'),
	('Youssouf Fofana', 'France', 'youssouf fofana'),
	('Adrien Rabiot', 'France', 'adrien rabiot'),
	('Adrien Rabiot', 'France', 'rabiot'),
	('Santiago Gimenez', 'Mexico', 'gimenez'),
	('Santiago Gimenez', 'Mexico', 'santiago gimenez'),
	('Strahinja Pavlovic', 'Serbia', 'pavlovic'),
	('Strahinja Pavlovic', 'Serbia', 'strahinja pavlovic'),
	('Alexis Saelemaekers', 'Belgium', 'alexis saelemaekers'),
	('Alexis Saelemaekers', 'Belgium', 'saelemaekers'),
	('Ruben Loftus-Cheek', 'England', 'loftuscheek'),
	('Ruben Loftus-Cheek', 'England', 'ruben loftuscheek'),
	('Samuele Ricci', 'Italy', 'ricci'),
	('Samuele Ricci', 'Italy', 'samuele ricci'),
	('Michele Di Gregorio', 'Italy', 'di gregorio'),
	('Michele Di Gregorio', 'Italy', 'michele di gregorio'),
	('Gleison Bremer', 'Brazil', 'bremer'),
	('Gleison Bremer', 'Brazil', 'gleison bremer'),
	('Pierre Kalulu', 'France', 'kalulu'),
	('Pierre Kalulu', 'France', 'pierre kalulu'),
	('Andrea Cambiaso', 'Italy', 'andrea cambiaso'),
	('Andrea Cambiaso', 'Italy', 'cambiaso'),
	('Manuel Locatelli', 'Italy', 'locatelli'),
	('Manuel Locatelli', 'Italy', 'manuel locatelli'),
	('Khephren Thuram', 'France', 'khephren thuram'),
	('Khephren Thuram', 'France', 'thuram'),
	('Teun Koopmeiners', 'Netherlands', 'koopmeiners'),
	('Teun Koopmeiners', 'Netherlands', 'teun koopmeiners'),
	('Kenan Yildiz', 'Turkey', 'kenan yildiz'),
	('Kenan Yildiz', 'Turkey', 'yildiz'),
	('Dusan Vlahovic', 'Serbia', 'dusan vlahovic'),
	('Dusan Vlahovic', 'Serbia', 'vlahovic'),
	('Jonathan David', 'Canada', 'david'),
	('Jonathan David', 'Canada', 'jonathan david'),
	('Francisco Conceicao', 'Portugal', 'conceicao'),
	('Francisco Conceicao', 'Portugal', 'francisco conceicao'),
	('Lois Openda', 'Belgium', 'lois openda'),
	('Lois Openda', 'Belgium', 'openda'),
	('Edon Zhegrova', 'Kosovo', 'edon zhegrova'),
	('Edon Zhegrova', 'Kosovo', 'zhegrova'),
	('Federico Gatti', 'Italy', 'federico gatti'),
	('Federico Gatti', 'Italy', 'gatti'),
	('Alex Meret', 'Italy', 'alex meret'),
	('Alex Meret', 'Italy', 'meret'),
	('Vanja Milinkovic-Savic', 'Serbia', 'milinkovicsavic'),
	('Vanja Milinkovic-Savic', 'Serbia', 'vanja milinkovicsavic'),
	('Giovanni Di Lorenzo', 'Italy', 'di lorenzo'),
	('Giovanni Di Lorenzo', 'Italy', 'giovanni di lorenzo'),
	('Amir Rrahmani', 'Kosovo', 'amir rrahmani'),
	('Amir Rrahmani', 'Kosovo', 'rrahmani'),
	('Sam Beukema', 'Netherlands', 'beukema'),
	('Sam Beukema', 'Netherlands', 'sam beukema'),
	('Stanislav Lobotka', 'Slovakia', 'lobotka'),
	('Stanislav Lobotka', 'Slovakia', 'stanislav lobotka'),
	('Andre-Frank Zambo Anguissa', 'Cameroon', 'andrefrank zambo anguissa'),
	('Andre-Frank Zambo Anguissa', 'Cameroon', 'anguissa'),
	('Andre-Frank Zambo Anguissa', 'Cameroon', 'zambo anguissa'),
	('Matteo Politano', 'Italy', 'matteo politano'),
	('Matteo Politano', 'Italy', 'politano'),
	('David Neres', 'Brazil', 'david neres'),
	('David Neres', 'Brazil', 'neres'),
	('Romelu Lukaku', 'Belgium', 'lukaku'),
	('Romelu Lukaku', 'Belgium', 'romelu lukaku'),
	('Noa Lang', 'Netherlands', 'lang'),
	('Noa Lang', 'Netherlands', 'noa lang'),
	('Paulo Dybala', 'Argentina', 'dybala'),
	('Paulo Dybala', 'Argentina', 'paulo dybala'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Gianluca Mancini', 'Italy', 'gianluca mancini'),
	('Gianluca Mancini', 'Italy', 'mancini'),
	('Evan Ndicka', 'Ivory Coast', 'evan ndicka'),
	('Evan Ndicka', 'Ivory Coast', 'ndicka'),
	('Bryan Cristante', 'Italy', 'bryan cristante'),
	('Bryan Cristante', 'Italy', 'cristante'),
	('Manu Kone', 'France', 'kone'),
	('Manu Kone', 'France', 'manu kone'),
	('Matias Soule', 'Argentina', 'matias soule'),
	('Matias Soule', 'Argentina', 'soule'),
	('Artem Dovbyk', 'Ukraine', 'artem dovbyk'),
	('Artem Dovbyk', 'Ukraine', 'dovbyk'),
	('Mile Svilar', 'Serbia', 'mile svilar'),
	('Mile Svilar', 'Serbia', 'svilar'),
	('Lorenzo Pellegrini', 'Italy', 'lorenzo pellegrini'),
	('Lorenzo Pellegrini', 'Italy', 'pellegrini'),
	('Mattia Zaccagni', 'Italy', 'mattia zaccagni'),
	('Mattia Zaccagni', 'Italy', 'zaccagni'),
	('Valentin Castellanos', 'Argentina', 'castellanos'),
	('Valentin Castellanos', 'Argentina', 'valentin castellanos'),
	('Ivan Provedel', 'Italy', 'ivan provedel'),
	('Ivan Provedel', 'Italy', 'provedel'),
	('Alessio Romagnoli', 'Italy', 'alessio romagnoli'),
	('Alessio Romagnoli', 'Italy', 'romagnoli'),
	('Mateo Guendouzi', 'France', 'guendouzi'),
	('Mateo Guendouzi', 'France', 'mateo guendouzi'),
	('Ademola Lookman', 'Nigeria', 'ademola lookman'),
	('Ademola Lookman', 'Nigeria', 'lookman'),
	('Gianluca Scamacca', 'Italy', 'gianluca scamacca'),
	('Gianluca Scamacca', 'Italy', 'scamacca'),
	('Mario Pasalic', 'Croatia', 'mario pasalic'),
	('Mario Pasalic', 'Croatia', 'pasalic'),
	('Marten de Roon', 'Netherlands', 'de roon'),
	('Marten de Roon', 'Netherlands', 'marten de roon'),
	('Charles De Ketelaere', 'Belgium', 'charles de ketelaere'),
	('Charles De Ketelaere', 'Belgium', 'de ketelaere'),
	('Berat Djimsiti', 'Albania', 'berat djimsiti'),
	('Berat Djimsiti', 'Albania', 'djimsiti'),
	('Marco Carnesecchi', 'Italy', 'carnesecchi'),
	('Marco Carnesecchi', 'Italy', 'marco carnesecchi'),
	('Giorgio Scalvini', 'Italy', 'giorgio scalvini'),
	('Giorgio Scalvini', 'Italy', 'scalvini'),
	('Moise Kean', 'Italy', 'kean'),
	('Moise Kean', 'Italy', 'moise kean'),
	('Albert Gudmundsson', 'Iceland', 'albert gudmundsson'),
	('Albert Gudmundsson', 'Iceland', 'gudmundsson'),
	('Robin Gosens', 'Germany', 'gosens'),
	('Robin Gosens', 'Germany', 'robin gosens'),
	('Edin Dzeko', 'Bosnia and Herzegovina', 'dzeko'),
	('Edin Dzeko', 'Bosnia and Herzegovina', 'edin dzeko'),
	('Nico Paz', 'Argentina', 'nico paz'),
	('Nico Paz', 'Argentina', 'paz'),
	('Alvaro Morata', 'Spain', 'alvaro morata'),
	('Alvaro Morata', 'Spain', 'morata'),
	('Riccardo Orsolini', 'Italy', 'orsolini'),
	('Riccardo Orsolini', 'Italy', 'riccardo orsolini'),
	('Santiago Castro', 'Argentina', 'castro'),
	('Santiago Castro', 'Argentina', 'santiago castro'),
	('Lewis Ferguson', 'Scotland', 'ferguson'),
	('Lewis Ferguson', 'Scotland', 'lewis ferguson'),
	('Jhon Lucumi', 'Colombia', 'jhon lucumi'),
	('Jhon Lucumi', 'Colombia', 'lucumi'),
	('Ciro Immobile', 'Italy', 'ciro immobile'),
	('Ciro Immobile', 'Italy', 'immobile'),
	('Federico Bernardeschi', 'Italy', 'bernardeschi'),
	('Federico Bernardeschi', 'Italy', 'federico bernardeschi'),
	('Duvan Zapata', 'Colombia', 'duvan zapata'),
	('Duvan Zapata', 'Colombia', 'zapata'),
	('Serge Gnabry', 'Germany', 'gnabry'),
	('Serge Gnabry', 'Germany', 'serge gnabry'),
	('Leroy Sane', 'Germany', 'leroy sane'),
	('Leroy Sane', 'Germany', 'sane'),
	('Joshua Kimmich', 'Germany', 'joshua kimmich'),
	('Joshua Kimmich', 'Germany', 'kimmich'),
	('Leon Goretzka', 'Germany', 'goretzka'),
	('Leon Goretzka', 'Germany', 'leon goretzka'),
	('Aleksandar Pavlovic', 'Germany', 'aleksandar pavlovic'),
	('Aleksandar Pavlovic', 'Germany', 'pavlovic'),
	('Konrad Laimer', 'Austria', 'konrad laimer'),
	('Konrad Laimer', 'Austria', 'laimer'),
	('Dayot Upamecano', 'France', 'dayot upamecano'),
	('Dayot Upamecano', 'France', 'upamecano'),
	('Kim Min-jae', 'South Korea', 'kim minjae'),
	('Kim Min-jae', 'South Korea', 'minjae'),
	('Jonathan Tah', 'Germany', 'jonathan tah'),
	('Jonathan Tah', 'Germany', 'tah'),
	('Alphonso Davies', 'Canada', 'alphonso davies'),
	('Alphonso Davies', 'Canada', 'davies'),
	('Jamal Musiala', 'Germany', 'jamal musiala'),
	('Jamal Musiala', 'Germany', 'musiala'),
	('Josip Stanisic', 'Croatia', 'josip stanisic'),
	('Josip Stanisic', 'Croatia', 'stanisic'),
	('Robert Andrich', 'Germany', 'andrich'),
	('Robert Andrich', 'Germany', 'robert andrich'),
	('Alejandro Grimaldo', 'Spain', 'alejandro grimaldo'),
	('Alejandro Grimaldo', 'Spain', 'grimaldo'),
	('Piero Hincapie', 'Ecuador', 'hincapie'),
	('Piero Hincapie', 'Ecuador', 'piero hincapie'),
	('Edmond Tapsoba', 'Burkina Faso', 'edmond tapsoba'),
	('Edmond Tapsoba', 'Burkina Faso', 'tapsoba'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Patrik Schick', 'Czechia', 'patrik schick'),
	('Patrik Schick', 'Czechia', 'schick'),
	('Victor Boniface', 'Nigeria', 'boniface'),
	('Victor Boniface', 'Nigeria', 'victor boniface'),
	('Exequiel Palacios', 'Argentina', 'exequiel palacios'),
	('Exequiel Palacios', 'Argentina', 'palacios'),
	('Mark Flekken', 'Netherlands', 'flekken'),
	('Mark Flekken', 'Netherlands', 'mark flekken'),
	('Malik Tillman', 'United States', 'malik tillman'),
	('Malik Tillman', 'United States', 'tillman'),
	('Jarell Quansah', 'England', 'jarell quansah'),
	('Jarell Quansah', 'England', 'quansah'),
	('Claudio Echeverri', 'Argentina', 'claudio echeverri'),
	('Claudio Echeverri', 'Argentina', 'echeverri'),
	('Gregor Kobel', 'Switzerland', 'gregor kobel'),
	('Gregor Kobel', 'Switzerland', 'kobel'),
	('Nico Schlotterbeck', 'Germany', 'nico schlotterbeck'),
	('Nico Schlotterbeck', 'Germany', 'schlotterbeck'),
	('Niklas Sule', 'Germany', 'niklas sule'),
	('Niklas Sule', 'Germany', 'sule'),
	('Waldemar Anton', 'Germany', 'anton'),
	('Waldemar Anton', 'Germany', 'waldemar anton'),
	('Ramy Bensebaini', 'Algeria', 'bensebaini'),
	('Ramy Bensebaini', 'Algeria', 'ramy bensebaini'),
	('Julian Brandt', 'Germany', 'brandt'),
	('Julian Brandt', 'Germany', 'julian brandt'),
	('Felix Nmecha', 'Germany', 'felix nmecha'),
	('Felix Nmecha', 'Germany', 'nmecha'),
	('Pascal Gross', 'Germany', 'gross'),
	('Pascal Gross', 'Germany', 'pascal gross'),
	('Karim Adeyemi', 'Germany', 'adeyemi'),
	('Karim Adeyemi', 'Germany', 'karim adeyemi'),
	('Maximilian Beier', 'Germany', 'beier'),
	('Maximilian Beier', 'Germany', 'maximilian beier'),
	('Fabio Silva', 'Portugal', 'fabio silva'),
	('Fabio Silva', 'Portugal', 'silva'),
	('Jobe Bellingham', 'England', 'bellingham'),
	('Jobe Bellingham', 'England', 'jobe bellingham'),
	('Emre Can', 'Germany', 'can'),
	('Emre Can', 'Germany', 'emre can'),
	('Marcel Sabitzer', 'Austria', 'marcel sabitzer'),
	('Marcel Sabitzer', 'Austria', 'sabitzer'),
	('Peter Gulacsi', 'Hungary', 'gulacsi'),
	('Peter Gulacsi', 'Hungary', 'peter gulacsi'),
	('Willi Orban', 'Hungary', 'orban'),
	('Willi Orban', 'Hungary', 'willi orban'),
	('David Raum', 'Germany', 'david raum'),
	('David Raum', 'Germany', 'raum'),
	('Castello Lukeba', 'France', 'castello lukeba'),
	('Castello Lukeba', 'France', 'lukeba'),
	('Antonio Nusa', 'Norway', 'antonio nusa'),
	('Antonio Nusa', 'Norway', 'nusa'),
	('Xaver Schlager', 'Austria', 'schlager'),
	('Xaver Schlager', 'Austria', 'xaver schlager'),
	('Christoph Baumgartner', 'Austria', 'baumgartner'),
	('Christoph Baumgartner', 'Austria', 'christoph baumgartner'),
	('Johan Bakayoko', 'Belgium', 'bakayoko'),
	('Johan Bakayoko', 'Belgium', 'johan bakayoko'),
	('Kevin Trapp', 'Germany', 'kevin trapp'),
	('Kevin Trapp', 'Germany', 'trapp'),
	('Robin Koch', 'Germany', 'koch'),
	('Robin Koch', 'Germany', 'robin koch'),
	('Arthur Theate', 'Belgium', 'arthur theate'),
	('Arthur Theate', 'Belgium', 'theate'),
	('Can Uzun', 'Turkey', 'can uzun'),
	('Can Uzun', 'Turkey', 'uzun'),
	('Ansgar Knauff', 'Germany', 'ansgar knauff'),
	('Ansgar Knauff', 'Germany', 'knauff'),
	('Jonathan Burkardt', 'Germany', 'burkardt'),
	('Jonathan Burkardt', 'Germany', 'jonathan burkardt'),
	('Ritsu Doan', 'Japan', 'doan'),
	('Ritsu Doan', 'Japan', 'ritsu doan'),
	('Deniz Undav', 'Germany', 'deniz undav'),
	('Deniz Undav', 'Germany', 'undav'),
	('Ermedin Demirovic', 'Bosnia and Herzegovina', 'demirovic'),
	('Ermedin Demirovic', 'Bosnia and Herzegovina', 'ermedin demirovic'),
	('Angelo Stiller', 'Germany', 'angelo stiller'),
	('Angelo Stiller', 'Germany', 'stiller'),
	('Alexander Nubel', 'Germany', 'alexander nubel'),
	('Alexander Nubel', 'Germany', 'nubel'),
	('Jamie Leweling', 'Germany', 'jamie leweling'),
	('Jamie Leweling', 'Germany', 'leweling'),
	('Marquinhos', 'Brazil', 'marquinhos'),
	('Presnel Kimpembe', 'France', 'kimpembe'),
	('Presnel Kimpembe', 'France', 'presnel kimpembe'),
	('Willian Pacho', 'Ecuador', 'pacho'),
	('Willian Pacho', 'Ecuador', 'willian pacho'),
	('Lucas Beraldo', 'Brazil', 'beraldo'),
	('Lucas Beraldo', 'Brazil', 'lucas beraldo'),
	('Lucas Hernandez', 'France', 'hernandez'),
	('Lucas Hernandez', 'France', 'lucas hernandez'),
	('Warren Zaire-Emery', 'France', 'warren zaireemery'),
	('Warren Zaire-Emery', 'France', 'zaireemery'),
	('Bradley Barcola', 'France', 'barcola'),
	('Bradley Barcola', 'France', 'bradley barcola'),
	('Goncalo Ramos', 'Portugal', 'goncalo ramos'),
	('Goncalo Ramos', 'Portugal', 'ramos'),
	('Lee Kang-in', 'South Korea', 'kangin'),
	('Lee Kang-in', 'South Korea', 'lee kangin'),
	('Senny Mayulu', 'France', 'mayulu'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Senny Mayulu', 'France', 'senny mayulu'),
	('Lucas Chevalier', 'France', 'chevalier'),
	('Lucas Chevalier', 'France', 'lucas chevalier'),
	('Mason Greenwood', 'England', 'greenwood'),
	('Mason Greenwood', 'England', 'mason greenwood'),
	('Pierre-Emile Hojbjerg', 'Denmark', 'hojbjerg'),
	('Pierre-Emile Hojbjerg', 'Denmark', 'pierreemile hojbjerg'),
	('Leonardo Balerdi', 'Argentina', 'balerdi'),
	('Leonardo Balerdi', 'Argentina', 'leonardo balerdi'),
	('Geronimo Rulli', 'Argentina', 'geronimo rulli'),
	('Geronimo Rulli', 'Argentina', 'rulli'),
	('Timothy Weah', 'United States', 'timothy weah'),
	('Timothy Weah', 'United States', 'weah'),
	('Igor Paixao', 'Brazil', 'igor paixao'),
	('Igor Paixao', 'Brazil', 'paixao'),
	('Nayef Aguerd', 'Morocco', 'aguerd'),
	('Nayef Aguerd', 'Morocco', 'nayef aguerd'),
	('Amine Gouiri', 'Algeria', 'amine gouiri'),
	('Amine Gouiri', 'Algeria', 'gouiri'),
	('Pierre-Emerick Aubameyang', 'Gabon', 'auba'),
	('Pierre-Emerick Aubameyang', 'Gabon', 'aubameyang'),
	('Pierre-Emerick Aubameyang', 'Gabon', 'pierreemerick aubameyang'),
	('Ansu Fati', 'Spain', 'ansu fati'),
	('Ansu Fati', 'Spain', 'fati'),
	('Maghnes Akliouche', 'France', 'akliouche'),
	('Maghnes Akliouche', 'France', 'maghnes akliouche'),
	('Denis Zakaria', 'Switzerland', 'denis zakaria'),
	('Denis Zakaria', 'Switzerland', 'zakaria'),
	('Takumi Minamino', 'Japan', 'minamino'),
	('Takumi Minamino', 'Japan', 'takumi minamino'),
	('Folarin Balogun', 'United States', 'balogun'),
	('Folarin Balogun', 'United States', 'folarin balogun'),
	('Vanderson', 'Brazil', 'vanderson'),
	('Eric Dier', 'England', 'dier'),
	('Eric Dier', 'England', 'eric dier'),
	('Lamine Camara', 'Senegal', 'camara'),
	('Lamine Camara', 'Senegal', 'lamine camara'),
	('Mika Biereth', 'Denmark', 'biereth'),
	('Mika Biereth', 'Denmark', 'mika biereth'),
	('Aleksandr Golovin', 'Russia', 'aleksandr golovin'),
	('Aleksandr Golovin', 'Russia', 'golovin'),
	('Corentin Tolisso', 'France', 'corentin tolisso'),
	('Corentin Tolisso', 'France', 'tolisso'),
	('Malick Fofana', 'Belgium', 'fofana'),
	('Malick Fofana', 'Belgium', 'malick fofana'),
	('Georges Mikautadze', 'Georgia', 'georges mikautadze'),
	('Georges Mikautadze', 'Georgia', 'mikautadze'),
	('Florian Thauvin', 'France', 'florian thauvin'),
	('Florian Thauvin', 'France', 'thauvin'),
	('Breel Embolo', 'Switzerland', 'breel embolo'),
	('Breel Embolo', 'Switzerland', 'embolo'),
	('Diogo Costa', 'Portugal', 'costa'),
	('Diogo Costa', 'Portugal', 'diogo costa'),
	('Vangelis Pavlidis', 'Greece', 'pavlidis'),
	('Vangelis Pavlidis', 'Greece', 'vangelis pavlidis'),
	('Nicolas Otamendi', 'Argentina', 'nicolas otamendi'),
	('Nicolas Otamendi', 'Argentina', 'otamendi'),
	('Pedro Goncalves', 'Portugal', 'goncalves'),
	('Pedro Goncalves', 'Portugal', 'pedro goncalves'),
	('Pedro Goncalves', 'Portugal', 'pote'),
	('Morten Hjulmand', 'Denmark', 'hjulmand'),
	('Morten Hjulmand', 'Denmark', 'morten hjulmand'),
	('Mauro Icardi', 'Argentina', 'icardi'),
	('Mauro Icardi', 'Argentina', 'mauro icardi'),
	('Youssef En-Nesyri', 'Morocco', 'ennesyri'),
	('Youssef En-Nesyri', 'Morocco', 'youssef ennesyri'),
	('Joao Felix', 'Portugal', 'felix'),
	('Joao Felix', 'Portugal', 'joao felix'),
	('Ivan Toney', 'England', 'ivan toney'),
	('Ivan Toney', 'England', 'toney'),
	('Ruben Neves', 'Portugal', 'neves'),
	('Ruben Neves', 'Portugal', 'ruben neves'),
	('Aleksandar Mitrovic', 'Serbia', 'aleksandar mitrovic'),
	('Aleksandar Mitrovic', 'Serbia', 'mitrovic'),
	('Sergej Milinkovic-Savic', 'Serbia', 'milinkovicsavic'),
	('Sergej Milinkovic-Savic', 'Serbia', 'sergej milinkovicsavic'),
	('Kingsley Coman', 'France', 'coman'),
	('Kingsley Coman', 'France', 'kingsley coman'),
	('Jordi Alba', 'Spain', 'alba'),
	('Jordi Alba', 'Spain', 'jordi alba'),
	('Lorenzo Insigne', 'Italy', 'insigne'),
	('Lorenzo Insigne', 'Italy', 'lorenzo insigne'),
	('Hirving Lozano', 'Mexico', 'chucky lozano'),
	('Hirving Lozano', 'Mexico', 'hirving lozano'),
	('Hirving Lozano', 'Mexico', 'lozano'),
	('Gabriel Barbosa', 'Brazil', 'barbosa'),
	('Gabriel Barbosa', 'Brazil', 'gabigol'),
	('Gabriel Barbosa', 'Brazil', 'gabriel barbosa'),
	('Gonzalo Martinez', 'Argentina', 'gonzalo martinez'),
	('Gonzalo Martinez', 'Argentina', 'martinez'),
	('Gonzalo Martinez', 'Argentina', 'pity martinez'),
	('Pedro', 'Brazil', 'pedro'),
	('German Cano', 'Argentina', 'cano'),
	('German Cano', 'Argentina', 'german cano'),
	('Luiz Henrique', 'Brazil', 'henrique'),
	('Luiz Henrique', 'Brazil', 'luiz henrique'),
	('Giorgian De Arrascaeta', 'Uruguay', 'de arrascaeta'),
	('Giorgian De Arrascaeta', 'Uruguay', 'giorgian de arrascaeta'),
	('Enner Valencia', 'Ecuador', 'enner valencia'),
	('Enner Valencia', 'Ecuador', 'valencia'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Alexis Sanchez', 'Chile', 'alexis sanchez'),
	('Alexis Sanchez', 'Chile', 'sanchez'),
	('Arturo Vidal', 'Chile', 'arturo vidal'),
	('Arturo Vidal', 'Chile', 'vidal'),
	('Claudio Bravo', 'Chile', 'bravo'),
	('Claudio Bravo', 'Chile', 'claudio bravo'),
	('Paolo Guerrero', 'Peru', 'guerrero'),
	('Paolo Guerrero', 'Peru', 'paolo guerrero'),
	('Claudio Pizarro', 'Peru', 'claudio pizarro'),
	('Claudio Pizarro', 'Peru', 'pizarro'),
	('Miguel Almiron', 'Paraguay', 'almiron'),
	('Miguel Almiron', 'Paraguay', 'miguel almiron'),
	('Julio Enciso', 'Paraguay', 'enciso'),
	('Julio Enciso', 'Paraguay', 'julio enciso'),
	('Salomon Rondon', 'Venezuela', 'rondon'),
	('Salomon Rondon', 'Venezuela', 'salomon rondon'),
	('Carlos Tevez', 'Argentina', 'carlos tevez'),
	('Carlos Tevez', 'Argentina', 'tevez'),
	('Javier Mascherano', 'Argentina', 'javier mascherano'),
	('Javier Mascherano', 'Argentina', 'mascherano'),
	('Angel Di Maria', 'Argentina', 'angel di maria'),
	('Angel Di Maria', 'Argentina', 'di maria'),
	('Juan Roman Riquelme', 'Argentina', 'juan roman riquelme'),
	('Juan Roman Riquelme', 'Argentina', 'riquelme'),
	('Juan Sebastian Veron', 'Argentina', 'juan sebastian veron'),
	('Juan Sebastian Veron', 'Argentina', 'veron'),
	('Gabriel Batistuta', 'Argentina', 'batigol'),
	('Gabriel Batistuta', 'Argentina', 'batistuta'),
	('Gabriel Batistuta', 'Argentina', 'gabriel batistuta'),
	('Hernan Crespo', 'Argentina', 'crespo'),
	('Hernan Crespo', 'Argentina', 'hernan crespo'),
	('Mario Kempes', 'Argentina', 'kempes'),
	('Mario Kempes', 'Argentina', 'mario kempes'),
	('Daniel Passarella', 'Argentina', 'daniel passarella'),
	('Daniel Passarella', 'Argentina', 'passarella'),
	('Thiago Silva', 'Brazil', 'silva'),
	('Thiago Silva', 'Brazil', 'thiago silva'),
	('Marcelo', 'Brazil', 'marcelo'),
	('Oscar', 'Brazil', 'oscar'),
	('Philippe Coutinho', 'Brazil', 'coutinho'),
	('Philippe Coutinho', 'Brazil', 'philippe coutinho'),
	('Lucas Moura', 'Brazil', 'lucas moura'),
	('Lucas Moura', 'Brazil', 'moura'),
	('Bebeto', 'Brazil', 'bebeto'),
	('Zico', 'Brazil', 'zico'),
	('Socrates', 'Brazil', 'socrates'),
	('Yaya Toure', 'Ivory Coast', 'toure'),
	('Yaya Toure', 'Ivory Coast', 'yaya toure'),
	('Kolo Toure', 'Ivory Coast', 'kolo toure'),
	('Kolo Toure', 'Ivory Coast', 'toure'),
	('Emmanuel Adebayor', 'Togo', 'adebayor'),
	('Emmanuel Adebayor', 'Togo', 'emmanuel adebayor'),
	('Frederic Kanoute', 'Mali', 'frederic kanoute'),
	('Frederic Kanoute', 'Mali', 'kanoute'),
	('El Hadji Diouf', 'Senegal', 'diouf'),
	('El Hadji Diouf', 'Senegal', 'el hadji diouf'),
	('Nwankwo Kanu', 'Nigeria', 'kanu'),
	('Nwankwo Kanu', 'Nigeria', 'nwankwo kanu'),
	('Jay-Jay Okocha', 'Nigeria', 'jayjay okocha'),
	('Jay-Jay Okocha', 'Nigeria', 'okocha'),
	('Michael Essien', 'Ghana', 'essien'),
	('Michael Essien', 'Ghana', 'michael essien'),
	('Asamoah Gyan', 'Ghana', 'asamoah gyan'),
	('Asamoah Gyan', 'Ghana', 'gyan'),
	('Patrick M''Boma', 'Cameroon', 'mboma'),
	('Patrick M''Boma', 'Cameroon', 'patrick mboma'),
	('Mustapha Hadji', 'Morocco', 'hadji'),
	('Mustapha Hadji', 'Morocco', 'mustapha hadji'),
	('Victor Ikpeba', 'Nigeria', 'ikpeba'),
	('Victor Ikpeba', 'Nigeria', 'victor ikpeba'),
	('Emmanuel Amunike', 'Nigeria', 'amunike'),
	('Emmanuel Amunike', 'Nigeria', 'emmanuel amunike'),
	('Rashidi Yekini', 'Nigeria', 'rashidi yekini'),
	('Rashidi Yekini', 'Nigeria', 'yekini'),
	('Abedi Pele', 'Ghana', 'abedi pele'),
	('Abedi Pele', 'Ghana', 'pele'),
	('Hakim Ziyech', 'Morocco', 'hakim ziyech'),
	('Hakim Ziyech', 'Morocco', 'ziyech'),
	('Yassine Bounou', 'Morocco', 'bono'),
	('Yassine Bounou', 'Morocco', 'bounou'),
	('Yassine Bounou', 'Morocco', 'yassine bounou'),
	('Kalidou Koulibaly', 'Senegal', 'kalidou koulibaly'),
	('Kalidou Koulibaly', 'Senegal', 'koulibaly'),
	('Wilfried Zaha', 'Ivory Coast', 'wilfried zaha'),
	('Wilfried Zaha', 'Ivory Coast', 'zaha'),
	('Michel Platini', 'France', 'michel platini'),
	('Michel Platini', 'France', 'platini'),
	('Alfredo Di Stefano', 'Argentina', 'alfredo di stefano'),
	('Alfredo Di Stefano', 'Argentina', 'di stefano'),
	('Ferenc Puskas', 'Hungary', 'ferenc puskas'),
	('Ferenc Puskas', 'Hungary', 'puskas'),
	('Gheorghe Hagi', 'Romania', 'gheorghe hagi'),
	('Gheorghe Hagi', 'Romania', 'hagi'),
	('Hristo Stoichkov', 'Bulgaria', 'hristo stoichkov'),
	('Hristo Stoichkov', 'Bulgaria', 'stoichkov'),
	('Davor Suker', 'Croatia', 'davor suker'),
	('Davor Suker', 'Croatia', 'suker'),
	('Miroslav Klose', 'Germany', 'klose'),
	('Miroslav Klose', 'Germany', 'miroslav klose'),
	('Philipp Lahm', 'Germany', 'lahm'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Philipp Lahm', 'Germany', 'philipp lahm'),
	('Bastian Schweinsteiger', 'Germany', 'bastian schweinsteiger'),
	('Bastian Schweinsteiger', 'Germany', 'schweinsteiger'),
	('Michael Laudrup', 'Denmark', 'laudrup'),
	('Michael Laudrup', 'Denmark', 'michael laudrup'),
	('Jari Litmanen', 'Finland', 'jari litmanen'),
	('Jari Litmanen', 'Finland', 'litmanen'),
	('Henrik Larsson', 'Sweden', 'henrik larsson'),
	('Henrik Larsson', 'Sweden', 'larsson'),
	('Rui Costa', 'Portugal', 'costa'),
	('Rui Costa', 'Portugal', 'rui costa'),
	('Luis Figo', 'Portugal', 'figo'),
	('Luis Figo', 'Portugal', 'luis figo'),
	('Deco', 'Portugal', 'deco'),
	('Nani', 'Portugal', 'nani'),
	('Pepe', 'Portugal', 'pepe'),
	('Clarence Seedorf', 'Netherlands', 'clarence seedorf'),
	('Clarence Seedorf', 'Netherlands', 'seedorf'),
	('Patrick Kluivert', 'Netherlands', 'kluivert'),
	('Patrick Kluivert', 'Netherlands', 'patrick kluivert'),
	('Ronald Koeman', 'Netherlands', 'koeman'),
	('Ronald Koeman', 'Netherlands', 'ronald koeman'),
	('Gianluca Vialli', 'Italy', 'gianluca vialli'),
	('Gianluca Vialli', 'Italy', 'vialli'),
	('Roberto Mancini', 'Italy', 'mancini'),
	('Roberto Mancini', 'Italy', 'roberto mancini'),
	('Christian Vieri', 'Italy', 'christian vieri'),
	('Christian Vieri', 'Italy', 'vieri'),
	('Filippo Inzaghi', 'Italy', 'filippo inzaghi'),
	('Filippo Inzaghi', 'Italy', 'inzaghi'),
	('Alessandro Nesta', 'Italy', 'alessandro nesta'),
	('Alessandro Nesta', 'Italy', 'nesta'),
	('Franco Baresi', 'Italy', 'baresi'),
	('Franco Baresi', 'Italy', 'franco baresi'),
	('Paolo Rossi', 'Italy', 'paolo rossi'),
	('Paolo Rossi', 'Italy', 'rossi'),
	('Mario Balotelli', 'Italy', 'balotelli'),
	('Mario Balotelli', 'Italy', 'mario balotelli'),
	('Gary Lineker', 'England', 'gary lineker'),
	('Gary Lineker', 'England', 'lineker'),
	('Paul Gascoigne', 'England', 'gascoigne'),
	('Paul Gascoigne', 'England', 'gazza'),
	('Paul Gascoigne', 'England', 'paul gascoigne'),
	('David Seaman', 'England', 'david seaman'),
	('David Seaman', 'England', 'seaman'),
	('Sol Campbell', 'England', 'campbell'),
	('Sol Campbell', 'England', 'sol campbell'),
	('Ashley Cole', 'England', 'ashley cole'),
	('Ashley Cole', 'England', 'cole'),
	('Gary Neville', 'England', 'gary neville'),
	('Gary Neville', 'England', 'neville'),
	('Robbie Fowler', 'England', 'fowler'),
	('Robbie Fowler', 'England', 'robbie fowler'),
	('Ian Wright', 'England', 'ian wright'),
	('Ian Wright', 'England', 'wright'),
	('Eric Cantona', 'France', 'cantona'),
	('Eric Cantona', 'France', 'eric cantona'),
	('Just Fontaine', 'France', 'fontaine'),
	('Just Fontaine', 'France', 'just fontaine'),
	('Raymond Kopa', 'France', 'kopa'),
	('Raymond Kopa', 'France', 'raymond kopa'),
	('Jean-Pierre Papin', 'France', 'jeanpierre papin'),
	('Jean-Pierre Papin', 'France', 'papin'),
	('David Ginola', 'France', 'david ginola'),
	('David Ginola', 'France', 'ginola'),
	('Franck Ribery', 'France', 'franck ribery'),
	('Franck Ribery', 'France', 'ribery'),
	('Raul', 'Spain', 'raul'),
	('Fernando Hierro', 'Spain', 'fernando hierro'),
	('Fernando Hierro', 'Spain', 'hierro'),
	('Cesc Fabregas', 'Spain', 'cesc fabregas'),
	('Cesc Fabregas', 'Spain', 'fabregas'),
	('Juan Mata', 'Spain', 'juan mata'),
	('Juan Mata', 'Spain', 'mata'),
	('Pedro Rodriguez', 'Spain', 'pedro rodriguez'),
	('Pedro Rodriguez', 'Spain', 'rodriguez'),
	('Diego Costa', 'Spain', 'costa'),
	('Diego Costa', 'Spain', 'diego costa'),
	('Gareth Bale', 'Wales', 'bale'),
	('Gareth Bale', 'Wales', 'gareth bale'),
	('Aaron Ramsey', 'Wales', 'aaron ramsey'),
	('Aaron Ramsey', 'Wales', 'ramsey'),
	('Graeme Souness', 'Scotland', 'graeme souness'),
	('Graeme Souness', 'Scotland', 'souness'),
	('Roy Keane', 'Republic of Ireland', 'keane'),
	('Roy Keane', 'Republic of Ireland', 'roy keane'),
	('Robbie Keane', 'Republic of Ireland', 'keane'),
	('Robbie Keane', 'Republic of Ireland', 'robbie keane'),
	('Ole Gunnar Solskjaer', 'Norway', 'ole gunnar solskjaer'),
	('Ole Gunnar Solskjaer', 'Norway', 'solskjaer'),
	('Christian Eriksen', 'Denmark', 'christian eriksen'),
	('Christian Eriksen', 'Denmark', 'eriksen'),
	('Kasper Schmeichel', 'Denmark', 'kasper schmeichel'),
	('Kasper Schmeichel', 'Denmark', 'schmeichel'),
	('Dries Mertens', 'Belgium', 'dries mertens'),
	('Dries Mertens', 'Belgium', 'mertens'),
	('Vincent Kompany', 'Belgium', 'kompany'),
	('Vincent Kompany', 'Belgium', 'vincent kompany'),
	('Ivan Rakitic', 'Croatia', 'ivan rakitic'),
	('Ivan Rakitic', 'Croatia', 'rakitic'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Mateo Kovacic', 'Croatia', 'kovacic'),
	('Mateo Kovacic', 'Croatia', 'mateo kovacic'),
	('Ivan Perisic', 'Croatia', 'ivan perisic'),
	('Ivan Perisic', 'Croatia', 'perisic'),
	('Dimitar Berbatov', 'Bulgaria', 'berbatov'),
	('Dimitar Berbatov', 'Bulgaria', 'dimitar berbatov'),
	('Dusan Tadic', 'Serbia', 'dusan tadic'),
	('Dusan Tadic', 'Serbia', 'tadic'),
	('Nemanja Vidic', 'Serbia', 'nemanja vidic'),
	('Nemanja Vidic', 'Serbia', 'vidic'),
	('Xherdan Shaqiri', 'Switzerland', 'shaqiri'),
	('Xherdan Shaqiri', 'Switzerland', 'xherdan shaqiri'),
	('Marko Arnautovic', 'Austria', 'arnautovic'),
	('Marko Arnautovic', 'Austria', 'marko arnautovic'),
	('Tomas Soucek', 'Czechia', 'soucek'),
	('Tomas Soucek', 'Czechia', 'tomas soucek'),
	('Hidetoshi Nakata', 'Japan', 'hidetoshi nakata'),
	('Hidetoshi Nakata', 'Japan', 'nakata'),
	('Shinji Kagawa', 'Japan', 'kagawa'),
	('Shinji Kagawa', 'Japan', 'shinji kagawa'),
	('Keisuke Honda', 'Japan', 'honda'),
	('Keisuke Honda', 'Japan', 'keisuke honda'),
	('Park Ji-sung', 'South Korea', 'jisung'),
	('Park Ji-sung', 'South Korea', 'park jisung'),
	('Mehdi Taremi', 'Iran', 'mehdi taremi'),
	('Mehdi Taremi', 'Iran', 'taremi'),
	('Ali Daei', 'Iran', 'ali daei'),
	('Ali Daei', 'Iran', 'daei'),
	('Sunil Chhetri', 'India', 'chhetri'),
	('Sunil Chhetri', 'India', 'sunil chhetri'),
	('Weston McKennie', 'United States', 'mckennie'),
	('Weston McKennie', 'United States', 'weston mckennie'),
	('Landon Donovan', 'United States', 'donovan'),
	('Landon Donovan', 'United States', 'landon donovan'),
	('Clint Dempsey', 'United States', 'clint dempsey'),
	('Clint Dempsey', 'United States', 'dempsey'),
	('Javier Hernandez', 'Mexico', 'chicharito'),
	('Javier Hernandez', 'Mexico', 'hernandez'),
	('Javier Hernandez', 'Mexico', 'javier hernandez'),
	('Rafael Marquez', 'Mexico', 'marquez'),
	('Rafael Marquez', 'Mexico', 'rafael marquez'),
	('Hugo Sanchez', 'Mexico', 'hugo sanchez'),
	('Hugo Sanchez', 'Mexico', 'sanchez'),
	('Guillermo Ochoa', 'Mexico', 'guillermo ochoa'),
	('Guillermo Ochoa', 'Mexico', 'memo ochoa'),
	('Guillermo Ochoa', 'Mexico', 'ochoa'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';

-- Surname aliases for the pre-existing player pool (entities already in
-- reference_entities; this only adds alias rows).
WITH v(name, cat, alias) AS (VALUES
	('Lionel Messi', 'Argentina', 'messi'),
	('Cristiano Ronaldo', 'Portugal', 'ronaldo'),
	('Ronaldo Nazario', 'Brazil', 'nazario'),
	('Zinedine Zidane', 'France', 'zidane'),
	('Kylian Mbappe', 'France', 'mbappe'),
	('Erling Haaland', 'Norway', 'haaland'),
	('Robert Lewandowski', 'Poland', 'lewandowski'),
	('Karim Benzema', 'France', 'benzema'),
	('Luka Modric', 'Croatia', 'modric'),
	('Kevin De Bruyne', 'Belgium', 'de bruyne'),
	('Mohamed Salah', 'Egypt', 'salah'),
	('Sadio Mane', 'Senegal', 'mane'),
	('Harry Kane', 'England', 'kane'),
	('Thierry Henry', 'France', 'henry'),
	('Didier Drogba', 'Ivory Coast', 'drogba'),
	('Samuel Eto''o', 'Cameroon', 'etoo'),
	('George Weah', 'Liberia', 'weah'),
	('Roberto Baggio', 'Italy', 'baggio'),
	('Michael Owen', 'England', 'owen'),
	('Alan Shearer', 'England', 'shearer'),
	('Wayne Rooney', 'England', 'rooney'),
	('Andriy Shevchenko', 'Ukraine', 'shevchenko'),
	('Pavel Nedved', 'Czechia', 'nedved'),
	('Fabio Cannavaro', 'Italy', 'cannavaro'),
	('Diego Maradona', 'Argentina', 'maradona'),
	('Johan Cruyff', 'Netherlands', 'cruyff'),
	('Franz Beckenbauer', 'Germany', 'beckenbauer'),
	('Gerd Muller', 'Germany', 'muller'),
	('Bobby Charlton', 'England', 'charlton'),
	('George Best', 'Northern Ireland', 'best'),
	('Marco van Basten', 'Netherlands', 'van basten'),
	('Ruud Gullit', 'Netherlands', 'gullit'),
	('Frank Rijkaard', 'Netherlands', 'rijkaard'),
	('Dennis Bergkamp', 'Netherlands', 'bergkamp'),
	('Ruud van Nistelrooy', 'Netherlands', 'van nistelrooy'),
	('Ryan Giggs', 'Wales', 'giggs'),
	('Paul Scholes', 'England', 'scholes'),
	('David Beckham', 'England', 'beckham'),
	('Steven Gerrard', 'England', 'gerrard'),
	('Frank Lampard', 'England', 'lampard'),
	('John Terry', 'England', 'terry'),
	('Rio Ferdinand', 'England', 'ferdinand'),
	('Xavi Hernandez', 'Spain', 'hernandez'),
	('Andres Iniesta', 'Spain', 'iniesta'),
	('Sergio Ramos', 'Spain', 'ramos'),
	('Gerard Pique', 'Spain', 'pique'),
	('Carles Puyol', 'Spain', 'puyol'),
	('Iker Casillas', 'Spain', 'casillas'),
	('Gianluigi Buffon', 'Italy', 'buffon'),
	('Paolo Maldini', 'Italy', 'maldini'),
	('Alessandro Del Piero', 'Italy', 'del piero'),
	('Francesco Totti', 'Italy', 'totti'),
	('Andrea Pirlo', 'Italy', 'pirlo'),
	('Gianfranco Zola', 'Italy', 'zola'),
	('Roberto Carlos', 'Brazil', 'carlos'),
	('Luis Suarez', 'Uruguay', 'suarez'),
	('Edinson Cavani', 'Uruguay', 'cavani'),
	('Radamel Falcao', 'Colombia', 'falcao'),
	('James Rodriguez', 'Colombia', 'rodriguez'),
	('Diego Forlan', 'Uruguay', 'forlan'),
	('Zlatan Ibrahimovic', 'Sweden', 'ibrahimovic'),
	('Thomas Muller', 'Germany', 'muller'),
	('Manuel Neuer', 'Germany', 'neuer'),
	('Toni Kroos', 'Germany', 'kroos'),
	('Sergio Aguero', 'Argentina', 'aguero'),
	('David Villa', 'Spain', 'villa'),
	('Fernando Torres', 'Spain', 'torres'),
	('Xabi Alonso', 'Spain', 'alonso'),
	('Wesley Sneijder', 'Netherlands', 'sneijder'),
	('Arjen Robben', 'Netherlands', 'robben'),
	('Marco Reus', 'Germany', 'reus'),
	('Mario Gotze', 'Germany', 'gotze'),
	('Mesut Ozil', 'Germany', 'ozil'),
	('Ilkay Gundogan', 'Germany', 'gundogan'),
	('N''Golo Kante', 'France', 'kante'),
	('Antoine Griezmann', 'France', 'griezmann'),
	('Ousmane Dembele', 'France', 'dembele'),
	('Riyad Mahrez', 'Algeria', 'mahrez'),
	('Victor Osimhen', 'Nigeria', 'osimhen'),
	('Achraf Hakimi', 'Morocco', 'hakimi'),
	('Jude Bellingham', 'England', 'bellingham'),
	('Bukayo Saka', 'England', 'saka'),
	('Phil Foden', 'England', 'foden'),
	('Declan Rice', 'England', 'rice'),
	('Marcus Rashford', 'England', 'rashford'),
	('Son Heung-min', 'South Korea', 'heungmin'),
	('Kaoru Mitoma', 'Japan', 'mitoma'),
	('Takefusa Kubo', 'Japan', 'kubo'),
	('Lautaro Martinez', 'Argentina', 'martinez'),
	('Julian Alvarez', 'Argentina', 'alvarez'),
	('Federico Valverde', 'Uruguay', 'valverde'),
	('Virgil van Dijk', 'Netherlands', 'van dijk'),
	('Alisson Becker', 'Brazil', 'becker'),
	('Thibaut Courtois', 'Belgium', 'courtois'),
	('Jan Oblak', 'Slovenia', 'oblak'),
	('David de Gea', 'Spain', 'de gea'),
	('Petr Cech', 'Czechia', 'cech'),
	('Edwin van der Sar', 'Netherlands', 'van der sar'),
	('Oliver Kahn', 'Germany', 'kahn'),
	('Peter Schmeichel', 'Denmark', 'schmeichel'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
WITH v(name, cat, alias) AS (VALUES
	('Gordon Banks', 'England', 'banks'),
	('Lev Yashin', 'Soviet Union', 'yashin'),
	('Dino Zoff', 'Italy', 'zoff'),
	('Fabien Barthez', 'France', 'barthez'),
	('Michael Ballack', 'Germany', 'ballack'),
	('Lothar Matthaus', 'Germany', 'matthaus'),
	('Jurgen Klinsmann', 'Germany', 'klinsmann'),
	('Rudi Voller', 'Germany', 'voller'),
	('Karl-Heinz Rummenigge', 'Germany', 'rummenigge'),
	('Uwe Seeler', 'Germany', 'seeler'),
	('Bobby Moore', 'England', 'moore'),
	('Geoff Hurst', 'England', 'hurst'),
	('Kenny Dalglish', 'Scotland', 'dalglish'),
	('Ian Rush', 'Wales', 'rush'),
	('Peter Crouch', 'England', 'crouch'),
	('Jamie Vardy', 'England', 'vardy'),
	('Sergio Busquets', 'Spain', 'busquets'),
	('Marc-Andre ter Stegen', 'Germany', 'ter stegen'),
	('Robert Pires', 'France', 'pires'),
	('Patrick Vieira', 'France', 'vieira'),
	('Claude Makelele', 'France', 'makelele'),
	('Marcel Desailly', 'France', 'desailly'),
	('Lilian Thuram', 'France', 'thuram'),
	('Youri Djorkaeff', 'France', 'djorkaeff'),
	('David Trezeguet', 'France', 'trezeguet'),
	('Nicolas Anelka', 'France', 'anelka'),
	('William Gallas', 'France', 'gallas'),
	('Bacary Sagna', 'France', 'sagna'),
	('Hugo Lloris', 'France', 'lloris'),
	('Raphael Varane', 'France', 'varane'),
	('Paul Pogba', 'France', 'pogba'),
	('Olivier Giroud', 'France', 'giroud'),
	('Alexandre Lacazette', 'France', 'lacazette'),
	('Wissam Ben Yedder', 'France', 'yedder'),
	('Moussa Dembele', 'France', 'dembele'),
	('Gabriel Jesus', 'Brazil', 'jesus'),
	('Roberto Firmino', 'Brazil', 'firmino'),
	('Diogo Jota', 'Portugal', 'jota'),
	('Darwin Nunez', 'Uruguay', 'nunez'),
	('Cody Gakpo', 'Netherlands', 'gakpo'),
	('Bruno Fernandes', 'Portugal', 'fernandes'),
	('Rasmus Hojlund', 'Denmark', 'hojlund'))
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';
-- Comprehensive UK football expansion
-- Championship (24), League One (24), League Two (24), Scottish clubs (12)
-- Plus ~120+ historical and current players with surname aliases

INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Bristol City', 'England', 'club'),
	('Coventry City', 'England', 'club'),
	('Derby County', 'England', 'club'),
	('Huddersfield Town', 'England', 'club'),
	('Hull City', 'England', 'club'),
	('Ipswich Town', 'England', 'club'),
	('Leeds United', 'England', 'club'),
	('Leicester City', 'England', 'club'),
	('Luton Town', 'England', 'club'),
	('Millwall', 'England', 'club'),
	('Middlesbrough', 'England', 'club'),
	('Norwich City', 'England', 'club'),
	('Portsmouth', 'England', 'club'),
	('Preston North End', 'England', 'club'),
	('Queens Park Rangers', 'England', 'club'),
	('Reading', 'England', 'club'),
	('Sheffield United', 'England', 'club'),
	('Sheffield Wednesday', 'England', 'club'),
	('Southampton', 'England', 'club'),
	('Stoke City', 'England', 'club'),
	('Sunderland', 'England', 'club'),
	('Swansea City', 'Wales', 'club'),
	('Watford', 'England', 'club'),
	('Wrexham', 'Wales', 'club'),
	('AFC Wimbledon', 'England', 'club'),
	('Barnsley', 'England', 'club'),
	('Blackpool', 'England', 'club'),
	('Bolton Wanderers', 'England', 'club'),
	('Bradford City', 'England', 'club'),
	('Burton Albion', 'England', 'club'),
	('Doncaster Rovers', 'England', 'club'),
	('Exeter City', 'England', 'club'),
	('Leyton Orient', 'England', 'club'),
	('Lincoln City', 'England', 'club'),
	('Mansfield Town', 'England', 'club'),
	('Northampton Town', 'England', 'club'),
	('Peterborough United', 'England', 'club'),
	('Plymouth Argyle', 'England', 'club'),
	('Port Vale', 'England', 'club'),
	('Rotherham United', 'England', 'club'),
	('Salford City', 'England', 'club'),
	('Stevenage', 'England', 'club'),
	('Stockport County', 'England', 'club'),
	('Tranmere Rovers', 'England', 'club'),
	('Wigan Athletic', 'England', 'club'),
	('Wycombe Wanderers', 'England', 'club'),
	('Charlton Athletic', 'England', 'club'),
	('Oxford United', 'England', 'club'),
	('Accrington Stanley', 'England', 'club'),
	('Barrow', 'England', 'club'),
	('Cheltenham Town', 'England', 'club'),
	('Colchester United', 'England', 'club'),
	('Crewe Alexandra', 'England', 'club'),
	('Crawley Town', 'England', 'club'),
	('Forest Green Rovers', 'England', 'club'),
	('Gillingham', 'England', 'club'),
	('Grimsby Town', 'England', 'club'),
	('Harrogate Town', 'England', 'club'),
	('Maidenhead United', 'England', 'club'),
	('Notts County', 'England', 'club'),
	('Oldham Athletic', 'England', 'club'),
	('Swindon Town', 'England', 'club'),
	('Morecambe', 'England', 'club'),
	('MK Dons', 'England', 'club'),
	('Newport County', 'Wales', 'club'),
	('Salop United', 'England', 'club'),
	('Southend United', 'England', 'club'),
	('Sutton United', 'England', 'club'),
	('Torquay United', 'England', 'club'),
	('Walsall', 'England', 'club'),
	('Wimbledon', 'England', 'club'),
	('Aberdeen', 'Scotland', 'club'),
	('Celtic', 'Scotland', 'club'),
	('Dundee', 'Scotland', 'club'),
	('Dundee United', 'Scotland', 'club'),
	('Hearts', 'Scotland', 'club'),
	('Hibernian', 'Scotland', 'club'),
	('Kilmarnock', 'Scotland', 'club'),
	('Motherwell', 'Scotland', 'club'),
	('Rangers', 'Scotland', 'club'),
	('Ross County', 'Scotland', 'club'),
	('St Johnstone', 'Scotland', 'club'),
	('St Mirren', 'Scotland', 'club');

INSERT INTO reference_entities (canonical_name, category, entity_type) VALUES
	('Bobby Moore', 'England', 'player'),
	('Bobby Charlton', 'England', 'player'),
	('Gordon Banks', 'England', 'player'),
	('Wayne Rooney', 'England', 'player'),
	('Frank Lampard', 'England', 'player'),
	('Steven Gerrard', 'England', 'player'),
	('Ryan Giggs', 'Wales', 'player'),
	('Mark Hughes', 'Wales', 'player'),
	('John Charles', 'Wales', 'player'),
	('Ian Rush', 'Wales', 'player'),
	('Kris Boyd', 'Scotland', 'player'),
	('Kenny Dalglish', 'Scotland', 'player'),
	('Graeme Souness', 'Scotland', 'player'),
	('Billy Bingham', 'Northern Ireland', 'player'),
	('Norman Whiteside', 'Northern Ireland', 'player'),
	('George Best', 'Northern Ireland', 'player'),
	('Peter Shilton', 'England', 'player'),
	('Peter Beardsley', 'England', 'player'),
	('John Aldridge', 'England', 'player'),
	('Vinnie Jones', 'England', 'player'),
	('Stan Collymore', 'England', 'player'),
	('Des Walker', 'England', 'player'),
	('Ray Clemence', 'England', 'player'),
	('Gary Lineker', 'England', 'player'),
	('Gary Neville', 'England', 'player'),
	('Paul Gascoigne', 'England', 'player'),
	('David Seaman', 'England', 'player'),
	('Sol Campbell', 'England', 'player'),
	('Ashley Cole', 'England', 'player'),
	('Robbie Fowler', 'England', 'player'),
	('Ian Wright', 'England', 'player'),
	('Roy Keane', 'Republic of Ireland', 'player'),
	('Robbie Keane', 'Republic of Ireland', 'player'),
	('Shay Given', 'Republic of Ireland', 'player'),
	('Declan Rice', 'England', 'player'),
	('Phil Foden', 'England', 'player'),
	('Jude Bellingham', 'England', 'player'),
	('Bukayo Saka', 'England', 'player'),
	('Aaron Ramsdale', 'England', 'player'),
	('Andy Robertson', 'Scotland', 'player'),
	('Kieran Tierney', 'Scotland', 'player'),
	('Stuart Armstrong', 'Scotland', 'player'),
	('John McGinn', 'Scotland', 'player'),
	('Callum McGregor', 'Scotland', 'player'),
	('Aaron Wan-Bissaka', 'England', 'player'),
	('Reece James', 'England', 'player'),
	('Ben Chilwell', 'England', 'player'),
	('Darren Moore', 'England', 'player'),
	('Nigel Clough', 'England', 'player'),
	('Stuart Pearce', 'England', 'player'),
	('Ray Wilkins', 'England', 'player'),
	('Trevor Francis', 'England', 'player'),
	('Kenny Sansom', 'England', 'player'),
	('Emi Buendia', 'Argentina', 'player'),
	('Lloyd Kelly', 'England', 'player'),
	('Nathan Collins', 'Republic of Ireland', 'player'),
	('Mark Sykes', 'England', 'player'),
	('Robert Snodgrass', 'Scotland', 'player'),
	('Callum Styles', 'England', 'player'),
	('Tyler Dibling', 'England', 'player'),
	('Gustavo Hamer', 'Netherlands', 'player'),
	('Jaidon Anthony', 'England', 'player'),
	('Jarill Pelupessy', 'Netherlands', 'player'),
	('John Lundstram', 'England', 'player'),
	('Jonny Otto', 'Spain', 'player'),
	('Pablo Rosario', 'Netherlands', 'player'),
	('Hayden Hackney', 'England', 'player'),
	('Alan Browne', 'Republic of Ireland', 'player'),
	('Daniel Ballard', 'England', 'player'),
	('Seamus Maguire', 'Republic of Ireland', 'player'),
	('Callum Hudson-Odoi', 'England', 'player'),
	('Dani Ceballos', 'Spain', 'player'),
	('Mohamed Sylla', 'Guinea', 'player'),
	('Amos Pieta', 'Ivory Coast', 'player'),
	('Oscar Gloukh', 'Israel', 'player'),
	('Marcus McGuane', 'England', 'player'),
	('Romain Esse', 'England', 'player'),
	('Chiquinho', 'Portugal', 'player'),
	('Liam Palmer', 'England', 'player'),
	('Alfie Doughty', 'England', 'player'),
	('Duane Holmes', 'United States', 'player'),
	('Alex King', 'England', 'player'),
	('Andy Carroll', 'England', 'player'),
	('Lynden Gooch', 'United States', 'player'),
	('George Honeyman', 'England', 'player'),
	('Tatsuhiro Sakamoto', 'Japan', 'player'),
	('Matt Grimes', 'Wales', 'player'),
	('Jamal Lowe', 'England', 'player'),
	('Kasey Palmer', 'England', 'player'),
	('Jayson Molumby', 'Republic of Ireland', 'player'),
	('Alfie May', 'England', 'player'),
	('Jaidon Carty', 'England', 'player'),
	('Caeser Sanchez', 'Equatorial Guinea', 'player'),
	('Dan Barlaser', 'England', 'player'),
	('Aden Flint', 'England', 'player'),
	('Kike Salas', 'Spain', 'player'),
	('Kal Naismith', 'Scotland', 'player'),
	('Mackenzie Kirk', 'Scotland', 'player'),
	('Lyall McCallum', 'Scotland', 'player');

WITH v(name, cat, alias) AS (VALUES
	('Bobby Moore', 'England', 'bobby moore'),
	('Bobby Moore', 'England', 'moore'),
	('Bobby Charlton', 'England', 'bobby charlton'),
	('Bobby Charlton', 'England', 'charlton'),
	('Gordon Banks', 'England', 'gordon banks'),
	('Gordon Banks', 'England', 'banks'),
	('Wayne Rooney', 'England', 'wayne rooney'),
	('Wayne Rooney', 'England', 'rooney'),
	('Frank Lampard', 'England', 'frank lampard'),
	('Frank Lampard', 'England', 'lampard'),
	('Steven Gerrard', 'England', 'steven gerrard'),
	('Steven Gerrard', 'England', 'gerrard'),
	('Ryan Giggs', 'Wales', 'ryan giggs'),
	('Ryan Giggs', 'Wales', 'giggs'),
	('Mark Hughes', 'Wales', 'mark hughes'),
	('Mark Hughes', 'Wales', 'hughes'),
	('John Charles', 'Wales', 'john charles'),
	('John Charles', 'Wales', 'charles'),
	('Ian Rush', 'Wales', 'ian rush'),
	('Ian Rush', 'Wales', 'rush'),
	('Kris Boyd', 'Scotland', 'kris boyd'),
	('Kris Boyd', 'Scotland', 'boyd'),
	('Kenny Dalglish', 'Scotland', 'kenny dalglish'),
	('Kenny Dalglish', 'Scotland', 'dalglish'),
	('Graeme Souness', 'Scotland', 'graeme souness'),
	('Graeme Souness', 'Scotland', 'souness'),
	('Billy Bingham', 'Northern Ireland', 'billy bingham'),
	('Billy Bingham', 'Northern Ireland', 'bingham'),
	('Norman Whiteside', 'Northern Ireland', 'norman whiteside'),
	('Norman Whiteside', 'Northern Ireland', 'whiteside'),
	('George Best', 'Northern Ireland', 'george best'),
	('George Best', 'Northern Ireland', 'best'),
	('Peter Shilton', 'England', 'peter shilton'),
	('Peter Shilton', 'England', 'shilton'),
	('Peter Beardsley', 'England', 'peter beardsley'),
	('Peter Beardsley', 'England', 'beardsley'),
	('John Aldridge', 'England', 'john aldridge'),
	('John Aldridge', 'England', 'aldridge'),
	('Vinnie Jones', 'England', 'vinnie jones'),
	('Vinnie Jones', 'England', 'jones'),
	('Stan Collymore', 'England', 'stan collymore'),
	('Stan Collymore', 'England', 'collymore'),
	('Des Walker', 'England', 'des walker'),
	('Des Walker', 'England', 'walker'),
	('Ray Clemence', 'England', 'ray clemence'),
	('Ray Clemence', 'England', 'clemence'),
	('Gary Lineker', 'England', 'gary lineker'),
	('Gary Lineker', 'England', 'lineker'),
	('Gary Neville', 'England', 'gary neville'),
	('Gary Neville', 'England', 'neville')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';

WITH v(name, cat, alias) AS (VALUES
	('Paul Gascoigne', 'England', 'paul gascoigne'),
	('Paul Gascoigne', 'England', 'gascoigne'),
	('David Seaman', 'England', 'david seaman'),
	('David Seaman', 'England', 'seaman'),
	('Sol Campbell', 'England', 'sol campbell'),
	('Sol Campbell', 'England', 'campbell'),
	('Ashley Cole', 'England', 'ashley cole'),
	('Ashley Cole', 'England', 'cole'),
	('Robbie Fowler', 'England', 'robbie fowler'),
	('Robbie Fowler', 'England', 'fowler'),
	('Ian Wright', 'England', 'ian wright'),
	('Ian Wright', 'England', 'wright'),
	('Roy Keane', 'Republic of Ireland', 'roy keane'),
	('Roy Keane', 'Republic of Ireland', 'keane'),
	('Robbie Keane', 'Republic of Ireland', 'robbie keane'),
	('Robbie Keane', 'Republic of Ireland', 'keane'),
	('Shay Given', 'Republic of Ireland', 'shay given'),
	('Shay Given', 'Republic of Ireland', 'given'),
	('Declan Rice', 'England', 'declan rice'),
	('Declan Rice', 'England', 'rice'),
	('Phil Foden', 'England', 'phil foden'),
	('Phil Foden', 'England', 'foden'),
	('Jude Bellingham', 'England', 'jude bellingham'),
	('Jude Bellingham', 'England', 'bellingham'),
	('Bukayo Saka', 'England', 'bukayo saka'),
	('Bukayo Saka', 'England', 'saka'),
	('Aaron Ramsdale', 'England', 'aaron ramsdale'),
	('Aaron Ramsdale', 'England', 'ramsdale'),
	('Andy Robertson', 'Scotland', 'andy robertson'),
	('Andy Robertson', 'Scotland', 'robertson'),
	('Kieran Tierney', 'Scotland', 'kieran tierney'),
	('Kieran Tierney', 'Scotland', 'tierney'),
	('Stuart Armstrong', 'Scotland', 'stuart armstrong'),
	('Stuart Armstrong', 'Scotland', 'armstrong'),
	('John McGinn', 'Scotland', 'john mcginn'),
	('John McGinn', 'Scotland', 'mcginn'),
	('Callum McGregor', 'Scotland', 'callum mcgregor'),
	('Callum McGregor', 'Scotland', 'mcgregor'),
	('Aaron Wan-Bissaka', 'England', 'aaron wan-bissaka'),
	('Aaron Wan-Bissaka', 'England', 'wan-bissaka'),
	('Reece James', 'England', 'reece james'),
	('Reece James', 'England', 'james'),
	('Ben Chilwell', 'England', 'ben chilwell'),
	('Ben Chilwell', 'England', 'chilwell'),
	('Darren Moore', 'England', 'darren moore'),
	('Darren Moore', 'England', 'moore'),
	('Nigel Clough', 'England', 'nigel clough'),
	('Nigel Clough', 'England', 'clough'),
	('Stuart Pearce', 'England', 'stuart pearce'),
	('Stuart Pearce', 'England', 'pearce')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';

WITH v(name, cat, alias) AS (VALUES
	('Ray Wilkins', 'England', 'ray wilkins'),
	('Ray Wilkins', 'England', 'wilkins'),
	('Trevor Francis', 'England', 'trevor francis'),
	('Trevor Francis', 'England', 'francis'),
	('Kenny Sansom', 'England', 'kenny sansom'),
	('Kenny Sansom', 'England', 'sansom'),
	('Emi Buendia', 'Argentina', 'emi buendia'),
	('Emi Buendia', 'Argentina', 'buendia'),
	('Lloyd Kelly', 'England', 'lloyd kelly'),
	('Lloyd Kelly', 'England', 'kelly'),
	('Nathan Collins', 'Republic of Ireland', 'nathan collins'),
	('Nathan Collins', 'Republic of Ireland', 'collins'),
	('Mark Sykes', 'England', 'mark sykes'),
	('Mark Sykes', 'England', 'sykes'),
	('Robert Snodgrass', 'Scotland', 'robert snodgrass'),
	('Robert Snodgrass', 'Scotland', 'snodgrass'),
	('Callum Styles', 'England', 'callum styles'),
	('Callum Styles', 'England', 'styles'),
	('Tyler Dibling', 'England', 'tyler dibling'),
	('Tyler Dibling', 'England', 'dibling'),
	('Gustavo Hamer', 'Netherlands', 'gustavo hamer'),
	('Gustavo Hamer', 'Netherlands', 'hamer'),
	('Jaidon Anthony', 'England', 'jaidon anthony'),
	('Jaidon Anthony', 'England', 'anthony'),
	('Jarill Pelupessy', 'Netherlands', 'jarill pelupessy'),
	('Jarill Pelupessy', 'Netherlands', 'pelupessy'),
	('John Lundstram', 'England', 'john lundstram'),
	('John Lundstram', 'England', 'lundstram'),
	('Jonny Otto', 'Spain', 'jonny otto'),
	('Jonny Otto', 'Spain', 'otto'),
	('Pablo Rosario', 'Netherlands', 'pablo rosario'),
	('Pablo Rosario', 'Netherlands', 'rosario'),
	('Hayden Hackney', 'England', 'hayden hackney'),
	('Hayden Hackney', 'England', 'hackney'),
	('Alan Browne', 'Republic of Ireland', 'alan browne'),
	('Alan Browne', 'Republic of Ireland', 'browne'),
	('Daniel Ballard', 'England', 'daniel ballard'),
	('Daniel Ballard', 'England', 'ballard'),
	('Seamus Maguire', 'Republic of Ireland', 'seamus maguire'),
	('Seamus Maguire', 'Republic of Ireland', 'maguire'),
	('Callum Hudson-Odoi', 'England', 'callum hudson-odoi'),
	('Callum Hudson-Odoi', 'England', 'hudson-odoi'),
	('Dani Ceballos', 'Spain', 'dani ceballos'),
	('Dani Ceballos', 'Spain', 'ceballos'),
	('Mohamed Sylla', 'Guinea', 'mohamed sylla'),
	('Mohamed Sylla', 'Guinea', 'sylla'),
	('Amos Pieta', 'Ivory Coast', 'amos pieta'),
	('Amos Pieta', 'Ivory Coast', 'pieta'),
	('Oscar Gloukh', 'Israel', 'oscar gloukh'),
	('Oscar Gloukh', 'Israel', 'gloukh')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';

WITH v(name, cat, alias) AS (VALUES
	('Marcus McGuane', 'England', 'marcus mcguane'),
	('Marcus McGuane', 'England', 'mcguane'),
	('Romain Esse', 'England', 'romain esse'),
	('Romain Esse', 'England', 'esse'),
	('Chiquinho', 'Portugal', 'chiquinho'),
	('Liam Palmer', 'England', 'liam palmer'),
	('Liam Palmer', 'England', 'palmer'),
	('Alfie Doughty', 'England', 'alfie doughty'),
	('Alfie Doughty', 'England', 'doughty'),
	('Duane Holmes', 'United States', 'duane holmes'),
	('Duane Holmes', 'United States', 'holmes'),
	('Alex King', 'England', 'alex king'),
	('Alex King', 'England', 'king'),
	('Andy Carroll', 'England', 'andy carroll'),
	('Andy Carroll', 'England', 'carroll'),
	('Lynden Gooch', 'United States', 'lynden gooch'),
	('Lynden Gooch', 'United States', 'gooch'),
	('George Honeyman', 'England', 'george honeyman'),
	('George Honeyman', 'England', 'honeyman'),
	('Tatsuhiro Sakamoto', 'Japan', 'tatsuhiro sakamoto'),
	('Tatsuhiro Sakamoto', 'Japan', 'sakamoto'),
	('Matt Grimes', 'Wales', 'matt grimes'),
	('Matt Grimes', 'Wales', 'grimes'),
	('Jamal Lowe', 'England', 'jamal lowe'),
	('Jamal Lowe', 'England', 'lowe'),
	('Kasey Palmer', 'England', 'kasey palmer'),
	('Kasey Palmer', 'England', 'palmer'),
	('Jayson Molumby', 'Republic of Ireland', 'jayson molumby'),
	('Jayson Molumby', 'Republic of Ireland', 'molumby'),
	('Alfie May', 'England', 'alfie may'),
	('Alfie May', 'England', 'may'),
	('Jaidon Carty', 'England', 'jaidon carty'),
	('Jaidon Carty', 'England', 'carty'),
	('Caeser Sanchez', 'Equatorial Guinea', 'caeser sanchez'),
	('Caeser Sanchez', 'Equatorial Guinea', 'sanchez'),
	('Dan Barlaser', 'England', 'dan barlaser'),
	('Dan Barlaser', 'England', 'barlaser'),
	('Aden Flint', 'England', 'aden flint'),
	('Aden Flint', 'England', 'flint'),
	('Kike Salas', 'Spain', 'kike salas'),
	('Kike Salas', 'Spain', 'salas'),
	('Kal Naismith', 'Scotland', 'kal naismith'),
	('Kal Naismith', 'Scotland', 'naismith'),
	('Mackenzie Kirk', 'Scotland', 'mackenzie kirk'),
	('Mackenzie Kirk', 'Scotland', 'kirk'),
	('Lyall McCallum', 'Scotland', 'lyall mccallum'),
	('Lyall McCallum', 'Scotland', 'mccallum')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.category = v.cat AND re.entity_type = 'player';

-- Club aliases for Championship, League One, League Two, and Scottish clubs

WITH v(name, alias) AS (VALUES
	('Bristol City', 'bristol'),
	('Bristol City', 'bristol city'),
	('Coventry City', 'coventry'),
	('Coventry City', 'coventry city'),
	('Coventry City', 'cov city'),
	('Derby County', 'derby'),
	('Derby County', 'derby county'),
	('Huddersfield Town', 'huddersfield'),
	('Huddersfield Town', 'huddersfield town'),
	('Hull City', 'hull'),
	('Hull City', 'hull city'),
	('Ipswich Town', 'ipswich'),
	('Ipswich Town', 'ipswich town'),
	('Leeds United', 'leeds'),
	('Leeds United', 'leeds united'),
	('Leicester City', 'leicester'),
	('Leicester City', 'leicester city'),
	('Luton Town', 'luton'),
	('Luton Town', 'luton town'),
	('Millwall', 'millwall'),
	('Middlesbrough', 'middlesbrough'),
	('Middlesbrough', 'boro'),
	('Norwich City', 'norwich'),
	('Norwich City', 'norwich city'),
	('Portsmouth', 'portsmouth'),
	('Portsmouth', 'pompey'),
	('Preston North End', 'preston'),
	('Preston North End', 'preston north end'),
	('Preston North End', 'pne'),
	('Queens Park Rangers', 'qpr'),
	('Queens Park Rangers', 'queens park rangers'),
	('Reading', 'reading'),
	('Sheffield United', 'sheffield united'),
	('Sheffield United', 'sheff united'),
	('Sheffield United', 'blades'),
	('Sheffield Wednesday', 'sheffield wednesday'),
	('Sheffield Wednesday', 'sheff wednesday'),
	('Sheffield Wednesday', 'owls'),
	('Southampton', 'southampton'),
	('Southampton', 'saints'),
	('Stoke City', 'stoke'),
	('Stoke City', 'stoke city'),
	('Sunderland', 'sunderland'),
	('Sunderland', 'safc'),
	('Swansea City', 'swansea'),
	('Swansea City', 'swansea city'),
	('Swansea City', 'swans'),
	('Watford', 'watford'),
	('Watford', 'hornets'),
	('Wrexham', 'wrexham'),
	('AFC Wimbledon', 'wimbledon'),
	('AFC Wimbledon', 'afc wimbledon'),
	('Barnsley', 'barnsley'),
	('Blackpool', 'blackpool'),
	('Bolton Wanderers', 'bolton'),
	('Bolton Wanderers', 'bolton wanderers'),
	('Bradford City', 'bradford'),
	('Bradford City', 'bradford city'),
	('Burton Albion', 'burton'),
	('Burton Albion', 'burton albion'),
	('Doncaster Rovers', 'doncaster'),
	('Doncaster Rovers', 'doncaster rovers'),
	('Exeter City', 'exeter'),
	('Exeter City', 'exeter city'),
	('Leyton Orient', 'leyton orient'),
	('Leyton Orient', 'orient'),
	('Lincoln City', 'lincoln'),
	('Lincoln City', 'lincoln city'),
	('Mansfield Town', 'mansfield'),
	('Mansfield Town', 'mansfield town'),
	('Northampton Town', 'northampton'),
	('Northampton Town', 'northampton town'),
	('Peterborough United', 'peterborough'),
	('Peterborough United', 'peterborough united'),
	('Peterborough United', 'posh'),
	('Plymouth Argyle', 'plymouth'),
	('Plymouth Argyle', 'plymouth argyle'),
	('Port Vale', 'port vale'),
	('Rotherham United', 'rotherham'),
	('Rotherham United', 'rotherham united'),
	('Salford City', 'salford'),
	('Salford City', 'salford city'),
	('Stevenage', 'stevenage'),
	('Stockport County', 'stockport'),
	('Stockport County', 'stockport county'),
	('Tranmere Rovers', 'tranmere'),
	('Tranmere Rovers', 'tranmere rovers'),
	('Wigan Athletic', 'wigan'),
	('Wigan Athletic', 'wigan athletic'),
	('Wycombe Wanderers', 'wycombe'),
	('Wycombe Wanderers', 'wycombe wanderers'),
	('Charlton Athletic', 'charlton'),
	('Charlton Athletic', 'charlton athletic'),
	('Oxford United', 'oxford'),
	('Oxford United', 'oxford united'),
	('Accrington Stanley', 'accrington'),
	('Accrington Stanley', 'accrington stanley'),
	('Barrow', 'barrow'),
	('Cheltenham Town', 'cheltenham'),
	('Cheltenham Town', 'cheltenham town')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.entity_type = 'club';

WITH v(name, alias) AS (VALUES
	('Colchester United', 'colchester'),
	('Colchester United', 'colchester united'),
	('Crewe Alexandra', 'crewe'),
	('Crewe Alexandra', 'crewe alexandra'),
	('Crawley Town', 'crawley'),
	('Crawley Town', 'crawley town'),
	('Forest Green Rovers', 'forest green'),
	('Forest Green Rovers', 'forest green rovers'),
	('Gillingham', 'gillingham'),
	('Grimsby Town', 'grimsby'),
	('Grimsby Town', 'grimsby town'),
	('Harrogate Town', 'harrogate'),
	('Harrogate Town', 'harrogate town'),
	('Maidenhead United', 'maidenhead'),
	('Maidenhead United', 'maidenhead united'),
	('Notts County', 'notts county'),
	('Notts County', 'notts'),
	('Oldham Athletic', 'oldham'),
	('Oldham Athletic', 'oldham athletic'),
	('Swindon Town', 'swindon'),
	('Swindon Town', 'swindon town'),
	('Morecambe', 'morecambe'),
	('MK Dons', 'mk dons'),
	('MK Dons', 'mk'),
	('Newport County', 'newport'),
	('Newport County', 'newport county'),
	('Salop United', 'salop'),
	('Salop United', 'salop united'),
	('Salop United', 'shrewsbury'),
	('Southend United', 'southend'),
	('Southend United', 'southend united'),
	('Sutton United', 'sutton'),
	('Sutton United', 'sutton united'),
	('Torquay United', 'torquay'),
	('Torquay United', 'torquay united'),
	('Walsall', 'walsall'),
	('Wimbledon', 'wimbledon'),
	('Aberdeen', 'aberdeen'),
	('Aberdeen', 'afc'),
	('Celtic', 'celtic'),
	('Dundee', 'dundee'),
	('Dundee United', 'dundee united'),
	('Dundee United', 'united'),
	('Hearts', 'hearts'),
	('Hibernian', 'hibernian'),
	('Hibernian', 'hibs'),
	('Kilmarnock', 'kilmarnock'),
	('Kilmarnock', 'killie'),
	('Motherwell', 'motherwell'),
	('Motherwell', 'well'),
	('Rangers', 'rangers'),
	('Rangers', 'gers'),
	('Ross County', 'ross county'),
	('Ross County', 'ross'),
	('St Johnstone', 'st johnstone'),
	('St Johnstone', 'saints'),
	('St Mirren', 'st mirren'),
	('St Mirren', 'mirren')
)
INSERT INTO reference_entity_aliases (entity_id, alias)
SELECT re.id, v.alias FROM v
JOIN reference_entities re ON re.canonical_name = v.name AND re.entity_type = 'club';


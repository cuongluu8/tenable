-- Research output: career stats for players_batch1.csv
-- as_of_date/verified_at = 2026-08-31 for all rows (current totals as researched on that date).
-- Sourced from web search synthesis of Transfermarkt / Wikipedia / ESPN / StatMuse etc.
-- FOR HUMAN REVIEW BEFORE APPLYING. Not applied to any database by the research agent.

-- Lionel Messi (entity_id 530)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(530, 'career-goals', 'career', 802, '802 (club competitions only, excl. ~125 international goals)', '2026-08-31', 'Transfermarkt/ESPN aggregate', '2026-08-31'),
(530, 'career-appearances', 'career', 964, '964 (club competitions only)', '2026-08-31', 'Transfermarkt/ESPN aggregate', '2026-08-31'),
(530, 'career-assists', 'career', 353, '353 (club competitions only)', '2026-08-31', 'Transfermarkt/ESPN aggregate', '2026-08-31'),
(530, 'career-red-cards', 'career', 2, '2 (club competitions only)', '2026-08-31', 'PlanetFootball/YourSoccerHome', '2026-08-31');

-- Cristiano Ronaldo (entity_id 531)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(531, 'career-goals', 'career', 830, '830 (club competitions only, excl. ~146 international goals)', '2026-08-31', 'messixronaldo.com aggregate/Transfermarkt', '2026-08-31'),
(531, 'career-appearances', 'career', 1333, '1333 (club + international combined)', '2026-08-31', 'messixronaldo.com aggregate', '2026-08-31'),
(531, 'career-assists', 'career', 291, '291 (club + international combined)', '2026-08-31', 'messixronaldo.com aggregate', '2026-08-31');

-- Ronaldo Nazario (entity_id 532)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(532, 'career-goals', 'career', 351, '351 (club competitions only, excl. 62 international goals)', '2026-08-31', 'Sportskeeda/Wikipedia aggregate', '2026-08-31'),
(532, 'career-appearances', 'career', 518, '518 (club competitions only)', '2026-08-31', 'Sportskeeda/Wikipedia aggregate', '2026-08-31');

-- Ronaldinho (entity_id 533)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(533, 'career-goals', 'career', 273, '273 (club competitions only, sum of per-club totals; excl. international)', '2026-08-31', 'StatMuse aggregate', '2026-08-31'),
(533, 'career-appearances', 'career', 675, '675 (club competitions only, sum of per-club totals)', '2026-08-31', 'StatMuse aggregate', '2026-08-31');

-- Zinedine Zidane (entity_id 534)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(534, 'career-goals', 'career', 125, '125 (club competitions only, excl. 31 international goals)', '2026-08-31', 'Grokipedia/Wikipedia aggregate', '2026-08-31'),
(534, 'career-appearances', 'career', 639, '639 (club competitions only)', '2026-08-31', 'Grokipedia/Wikipedia aggregate', '2026-08-31');

-- Neymar (entity_id 535)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(535, 'career-goals', 'career', 360, '360 (club competitions only, sum Santos/Barcelona/PSG/Al Hilal; excl. international, excl. 2025-26 Santos return spell)', '2026-08-31', 'Britannica/FotMob aggregate', '2026-08-31'),
(535, 'career-appearances', 'career', 591, '591 (club competitions only, sum Santos/Barcelona/PSG/Al Hilal; excl. 2025-26 Santos return spell)', '2026-08-31', 'Britannica/FotMob aggregate', '2026-08-31');

-- Kylian Mbappe (entity_id 536)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(536, 'career-goals', 'career', 420, '420 (club competitions only)', '2026-08-31', 'Goal.com/FootyStats aggregate', '2026-08-31'),
(536, 'career-appearances', 'career', 544, '544 (club competitions only)', '2026-08-31', 'Goal.com/FootyStats aggregate', '2026-08-31'),
(536, 'career-assists', 'career', 131, '131 (club competitions only)', '2026-08-31', 'Goal.com/FootyStats aggregate', '2026-08-31');

-- Erling Haaland (entity_id 537)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(537, 'career-goals', 'career', 356, '356 (club competitions only)', '2026-08-31', 'FootyStats/Goal.com aggregate', '2026-08-31'),
(537, 'career-appearances', 'career', 424, '424 (club competitions only)', '2026-08-31', 'FootyStats/Goal.com aggregate', '2026-08-31'),
(537, 'career-assists', 'career', 65, '65 (club competitions only)', '2026-08-31', 'FootyStats/Goal.com aggregate', '2026-08-31');

-- Robert Lewandowski (entity_id 538)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(538, 'career-goals', 'career', 638, '638 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31'),
(538, 'career-appearances', 'career', 873, '873 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31'),
(538, 'career-assists', 'career', 125, '125 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31');

-- Karim Benzema (entity_id 539)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(539, 'career-goals', 'career', 422, '422 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31'),
(539, 'career-appearances', 'career', 753, '753 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31'),
(539, 'career-assists', 'career', 171, '171 (club competitions only)', '2026-08-31', 'StatMuse/FBref aggregate', '2026-08-31');

-- Luka Modric (entity_id 540)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(540, 'career-goals', 'career', 77, '77 (club competitions only)', '2026-08-31', 'StatMuse aggregate', '2026-08-31'),
(540, 'career-appearances', 'career', 860, '860 (club competitions only)', '2026-08-31', 'StatMuse aggregate', '2026-08-31'),
(540, 'career-assists', 'career', 122, '122 (club competitions only)', '2026-08-31', 'StatMuse aggregate', '2026-08-31');

-- Kevin De Bruyne (entity_id 541)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(541, 'career-goals', 'career', 171, '171 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(541, 'career-appearances', 'career', 650, '650 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(541, 'career-assists', 'career', 253, '253 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31');

-- Mohamed Salah (entity_id 542)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(542, 'career-goals', 'career', 351, '351 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(542, 'career-appearances', 'career', 705, '705 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(542, 'career-assists', 'career', 160, '160 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31');

-- Sadio Mane (entity_id 543)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(543, 'career-goals', 'career', 258, '258 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(543, 'career-appearances', 'career', 639, '639 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31'),
(543, 'career-assists', 'career', 111, '111 (club competitions only)', '2026-08-31', 'Goal.com aggregate', '2026-08-31');

-- Harry Kane (entity_id 544)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(544, 'career-goals', 'career', 506, '506 (club competitions only)', '2026-08-31', 'NBC Sports/Yahoo aggregate', '2026-08-31'),
(544, 'career-appearances', 'career', 741, '741 (club competitions only)', '2026-08-31', 'NBC Sports/Yahoo aggregate', '2026-08-31'),
(544, 'career-assists', 'career', 108, '108 (club competitions only)', '2026-08-31', 'NBC Sports/Yahoo aggregate', '2026-08-31');

-- Thierry Henry (entity_id 545)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(545, 'career-goals', 'career', 360, '360 (club competitions only, excl. 51 international goals)', '2026-08-31', 'FOX Sports aggregate', '2026-08-31');

-- Didier Drogba (entity_id 546)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(546, 'career-goals', 'career', 241, '~241 (club competitions only, approximate per aggregate reporting)', '2026-08-31', 'FBref/StatMuse aggregate', '2026-08-31'),
(546, 'career-appearances', 'career', 610, '~610 (club competitions only, approximate per aggregate reporting)', '2026-08-31', 'FBref/StatMuse aggregate', '2026-08-31');

-- Samuel Eto'o (entity_id 547)
INSERT INTO entity_stats (entity_id, stat_key, scope, value_numeric, display_value, as_of_date, source, verified_at) VALUES
(547, 'career-goals', 'career', 420, '420 (club competitions only, widely cited aggregate)', '2026-08-31', 'Aggregate stat compilation (Facebook/inkhel), moderate confidence', '2026-08-31'),
(547, 'career-appearances', 'career', 847, '847 (club competitions only, widely cited aggregate)', '2026-08-31', 'Aggregate stat compilation (Facebook/inkhel), moderate confidence', '2026-08-31'),
(547, 'career-assists', 'career', 122, '122 (club competitions only, widely cited aggregate)', '2026-08-31', 'Aggregate stat compilation (Facebook/inkhel), moderate confidence', '2026-08-31');

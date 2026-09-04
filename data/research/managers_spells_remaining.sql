-- Remaining (not-yet-applied to production) portion of managers_spells.sql
-- Cut at manager_id 19213 (Luis Aragones) through end of file — everything before this
-- (manager_id 19180-19212) is already applied to production D1, verified via:
--   SELECT DISTINCT manager_id FROM management_spells ORDER BY manager_id;
-- Apply this file ONCE only (no uniqueness constraint on management_spells — re-running
-- it would duplicate rows). See docs/stats-enrichment.md for the apply commands.

-- Luis Aragones (entity_id 19213)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19213, 205, '1974-01-01', '1978-01-01', '1x La Liga (1977), 1x Copa del Rey (1976), 1x Intercontinental Cup (1974)', 'Wikipedia', '2026-08-31'),
(19213, 205, '1979-01-01', '1980-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 216, '1981-01-01', '1981-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 205, '1982-01-01', '1986-01-01', '1x Copa del Rey (1985)', 'Wikipedia', '2026-08-31'),
(19213, 206, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 209, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 205, '1991-01-01', '1993-01-01', '1x Copa del Rey (1992)', 'Wikipedia', '2026-08-31'),
(19213, 220, '1993-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 221, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 216, '1997-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 218, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 213, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 205, '2001-01-01', '2003-01-01', '1x Segunda Division title (2002)', 'Wikipedia', '2026-08-31'),
(19213, 213, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19213, 470, '2004-07-01', '2008-06-01', '1x UEFA European Championship (2008)', 'Wikipedia', '2026-08-31'),
(19213, 290, '2008-07-05', '2009-06-02', NULL, 'Wikipedia', '2026-08-31');

-- Luis Enrique (entity_id 19214)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19214, NULL, '2008-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19214, 239, '2011-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19214, 207, '2013-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19214, 206, '2014-05-01', '2017-05-01', '2x La Liga, 1x Champions League, 2x Copa del Rey (2015 treble)', 'Wikipedia', '2026-08-31'),
(19214, 470, '2018-07-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19214, 470, '2019-11-01', '2022-12-08', NULL, 'Wikipedia', '2026-08-31'),
(19214, 261, '2023-07-01', NULL, '2x Ligue 1, 1x Champions League (2025), 1x Coupe de France', 'Wikipedia', '2026-08-31');

-- Rafael Benitez (entity_id 19215) — Dalian Professional club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19215, 404, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 214, '1996-01-01', '1996-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 19075, '1997-01-01', '1999-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 417, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 221, '2001-01-01', '2004-06-01', '2x La Liga, 1x UEFA Cup', 'Wikipedia', '2026-08-31'),
(19215, 194, '2004-06-01', '2010-06-01', '1x Champions League (2005), 1x FA Cup (2006)', 'Wikipedia', '2026-08-31'),
(19215, 231, '2010-06-01', '2010-12-01', '1x FIFA Club World Cup, 1x Supercoppa Italiana', 'Wikipedia', '2026-08-31'),
(19215, 189, '2012-11-01', '2013-05-01', '1x Europa League (2013)', 'Wikipedia', '2026-08-31'),
(19215, 236, '2013-06-01', '2015-06-01', '1x Coppa Italia, 1x Supercoppa Italiana', 'Wikipedia', '2026-08-31'),
(19215, 217, '2015-06-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 197, '2016-03-01', '2019-06-01', '1x Championship title (2017)', 'Wikipedia', '2026-08-31'),
(19215, NULL, '2019-06-01', '2021-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 191, '2021-06-01', '2022-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 207, '2023-01-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19215, 298, '2025-10-01', '2026-05-23', NULL, 'Greek City Times', '2026-08-31');

-- Unai Emery (entity_id 19216) — Lorca Deportiva, Spartak Moscow club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19216, NULL, '2004-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19216, 408, '2006-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19216, 221, '2008-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19216, NULL, '2012-01-01', '2012-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19216, 220, '2013-01-01', '2016-01-01', '3x UEFA Europa League', 'Wikipedia', '2026-08-31'),
(19216, 261, '2016-01-01', '2018-01-01', '1x Ligue 1, 2x Coupe de France, 2x Coupe de la Ligue, 2x Trophee des Champions', 'Wikipedia', '2026-08-31'),
(19216, 183, '2018-05-01', '2019-11-01', NULL, 'Wikipedia', '2026-08-31'),
(19216, 222, '2020-01-01', '2022-05-01', '1x UEFA Europa League (2021)', 'Wikipedia', '2026-08-31'),
(19216, 184, '2022-11-01', NULL, '1x UEFA Europa League (2026)', 'Wikipedia', '2026-08-31');

-- Xavi Hernandez (entity_id 19217) — Al Sadd club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19217, NULL, '2019-05-01', '2021-01-01', '7 trophies incl. Qatar Stars League (2020-21)', 'Wikipedia', '2026-08-31'),
(19217, 206, '2021-11-01', '2024-06-01', '1x La Liga (2023), 1x Supercopa de Espana (2023)', 'Wikipedia', '2026-08-31');

-- Xabi Alonso (entity_id 19218)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19218, NULL, '2019-01-01', '2022-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19218, 246, '2022-10-01', '2025-06-01', '1x Bundesliga (2024), 1x DFB-Pokal (2024)', 'Wikipedia', '2026-08-31'),
(19218, 217, '2025-06-01', '2026-01-13', NULL, 'ESPN', '2026-08-31'),
(19218, 189, '2026-07-01', NULL, NULL, 'Sportbible', '2026-08-31');

-- Carlo Ancelotti (entity_id 19219)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19219, 19082, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19219, 237, '1996-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19219, 232, '1999-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19219, 235, '2001-11-01', '2009-05-01', '1x Serie A, 2x Champions League, 2x Coppa Italia, 2x Supercoppa', 'Wikipedia', '2026-08-31'),
(19219, 189, '2009-06-01', '2011-05-01', '1x Premier League, 1x FA Cup (2010 double)', 'Wikipedia', '2026-08-31'),
(19219, 261, '2011-12-01', '2013-06-01', '1x Ligue 1', 'Wikipedia', '2026-08-31'),
(19219, 217, '2013-06-01', '2015-05-01', '1x Champions League (2014), 1x Copa del Rey', 'Wikipedia', '2026-08-31'),
(19219, 243, '2016-07-01', '2017-09-01', '1x Bundesliga', 'Wikipedia', '2026-08-31'),
(19219, 236, '2018-05-01', '2019-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19219, 191, '2019-12-01', '2021-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19219, 217, '2021-06-01', '2025-05-01', '2x Champions League, 2x La Liga (2022, 2024)', 'Wikipedia', '2026-08-31'),
(19219, 19157, '2025-05-26', NULL, NULL, 'Olympics.com', '2026-08-31');

-- Giovanni Trapattoni (entity_id 19220)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19220, 235, '1974-01-01', '1974-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 235, '1975-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 232, '1976-01-01', '1986-01-01', '6x Serie A, 2x Coppa Italia, 1x Cup Winners Cup, 2x UEFA Cup, 1x UEFA Super Cup, 1x Intercontinental Cup', 'Wikipedia', '2026-08-31'),
(19220, 231, '1986-01-01', '1991-01-01', '1x Serie A (1989)', 'Wikipedia', '2026-08-31'),
(19220, 232, '1991-01-01', '1994-01-01', '1x UEFA Cup (1993)', 'Wikipedia', '2026-08-31'),
(19220, 243, '1994-01-01', '1995-01-01', '1x Bundesliga', 'Wikipedia', '2026-08-31'),
(19220, 225, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 243, '1996-01-01', '1998-01-01', '1x Bundesliga, 1x DFB-Pokal', 'Wikipedia', '2026-08-31'),
(19220, 228, '1998-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 445, '2000-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 280, '2004-01-01', '2005-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 247, '2005-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 294, '2006-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19220, 462, '2008-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Fabio Capello (entity_id 19221) — Jiangsu Suning club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19221, 235, '1991-01-01', '1996-01-01', '4x Serie A, 1x Champions League (1994)', 'Wikipedia', '2026-08-31'),
(19221, 217, '1996-01-01', '1997-01-01', '1x La Liga', 'Wikipedia', '2026-08-31'),
(19221, 235, '1997-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19221, 239, '1999-01-01', '2004-01-01', '1x Serie A (2001)', 'Wikipedia', '2026-08-31'),
(19221, 232, '2004-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19221, 217, '2006-01-01', '2007-01-01', '1x La Liga (2007)', 'Wikipedia', '2026-08-31'),
(19221, 433, '2007-12-01', '2012-02-01', NULL, 'Wikipedia', '2026-08-31'),
(19221, 464, '2012-07-01', '2015-08-01', NULL, 'Wikipedia', '2026-08-31'),
(19221, NULL, '2017-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Marcello Lippi (entity_id 19222) — Pontedera, Pistoiese, Carrarese, Lucchese, Guangzhou Evergrande, China club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19222, NULL, '1985-01-01', '1986-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 19086, '1986-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, NULL, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, NULL, '1988-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 19095, '1989-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, NULL, '1991-01-01', '1992-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 223, '1992-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 236, '1993-01-01', '1994-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 232, '1994-01-01', '1999-01-01', '5x Serie A, 1x Coppa Italia, 4x Supercoppa Italiana, 1x Champions League (1996)', 'Wikipedia', '2026-08-31'),
(19222, 231, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 232, '2001-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, 445, '2004-01-01', '2006-07-01', '1x World Cup (2006)', 'Wikipedia', '2026-08-31'),
(19222, 445, '2008-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19222, NULL, '2012-01-01', '2014-01-01', '3x Chinese Super League, 1x AFC Champions League', 'Wikipedia', '2026-08-31'),
(19222, NULL, '2016-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Nereo Rocco (entity_id 19223) — Triestina, Padova club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19223, NULL, '1947-01-01', '1950-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, 19101, '1950-01-01', '1953-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, NULL, '1953-01-01', '1954-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, NULL, '1954-01-01', '1961-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, 235, '1961-01-01', '1963-01-01', '1x Serie A, 1x European Cup (1963)', 'Wikipedia', '2026-08-31'),
(19223, 241, '1963-01-01', '1967-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, 235, '1967-01-01', '1972-01-01', '1x Serie A (1968), 1x European Cup (1969), 1x Cup Winners Cup (1968), 1x Intercontinental Cup (1969)', 'Wikipedia', '2026-08-31'),
(19223, 235, '1973-01-01', '1973-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, 228, '1974-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19223, 235, '1977-01-01', '1977-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Vittorio Pozzo (entity_id 19224)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19224, 241, '1912-01-01', '1922-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19224, 235, '1924-01-01', '1926-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19224, 445, '1929-12-01', '1948-08-01', '2x World Cup (1934, 1938), 1x Olympic gold (1936)', 'Wikipedia', '2026-08-31');

-- Claudio Ranieri (entity_id 19225) — Vigor Lamezia, Puteolana club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19225, NULL, '1986-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, NULL, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 225, '1988-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 236, '1991-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 228, '1993-01-01', '1997-01-01', '1x Coppa Italia (1996), 1x Supercoppa Italiana (1996)', 'Wikipedia', '2026-08-31'),
(19225, 221, '1997-01-01', '1999-01-01', '1x Copa del Rey, 1x UEFA Intertoto Cup', 'Wikipedia', '2026-08-31'),
(19225, 205, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 189, '2000-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 221, '2004-01-01', '2005-01-01', '1x UEFA Super Cup (2004)', 'Wikipedia', '2026-08-31'),
(19225, 237, '2007-01-01', '2007-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 232, '2007-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 239, '2009-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 231, '2011-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 264, '2012-01-01', '2014-01-01', '1x Ligue 2 title (2013)', 'Wikipedia', '2026-08-31'),
(19225, 441, '2014-01-01', '2014-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 305, '2015-07-01', '2017-02-01', '1x Premier League title (2016)', 'Wikipedia', '2026-08-31'),
(19225, 271, '2017-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 192, '2018-11-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 239, '2019-03-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 19053, '2019-06-01', '2021-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 311, '2021-09-01', '2022-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 225, '2023-01-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19225, 239, '2024-01-01', '2025-05-01', NULL, 'Wikipedia', '2026-08-31');

-- Antonio Conte (entity_id 19226) — Arezzo, Bari club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19226, NULL, '2006-01-01', '2006-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, NULL, '2007-01-01', '2007-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, 19055, '2007-01-01', '2009-01-01', '1x Serie B title (2009)', 'Wikipedia', '2026-08-31'),
(19226, 223, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, 19086, '2010-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, 232, '2011-01-01', '2014-01-01', '3x Serie A title', 'Wikipedia', '2026-08-31'),
(19226, 445, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, 189, '2016-01-01', '2018-01-01', '1x Premier League, 1x FA Cup', 'Wikipedia', '2026-08-31'),
(19226, 231, '2019-01-01', '2021-01-01', '1x Serie A title (2021)', 'Wikipedia', '2026-08-31'),
(19226, 200, '2021-01-01', '2023-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19226, 236, '2024-05-01', '2026-05-01', '1x Serie A title (2025)', 'Wikipedia', '2026-08-31');

-- Massimiliano Allegri (entity_id 19227) — Aglianese, SPAL, Grosseto, Sassuolo club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19227, NULL, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19227, NULL, '2004-01-01', '2005-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19227, NULL, '2005-01-01', '2007-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19227, 240, '2007-01-01', '2008-01-01', '1x Serie C1 title, 1x Super Cup', 'Wikipedia', '2026-08-31'),
(19227, 225, '2008-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19227, 235, '2010-01-01', '2014-01-01', '1x Serie A (2011), 1x Supercoppa Italiana', 'Wikipedia', '2026-08-31'),
(19227, 232, '2014-01-01', '2019-01-01', '5x Serie A, 4x Coppa Italia, 2x Supercoppa', 'Wikipedia', '2026-08-31'),
(19227, 232, '2021-01-01', '2024-01-01', '1x Coppa Italia (2024)', 'Wikipedia', '2026-08-31'),
(19227, 235, '2025-05-30', NULL, NULL, 'ESPN', '2026-08-31');

-- Roberto Mancini (entity_id 19228) — Al-Sadd, Saudi Arabia, Zenit Saint Petersburg club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19228, 228, '2001-01-01', '2002-01-01', '1x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19228, 233, '2002-01-01', '2004-01-01', '1x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19228, 231, '2004-01-01', '2008-01-01', '3x Serie A title', 'Wikipedia', '2026-08-31'),
(19228, 195, '2009-12-01', '2013-05-01', '1x Premier League (2012), 1x FA Cup (2011)', 'Wikipedia', '2026-08-31'),
(19228, 289, '2013-09-01', '2014-06-01', '1x Turkish Cup', 'Wikipedia', '2026-08-31'),
(19228, 231, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19228, NULL, '2017-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19228, 445, '2018-05-01', '2023-08-01', '1x UEFA European Championship (2021)', 'Wikipedia', '2026-08-31'),
(19228, NULL, '2023-08-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19228, NULL, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Maurizio Sarri (entity_id 19229) — many lower-league Italian club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19229, NULL, '2005-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, NULL, '2006-01-01', '2007-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 230, '2007-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 19083, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 19088, '2012-01-01', '2015-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 236, '2015-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 189, '2018-01-01', '2019-01-01', '1x Europa League (2019)', 'Wikipedia', '2026-08-31'),
(19229, 232, '2019-01-01', '2020-01-01', '1x Serie A title (2020)', 'Wikipedia', '2026-08-31'),
(19229, 233, '2021-01-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19229, 233, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Cesare Maldini (entity_id 19230) — Foggia, Ternana club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19230, 235, '1972-01-01', '1974-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, NULL, '1974-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, NULL, '1976-01-01', '1977-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, 237, '1978-01-01', '1980-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, 445, '1996-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, 235, '2001-01-01', '2001-03-01', NULL, 'Wikipedia', '2026-08-31'),
(19230, 19159, '2001-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Roberto Di Matteo (entity_id 19231) — Milton Keynes Dons club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19231, NULL, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19231, 317, '2009-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19231, 189, '2012-03-01', '2012-11-21', '1x Champions League (2012), 1x FA Cup (2012)', 'Wikipedia', '2026-08-31'),
(19231, 19057, '2014-01-01', '2015-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19231, 184, '2016-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Andrea Pirlo (entity_id 19232) — Fatih Karagumruk, Dubai United club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19232, 232, '2020-08-01', '2021-05-01', '1x Supercoppa Italiana (2020), 1x Coppa Italia (2021)', 'Wikipedia', '2026-08-31'),
(19232, NULL, '2022-01-01', '2023-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19232, 19053, '2023-01-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19232, NULL, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Gennaro Gattuso (entity_id 19233) — Sion, Hajduk Split club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19233, NULL, '2013-01-01', '2013-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 19054, '2013-01-01', '2013-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 19015, '2014-01-01', '2014-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 238, '2015-01-01', '2017-01-01', '1x Serie B promotion (2016)', 'Wikipedia', '2026-08-31'),
(19233, 235, '2017-06-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 236, '2019-12-01', '2021-05-01', '1x Coppa Italia (2020)', 'Wikipedia', '2026-08-31'),
(19233, 228, '2021-06-01', '2021-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 221, '2022-01-01', '2023-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 262, '2023-06-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, NULL, '2024-06-01', '2025-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19233, 445, '2025-06-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Stefano Pioli (entity_id 19234) — Modena, Grosseto club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19234, 19090, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, NULL, '2004-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 237, '2006-01-01', '2007-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, NULL, '2007-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 19096, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 240, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 19080, '2010-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 19054, '2011-01-01', '2011-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 224, '2011-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 233, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 231, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 228, '2017-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 235, '2019-10-01', '2024-06-01', '1x Serie A (2022)', 'Wikipedia', '2026-08-31'),
(19234, 327, '2024-06-01', '2025-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19234, 228, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Simone Inzaghi (entity_id 19235)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19235, 233, '2016-04-01', '2021-06-01', '2x Italian Super Cup, 1x Coppa Italia (2019)', 'Wikipedia', '2026-08-31'),
(19235, 231, '2021-06-01', '2025-06-01', '1x Serie A (2024), 3x Italian Super Cup, 2x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19235, 328, '2025-06-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Johan Cruyff (entity_id 19236) — Catalonia club_id unresolved (not a FIFA national team)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19236, 283, '1985-01-01', '1988-01-01', '1x KNVB Cup, 1x European Cup Winners Cup (1987)', 'Wikipedia', '2026-08-31'),
(19236, 206, '1988-01-01', '1996-01-01', '4x La Liga, 1x European Cup (1992), 1x Copa del Rey', 'Wikipedia', '2026-08-31'),
(19236, NULL, '2009-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Rinus Michels (entity_id 19237) — Los Angeles Aztecs club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19237, 283, '1965-01-01', '1971-01-01', '4x Eredivisie, 3x KNVB Cup, 1x European Cup (1971)', 'Wikipedia', '2026-08-31'),
(19237, 206, '1971-01-01', '1975-01-01', '1x La Liga (1974)', 'Wikipedia', '2026-08-31'),
(19237, 456, '1974-01-01', '1974-07-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 283, '1975-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 206, '1976-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, NULL, '1979-01-01', '1980-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 259, '1980-01-01', '1983-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 456, '1984-01-01', '1985-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 456, '1986-01-01', '1988-01-01', '1x UEFA European Championship (1988)', 'Wikipedia', '2026-08-31'),
(19237, 246, '1988-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19237, 456, '1990-01-01', '1992-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Louis van Gaal (entity_id 19238)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19238, 283, '1991-01-01', '1997-01-01', '3x Eredivisie, 1x UEFA Cup, 1x Champions League (1995)', 'Wikipedia', '2026-08-31'),
(19238, 206, '1997-01-01', '2000-01-01', '2x La Liga, 1x Copa del Rey', 'Wikipedia', '2026-08-31'),
(19238, 456, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19238, 206, '2002-01-01', '2003-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19238, 286, '2005-01-01', '2009-01-01', '1x Eredivisie (2009)', 'Wikipedia', '2026-08-31'),
(19238, 243, '2009-01-01', '2011-01-01', '1x Bundesliga, 1x DFB-Pokal', 'Wikipedia', '2026-08-31'),
(19238, 456, '2012-01-01', '2014-07-01', NULL, 'Wikipedia', '2026-08-31'),
(19238, 196, '2014-07-01', '2016-05-01', '1x FA Cup (2016)', 'Wikipedia', '2026-08-31'),
(19238, 456, '2021-08-01', '2022-12-01', NULL, 'Wikipedia', '2026-08-31');

-- Guus Hiddink (entity_id 19239) — South Korea, Australia, Anzhi Makhachkala, China, Curacao club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19239, 284, '1987-01-01', '1990-01-01', '3x Eredivisie, 1x Champions League (1988)', 'Wikipedia', '2026-08-31'),
(19239, 290, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 221, '1991-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 221, '1994-01-01', '1994-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 456, '1995-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 217, '1998-01-01', '1999-01-01', '1x Intercontinental Cup', 'Wikipedia', '2026-08-31'),
(19239, 216, '2000-01-01', '2000-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, NULL, '2001-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 284, '2002-01-01', '2006-01-01', '3x Eredivisie, 3x KNVB Cup', 'Wikipedia', '2026-08-31'),
(19239, NULL, '2005-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 464, '2006-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 189, '2009-02-01', '2009-05-01', '1x FA Cup (2009)', 'Wikipedia', '2026-08-31'),
(19239, 473, '2010-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, NULL, '2012-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 456, '2014-01-01', '2015-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, 189, '2015-12-01', '2016-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, NULL, '2018-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19239, NULL, '2020-01-01', '2021-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Frank Rijkaard (entity_id 19240) — Saudi Arabia club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19240, 456, '1998-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19240, 18976, '2001-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19240, 206, '2003-01-01', '2008-01-01', '2x La Liga, 1x Champions League (2006), 2x Spanish Super Cup', 'Wikipedia', '2026-08-31'),
(19240, 289, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19240, NULL, '2011-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Marco van Basten (entity_id 19241)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19241, 456, '2004-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19241, 283, '2008-01-01', '2009-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19241, 18973, '2012-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19241, 286, '2014-01-01', '2014-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Dick Advocaat (entity_id 19242) — DSVP, HFC Haarlem, SVV, Dordrecht, UAE, South Korea, Zenit, Curacao club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19242, NULL, '1980-01-01', '1984-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '1987-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '1989-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '1991-01-01', '1992-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, 456, '1992-01-01', '1994-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, 284, '1994-01-01', '1998-01-01', '1x Eredivisie (1997), 2x Johan Cruyff Shield', 'Wikipedia', '2026-08-31'),
(19242, 288, '1998-01-01', '2001-01-01', '2x domestic treble (1999, 2000)', 'Wikipedia', '2026-08-31'),
(19242, 456, '2002-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, 254, '2004-01-01', '2005-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '2005-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '2006-01-01', '2009-01-01', '1x Russian Premier League (2007), 1x UEFA Cup (2008), 1x UEFA Super Cup', 'Wikipedia', '2026-08-31'),
(19242, 426, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, 286, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19242, NULL, '2010-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Bert van Marwijk (entity_id 19243) — Saudi Arabia, Australia, UAE club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19243, 18980, '1998-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, 285, '2000-01-01', '2004-01-01', '1x UEFA Cup (2002)', 'Wikipedia', '2026-08-31'),
(19243, 244, '2004-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, 285, '2007-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, 456, '2008-01-01', '2012-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, 260, '2013-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, NULL, '2015-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, NULL, '2018-01-01', '2018-07-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, NULL, '2019-01-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19243, NULL, '2020-01-01', '2022-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Ronald Koeman (entity_id 19244)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19244, 18972, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19244, 283, '2001-01-01', '2005-01-01', '2x Eredivisie, 1x Dutch Super Cup', 'Wikipedia', '2026-08-31'),
(19244, 280, '2005-01-01', '2006-01-01', '1x Portuguese Super Cup', 'Wikipedia', '2026-08-31'),
(19244, 284, '2006-01-01', '2007-01-01', '1x Eredivisie (2007)', 'Wikipedia', '2026-08-31'),
(19244, 221, '2007-01-01', '2008-01-01', '1x Copa del Rey (2008)', 'Wikipedia', '2026-08-31'),
(19244, 286, '2009-01-01', '2009-12-01', '1x Johan Cruyff Shield', 'Wikipedia', '2026-08-31'),
(19244, 285, '2011-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19244, 306, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19244, 191, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19244, 456, '2018-01-01', '2020-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19244, 206, '2020-08-01', '2021-10-01', '1x Copa del Rey (2021), 1x Trofeo Joan Gamper', 'Wikipedia', '2026-08-31'),
(19244, 456, '2023-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Erik ten Hag (entity_id 19245) — Bayern Munich II club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19245, 18977, '2012-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19245, NULL, '2013-01-01', '2015-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19245, 18970, '2015-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19245, 283, '2018-01-01', '2022-05-01', '3x Eredivisie, 2x KNVB Cup', 'Wikipedia', '2026-08-31'),
(19245, 196, '2022-05-01', '2024-05-01', '1x EFL Cup, 1x FA Cup', 'Wikipedia', '2026-08-31'),
(19245, 246, '2025-06-01', '2025-09-01', NULL, 'Wikipedia', '2026-08-31');

-- Helenio Herrera (entity_id 19246) — Belenenses, Rimini club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19246, 404, '1948-01-01', '1949-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 205, '1949-01-01', '1952-01-01', '2x La Liga', 'Wikipedia', '2026-08-31'),
(19246, 402, '1952-01-01', '1952-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 401, '1953-01-01', '1953-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 220, '1953-01-01', '1957-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, NULL, '1957-01-01', '1958-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 206, '1958-01-01', '1960-01-01', '2x La Liga, 1x Fairs Cup', 'Wikipedia', '2026-08-31'),
(19246, 470, '1960-01-01', '1962-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 231, '1960-01-01', '1968-01-01', '3x Serie A, 2x European Cup, 2x Intercontinental Cup', 'Wikipedia', '2026-08-31'),
(19246, 445, '1966-01-01', '1967-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 239, '1968-01-01', '1970-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 239, '1971-01-01', '1972-01-01', '1x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19246, 231, '1973-01-01', '1974-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, NULL, '1978-01-01', '1979-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19246, 206, '1979-01-01', '1981-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Diego Simeone (entity_id 19247) — Catania not fully resolved despite match; verify below
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19247, 27, '2006-01-01', '2006-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19247, 5, '2006-01-01', '2007-01-01', '1x Liga Profesional Argentina (Apertura 2006-07)', 'Wikipedia', '2026-08-31'),
(19247, 23, '2007-01-01', '2008-01-01', '1x Liga Profesional Argentina (Clausura 2007-08)', 'Wikipedia', '2026-08-31'),
(19247, 25, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19247, 19085, '2011-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19247, 27, '2011-01-01', '2011-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19247, 205, '2011-12-01', NULL, '2x La Liga, 2x Europa League, 2x UEFA Super Cup, 1x Copa del Rey, 1x Spanish Super Cup', 'Wikipedia', '2026-08-31');

-- Marcelo Bielsa (entity_id 19248) — Atlas club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19248, 14, '1990-01-01', '1992-01-01', '2x Argentine league title', 'Wikipedia', '2026-08-31'),
(19248, NULL, '1993-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 334, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 6, '1997-01-01', '1998-01-01', '1x Argentine league title (Clausura 1998)', 'Wikipedia', '2026-08-31'),
(19248, 209, '1998-01-01', '1998-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 19155, '1998-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 19158, '2007-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 204, '2011-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 262, '2014-01-01', '2015-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 233, '2016-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 265, '2017-01-01', '2017-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19248, 193, '2018-06-01', '2022-02-01', '1x Championship title (2020)', 'Wikipedia', '2026-08-31'),
(19248, 19156, '2023-05-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Cesar Luis Menotti (entity_id 19249) — Mexico, Puebla, Tecos club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19249, 14, '1970-01-01', '1970-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 12, '1971-01-01', '1974-01-01', '1x Metropolitano title (1973)', 'Wikipedia', '2026-08-31'),
(19249, 19155, '1974-01-01', '1983-01-01', '1x World Cup (1978)', 'Wikipedia', '2026-08-31'),
(19249, 206, '1983-01-01', '1984-01-01', '1x Copa del Rey, 1x Spanish Super Cup', 'Wikipedia', '2026-08-31'),
(19249, 22, '1986-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 205, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 23, '1989-01-01', '1989-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 66, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, NULL, '1991-01-01', '1992-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 22, '1993-01-01', '1994-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 20, '1996-01-01', '1997-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 19053, '1997-01-01', '1997-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 20, '1997-06-01', '1999-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 24, '2002-01-01', '2002-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, 20, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, NULL, '2006-01-01', '2006-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19249, NULL, '2007-01-01', '2007-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Carlos Bilardo (entity_id 19250) — Guatemala club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19250, 5, '1971-01-01', '1971-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 5, '1973-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 110, '1976-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 25, '1979-01-01', '1979-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 19161, '1979-01-01', '1981-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 5, '1982-01-01', '1983-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 19155, '1983-01-01', '1990-01-01', '1x World Cup (1986)', 'Wikipedia', '2026-08-31'),
(19250, 220, '1992-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 22, '1996-01-01', '1996-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, NULL, '1998-01-01', '1998-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 504, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19250, 5, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Jorge Sampaoli (entity_id 19251) — many small Argentine/Peruvian club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19251, NULL, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, NULL, '2002-01-01', '2003-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, NULL, '2004-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, NULL, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, NULL, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 64, '2010-01-01', '2012-01-01', '2x Primera Division (2011), 1x Copa Sudamericana (2011)', 'Wikipedia', '2026-08-31'),
(19251, 19158, '2012-01-01', '2016-01-01', '1x Copa America (2015)', 'Wikipedia', '2026-08-31'),
(19251, 220, '2016-01-01', '2017-01-01', '1x Supercopa Euroamericana (2016)', 'Wikipedia', '2026-08-31'),
(19251, 19155, '2017-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 44, '2018-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 38, '2020-01-01', '2021-01-01', '1x Campeonato Mineiro (2020)', 'Wikipedia', '2026-08-31'),
(19251, 262, '2021-01-01', '2022-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 220, '2022-01-01', '2023-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 31, '2023-01-01', '2023-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 268, '2024-01-01', '2025-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 38, '2025-01-01', '2026-02-01', NULL, 'Wikipedia', '2026-08-31'),
(19251, 23, '2026-02-01', NULL, NULL, 'beIN Sports', '2026-08-31');

-- Mauricio Pochettino (entity_id 19252) — United States (national team) club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19252, 209, '2009-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19252, 306, '2013-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19252, 200, '2014-05-27', '2019-11-19', '1x Audi Cup (2019), 1x International Champions Cup (2018)', 'Wikipedia', '2026-08-31'),
(19252, 261, '2021-01-01', '2022-07-01', '1x Ligue 1 (2022), 1x Trophee des Champions, 1x Coupe de France', 'Wikipedia', '2026-08-31'),
(19252, 189, '2023-07-01', '2024-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19252, NULL, '2024-09-01', NULL, NULL, 'US Soccer', '2026-08-31');

-- Gerardo Martino (entity_id 19253) — several small club_ids and Mexico/Atlanta duplicate resolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19253, NULL, '1998-01-01', '1998-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 17, '1999-01-01', '1999-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 29, '2000-01-01', '2000-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 89, '2002-01-01', '2003-01-01', '1x Paraguayan Primera Division title (2002)', 'Wikipedia', '2026-08-31'),
(19253, 87, '2003-01-01', '2004-01-01', '1x Paraguayan Primera Division title (2004)', 'Wikipedia', '2026-08-31'),
(19253, 26, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 89, '2005-01-01', '2006-01-01', '1x Paraguayan Primera Division title (2006)', 'Wikipedia', '2026-08-31'),
(19253, 19159, '2007-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 14, '2012-01-01', '2013-01-01', '1x Liga Profesional Argentina (2012-13 Torneo Final)', 'Wikipedia', '2026-08-31'),
(19253, 206, '2013-01-01', '2014-01-01', '1x Spanish Super Cup', 'Wikipedia', '2026-08-31'),
(19253, 19155, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19253, 19030, '2016-01-01', '2018-01-01', '1x MLS Cup (2018)', 'Wikipedia', '2026-08-31'),
(19253, NULL, '2019-01-01', '2022-01-01', '1x CONCACAF Gold Cup (2019)', 'Wikipedia', '2026-08-31'),
(19253, 331, '2023-01-01', '2024-01-01', '1x Leagues Cup (2023)', 'Wikipedia', '2026-08-31'),
(19253, 19030, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Marcelo Gallardo (entity_id 19254)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19254, 67, '2011-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19254, 23, '2014-06-01', '2022-12-01', '14 titles incl. 2x Copa Libertadores (2015, 2018)', 'Wikipedia', '2026-08-31'),
(19254, 329, '2023-11-01', '2024-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19254, 23, '2024-08-01', '2026-02-26', NULL, 'Buenos Aires Herald', '2026-08-31');

-- Udo Lattek (entity_id 19255)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19255, 243, '1970-01-01', '1975-01-01', '4x Bundesliga, 1x European Cup (1974)', 'Wikipedia', '2026-08-31'),
(19255, 254, '1975-01-01', '1979-01-01', '2x Bundesliga, 1x UEFA Cup (1979)', 'Wikipedia', '2026-08-31'),
(19255, 244, '1979-01-01', '1981-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19255, 206, '1981-01-01', '1983-01-01', '1x Cup Winners Cup (1982)', 'Wikipedia', '2026-08-31'),
(19255, 243, '1983-01-01', '1987-01-01', '2x Bundesliga, 2x DFB-Pokal', 'Wikipedia', '2026-08-31'),
(19255, 259, '1991-01-01', '1991-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19255, 19057, '1992-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19255, 244, '2000-01-01', '2000-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Ottmar Hitzfeld (entity_id 19256) — SC Zug, Aarau, Grasshoppers club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19256, NULL, '1983-01-01', '1984-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19256, NULL, '1984-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19256, NULL, '1988-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19256, 244, '1991-01-01', '1997-01-01', '2x Bundesliga (1995, 1996), 1x Champions League (1997)', 'Wikipedia', '2026-08-31'),
(19256, 243, '1998-01-01', '2004-01-01', '4x Bundesliga, 1x Champions League (2001), 1x Intercontinental Cup', 'Wikipedia', '2026-08-31'),
(19256, 243, '2007-01-01', '2008-01-01', '1x Bundesliga (2008), 1x DFB-Pokal', 'Wikipedia', '2026-08-31'),
(19256, 472, '2008-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Jupp Heynckes (entity_id 19257)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19257, 254, '1979-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 243, '1987-01-01', '1991-01-01', '2x Bundesliga (1989, 1990)', 'Wikipedia', '2026-08-31'),
(19257, 204, '1992-01-01', '1994-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 248, '1994-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 417, '1995-01-01', '1997-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 217, '1997-01-01', '1998-01-01', '1x Champions League (1998)', 'Wikipedia', '2026-08-31'),
(19257, 280, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 204, '2001-01-01', '2003-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 19057, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 254, '2006-01-01', '2007-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 243, '2009-01-01', '2009-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 246, '2009-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19257, 243, '2011-01-01', '2013-01-01', '1x Bundesliga, 1x DFB-Pokal, 1x Champions League (2013 treble)', 'Wikipedia', '2026-08-31'),
(19257, 243, '2017-10-01', '2018-06-01', '1x Bundesliga (2018)', 'Wikipedia', '2026-08-31');

-- Hennes Weisweiler (entity_id 19258) — Rheydter SpV, Viktoria Koln, New York Cosmos, Grasshopper club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19258, 259, '1949-01-01', '1952-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, NULL, '1952-01-01', '1954-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, 259, '1955-01-01', '1958-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, NULL, '1958-01-01', '1964-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, 254, '1964-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, 206, '1975-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, 259, '1976-01-01', '1980-01-01', '2x DFB-Pokal (1977, 1978)', 'Wikipedia', '2026-08-31'),
(19258, NULL, '1980-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19258, NULL, '1982-01-01', '1983-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Otto Rehhagel (entity_id 19259) — several small early German club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19259, NULL, '1972-01-01', '1972-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, NULL, '1972-01-01', '1973-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, NULL, '1974-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 255, '1976-01-01', '1976-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 244, '1976-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 19103, '1978-01-01', '1979-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 19108, '1979-01-01', '1980-01-01', '1x DFB-Pokal (1980)', 'Wikipedia', '2026-08-31'),
(19259, 255, '1981-01-01', '1995-01-01', '2x Bundesliga (1988, 1993), 2x DFB-Pokal, 1x Cup Winners Cup (1992)', 'Wikipedia', '2026-08-31'),
(19259, 243, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 19059, '1996-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19259, 441, '2001-01-01', '2010-01-01', '1x UEFA European Championship (2004)', 'Wikipedia', '2026-08-31'),
(19259, 19058, '2012-01-01', '2012-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Franz Beckenbauer (entity_id 19260) — national-team spell mapped to Germany entity (was West Germany pre-1990)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19260, 439, '1984-01-01', '1990-07-01', '1x World Cup (1990)', 'Wikipedia', '2026-08-31'),
(19260, 262, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19260, 243, '1993-01-01', '1994-01-01', '1x Bundesliga (1994)', 'Wikipedia', '2026-08-31'),
(19260, 243, '1996-01-01', '1996-06-01', '1x UEFA Cup (1996)', 'Wikipedia', '2026-08-31');

-- Sepp Herberger (entity_id 19261) — SV Nowawes 03, Tennis Borussia Berlin club_ids unresolved; national-team spells mapped to Germany entity
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19261, NULL, '1928-01-01', '1929-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19261, NULL, '1930-01-01', '1932-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19261, 439, '1936-01-01', '1942-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19261, 248, '1945-01-01', '1946-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19261, 439, '1950-01-01', '1964-01-01', '1x World Cup (1954)', 'Wikipedia', '2026-08-31');

-- Helmut Schon (entity_id 19262) — Saarland, 1.FC Saarbrucken club_ids unresolved; national-team spell mapped to Germany entity
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19262, NULL, '1952-01-01', '1956-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19262, NULL, '1953-01-01', '1954-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19262, 439, '1964-01-01', '1978-01-01', '1x World Cup (1974), 1x UEFA European Championship (1972)', 'Wikipedia', '2026-08-31');

-- Berti Vogts (entity_id 19263) — Kuwait, Nigeria club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19263, 439, '1990-01-01', '1998-01-01', '1x UEFA European Championship (1996)', 'Wikipedia', '2026-08-31'),
(19263, 246, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19263, NULL, '2001-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19263, 466, '2002-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19263, NULL, '2007-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19263, 424, '2008-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Joachim Low (entity_id 19264) — Karlsruher SC, Adanaspor, Tirol Innsbruck, Austria Wien club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19264, 247, '1996-01-01', '1998-01-01', '1x DFB-Pokal (1997)', 'Wikipedia', '2026-08-31'),
(19264, 290, '1998-01-01', '1999-01-01', '1x Turkish Cup (1998)', 'Wikipedia', '2026-08-31'),
(19264, NULL, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19264, NULL, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19264, NULL, '2001-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19264, NULL, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19264, 439, '2006-07-01', '2021-07-01', '1x World Cup (2014), 1x Confederations Cup (2017)', 'Wikipedia', '2026-08-31');

-- Hansi Flick (entity_id 19265) — Victoria Bammental club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19265, NULL, '1996-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19265, 250, '2000-07-01', '2005-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19265, 243, '2019-11-02', '2021-06-01', '1x Bundesliga, 1x DFB-Pokal, 1x Champions League (2020 sextuple)', 'Wikipedia', '2026-08-31'),
(19265, 439, '2021-05-25', '2023-09-01', NULL, 'Wikipedia', '2026-08-31'),
(19265, 206, '2024-07-01', NULL, '1x La Liga, 1x Copa del Rey, 1x Spanish Super Cup (2024-25 treble)', 'Wikipedia', '2026-08-31');

-- Jurgen Klopp (entity_id 19266)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19266, 252, '2001-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19266, 244, '2008-01-01', '2015-01-01', '2x Bundesliga (2011, 2012), 1x DFB-Pokal (2012)', 'Wikipedia', '2026-08-31'),
(19266, 194, '2015-10-01', '2024-05-01', '1x Premier League (2020), 1x Champions League (2019), 2x EFL Cup, 1x FA Cup, 1x UEFA Super Cup, 1x FIFA Club World Cup', 'Wikipedia', '2026-08-31');

-- Thomas Tuchel (entity_id 19267) — FC Augsburg II club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19267, NULL, '2007-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19267, 252, '2009-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19267, 244, '2015-01-01', '2017-01-01', '1x DFB-Pokal (2017)', 'Wikipedia', '2026-08-31'),
(19267, 261, '2018-01-01', '2020-12-01', '2x Ligue 1, 2x Coupe de France, 1x Coupe de la Ligue, 2x Trophee des Champions', 'Wikipedia', '2026-08-31'),
(19267, 189, '2021-01-01', '2022-09-01', '1x Champions League (2021), 1x UEFA Super Cup, 1x FIFA Club World Cup', 'Wikipedia', '2026-08-31'),
(19267, 243, '2023-03-01', '2024-05-01', '1x Bundesliga (2023)', 'Wikipedia', '2026-08-31'),
(19267, 433, '2025-01-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Julian Nagelsmann (entity_id 19268)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19268, 250, '2016-02-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19268, 245, '2019-06-01', '2021-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19268, 243, '2021-06-01', '2023-03-01', '1x Bundesliga (2022)', 'Wikipedia', '2026-08-31'),
(19268, 439, '2023-09-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Ralf Rangnick (entity_id 19269) — several small early club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19269, NULL, '1983-01-01', '1985-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, NULL, '1985-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, NULL, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, NULL, '1988-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, NULL, '1995-01-01', '1997-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, NULL, '1997-01-01', '1999-01-01', '1x Regionalliga Sud (1997)', 'Wikipedia', '2026-08-31'),
(19269, 247, '1999-01-01', '2001-01-01', '1x UEFA Intertoto Cup (2000)', 'Wikipedia', '2026-08-31'),
(19269, 19111, '2001-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, 19057, '2004-01-01', '2005-01-01', '1x Ligapokal (2005)', 'Wikipedia', '2026-08-31'),
(19269, 250, '2006-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, 19057, '2011-01-01', '2011-12-01', '1x DFB-Pokal (2011), 1x DFL-Supercup (2011)', 'Wikipedia', '2026-08-31'),
(19269, 245, '2015-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, 245, '2018-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, 196, '2021-11-01', '2022-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19269, 423, '2022-04-01', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Tele Santana (entity_id 19270)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19270, 32, '1969-01-01', '1970-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 38, '1970-01-01', '1972-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 37, '1973-01-01', '1973-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 38, '1973-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 41, '1976-01-01', '1976-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 45, '1976-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 30, '1979-01-01', '1980-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 19157, '1980-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 330, '1983-01-01', '1985-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 19157, '1985-01-01', '1986-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 38, '1987-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 31, '1988-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 30, '1990-01-01', '1990-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19270, 37, '1990-01-01', '1996-01-01', '1x Serie A (1991), 2x Sao Paulo State League, 2x Copa Libertadores (1992,1993), 2x Intercontinental Cup', 'Wikipedia', '2026-08-31');

-- Mario Zagallo (entity_id 19271) — Kuwait, Saudi Arabia, Bangu, UAE club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19271, 41, '1966-01-01', '1970-01-01', '2x Campeonato Carioca (1967, 1968), 1x Taca Brasil (1968)', 'Wikipedia', '2026-08-31'),
(19271, 19157, '1970-01-01', '1974-01-01', '1x World Cup (1970)', 'Wikipedia', '2026-08-31'),
(19271, 32, '1971-01-01', '1972-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 31, '1972-01-01', '1974-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 41, '1975-01-01', '1975-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, NULL, '1976-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 41, '1978-01-01', '1978-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 328, '1979-01-01', '1979-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 46, '1980-01-01', '1981-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, NULL, '1981-01-01', '1984-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 31, '1984-01-01', '1985-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 41, '1986-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, NULL, '1989-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 46, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 19157, '1994-01-01', '1998-01-01', '1x World Cup (1994, as head coach)', 'Wikipedia', '2026-08-31'),
(19271, 19070, '1999-01-01', '1999-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 31, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19271, 19157, '2002-01-01', '2002-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Vicente Feola (entity_id 19272)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19272, 37, '1955-01-01', '1956-01-01', '2x Campeonato Paulista (1948-49 earlier spell)', 'Wikipedia', '2026-08-31'),
(19272, 37, '1958-01-01', '1958-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19272, 19157, '1958-01-01', '1960-01-01', '1x World Cup (1958)', 'Wikipedia', '2026-08-31'),
(19272, 22, '1961-01-01', '1961-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19272, 19157, '1966-01-01', '1966-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Carlos Alberto Parreira (entity_id 19273) — Kuwait, UAE, Saudi Arabia, MetroStars club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19273, 497, '1967-01-01', '1968-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 32, '1974-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, NULL, '1978-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 19157, '1983-01-01', '1983-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, NULL, '1985-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, NULL, '1988-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 19157, '1991-01-01', '1994-01-01', '1x World Cup (1994)', 'Wikipedia', '2026-08-31'),
(19273, 34, '1991-01-01', '1991-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 221, '1994-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 290, '1995-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 37, '1996-01-01', '1996-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 38, '2000-01-01', '2000-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 44, '2000-01-01', '2000-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 43, '2001-01-01', '2001-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 39, '2002-01-01', '2002-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19273, 19157, '2003-01-01', '2006-07-01', '1x Copa America (2004), 1x Confederations Cup (2005)', 'Wikipedia', '2026-08-31'),
(19273, 521, '2007-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Luiz Felipe Scolari (entity_id 19274) — Kuwait, Guangzhou Evergrande club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19274, 45, '1993-01-01', '1996-01-01', '1x Copa Libertadores (1995)', 'Wikipedia', '2026-08-31'),
(19274, 36, '1996-01-01', '1997-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 330, '1997-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 30, '1997-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 40, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 19157, '2001-01-01', '2002-06-01', '1x World Cup (2002)', 'Wikipedia', '2026-08-31'),
(19274, 461, '2003-01-01', '2008-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 189, '2008-06-01', '2009-02-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 30, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 19157, '2012-11-01', '2014-07-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, NULL, '2015-01-01', '2017-01-01', '2x Chinese Super League, 1x AFC Champions League (2015)', 'Wikipedia', '2026-08-31'),
(19274, 33, '2022-01-01', '2022-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19274, 38, '2023-01-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Tite (entity_id 19275) — Al Ain, Al Wahda club_ids unresolved; many small early clubs omitted
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19275, 45, '2001-01-01', '2003-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 39, '2004-01-01', '2005-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 38, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 30, '2006-01-01', '2006-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, NULL, '2007-01-01', '2007-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 43, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, NULL, '2010-01-01', '2010-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 39, '2010-01-01', '2013-01-01', '1x Copa Libertadores (2012), 1x FIFA Club World Cup (2012)', 'Wikipedia', '2026-08-31'),
(19275, 39, '2015-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 19157, '2016-06-01', '2022-12-01', '1x Copa America (2019)', 'Wikipedia', '2026-08-31'),
(19275, 31, '2023-01-01', '2024-09-01', NULL, 'Wikipedia', '2026-08-31'),
(19275, 40, '2025-12-16', '2026-03-01', NULL, 'UNI India', '2026-08-31');

-- Dorival Junior (entity_id 19276) — Ferroviaria club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19276, NULL, '2002-01-01', '2002-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19147, '2003-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19064, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19149, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19148, '2005-01-01', '2005-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19067, '2005-01-01', '2006-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 19146, '2006-01-01', '2006-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 40, '2007-01-01', '2007-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 36, '2008-01-01', '2008-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 46, '2009-01-01', '2009-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 44, '2010-01-01', '2010-06-01', '1x Paulista A1 (2010)', 'Wikipedia', '2026-08-31'),
(19276, 38, '2010-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 43, '2011-01-01', '2012-01-01', '1x Recopa Sudamericana, 1x Gaucho (2012)', 'Wikipedia', '2026-08-31'),
(19276, 44, '2016-01-01', '2016-06-01', '1x Paulista A1 (2016)', 'Wikipedia', '2026-08-31'),
(19276, 33, '2020-01-01', '2020-06-01', '1x Parana state title (2020)', 'Wikipedia', '2026-08-31'),
(19276, 37, '2023-01-01', '2023-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 31, '2022-01-01', '2023-01-01', '1x Copa Libertadores, 1x Copa do Brasil (2022)', 'Wikipedia', '2026-08-31'),
(19276, 19157, '2024-01-01', '2024-09-01', NULL, 'Wikipedia', '2026-08-31'),
(19276, 39, '2025-01-01', '2025-06-01', '1x Copa do Brasil (2025)', 'Wikipedia', '2026-08-31');

-- Fernando Diniz (entity_id 19277) — many small early club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19277, 33, '2018-01-01', '2018-06-01', '1x Parana state title (2018)', 'Wikipedia', '2026-08-31'),
(19277, 32, '2019-01-01', '2019-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19277, 37, '2019-06-01', '2021-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19277, 44, '2021-01-01', '2021-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19277, 46, '2021-06-01', '2021-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19277, 32, '2022-01-01', '2024-01-01', '1x Copa Libertadores (2023), 1x Recopa Sudamericana (2024), 1x Carioca (2023)', 'Wikipedia', '2026-08-31'),
(19277, 19157, '2023-07-01', '2024-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Sven-Goran Eriksson (entity_id 19278) — Degerfors, IFK Goteborg, Mexico, Guangzhou R&F, Shanghai SIPG, Shenzhen FC, Philippines club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19278, NULL, '1977-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '1979-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 280, '1982-01-01', '1984-01-01', '2x Portuguese league title', 'Wikipedia', '2026-08-31'),
(19278, 239, '1984-01-01', '1987-01-01', '1x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19278, 228, '1987-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 280, '1989-01-01', '1992-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 19053, '1992-01-01', '1997-01-01', '1x Serie A (1991, prior spell), 1x Coppa Italia, 1x Cup Winners Cup', 'Wikipedia', '2026-08-31'),
(19278, 233, '1997-01-01', '2001-01-01', '1x Serie A (2000), 1x Coppa Italia, 1x Supercoppa Italiana, 1x Cup Winners Cup', 'Wikipedia', '2026-08-31'),
(19278, 433, '2001-01-01', '2006-07-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 195, '2007-07-01', '2008-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '2008-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 500, '2010-01-01', '2010-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, 305, '2010-10-01', '2011-10-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '2013-01-01', '2014-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '2014-01-01', '2016-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19278, NULL, '2018-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Ange Postecoglou (entity_id 19279) — Australian domestic clubs & national team club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19279, NULL, '1996-01-01', '2000-01-01', '2x NSL title, 1x Oceania Club Championship', 'Wikipedia', '2026-08-31'),
(19279, NULL, '2009-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19279, NULL, '2012-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19279, NULL, '2013-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19279, NULL, '2018-01-01', '2021-01-01', '1x J1 League title', 'Wikipedia', '2026-08-31'),
(19279, 287, '2021-06-01', '2023-06-01', '2x Scottish Premiership, 2x Scottish League Cup, 1x Scottish Cup', 'Wikipedia', '2026-08-31'),
(19279, 200, '2023-06-01', '2025-06-06', '1x UEFA Europa League (2025)', 'Wikipedia', '2026-08-31'),
(19279, 198, '2025-09-01', '2025-10-18', NULL, 'CNN', '2026-08-31');

-- Mikel Arteta (entity_id 19322)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19322, 183, '2019-12-01', NULL, '1x FA Cup, 1x Premier League (2025-26), 2x Community Shield', 'Wikipedia', '2026-08-31');

-- Arne Slot (entity_id 19323) — SC Cambuur club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19323, NULL, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19323, 286, '2019-01-01', '2020-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19323, 285, '2021-01-01', '2024-06-01', '1x Eredivisie (2023), 1x KNVB Cup (2024)', 'Wikipedia', '2026-08-31'),
(19323, 194, '2024-06-01', NULL, '1x Premier League (2025)', 'Wikipedia', '2026-08-31');

-- Manuel Pellegrini (entity_id 19324) — Palestino, O'Higgins, Universidad Catolica, Hebei China Fortune club_ids unresolved where noted
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19324, 64, '1988-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 61, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 60, '1992-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 63, '1994-01-01', '1996-01-01', '1x Chilean Cup (1995)', 'Wikipedia', '2026-08-31'),
(19324, 61, '1998-01-01', '1998-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 129, '1999-01-01', '2000-01-01', '1x Ecuadorian league title (1999)', 'Wikipedia', '2026-08-31'),
(19324, 25, '2001-01-01', '2002-01-01', '1x Liga Profesional Argentina (Clausura 2001)', 'Wikipedia', '2026-08-31'),
(19324, 23, '2002-01-01', '2003-01-01', '1x Liga Profesional Argentina (Clausura 2003)', 'Wikipedia', '2026-08-31'),
(19324, 222, '2004-01-01', '2009-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 217, '2009-01-01', '2010-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 402, '2010-01-01', '2013-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 195, '2013-01-01', '2016-01-01', '1x Premier League (2014), 2x EFL Cup', 'Wikipedia', '2026-08-31'),
(19324, NULL, '2016-01-01', '2018-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 201, '2018-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19324, 216, '2020-01-01', NULL, '1x Copa del Rey (2022)', 'Wikipedia', '2026-08-31');

-- Mircea Lucescu (entity_id 19345) — Corvinul Hunedoara, Dinamo Bucuresti, Rapid Bucuresti, Zenit club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19345, NULL, '1979-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 463, '1981-01-01', '1986-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, NULL, '1985-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 238, '1990-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 19056, '1991-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 19082, '1996-01-01', '1996-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, NULL, '1997-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 231, '1998-01-01', '1999-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, NULL, '1999-01-01', '2000-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 289, '2000-01-01', '2002-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 291, '2002-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 295, '2004-01-01', '2016-01-01', '8x Ukrainian Premier League, 6x Ukrainian Cup, 7x Ukrainian Super Cup, 1x UEFA Cup (2009)', 'Wikipedia', '2026-08-31'),
(19345, NULL, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 473, '2017-01-01', '2019-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 296, '2020-01-01', '2023-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19345, 463, '2024-01-01', '2026-04-07', NULL, 'Shakhtar.com', '2026-08-31');

-- Valeriy Lobanovskyi (entity_id 19346) — Dnipro, Ukrainian SSR, UAE, Kuwait club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19346, NULL, '1969-01-01', '1973-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 296, '1973-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 19315, '1975-01-01', '1976-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, NULL, '1979-01-01', '1979-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 19315, '1982-01-01', '1983-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 296, '1984-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 19315, '1986-01-01', '1990-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, NULL, '1990-01-01', '1993-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, NULL, '1994-01-01', '1996-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19346, 296, '1997-01-01', '2002-01-01', '5x Ukrainian league title, 3x Ukrainian Cup', 'Wikipedia', '2026-08-31'),
(19346, 474, '2000-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Jock Stein (entity_id 19347) — Dunfermline Athletic club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19347, NULL, '1960-03-14', '1964-01-01', '1x Scottish Cup (1961)', 'Wikipedia', '2026-08-31'),
(19347, 395, '1964-01-01', '1965-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19347, 287, '1965-03-01', '1978-05-01', '10x Scottish league title, 8x Scottish Cup, 6x League Cup, 1x European Cup (1967)', 'Wikipedia', '2026-08-31'),
(19347, 193, '1978-01-01', '1978-10-01', NULL, 'Wikipedia', '2026-08-31'),
(19347, 466, '1978-10-01', '1985-09-10', NULL, 'Wikipedia', '2026-08-31');

-- Sean Dyche (entity_id 19348)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19348, 311, '2011-01-01', '2012-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19348, 188, '2012-10-01', '2022-04-01', '1x Championship title (2016)', 'Wikipedia', '2026-08-31'),
(19348, 191, '2023-01-01', '2025-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19348, 198, '2025-10-20', NULL, NULL, 'Wikipedia', '2026-08-31');

-- Joe Kinnear (entity_id 19349) — Al-Shabab, India, Nepal club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19349, NULL, '1983-01-01', '1984-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, NULL, '1984-01-01', '1984-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, NULL, '1987-01-01', '1987-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, 350, '1989-01-01', '1989-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, 390, '1992-01-01', '1999-03-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, 325, '2001-01-01', '2003-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, 198, '2004-01-01', '2004-12-01', NULL, 'Wikipedia', '2026-08-31'),
(19349, 197, '2008-01-01', '2009-05-01', NULL, 'Wikipedia', '2026-08-31');

-- Jim Smith (entity_id 19350) — Boston United club_id unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19350, NULL, '1969-01-01', '1972-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 371, '1972-01-01', '1975-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 313, '1975-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 318, '1978-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 367, '1982-01-01', '1985-01-01', '1x Second Division title (1985)', 'Wikipedia', '2026-08-31'),
(19350, 323, '1985-01-01', '1988-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 197, '1988-01-01', '1991-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 324, '1991-01-01', '1995-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 316, '1995-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 367, '2006-01-01', '2007-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19350, 367, '2008-01-01', '2008-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Enrique Fernandez (entity_id 19351)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19351, 67, '1946-01-01', '1946-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 206, '1947-01-01', '1950-01-01', '1x La Liga', 'Wikipedia', '2026-08-31'),
(19351, 67, '1950-01-01', '1952-01-01', '1x Uruguayan championship', 'Wikipedia', '2026-08-31'),
(19351, 217, '1953-01-01', '1954-01-01', '1x La Liga', 'Wikipedia', '2026-08-31'),
(19351, 52, '1955-01-01', '1956-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 281, '1957-01-01', '1959-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 216, '1959-01-01', '1960-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 19156, '1961-01-01', '1962-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 9, '1962-01-01', '1962-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 23, '1964-01-01', '1964-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 61, '1965-01-01', '1965-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 9, '1966-01-01', '1967-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19351, 19156, '1967-01-01', '1969-01-01', NULL, 'Wikipedia', '2026-08-31');

-- Nils Liedholm (entity_id 19352) — Monza, Varese club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19352, 235, '1963-01-01', '1966-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 230, '1966-01-01', '1968-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, NULL, '1968-01-01', '1969-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, NULL, '1969-01-01', '1971-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 228, '1971-01-01', '1973-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 239, '1973-01-01', '1977-01-01', '1x Serie A (1983 later spell)', 'Wikipedia', '2026-08-31'),
(19352, 235, '1977-01-01', '1979-01-01', '1x Serie A (1979)', 'Wikipedia', '2026-08-31'),
(19352, 239, '1979-01-01', '1984-01-01', '1x Serie A (1983), 3x Coppa Italia', 'Wikipedia', '2026-08-31'),
(19352, 235, '1984-01-01', '1987-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 239, '1987-01-01', '1989-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 230, '1992-01-01', '1992-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19352, 239, '1997-04-01', '1997-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Cestmir Vycpalek (entity_id 19353) — Siracusa, Valdagno, Juve Bagheria club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19353, 19054, '1966-01-01', '1968-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19353, NULL, '1968-01-01', '1971-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19353, 232, '1971-02-12', '1974-06-30', '2x Serie A (1972, 1973)', 'Wikipedia', '2026-08-31');

-- Felix Magath (entity_id 19354) — 1.FC Nurnberg, Shandong Luneng Taishan club_ids unresolved (Nurnberg partially resolvable)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19354, 260, '1995-01-01', '1997-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 19060, '1997-01-01', '1998-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 255, '1998-01-01', '1999-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 248, '1999-01-01', '2001-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 247, '2001-01-01', '2004-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 243, '2004-01-01', '2007-01-01', '2x Bundesliga, 2x DFB-Pokal (2 doubles)', 'Wikipedia', '2026-08-31'),
(19354, 256, '2007-01-01', '2009-01-01', '1x Bundesliga (2009)', 'Wikipedia', '2026-08-31'),
(19354, 19057, '2009-01-01', '2011-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 256, '2011-01-01', '2012-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 192, '2014-01-01', '2014-06-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, NULL, '2016-01-01', '2017-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19354, 19058, '2022-01-01', '2022-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Branko Zebec (entity_id 19355) — Dinamo Zagreb, Hajduk Split, Eintracht Braunschweig club_ids unresolved
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19355, NULL, '1966-01-01', '1967-01-01', '1x Inter-Cities Fairs Cup (1967)', 'Wikipedia', '2026-08-31'),
(19355, 243, '1968-01-01', '1970-01-01', '1x Bundesliga (1969), 1x DFB-Pokal', 'Wikipedia', '2026-08-31'),
(19355, 247, '1970-01-01', '1972-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19355, NULL, '1972-01-01', '1973-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19355, NULL, '1974-01-01', '1978-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19355, 260, '1978-01-01', '1980-01-01', '1x Bundesliga (1979)', 'Wikipedia', '2026-08-31'),
(19355, 244, '1981-01-01', '1982-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19355, 248, '1982-01-01', '1983-01-01', NULL, 'Wikipedia', '2026-08-31'),
(19355, NULL, '1984-01-01', '1984-06-01', NULL, 'Wikipedia', '2026-08-31');

-- Vincent Kompany (entity_id 19356)
INSERT INTO management_spells (manager_id, club_id, start_date, end_date, titles_won, source, verified_at) VALUES
(19356, 293, '2019-01-01', '2022-05-01', NULL, 'Wikipedia', '2026-08-31'),
(19356, 188, '2022-06-14', '2024-05-29', '1x Championship title (2023)', 'Wikipedia', '2026-08-31'),
(19356, 243, '2024-06-01', NULL, '1x Bundesliga (2025), 1x DFL-Supercup (2025)', 'Wikipedia', '2026-08-31');


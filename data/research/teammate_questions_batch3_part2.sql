-- teammate_questions changes, batch 3 part 2 (2026-10-09), extracted from a full regeneration by
-- build_teammate_questions.py after players 951-1000 were researched. Safe to repeat.
-- PART 1: 20 net-new questions. PART 2: three existing questions whose regenerated clue set
-- changed, updated in place so their ids do not change. PART 3: Bernardo Silva's question is
-- removed -- with the larger pool another researched player now fits all three of his clues
-- (Radamel Falcao, Sergio Aguero, Jan Oblak), so the builder drops him as not unique.
-- teammateSets.ts gives his Set slot to Josko Gvardiol.

-- PART 1
-- Serhou Guirassy (3): Desire Doue, Jamie Gittens, Benjamin Pavard
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 691, '[689,792,993]', '{"clubs":["Rennes","Borussia Dortmund","Lille"],"clubImages":["clubs/268.svg","clubs/244.svg","clubs/265.svg"],"nationality":"Guinea","years":["2022\u20132023","2024\u20132025","2015\u20132016"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 691);
-- Josko Gvardiol (3): Ilkay Gundogan, Ibrahima Konate, Dani Olmo
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 746, '[612,728,961]', '{"clubs":["Manchester City","RB Leipzig","Dinamo Zagreb"],"clubImages":["clubs/195.svg","clubs/245.svg","clubs/300.svg"],"nationality":"Croatia","years":["2023\u20132025","2020\u20132021","2019\u20132020"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 746);
-- Benjamin Sesko (3): Marcus Rashford, Dominik Szoboszlai, Dani Olmo
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 772, '[626,729,961]', '{"clubs":["Manchester United","Red Bull Salzburg","RB Leipzig"],"clubImages":["clubs/196.svg","clubs/294.svg","clubs/245.svg"],"nationality":"Slovenia","years":["2025\u2013present","2019\u20132021","2023\u20132024"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 772);
-- Guglielmo Vicario (3): Son Heung-min, Bruno Fernandes, Nicolo Barella
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 810, '[627,686,996]', '{"clubs":["Tottenham Hotspur","Udinese","Cagliari"],"clubImages":["clubs/200.svg","clubs/242.svg","clubs/225.svg"],"nationality":"Italy","years":["2023\u20132025","2014\u20132016","2019\u20132020"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 810);
-- Fabian Schar (3): Alexander Isak, Joelinton, Yann Sommer
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 831, '[735,824,991]', '{"clubs":["Newcastle United","TSG Hoffenheim","Basel"],"clubImages":["clubs/197.svg","clubs/250.svg","clubs/19366.svg"],"nationality":"Switzerland","years":["2022\u20132025","2015\u20132017","2012\u20132014"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 831);
-- Aurelien Tchouameni (3): Toni Kroos, Wissam Ben Yedder, Jules Kounde
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 945, '[602,679,955]', '{"clubs":["Real Madrid","AS Monaco","Bordeaux"],"clubImages":["clubs/217.svg","clubs/264.svg","clubs/19062.svg"],"nationality":"France","years":["2022\u20132024","2020\u20132022","2018\u20132019"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 945);
-- Wojciech Szczesny (3): Gianluigi Buffon, Mesut Ozil, Pedri
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 954, '[586,611,621]', '{"clubs":["Juventus","Arsenal","Barcelona"],"clubImages":["clubs/232.svg","clubs/183.svg","clubs/206.svg"],"nationality":"Poland","years":["2017\u20132021","2013\u20132017","2024\u2013present"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 954);
-- Dani Olmo (3): Pedri, Ibrahima Konate, Josko Gvardiol
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 961, '[621,728,746]', '{"clubs":["Barcelona","RB Leipzig","Dinamo Zagreb"],"clubImages":["clubs/206.svg","clubs/245.svg","clubs/300.svg"],"nationality":"Spain","years":["2024\u2013present","2020\u20132021","2019\u20132020"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 961);
-- Alexander Sorloth (3): Antoine Griezmann, Ibrahima Konate, Alex Baena
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 964, '[614,728,975]', '{"clubs":["Atletico Madrid","RB Leipzig","Villarreal"],"clubImages":["clubs/205.svg","clubs/245.svg","clubs/222.svg"],"nationality":"Norway","years":["2024\u2013present","2020\u20132021","2023\u20132024"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 964);
-- Clement Lenglet (3): Gerard Pique, Antoine Griezmann, Wissam Ben Yedder
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 972, '[583,614,679]', '{"clubs":["Barcelona","Atletico Madrid","Sevilla"],"clubImages":["clubs/206.svg","clubs/205.svg","clubs/220.svg"],"nationality":"France","years":["2018\u20132022","2025\u2013present","2017\u20132018"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 972);
-- Isco (3): Ruud van Nistelrooy, Sergio Ramos, Giovani Lo Celso
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 983, '[572,582,984]', '{"clubs":["Malaga","Real Madrid","Real Betis"],"clubImages":["clubs/402.svg","clubs/217.svg","clubs/216.svg"],"nationality":"Spain","years":["2011\u20132012","2013\u20132021","2023\u2013present"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 983);
-- Giovani Lo Celso (3): Gianluigi Buffon, Son Heung-min, Isco
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 984, '[586,627,983]', '{"clubs":["Paris Saint-Germain","Tottenham Hotspur","Real Betis"],"clubImages":["clubs/261.svg","clubs/200.svg","clubs/216.svg"],"nationality":"Argentina","years":["2018\u20132019","2020\u20132024","2023\u2013present"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 984);
-- Antony (3): Marcus Rashford, Jurrien Timber, Isco
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 985, '[626,712,983]', '{"clubs":["Manchester United","Ajax","Real Betis"],"clubImages":["clubs/196.svg","clubs/283.png","clubs/216.svg"],"nationality":"Brazil","years":["2022\u20132025","2020\u20132022","2025\u2013present"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 985);
-- Ayoze Perez (4): Jamie Vardy, Mikel Merino, Alex Baena, Isco
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 987, '[661,719,975,983]', '{"clubs":["Leicester City","Newcastle United","Villarreal","Real Betis"],"clubImages":["clubs/305.svg","clubs/197.svg","clubs/222.svg","clubs/216.svg"],"nationality":"Spain","years":["2019\u20132023","2017\u20132018","2024\u20132025","2023\u20132024"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 987);
-- Santi Cazorla (3): Ruud van Nistelrooy, Diego Forlan, Mesut Ozil
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 990, '[572,598,611]', '{"clubs":["Malaga","Villarreal","Arsenal"],"clubImages":["clubs/402.svg","clubs/222.svg","clubs/183.svg"],"nationality":"Spain","years":["2011\u20132012","2004\u20132007","2013\u20132018"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 990);
-- Yann Sommer (3): Lautaro Martinez, Fabian Schar, Granit Xhaka
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 991, '[630,831,931]', '{"clubs":["Inter Milan","Basel","Borussia Monchengladbach"],"clubImages":["clubs/231.svg","clubs/19366.svg","clubs/254.svg"],"nationality":"Switzerland","years":["2023\u2013present","2012\u20132014","2014\u20132016"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 991);
-- Benjamin Pavard (3): Thomas Muller, Lautaro Martinez, Serhou Guirassy
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 993, '[600,630,691]', '{"clubs":["Bayern Munich","Inter Milan","Lille"],"clubImages":["clubs/243.svg","clubs/231.svg","clubs/265.svg"],"nationality":"France","years":["2019\u20132023","2023\u2013present","2015\u20132016"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 993);
-- Hakan Calhanoglu (3): Zlatan Ibrahimovic, Son Heung-min, Lautaro Martinez
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 997, '[599,627,630]', '{"clubs":["AC Milan","Bayer Leverkusen","Inter Milan"],"clubImages":["clubs/235.svg","clubs/246.svg","clubs/231.svg"],"nationality":"Turkey","years":["2017\u20132021","2014\u20132015","2021\u2013present"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 997);
-- Henrikh Mkhitaryan (5): Wayne Rooney, Marco Reus, Mesut Ozil, Lautaro Martinez, Riccardo Calafiori
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 998, '[552,609,611,630,721]', '{"clubs":["Manchester United","Borussia Dortmund","Arsenal","Inter Milan","Roma"],"clubImages":["clubs/196.svg","clubs/244.svg","clubs/183.svg","clubs/231.svg","clubs/239.svg"],"nationality":"Armenia","years":["2016\u20132017","2013\u20132016","2018\u20132020","2022\u2013present","2020\u20132022"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 998);
-- Piotr Zielinski (3): Victor Osimhen, Lautaro Martinez, Bruno Fernandes
INSERT INTO teammate_questions (player_id, teammate_ids, hints, source) SELECT 999, '[617,630,686]', '{"clubs":["Napoli","Inter Milan","Udinese"],"clubImages":["clubs/236.svg","clubs/231.svg","clubs/242.svg"],"nationality":"Poland","years":["2020\u20132024","2024\u2013present","2013\u20132016"]}', 'player_career_stats' WHERE NOT EXISTS (SELECT 1 FROM teammate_questions WHERE player_id = 999);

-- PART 2
-- Ruud van Nistelrooy (4): Wayne Rooney, Fabio Cannavaro, Son Heung-min, Isco
UPDATE teammate_questions SET teammate_ids = '[552,555,627,983]', hints = '{"clubs":["Manchester United","Real Madrid","Hamburger SV","Malaga"],"clubImages":["clubs/196.svg","clubs/217.svg","clubs/260.svg","clubs/402.svg"],"nationality":"Netherlands","years":["2004\u20132006","2006\u20132009","2010\u20132011","2011\u20132012"]}' WHERE player_id = 572;
-- David Villa (4): Frank Lampard, Xavi Hernandez, Andres Iniesta, Koke
UPDATE teammate_questions SET teammate_ids = '[577,580,581,967]', hints = '{"clubs":["New York City FC","Barcelona","Vissel Kobe","Atletico Madrid"],"clubImages":["clubs/19031.svg","clubs/206.svg","clubs/19441.svg","clubs/205.svg"],"nationality":"Spain","years":["2015\u20132016","2010\u20132013","2019\u20132020","2013\u20132014"]}' WHERE player_id = 604;
-- Granit Xhaka (5): Mesut Ozil, Marc-Andre ter Stegen, Florian Wirtz, Habib Diarra, Yann Sommer
UPDATE teammate_questions SET teammate_ids = '[611,663,703,932,991]', hints = '{"clubs":["Arsenal","Borussia Monchengladbach","Bayer Leverkusen","Sunderland","Basel"],"clubImages":["clubs/183.svg","clubs/254.svg","clubs/246.svg","clubs/199.svg","clubs/19366.svg"],"nationality":"Switzerland","years":["2016\u20132021","2012\u20132014","2023\u20132025","2025\u2013present","2010\u20132012"]}' WHERE player_id = 931;

-- PART 3
DELETE FROM teammate_questions WHERE player_id = 744;

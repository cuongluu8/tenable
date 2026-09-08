-- Resolves the ~84 remaining unresolved player_career_stats clubs
-- (verify:club-badges, 2026-09-08 run) that aren't reserve/youth
-- teams -- per explicit direction, these are included even without
-- a sourced badge image (BadgeTile.tsx already falls back to the
-- club's name as text when image_key is NULL, so a missing image
-- isn't a reason to exclude an otherwise-real club).
--
-- Excluded: reserve/B/II/Castilla teams of an already-resolved
-- parent club (per instruction), and player_career_stats.id=400
-- (Roberto Carlos, team_name_raw='(row 10)') -- a genuine parsing
-- artifact from the sourcing script, not a real club name; left
-- unresolved and flagged separately rather than guessed at.
--
-- Anzhi Makhachkala reuses the entity already created for Eto'o
-- (id=19374, unresolved_clubs_fix_batch1.sql) -- Roberto Carlos
-- played there too. Beira-Mar is one entity used by both Eusebio
-- (direct) and Jan Oblak (loan) -- same real club.
--
-- Run against local first, then production:
--   wrangler d1 execute tenable-content --local --file=data/research/unresolved_clubs_fix_batch2.sql

INSERT INTO entities (id, canonical_name, entity_type, scope, image_key) VALUES
	(19375, 'Africa Sports', 'club', 'Ivory Coast', NULL),
	(19376, 'Al Ahli Dubai', 'club', 'United Arab Emirates', NULL),
	(19377, 'Al Jazira', 'club', 'United Arab Emirates', NULL),
	(19378, 'Al-Gharafa', 'club', 'Qatar', NULL),
	(19379, 'Al-Rayyan', 'club', 'Qatar', NULL),
	(19380, 'America-RJ', 'club', 'Brazil', NULL),
	(19381, 'Atlético Junior', 'club', 'Colombia', NULL),
	(19382, 'Beira-Mar', 'club', 'Portugal', NULL),
	(19383, 'Blacktown City', 'club', 'Australia', NULL),
	(19384, 'Bong Range United', 'club', 'Liberia', NULL),
	(19385, 'Boston Minutemen', 'club', 'United States', NULL),
	(19386, 'Boulogne', 'club', 'France', NULL),
	(19387, 'Brisbane Lions', 'club', 'Australia', NULL),
	(19388, 'Brøndby', 'club', 'Denmark', NULL),
	(19389, 'Buffalo Stallions', 'club', 'United States', NULL),
	(19390, 'Bunyodkor', 'club', 'Uzbekistan', NULL),
	(19391, 'Cerezo Osaka', 'club', 'Japan', NULL),
	(19392, 'Chesterfield', 'club', 'England', NULL),
	(19393, 'Chmel Blšany', 'club', 'Czech Republic', NULL),
	(19394, 'Cork Celtic', 'club', 'Ireland', NULL),
	(19395, 'Delhi Dynamos', 'club', 'India', NULL),
	(19396, 'Den Bosch', 'club', 'Netherlands', NULL),
	(19397, 'Dunstable Town', 'club', 'England', NULL),
	(19398, 'FC Tokyo', 'club', 'Japan', NULL),
	(19399, 'Fort Lauderdale Strikers', 'club', 'United States', NULL),
	(19400, 'Gladsaxe-Hero', 'club', 'Denmark', NULL),
	(19401, 'HFC Haarlem', 'club', 'Netherlands', NULL),
	(19402, 'Hong Kong Rangers', 'club', 'Hong Kong', NULL),
	(19403, 'Hvidovre', 'club', 'Denmark', NULL),
	(19404, 'Invincible Eleven', 'club', 'Liberia', NULL),
	(19405, 'Jewish Guild', 'club', 'South Africa', NULL),
	(19406, 'Kabuscorp', 'club', 'Angola', NULL),
	(19407, 'Kawasaki Frontale', 'club', 'Japan', NULL),
	(19408, 'Kitchee', 'club', 'Hong Kong', NULL),
	(19409, 'Lanceros Boyacá', 'club', 'Colombia', NULL),
	(19410, 'Las Vegas Quicksilvers', 'club', 'United States', NULL),
	(19411, 'Los Angeles Aztecs', 'club', 'United States', NULL),
	(19412, 'Malmö FF', 'club', 'Sweden', NULL),
	(19413, 'Mantova', 'club', 'Italy', NULL),
	(19414, 'Miami FC', 'club', 'United States', NULL),
	(19415, 'Mighty Barrolle', 'club', 'Liberia', NULL),
	(19416, 'Mogi Mirim', 'club', 'Brazil', NULL),
	(19417, 'Mumbai City', 'club', 'India', NULL),
	(19418, 'New Jersey Americans', 'club', 'United States', NULL),
	(19419, 'New York Cosmos', 'club', 'United States', NULL),
	(19420, 'Newcastle KB United', 'club', 'Australia', NULL),
	(19421, 'Noordwijk', 'club', 'Netherlands', NULL),
	(19422, 'Nuorese', 'club', 'Italy', NULL),
	(19423, 'Olaria', 'club', 'Brazil', NULL),
	(19424, 'Olimpija Ljubljana', 'club', 'Slovenia', NULL),
	(19425, 'Perth Azzurri', 'club', 'Australia', NULL),
	(19426, 'Quimper', 'club', 'France', NULL),
	(19427, 'Ribeirão', 'club', 'Brazil', NULL),
	(19428, 'Rot Weiss Ahlen', 'club', 'Germany', NULL),
	(19429, 'Sacrofano', 'club', 'Italy', NULL),
	(19430, 'Sagan Tosu', 'club', 'Japan', NULL),
	(19431, 'Sea Bee', 'club', 'Hong Kong', NULL),
	(19432, 'Serrano', 'club', 'Brazil', NULL),
	(19433, 'Sporting Lourenço Marques', 'club', 'Mozambique', NULL),
	(19434, 'São Caetano', 'club', 'Brazil', NULL),
	(19435, 'Tobermore United', 'club', 'Northern Ireland', NULL),
	(19436, 'Tonnerre Yaoundé', 'club', 'Cameroon', NULL),
	(19437, 'Toronto Metros-Croatia', 'club', 'Canada', NULL),
	(19438, 'Torres', 'club', 'Italy', NULL),
	(19439, 'União São João', 'club', 'Brazil', NULL),
	(19440, 'União de Tomar', 'club', 'Portugal', NULL),
	(19441, 'Vissel Kobe', 'club', 'Japan', NULL),
	(19442, 'Washington Diplomats', 'club', 'United States', NULL),
	(19443, 'Waterford', 'club', 'Ireland', NULL),
	(19444, 'Young Survivors', 'club', 'Liberia', NULL),
	(19445, 'Škoda Plzeň', 'club', 'Czech Republic', NULL),
	(19446, 'Adelaide United', 'club', 'Australia', NULL),
	(19447, 'Al Sadd', 'club', 'Qatar', NULL),
	(19448, 'Cleveland Stokers', 'club', 'United States', NULL),
	(19449, 'Dukla Prague', 'club', 'Czech Republic', NULL),
	(19450, 'Hellenic', 'club', 'South Africa', NULL),
	(19451, 'Melbourne City', 'club', 'Australia', NULL),
	(19452, 'Olhanense', 'club', 'Portugal', NULL),
	(19453, 'St Patrick''s Athletic', 'club', 'Ireland', NULL),
	(19454, 'União de Leiria', 'club', 'Portugal', NULL),
	(19455, 'Yokohama F. Marinos', 'club', 'Japan', NULL);

UPDATE player_career_stats SET team_id = 19375 WHERE id = 5; -- George Weah: Africa Sports
UPDATE player_career_stats SET team_id = 19376 WHERE id = 73; -- Fabio Cannavaro: Al Ahli Dubai
UPDATE player_career_stats SET team_id = 19377 WHERE id = 13; -- George Weah: Al Jazira
UPDATE player_career_stats SET team_id = 19378 WHERE id = 561; -- Wesley Sneijder: Al-Gharafa
UPDATE player_career_stats SET team_id = 19379 WHERE id = 452; -- James Rodriguez: Al-Rayyan
UPDATE player_career_stats SET team_id = 19380 WHERE id = 116; -- Romario: America-RJ
UPDATE player_career_stats SET team_id = 19374 WHERE id = 398; -- Roberto Carlos: Anzhi Makhachkala
UPDATE player_career_stats SET team_id = 19381 WHERE id = 176; -- Garrincha: Atlético Junior
UPDATE player_career_stats SET team_id = 19382 WHERE id = 157; -- Eusebio: Beira-Mar
UPDATE player_career_stats SET team_id = 19383 WHERE id = 168; -- Bobby Charlton: Blacktown City
UPDATE player_career_stats SET team_id = 19384 WHERE id = 2; -- George Weah: Bong Range United
UPDATE player_career_stats SET team_id = 19385 WHERE id = 154; -- Eusebio: Boston Minutemen
UPDATE player_career_stats SET team_id = 19386 WHERE id = 618; -- N'Golo Kante: Boulogne
UPDATE player_career_stats SET team_id = 19387 WHERE id = 195; -- George Best: Brisbane Lions
UPDATE player_career_stats SET team_id = 19388 WHERE id = 879; -- Peter Schmeichel: Brøndby
UPDATE player_career_stats SET team_id = 19389 WHERE id = 161; -- Eusebio: Buffalo Stallions (indoor)
UPDATE player_career_stats SET team_id = 19390 WHERE id = 94; -- Rivaldo: Bunyodkor
UPDATE player_career_stats SET team_id = 19391 WHERE id = 467; -- Diego Forlan: Cerezo Osaka
UPDATE player_career_stats SET team_id = 19392 WHERE id = 885; -- Gordon Banks: Chesterfield
UPDATE player_career_stats SET team_id = 19393 WHERE id = 855; -- Petr Cech: Chmel Blšany
UPDATE player_career_stats SET team_id = 19394 WHERE id = 185; -- George Best: Cork Celtic
UPDATE player_career_stats SET team_id = 19395 WHERE id = 399; -- Roberto Carlos: Delhi Dynamos
UPDATE player_career_stats SET team_id = 19396 WHERE id = 222; -- Ruud van Nistelrooy: Den Bosch
UPDATE player_career_stats SET team_id = 19397 WHERE id = 183; -- George Best: Dunstable Town
UPDATE player_career_stats SET team_id = 19398 WHERE id = 744; -- Takefusa Kubo: FC Tokyo
UPDATE player_career_stats SET team_id = 19399 WHERE id = 189; -- George Best: Fort Lauderdale Strikers
UPDATE player_career_stats SET team_id = 19399 WHERE id = 890; -- Gordon Banks: Fort Lauderdale Strikers
UPDATE player_career_stats SET team_id = 19400 WHERE id = 877; -- Peter Schmeichel: Gladsaxe-Hero
UPDATE player_career_stats SET team_id = 19401 WHERE id = 202; -- Ruud Gullit: HFC Haarlem
UPDATE player_career_stats SET team_id = 19402 WHERE id = 193; -- George Best: Hong Kong Rangers
UPDATE player_career_stats SET team_id = 19403 WHERE id = 878; -- Peter Schmeichel: Hvidovre
UPDATE player_career_stats SET team_id = 19404 WHERE id = 4; -- George Weah: Invincible Eleven
UPDATE player_career_stats SET team_id = 19405 WHERE id = 182; -- George Best: Jewish Guild
UPDATE player_career_stats SET team_id = 19406 WHERE id = 96; -- Rivaldo: Kabuscorp
UPDATE player_career_stats SET team_id = 19407 WHERE id = 737; -- Kaoru Mitoma: Kawasaki Frontale
UPDATE player_career_stats SET team_id = 19408 WHERE id = 470; -- Diego Forlan: Kitchee
UPDATE player_career_stats SET team_id = 19409 WHERE id = 432; -- Radamel Falcao: Lanceros Boyacá
UPDATE player_career_stats SET team_id = 19410 WHERE id = 158; -- Eusebio: Las Vegas Quicksilvers
UPDATE player_career_stats SET team_id = 19411 WHERE id = 134; -- Johan Cruyff: Los Angeles Aztecs
UPDATE player_career_stats SET team_id = 19411 WHERE id = 186; -- George Best: Los Angeles Aztecs
UPDATE player_career_stats SET team_id = 19411 WHERE id = 188; -- George Best: Los Angeles Aztecs
UPDATE player_career_stats SET team_id = 19412 WHERE id = 473; -- Zlatan Ibrahimovic: Malmö FF
UPDATE player_career_stats SET team_id = 19413 WHERE id = 898; -- Dino Zoff: Mantova
UPDATE player_career_stats SET team_id = 19414 WHERE id = 113; -- Romario: Miami FC
UPDATE player_career_stats SET team_id = 19415 WHERE id = 3; -- George Weah: Mighty Barrolle
UPDATE player_career_stats SET team_id = 19416 WHERE id = 85; -- Rivaldo: Mogi Mirim
UPDATE player_career_stats SET team_id = 19416 WHERE id = 98; -- Rivaldo: Mogi Mirim
UPDATE player_career_stats SET team_id = 19417 WHERE id = 469; -- Diego Forlan: Mumbai City
UPDATE player_career_stats SET team_id = 19418 WHERE id = 160; -- Eusebio: New Jersey Americans
UPDATE player_career_stats SET team_id = 19419 WHERE id = 141; -- Franz Beckenbauer: New York Cosmos
UPDATE player_career_stats SET team_id = 19419 WHERE id = 143; -- Franz Beckenbauer: New York Cosmos
UPDATE player_career_stats SET team_id = 19420 WHERE id = 166; -- Bobby Charlton: Newcastle KB United
UPDATE player_career_stats SET team_id = 19421 WHERE id = 871; -- Edwin van der Sar: Noordwijk
UPDATE player_career_stats SET team_id = 19422 WHERE id = 383; -- Gianfranco Zola: Nuorese
UPDATE player_career_stats SET team_id = 19423 WHERE id = 179; -- Garrincha: Olaria
UPDATE player_career_stats SET team_id = 19424 WHERE id = 831; -- Jan Oblak: Olimpija Ljubljana
UPDATE player_career_stats SET team_id = 19425 WHERE id = 167; -- Bobby Charlton: Perth Azzurri
UPDATE player_career_stats SET team_id = 19426 WHERE id = 645; -- Riyad Mahrez: Quimper
UPDATE player_career_stats SET team_id = 19427 WHERE id = 819; -- Ederson: Ribeirão
UPDATE player_career_stats SET team_id = 19428 WHERE id = 579; -- Marco Reus: Rot Weiss Ahlen
UPDATE player_career_stats SET team_id = 19429 WHERE id = 178; -- Garrincha: Sacrofano
UPDATE player_career_stats SET team_id = 19430 WHERE id = 538; -- Fernando Torres: Sagan Tosu
UPDATE player_career_stats SET team_id = 19431 WHERE id = 192; -- George Best: Sea Bee
UPDATE player_career_stats SET team_id = 19432 WHERE id = 173; -- Garrincha: Serrano
UPDATE player_career_stats SET team_id = 19433 WHERE id = 152; -- Eusebio: Sporting Lourenço Marques
UPDATE player_career_stats SET team_id = 19434 WHERE id = 97; -- Rivaldo: São Caetano
UPDATE player_career_stats SET team_id = 19435 WHERE id = 196; -- George Best: Tobermore United
UPDATE player_career_stats SET team_id = 19436 WHERE id = 6; -- George Weah: Tonnerre Yaoundé
UPDATE player_career_stats SET team_id = 19437 WHERE id = 156; -- Eusebio: Toronto Metros-Croatia
UPDATE player_career_stats SET team_id = 19438 WHERE id = 384; -- Gianfranco Zola: Torres
UPDATE player_career_stats SET team_id = 19439 WHERE id = 391; -- Roberto Carlos: União São João
UPDATE player_career_stats SET team_id = 19440 WHERE id = 159; -- Eusebio: União de Tomar
UPDATE player_career_stats SET team_id = 19441 WHERE id = 527; -- David Villa: Vissel Kobe
UPDATE player_career_stats SET team_id = 19442 WHERE id = 135; -- Johan Cruyff: Washington Diplomats
UPDATE player_career_stats SET team_id = 19443 WHERE id = 165; -- Bobby Charlton: Waterford
UPDATE player_career_stats SET team_id = 19444 WHERE id = 1; -- George Weah: Young Survivors
UPDATE player_career_stats SET team_id = 19445 WHERE id = 60; -- Pavel Nedved: Škoda Plzeň
UPDATE player_career_stats SET team_id = 19446 WHERE id = 114; -- Romario: → Adelaide United (loan)
UPDATE player_career_stats SET team_id = 19447 WHERE id = 111; -- Romario: → Al Sadd (loan)
UPDATE player_career_stats SET team_id = 19382 WHERE id = 833; -- Jan Oblak: → Beira-Mar (loan)
UPDATE player_career_stats SET team_id = 19448 WHERE id = 888; -- Gordon Banks: → Cleveland Stokers (loan)
UPDATE player_career_stats SET team_id = 19449 WHERE id = 61; -- Pavel Nedved: → Dukla Prague (loan)
UPDATE player_career_stats SET team_id = 19450 WHERE id = 889; -- Gordon Banks: → Hellenic (loan)
UPDATE player_career_stats SET team_id = 19451 WHERE id = 526; -- David Villa: → Melbourne City (loan)
UPDATE player_career_stats SET team_id = 19452 WHERE id = 834; -- Jan Oblak: → Olhanense (loan)
UPDATE player_career_stats SET team_id = 19453 WHERE id = 891; -- Gordon Banks: → St Patrick's Athletic (loan)
UPDATE player_career_stats SET team_id = 19454 WHERE id = 835; -- Jan Oblak: → União de Leiria (loan)
UPDATE player_career_stats SET team_id = 19455 WHERE id = 745; -- Takefusa Kubo: → Yokohama F. Marinos (loan)

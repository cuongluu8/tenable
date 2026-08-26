-- Tenable content schema
-- One row per "Top 10" category. Answers live in a child table so we can
-- query/validate individual guesses server-side without shipping the full
-- answer list to the client.

CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,       -- e.g. "pl-top-scorers-alltime"
	title TEXT NOT NULL,             -- e.g. "Top 10 Premier League all-time goalscorers"
	subtitle TEXT,                   -- optional extra context shown in the UI
	stat_label TEXT NOT NULL,        -- e.g. "goals" — shown next to each revealed answer
	scheduled_date TEXT UNIQUE,      -- YYYY-MM-DD, the day this category is "today's puzzle"
	entity_type TEXT NOT NULL DEFAULT 'club',
		-- what kind of thing every answer in this category is: 'club', 'player',
		-- or 'country' (extend as new category shapes are added). Used to scope
		-- typeahead suggestions to the same kind of thing — see suggestNames().
	group_label TEXT NOT NULL DEFAULT 'All-Time Records',
		-- heading the category list groups under on the client, e.g.
		-- "This Season", "Club Goalscorers" — purely presentational, doesn't
		-- affect play. Free-form text, not an enum, same rationale as
		-- entity_type: adding a new section is just a new label, no migration.
	group_order INTEGER NOT NULL DEFAULT 0,
		-- display order of group_label sections on the client (ascending);
		-- categories within a group stay in id order. Ties within the same
		-- group_order are harmless (falls back to id), but every category in
		-- one section should share the same group_order or the section will
		-- render out of its intended position.
	reference_scope TEXT
		-- optional reference_entities.category value (e.g. 'Spain', 'England')
		-- this category's answers belong to. NULL means "no single scope" —
		-- e.g. a pan-European or all-time-across-many-countries category —
		-- and suggestNames() falls back to its previous global-reference
		-- behavior. Set only on single-country club-table categories (found
		-- 2026-08-26: searching "re" while playing La Liga returned Remo,
		-- Rennes, Reading, Recoleta — clubs from four other countries —
		-- ahead of Real Oviedo, an actual 2025-26 La Liga club, because the
		-- reference pool was searched globally with no notion of which
		-- country's clubs this category's answers are drawn from; see
		-- suggestNames() for how this narrows that without hiding the rest
		-- of the world's names entirely, which would remove the
		-- "type any name for spelling help" behavior that global search was
		-- deliberately built for).
);

CREATE TABLE IF NOT EXISTS answers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	category_id INTEGER NOT NULL REFERENCES categories(id),
	rank INTEGER NOT NULL,           -- 1 = best/most, matches the category's ordering
	canonical_name TEXT NOT NULL,    -- display name, e.g. "Cristiano Ronaldo"
	stat_value TEXT NOT NULL,        -- e.g. "145" — paired with categories.stat_label
	UNIQUE (category_id, rank)
);

CREATE TABLE IF NOT EXISTS answer_aliases (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	answer_id INTEGER NOT NULL REFERENCES answers(id),
	alias TEXT NOT NULL              -- normalized (lowercase, no accents/punctuation) match string
);

CREATE INDEX IF NOT EXISTS idx_answers_category ON answers(category_id);
CREATE INDEX IF NOT EXISTS idx_aliases_answer ON answer_aliases(answer_id);
CREATE INDEX IF NOT EXISTS idx_aliases_alias ON answer_aliases(alias);

-- Typeahead-only reference pool: real-world names (e.g. football clubs) that
-- are NOT necessarily a correct answer in any category. suggestNames() reads
-- this alongside answer_aliases so the guess box can suggest/autocomplete any
-- recognizable name, not just this category's answers. Guess validation
-- (matchGuess) never reads these tables — they can't make a wrong guess
-- "count". See agents.md for the rule this exists to satisfy.
CREATE TABLE IF NOT EXISTS reference_entities (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	canonical_name TEXT NOT NULL,
	category TEXT NOT NULL,          -- loose grouping (e.g. a country), not a FK
	entity_type TEXT NOT NULL DEFAULT 'club'
		-- same vocabulary as categories.entity_type ('club', 'player', 'country'),
		-- so a reference entity only ever surfaces as a suggestion for a
		-- category asking for the same kind of thing.
);

CREATE TABLE IF NOT EXISTS reference_entity_aliases (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	entity_id INTEGER NOT NULL REFERENCES reference_entities(id),
	alias TEXT NOT NULL              -- normalized, same rules as answer_aliases.alias
);

CREATE INDEX IF NOT EXISTS idx_reference_entities_category ON reference_entities(category);
CREATE INDEX IF NOT EXISTS idx_reference_entity_aliases_entity ON reference_entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_reference_entity_aliases_alias ON reference_entity_aliases(alias);

-- Full-text search index backing suggestNames() typeahead. Indexes the
-- canonical name of every answer and every reference_entities row, tokenized
-- on word boundaries (unicode61, diacritics stripped) so a prefix query
-- matches ANY word in the name, not just its start — "szo" finds "Dominik
-- Szoboszlai", "arnold" finds "Trent Alexander-Arnold" — with no per-name
-- alias row required. That's the fix for a whole class of bug found
-- 2026-08-25: an answer_aliases/reference_entity_aliases row is still the
-- only way to match a name that ISN'T a substring of canonical_name at all
-- (a real nickname — "psg", "barca", "vvd" — not derivable by tokenizing the
-- name itself), so those alias tables stay and suggestNames() still unions
-- them in; they're just no longer required just to make first/last-name
-- search work.
--
-- Not "external content" FTS5 (which ties the index to exactly one source
-- table) because this indexes two: answers and reference_entities. Kept in
-- sync by the triggers below instead — INSERT/UPDATE/DELETE on either source
-- table mirrors into entity_search. `source`/`source_id` identify which row
-- produced an entity_search row (for the DELETE side of an UPDATE); neither
-- is otherwise used by suggestNames() and both are UNINDEXED (stored, not
-- full-text-searched), same as entity_type.
CREATE VIRTUAL TABLE IF NOT EXISTS entity_search USING fts5(
	name,
	entity_type UNINDEXED,
	source UNINDEXED,
	source_id UNINDEXED,
	tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS entity_search_answers_ai AFTER INSERT ON answers BEGIN
	INSERT INTO entity_search (name, entity_type, source, source_id)
	SELECT NEW.canonical_name, c.entity_type, 'answer', NEW.id
	FROM categories c WHERE c.id = NEW.category_id;
END;

CREATE TRIGGER IF NOT EXISTS entity_search_answers_au AFTER UPDATE ON answers BEGIN
	DELETE FROM entity_search WHERE source = 'answer' AND source_id = OLD.id;
	INSERT INTO entity_search (name, entity_type, source, source_id)
	SELECT NEW.canonical_name, c.entity_type, 'answer', NEW.id
	FROM categories c WHERE c.id = NEW.category_id;
END;

CREATE TRIGGER IF NOT EXISTS entity_search_answers_ad AFTER DELETE ON answers BEGIN
	DELETE FROM entity_search WHERE source = 'answer' AND source_id = OLD.id;
END;

-- entity_search denormalizes categories.entity_type onto every one of that
-- category's answer rows (so a lookup never needs to join out to categories
-- just to filter by type). That denormalization goes stale if a category's
-- entity_type is corrected *after* its answers already exist — which seed.sql
-- itself does (categories are inserted with entity_type defaulting to
-- 'club', then `UPDATE categories SET entity_type = 'player' WHERE slug IN
-- (...)` fixes up player/country categories afterward) — so this trigger is
-- required, not optional, for entity_search to end up correct even on a
-- fresh seed.
CREATE TRIGGER IF NOT EXISTS entity_search_categories_au AFTER UPDATE OF entity_type ON categories BEGIN
	DELETE FROM entity_search WHERE source = 'answer'
		AND source_id IN (SELECT id FROM answers WHERE category_id = NEW.id);
	INSERT INTO entity_search (name, entity_type, source, source_id)
	SELECT canonical_name, NEW.entity_type, 'answer', id
	FROM answers WHERE category_id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS entity_search_reference_ai AFTER INSERT ON reference_entities BEGIN
	INSERT INTO entity_search (name, entity_type, source, source_id)
	VALUES (NEW.canonical_name, NEW.entity_type, 'reference', NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS entity_search_reference_au AFTER UPDATE ON reference_entities BEGIN
	DELETE FROM entity_search WHERE source = 'reference' AND source_id = OLD.id;
	INSERT INTO entity_search (name, entity_type, source, source_id)
	VALUES (NEW.canonical_name, NEW.entity_type, 'reference', NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS entity_search_reference_ad AFTER DELETE ON reference_entities BEGIN
	DELETE FROM entity_search WHERE source = 'reference' AND source_id = OLD.id;
END;

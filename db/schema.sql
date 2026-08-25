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
	entity_type TEXT NOT NULL DEFAULT 'club'
		-- what kind of thing every answer in this category is: 'club', 'player',
		-- or 'country' (extend as new category shapes are added). Used to scope
		-- typeahead suggestions to the same kind of thing — see suggestNames().
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

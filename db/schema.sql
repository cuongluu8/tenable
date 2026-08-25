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
	scheduled_date TEXT UNIQUE       -- YYYY-MM-DD, the day this category is "today's puzzle"
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

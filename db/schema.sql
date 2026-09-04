-- Tenable content schema
--
-- Rebuilt (2026-08-31) around a single source of truth for identity. The
-- previous schema kept a category's answer names (`answers.canonical_name`)
-- and the typeahead reference pool (`reference_entities.canonical_name`) as
-- two separate free-text strings for the same real-world person/club/
-- country, reconciled only by convention and a drift-detection script
-- (`verify-name-sync.ts`). That shipped the same bug three times in
-- production (see git history around 2026-08-26/27: "Igor Thiago" entered
-- as just "Thiago", "Daniel Welbeck" vs. "Danny Welbeck", "Raul Gonzalez"
-- vs. "Raul") before it was fixed as data each time. It's fixed as schema
-- now: `entities` is the only place a name lives; everything else
-- (aliases, stats, answers) references it by id.
--
-- The second change: a category's Top N used to be hand-typed rows
-- (`answers`). It's now a *query* (`category_defs`) over dated, sourced
-- observations (`entity_stats`), materialized into `category_answers` for
-- gameplay to actually read/grade against. This is what lets "add more
-- statistical data" open up new categories without hand-authoring a new
-- answer set for each one, and lets every category state plainly what date
-- its numbers are accurate up to (`as_of_date`) instead of a hand-written,
-- easily-stale claim in a subtitle.

CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,       -- e.g. "pl-top-scorers-alltime"
	title TEXT NOT NULL,             -- e.g. "Top 10 Premier League all-time goalscorers"
	subtitle TEXT,                   -- optional extra context shown in the UI
	stat_label TEXT NOT NULL,        -- e.g. "goals" — shown next to each revealed answer
	scheduled_date TEXT UNIQUE,      -- YYYY-MM-DD, the day this category is "today's puzzle"
	entity_type TEXT NOT NULL DEFAULT 'club',
		-- what kind of thing every answer in this category is: 'club', 'player',
		-- 'country', 'manager' (extend as new category shapes are added). Used
		-- to scope typeahead suggestions to the same kind of thing — see
		-- suggestNames().
	group_label TEXT NOT NULL DEFAULT 'All-Time Records',
		-- heading the category list groups under on the client, e.g.
		-- "This Season", "Club Goalscorers" — purely presentational, doesn't
		-- affect play. Free-form text, not an enum, same rationale as
		-- entity_type: adding a new section is just a new label, no migration.
	group_order INTEGER NOT NULL DEFAULT 0,
		-- display order of group_label sections on the client (ascending);
		-- categories within a group stay in id order.
	reference_scope TEXT
		-- optional entities.scope value (e.g. 'Spain', 'England') this
		-- category's answers belong to. NULL means "no single scope" — see
		-- suggestNames() for how this narrows typeahead ranking without
		-- hiding the rest of the world's names outright.
);

-- The one and only place a real-world name lives. An answer IS an entity
-- (via category_answers.entity_id); the typeahead pool IS every entity.
-- There is no second copy of a name to drift out of sync with this one.
CREATE TABLE IF NOT EXISTS entities (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	canonical_name TEXT NOT NULL,
	entity_type TEXT NOT NULL DEFAULT 'club',   -- same vocabulary as categories.entity_type
	scope TEXT       -- loose grouping (e.g. a country/confederation), not a FK —
		-- same role the old reference_entities.category played.
	-- Duplicate canonical_name across rows is expected and allowed at this
	-- scale (two different real people/clubs can share a name) — identity is
	-- always the id, never the name string. Typeahead disambiguates same-name
	-- entities by scope/entity_type context, not by assuming names are unique.
);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_scope ON entities(scope);

CREATE TABLE IF NOT EXISTS entity_aliases (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	entity_id INTEGER NOT NULL REFERENCES entities(id),
	alias TEXT NOT NULL
		-- normalized (lowercase, no accents/punctuation) match string. Only
		-- for real nicknames that aren't derivable from the canonical name
		-- itself ("psg", "vvd", "cr7") — matching an entity's own name never
		-- requires an alias row here, see matchGuess()/suggestNames() below,
		-- which is what closes off the "forgot to add the self-alias" bug
		-- class structurally rather than by convention.
);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity ON entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_alias ON entity_aliases(alias);

-- Dated, sourced observations about an entity. Append-only by convention: a
-- correction or an updated in-progress-season total is a new row with a new
-- as_of_date, never an UPDATE in place — so "what did we believe true, and
-- as of when" stays recoverable instead of being silently overwritten, and
-- a category can honestly state the date its numbers are accurate up to.
CREATE TABLE IF NOT EXISTS entity_stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	entity_id INTEGER NOT NULL REFERENCES entities(id),
	stat_key TEXT NOT NULL,        -- e.g. 'pl-alltime-top-scorers', 'career-ucl-goals'
	scope TEXT NOT NULL DEFAULT 'default',  -- season/competition qualifier, e.g. '2025-26'
	value_numeric REAL,            -- sortable number; NULL only if genuinely not orderable
	display_value TEXT NOT NULL,   -- what's actually shown, e.g. "145", "£222m", "2025-26"
	as_of_date TEXT NOT NULL,      -- UTC "YYYY-MM-DD" this value is accurate up to
	origin_rank INTEGER,           -- optional manual order pin AND occurrence
		-- identity — two roles, both load-bearing (see rebuild.ts's
		-- REBUILD_QUERY_SQL comment for the mechanics): (1) breaks a tie left
		-- unresolved by value_numeric/tiebreak_stat_key according to curator
		-- judgment (e.g. "most recent title" when two clubs are tied on count
		-- and the tiebreak stat itself isn't modeled yet); (2) for a "one row
		-- per occurrence" category (e.g. a World Cup Golden Boot winner who
		-- won it twice), distinguishes genuinely different occurrences of the
		-- same entity so they don't collapse into one — rows sharing
		-- (entity_id, stat_key, scope, origin_rank) are the SAME fact
		-- re-observed over time and collapse to their latest as_of_date; rows
		-- differing only in origin_rank are kept as separate results. Not a
		-- migration-only field — any category can use it going forward.
	source TEXT,                   -- where this value came from (outlet/site/API)
	verified_at TEXT                -- UTC "YYYY-MM-DD" this was actually checked, vs. as_of_date's "true as of"
);
CREATE INDEX IF NOT EXISTS idx_entity_stats_entity ON entity_stats(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_stats_key_scope ON entity_stats(stat_key, scope);

-- A single transfer event. Kept as its own table rather than shoehorned
-- into entity_stats: a transfer inherently references TWO other entities
-- (the selling and buying club), and entity_stats only ever carries one
-- entity_id per row — cramming the counterpart club into `scope` as a bare
-- string would repeat exactly the "identity is a name string, not an id"
-- mistake this whole redesign exists to close off. from_club_id/to_club_id
-- are real FKs into entities so a transfer is always resolvable to the
-- actual club rows, never just their name at time of writing.
CREATE TABLE IF NOT EXISTS transfers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL REFERENCES entities(id),
	from_club_id INTEGER REFERENCES entities(id),  -- NULL: youth academy graduate / no prior club on record
	to_club_id INTEGER REFERENCES entities(id),    -- NULL: retired / released with no club on record yet
	transfer_date TEXT NOT NULL,     -- UTC "YYYY-MM-DD"; use the 1st of the month if only month/year is known
	transfer_type TEXT NOT NULL DEFAULT 'permanent'
		CHECK (transfer_type IN ('permanent', 'loan', 'free', 'undisclosed')),
	fee_eur_value REAL,              -- NULL for free/loan/undisclosed
	fee_gbp_value REAL,              -- approximate: converted from fee_eur_value at the approximate
		-- EUR/GBP rate for transfer_date's year (see docs/fx-rates.md, or wherever this
		-- ends up documented) — never a live/current-day rate applied to a historical fee.
	display_value TEXT NOT NULL,     -- what's shown, e.g. "€222m (~£195m)" or "Free transfer" or "Loan"
	source TEXT NOT NULL,
	verified_at TEXT NOT NULL        -- UTC "YYYY-MM-DD" this was actually checked
);
CREATE INDEX IF NOT EXISTS idx_transfers_player ON transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_club ON transfers(from_club_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_club ON transfers(to_club_id);

-- A single managerial spell — one club (or national team; club_id can
-- reference an entity_type='country' row for that case), one start date,
-- an end date that's NULL while the spell is still open as of verified_at.
-- Same "this needs two entity references, not one" reasoning as transfers
-- above is why it isn't folded into entity_stats.
CREATE TABLE IF NOT EXISTS management_spells (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	manager_id INTEGER NOT NULL REFERENCES entities(id),
	club_id INTEGER REFERENCES entities(id),  -- may reference a country entity for a national-team job
	start_date TEXT NOT NULL,        -- UTC "YYYY-MM-DD"; use the 1st of the month if only month/year is known
	end_date TEXT,                   -- NULL: still in charge as of verified_at
	titles_won TEXT,                 -- free-text summary for this spell, e.g. "1x league title, 1x domestic cup"
	source TEXT NOT NULL,
	verified_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_management_spells_manager ON management_spells(manager_id);
CREATE INDEX IF NOT EXISTS idx_management_spells_club ON management_spells(club_id);

-- A player's per-team career stint — one row per club spell OR per national
-- team level (competition_type distinguishes them). Same "this needs two
-- entity references, not one" reasoning as transfers/management_spells above
-- is why this isn't folded into entity_stats. Added 2026-09-04 to replace a
-- single aggregated career-goals/career-appearances entity_stats row per
-- player: a lump total, sourced only from a single aggregate figure, gave no
-- way to cross-check itself and was the root cause of a real batch of wrong
-- data (see agents.md/docs/stats-enrichment.md's incident notes around this
-- date) — a per-team breakdown is independently sourced per row (each row is
-- a literal figure from the source, e.g. a Wikipedia infobox's own numbered
-- club-history row) and a player's career total for competition_type='club'
-- is a SUM query over these rows, not a separately-stored, separately-wrong
-- number. This also unlocks team-level categories a lump total never could
-- (e.g. "Top scorer for Club X"), not just the player's own career total.
CREATE TABLE IF NOT EXISTS player_career_stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL REFERENCES entities(id),
	team_id INTEGER REFERENCES entities(id),  -- the club, or a country entity for competition_type='international'
		-- (e.g. a youth level like "England U17"); NULL if the team isn't in
		-- the local entity pool or the name couldn't be confidently resolved
	team_name_raw TEXT NOT NULL,      -- literal team name as sourced, kept even when team_id resolves —
		-- same "don't discard the original name once matched to an id" reasoning as elsewhere
	competition_type TEXT NOT NULL CHECK (competition_type IN ('club', 'international')),
	years_display TEXT,               -- e.g. "2004-2017", free text as sourced (formats vary too much to normalize)
	appearances INTEGER,               -- NULL if genuinely not stated
	goals INTEGER,                     -- NULL if genuinely not stated
	scope_note TEXT,                   -- e.g. 'domestic league only' when the source itself flags this
		-- (Wikipedia infobox editors sometimes mark a club's row as league-only via an inline
		-- wikitext comment invisible on the rendered page); NULL when presumed all-competitions
	source TEXT NOT NULL,
	verified_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_player_career_stats_player ON player_career_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_career_stats_team ON player_career_stats(team_id);

-- The query a category's Top N is computed from. One row per category
-- (1:1). See src/worker/lib/rebuild.ts for what actually runs this.
CREATE TABLE IF NOT EXISTS category_defs (
	category_id INTEGER PRIMARY KEY REFERENCES categories(id),
	stat_key TEXT NOT NULL,
	scope TEXT NOT NULL DEFAULT 'default',
	sort_dir TEXT NOT NULL DEFAULT 'DESC' CHECK (sort_dir IN ('ASC', 'DESC')),
	tiebreak_stat_key TEXT,          -- optional secondary entity_stats.stat_key
	tiebreak_scope TEXT NOT NULL DEFAULT 'default',
	tiebreak_dir TEXT NOT NULL DEFAULT 'DESC' CHECK (tiebreak_dir IN ('ASC', 'DESC')),
	limit_n INTEGER NOT NULL DEFAULT 10,   -- bounded Top N — never "every qualifier",
		-- see the "Generic rule" this codifies in agents.md
	target_date TEXT                -- NULL = always the latest known value (recomputed
		-- every rebuild); a fixed date freezes a genuinely historical question
		-- ("Top scorers as of end of 2010") to always resolve the same way.
);

-- Materialized answers — what gameplay actually reads and grades against.
-- Written only by rebuildCategory(), never hand-edited: this is the
-- snapshot that keeps a round's answer set stable while entity_stats keeps
-- accumulating new dated observations underneath it.
CREATE TABLE IF NOT EXISTS category_answers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	category_id INTEGER NOT NULL REFERENCES categories(id),
	rank INTEGER NOT NULL,
	entity_id INTEGER NOT NULL REFERENCES entities(id),
	value_numeric REAL,
	display_value TEXT NOT NULL,
	as_of_date TEXT NOT NULL,        -- surfaced to players — the actual currency guarantee
	computed_at TEXT NOT NULL,
	UNIQUE (category_id, rank)
);
CREATE INDEX IF NOT EXISTS idx_category_answers_category ON category_answers(category_id);
CREATE INDEX IF NOT EXISTS idx_category_answers_entity ON category_answers(entity_id);

-- Single-row version counter, bumped on every rebuild. Used as a cache-
-- busting key for the Cache API layer (src/worker/index.ts) so the two
-- public read routes can be edge-cached without a D1 read to check
-- freshness on every request.
CREATE TABLE IF NOT EXISTS content_version (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	version INTEGER NOT NULL DEFAULT 1,
	updated_at TEXT NOT NULL
);
INSERT OR IGNORE INTO content_version (id, version, updated_at) VALUES (1, 1, '2026-08-31');

-- Full-text search index backing suggestNames() typeahead. Indexes every
-- entity's canonical name, tokenized on word boundaries (unicode61,
-- diacritics stripped) so a prefix query matches ANY word in the name, not
-- just its start — "szo" finds "Dominik Szoboszlai", "arnold" finds "Trent
-- Alexander-Arnold" — with no per-name alias row required.
--
-- This is simpler than the previous version by construction: entity_search
-- used to mirror two different source tables (answers, reference_entities)
-- with a source/source_id discriminator, plus a trigger watching
-- categories.entity_type UPDATEs to fix up denormalized type on already-
-- inserted answer rows. Now every entity carries its own entity_type
-- directly and permanently — there's exactly one source table, and nothing
-- to cascade.
CREATE VIRTUAL TABLE IF NOT EXISTS entity_search USING fts5(
	name,
	entity_type UNINDEXED,
	entity_id UNINDEXED,
	tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS entity_search_ai AFTER INSERT ON entities BEGIN
	INSERT INTO entity_search (name, entity_type, entity_id)
	VALUES (NEW.canonical_name, NEW.entity_type, NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS entity_search_au AFTER UPDATE ON entities BEGIN
	DELETE FROM entity_search WHERE entity_id = OLD.id;
	INSERT INTO entity_search (name, entity_type, entity_id)
	VALUES (NEW.canonical_name, NEW.entity_type, NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS entity_search_ad AFTER DELETE ON entities BEGIN
	DELETE FROM entity_search WHERE entity_id = OLD.id;
END;

-- Cost guardrails (see agents.md — Cloudflare has no account-wide spending
-- cap for Workers/D1/KV, so these are the app's own fail-closed ceilings).
-- Both are D1-backed rather than KV-backed deliberately: they're written on
-- every request they guard, and D1 row-writes are far cheaper and have a
-- far larger included allotment than KV writes (see agents.md) — using KV
-- for a per-request counter would undermine the guardrail it's meant to be.

-- One row per calendar day (UTC), incremented once per request across the
-- whole app. See circuitBreaker.ts.
CREATE TABLE IF NOT EXISTS request_budget (
	date TEXT PRIMARY KEY,           -- "YYYY-MM-DD"
	count INTEGER NOT NULL DEFAULT 0
);

-- One row per distinct client IP ever seen at /api/suggest (not per
-- IP-per-window — the window resets in place, so this table's size is
-- bounded by real distinct visitors, not visitors x time). See
-- suggestRateLimit.ts.
CREATE TABLE IF NOT EXISTS suggest_rate_limit (
	ip TEXT PRIMARY KEY,
	window TEXT NOT NULL,            -- "YYYY-MM-DDTHH:MM", the 1-minute bucket count applies to
	count INTEGER NOT NULL DEFAULT 0
);

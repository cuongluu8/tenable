import { collapseToAlnum, normalize } from "./normalize";

// "Roll of Honour" (2026-09-13): a grid of seasons for one competition,
// each tile hiding that season's winner -- players fill it in. The data is
// curated here in code, not in D1: a competition's winners list is a small,
// fixed, well-known fact table (70 rows for the Champions League), and
// keeping it here means adding a competition is adding a list below, no
// migration. Club identity for badges/aliases is still resolved against
// `entities` at game start (buildHonourTiles) -- by (name, country), since
// canonical_name alone is ambiguous (there's a Barcelona in Ecuador and a
// Liverpool in Uruguay in the table). A winner with no entity row (Steaua
// București, as of 2026-09-13) still works: no badge, graded on its
// curated name + aliases only, and offered by /suggest via the curated
// list so it can actually be picked (GuessInput only submits picks).
//
// The European Cup / Champions League are the only competitions so far --
// the structure is ready for more (English top flight, Premier League,
// ...) but they're deliberately NOT added yet (2026-09-13). The most
// recent season listed is 2024-25; 2025-26's final needs confirming
// before it's added.

export interface HonourSeasonDef {
	season: string; // "1955-56" -- the tile's label
	winner: string; // entities.canonical_name where one exists
	country: string; // entities.scope, to disambiguate same-name clubs
	aliases?: string[]; // extra accepted spellings on top of entity_aliases
}

export interface HonourCompetitionDef {
	id: string;
	name: string;
	seasons: HonourSeasonDef[];
}

const RM = { winner: "Real Madrid", country: "Spain", aliases: ["Real"] };
const ACM = { winner: "AC Milan", country: "Italy", aliases: ["Milan"] };
const INT = { winner: "Inter Milan", country: "Italy", aliases: ["Inter", "Internazionale"] };
const MUN = { winner: "Manchester United", country: "England", aliases: ["Man Utd", "Man United"] };
const AJX = { winner: "Ajax", country: "Netherlands", aliases: ["Ajax Amsterdam"] };
const BAY = { winner: "Bayern Munich", country: "Germany", aliases: ["Bayern", "Bayern München"] };
const LIV = { winner: "Liverpool", country: "England" };
const NFO = { winner: "Nottingham Forest", country: "England", aliases: ["Forest", "Notts Forest"] };
const JUV = { winner: "Juventus", country: "Italy", aliases: ["Juve"] };
const BAR = { winner: "Barcelona", country: "Spain", aliases: ["Barca", "Barça", "FC Barcelona"] };
const CHE = { winner: "Chelsea", country: "England" };
const POR = { winner: "Porto", country: "Portugal", aliases: ["FC Porto"] };

// Split at the 1992 rebrand (2026-09-13): the European Cup years and the
// Champions League era are two grids, not one 70-tile one -- the host
// picks which in the lobby. Same competition historically; two names,
// two sizes that each fit a phone better.
export const HONOUR_COMPETITIONS: Record<string, HonourCompetitionDef> = {
	"european-cup": {
		id: "european-cup",
		name: "European Cup",
		seasons: [
			{ season: "1955-56", ...RM },
			{ season: "1956-57", ...RM },
			{ season: "1957-58", ...RM },
			{ season: "1958-59", ...RM },
			{ season: "1959-60", ...RM },
			{ season: "1960-61", winner: "Benfica", country: "Portugal", aliases: ["SL Benfica"] },
			{ season: "1961-62", winner: "Benfica", country: "Portugal", aliases: ["SL Benfica"] },
			{ season: "1962-63", ...ACM },
			{ season: "1963-64", ...INT },
			{ season: "1964-65", ...INT },
			{ season: "1965-66", ...RM },
			{ season: "1966-67", winner: "Celtic", country: "Scotland", aliases: ["Glasgow Celtic"] },
			{ season: "1967-68", ...MUN },
			{ season: "1968-69", ...ACM },
			{ season: "1969-70", winner: "Feyenoord", country: "Netherlands" },
			{ season: "1970-71", ...AJX },
			{ season: "1971-72", ...AJX },
			{ season: "1972-73", ...AJX },
			{ season: "1973-74", ...BAY },
			{ season: "1974-75", ...BAY },
			{ season: "1975-76", ...BAY },
			{ season: "1976-77", ...LIV },
			{ season: "1977-78", ...LIV },
			{ season: "1978-79", ...NFO },
			{ season: "1979-80", ...NFO },
			{ season: "1980-81", ...LIV },
			{ season: "1981-82", winner: "Aston Villa", country: "England", aliases: ["Villa"] },
			{ season: "1982-83", winner: "Hamburger SV", country: "Germany", aliases: ["Hamburg", "HSV"] },
			{ season: "1983-84", ...LIV },
			{ season: "1984-85", ...JUV },
			{ season: "1985-86", winner: "Steaua București", country: "Romania", aliases: ["Steaua", "Steaua Bucharest", "Steaua Bucuresti", "FCSB"] },
			{ season: "1986-87", ...POR },
			{ season: "1987-88", winner: "PSV Eindhoven", country: "Netherlands", aliases: ["PSV"] },
			{ season: "1988-89", ...ACM },
			{ season: "1989-90", ...ACM },
			{ season: "1990-91", winner: "Red Star Belgrade", country: "Serbia", aliases: ["Red Star", "Crvena Zvezda"] },
			{ season: "1991-92", ...BAR },
		],
	},
	"champions-league": {
		id: "champions-league",
		name: "Champions League",
		seasons: [
			{ season: "1992-93", winner: "Marseille", country: "France", aliases: ["Olympique de Marseille", "Olympique Marseille", "OM"] },
			{ season: "1993-94", ...ACM },
			{ season: "1994-95", ...AJX },
			{ season: "1995-96", ...JUV },
			{ season: "1996-97", winner: "Borussia Dortmund", country: "Germany", aliases: ["Dortmund", "BVB"] },
			{ season: "1997-98", ...RM },
			{ season: "1998-99", ...MUN },
			{ season: "1999-00", ...RM },
			{ season: "2000-01", ...BAY },
			{ season: "2001-02", ...RM },
			{ season: "2002-03", ...ACM },
			{ season: "2003-04", ...POR },
			{ season: "2004-05", ...LIV },
			{ season: "2005-06", ...BAR },
			{ season: "2006-07", ...ACM },
			{ season: "2007-08", ...MUN },
			{ season: "2008-09", ...BAR },
			{ season: "2009-10", ...INT },
			{ season: "2010-11", ...BAR },
			{ season: "2011-12", ...CHE },
			{ season: "2012-13", ...BAY },
			{ season: "2013-14", ...RM },
			{ season: "2014-15", ...BAR },
			{ season: "2015-16", ...RM },
			{ season: "2016-17", ...RM },
			{ season: "2017-18", ...RM },
			{ season: "2018-19", ...LIV },
			{ season: "2019-20", ...BAY },
			{ season: "2020-21", ...CHE },
			{ season: "2021-22", ...RM },
			{ season: "2022-23", winner: "Manchester City", country: "England", aliases: ["Man City", "City"] },
			{ season: "2023-24", ...RM },
			{ season: "2024-25", winner: "Paris Saint-Germain", country: "France", aliases: ["PSG", "Paris SG", "Paris Saint Germain"] },
		],
	},
};

export const DEFAULT_HONOUR_COMPETITION_ID = "champions-league";

// One tile as the server holds it -- the answer and everything needed to
// grade a guess for it. Never sent to clients as-is (see remoteGameSession
// .ts's publicHonour for what is).
export interface HonourTilePrivate {
	season: string;
	winner: string;
	imageUrl: string | null;
	// Pre-collapsed (collapseToAlnum(normalize(...))) accepted spellings.
	matchStrings: string[];
}

function collapse(s: string): string {
	return collapseToAlnum(normalize(s));
}

// Resolves each season's winner against entities (badge + curated aliases)
// once, at game start. Two indexed queries total, however many seasons.
export async function buildHonourTiles(db: D1Database, competition: HonourCompetitionDef): Promise<HonourTilePrivate[]> {
	const names = [...new Set(competition.seasons.map((s) => s.winner))];
	const { results: clubRows } = await db
		.prepare(`SELECT id, canonical_name, scope, image_key FROM entities WHERE entity_type = 'club' AND canonical_name IN (${names.map(() => "?").join(",")})`)
		.bind(...names)
		.all<{ id: number; canonical_name: string; scope: string | null; image_key: string | null }>();
	const rows = clubRows ?? [];
	// (name, country) -> row; falls back to a name-only match when the
	// scope isn't recorded, so a missing scope never costs a badge.
	const rowFor = (winner: string, country: string) =>
		rows.find((r) => r.canonical_name === winner && r.scope === country) ?? rows.find((r) => r.canonical_name === winner && !r.scope);
	const ids = [...new Set(competition.seasons.map((s) => rowFor(s.winner, s.country)?.id).filter((id): id is number => id !== undefined))];
	const aliasesById = new Map<number, string[]>();
	if (ids.length > 0) {
		const { results: aliasRows } = await db
			.prepare(`SELECT entity_id, alias FROM entity_aliases WHERE entity_id IN (${ids.map(() => "?").join(",")})`)
			.bind(...ids)
			.all<{ entity_id: number; alias: string }>();
		for (const r of aliasRows ?? []) aliasesById.set(r.entity_id, [...(aliasesById.get(r.entity_id) ?? []), r.alias]);
	}
	return competition.seasons.map((s) => {
		const row = rowFor(s.winner, s.country);
		const strings = [s.winner, ...(s.aliases ?? []), ...(row ? aliasesById.get(row.id) ?? [] : [])];
		return {
			season: s.season,
			winner: s.winner,
			imageUrl: row?.image_key ? `/api/media/${row.image_key}` : null,
			matchStrings: [...new Set(strings.map(collapse).filter(Boolean))],
		};
	});
}

export function gradeHonourGuess(guess: string, tile: HonourTilePrivate): boolean {
	const g = collapse(guess);
	return g.length > 0 && tile.matchStrings.includes(g);
}

// Distinct winner names across every competition -- the curated half of
// /suggest's pool (the other half is the whole entities club table).
export function allHonourWinnerNames(): string[] {
	return [...new Set(Object.values(HONOUR_COMPETITIONS).flatMap((c) => c.seasons.map((s) => s.winner)))];
}

import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/suggestRateLimit";
import { HONOUR_COMPETITIONS, allHonourWinnerNames, buildHonourTiles, gradeHonourGuess, type HonourTilePrivate } from "../lib/rollOfHonour";

const rollOfHonour = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 3; // Matches suggest.ts / GuessInput.tsx.
const MAX_RESULTS = 20;

// GET /api/roll-of-honour/competitions -- what the lobby can offer.
rollOfHonour.get("/competitions", (c) =>
	c.json({
		competitions: Object.values(HONOUR_COMPETITIONS).map((comp) => ({ id: comp.id, name: comp.name, seasonCount: comp.seasons.length })),
	}),
);

// GET /api/roll-of-honour/suggest?q= -- club typeahead for the grid's
// guess box. The WHOLE entities club table (~700 rows), not just the
// winners, so the list itself gives nothing away -- plus any curated
// winner that has no entities row (see lib/rollOfHonour.ts), since
// GuessInput only ever submits a picked suggestion and a club that never
// appears could never be answered. Same rate limit as /api/suggest.
rollOfHonour.get("/suggest", enforceSuggestRateLimit, async (c) => {
	const raw = c.req.query("q") ?? "";
	const prefix = normalize(raw.slice(0, 60));
	if (prefix.length < MIN_QUERY_LENGTH) return c.json({ suggestions: [], truncated: false });

	const { names, truncated } = await suggestNames(c.env.DB, prefix, "club", MAX_RESULTS, null);
	const have = new Set(names.map((n) => normalize(n)));
	const curated = allHonourWinnerNames().filter((n) => normalize(n).startsWith(prefix) && !have.has(normalize(n)));
	return c.json({ suggestions: [...names, ...curated], truncated });
});

// ---- Single player (2026-09-13) ----
//
// The same grid, one device, 5 lives (RollOfHonourSolo.tsx). Same
// server-authoritative shape as every other solo mode here: the board
// carries season labels only, each guess is graded by /check, the one
// hint (/hint: the winner's country) is fetched on demand, and /reveal
// hands over the whole roll only when the client says the game is over
// -- which a solo device could of course call early, but there's nobody
// to cheat but yourself, same reasoning as clubBadges.ts shipping hint
// fields up front. Tiles are built once per competition per isolate:
// two id-keyed queries, then cached -- the list is fixed data.

const tilesByCompetition = new Map<string, Promise<HonourTilePrivate[]>>();
function tilesFor(db: D1Database, competitionId: string): Promise<HonourTilePrivate[]> | null {
	const competition = HONOUR_COMPETITIONS[competitionId];
	if (!competition) return null;
	let tiles = tilesByCompetition.get(competitionId);
	if (!tiles) {
		tiles = buildHonourTiles(db, competition);
		tilesByCompetition.set(competitionId, tiles);
	}
	return tiles;
}

// GET /api/roll-of-honour/board?competition=ID -- labels only, no answers.
rollOfHonour.get("/board", (c) => {
	const competition = HONOUR_COMPETITIONS[c.req.query("competition") ?? ""];
	if (!competition) return c.json({ error: "Unknown competition" }, 404);
	return c.json({ id: competition.id, name: competition.name, seasons: competition.seasons.map((s) => s.season) });
});

interface CheckBody {
	competitionId?: string;
	season?: string;
	guess?: string;
}

// POST /api/roll-of-honour/check -- grades one season. The winner (and
// badge) come back only on a correct answer.
rollOfHonour.post("/check", async (c) => {
	const body = await c.req.json<CheckBody>().catch(() => ({}) as CheckBody);
	const tiles = body.competitionId ? await tilesFor(c.env.DB, body.competitionId) : null;
	if (!tiles) return c.json({ error: "Unknown competition" }, 404);
	const tile = tiles.find((t) => t.season === body.season);
	if (!tile) return c.json({ error: "Unknown season" }, 404);
	const guess = (body.guess ?? "").trim();
	if (!guess) return c.json({ error: "Missing guess" }, 400);
	if (gradeHonourGuess(guess, tile)) return c.json({ result: "correct" as const, winner: tile.winner, imageUrl: tile.imageUrl });
	return c.json({ result: "wrong" as const });
});

// POST /api/roll-of-honour/hint -- the winner's country for one season.
rollOfHonour.post("/hint", async (c) => {
	const body = await c.req.json<CheckBody>().catch(() => ({}) as CheckBody);
	const tiles = body.competitionId ? await tilesFor(c.env.DB, body.competitionId) : null;
	if (!tiles) return c.json({ error: "Unknown competition" }, 404);
	const tile = tiles.find((t) => t.season === body.season);
	if (!tile) return c.json({ error: "Unknown season" }, 404);
	return c.json({ country: tile.country });
});

// POST /api/roll-of-honour/reveal -- every season's winner, for the
// game-over screen.
rollOfHonour.post("/reveal", async (c) => {
	const body = await c.req.json<CheckBody>().catch(() => ({}) as CheckBody);
	const tiles = body.competitionId ? await tilesFor(c.env.DB, body.competitionId) : null;
	if (!tiles) return c.json({ error: "Unknown competition" }, 404);
	return c.json({ tiles: tiles.map((t) => ({ season: t.season, winner: t.winner, imageUrl: t.imageUrl })) });
});

export default rollOfHonour;

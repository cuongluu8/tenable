import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames } from "../lib/categories";
import { enforceSuggestRateLimit } from "../lib/suggestRateLimit";
import { HONOUR_COMPETITIONS, allHonourWinnerNames } from "../lib/rollOfHonour";

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

export default rollOfHonour;

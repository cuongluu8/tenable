import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames, getCategoryBySlug } from "../lib/categories";

const suggest = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 3;

// A flat cap, after two other approaches: 8 was too aggressive for a query
// specific enough to have few real candidates (e.g. "thiago", 11 total
// matches in the reference pool as of 2026-08-27) — it could lose a
// genuinely famous one (Thiago Alcantara, tied for the longest name among
// those 11) purely to the length-based tiebreak in suggestNames. Scaling the
// limit with query length (tried next) fixed that but made "is the list
// complete?" impossible to tell from the response alone — a player typing a
// long, specific query had no way to know whether a still-missing name
// meant "narrow the search further" or "it's genuinely not in the pool".
// Fixed cap + an explicit `truncated` flag (see suggestNames' `limit + 1`
// trick) solves that directly: the UI tells the player outright when the
// list was cut short instead of silently showing a partial one, so they
// know to keep typing rather than trusting an incomplete list. A short/broad
// prefix ("ma", "an") still matches 500-1600+ distinct players, so 20 stays
// deliberately conservative — the point isn't to fit everything into one
// response, it's for the truncation warning to fire reliably until the
// player narrows the search enough to see a complete list.
const MAX_RESULTS = 20;

// Typeahead for the guess box: name/club/player suggestions matching a
// prefix, searched across the whole database rather than the current
// category's own answers (see suggestNames for why) so it helps with
// spelling without leaking answers. Requires `category` (the slug of the
// category being played) so results can be scoped to that category's
// entity_type — a players category should never suggest a club, and vice
// versa. No/unknown category means no suggestions rather than an unscoped,
// mixed-type list.
suggest.get("/", async (c) => {
	const raw = c.req.query("q") ?? "";
	const prefix = normalize(raw.slice(0, 60));
	const categorySlug = c.req.query("category") ?? "";

	if (prefix.length < MIN_QUERY_LENGTH || !categorySlug) {
		return c.json({ suggestions: [], truncated: false });
	}

	const category = await getCategoryBySlug(c.env.DB, categorySlug);
	if (!category) {
		return c.json({ suggestions: [], truncated: false });
	}

	const { names, truncated } = await suggestNames(
		c.env.DB,
		prefix,
		category.entity_type,
		MAX_RESULTS,
		category.reference_scope,
	);
	return c.json({ suggestions: names, truncated });
});

export default suggest;

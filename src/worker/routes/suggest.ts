import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames, getCategoryBySlug } from "../lib/categories";

const suggest = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

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
		return c.json({ suggestions: [] });
	}

	const category = await getCategoryBySlug(c.env.DB, categorySlug);
	if (!category) {
		return c.json({ suggestions: [] });
	}

	const suggestions = await suggestNames(
		c.env.DB,
		prefix,
		category.entity_type,
		MAX_RESULTS,
		category.reference_scope,
	);
	return c.json({ suggestions });
});

export default suggest;

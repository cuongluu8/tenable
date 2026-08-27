import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames, getCategoryBySlug } from "../lib/categories";

const suggest = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 3;

// A flat result cap can't be right at both ends of the query-length range: 8
// was too aggressive for a query specific enough to have few real candidates
// (e.g. "thiago", 11 total matches in the reference pool as of 2026-08-27) —
// it could still lose a genuinely famous one (Thiago Alcantara, tied for the
// longest name among those 11) purely to the length-based tiebreak in
// suggestNames, well before hitting anything that looks like "too many
// results". But a flat *high* cap isn't right either: a short/broad prefix
// ("ma", "an") matches 500-1600+ distinct players, and showing all of those
// on every keystroke is a real payload/usability problem the guess box's
// scrollable dropdown doesn't solve by just growing the list.
//
// So the limit scales with how specific the (normalized) query already is —
// longer input has fewer real candidates and can afford to show more of
// them, aiming to surface every player sharing a common name rather than
// truncate them by an arbitrary flat cutoff. Linear from MIN_RESULTS at
// MIN_QUERY_LENGTH up to MAX_RESULTS at LONG_QUERY_LENGTH, then flat.
const MIN_RESULTS = 8;
const MAX_RESULTS = 50;
const LONG_QUERY_LENGTH = 12;

function resultLimitFor(queryLength: number): number {
	if (queryLength <= MIN_QUERY_LENGTH) return MIN_RESULTS;
	if (queryLength >= LONG_QUERY_LENGTH) return MAX_RESULTS;
	const t = (queryLength - MIN_QUERY_LENGTH) / (LONG_QUERY_LENGTH - MIN_QUERY_LENGTH);
	return Math.round(MIN_RESULTS + t * (MAX_RESULTS - MIN_RESULTS));
}

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
		resultLimitFor(prefix.length),
		category.reference_scope,
	);
	return c.json({ suggestions });
});

export default suggest;

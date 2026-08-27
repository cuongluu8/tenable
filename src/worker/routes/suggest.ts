import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames, getCategoryBySlug } from "../lib/categories";

const suggest = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 2;
// 8 was too aggressive: a query specific enough to have few real candidates
// (e.g. "thiago", 11 total matches in the reference pool as of 2026-08-27)
// could still lose a genuinely famous one (Thiago Alcantara, tied for the
// longest name among 11 "Thiago"-containing players) purely to the
// length-based tiebreak in suggestNames, well before hitting anything that
// looks like "too many results". 25 leaves real margin for that kind of
// specific search while still bounding the genuinely broad-prefix case a
// cap exists for at all — a short/common prefix ("ma", "an") matches
// 500-1600+ distinct players, and showing all of those on every keystroke
// (not just "more than 8" of them) would be a real payload/usability
// problem, not one the guess box's already-scrollable dropdown solves by
// just growing the list. See agents.md for the incident this constant
// tightened in response to.
const MAX_RESULTS = 25;

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

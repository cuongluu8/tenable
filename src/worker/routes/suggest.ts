import { Hono } from "hono";
import { normalize } from "../lib/normalize";
import { suggestNames } from "../lib/categories";

const suggest = new Hono<{ Bindings: Env }>();

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

// Typeahead for the guess box: name/club suggestions matching a prefix,
// searched across the whole database rather than the current category (see
// suggestNames for why) so it helps with spelling without leaking answers.
suggest.get("/", async (c) => {
	const raw = c.req.query("q") ?? "";
	const prefix = normalize(raw.slice(0, 60));

	if (prefix.length < MIN_QUERY_LENGTH) {
		return c.json({ suggestions: [] });
	}

	const suggestions = await suggestNames(c.env.DB, prefix, MAX_RESULTS);
	return c.json({ suggestions });
});

export default suggest;

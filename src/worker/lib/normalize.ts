// Normalizes a guess or alias into a comparable key: lowercase, accents
// stripped, punctuation removed, whitespace collapsed. Keeps matching
// forgiving ("cristiano ronaldo" == "Cristiano  Ronaldo!") without needing
// exact string equality.
export function normalize(input: string): string {
	return input
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "") // strip diacritics (combining marks)
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.trim()
		.replace(/\s+/g, " ");
}

// Turns an already-normalized string into an FTS5 MATCH query that
// prefix-matches every word, e.g. "erling ha" -> "erling* ha*". Space
// between terms is FTS5's implicit AND, so this finds rows containing a
// token starting with each typed word, in any order/position — which is
// what makes searching "szo" find "Dominik Szoboszlai" (matches the second
// word) without needing an alias row for the surname alone. Safe to pass
// straight into MATCH: `normalize()` already strips everything but
// [a-z0-9\s], so there's no quote/operator syntax to escape or inject.
export function toFtsPrefixQuery(normalized: string): string {
	return normalized
		.split(" ")
		.filter((word) => word.length > 0)
		.map((word) => `${word}*`)
		.join(" ");
}

// Collapses an already-normalized string (or a raw alias straight from the
// database) down to just its letters and digits — no spaces, no punctuation
// at all. This is the single comparison key matchGuess() matches guesses
// against, replacing what used to be an exact-string match plus a growing
// list of special-cased fallbacks (first hyphens, then also ampersands —
// see git history around 2026-08-26) for every punctuation mark normalize()
// happens to delete without leaving a space behind ("Paris Saint-Germain"
// -> "paris saintgermain", "Oleg Salenko & Hristo Stoichkov" -> "oleg
// salenko hristo stoichkov"). Rather than keep hardcoding the next
// character that turns up, this drops the question of "space, hyphen, or
// merged?" entirely: a guess and an alias match if they contain the same
// letters and digits in the same order, full stop. Exact matches still
// match (collapsing doesn't change equal strings' equality), so this is a
// strict superset of the old behavior, not a different one.
export function collapseToAlnum(input: string): string {
	return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

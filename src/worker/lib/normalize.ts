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

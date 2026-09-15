// The browser-side twin of the server's suggestNames(): filters a local
// index (Roll of Honour's whole club pool, or one shard of the player
// pool -- see rollOfHonour/useClubIndex.ts and usePlayerIndex.ts) the way
// the server filters the whole table, so a keystroke needs no request.
// Its own module (not GuessInput.tsx) so it can be unit-tested and shared
// without tripping fast-refresh's components-only rule.
export interface LocalSuggestEntry {
	name: string;
	aliases: string[];
}

const LOCAL_MAX_RESULTS = 20; // Matches suggest.ts's MAX_RESULTS.

// The client-side twin of normalize.ts's normalize(): lowercase, strip
// diacritics and punctuation, collapse whitespace.
export function localNormalize(s: string): string {
	return s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function localSuggest(index: LocalSuggestEntry[], query: string): { suggestions: string[]; truncated: boolean } {
	const q = localNormalize(query);
	if (!q) return { suggestions: [], truncated: false };
	// "van dij" matches "Virgil van Dijk" the way the server's FTS query
	// (`van* dij*`) does: each typed word is a prefix of some word of the
	// name. A one-word query is the common case and the same rule.
	const words = q.split(" ");
	const hits: string[] = [];
	for (const entry of index) {
		const nameWords = localNormalize(entry.name).split(" ");
		const wordHit = words.every((w) => nameWords.some((n) => n.startsWith(w)));
		const aliasHit = !wordHit && entry.aliases.some((a) => localNormalize(a).startsWith(q));
		if (wordHit || aliasHit) {
			hits.push(entry.name);
			if (hits.length > LOCAL_MAX_RESULTS) break;
		}
	}
	return { suggestions: hits.slice(0, LOCAL_MAX_RESULTS), truncated: hits.length > LOCAL_MAX_RESULTS };
}


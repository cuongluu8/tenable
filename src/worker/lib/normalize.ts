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

// Formats a category's asOfDate (UTC "YYYY-MM-DD", see worker/lib/types.ts)
// into the small "Data as of ..." label shown alongside a category's
// title/subtitle. This is the one place that turns the raw date into
// display text — every category card/header reads it from here rather than
// re-deriving its own formatting, so the wording stays consistent and any
// future tweak (e.g. relative "3 days ago" phrasing) only has to change
// once.
export function formatAsOfDate(asOfDate: string | null): string | null {
	if (!asOfDate) return null;
	const date = new Date(`${asOfDate}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	const formatted = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
	return `Data as of ${formatted}`;
}

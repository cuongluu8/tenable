// The "today" boundary for the daily puzzle. Using UTC keeps this
// deterministic across edge locations without needing a timezone setting;
// revisit if per-region local-midnight rollover matters later.
export function todayKey(now: Date = new Date()): string {
	return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

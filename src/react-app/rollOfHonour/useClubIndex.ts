import { useEffect, useState } from "react";
import type { LocalSuggestEntry } from "../components/GuessInput";

// The club typeahead pool for Roll of Honour, fetched once per page load
// (GET /api/roll-of-honour/clubs -- see that route) and shared by every
// screen that needs it, so a keystroke in the answer box never makes a
// request. Module-level cache: the three Roll of Honour screens (solo,
// pass-and-play, remote) mount and unmount, the list doesn't change under
// them. Returns null until loaded -- GuessInput falls back to the fetch-
// per-keystroke path meanwhile, so nothing is blocked on it.
let cached: LocalSuggestEntry[] | null = null;
let inflight: Promise<LocalSuggestEntry[] | null> | null = null;

function load(): Promise<LocalSuggestEntry[] | null> {
	if (cached) return Promise.resolve(cached);
	if (!inflight) {
		inflight = fetch("/api/roll-of-honour/clubs")
			.then((r) => (r.ok ? (r.json() as Promise<{ clubs: LocalSuggestEntry[] }>) : null))
			.then((d) => {
				cached = d?.clubs ?? null;
				return cached;
			})
			.catch(() => null)
			.finally(() => {
				inflight = null;
			});
	}
	return inflight;
}

export function useClubIndex(): LocalSuggestEntry[] | null {
	const [index, setIndex] = useState<LocalSuggestEntry[] | null>(cached);
	useEffect(() => {
		if (index) return;
		let cancelled = false;
		load().then((list) => {
			if (!cancelled && list) setIndex(list);
		});
		return () => {
			cancelled = true;
		};
	}, [index]);
	return index;
}

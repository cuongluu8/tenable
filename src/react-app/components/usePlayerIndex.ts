import { useEffect, useState } from "react";
import { localNormalize, type LocalSuggestEntry } from "./localSuggest";

// The player typeahead, in shards (2026-09-15) -- the counterpart of
// rollOfHonour/useClubIndex.ts for a pool too big to ship whole. The
// server cuts the ~18,500 players by the first two normalised characters
// of a word (GET /api/club-badges/players/:prefix, see that route); this
// hook fetches the shard for the first word being typed and hands it to
// GuessInput as `localIndex`, so a keystroke never makes a request -- only
// the first two letters of each new name do, and only once per device per
// visit (module-level cache; the list doesn't change under a game).
// Returns "loading" while the shard is in flight (GuessInput shows its
// skeleton and does NOT fall back to fetching per keystroke), undefined
// when there's no usable prefix yet or the shard failed to load (GuessInput
// then fetches /suggest per keystroke as before -- nothing is ever blocked
// on this).
const shards = new Map<string, LocalSuggestEntry[]>();
const inflight = new Map<string, Promise<void>>();
const failed = new Set<string>();

function prefixOf(query: string): string | null {
	const first = localNormalize(query).split(" ")[0] ?? "";
	return first.length >= 2 ? first.slice(0, 2) : null;
}

function load(prefix: string): Promise<void> {
	let p = inflight.get(prefix);
	if (!p) {
		p = fetch(`/api/club-badges/players/${prefix}`)
			.then((r) => (r.ok ? (r.json() as Promise<{ players: LocalSuggestEntry[] }>) : null))
			.then((d) => {
				if (d) shards.set(prefix, d.players);
				else failed.add(prefix);
			})
			.catch(() => {
				failed.add(prefix);
			})
			.finally(() => {
				inflight.delete(prefix);
			});
		inflight.set(prefix, p);
	}
	return p;
}

export function usePlayerIndex(query: string): LocalSuggestEntry[] | "loading" | undefined {
	const prefix = prefixOf(query);
	// Bumped when a shard lands, so the component re-reads the cache.
	const [, setLoaded] = useState(0);
	useEffect(() => {
		if (!prefix || shards.has(prefix) || failed.has(prefix)) return;
		let cancelled = false;
		load(prefix).then(() => {
			if (!cancelled) setLoaded((n) => n + 1);
		});
		return () => {
			cancelled = true;
		};
	}, [prefix]);
	if (!prefix || failed.has(prefix)) return undefined;
	return shards.get(prefix) ?? "loading";
}

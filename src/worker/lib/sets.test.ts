// Structural invariants for the two Sets modes' fixed chunking -- the
// same checks that were run by hand (ad hoc, one-off scripts) during the
// 2026-09-09/11 batch re-chunks (see clubBadgeSets.ts's own doc on that
// audit), formalized here so a future re-chunk can't silently reintroduce
// a duplicate id or a name collision. These are about SHAPE (every id
// appears exactly once, every set has a name, no two names collide) --
// not about which ids belong in which set, which is a curated, judgment-
// based decision documented in each file's own comments, not something a
// test should second-guess.
import { describe, expect, it } from "vitest";
import { CLUB_BADGE_SETS, CLUB_BADGE_SET_NAMES } from "./clubBadgeSets";
import { TEAMMATE_SETS, TEAMMATE_SET_NAMES } from "./teammateSets";

function idsWithDuplicates(sets: number[][]): number[] {
	const seen = new Set<number>();
	const duplicates: number[] = [];
	for (const set of sets) {
		for (const id of set) {
			if (seen.has(id)) duplicates.push(id);
			seen.add(id);
		}
	}
	return duplicates;
}

describe("CLUB_BADGE_SETS", () => {
	it("has exactly one name per set", () => {
		expect(CLUB_BADGE_SET_NAMES).toHaveLength(CLUB_BADGE_SETS.length);
	});

	it("never repeats a player id across two different sets", () => {
		expect(idsWithDuplicates(CLUB_BADGE_SETS)).toEqual([]);
	});

	it("never repeats a set name", () => {
		expect(new Set(CLUB_BADGE_SET_NAMES).size).toBe(CLUB_BADGE_SET_NAMES.length);
	});

	it("has no empty sets", () => {
		for (const set of CLUB_BADGE_SETS) expect(set.length).toBeGreaterThan(0);
	});
});

describe("TEAMMATE_SETS", () => {
	it("has exactly one name per set", () => {
		expect(TEAMMATE_SET_NAMES).toHaveLength(TEAMMATE_SETS.length);
	});

	it("never repeats a player id across two different sets", () => {
		expect(idsWithDuplicates(TEAMMATE_SETS)).toEqual([]);
	});

	it("never repeats a set name", () => {
		expect(new Set(TEAMMATE_SET_NAMES).size).toBe(TEAMMATE_SET_NAMES.length);
	});

	it("has no empty sets", () => {
		for (const set of TEAMMATE_SETS) expect(set.length).toBeGreaterThan(0);
	});
});

describe("Set names across both modes", () => {
	it("never uses the same name for a club-badges Set and a teammates Set", () => {
		const overlap = CLUB_BADGE_SET_NAMES.filter((name) => TEAMMATE_SET_NAMES.includes(name));
		expect(overlap).toEqual([]);
	});
});

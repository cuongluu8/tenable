// Unit tests for eplTicker.ts's pure formatting helpers -- refreshEplTicker
// itself (the fetch + KV write) is exercised indirectly via
// test/integration/ instead, since it needs a real network mock and KV
// binding; these three are plain functions of already-parsed data, no
// binding or fetch involved.
import { describe, expect, it } from "vitest";
import { currentScore, formatMatch, teamLabel, type FdMatch } from "./eplTicker";

function match(overrides: Partial<FdMatch> = {}): FdMatch {
	return {
		utcDate: "2026-09-13T15:00:00Z",
		status: "FINISHED",
		matchday: 4,
		homeTeam: { name: "Arsenal FC", shortName: "Arsenal" },
		awayTeam: { name: "Chelsea FC", shortName: "Chelsea" },
		score: { fullTime: { home: 2, away: 1 } },
		...overrides,
	};
}

describe("teamLabel", () => {
	it("prefers shortName when present", () => {
		expect(teamLabel({ name: "Arsenal FC", shortName: "Arsenal" })).toBe("Arsenal");
	});

	it("falls back to name when shortName is null", () => {
		expect(teamLabel({ name: "Arsenal FC", shortName: null })).toBe("Arsenal FC");
	});

	it("falls back to name when shortName is blank", () => {
		expect(teamLabel({ name: "Arsenal FC", shortName: "   " })).toBe("Arsenal FC");
	});
});

describe("currentScore", () => {
	it("reads fullTime when both numbers are present", () => {
		expect(currentScore(match({ score: { fullTime: { home: 3, away: 0 } } }))).toEqual({ home: 3, away: 0 });
	});

	it("falls back to halfTime when fullTime isn't populated yet", () => {
		const m = match({ score: { fullTime: { home: null, away: null }, halfTime: { home: 1, away: 0 } } });
		expect(currentScore(m)).toEqual({ home: 1, away: 0 });
	});

	it("returns null (not a fabricated 0-0) when neither is available", () => {
		const m = match({ score: { fullTime: { home: null, away: null } } });
		expect(currentScore(m)).toBeNull();
	});
});

describe("formatMatch", () => {
	it("tags a finished match FT with the final score", () => {
		expect(formatMatch(match({ status: "FINISHED" }))).toBe("FT: Arsenal 2-1 Chelsea");
	});

	it("tags an in-play match LIVE", () => {
		expect(formatMatch(match({ status: "IN_PLAY" }))).toBe("LIVE: Arsenal 2-1 Chelsea");
	});

	it("tags a paused (half-time) match LIVE, same as in-play", () => {
		expect(formatMatch(match({ status: "PAUSED" }))).toBe("LIVE: Arsenal 2-1 Chelsea");
	});

	it("shows 'vs' instead of a fabricated score when none is available", () => {
		const m = match({ status: "IN_PLAY", score: { fullTime: { home: null, away: null } } });
		expect(formatMatch(m)).toBe("LIVE: Arsenal vs Chelsea");
	});
});

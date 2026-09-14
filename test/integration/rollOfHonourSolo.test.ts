// Roll of Honour's single-player endpoints (routes/rollOfHonour.ts):
// the label-only board, server-side grading, the country hint and the
// game-over reveal. The curated data is the real list, so the answers
// used here are real. Own file (per-file request budget, see
// remoteSessionLifecycle.test.ts).
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

function post(path: string, body: unknown) {
	return SELF.fetch(`https://example.com/api/roll-of-honour${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("GET /api/roll-of-honour/board", () => {
	it("returns season labels only -- never a winner", async () => {
		const res = await SELF.fetch("https://example.com/api/roll-of-honour/board?competition=premier-league");
		expect(res.status).toBe(200);
		const body = (await res.json()) as { id: string; name: string; seasons: string[] };
		expect(body.name).toBe("Premier League");
		expect(body.seasons[0]).toBe("1992-93");
		expect(body.seasons.at(-1)).toBe("2025-26");
		expect(JSON.stringify(body)).not.toContain("Manchester United");
	});

	it("404s an unknown competition", async () => {
		expect((await SELF.fetch("https://example.com/api/roll-of-honour/board?competition=nope")).status).toBe(404);
	});
});

describe("GET /api/roll-of-honour/clubs", () => {
	it("returns every club with its aliases, plus curated winners the entity table lacks, browser-cacheable", async () => {
		const res = await SELF.fetch("https://example.com/api/roll-of-honour/clubs");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toContain("max-age=86400");
		const { clubs } = (await res.json()) as { clubs: { name: string; aliases: string[] }[] };
		// The fixture has no club entities, so the list is the curated
		// fallback: every Roll of Honour winner, with no aliases.
		expect(clubs.length).toBeGreaterThan(30);
		expect(clubs.find((c) => c.name === "Steaua București")).toEqual({ name: "Steaua București", aliases: [] });
		expect(clubs.find((c) => c.name === "Real Madrid")).toBeTruthy();
	});
});

describe("POST /api/roll-of-honour/check, /hint, /reveal", () => {
	it("grades by canonical name or alias, revealing the winner only when right", async () => {
		const wrong = await post("/check", { competitionId: "premier-league", season: "1994-95", guess: "Manchester United" });
		expect(await wrong.json()).toEqual({ result: "wrong" });

		const right = await post("/check", { competitionId: "premier-league", season: "1994-95", guess: "blackburn" });
		expect(right.status).toBe(200);
		expect(await right.json()).toMatchObject({ result: "correct", winner: "Blackburn Rovers" });
	});

	it("400s a missing guess and 404s an unknown season/competition", async () => {
		expect((await post("/check", { competitionId: "premier-league", season: "1994-95", guess: "  " })).status).toBe(400);
		expect((await post("/check", { competitionId: "premier-league", season: "1894-95", guess: "x" })).status).toBe(404);
		expect((await post("/check", { competitionId: "nope", season: "1994-95", guess: "x" })).status).toBe(404);
	});

	it("hint is the winner's country; reveal is every season's winner", async () => {
		const hint = await post("/hint", { competitionId: "european-cup", season: "1966-67" });
		expect(await hint.json()).toEqual({ country: "Scotland" });

		const reveal = await post("/reveal", { competitionId: "european-cup" });
		const body = (await reveal.json()) as { tiles: { season: string; winner: string }[] };
		expect(body.tiles).toHaveLength(37);
		expect(body.tiles.find((t) => t.season === "1966-67")?.winner).toBe("Celtic");
	});
});

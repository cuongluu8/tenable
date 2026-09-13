// Route-level contract tests for GET /api/ticker and
// POST /api/admin/refresh-ticker -- global fetch is stubbed so these never
// make a real football-data.org call (deterministic, and no API key
// needed for a test run). vitest-plugin's SELF runs the main worker in
// the same isolate as the test itself, so a stubbed global fetch here
// really is seen by the route handler's own fetch() call, not a separate
// context it could bypass.
import { SELF } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";

const FOOTBALL_DATA_API_KEY_HEADER = "X-Auth-Token";

function stubFootballDataResponse(matches: unknown[]) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async (url: string, init?: RequestInit) => {
			expect(url).toContain("api.football-data.org");
			expect((init?.headers as Record<string, string>)[FOOTBALL_DATA_API_KEY_HEADER]).toBeTruthy();
			return new Response(JSON.stringify({ matches }), { status: 200 });
		}),
	);
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("GET /api/ticker (no refresh yet)", () => {
	it("is empty when nothing has ever been fetched", async () => {
		const res = await SELF.fetch("https://example.com/api/ticker");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ message: "" });
	});
});

describe("POST /api/admin/refresh-ticker", () => {
	it("shows every match that's kicked off, live tagged separately from finished", async () => {
		stubFootballDataResponse([
			{
				utcDate: "2026-09-13T15:00:00Z",
				status: "FINISHED",
				matchday: 4,
				homeTeam: { name: "Arsenal FC", shortName: "Arsenal" },
				awayTeam: { name: "Chelsea FC", shortName: "Chelsea" },
				score: { fullTime: { home: 2, away: 1 } },
			},
			{
				utcDate: "2026-09-13T17:30:00Z",
				status: "IN_PLAY",
				matchday: 4,
				homeTeam: { name: "Liverpool FC", shortName: "Liverpool" },
				awayTeam: { name: "Everton FC", shortName: "Everton" },
				score: { fullTime: { home: 1, away: 0 } },
			},
			{
				// A later matchday's fixture that hasn't kicked off yet -- must
				// NOT appear in the ticker at all (see eplTicker.ts's `started`
				// filter).
				utcDate: "2026-09-20T15:00:00Z",
				status: "SCHEDULED",
				matchday: 5,
				homeTeam: { name: "Fulham FC", shortName: "Fulham" },
				awayTeam: { name: "Brentford FC", shortName: "Brentford" },
				score: { fullTime: { home: null, away: null } },
			},
		]);

		const res = await SELF.fetch("https://example.com/api/admin/refresh-ticker", { method: "POST" });
		expect(res.status).toBe(200);
		const data = (await res.json()) as { message: string };
		expect(data.message).toBe("FT: Arsenal 2-1 Chelsea   •   LIVE: Liverpool 1-0 Everton");

		const publicRes = await SELF.fetch("https://example.com/api/ticker");
		expect(await publicRes.json()).toEqual({ message: data.message });
	});

	it("hides the ticker again once nothing has started (an international break)", async () => {
		stubFootballDataResponse([]);
		const res = await SELF.fetch("https://example.com/api/admin/refresh-ticker", { method: "POST" });
		expect(await res.json()).toEqual({ message: "" });
	});

	it("a failed fetch leaves the ticker exactly as it was, not blanked", async () => {
		stubFootballDataResponse([
			{
				utcDate: "2026-09-13T15:00:00Z",
				status: "FINISHED",
				matchday: 4,
				homeTeam: { name: "Arsenal FC", shortName: "Arsenal" },
				awayTeam: { name: "Chelsea FC", shortName: "Chelsea" },
				score: { fullTime: { home: 2, away: 1 } },
			},
		]);
		await SELF.fetch("https://example.com/api/admin/refresh-ticker", { method: "POST" });

		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("nope", { status: 500 })),
		);
		await SELF.fetch("https://example.com/api/admin/refresh-ticker", { method: "POST" });

		const res = await SELF.fetch("https://example.com/api/ticker");
		expect(await res.json()).toEqual({ message: "FT: Arsenal 2-1 Chelsea" });
	});
});

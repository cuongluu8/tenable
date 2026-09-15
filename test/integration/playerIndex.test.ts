// The player typeahead index shards (routes/clubBadges.ts /players/:prefix):
// a shard holds every player with a name word, or a curated alias, starting
// with the two-character prefix, with aliases, in suggestNames() order --
// so filtering it in the browser gives what /suggest would. Fixture:
// ten "Fixture Player <Number>" rows, player 11 aliased "fp1", player 12
// self-aliased "fixture player two".
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface Shard {
	players: { name: string; aliases: string[] }[];
}

async function shard(prefix: string): Promise<Response> {
	return SELF.fetch(`https://example.com/api/club-badges/players/${prefix}`);
}

describe("player index shards", () => {
	it("returns every player with a name word starting with the prefix, with their aliases", async () => {
		const res = await shard("fi");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toContain("max-age=86400");
		const body = (await res.json()) as Shard;
		expect(body.players).toHaveLength(10);
		expect(body.players.find((p) => p.name === "Fixture Player One")?.aliases).toEqual(["fp1"]);
		// Player Two's only alias is its own normalised name -- dropped, the
		// browser derives that itself (see the route).
		expect(body.players.find((p) => p.name === "Fixture Player Two")?.aliases).toEqual([]);
	});

	it("matches on any word of the name, not just the first", async () => {
		const body = (await (await shard("on")).json()) as Shard;
		expect(body.players.map((p) => p.name)).toEqual(["Fixture Player One"]);
	});

	it("includes a player whose curated alias starts with the prefix", async () => {
		const body = (await (await shard("fp")).json()) as Shard;
		expect(body.players.map((p) => p.name)).toEqual(["Fixture Player One"]);
	});

	it("holds only players -- a club whose name shares the prefix is not in it", async () => {
		// "Fixture Club A" shares the "fi" word; it must not appear (checked
		// above by the count of 10, all players). A prefix only clubs match:
		const body = (await (await shard("cl")).json()) as Shard;
		expect(body.players).toEqual([]);
	});

	it("normalises the prefix and rejects anything that isn't two letters or digits", async () => {
		expect((await shard("FI")).status).toBe(200);
		expect((await shard("f")).status).toBe(400);
		expect((await shard("fix")).status).toBe(400);
		expect((await shard("f%20")).status).toBe(400);
	});
});

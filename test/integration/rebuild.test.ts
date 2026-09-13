// Integration test for rebuild.ts -- the nightly cron job that
// materializes category_answers from category_defs + entity_stats (see
// index.ts's scheduled()). Calls rebuildAll() directly against the real
// seeded D1 rather than going through the scheduled() dispatch itself,
// since rebuild.ts's own correctness (does the query produce the right
// rows, in the right order) is what actually matters here -- the
// one-line cron-to-function wiring in index.ts isn't worth a second test.
//
// Uses the fixture's SECOND category (fixture-rebuild) specifically --
// unlike fixture-top-3 (used by the gameplay-flow tests), this one is
// deliberately NOT pre-materialized: only category_defs + entity_stats
// are seeded, so this test is what actually proves rebuildAll() produces
// category_answers, not just reading a snapshot the fixture already
// handed it.
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { rebuildAll } from "../../src/worker/lib/rebuild";

describe("rebuildAll", () => {
	it("materializes category_answers from category_defs + entity_stats, ranked correctly", async () => {
		const before = await env.DB.prepare("SELECT COUNT(*) AS n FROM category_answers WHERE category_id = 2").first<{
			n: number;
		}>();
		expect(before?.n).toBe(0);

		const result = await rebuildAll(env.DB);
		expect(result.categoriesRebuilt).toBeGreaterThanOrEqual(1);

		const { results } = await env.DB
			.prepare("SELECT rank, entity_id, display_value FROM category_answers WHERE category_id = 2 ORDER BY rank")
			.all<{ rank: number; entity_id: number; display_value: string }>();
		expect(results).toEqual([
			{ rank: 1, entity_id: 11, display_value: "50" },
			{ rank: 2, entity_id: 12, display_value: "40" },
			{ rank: 3, entity_id: 13, display_value: "30" },
		]);
	});

	it("is idempotent -- re-running it against unchanged source data reproduces the same rows", async () => {
		await rebuildAll(env.DB);
		const first = await env.DB.prepare("SELECT COUNT(*) AS n FROM category_answers WHERE category_id = 2").first<{
			n: number;
		}>();

		await rebuildAll(env.DB);
		const second = await env.DB.prepare("SELECT COUNT(*) AS n FROM category_answers WHERE category_id = 2").first<{
			n: number;
		}>();

		expect(second?.n).toBe(first?.n);
	});
});

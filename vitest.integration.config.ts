import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

// Integration tests: real Worker route handlers against a real local D1/
// KV/R2 -- the actual workerd runtime via Miniflare, not mocks -- using
// this project's own wrangler.json bindings. Points at
// wrangler.test.generated.json (produced by
// scripts/gen-test-wrangler-config.ts, run automatically first via the
// "pretest:integration" npm script) rather than wrangler.json directly --
// see that script's own doc for why (the plugin crashes on wrangler.json's
// `assets` block) and why it's generated fresh rather than a second
// hand-maintained copy. See test/integration/setup.ts for how a fresh
// local D1 gets db/schema.sql + a small hand-authored fixture applied
// before each test file runs (NOT db/seed.sql -- see setup.ts's own doc
// for why the real, production-scale seed can't be applied inside this
// harness).
export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.test.generated.json" },
			// Defaults to true, and -- confirmed the hard way, a real CI
			// failure this comment exists to prevent recurring -- means the
			// plugin always opens an authenticated "remote proxy session" on
			// startup regardless of whether any binding actually needs one.
			// That only ever worked locally because of this machine's own
			// cached `wrangler login` session; a fresh CI runner has no such
			// thing and fails outright ("In a non-interactive environment,
			// it's necessary to set a CLOUDFLARE_API_TOKEN..."). Every
			// binding here is local-only already (MEDIA is forced local
			// below despite wrangler.json's own `remote: true`), so there's
			// nothing this suite ever needs a remote session for.
			remoteBindings: false,
			miniflare: {
				// wrangler.json's MEDIA binding sets `remote: true` so local
				// `npm run dev` sees real uploaded images -- forced back to
				// local (empty) emulation for tests instead, so a test run
				// never needs real Cloudflare credentials or network access.
				// See mediaAudit.ts's own doc: local R2 being empty is already
				// a real, deterministic, asserted-on case ("MISSING"), not a
				// gap this needs to work around.
				r2Buckets: {
					MEDIA: "test-media-bucket",
				},
				bindings: {
					// FOOTBALL_DATA_API_KEY is a Worker *secret* in production
					// (never in wrangler.json), so it isn't present in
					// wrangler.test.generated.json at all -- ticker.test.ts
					// needs SOME non-empty value for eplTicker.ts to actually
					// attempt its (stubbed, see that test's own doc) fetch
					// rather than skipping it outright, so it's supplied here
					// instead. Never a real key, and never used against the
					// real API in a test run.
					FOOTBALL_DATA_API_KEY: "test-key",
					// Dropped from wrangler.json's real 20,000 so
					// circuitBreaker.test.ts can actually exhaust it in a
					// handful of requests instead of 20,000+ -- every other
					// test file's own request count is nowhere near even this
					// small a number, so this has no effect on anything else.
					DAILY_REQUEST_BUDGET: 50,
				},
			},
		}),
	],
	test: {
		include: ["test/integration/**/*.test.ts"],
		setupFiles: ["./test/integration/setup.ts"],
	},
});

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
// local D1 gets db/schema.sql + db/seed.sql applied before each test file
// runs, the same "local-first" pattern the rest of this project's CI
// already follows (ci.yml's own "Seed local D1" step).
export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.test.generated.json" },
			// wrangler.json's MEDIA binding sets `remote: true` so local `npm
			// run dev` sees real uploaded images -- forced back to local
			// (empty) emulation for tests instead, so a test run never needs
			// real Cloudflare credentials or network access. See
			// mediaAudit.ts's own doc: local R2 being empty is already a
			// real, deterministic, asserted-on case ("MISSING"), not a gap
			// this needs to work around.
			miniflare: {
				r2Buckets: {
					MEDIA: "test-media-bucket",
				},
			},
		}),
	],
	test: {
		include: ["test/integration/**/*.test.ts"],
		setupFiles: ["./test/integration/setup.ts"],
	},
});

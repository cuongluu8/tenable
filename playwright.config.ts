import { defineConfig } from "@playwright/test";

// E2E tests drive a real browser against `npm run dev` -- the Cloudflare
// Vite plugin already runs the Worker + React frontend as one process, so
// there's no separate server orchestration needed here. `webServer` below
// starts it automatically for a plain `npm run test:e2e` and reuses an
// already-running one locally (handy while iterating) but never in CI,
// where a stale leftover server would be the wrong thing to reuse.
//
// Note: the MEDIA R2 binding is `remote: true` in wrangler.json (real
// uploaded images in local dev) -- e2e tests inherit that as-is rather
// than forcing local-only emulation the way the integration-test config
// does, since this is `npm run dev` unmodified, not a special test
// config. No e2e test asserts on image content, only on flow/DOM state,
// so a badge failing to load a real image never affects a test's outcome.
export default defineConfig({
	testDir: "./test/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
	},
	webServer: {
		command: "npm run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});

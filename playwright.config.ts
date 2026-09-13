import { defineConfig } from "@playwright/test";

// E2E tests drive a real browser against `npm run dev` -- the Cloudflare
// Vite plugin already runs the Worker + React frontend as one process, so
// there's no separate server orchestration needed here. `webServer` below
// starts it automatically for a plain `npm run test:e2e` and reuses an
// already-running one locally (handy while iterating) but never in CI,
// where a stale leftover server would be the wrong thing to reuse.
//
// The MEDIA R2 binding is `remote: true` in wrangler.json (real uploaded
// images in local dev) -- but that makes `npm run dev` itself require a
// real Cloudflare credential just to *start* (an authenticated "remote
// proxy session" opens on startup regardless of whether any test actually
// needs a real image), which a CI runner doesn't have. E2E_LOCAL_ONLY
// (read by vite.config.ts) forces every binding local instead, same
// "remoteBindings: false" fix vitest.integration.config.ts already needed
// -- confirmed the hard way, a real CI failure this exists to prevent
// recurring. No e2e test asserts on image content, only on flow/DOM
// state, so a badge falling back to its text placeholder locally never
// affects a test's outcome. Only applies to a server THIS config starts;
// see reuseExistingServer below for the one case it doesn't.
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
		env: { E2E_LOCAL_ONLY: "1" },
		url: "http://localhost:5173",
		// Never true in CI (a stale leftover server would be the wrong thing
		// to reuse there) -- locally, reusing a dev server someone already
		// had running by hand means it was started WITHOUT E2E_LOCAL_ONLY,
		// so it still talks to real R2. That's fine: a local machine
		// normally has its own cached Cloudflare credentials anyway (unlike
		// CI), so this only matters for the one thing E2E_LOCAL_ONLY is
		// actually about -- letting the server start in an environment with
		// no credentials at all.
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});

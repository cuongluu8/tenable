import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit tests only -- pure functions and reducers, plus anything needing a
// DOM stand-in (jsdom) like setsStorage.ts's localStorage usage. Real
// route/binding tests (against a genuine local D1/KV/R2 in the actual
// workerd runtime, via @cloudflare/vitest-plugin) live under
// test/integration and run via the separate vitest.integration.config.ts
// instead -- coverage instrumentation doesn't even work there (confirmed:
// @vitest/coverage-v8 needs node:inspector, which doesn't exist inside
// workerd's isolate), on top of needing the real Workers runtime jsdom
// can't stand in for anyway.
//
// coverage.all is deliberately left at its default (false, only files
// actually imported by a test are reported) rather than force-including
// every src/ file -- most of this app's real logic lives in routes/
// screens that integration tests and e2e cover instead, and forcing
// those into this report would just show them at a misleading 0% for a
// layer that was never meant to test them. This reports "how well-tested
// is what unit tests actually touch", which is what the threshold below
// is a regression gate on.
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			thresholds: {
				// A few points under this suite's actual 2026-09-13 baseline
				// (statements 80%, branches 79.48%, functions 83.01%, lines
				// 82.35%) -- a real regression gate on the files unit tests
				// cover, not an aspirational number chasing 100%. The single
				// biggest drag on this number, by design not oversight: once
				// eplTicker.test.ts imports eplTicker.ts to test its pure
				// formatters (teamLabel/currentScore/formatMatch), v8 tracks
				// the WHOLE file -- including refreshEplTicker/
				// getEplTickerMessage, the fetch+KV-dependent functions that
				// are genuinely tested, just at the integration level
				// (test/integration/ticker.test.ts) where mocking a KV
				// binding and a network call actually belongs. Splitting
				// that file just to make this number look better would be
				// optimizing the metric instead of the code, so this
				// threshold accepts the honest, lower number instead. Raise
				// it deliberately as real coverage improves; don't lower it
				// to make a red run green.
				statements: 78,
				branches: 78,
				functions: 80,
				lines: 80,
			},
		},
	},
});

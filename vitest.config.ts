import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit tests only -- pure functions and reducers, plus anything needing a
// DOM stand-in (jsdom) like setsStorage.ts's localStorage usage. Real
// route/binding tests (against a genuine local D1/KV/R2 in the actual
// workerd runtime) live under test/integration and run via the separate
// vitest.integration.config.ts instead -- @cloudflare/vitest-pool-workers'
// pool can't be mixed into this same config, and a route test needs the
// real Workers runtime, not jsdom standing in for it.
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
});

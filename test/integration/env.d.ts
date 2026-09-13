// Declares Cloudflare.Env (what cloudflare:test's `env` is typed as --
// see @cloudflare/vitest-plugin/types) for the test project specifically,
// duplicating wrangler.json's binding list rather than importing the
// real worker-configuration.d.ts.
//
// That's deliberate, not an oversight: worker-configuration.d.ts declares
// `Cloudflare.GlobalProps.mainModule: typeof import("./src/worker/index")`
// -- a `typeof import(...)` type on ANY interface in that file forces
// TypeScript to pull src/worker/index.ts (and everything it imports) into
// whichever project's file set the file is loaded into, and type-check it
// under THAT project's own settings. tsconfig.worker.json's settings
// happen to make that resolve correctly (it already includes src/worker/
// env.d.ts's FOOTBALL_DATA_API_KEY merge); this project's settings don't,
// so index.ts and adminRefreshTicker.ts surfaced as spuriously broken
// (confirmed by bisection -- the errors vanish the moment
// worker-configuration.d.ts is dropped from a project's `types`, even
// with an otherwise-unrelated, single-file `include`). Duplicating this
// short, rarely-changing binding list here avoids that entirely; if
// wrangler.json's bindings/vars change, update this to match (nothing
// enforces the two stay in sync automatically, but D1/KV/R2 usage that's
// actually wrong here would fail loudly in test/integration's own tests
// the moment they touch the mistyped binding, not silently).
//
// D1Database/KVNamespace/R2Bucket come from @cloudflare/workers-types
// (see tsconfig.test.json's own `types`) -- the standalone package
// version of the same runtime types worker-configuration.d.ts bundles,
// without that file's mainModule side effect.
declare namespace Cloudflare {
	interface Env {
		DB: D1Database;
		PROGRESS: KVNamespace;
		MEDIA: R2Bucket;
		DAILY_REQUEST_BUDGET: number;
		SUGGEST_RATE_LIMIT_PER_MINUTE: number;
		TICKER_MESSAGE: string;
		FOOTBALL_DATA_API_KEY?: string;
		REMOTE_MULTIPLAYER_ENABLED: boolean;
		// Untyped (no <RemoteGameSession> parameter) on purpose -- giving it
		// one would mean importing the real class from src/worker, which is
		// exactly the src/worker/index.ts import that caused the
		// mainModule problem above. Integration tests only ever need the
		// plain HTTP-shaped .get(id).fetch(request) interface anyway (same
		// as SELF/Fetcher elsewhere in this file), never strongly-typed RPC
		// method calls.
		REMOTE_GAME_SESSION: DurableObjectNamespace;
	}
}

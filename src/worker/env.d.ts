// Hand-written additions to the generated Env interface (worker-
// configuration.d.ts's `interface Env extends __BaseEnv_Env {}`) --
// TypeScript interfaces merge by declaration, so this file survives
// `npm run cf-typegen` regenerating that one untouched. Only for things
// `wrangler types` can't see for itself: Worker *secrets* (set via
// `wrangler secret put`, never written to wrangler.json, so there's
// nothing for cf-typegen to read) live here; anything declared in
// wrangler.json's own `vars`/bindings already gets a real type from
// cf-typegen and has no business being duplicated in this file.
//
// FOOTBALL_DATA_API_KEY: same key used by the FOOTBALL_DATA_API_KEY
// GitHub Actions secret (scripts/verify-content-source.ts), but that one
// only exists in CI -- this is the separate copy the live Worker itself
// needs for lib/eplTicker.ts's periodic fetch. Set it with:
//   npx wrangler secret put FOOTBALL_DATA_API_KEY
// Optional on purpose: eplTicker.ts treats a missing key the same as a
// failed fetch (log and leave the ticker showing whatever it last had, or
// empty if it's never run) rather than throwing -- a missing secret must
// never be able to break the scheduled job or any request path.
interface Env {
	FOOTBALL_DATA_API_KEY?: string;
}

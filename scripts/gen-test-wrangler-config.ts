// Generates wrangler.test.generated.json from the real wrangler.json,
// minus the `assets` block -- @cloudflare/vitest-plugin (as of 1.1.8)
// crashes on startup ("Worker exited unexpectedly", no useful error
// surfaced) when given a config with Vite-plugin-style assets binding;
// confirmed by bisection that removing just that one block is what fixes
// it, while `wrangler dev` itself handles the exact same config fine --
// this looks like a real gap in the vitest plugin's asset-binding support,
// not a problem with wrangler.json itself. Integration tests only exercise
// API routes, never static asset serving, so dropping it here costs
// nothing.
//
// Generated fresh before every integration test run (see the
// "pretest:integration" npm script) rather than hand-maintained, so there
// is exactly one real source of truth for bindings (wrangler.json) -- this
// file is a derived, gitignored artifact, never edited directly.
//
// Uses jsonc-parser (not a hand-rolled comment stripper) specifically
// because wrangler.json's own doc comments are real prose, not just "//
// this is disabled" -- a naive regex stripping from the first "//" to
// end-of-line would also mangle a comment that happens to mention a URL,
// or any future string value that legitimately contains "//".
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "jsonc-parser";

const raw = readFileSync("wrangler.json", "utf8");
const config = parse(raw) as Record<string, unknown>;
delete config.assets;

writeFileSync("wrangler.test.generated.json", JSON.stringify(config, null, 2) + "\n");
console.log("wrote wrangler.test.generated.json (wrangler.json minus `assets`)");

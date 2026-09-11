// Wipes local D1 entirely and reseeds it from db/schema.sql + db/seed.sql
// -- the "does this actually apply cleanly from scratch" check this
// project runs by hand after every content batch, before trusting
// db/seed.sql not to have drifted. Local-only; never touches production.
//
// Usage: npm run db:local:reset
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

console.log("Wiping local D1 state (.wrangler/state/v3/d1)...");
rmSync(".wrangler/state/v3/d1", { recursive: true, force: true });

console.log("Applying db/schema.sql...");
execFileSync("npx", ["wrangler", "d1", "execute", "tenable-content", "--local", "--file=db/schema.sql"], { stdio: "inherit" });

console.log("Applying db/seed.sql...");
execFileSync("npx", ["wrangler", "d1", "execute", "tenable-content", "--local", "--file=db/seed.sql"], { stdio: "inherit" });

console.log("Local D1 reset complete.");

// Regenerates db/seed.sql from production and re-prepends the header
// comment `wrangler d1 export` always strips -- the exact dance this
// project has repeated by hand after every content batch. See
// db/seed_header.txt for the header itself, and this file's own TABLES
// list for exactly which tables are seeded (deliberately not
// content_version/request_budget/suggest_rate_limit -- those are runtime
// state schema.sql already seeds correctly on its own; including
// content_version in the export once crashed a fresh local reset with
// `UNIQUE constraint failed: content_version.id`).
//
// Usage: npm run db:seed:regen
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const TABLES = [
	"categories",
	"category_answers",
	"category_defs",
	"club_badge_questions",
	"entities",
	"entity_aliases",
	"entity_stats",
	"management_spells",
	"player_career_stats",
	"teammate_questions",
	"transfers",
];

const args = ["wrangler", "d1", "export", "tenable-content", "--remote", "--no-schema"];
for (const table of TABLES) args.push("--table", table);
args.push("--output", "db/seed.sql");

console.log("Exporting production content tables to db/seed.sql...");
execFileSync("npx", args, { stdio: "inherit" });

const header = readFileSync("db/seed_header.txt", "utf8");
const body = readFileSync("db/seed.sql", "utf8");
writeFileSync("db/seed.sql", header + body);

console.log("Re-prepended db/seed_header.txt -- db/seed.sql is up to date with production.");

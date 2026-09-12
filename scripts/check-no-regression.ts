// Fails (exit 1) if a freshly-regenerated table's player_id set has LOST
// anyone the live table currently has. Used before regenerate-derived-
// content.yml applies a freshly rebuilt club_badge_questions/
// teammate_questions anywhere -- same principle as
// refresh_player_stats.py's own regression gate (a plain membership
// check, not a smart diff): a false alarm here costs nothing, since
// nothing has been applied yet, but silently applying a real content
// loss would leave players unable to reach a round they used to.
//
// Usage:
//   node --experimental-strip-types scripts/check-no-regression.ts \
//     --table club_badge_questions --new-sql data/research/club_badge_questions_refresh.sql [--remote]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function arg(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? undefined : process.argv[i + 1];
}

const table = arg("table");
const newSqlPath = arg("new-sql");
const REMOTE = process.argv.includes("--remote");

if (!table || !newSqlPath) {
	console.error("Usage: --table <name> --new-sql <file> [--remote]");
	process.exit(1);
}

// Every row in both build_club_badge_questions.py's and
// build_teammate_questions.py's output starts a VALUES tuple with a bare
// `(<player_id>,` -- comments in these files only ever write a player id
// as `(entity_id N)` or `(N):`, never `(N,`, so this can't mistake a
// comment for a row.
const newIds = new Set([...readFileSync(newSqlPath, "utf8").matchAll(/\((\d+),/g)].map((m) => Number(m[1])));

const raw = execFileSync(
	"npx",
	[
		"wrangler",
		"d1",
		"execute",
		"tenable-content",
		REMOTE ? "--remote" : "--local",
		"--json",
		"--command",
		`SELECT DISTINCT player_id FROM ${table}`,
	],
	{ encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 20 * 1024 * 1024 },
);
const parsed = JSON.parse(raw) as { results: { player_id: number }[] }[];
const currentIds = (parsed[0]?.results ?? []).map((r) => r.player_id);

const lost = currentIds.filter((id) => !newIds.has(id));
if (lost.length > 0) {
	console.error(
		`REGRESSION: ${lost.length} player(s) currently in ${table} would be REMOVED by this regeneration: ${lost.join(", ")}\n` +
			"Refusing to apply -- this smells like a real bug in the build script, not an expected change.",
	);
	process.exit(1);
}
console.log(`OK: ${table}'s regenerated set (${newIds.size}) is a superset of the current ${currentIds.length} -- no losses.`);

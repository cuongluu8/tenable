// Snapshots the CURRENT rows for a set of player_ids from a table,
// writing them as INSERT statements -- the rollback material an
// automated refresh workflow saves as a build artifact right before it
// deletes and replaces those exact rows (see refresh-player-stats.yml /
// regenerate-derived-content.yml). Read-only against whichever D1
// (--local or --remote) is given; writes only the --out file, never
// mutates anything itself.
//
// Usage:
//   node --experimental-strip-types scripts/snapshot-table.ts \
//     --table player_career_stats --ids 548,549,550 --out snapshot.sql [--remote]
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function arg(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? undefined : process.argv[i + 1];
}

const table = arg("table");
const idsArg = arg("ids");
const out = arg("out");
const REMOTE = process.argv.includes("--remote");

if (!table || !idsArg || !out) {
	console.error("Usage: --table <name> --ids <comma-separated ids> --out <file> [--remote]");
	process.exit(1);
}

const ids = idsArg
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

if (ids.length === 0) {
	writeFileSync(out, "-- Snapshot: no ids given, nothing to back up.\n");
	console.log(`No ids given -- wrote an empty snapshot to ${out}`);
	process.exit(0);
}
// Defensive: this only ever runs against ids this same job just computed
// itself (never user input), but a plain numeric check costs nothing and
// rules out any chance of the IN (...) list below being anything other
// than a list of integers.
if (!ids.every((id) => /^\d+$/.test(id))) {
	console.error("All --ids must be plain integers, got:", idsArg);
	process.exit(1);
}

function sqlValue(v: unknown): string {
	if (v === null || v === undefined) return "NULL";
	if (typeof v === "number") return String(v);
	return `'${String(v).replace(/'/g, "''")}'`;
}

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
		`SELECT * FROM ${table} WHERE player_id IN (${ids.join(",")})`,
	],
	{ encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 50 * 1024 * 1024 },
);
const parsed = JSON.parse(raw) as { results: Record<string, unknown>[] }[];
const rows = parsed[0]?.results ?? [];

const lines = [
	`-- Snapshot of ${table} for player_id IN (${ids.join(", ")}) before an automated refresh.`,
	"-- Rollback: if the refresh needs undoing, run:",
	`--   wrangler d1 execute tenable-content --remote --command "DELETE FROM ${table} WHERE player_id IN (${ids.join(",")})"`,
	"--   wrangler d1 execute tenable-content --remote --file=<this file>",
	"",
];
if (rows.length === 0) {
	lines.push("-- (no existing rows for these ids -- nothing to roll back to)");
} else {
	const columns = Object.keys(rows[0]);
	lines.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES`);
	const tuples = rows.map((row) => `(${columns.map((c) => sqlValue(row[c])).join(", ")})`);
	lines.push(tuples.join(",\n") + ";");
}
writeFileSync(out, lines.join("\n") + "\n");
console.log(`Snapshotted ${rows.length} row(s) from ${table} (${REMOTE ? "production" : "local"}) to ${out}`);

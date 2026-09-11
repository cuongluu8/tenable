// Applies a full delete-then-replace of club_badge_questions and
// teammate_questions from this session's regenerated SQL
// (data/research/club_badge_questions_refresh.sql /
// teammate_questions_refresh.sql). Both source scripts
// (build_club_badge_questions.py / build_teammate_questions.py) are full
// rebuilds, not incremental -- re-running them always emits every
// currently-eligible player, not just new ones -- so a plain re-insert on
// top of the existing rows would duplicate everything already there. See
// the 2026-09-11 player_career_stats duplicate incident (a stale
// candidate list got re-applied on top of already-existing rows) for
// exactly this failure mode; delete-then-replace is what this script
// exists to make routine rather than something to remember by hand.
//
// Usage:
//   npm run apply:content-refresh              -- local D1
//   npm run apply:content-refresh -- --remote  -- production D1
import { execFileSync } from "node:child_process";

const REMOTE = process.argv.includes("--remote");

const TARGETS = [
	{ table: "club_badge_questions", file: "data/research/club_badge_questions_refresh.sql" },
	{ table: "teammate_questions", file: "data/research/teammate_questions_refresh.sql" },
];

function run(args: string[]): string {
	return execFileSync("npx", ["wrangler", "d1", "execute", "tenable-content", REMOTE ? "--remote" : "--local", ...args], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
		maxBuffer: 20 * 1024 * 1024,
	});
}

function countRows(table: string): number {
	const raw = run(["--json", "--command", `SELECT COUNT(*) AS n FROM ${table}`]);
	const parsed = JSON.parse(raw) as { results: { n: number }[] }[];
	return parsed[0]?.results?.[0]?.n ?? -1;
}

console.log(`Applying content refresh to ${REMOTE ? "PRODUCTION" : "local"} D1...\n`);

for (const { table, file } of TARGETS) {
	console.log(`-- ${table} --`);
	run(["--command", `DELETE FROM ${table}`]);
	run(["--file", file]);
	const count = countRows(table);
	console.log(`  applied ${file} -> ${count} rows now in ${table}\n`);
}

console.log("Done.");

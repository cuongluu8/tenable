// Content-provenance check for "This Season" categories — the class of
// category whose *facts*, not just its guess-matching plumbing, can be
// wrong: a league table, a top-scorer list, a still-recent tournament.
// verify-guess-matching.ts and verify-name-sync.ts (and playtest.ts) all
// treat whatever's in D1 as ground truth and check the app's *mechanics*
// against it — none of them can catch a category whose numbers are simply
// wrong against the real world, because none of them have a real-world
// oracle to check against. That's exactly how pl-2025-26-final-table
// shipped with the wrong 9th/10th place (Fulham/Newcastle United instead
// of the actual Brentford/Chelsea) until a user caught it by eye — see git
// history around 2026-08-27.
//
// This script can't re-fact-check the world either (no live sports feed
// wired up here) — what it CAN enforce is that every category in this
// risk class carries a paper trail: a `-- Verified YYYY-MM-DD: <source>`
// comment in db/seed.sql immediately above its `INSERT INTO categories`,
// written at the moment someone (a human or an assistant) actually
// cross-checked its numbers against a real source. Missing one is a hard
// failure — it means a category in the highest-risk group has never been
// through that check at all. A marker older than STALE_DAYS is a WARNING,
// not a failure: a genuinely final, concluded-season table doesn't need
// re-checking just because time passed, but it's worth a human's eye
// periodically rather than trusting a snapshot from months ago forever.
//
// Scope is deliberately just group_label = 'This Season' for now — the
// same 7 categories the actual bug came from (current/recent-season
// tables and top-scorer lists, the things most likely to have been
// entered from a single pass of research, or written before a season
// actually finished). All-time categories change far less often; widen
// this if the same class of bug ever turns up there too.
//
// Usage: npm run verify:content-freshness
//   (reads db/seed.sql directly — no D1 access needed for the marker
//   check itself, but the category list is read from local D1 to stay in
//   sync with whatever group_label assignments are actually live, the
//   same "don't re-derive a copy that can drift" principle the other
//   verify scripts follow)

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const STALE_DAYS = 45;
const SEED_PATH = new URL("../db/seed.sql", import.meta.url);

interface CategoryRow {
	slug: string;
	title: string;
}

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 200 * 1024 * 1024 },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

const categories = queryLocalD1<CategoryRow>(
	"SELECT slug, title FROM categories WHERE group_label = 'This Season' ORDER BY id;",
);

const seedText = readFileSync(SEED_PATH, "utf8");
const seedLines = seedText.split("\n");

const VERIFIED_RE = /^--\s*Verified\s+(\d{4}-\d{2}-\d{2}):\s*(.+)$/;
// How far back from a category's INSERT to look for its marker — generous
// enough to cover a multi-line explanatory comment block above it (the
// file's usual style), but bounded so a marker for some unrelated, much
// earlier category can't accidentally satisfy this one.
const LOOKBACK_LINES = 25;

let failed = false;
const now = Date.now();

for (const category of categories) {
	// Find this category's own INSERT INTO categories (...) VALUES row —
	// matched on the slug as the first tuple value, same as every other
	// script here locates a category by slug rather than by id (ids aren't
	// stable across a reseed).
	const rowPattern = new RegExp(`^\\s*\\('${category.slug}',`);
	const insertLine = seedLines.findIndex((line) => rowPattern.test(line));
	if (insertLine === -1) {
		// Shouldn't happen — D1 says this slug exists, so it came from this
		// file — but fail loudly rather than silently skipping if it does.
		console.error(`  ✗ [${category.slug}] couldn't locate its INSERT INTO categories row in db/seed.sql`);
		failed = true;
		continue;
	}

	const searchFrom = Math.max(0, insertLine - LOOKBACK_LINES);
	const precedingLines = seedLines.slice(searchFrom, insertLine);

	let marker: { date: string; source: string } | null = null;
	for (const line of precedingLines) {
		const match = VERIFIED_RE.exec(line.trim());
		if (match) marker = { date: match[1], source: match[2] };
	}

	if (!marker) {
		console.error(
			`  ✗ [${category.slug}] "${category.title}" has no "-- Verified YYYY-MM-DD: <source>" comment above its INSERT INTO categories — this category's numbers have never been through the content-provenance check.`,
		);
		failed = true;
		continue;
	}

	const verifiedDate = new Date(`${marker.date}T00:00:00Z`);
	if (Number.isNaN(verifiedDate.getTime())) {
		console.error(`  ✗ [${category.slug}] Verified marker has an unparseable date: "${marker.date}"`);
		failed = true;
		continue;
	}

	const ageDays = Math.floor((now - verifiedDate.getTime()) / (1000 * 60 * 60 * 24));
	if (ageDays > STALE_DAYS) {
		console.warn(
			`  ⚠ [${category.slug}] last verified ${marker.date} (${ageDays} days ago, via "${marker.source}") — worth a re-check.`,
		);
	} else {
		console.log(`  ✓ [${category.slug}] verified ${marker.date} (${ageDays}d ago) via "${marker.source}"`);
	}
}

if (failed) {
	console.error(
		`\nverify-content-freshness: FAILED — one or more "This Season" categories have never been verified against a real source. Research the current numbers, fix db/seed.sql if wrong, and add a "-- Verified YYYY-MM-DD: <source>" comment directly above the category's INSERT.`,
	);
	process.exit(1);
} else {
	console.log(
		`\nverify-content-freshness: OK — ${categories.length} "This Season" categories all carry a verification marker.`,
	);
}

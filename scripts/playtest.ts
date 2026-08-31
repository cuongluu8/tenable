// End-to-end adversarial playtest: drives the real HTTP API (real cookies,
// real D1, real KV — via `wrangler dev` against a freshly reseeded local
// environment, not a unit-level shortcut) through every category, the way
// an actual player would, and deliberately tries to break it — obscure
// aliases instead of full names, mixed case, stray whitespace, punctuation
// swapped between space/hyphen, wrong-but-plausible names from the
// reference pool, guessing after a round is finished, tension-mode life
// loss. This is the automated gate: `npm run playtest`, non-zero exit on
// any failure, meant to run on every change (see .github/workflows/ci.yml
// and agents.md), not to be run once by hand and reported back on.
//
// Deliberately black-box: it only talks to the HTTP API, the same surface
// a browser uses. Ground truth for what to guess comes from reading D1
// directly (the server's answers are never exposed over HTTP, by design —
// see matchGuess() in categories.ts), which is fair game for a test oracle
// even though it would be cheating for a player.

import { execFileSync, spawn, type ChildProcess } from "node:child_process";

const PORT = 8787;
const BASE_URL = `http://localhost:${PORT}`;
const REPO_ROOT = new URL("..", import.meta.url).pathname;

const failures: string[] = [];
let assertions = 0;

function fail(message: string): void {
	failures.push(message);
	console.error(`  ✗ ${message}`);
}

function assert(condition: boolean, message: string): void {
	assertions += 1;
	if (!condition) fail(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
	assert(actual === expected, `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

// --- local D1 (test oracle only — never used by the guesses themselves) ---

function queryLocalD1<T>(sql: string): T[] {
	const raw = execFileSync(
		"npx",
		["wrangler", "d1", "execute", "tenable-content", "--local", "--json", "--command", sql],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], cwd: REPO_ROOT },
	);
	const parsed = JSON.parse(raw) as { results: T[] }[];
	return parsed[0]?.results ?? [];
}

interface CategoryRow {
	slug: string;
	entity_type: string;
}
interface AnswerRow {
	entity_id: number;
	rank: number;
	canonical_name: string;
}
interface AliasRow {
	entity_id: number;
	alias: string;
}
interface ReferenceRow {
	canonical_name: string;
}

function resetLocalEnvironment(): void {
	console.log("Resetting local D1 + KV to a clean, freshly-seeded state...");
	execFileSync("rm", ["-rf", ".wrangler/state/v3/d1", ".wrangler/state/v3/kv"], { cwd: REPO_ROOT });
	execFileSync("npx", ["wrangler", "d1", "execute", "tenable-content", "--local", "--file=db/schema.sql"], {
		cwd: REPO_ROOT,
		stdio: "ignore",
	});
	execFileSync("npx", ["wrangler", "d1", "execute", "tenable-content", "--local", "--file=db/seed.sql"], {
		cwd: REPO_ROOT,
		stdio: "ignore",
	});
}

// --- obscure-guess generation: the actual "try to break it" part ---

// Deterministic (not random) so a failure is exactly reproducible run to
// run — a flaky adversarial test would undermine the one thing this exists
// to prove. Alternates case per letter, swaps spaces for hyphens (probing
// the exact class of bug found 2026-08-26: normalize() collapsing
// punctuation), and pads with stray whitespace normalize() has to trim.
function obscure(input: string): string {
	const caseSwapped = [...input]
		.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
		.join("");
	return `  ${caseSwapped.replace(/ /g, "-")}  `;
}

// Prefer a real short/nickname alias over the full canonical name where one
// exists — guessing "psg" or "cr7" is the actually-obscure case; guessing
// the full name is the easy case (still covered separately, verbatim,
// below).
function pickObscureAlias(canonicalName: string, aliases: string[]): string {
	const canonicalKey = canonicalName.toLowerCase();
	const nonCanonical = aliases.filter((a) => a.toLowerCase() !== canonicalKey);
	if (nonCanonical.length === 0) return canonicalName;
	return nonCanonical.reduce((shortest, a) => (a.length < shortest.length ? a : shortest));
}

// --- API response shapes (only the fields this test reads) ---

interface ProgressResponse {
	mode: string;
	foundRanks: number[];
	wrongGuesses: number;
	completed: boolean;
	won: boolean;
	completedAt: string | null;
}
interface CategorySummaryResponse {
	slug: string;
	status: "new" | "in_progress" | "won" | "lost";
}
interface CategoriesListResponse {
	categories: CategorySummaryResponse[];
}
interface CategoryDetailResponse {
	progress: ProgressResponse | null;
}
interface GuessResponse {
	result: "correct" | "duplicate" | "wrong";
	found: { rank: number; name: string; statValue: string } | null;
	progress: ProgressResponse;
	livesRemaining: number | null;
}
interface RevealResponse {
	answers: { rank: number; name: string; statValue: string }[];
}
interface GiveUpResponse {
	progress: ProgressResponse;
}
interface SuggestResponse {
	suggestions: string[];
	truncated: boolean;
}

// --- HTTP session: a minimal cookie jar so each "device" behaves like one
// real browser tab across a whole sequence of requests. ---

class Device {
	private cookie: string | null = null;

	async request<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> {
		// wrangler dev's local server occasionally drops a kept-alive
		// connection mid-run ("other side closed") under sustained request
		// volume — a dev-server stability quirk, not applicable to the real
		// deployed Worker. Retried here rather than worked around by
		// disabling keep-alive, since a bad retry is self-detecting (it
		// would surface as a specific, wrong assertion — e.g. "correct"
		// expected but got "duplicate" — not a silent false pass), while a
		// transient socket error not retried at all makes this whole gate
		// flaky, which would undermine the one thing it exists to prove.
		let lastError: unknown;
		for (let attempt = 0; attempt < 3; attempt++) {
			try {
				const res = await fetch(`${BASE_URL}${path}`, {
					...init,
					headers: {
						...(init?.headers ?? {}),
						...(this.cookie ? { Cookie: this.cookie } : {}),
					},
				});
				const setCookie = res.headers.get("set-cookie");
				if (setCookie) this.cookie = setCookie.split(";")[0];
				const body = (await res.json().catch(() => null)) as T | null;
				return { status: res.status, body };
			} catch (err) {
				lastError = err;
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
		}
		throw lastError;
	}

	get<T>(path: string) {
		return this.request<T>(path);
	}

	postGuess(slug: string, guess: string, mode?: "classic" | "tension") {
		return this.request<GuessResponse>("/api/guess", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug, guess, ...(mode ? { mode } : {}) }),
		});
	}

	postGiveUp(slug: string) {
		return this.request<GiveUpResponse>("/api/give-up", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug }),
		});
	}
}

// --- wrangler dev lifecycle ---

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// `npx wrangler dev` isn't one process — it's a tree (wrangler's CLI,
// esbuild watch services, and the actual workerd runtime that binds the
// port). child.kill() only signals the top of that tree; wrangler doesn't
// reliably forward it all the way down, which left a live workerd process
// holding the port after an earlier crashed run here — the next run then
// failed immediately with EADDRINUSE, a confusing failure with no relation
// to anything this test actually checks. Spawning detached makes `child`
// the leader of its own process group, so killing the *group* (the negative
// pid trick) reaches every descendant in one shot; SIGKILL after a short
// grace period is a fallback in case SIGTERM alone doesn't take fast enough.
function killProcessTree(child: ChildProcess): void {
	if (!child.pid) return;
	try {
		process.kill(-child.pid, "SIGTERM");
	} catch {
		// group may already be gone
	}
	setTimeout(() => {
		if (!child.pid) return;
		try {
			process.kill(-child.pid, "SIGKILL");
		} catch {
			// already exited
		}
	}, 2000);
}

async function startDevServer(): Promise<ChildProcess> {
	console.log("Building worker bundle (wrangler dev serves the built bundle, not src/ directly)...");
	execFileSync("npm", ["run", "build"], { cwd: REPO_ROOT, stdio: "inherit" });

	console.log(`Starting wrangler dev on port ${PORT}...`);
	// --local and --show-interactive-dev-session=false: explicit rather than
	// relying on wrangler's own non-TTY autodetection, since this process's
	// stdio is piped/ignored, not a real terminal. Not fixing an actual bug
	// (see below) — just removing an assumption this doesn't need to make.
	//
	// CI runs this whole suite in ~2.5-4 minutes (~4s/category over a real
	// HTTP round trip on a shared runner, vs. ~2.3s locally) — noted here
	// because an *early* run of this workflow looked hung well past that
	// window, and it wasn't: GitHub's per-step job status (what
	// list_workflow_jobs reports) lagged the actual run by several minutes,
	// so polling it made two runs that were either already finished or
	// progressing completely normally look stuck, and got them cancelled
	// for nothing. The run-level status/conclusion (list_workflow_runs) and
	// the actual job logs (get_job_logs) both correctly showed a clean
	// "playtest: OK" pass at the true completion time. If a future run
	// looks stuck, check those before assuming a hang and cancelling it.
	const child = spawn(
		"npx",
		["wrangler", "dev", "--port", String(PORT), "--local", "--show-interactive-dev-session=false"],
		{
			cwd: REPO_ROOT,
			stdio: ["ignore", "pipe", "pipe"],
			detached: true,
		},
	);
	let output = "";
	child.stdout?.on("data", (d) => (output += d.toString()));
	child.stderr?.on("data", (d) => (output += d.toString()));

	const deadline = Date.now() + 45_000;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${BASE_URL}/api/categories`);
			if (res.ok) return child;
		} catch {
			// not up yet
		}
		await waitFor(500);
	}
	console.error("wrangler dev never became ready. Captured output:\n" + output);
	killProcessTree(child);
	throw new Error("wrangler dev failed to start within 45s");
}

// --- the playtest itself ---

const FALLBACK_WRONG_GUESSES: Record<string, string[]> = {
	// No reference_entities pool exists for 'manager' — see agents.md on
	// reference-pool coverage. Real managers, guaranteed not to be the
	// correct answer to a Top-10 recent-title-managers question by name
	// collision with the current 10 (checked against the category's own
	// answers before use, same as every other entity_type's wrong guesses).
	manager: [
		"Arsene Wenger",
		"Carlo Ancelotti",
		"Zinedine Zidane",
		"Rafael Benitez",
		"Harry Redknapp",
		"Sam Allardyce",
	],
};

function pickWrongGuesses(entityType: string, excludeNames: Set<string>, count: number): string[] {
	const rows = queryLocalD1<ReferenceRow>(
		`SELECT DISTINCT canonical_name FROM entities WHERE entity_type = '${entityType}' ORDER BY canonical_name LIMIT 200;`,
	);
	const pool = rows.map((r) => r.canonical_name).filter((n) => !excludeNames.has(n));
	const fallback = (FALLBACK_WRONG_GUESSES[entityType] ?? []).filter((n) => !excludeNames.has(n));
	const combined = pool.length >= count ? pool : [...pool, ...fallback];
	if (combined.length < count) {
		throw new Error(`Not enough wrong-guess candidates for entity_type=${entityType} (need ${count}, have ${combined.length})`);
	}
	return combined.slice(0, count);
}

async function playCategoryToWin(
	device: Device,
	slug: string,
	entityType: string,
	answers: AnswerRow[],
	aliasesByAnswer: Map<number, string[]>,
	mode: "classic" | "tension",
	interlaceWrongGuesses: number,
): Promise<void> {
	const ownNames = new Set(answers.map((a) => a.canonical_name));
	const wrongGuesses = pickWrongGuesses(entityType, ownNames, Math.max(interlaceWrongGuesses, 1));

	// Fresh round: not started yet.
	const before = await device.get<CategoryDetailResponse>(`/api/categories/${slug}`);
	assertEqual(before.status, 200, `[${slug}] GET category before playing`);
	assertEqual(before.body?.progress, null, `[${slug}] no progress before first guess`);

	let wrongSoFar = 0;
	for (let i = 0; i < interlaceWrongGuesses; i++) {
		const res = await device.postGuess(slug, wrongGuesses[i], mode);
		assertEqual(res.status, 200, `[${slug}] wrong guess "${wrongGuesses[i]}" request status`);
		assertEqual(res.body?.result, "wrong", `[${slug}] "${wrongGuesses[i]}" should be rejected (it's not one of this category's answers)`);
		wrongSoFar += 1;
		assertEqual(res.body?.progress?.wrongGuesses, wrongSoFar, `[${slug}] wrongGuesses counter after ${wrongSoFar} wrong guess(es)`);
	}

	// Group by canonical_name: a handful of categories are "one row per
	// occurrence" rather than "one row per entity" (e.g. Kylian Mbappe won
	// wc-recent-golden-boot twice, so he's both rank 1 and rank 2) — see
	// matchGuess()'s foundRanks handling. Guessing that name again *while an
	// occurrence is still unfound* is correctly "correct" (it advances to
	// the other occurrence), not "duplicate" — "duplicate" only applies once
	// every occurrence of the name is found. Treating every answer as an
	// independent [correct, then duplicate] pair (as this loop originally
	// did) is wrong for a repeat name: it raced its own duplicate-check
	// guess against the *other* occurrence still being open, which
	// legitimately consumed it — found live against wc-recent-golden-boot.
	const groups = new Map<string, AnswerRow[]>();
	for (const answer of answers) {
		const list = groups.get(answer.canonical_name) ?? [];
		list.push(answer);
		groups.set(answer.canonical_name, list);
	}

	let foundCount = 0;
	for (const [canonicalName, members] of groups) {
		members.sort((a, b) => a.rank - b.rank);
		const aliases = aliasesByAnswer.get(members[0].entity_id) ?? [];
		const obscureGuess = obscure(pickObscureAlias(canonicalName, aliases));

		for (const [i, member] of members.entries()) {
			// Alternate forms across occurrences too, so both the literal
			// name and an obscure alias get exercised even within a
			// repeat-name group.
			const guessText = i % 2 === 0 ? canonicalName : obscureGuess;
			const res = await device.postGuess(slug, guessText, mode);
			assertEqual(res.status, 200, `[${slug}] rank ${member.rank} guess request status`);
			assertEqual(
				res.body?.result,
				"correct",
				`[${slug}] rank ${member.rank} "${canonicalName}" guessed as "${guessText}" should be correct`,
			);
			assertEqual(res.body?.found?.rank, member.rank, `[${slug}] correct guess reports the right rank`);
			foundCount += 1;
		}

		// Skip the duplicate re-guess once the round is already complete —
		// whichever guess found the final remaining rank (in this group or
		// any other), guess.ts correctly rejects anything further with 409
		// before it ever reaches match logic, so "duplicate" is never
		// reachable there by design. Checking the actual running count
		// (rather than assuming groups/ranks are processed in a particular
		// order) is what makes this correct regardless of which name ends
		// up completing the round.
		if (foundCount === answers.length) continue;

		const dup = await device.postGuess(slug, canonicalName, mode);
		assertEqual(dup.status, 200, `[${slug}] "${canonicalName}" duplicate-check request status`);
		assertEqual(
			dup.body?.result,
			"duplicate",
			`[${slug}] re-guessing "${canonicalName}" after all its occurrences are found should report duplicate`,
		);
	}

	const final = await device.postGuess(slug, "___this guess should never match anything___", mode);
	// Round should already be complete after all ranks found — this guess
	// should be rejected outright, not scored.
	assertEqual(final.status, 409, `[${slug}] guessing after completion is rejected`);
}

async function main(): Promise<void> {
	resetLocalEnvironment();
	const child = await startDevServer();

	try {
		const categories = queryLocalD1<CategoryRow>("SELECT slug, entity_type FROM categories ORDER BY id;");
		assertEqual(categories.length, 48, "total category count");

		// Every category, one continuous "device" playing through all of
		// them in classic mode — obscure aliases, mixed case, punctuation
		// swapped, wrong-but-real names rejected, duplicates detected.
		const deviceA = new Device();

		const listBefore = await deviceA.get<CategoriesListResponse>("/api/categories");
		assertEqual(listBefore.status, 200, "GET /api/categories status");
		const beforeStatuses = new Set((listBefore.body?.categories ?? []).map((c) => c.status));
		assert(
			beforeStatuses.size === 1 && beforeStatuses.has("new"),
			`every category should start "new" for a fresh device (saw: ${JSON.stringify([...beforeStatuses])})`,
		);

		for (const category of categories) {
			console.log(`Playing ${category.slug} (${category.entity_type})...`);
			const answers = queryLocalD1<AnswerRow>(
				`SELECT ca.entity_id, ca.rank, e.canonical_name FROM category_answers ca JOIN entities e ON e.id = ca.entity_id JOIN categories c ON ca.category_id = c.id WHERE c.slug = '${category.slug}' ORDER BY ca.rank;`,
			);
			const aliasRows = queryLocalD1<AliasRow>(
				`SELECT al.entity_id, al.alias FROM entity_aliases al JOIN category_answers ca ON al.entity_id = ca.entity_id JOIN categories c ON ca.category_id = c.id WHERE c.slug = '${category.slug}';`,
			);
			const aliasesByAnswer = new Map<number, string[]>();
			for (const row of aliasRows) {
				const list = aliasesByAnswer.get(row.entity_id) ?? [];
				list.push(row.alias);
				aliasesByAnswer.set(row.entity_id, list);
			}

			try {
				await playCategoryToWin(deviceA, category.slug, category.entity_type, answers, aliasesByAnswer, "classic", 2);
			} catch (err) {
				fail(`[${category.slug}] threw during playthrough: ${(err as Error).message}`);
				continue;
			}

			const reveal = await deviceA.get<RevealResponse>(`/api/reveal/${category.slug}`);
			assertEqual(reveal.status, 200, `[${category.slug}] reveal available after completion`);
			const revealedNames = new Set((reveal.body?.answers ?? []).map((a) => a.name));
			for (const answer of answers) {
				assert(
					revealedNames.has(answer.canonical_name),
					`[${category.slug}] reveal should include "${answer.canonical_name}"`,
				);
			}

			// A quick typeahead sanity check against the same category —
			// the pipeline this whole game is built on, exercised end to
			// end via real HTTP, not just the SQL-level guess-matching audit.
			const prefix = answers[0].canonical_name.slice(0, 3);
			const suggest = await deviceA.get<SuggestResponse>(
				`/api/suggest?q=${encodeURIComponent(prefix)}&category=${category.slug}`,
			);
			assertEqual(suggest.status, 200, `[${category.slug}] suggest request status`);
			assert(
				Array.isArray(suggest.body?.suggestions) && suggest.body.suggestions.length > 0,
				`[${category.slug}] typeahead for "${prefix}" returns at least one suggestion`,
			);
		}

		const listAfter = await deviceA.get<CategoriesListResponse>("/api/categories");
		const afterStatuses = new Set((listAfter.body?.categories ?? []).map((c) => c.status));
		assert(
			afterStatuses.size === 1 && afterStatuses.has("won"),
			`every category should show "won" after playing all of them (saw: ${JSON.stringify([...afterStatuses])})`,
		);

		// Edge cases a real (or malicious) client can trivially hit.
		console.log("Checking request-validation edge cases...");
		const unknownSlug = await deviceA.postGuess("this-category-does-not-exist", "anything");
		assertEqual(unknownSlug.status, 404, "guessing on an unknown category slug");

		// A fresh device, deliberately not deviceA: by this point deviceA has
		// completed every category, and guess.ts checks "already finished"
		// (409) before it ever looks at whether the guess itself is empty —
		// correct precedence, but it means this specific check needs a
		// category nobody has started yet, not one deviceA already won.
		const deviceEdgeCases = new Device();
		const emptyGuess = await deviceEdgeCases.postGuess(categories[0].slug, "   ");
		assertEqual(emptyGuess.status, 400, "guessing with a whitespace-only guess");

		const shortSuggest = await deviceA.get<SuggestResponse>(`/api/suggest?q=a&category=${categories[0].slug}`);
		assertEqual(shortSuggest.body?.suggestions?.length, 0, "typeahead below the minimum query length returns nothing");

		const unknownCategorySuggest = await deviceA.get<SuggestResponse>(`/api/suggest?q=real&category=not-a-real-category`);
		assertEqual(unknownCategorySuggest.body?.suggestions?.length, 0, "typeahead against an unknown category returns nothing");

		// truncated: a real, common prefix ("mar" matches 650+ distinct players
		// in the reference pool, see suggest.ts) must come back flagged as cut
		// short rather than silently presenting a partial list as complete —
		// this is the actual UI signal that tells a player to keep typing.
		const playerCategory = categories.find((c) => c.entity_type === "player");
		assert(playerCategory !== undefined, "at least one player category exists to test truncation against");
		const broadSuggest = await deviceA.get<SuggestResponse>(
			`/api/suggest?q=mar&category=${playerCategory!.slug}`,
		);
		assertEqual(broadSuggest.status, 200, "broad-prefix suggest request status");
		assertEqual(broadSuggest.body?.suggestions?.length, 20, "broad prefix returns exactly MAX_RESULTS suggestions");
		assertEqual(broadSuggest.body?.truncated, true, "broad prefix is flagged as truncated");

		// Tension mode: a separate device so it doesn't collide with device
		// A's classic-mode completion of the same categories.
		console.log("Playing tension mode (loss path)...");
		const deviceB = new Device();
		const lossSlug = categories[0].slug;
		const lossAnswers = queryLocalD1<AnswerRow>(
			`SELECT ca.entity_id, ca.rank, e.canonical_name FROM category_answers ca JOIN entities e ON e.id = ca.entity_id JOIN categories c ON ca.category_id = c.id WHERE c.slug = '${lossSlug}' ORDER BY ca.rank;`,
		);
		const lossWrongGuesses = pickWrongGuesses(
			categories[0].entity_type,
			new Set(lossAnswers.map((a) => a.canonical_name)),
			5,
		);
		let lastLossResult: { status: number; body: GuessResponse | null } | null = null;
		for (let i = 0; i < 5; i++) {
			lastLossResult = await deviceB.postGuess(lossSlug, lossWrongGuesses[i], "tension");
			assertEqual(lastLossResult.body?.result, "wrong", `[tension loss] wrong guess ${i + 1}/5`);
		}
		assertEqual(lastLossResult?.body?.progress?.completed, true, "[tension loss] round completed after 5 lives lost");
		assertEqual(lastLossResult?.body?.progress?.won, false, "[tension loss] round is a loss, not a win");
		assertEqual(lastLossResult?.body?.livesRemaining, 0, "[tension loss] 0 lives remaining");
		const revealAfterLoss = await deviceB.get<RevealResponse>(`/api/reveal/${lossSlug}`);
		assertEqual(revealAfterLoss.status, 200, "[tension loss] reveal is available even after a loss (round is completed, not won)");

		console.log("Playing tension mode (win path, with some wrong guesses mixed in)...");
		const winSlug = categories[1].slug;
		const winAnswers = queryLocalD1<AnswerRow>(
			`SELECT ca.entity_id, ca.rank, e.canonical_name FROM category_answers ca JOIN entities e ON e.id = ca.entity_id JOIN categories c ON ca.category_id = c.id WHERE c.slug = '${winSlug}' ORDER BY ca.rank;`,
		);
		const winAliasRows = queryLocalD1<AliasRow>(
			`SELECT al.entity_id, al.alias FROM entity_aliases al JOIN category_answers ca ON al.entity_id = ca.entity_id JOIN categories c ON ca.category_id = c.id WHERE c.slug = '${winSlug}';`,
		);
		const winAliasesByAnswer = new Map<number, string[]>();
		for (const row of winAliasRows) {
			const list = winAliasesByAnswer.get(row.entity_id) ?? [];
			list.push(row.alias);
			winAliasesByAnswer.set(row.entity_id, list);
		}
		await playCategoryToWin(deviceB, winSlug, categories[1].entity_type, winAnswers, winAliasesByAnswer, "tension", 2);
		const winList = await deviceB.get<CategoriesListResponse>("/api/categories");
		const winEntry = (winList.body?.categories ?? []).find((c) => c.slug === winSlug);
		assertEqual(winEntry?.status, "won", "[tension win] category shows as won after finishing with lives to spare");

		// Give up: a fresh device/category so it doesn't collide with A's or
		// B's completions above.
		console.log("Giving up mid-round...");
		const deviceC = new Device();
		const giveUpSlug = categories[2].slug;

		const giveUpBeforeStart = await deviceC.postGiveUp(giveUpSlug);
		assertEqual(giveUpBeforeStart.status, 404, "[give up] no round in progress yet");

		const giveUpWrongGuesses = pickWrongGuesses(categories[2].entity_type, new Set(), 1);
		const startingGuess = await deviceC.postGuess(giveUpSlug, giveUpWrongGuesses[0], "classic");
		assertEqual(startingGuess.status, 200, "[give up] a guess starts the round as normal");

		const giveUpResult = await deviceC.postGiveUp(giveUpSlug);
		assertEqual(giveUpResult.status, 200, "[give up] give-up request status");
		assertEqual(giveUpResult.body?.progress?.completed, true, "[give up] round is marked completed");
		assertEqual(giveUpResult.body?.progress?.won, false, "[give up] giving up is not a win");

		const giveUpAgain = await deviceC.postGiveUp(giveUpSlug);
		assertEqual(giveUpAgain.status, 409, "[give up] can't give up on an already-finished round");

		const giveUpReveal = await deviceC.get<RevealResponse>(`/api/reveal/${giveUpSlug}`);
		assertEqual(giveUpReveal.status, 200, "[give up] reveal is available after giving up");

		const giveUpList = await deviceC.get<CategoriesListResponse>("/api/categories");
		const giveUpEntry = (giveUpList.body?.categories ?? []).find((c) => c.slug === giveUpSlug);
		assertEqual(giveUpEntry?.status, "lost", "[give up] category shows as lost after giving up");
	} finally {
		killProcessTree(child);
	}
}

main()
	.then(() => {
		console.log(`\n${assertions} assertions checked.`);
		if (failures.length > 0) {
			console.error(`\nplaytest: FAILED — ${failures.length} failure(s):`);
			for (const f of failures) console.error(`  - ${f}`);
			process.exit(1);
		}
		console.log("playtest: OK — every category played to completion, every edge case behaved correctly.");
	})
	.catch((err) => {
		console.error("playtest crashed:", err);
		process.exit(1);
	});

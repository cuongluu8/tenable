# Progress / handoff notes

Written 2026-08-28 so work on Tenable can continue in a fresh session —
possibly under a different Claude account with no memory of this one. This
file is a snapshot, not a living doc: trust `git log` and the live app over
anything here if they disagree. For conventions, architecture, deployment,
and cost guardrails, **read `agents.md` first** — it's the actual source of
truth and this file doesn't repeat it. This file is just "what happened
recently and what to know before touching anything."

## Where things stand right now

- Repo: `cuongluu8/tenable`, default/only-deployed branch is `main`.
- Latest commit as of writing: `31a9dcf` ("Fix world-alltime-transfers:
  missing 2026 window deals, stale Dembele fee").
- Live at https://tenable.cuong-luu.workers.dev — deploys automatically on
  every push to `main` via Cloudflare Workers Builds (no GitHub Actions
  deploy step; see agents.md's Deployment section before adding one).
- CI (`.github/workflows/ci.yml`) and content-check
  (`.github/workflows/content-check.yml`, only runs when `db/seed.sql`
  changes) are both green on `31a9dcf`.
- Production D1 confirmed matching `db/seed.sql` exactly: **42 categories,
  415 answers, 815 answer_aliases, 19,279 reference_entities** (100 of
  those `entity_type = 'manager'`).
- Nothing is mid-flight — every task from this session shipped, verified
  locally, verified in production, pushed, and confirmed green on CI. A
  fresh session can just wait for the next user request.

## What this session did (most recent first)

1. **`db/seed.sql`**: corrected `world-alltime-transfers` — it had fallen
   behind `pl-alltime-transfers` (missing Morgan Rogers, Elliot Anderson,
   and Florian Wirtz's settled fee; Dembele's figure was a stale base fee
   instead of the fully-settled total). See the commit message and the
   comment directly above the `world-alltime-transfers` INSERT in
   `db/seed.sql` for the full reasoning and sourcing.
2. **Multiplayer**: pass now costs a life (previously a free skip); the
   result screen fetches and shows the full answer grid via a new
   `GET /api/multiplayer/reveal/:slug` route (missed answers shown in red,
   found ones tinted per-player); per-player colors, a prominent
   color-coded turn banner, a live per-turn timer, and a winner rule
   (most found, ties broken by quickest cumulative time) with ranked
   standings on the result screen.
3. **Reference pool**: added 100 well-known football managers (historic
   legends through current) to `reference_entities` as
   `entity_type = 'manager'` — typeahead-only, no stat_value/rank, so no
   live fact-check applies to these (see agents.md's Content accuracy
   section for why that check only covers "This Season" categories).
4. **7 new manager categories**: UCL/European Cup titles, career trophies,
   PL tenure, and league-title counts (PL/La Liga/Serie A/Bundesliga) by
   manager, all-time.
5. **2 new transfer categories**: `world-alltime-transfers`,
   `pl-alltime-transfers` (the ones corrected in item 1 above).
6. Earlier in the session (see git log for full detail): built
   `scripts/verify-content-source.ts`, a real fact-check against
   football-data.org's live API for "This Season" categories, replacing an
   earlier rejected approach that only checked for a marker comment rather
   than actual correctness — that rejection and redesign is worth reading
   in `agents.md`'s Content accuracy section if a future content bug shows
   up, since it's the actual reasoning for why that check exists and what
   it does and doesn't cover.

## Things a fresh session should know before diving in

- **This sandbox (Bash/WebFetch) cannot reach any external host** —
  football-data.org, Wikipedia, sports sites, everything. Only `WebSearch`
  works, and it's a chat-turn tool, not callable from a script (so
  `verify-content-source.ts` can only ever be tested for real in GitHub
  Actions CI, never locally). Don't waste time debugging what looks like a
  network failure in Bash/WebFetch here — it's the sandbox's egress policy,
  not a bug.
- **GitHub Actions run status via the list/get tools lags real completion**
  — a run can show `in_progress` well after it's actually finished. Cross-
  check with real wall-clock time (`date -u`) before assuming a run is
  stuck; `ci.yml` itself has a comment about a past false alarm here. Don't
  cancel/retrigger a run just because the status API looks slow to update.
- **`verify-content-source.ts` (`content-check.yml`) only covers "This
  Season" categories** that map to a real football-data.org competition
  (current-season domestic tables/scorers, a few UEFA/FIFA competitions).
  Everything else — all-time records, transfers, manager stats — has no
  live-API equivalent and is only as good as the WebSearch research behind
  it. If a user flags one of those as wrong (like the transfers fix in this
  session), the right move is fresh WebSearch cross-referencing multiple
  sources, not assuming CI would have caught it.
- **The `multiplayer` git branch (if it still exists on the remote) is
  stale** — multiplayer was merged into `main` early in this session's
  history and has been developed further there since. Don't branch new
  multiplayer work off the old `multiplayer` branch; work off `main`.
- Several other `claude/*` branches may exist on the remote from earlier,
  unrelated sessions — not reviewed or cleaned up this session, status
  unknown. Check before assuming any of them are current or safe to build
  on.
- Standard verification pipeline before any push (see agents.md's Local
  development section for exact commands): `npm run lint`, `npm run
  build`, `npm run verify:matching`, `npm run verify:name-sync`, `npm run
  playtest`, then apply any `db/seed.sql` change to production D1 in the
  same step and verify with a SELECT before pushing. This session pushed
  directly to `main` throughout (no PRs) — continue that unless the user
  says otherwise.
- **Adding a new category specifically** has its own checklist now —
  agents.md's Content accuracy section, "Checklist: adding a new category"
  (added 2026-08-28 in response to this exact question coming up, so it
  doesn't have to be reconstructed from incident writeups again). Read it
  before adding one; `verify:name-sync` in particular is called out there
  as required, not optional, every time.
- Production D1 (`tenable-content`, id `a87ef250-cc94-4765-a821-785acbcd71a4`)
  and KV (`tenable-progress`) are on a **shared Cloudflare account** with
  other, unrelated projects — see agents.md's Cost section before assuming
  headroom.

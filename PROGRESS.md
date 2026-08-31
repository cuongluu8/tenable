# Progress / handoff notes

Written 2026-08-31 so work on Tenable can continue in a fresh session —
possibly under a different Claude account with no memory of this one. This
file is a snapshot, not a living doc: trust `git log` and the live app over
anything here if they disagree. For conventions, architecture, deployment,
and cost guardrails, **read `agents.md` first** — it's the actual source of
truth and this file doesn't repeat it. This file is just "what happened
recently and what to know before touching anything."

## Where things stand right now

- Repo: `cuongluu8/tenable`. Default/deployed branch is `main`; this
  session's designated working branch is `claude/tenable-app-plan-ofc0zj`
  (all commits below are on it, not yet merged into `main` — no PR was
  opened this session per the operating instructions in effect: "never
  open a PR unless the user explicitly asks").
- Latest commit as of writing: `ca62eb4` ("verify-content-source.ts: add
  Rennes/Stade Rennais FC 1901 NAME_ALIASES entry").
- Live at https://tenable.cuong-luu.workers.dev (deploys off `main` via
  Cloudflare Workers Builds) — **does not yet include this session's work**
  until `claude/tenable-app-plan-ofc0zj` is merged/pushed to `main`.
- CI (`.github/workflows/ci.yml`, push/PR to `main` only, no
  `workflow_dispatch`) has **not run** for this branch's commits — it only
  triggers against `main`. The local equivalent (lint/build/
  verify:matching/verify:name-sync/playtest) was run by hand instead and is
  fully green (3403 playtest assertions, 48 categories). `content-check.yml`
  *does* support `workflow_dispatch` and was manually run against this
  branch — green as of `ca62eb4`.
- Production D1 confirmed matching this branch's `db/seed.sql` exactly:
  **48 categories, 473 answers, 919 answer_aliases** — applied and
  verified directly against production throughout this session (see
  agents.md's Production D1 note for why that's the established pattern
  even without a merge to `main` yet).
- Nothing is mid-flight content-wise — every category added this session
  shipped, verified locally, verified in production, and pushed. The one
  thing a fresh session should actually pick up: **merging
  `claude/tenable-app-plan-ofc0zj` into `main`** (or continuing more work
  on it) is still outstanding — ask the user whether/when to do that,
  since PRs are opt-in this session.

## What this session did (most recent first)

1. **Fixed two real content bugs in `ligue-1-2025-26-table`**, both caught
   by `content-check.yml`'s live football-data.org diff (not by eye): the
   9th/10th positions (Lorient/Toulouse) were swapped, and Toulouse's point
   total was wrong (44, not 45) — both traced back to a Wikipedia
   standings-template transcription that didn't match the real season.
   Also added a `NAME_ALIASES` entry for Rennes vs. football-data.org's
   official "Stade Rennais FC 1901" name (a real false-positive class the
   script already handles for Bayern Munich) so the check is fully green
   rather than carrying a known-false-positive forever.
2. **Added 6 new categories**: Ligue 1 all-time top scorers, all-time
   titles by club, and 2025-26 final table; plus "recent unique winners"
   spins for the Euro Championship, Copa América, and AFCON (mirroring the
   existing `ucl-recent-unique-winners`). Copa América's is a Top 8, not
   Top 10 — only 8 nations have ever won it, full stop.
3. **Built and iterated on `.github/workflows/research-fetch.yml`** — a
   `workflow_dispatch`-only GitHub Actions job that curls a list of URLs
   (real internet access, unlike this sandbox) and prints the content into
   the job log, optionally grep-filtered with a configurable context-line
   window. This is the actual way to get real page content into an agent
   session here now — see agents.md's Content accuracy section for the
   full writeup of what works (Wikipedia's `?action=raw`,
   footballapi.pulselive.com) and what doesn't (11v11.com,
   worldfootball.net, footballdatabase.eu, transfermarkt.com — all
   Cloudflare-bot-blocked; statmuse.com — client-rendered).
4. **Explicitly did not add** 5 more "Club Goalscorers" categories
   (Chelsea/Tottenham/Newcastle/Leeds/Aston Villa Premier-League-only top
   scorers) — no plain-curlable source with that exact breakdown was found
   in the time spent trying. Documented as a known gap in agents.md rather
   than guessed from training knowledge. Worth another attempt (maybe via
   footballapi.pulselive.com's actual stats-ranking endpoint, whose exact
   path wasn't found) if a future session wants to pick this back up.
5. Earlier: restarted `claude/tenable-app-plan-ofc0zj` from the tip of
   `main` (the branch's prior content had already been merged via a chain
   of individually-merged PRs #1-#17; follow-up commits from an earlier
   session had landed on `main` directly rather than the branch, so the
   branch was stale — fast-forwarded it back in line with `main` before
   starting this session's work, per the "PR already merged" handling in
   this session's operating instructions).

## Things a fresh session should know before diving in

- **This sandbox still cannot reach most external hosts directly**
  (Bash/WebFetch) — confirmed again this session. `api.github.com` (and a
  handful of other allowlisted hosts) work fine through the proxy;
  everything else (Wikipedia, football-data.org, sports sites in general)
  does not. **Use `.github/workflows/research-fetch.yml`** (see item 3
  above) instead of assuming WebSearch is good enough — WebSearch only
  returns fragmentary snippets, not full page content, and has repeatedly
  been shown insufficient for reading an exact ranked table.
- **GitHub Actions run status via the list/get tools lags real
  completion** — a run can show `in_progress` well after it's actually
  finished. Cross-check with real wall-clock time before assuming a run is
  stuck; don't cancel/retrigger just because the status API looks slow.
- **`verify-content-source.ts` (`content-check.yml`) only covers "This
  Season" categories** that map to a real football-data.org competition.
  Everything else (all-time records, transfers, manager stats, and now the
  Recent Winners categories) has no live-API equivalent and is only as
  good as the sourcing behind it at creation time.
- **`ci.yml` only triggers on push/PR to `main`** — pushing to a feature
  branch does not run it. Run the same checks by hand (see below) before
  trusting a feature-branch commit, and know that "confirm CI green" for
  work not yet on `main` really means "confirm the local-equivalent
  checks are green" plus, if `db/seed.sql` changed, a manual
  `workflow_dispatch` of `content-check.yml` against that branch (it does
  support manual dispatch).
- Standard verification pipeline before any push (see agents.md's Local
  development section for exact commands): `npm run lint`, `npm run
  build`, `npm run verify:matching`, `npm run verify:name-sync`, `npm run
  playtest`, then apply any `db/seed.sql` change to production D1 in the
  same step and verify with a SELECT before pushing.
- **Adding a new category** has its own checklist — agents.md's Content
  accuracy section, "Checklist: adding a new category". Read it before
  adding one; `verify:name-sync` is required, not optional, every time.
- Production D1 (`tenable-content`, id
  `a87ef250-cc94-4765-a821-785acbcd71a4`) and KV (`tenable-progress`) are
  on a **shared Cloudflare account** with other, unrelated projects — see
  agents.md's Cost section before assuming headroom. The Cloudflare MCP
  connection can intermittently 403 mid-session (seen once this session,
  resolved on retry) — don't assume a single failed query means the whole
  connection is dead; retry before escalating.
- Several `claude/*` branches likely exist on the remote from earlier,
  unrelated sessions — not reviewed or cleaned up this session, status
  unknown. Check before assuming any of them (besides
  `claude/tenable-app-plan-ofc0zj`) are current or safe to build on.

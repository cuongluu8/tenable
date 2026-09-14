# Scaling remote play: where the bottlenecks are, and how to get to tens, hundreds, thousands

Written 2026-09-14 against the code as of that date. Numbers marked
*measured* were taken from the running app; Cloudflare limits and prices
were read from the official pricing/limits pages the same day -- re-check
them before spending money, they change.

**Short version.** The architecture is already the right shape for scale
(one Durable Object per session, server-authoritative, static assets
free), but the *free tier plus polling* caps it at roughly **an evening
for a few dozen players**, and the very first thing that fails is a
self-imposed guardrail, not Cloudflare. Tens of players: fix three cheap
things and stay free. Hundreds: pay $5/month and move from polling to
WebSockets. Thousands: WebSockets are non-negotiable, plus take the
typeahead and images off the per-request database path. Nothing needs a
different database or a second service at any of these tiers.

---

## 1. What one player costs today

Everything a client does is one of four things. Per **active remote
player**, per hour, **as deployed after the tier-1 work of 2026-09-14**
(the "before" figures are kept in brackets because they explain the
ceilings in §2):

| Activity | Frequency | Worker requests | Durable Object | D1 | Notes |
|---|---|---|---|---|---|
| **Poll `/state`** (round formats) | every 4s = 900/h | 900 | 900 requests, 1,800 rows read, ~1,200 rows written¹ | none | reply *measured* **33 bytes** when nothing changed (`?v=` fingerprint), ~1.5 KB when it did |
| **Poll `/state`** (Roll of Honour in progress) | every 1.5s = 2,400/h | 2,400 | 2,400 requests, 4,800 rows read, ~1,200 rows written¹ | none | reply *measured* **33 bytes** unchanged, ~10 KB on a change (93-tile grid). [Before: the full ~10 KB grid every poll, ~24 MB/h per player.] |
| **Action** (guess, claim, answer, give up, chat, ready) | maybe 20-60/h | 1 each | 1 request, 2 reads, 1-2 writes | up to 3 indexed reads (grading), **no writes** | [Before: +1 D1 write per action for the daily budget counter.] Rate-limited per player in memory at the edge (`lib/rateLimits.ts`). |
| **Typeahead keystroke** (≥3 chars, 200ms debounce) | maybe 60-200/h | Roll of Honour: **0**; Club Run / Teammate Tell: 1 each | none | Roll of Honour: **none** (the ~700-club list is fetched once, ~36 KB raw, edge-cached, filtered in the browser); others: a bounded FTS read | [Before: +2 D1 writes per keystroke for the budget counter and per-IP limiter.] |

¹ The heartbeat (`lastSeenAt`) is written at most once per 3s regardless
of poll rate (`HEARTBEAT_WRITE_MIN_MS`), i.e. 1,200 row-writes/hour/player.

What stands out now:

- **Polling itself is the whole cost.** With writes gone from actions and
  keystrokes, and unchanged polls answered in 33 bytes, what a connected
  player costs is almost entirely the poll *requests* -- one Worker
  request plus one Durable Object request every 1.5-4s whether or not
  anything happened. That is what tier 2 (WebSockets) removes.
- **Server CPU per poll is unchanged.** The fingerprint is computed from
  the full public state, so the object still builds it each poll; the
  saving is bytes on the wire and the phone's parse/re-render, not the
  object's work. Also a tier-2 item.

The daily game (Top 10) is different: it doesn't poll, but it **writes to
KV on every guess** (`guess.ts` -> `saveProgress`) plus 2-3 writes on
completion. A 10-answer round is ~12-15 KV writes.

## 2. The ceilings, in the order they'll be hit

All free-tier limits are **per account per day**, shared with the other
projects on this account (see `agents.md` -> Cloudflare resources).

| # | Ceiling | Value | What hits it first | Roughly when |
|---|---|---|---|---|
| ~~1~~ | ~~**`DAILY_REQUEST_BUDGET`** (ours)~~ **Removed 2026-09-14** | was 20,000 non-poll API requests/day, then 503 until midnight UTC | was: typeahead, ~20 suggest calls per attempted answer | was **~500-1,000 answered questions/day across everyone** -- the first wall. Replaced by the per-player and global Rate Limiting bindings (`lib/rateLimits.ts`), which count nothing in D1. |
| 2 | **Worker requests** (Cloudflare free) | 100,000/day | Polling | **~110 player-hours/day at 4s** (10 players for 11h, or 100 for 1h). **~40 player-hours at 1.5s** (Roll of Honour). |
| 3 | **Durable Object requests** (free) | 100,000/day | Polling -- one DO request per poll | same as #2 |
| 4 | **Durable Object rows written** (free) | 100,000/day | Heartbeats (1,200/h/player) + actions | ~80 player-hours/day |
| ~~5~~ | ~~**D1 rows written** (free)~~ **No longer on the hot path** | 100,000/day | was: the budget counter + rate limiter, 1-2 per action/keystroke | Gameplay now writes nothing to D1 per request; the only D1 writes left are the nightly rebuild and content changes. |
| ~~6~~ | ~~**Suggest rate limit** (ours, per IP)~~ **Re-keyed 2026-09-14** | now 60 typeahead calls/min **per player** (token, else a device cookie minted on first contact) | was: a whole room on one Wi-Fi sharing one 30/min bucket | A venue no longer shares a bucket. Roll of Honour typeahead makes no requests at all. |
| 7 | **KV writes** (free) | 1,000/day | The daily game's per-guess write | **~70 completed Top 10 rounds/day**, app-wide |
| 8 | **Worker CPU** (free) | 10 ms per request | Roll of Honour `/state` (parse ~60 KB, serialise 10 KB) is the heaviest route at ~1-3 ms | not yet; becomes the paid-plan cost driver if polling stays |
| 9 | D1 rows read (free) | 5,000,000/day | Typeahead FTS reads (bounded, tens of rows each) | well beyond hundreds of players |
| 10 | Per-object throughput | soft 1,000 req/s per Durable Object | An 8-player session at 1.5s is ~5 req/s | never, by design -- sessions are the unit of scale |

What is **not** a bottleneck, and why it's worth knowing:

- **Number of sessions.** One Durable Object per session code; objects
  are unlimited. A thousand simultaneous games is a thousand objects,
  each doing a few requests a second. There is no shared/global object to
  become a hotspot -- and adding one (a "live games" list, say) is the
  single easiest way to create one; if that's ever wanted, shard it.
- **Static assets** (the app itself). Served by Workers Assets: *"free
  and unlimited"*, not counted against Worker requests.
- **Badge/flag images** (`/api/media/*`). Browser-cached 24h; each is an
  R2 read only when a browser hasn't seen it. Fine into the hundreds;
  see tier 3 for edge caching.
- **Category/library reads.** Already behind the edge Cache API keyed by
  `content_version` (`responseCache.ts`).

## 3. Tier 1 -- tens of concurrent players, staying on the free plan

Target: **20-30 people playing at once for an evening, possibly from one
venue**, with no bill. Three changes, all cheap, all in this repo.

> **Done 2026-09-14** (all three, same day this doc was written): the
> Rate Limiting binding replaced both D1 guards (`lib/rateLimits.ts`);
> `/state` answers `{ unchanged: true }` to a poll carrying the last
> fingerprint; Roll of Honour's typeahead filters a once-fetched, edge-
> cached club list in the browser. Ceilings #1, #5 and #6 in §2 no longer
> exist. What remains for this tier is Cloudflare's request quotas (#2-#4).

### 3a. Take the guardrails off the hot path

The budget counter and rate limiter each cost a contended D1 write per
request and are the first two ceilings (#1, #5, #6). Replace them with
Cloudflare's **Rate Limiting binding** (`[[ratelimits]]` in
`wrangler.json`; available on the free plan; in-memory at the edge, no
storage ops, no D1). Two limits:

- **Per player, not per IP**: key on the remote-play token (or the daily
  game's device cookie), so a room on one Wi-Fi isn't one bucket. Suggest
  at ~60/min/player, actions at a few hundred/min/player -- a runaway-
  client bound, not a human-pace check (the playtest's ~170/min on one
  device has to fit; 120 didn't).
- **Per route class** for a coarse global backstop if wanted -- but the
  free plan already fails closed at 100k requests/day, which is what
  `DAILY_REQUEST_BUDGET` was standing in for. Either raise it to ~90,000
  so it's a last resort rather than the first wall, or remove it once the
  binding is in and the account is on a paid plan with Budget Alerts.

Expected effect: D1 writes drop to ~zero per request; ceilings #1, #5, #6
disappear; every API call gets faster (one fewer round trip to D1).

### 3b. Stop shipping the grid on every poll

Add a monotonic `version` to the session record, bumped on every state
change. Clients send `?v=<last version>`; the object answers `304 Not
Modified` (or a 1-line `{ unchanged: true }`) when nothing changed, and
the full state otherwise. Most Roll of Honour polls change nothing.

Expected effect: the 10 KB payload becomes ~0.1 KB for the vast majority
of polls (mobile data, CPU per request). Requests are unchanged -- that's
tier 2's job.

### 3c. Typeahead without the database (Roll of Honour first)

Roll of Honour's typeahead is the *club* table: ~700 names plus curated
aliases -- **~15 KB gzipped**. Ship it as a static asset (free, cached
forever, versioned by filename) and filter client-side; zero requests per
keystroke. The player typeahead (Club Run / Teammate Tell, ~18,400 names)
is ~300 KB gzipped -- feasible as a lazy-loaded asset too, but the
cheaper first step there is **edge-caching the suggest responses**: they
are public and identical for every player for a given prefix, so wrap
them in the Cache API with a `content_version` key (same pattern as
`responseCache.ts`). A room typing the same famous names hits the cache.

Expected effect: typeahead stops being the dominant request type;
ceiling #9 recedes; D1 read replicas (tier 3) become unnecessary for a
long time.

**After tier 1 (now)** the ceilings are Cloudflare's request quotas
(#2-#4): ~40-110 player-hours per day. That is "a few dozen players for
one evening", not "a few dozen players all day" -- tier 2 is what removes
it. Two things learned doing tier 1 that the plan above didn't predict:
badge/flag images (`/api/media/*`) had to be exempted from the per-player
limit, since a revealed grid pulls dozens at once; and the per-player
action limit had to be 600/min, not 120, because `npm run playtest`
plays every category on one device at ~170/min -- the limit is a
runaway-client bound, not a human-pace check.

## 4. Tier 2 -- hundreds of concurrent players

Target: **100-500 concurrent, every evening**, at a predictable cost.

### 4a. Workers Paid ($5/month) -- and what it actually buys

| Resource | Included | Overage |
|---|---|---|
| Worker requests | 10 M/month | $0.30/M |
| Worker CPU | 30 M ms/month | $0.02/M ms |
| Durable Object requests | 1 M/month | $0.15/M |
| Durable Object duration | 400,000 GB-s/month | $12.50/M GB-s |
| DO/D1 rows written | 50 M/month | $1.00/M |
| DO/D1 rows read | 25 B/month | $0.001/M |
| KV writes | 1 M/month | $5.00/M |
| KV reads | 10 M/month | $0.50/M |

The daily limits go away; everything becomes metered. **Polling at this
tier is affordable but wasteful**: 300 concurrent × 3 hours × 30 nights
at 4s is ~24 M Worker requests and ~24 M DO requests a month -- about
$4 + $4 in overage, so ~$13/month all in. The problem isn't the money,
it's that (a) Roll of Honour at 1.5s is 2.7× that, (b) every player still
sees 0.75-2 s of lag on everyone else's actions, and (c) request volume
scales with *time connected*, not with *things happening*. Hence:

### 4b. WebSockets with the Hibernation API -- the one structural change

Each session object accepts one WebSocket per player and **pushes** state
on change instead of answering polls. This is the intended Durable
Objects pattern and the billing is built for it:

- **Outgoing messages are free.** Every broadcast of a state change to
  every connected player costs nothing.
- **Incoming messages bill at 20:1** (100 messages = 5 requests). A
  player's guesses/claims/chat -- maybe 30-60 messages an hour -- become
  2-3 billable requests.
- **Hibernation** means an idle connection consumes no duration. Players
  sitting on a reveal or a lobby cost nothing until something happens.

Effect on the numbers above: 300 concurrent players for a month goes
from ~48 M billable requests to well **under 1 M** -- inside the paid
plan's included amounts. Latency for another player's lock/release
drops from 0-1.5 s to tens of milliseconds, and the 5 s start-countdown
and reveal-hold windows can shrink (they exist to paper over poll
skew). Keep `/state` as the fallback for a client whose socket won't
connect, and keep polling *it* slowly (say 10 s) as a liveness check.

Implementation notes for whoever does this:
- Use the Hibernation API (`ctx.acceptWebSocket`, `webSocketMessage`
  handlers, `serializeAttachment` for the player token), not the legacy
  in-memory `WebSocketPair` handling, or the object never sleeps and
  duration charges reappear.
- The heartbeat becomes the socket itself; "away" becomes "socket
  closed for 15 s". Keep `lastSeenAt` for the HTTP fallback path.
- Broadcast the same public state the poll returns today -- the client's
  `useRemoteSession` already merges by version/feed id, so the transport
  can change under it without touching the screens.
- Auto-response for pings (`setWebSocketAutoResponse`) so keepalives
  don't wake the object.

### 4c. Storage shape inside the object

Today a session is **two KV values** (`session`, `players`), and the
`session` value carries the grid *and* the 300-entry activity feed --
~60 KB rewritten in full on every guess. The KV backend's value cap is
**128 KiB**; a long chat-heavy Roll of Honour game gets uncomfortably
close. Move to the object's **SQLite tables** (`ctx.storage.sql`): a
`feed` table appended one row at a time, a `tiles` table updated one row
at a time, players one row each. Rows written per action drops from
"the whole record" to 1-2, the cap disappears, and `/state?since=` /
the socket delta become a `WHERE id > ?` query.

### 4d. The daily game's KV writes

At hundreds of daily players, the per-guess KV write (~15 per round) is
the one KV cost that grows: 1 M writes/month included covers ~65,000
rounds/month, then $5 per million. Two easy halvings if it matters:
write progress only on completion and every 5th guess (a refresh loses
at most a few guesses), and fold streak/lifetime into the same record as
progress to save the extra keys. Not urgent -- note it and watch the KV
dashboard.

### 4e. See what's happening

Before scaling, be able to see it: enable **Workers Logs** (or ship to
Analytics Engine), watch the dashboard's per-Worker and per-DO-namespace
request/CPU/error graphs, and keep `wrangler d1 insights` for the
occasional "which query read 70,000 rows" hunt (see `agents.md`'s
2026-09-06 incident). Set a **Budget Alert** on the account.

## 5. Tier 3 -- thousands of concurrent players

Target: **1,000-10,000 concurrent**. WebSockets (4b) and SQL storage
(4c) are prerequisites; the remaining work is taking everything else off
the per-request database path and preparing to be surprised.

### 5a. Cost sketch (5,000 concurrent, 3 h/night, 30 nights)

| Path | Billable requests/month | Approx. cost |
|---|---|---|
| Polling at 4s (don't) | ~405 M Worker + ~405 M DO | ~$120 + ~$60 + CPU |
| WebSockets w/ hibernation | ~1 M (20:1 incoming) + ~9 M HTTP (joins, lobbies, images, typeahead misses) | inside the $5 plan, or low tens of dollars with generous assumptions |

The DO tier is not what costs money at this scale; **typeahead, images
and question assembly** are, if they still touch D1/R2 per request.

### 5b. Get D1 out of the interactive path entirely

- **Typeahead as static indexes**: clubs (tier 1) and the full player
  list (~300 KB gz, loaded once and cached forever) served as assets;
  D1 is then only queried when *grading* a guess -- one indexed lookup
  per answer, which 25 B included reads covers indefinitely.
- **Question/grid assembly at `/start`** does several D1 queries per
  game. At thousands of games an hour, precompute: build each Club Run /
  Teammate Tell question's public JSON and each competition's tile set
  at content-build time (the same offline scripts that build the
  question tables), store them in KV or as assets, and have `/start`
  read one blob. Grading stays server-side and unchanged.
- If reads *must* stay live, D1's **read replication (Sessions API)**
  serves them from a replica near the object; it exists for exactly
  this, but with the two steps above it shouldn't be needed.

### 5c. Images at the edge

`/api/media/*` sets `Cache-Control: max-age=86400` for the *browser*; at
thousands of first-time visitors that's still one R2 read each. Add the
**edge Cache API** (or a `cf: { cacheEverything }` fetch through the
Worker's own zone) so each image is read from R2 once per edge location,
not once per browser; mark keys immutable with a long max-age (they're
content-addressed by entity id; a badge swap changes the key). R2 Class B
reads are $0.36/M -- not expensive, just unnecessary.

### 5d. Protect the shared things

- **Rate Limiting binding per player** (tier 1) plus a per-IP backstop
  for the unauthenticated routes (`/sessions` create, `/join`), so a
  script can't mint sessions or spray joins. Session codes are a 1.07 B
  space -- brute force isn't a concern, volume is.
- **Bound per-session growth**: cap players (already 8), feed (already
  300 -> becomes rows), and chat rate (already 30 s). Add a session TTL
  (`ctx.storage.setAlarm` to delete an object untouched for 24 h) so
  abandoned games don't accumulate storage forever -- today they do.
- **Ready gates and give-up resolution** already skip "away" players;
  with sockets, "away" is immediate, which makes those gates faster,
  not slower.

### 5e. Latency across geographies

A session's object lives where it was created (near the host). Players
elsewhere pay a round trip to it -- 50-150 ms intercontinental. With
sockets that's a one-off per action, not per poll, and it's inherent to
"one authoritative object per game"; it is not a bottleneck, just a
fact to state in the UI copy if it's ever noticed.

### 5f. Load-test before believing any of this

Write `scripts/loadtest.ts`: N simulated players (host creates, N-1
join, all ready, start; then each player guesses/claims on a realistic
cadence with the typeahead debounce modelled) against a **separate
staging Worker** (`wrangler deploy --env staging`, its own DO namespace
and a copy of D1 -- never the production object namespace). Run at 50,
500, 5,000 and read the dashboard: p99 latency per route, CPU per
request, DO duration, error rate. The numbers in this doc are
arithmetic; those will be measurements.

## 6. Order of work, with the trigger for each

| Step | Do it when | Cost/size |
|---|---|---|
| ~~Rate Limiting binding; per-player keys; remove `DAILY_REQUEST_BUDGET` (3a)~~ | **Done 2026-09-14** | -- |
| ~~`?v=` unchanged-poll replies (3b)~~ | **Done 2026-09-14** | -- |
| ~~Club typeahead fetched once, filtered in the browser; other typeahead responses edge-cached (3c)~~ | **Done 2026-09-14** | -- |
| ~~Session TTL alarm (5d)~~ | **Done 2026-09-14** -- 24h untouched, deleted by the object's own alarm | -- |
| Workers Paid + Budget Alert (4a, 4e) | When any free daily limit is hit once, or before advertising the game | $5/mo |
| WebSockets + hibernation (4b) | Before "hundreds" -- when >~30 concurrent is normal, or when lock/release lag is complained about again | the one real project (~days) |
| SQL storage in the object (4c) | With 4b | medium |
| Precomputed question/tile blobs; static player index (5b) | When D1 shows up in the bill or in p99s | medium |
| ~~Edge image cache (5c)~~ | **Done 2026-09-14** -- once per location per day, not per browser | -- |
| Load test (5f) | Before each of the above tiers is declared done | medium |

## 7. What to leave alone

- **One Durable Object per session.** It's why this scales horizontally
  at all. Don't introduce a global coordinator.
- **Server-authoritative grading and hint gating.** The client never
  sees an answer it hasn't earned; every optimisation above keeps that.
- **Materialised `category_answers`, `content_version` cache keys, the
  `since=` feed cursor, the heartbeat throttle.** All already the right
  shape; they just need the transport underneath them to change.

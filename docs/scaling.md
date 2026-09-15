# Scaling remote play: where the bottlenecks are, and how to get to tens, hundreds, thousands

Written 2026-09-14 against the code as of that date; last checked
against the code 2026-09-15. Numbers marked
*measured* were taken from the running app; Cloudflare limits and prices
were read from the official pricing/limits pages the same day -- re-check
them before spending money, they change.

**Short version.** The architecture is already the right shape for scale
(one Durable Object per session, server-authoritative, static assets
free). As first written, the *free tier plus polling* capped it at
roughly **an evening for a few dozen players**, and the very first thing
that failed was a self-imposed guardrail, not Cloudflare. **Status
2026-09-14: tiers 1 and 2 are done** -- the guardrails are off the hot
path, the session lives in the object's SQLite tables, and clients hold
a WebSocket instead of polling (§4b/§4c). What remains is paying the
$5/month when a free daily limit is first hit, and the tier-3 items
(§5). Nothing needs a different database or a second service at any of
these tiers.

---

## 1. What one player costs today

Everything a client does is one of four things. Per **active remote
player**, per hour, **as deployed after the tier-1 and tier-2 work of
2026-09-14** (the "before" figures are kept in brackets because they
explain the ceilings in §2):

| Activity | Frequency | Worker requests | Durable Object | D1 | Notes |
|---|---|---|---|---|---|
| **WebSocket** (the live channel) | 1 upgrade per connect; a 25s keep-alive ping (144/h, billed 20:1 = ~7 requests/h) | 1 per connect | 1 request per connect; pings are auto-answered by the runtime without waking the object and double as presence; **pushes out are free**; the object hibernates between events -- nothing wakes it on a timer to check presence | none | replaces polling entirely while the socket is up. A push is only sent to a socket that hasn't got that exact state (per-socket fingerprint), ~1.5 KB round formats / ~10 KB a Roll of Honour grid change. |
| **Poll `/state`** (fallback only, socket down) | 4s / 1.5s (Roll of Honour) while disconnected | 1 each | 1 request, no storage reads (in-memory copy), ≤1 heartbeat row per 3s | none | reply *measured* **33 bytes** when nothing changed (`?v=` fingerprint). [Before sockets: 900-2,400 of these an hour per player, every hour connected -- the whole cost.] |
| **Action** (guess, claim, answer, give up, chat, ready) | maybe 20-60/h | 1 each | 1 request, no storage reads, **1-2 rows written** (the changed player / tile, plus one feed row) | up to 3 indexed reads (grading), **no writes** | [Before: the whole ~60 KB session record rewritten per action; +1 D1 write for the daily budget counter.] Rate-limited per player in memory at the edge (`lib/rateLimits.ts`). |
| **Typeahead keystroke** (≥3 chars, 200ms debounce) | maybe 60-200/h | Roll of Honour: **0**; Club Run / Teammate Tell: 1 each | none | Roll of Honour: **none** (the ~700-club list is fetched once, ~36 KB raw, edge-cached, filtered in the browser); others: a bounded FTS read | [Before: +2 D1 writes per keystroke for the budget counter and per-IP limiter.] |

What stands out now:

- **Cost scales with things happening, not time connected.** A player
  sitting in a lobby or on a reveal costs nothing until someone acts;
  the object hibernates with the sockets held by the runtime. Before
  tier 2, a connected player was 900-2,400 requests an hour whether or
  not anything happened.
- **The clock still needs a tick, but only mid-game.** Hint tiers, lock
  expiry and the reveal hold used to be noticed by whichever poll came
  next; the object now books an alarm for the earliest of them and
  pushes from there. That's one alarm write per state change while a
  game is in progress -- small. A lobby or results screen books nothing
  but its expiry, however many players are connected. Presence is never
  swept: the one presence alarm is for a gate held up by a player who
  has gone quiet (§4b).
- **Storage per action is rows, not records.** save() diffs the in-memory
  copy against what was last written; a guess touches the guesser's row
  and a feed row, a lock touches one tile row.

The daily game (Top 10) is different: it doesn't poll, but it **writes to
KV on every guess** (`guess.ts` -> `saveProgress`) plus 2-3 writes on
completion. A 10-answer round is ~12-15 KV writes.

## 2. The ceilings, in the order they'll be hit

All free-tier limits are **per account per day**, shared with the other
projects on this account (see `agents.md` -> Cloudflare resources).

| # | Ceiling | Value | What hits it first | Roughly when |
|---|---|---|---|---|
| ~~1~~ | ~~**`DAILY_REQUEST_BUDGET`** (ours)~~ **Removed 2026-09-14** | was 20,000 non-poll API requests/day, then 503 until midnight UTC | was: typeahead, ~20 suggest calls per attempted answer | was **~500-1,000 answered questions/day across everyone** -- the first wall. Replaced by the per-player and global Rate Limiting bindings (`lib/rateLimits.ts`), which count nothing in D1. |
| ~~2~~ | ~~**Worker requests** (Cloudflare free)~~ **No longer driven by polling (2026-09-14)** | 100,000/day | was: polling, ~110 player-hours/day at 4s | Now one request per connect plus actions (maybe 20-60/h/player) and images/typeahead misses -- **thousands of player-hours/day**. The fallback poll only runs while a socket is down. |
| ~~3~~ | ~~**Durable Object requests** (free)~~ **Same** | 100,000/day | was: one DO request per poll | Incoming socket messages bill 20:1; pushes out are free. Same order as #2. |
| ~~4~~ | ~~**Durable Object rows written** (free)~~ **Off the per-poll path** | 100,000/day | was: heartbeats (1,200/h/player) + whole-record rewrites | Now 1-2 rows per action plus an alarm write per mid-game state change -- **tens of thousands of actions/day**. |
| ~~5~~ | ~~**D1 rows written** (free)~~ **No longer on the hot path** | 100,000/day | was: the budget counter + rate limiter, 1-2 per action/keystroke | Gameplay now writes nothing to D1 per request; the only D1 writes left are the nightly rebuild and content changes. |
| ~~6~~ | ~~**Suggest rate limit** (ours, per IP)~~ **Re-keyed 2026-09-14** | now 60 typeahead calls/min **per player** (token, else a device cookie minted on first contact) | was: a whole room on one Wi-Fi sharing one 30/min bucket | A venue no longer shares a bucket. Roll of Honour typeahead makes no requests at all. |
| 7 | **KV writes** (free) | 1,000/day | The daily game's per-guess write | **~70 completed Top 10 rounds/day**, app-wide |
| 8 | **Worker CPU** (free) | 10 ms per request | A Roll of Honour broadcast (serialise ~10 KB per socket) is the heaviest step at ~1-3 ms | not yet |
| 9 | D1 rows read (free) | 5,000,000/day | Typeahead FTS reads (bounded, tens of rows each) | well beyond hundreds of players |
| 10 | Per-object throughput | soft 1,000 req/s per Durable Object | An 8-player session is a few requests a second at its busiest (actions + pushes); idle it is zero | never, by design -- sessions are the unit of scale |

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

**Done 2026-09-14.** Each session object accepts one WebSocket per player
(`GET /api/remote/sessions/:code/ws?token=`) and **pushes** state on
change instead of answering polls. This is the intended Durable Objects
pattern and the billing is built for it:

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
skew -- kept for now, they're also what lets every device count down
together). `/state` stays as the fallback for a client whose socket is
down, at the old cadences, and a client whose socket drops after it had
been delivering re-polls once to cover the gap.

How it was built (all in `remoteGameSession.ts`, "WebSockets" section):
- Hibernation API throughout: `ctx.acceptWebSocket` tagged with the
  player id, `serializeAttachment` holding which player / last feed id
  sent / last fingerprint sent, `webSocketClose`/`webSocketError`
  handlers; `setWebSocketAutoResponse("ping" -> "pong")` so the client's
  25s keep-alive never wakes the object.
- A push goes out after any request that wrote (save() flags it, a Hono
  middleware broadcasts), and from the **alarm** for clock-driven changes
  -- the object books the earliest of: next hint tier, next lock expiry,
  reveal hold closing, the daily expiry check -- and, the one presence
  case the clock alone must settle, a gate that everyone present has
  satisfied except a player who has gone quiet (their presence deadline).
  There is deliberately **no periodic presence sweep**: an idle connected
  lobby wakes the object zero times; away badges refresh on the next
  push, and "away" is evaluated whenever anything else happens.
- Presence: a player is present while their socket keeps **pinging** --
  the runtime records when it last auto-answered a ping
  (`getWebSocketAutoResponseTimestamp`) -- or while they poll. An open
  socket alone is NOT presence: a phone that loses signal never sends a
  close frame, so its socket looks open for minutes (found by the offline
  e2e test, 2026-09-15). Away is 60s after the last ping (two missed 25s
  pings plus slack) or 15s after the last poll. A socket silent for 120s
  is closed by the next broadcast. Faster detection would need more
  pings or timer wakes; a dropped connection is an edge case that needs
  handling, not speed, so neither is spent on it.
- Idle players (2026-09-15) cost nothing: the client disconnects when
  its tab has been hidden for 30s (a quick app switch or auto-lock stays
  connected -- otherwise each was a reconnect and a full push) and
  reconnects when visible (one upgrade request per cycle instead of
  pings all night), pauses after 10 minutes without a tap, scroll or
  pointer movement ("Still there?"), and the object drops anyone unseen
  for 30 minutes (`IDLE_REMOVE_MS`) **lazily**, on the next request or
  tick -- no alarm of its own. An idle host outside a live game ends
  the session; mid-game the host is kept so the others can finish. So a
  session everyone has walked away from is hibernating storage until
  its expiry -- 24h, or 1h once it has ended or emptied -- and nothing
  else.
- The client (`useRemoteSession.ts`) applies a push exactly as it did a
  poll body; the poll loop stands down while the socket is open;
  reconnect backs off 1s -> 30s (attempts while offline fail in the
  browser and reach no server); two unanswered pings, or the browser's
  `online` event, drop a dead socket and reconnect. A socket that had
  been delivering re-polls once on close to fill the gap; one that never
  opened doesn't, so a bad connection adds no requests beyond the
  fallback poll. Close codes 4404/4410 mean what a poll's 404/401 did.
- Tested: `test/integration/remoteSessionSocket.test.ts` (initial push,
  another player's action, incremental feed, leave closes with 4410, the
  alarm booked for the first hint tier and nothing earlier, `since=`
  resume), `remoteSessionIdle.test.ts` (the lazy drop, host rules) and
  `remoteSessionExpiry.test.ts` (24h / 1h expiry); the e2e suite
  runs on the socket through the Vite dev server, and the `@slow`
  Playwright project (`test/e2e/remoteReconnect.spec.ts`, `npm run
  test:e2e:slow`) covers a device dropping offline mid-game (the round
  the others gave up on resolving without them, catching up on
  reconnect), a socket that keeps failing (poll fallback, still present),
  and a refresh mid-game.

### 4c. Storage shape inside the object

**Done 2026-09-14.** A session used to be **two KV values** (`session`,
`players`), the `session` value carrying the grid *and* the 300-entry
activity feed -- ~60 KB rewritten in full on every guess, against the KV
backend's **128 KiB** value cap. It is now five **SQLite tables**
(`session` core, `questions`, `players`, `tiles`, `feed`), one row per
player / tile / feed entry. The object keeps the records in memory as
the working copy (loaded once per wake) and `save()` writes only the
rows whose JSON changed, so a guess is 1-2 row writes and a poll reads
no storage at all. Sessions persisted the old way are migrated on first
read. Tested in `test/integration/remoteSessionStorage.test.ts`.

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
(4c) were the prerequisites and are in; the remaining work is taking
everything else off the per-request database path and preparing to be
surprised.

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

**Done 2026-09-14** (pulled forward from this tier because it was
cheap). `/api/media/*` set `Cache-Control: max-age=86400` for the
*browser* only; at thousands of first-time visitors that was still one
R2 read each. It now also goes through the **edge Cache API**
(`caches.default` in `routes/media.ts`), so each image is read from R2
once per edge location per day, not once per browser. Keys are NOT
marked immutable: a badge can be re-uploaded under the same entity id,
so a one-day edge TTL is the trade. R2 Class B reads are $0.36/M -- not
expensive, just unnecessary.

### 5d. Protect the shared things

- **Rate Limiting binding per player** (tier 1, done) covers the
  unauthenticated routes too: a request with no player token is keyed
  on a device cookie minted on first contact, and a global 3,000/min
  bucket backstops everything. What's missing for a determined script
  is a per-IP limit on `/sessions` create and `/join` specifically
  (a cookie is trivially discarded); add it if session minting is ever
  abused. Session codes are a 1.07 B space -- brute force isn't a
  concern, volume is.
- **Bound per-session growth**: cap players (already 8), feed (already
  300, one row each), and chat rate (already 30 s). Session TTL: done
  (24 h untouched, 1 h once ended or emptied, §6).
- **Ready gates and give-up resolution** already skip "away" players.
  With sockets "away" is 60 s after the last keep-alive ping (or 15 s
  after the last poll), and a gate held up only by a quiet player is
  re-checked by a one-off alarm at that deadline -- so a dropped
  connection can delay a round by about a minute, never hang it.

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
| ~~Session TTL alarm (5d)~~ | **Done 2026-09-14** -- 24h untouched (1h once ended/emptied), deleted by the object's own alarm | -- |
| Workers Paid + Budget Alert (4a, 4e) | When any free daily limit is hit once, or before advertising the game | $5/mo |
| ~~WebSockets + hibernation (4b)~~ | **Done 2026-09-14** -- push on change, alarm for clock-driven changes, `/state` poll as fallback | -- |
| ~~SQL storage in the object (4c)~~ | **Done 2026-09-14** -- five tables, in-memory working copy, diffed writes | -- |
| Precomputed question/tile blobs; static player index (5b) | When D1 shows up in the bill or in p99s | medium |
| ~~Edge image cache (5c)~~ | **Done 2026-09-14** -- once per location per day, not per browser | -- |
| Load test (5f) | Before each of the above tiers is declared done | medium |

## 7. What to leave alone

- **One Durable Object per session.** It's why this scales horizontally
  at all. Don't introduce a global coordinator.
- **Server-authoritative grading and hint gating.** The client never
  sees an answer it hasn't earned; every optimisation above keeps that.
- **Materialised `category_answers`, `content_version` cache keys, the
  `since=` feed cursor, the per-socket fingerprint, the heartbeat
  throttle on the fallback poll.** All the right shape; the transport
  changed underneath them without touching any of them.
- **The 25 s ping and the lazy idle drop.** Both are the minimum that
  handles a dropped or idle player at all; tightening either means
  more pings or timer wakes for an edge case (see §4b).

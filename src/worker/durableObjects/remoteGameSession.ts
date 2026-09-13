import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

// The authoritative session for one "remote" multiplayer game -- players
// on their own devices, as opposed to the existing pass-and-play mode
// (multiplayer/state.ts) where the whole game lives as plain client
// state on one shared device. A Durable Object is the right fit here for
// one specific reason: "first correct guess wins" needs an atomic
// check-and-set, and a DO processes every request to one instance
// strictly one-at-a-time, so that's just a plain in-memory/SQLite check
// inside a single request handler -- no separate distributed lock needed
// the way a naive D1-only approach would (two players' guesses landing
// within milliseconds of each other could otherwise both read
// "unanswered" before either writes back).
//
// SQLite-backed (`new_sqlite_classes` in wrangler.json's migrations, not
// the older key-value backend) -- the modern, recommended storage
// backend, and the ONLY one available on the Workers Free plan. Confirmed
// during this feature's design (2026-09-13, via Cloudflare's own current
// docs, not assumed from memory) that Durable Objects themselves are
// free-tier compatible too, with limits comparable to D1's own: 100,000
// requests/day, 13,000 GB-s duration/day, 5M SQLite rows read/day,
// 100,000 rows written/day, 5GB total storage -- Cloudflare's own
// changelog for that April 2025 announcement names "real-time
// applications like chat or multiplayer games" as the intended use case.
//
// Design decisions locked in before any of this was written (see the
// conversation this was built from -- not repeated in full here, only
// the parts that shape this specific class):
//   - Clients POLL a /state endpoint every 4s -- no WebSockets. A few
//     seconds of UI lag doesn't affect fairness, since the server (this
//     class), not the client, decides who won each question.
//   - A player is "away" after 15s of silence (~3 missed polls); both
//     "everyone ready" and "everyone next-question" gates only wait on
//     non-away players. The host can also remove a player outright.
//   - Wrong guesses cost nothing -- unlimited attempts, a pure race on
//     the first correct one.
//   - Hints are shared and automatic: every 30s with no correct answer,
//     the next hint tier reveals for everyone at once (reusing
//     clubBadgesState.ts's own HINT_KEYS order) -- not player-triggered,
//     not point-costing.
//   - Scoring is a simple win count.
//   - The host picks how many questions the game has, once, at start.
//
// This class owns nothing but routing HTTP-shaped requests into its own
// state -- see src/worker/lib/ for anything that could conceivably be
// unit-tested in isolation (session code/token generation, etc.) rather
// than needing a real Durable Object instance to exercise.
export class RemoteGameSession extends DurableObject<Env> {
	private readonly app: Hono;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.app = new Hono();
		// Placeholder only -- proves the binding/migration actually work
		// end to end before any real session logic exists (see this
		// feature's own task list: "deployed and reachable, no game logic
		// yet"). Replaced by the real create/join/state/etc. routes as
		// those get built.
		this.app.get("/", (c) => c.json({ ok: true }));
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}
}

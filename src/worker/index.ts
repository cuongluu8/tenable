import { Hono } from "hono";
import { enforceCircuitBreaker } from "./lib/circuitBreaker";
import { rebuildAll } from "./lib/rebuild";
import categories from "./routes/categories";
import category from "./routes/category";
import clubBadges from "./routes/clubBadges";
import giveUp from "./routes/giveUp";
import guess from "./routes/guess";
import media from "./routes/media";
import mediaAudit from "./routes/mediaAudit";
import multiplayer from "./routes/multiplayer";
import reset from "./routes/reset";
import reveal from "./routes/reveal";
import stats from "./routes/stats";
import suggest from "./routes/suggest";
import teammates from "./routes/teammates";

const app = new Hono<{ Bindings: Env }>();

// Cost guardrail, applied ahead of every route — see circuitBreaker.ts.
app.use("/api/*", enforceCircuitBreaker);

app.route("/api/categories", categories);
app.route("/api/categories", category);
app.route("/api/club-badges", clubBadges);
app.route("/api/give-up", giveUp);
app.route("/api/guess", guess);
app.route("/api/media", media);
app.route("/api/multiplayer", multiplayer);
app.route("/api/reset", reset);
app.route("/api/reveal", reveal);
app.route("/api/stats", stats);
app.route("/api/suggest", suggest);
app.route("/api/teammates", teammates);

// Unlisted admin page, no link to it anywhere in the app nav — see
// mediaAudit.ts. Mounted under /api/* (not e.g. /admin/media-audit)
// specifically because it has to be — this project's static-assets config
// (wrangler.json's `not_found_handling: "single-page-application"`) serves
// the client SPA's index.html for any unmatched path OUTSIDE /api/*, so a
// route mounted elsewhere never actually reaches this Worker at all (found
// the hard way: it deployed fine, existed in the bundle, and still 404'd
// into the homepage). enforceCircuitBreaker applying here too is harmless
// for an occasional manual page load.
app.route("/api/admin/media-audit", mediaAudit);

export default {
	fetch: app.fetch,
	// Nightly (see wrangler.json's triggers.crons): recompute every
	// category's materialized Top N from whatever entity_stats now holds,
	// and bump content_version so the Cache API layer (responseCache.ts)
	// picks up the change on the next request instead of serving a stale
	// cached list. See rebuild.ts for why this is a scheduled job rather
	// than computed live on every request.
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(rebuildAll(env.DB).then(({ categoriesRebuilt }) => {
			console.log(`scheduled rebuild: ${categoriesRebuilt} categories`);
		}));
	},
};

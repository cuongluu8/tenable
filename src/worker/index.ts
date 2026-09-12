import { Hono } from "hono";
import { enforceCircuitBreaker } from "./lib/circuitBreaker";
import { refreshEplTicker } from "./lib/eplTicker";
import { rebuildAll } from "./lib/rebuild";
import adminRefreshTicker from "./routes/adminRefreshTicker";
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
import ticker from "./routes/ticker";

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
app.route("/api/ticker", ticker);

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
// Same "unlisted admin action" reasoning as media-audit.ts above -- see
// adminRefreshTicker.ts's own doc for what it's for.
app.route("/api/admin/refresh-ticker", adminRefreshTicker);

export default {
	fetch: app.fetch,
	// Two independent cron schedules land here (see wrangler.json's
	// triggers.crons) -- event.cron tells them apart rather than needing
	// two separate exported handlers, which Cloudflare doesn't support
	// anyway (one `scheduled` per Worker).
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		if (event.cron === "0 3 * * *") {
			// Nightly: recompute every category's materialized Top N from
			// whatever entity_stats now holds, and bump content_version so
			// the Cache API layer (responseCache.ts) picks up the change on
			// the next request instead of serving a stale cached list. See
			// rebuild.ts for why this is a scheduled job rather than
			// computed live on every request.
			ctx.waitUntil(
				rebuildAll(env.DB).then(({ categoriesRebuilt }) => {
					console.log(`scheduled rebuild: ${categoriesRebuilt} categories`);
				}),
			);
		} else if (event.cron === "*/15 * * * *") {
			// Every 15 minutes: refresh the ticker's Premier League scores --
			// see lib/eplTicker.ts.
			ctx.waitUntil(refreshEplTicker(env.PROGRESS, env.FOOTBALL_DATA_API_KEY));
		} else {
			console.error(`scheduled: unrecognized cron "${event.cron}" -- no handler wired up for it`);
		}
	},
};

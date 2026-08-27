import type { Context, MiddlewareHandler } from "hono";

// Hard, app-level ceiling on total requests handled per day, independent of
// (and on top of) whatever the Cloudflare plan's own included usage is. See
// agents.md: Cloudflare has no account-wide spending cap for Workers/D1/KV
// (confirmed 2026-08-27) — on the free plan, exceeding a product's
// daily/monthly quota just fails the request; on a paid plan, the same
// overage is metered and billed with no ceiling of its own. This makes the
// app fail closed at a self-chosen number well inside every product's
// included allotment, instead of letting Cloudflare's own metering run
// unbounded on a paid plan.
//
// Deliberately a *daily* count, not per-minute — the goal is "stop before a
// bad day costs money," not to shape normal traffic (that's
// suggestRateLimit.ts's job, for the one endpoint that scales with
// keystrokes rather than deliberate plays). 20,000/day is comfortably above
// anything this hobby-scale app sees organically, and configurable via the
// DAILY_REQUEST_BUDGET var (wrangler.json) if real traffic ever approaches
// it — raise it deliberately, don't just delete the guardrail.
const DEFAULT_DAILY_REQUEST_BUDGET = 20_000;

function todayUtc(): string {
	return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export const enforceCircuitBreaker: MiddlewareHandler<{ Bindings: Env }> = async (
	c: Context<{ Bindings: Env }>,
	next,
) => {
	const budget = Number(c.env.DAILY_REQUEST_BUDGET) || DEFAULT_DAILY_REQUEST_BUDGET;
	const date = todayUtc();

	let count: number;
	try {
		const row = await c.env.DB.prepare(
			`INSERT INTO request_budget (date, count) VALUES (?1, 1)
			 ON CONFLICT(date) DO UPDATE SET count = count + 1
			 RETURNING count`,
		)
			.bind(date)
			.first<{ count: number }>();
		count = row?.count ?? 0;
	} catch {
		// If the budget table itself can't be reached, D1 is already down —
		// every route needs it too, so there's nothing this middleware can
		// protect by also failing here. Let the request through and let the
		// route's own D1 call surface the real error.
		return next();
	}

	if (count > budget) {
		return c.json(
			{ error: "This app has reached its daily request budget. Please try again tomorrow." },
			503,
		);
	}

	return next();
};

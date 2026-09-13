// E6: the scrolling ticker banner (components/Ticker.tsx) -- hidden when
// /api/ticker has nothing to show (the real state for local dev, with no
// FOOTBALL_DATA_API_KEY secret or cron ever having run), and visible with
// the right text once it does. The "has a message" case is tested by
// intercepting the network request rather than needing a real
// football-data.org call or a live TICKER_MESSAGE override for just one
// test -- see eplTicker.ts's own integration tests (mocked fetch) for
// where the real message-building logic is actually exercised.
import { expect, test } from "@playwright/test";

test("hidden when there's nothing to show", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator(".ticker")).toHaveCount(0);
});

test("shows the message once one is available", async ({ page }) => {
	await page.route("**/api/ticker", (route) => route.fulfill({ json: { message: "FT: Arsenal 2-1 Chelsea" } }));
	await page.goto("/");
	await expect(page.locator(".ticker")).toBeVisible();
	await expect(page.locator(".ticker")).toHaveText("FT: Arsenal 2-1 Chelsea");
});

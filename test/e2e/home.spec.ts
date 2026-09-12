// First e2e test, also serving as the smoke test that Playwright's harness
// (Phase A) actually works: a real browser loading the real dev server.
import { expect, test } from "@playwright/test";

test("home screen offers Single player and Multiplayer", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Top-10 Tension" })).toBeVisible();
	await expect(page.getByRole("button", { name: /Single player/ })).toBeVisible();
	await expect(page.getByRole("button", { name: /Multiplayer/ })).toBeVisible();
});

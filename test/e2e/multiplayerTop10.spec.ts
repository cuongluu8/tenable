// E4: multiplayer pass-and-play, Top 10 trivia game type -- roster, pass
// turns until both players are out of lives (deterministic, no need to
// guess a real answer), result screen.
import { expect, test } from "@playwright/test";

test("play a Top 10 trivia round through to the result screen", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Multiplayer/ }).click();

	await page.getByLabel("Add player").fill("Alice");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByLabel("Add player").fill("Bob");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Next: choose a category" }).click();

	// Not exact: true -- see clubRunSets.spec.ts's own note on why (this
	// button's accessible name includes its descriptive subtitle too).
	await page.getByRole("button", { name: "Top 10 trivia" }).click();

	await page.locator(".category-section__header").first().click();
	await page.locator(".category-card__select").first().click();
	await page.getByRole("button", { name: "Start Game" }).click();

	// 3 lives each (STARTING_LIVES, multiplayer/state.ts) -- 6 passes total
	// exhausts both players regardless of what the category's real answers
	// are.
	for (let i = 0; i < 6; i++) {
		await page.getByRole("button", { name: "Pass turn (costs a life)" }).click();
	}

	await expect(page.getByRole("heading", { name: "💀 Everyone's out of lives" })).toBeVisible();
	await page.getByRole("button", { name: "New game" }).click();
	await expect(page.getByRole("button", { name: "Next: choose a category" })).toBeVisible();
});

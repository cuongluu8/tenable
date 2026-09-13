// E5: multiplayer pass-and-play, Club Run game type -- roster, a random
// round (not a curated Set, to avoid any dependency on which Sets exist),
// played through via "Give up" (see helpers.ts) to the result screen.
import { expect, test } from "@playwright/test";
import { giveUpUntilRoundOver } from "./helpers";

test("play a Club Run random round through to the result screen", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Multiplayer/ }).click();

	await page.getByLabel("Add player").fill("Alice");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByLabel("Add player").fill("Bob");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Next: choose a category" }).click();

	// Not exact: true -- see clubRunSets.spec.ts's own note on why.
	await page.getByRole("button", { name: "Club Run" }).click();

	await page.getByRole("button", { name: "🎲 Random round" }).click();
	await page.getByRole("button", { name: "Start Game" }).click();

	await giveUpUntilRoundOver(page);
	await expect(page.getByRole("heading", { name: "🏁 Round over" })).toBeVisible();

	// RoundResultScreen's own exit button, distinct from MultiplayerResult's
	// "New game" (the Top 10 game type's own result screen, a different
	// component) -- both end up calling Multiplayer.tsx's resetGame either
	// way.
	await page.getByRole("button", { name: "← Back" }).click();
	await expect(page.getByRole("button", { name: "Next: choose a category" })).toBeVisible();
});

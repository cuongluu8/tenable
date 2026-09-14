// Multiplayer pass-and-play, Teammate Tell game type -- roster, a random
// round (not a curated Set, to avoid any dependency on which Sets exist),
// the clue cards in place of a badge chain, played through via "Give up"
// (see helpers.ts) to the result screen. Mirrors multiplayerClubRun.spec.ts.
import { expect, test } from "@playwright/test";
import { giveUpUntilRoundOver } from "./helpers";

test("play a Teammate Tell random round through to the result screen", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Multiplayer/ }).click();

	await page.getByLabel("Add player").fill("Alice");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByLabel("Add player").fill("Bob");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Next: choose a category" }).click();

	await page.getByRole("button", { name: /Teammate Tell/ }).click();
	await page.getByRole("button", { name: "🎲 Random round" }).click();
	await page.getByRole("button", { name: "Start Game" }).click();

	// Teammate Tell's clue list, not Club Run's badge chain.
	await expect(page.getByText("I played with…")).toBeVisible();
	await expect(page.locator(".tm-clue__name").first()).toBeVisible();
	await expect(page.locator(".cb-badges")).toHaveCount(0);
	await expect(page.getByText(/Alice's turn/)).toBeVisible();

	// The hint button reveals the club into each card without changing the turn.
	await page.getByRole("button", { name: "💡 Hint" }).click();
	await expect(page.locator(".tm-clue__meta").first()).toBeVisible();

	await giveUpUntilRoundOver(page);
	await expect(page.getByRole("heading", { name: "🏁 Round over" })).toBeVisible();

	await page.getByRole("button", { name: "← Back" }).click();
	await expect(page.getByRole("button", { name: "Next: choose a category" })).toBeVisible();
});

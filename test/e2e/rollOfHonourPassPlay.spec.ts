// Multiplayer pass-and-play, Roll of Honour: roster, game type, competition,
// then turns -- a wrong answer passing the turn, a right one claiming the
// tile in that player's colour, skipping, and the group giving up to the
// standings and revealed roll.
import { expect, test } from "@playwright/test";

test("two players take turns on the Premier League grid, then give up to the standings", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Multiplayer/ }).click();
	await page.getByLabel("Add player").fill("Ann");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByLabel("Add player").fill("Bob");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Next: choose a category" }).click();
	await page.getByRole("button", { name: /Roll of Honour/ }).click();
	await expect(page.getByRole("heading", { name: "Choose a competition" })).toBeVisible();
	await page.getByRole("button", { name: /Premier League/ }).click();

	await expect(page.getByText("Ann's turn — tap a season")).toBeVisible();
	await expect(page.locator(".mp-players li").first()).toContainText("0 tiles");

	// Ann wrong: the turn passes, nothing on the board changes.
	await page.getByRole("button", { name: "1994-95", exact: true }).click();
	await expect(page.getByRole("dialog", { name: /Ann: who won in 1994-95/ })).toBeVisible();
	await page.getByPlaceholder("Type your guess…").fill("Arsenal");
	await page.getByRole("option", { name: "Arsenal" }).first().click();
	await expect(page.getByText("❌ Not Arsenal")).toBeVisible();
	await expect(page.getByText("Bob's turn — tap a season")).toBeVisible();
	await expect(page.locator(".roh-tile--answered")).toHaveCount(0);

	// Bob right: the tile is his, in his colour, and the turn goes back.
	await page.getByRole("button", { name: "1994-95", exact: true }).click();
	await page.getByPlaceholder("Type your guess…").fill("Blackburn");
	await page.getByRole("option", { name: "Blackburn Rovers" }).click();
	await expect(page.getByText("✅ Bob got 1994-95: Blackburn Rovers")).toBeVisible();
	await expect(page.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeVisible();
	await expect(page.locator(".mp-players li").nth(1)).toContainText("1 tile");
	await expect(page.getByText("Ann's turn — tap a season")).toBeVisible();

	// Skipping passes the turn too.
	await page.getByRole("button", { name: "Skip turn" }).click();
	await expect(page.getByText("Ann passed.")).toBeVisible();
	await expect(page.getByText("Bob's turn — tap a season")).toBeVisible();

	// Closing the modal without answering keeps the turn.
	await page.getByRole("button", { name: "2015-16", exact: true }).click();
	await page.keyboard.press("Escape");
	await page.getByRole("button", { name: "Close" }).click().catch(() => undefined);
	await expect(page.getByText("Bob's turn — tap a season")).toBeVisible();

	// The group gives up: standings by tiles won, the whole roll revealed.
	await page.getByRole("button", { name: "Give up", exact: true }).click();
	await page.getByRole("button", { name: "Yes, end it" }).click();
	await expect(page.getByRole("heading", { name: "Final results" })).toBeVisible();
	await expect(page.locator(".remote-standings__item").first()).toContainText("Bob");
	await expect(page.locator(".remote-standings__item").first()).toContainText("1 tile");
	await expect(page.locator(".remote-standings__item").nth(1)).toContainText("Ann");
	await expect(page.getByRole("button", { name: "2015-16: Leicester City" })).toBeVisible();
	await expect(page.locator(".roh-tile--missed")).toHaveCount(33);

	// Play again starts the wizard over at the roster.
	await page.getByRole("button", { name: "Play again" }).click();
	await expect(page.getByRole("button", { name: "Next: choose a category" })).toBeVisible();
});

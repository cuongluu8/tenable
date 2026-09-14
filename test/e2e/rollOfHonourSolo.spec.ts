// Single player, Roll of Honour: the competition picker, a wrong answer
// costing a life, the country hint, a right answer, progress surviving a
// reload, Give up revealing the roll, Play again resetting, and running
// out of lives.
import { expect, test } from "@playwright/test";

async function openPremierLeague(page: import("@playwright/test").Page): Promise<void> {
	await page.goto("/");
	await page.getByRole("button", { name: /Single player/ }).click();
	await page.getByRole("button", { name: /Roll of Honour/ }).click();
	await expect(page.getByRole("heading", { name: "Roll of Honour" })).toBeVisible();
	await page.getByRole("button", { name: /Premier League/ }).click();
	await expect(page.getByText(/Premier League · \d+ of 34 filled/)).toBeVisible();
}

async function answerSeason(page: import("@playwright/test").Page, season: string, typed: string, option: string): Promise<void> {
	await page.getByRole("button", { name: season, exact: true }).click();
	await expect(page.getByRole("dialog", { name: `Who won in ${season}?` })).toBeVisible();
	await page.getByPlaceholder("Type your guess…").fill(typed);
	await page.getByRole("option", { name: option }).first().click();
}

test("wrong costs a life, hint shows the country, right fills the tile, progress persists, give up reveals, play again resets", async ({ page }) => {
	await openPremierLeague(page);
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "5 of 5 lives remaining");

	await answerSeason(page, "1994-95", "Arsenal", "Arsenal");
	await expect(page.getByText("❌ Not Arsenal")).toBeVisible();
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "4 of 5 lives remaining");
	// The modal stays open so the retry is one pick away.
	await expect(page.getByRole("dialog")).toBeVisible();

	await page.getByRole("button", { name: /Hint: show the country/ }).click();
	await expect(page.getByText("Country: England")).toBeVisible();

	await page.getByPlaceholder("Type your guess…").fill("Blackburn");
	await page.getByRole("option", { name: "Blackburn Rovers" }).click();
	await expect(page.getByRole("dialog")).toBeHidden();
	await expect(page.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeVisible();
	await expect(page.getByText(/1 of 34 filled/)).toBeVisible();

	// A refresh resumes where you were, and the picker shows the game in progress.
	await page.reload();
	await expect(page.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeVisible();
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "4 of 5 lives remaining");
	await page.getByRole("button", { name: "← Competitions" }).click();
	await expect(page.getByText(/In progress: 1 of 34, 4 lives left/)).toBeVisible();
	await page.getByRole("button", { name: /Premier League/ }).click();

	// Give up ends the game and reveals the whole roll, missed seasons muted.
	await page.getByRole("button", { name: "Give up", exact: true }).click();
	await page.getByRole("button", { name: "Yes, give up" }).click();
	await expect(page.getByText("You gave up.")).toBeVisible();
	await expect(page.getByText("1 of 34", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "2015-16: Leicester City" })).toBeVisible();
	await expect(page.locator(".roh-tile--missed")).toHaveCount(33);
	await expect(page.locator(".roh-tile--answered")).toHaveCount(1);

	await page.getByRole("button", { name: "Play again" }).click();
	await expect(page.getByText(/0 of 34 filled/)).toBeVisible();
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "5 of 5 lives remaining");
	await expect(page.locator(".roh-tile--answered")).toHaveCount(0);
});

test("five wrong answers is out of lives, and the roll is revealed", async ({ page }) => {
	await openPremierLeague(page);
	// A fresh game for this test regardless of what the other left behind.
	if (await page.getByRole("button", { name: "Play again" }).isVisible().catch(() => false)) {
		await page.getByRole("button", { name: "Play again" }).click();
	}
	await answerSeason(page, "2015-16", "Arsenal", "Arsenal");
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "4 of 5 lives remaining");
	// The verdict line reads the same each time, so the life count is what
	// shows each wrong answer landed. The fifth ends the game and closes
	// the modal.
	for (let left = 3; left >= 0; left--) {
		await page.getByPlaceholder("Type your guess…").fill("Arsenal");
		await page.getByRole("option", { name: "Arsenal" }).first().click();
		await expect(page.locator(".lives")).toHaveAttribute("aria-label", `${left} of 5 lives remaining`);
	}
	await expect(page.getByText("Out of lives.")).toBeVisible();
	await expect(page.getByRole("dialog")).toBeHidden();
	await expect(page.locator(".lives")).toHaveAttribute("aria-label", "0 of 5 lives remaining");
	await expect(page.getByRole("button", { name: "2015-16: Leicester City" })).toBeVisible();
	await expect(page.getByText("0 of 34", { exact: true })).toBeVisible();
});

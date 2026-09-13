// E3: solo Teammate Tell (Sets) -- mirrors clubRunSets.spec.ts's shape;
// see that file and helpers.ts for why "Give up" rather than a real guess.
import { expect, test } from "@playwright/test";
import { giveUpUntilSetComplete } from "./helpers";

test("play a Teammate Tell set through to completion", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Single player/ }).click();
	// Not exact: true -- see clubRunSets.spec.ts's own note on why.
	await page.getByRole("button", { name: "Teammate Tell" }).click();

	await page.getByRole("button", { name: "Play", exact: true }).first().click();

	await giveUpUntilSetComplete(page);
	await expect(page.getByRole("heading", { name: /^Set \d+: .+ complete!$/ })).toBeVisible();
});

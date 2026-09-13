// E2: solo Club Run -- always Sets mode (GuessThePlayer.tsx, the random-
// round engine, is multiplayer-only -- see that file's own doc). Pick a
// set, play it through to SetCompleteScreen via "Give up" (see
// helpers.ts), then confirm progress persisted after returning to the
// picker.
import { expect, test } from "@playwright/test";
import { giveUpUntilSetComplete } from "./helpers";

test("play a Club Run set through to completion, and progress persists", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Single player/ }).click();
	// Not exact: true -- this button's accessible name also includes its
	// descriptive subtitle span ("Name them from the clubs they've played
	// for"), so an exact match would never find it.
	await page.getByRole("button", { name: "Club Run" }).click();

	// Set picker -- pick the first set's Play button, whatever it's named.
	await page.getByRole("button", { name: "Play", exact: true }).first().click();

	await giveUpUntilSetComplete(page);
	await expect(page.getByRole("heading", { name: /^Set \d+: .+ complete!$/ })).toBeVisible();

	await page.getByRole("button", { name: "← Back to Sets" }).click();
	// Every question in the first set was given up on -- SetsPicker.tsx
	// hides Play/Resume once a set is fully answered, replacing it with an
	// average score and a Share button (see that file's own doc on why).
	// Other sets on the same page are untouched and still show Play, so
	// this checks the FIRST card specifically, not the page as a whole.
	const firstCard = page.locator(".cb-set-card").first();
	await expect(firstCard.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);
	await expect(firstCard.getByRole("button", { name: "Share", exact: true })).toBeVisible();
});

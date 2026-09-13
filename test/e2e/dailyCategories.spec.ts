// E1: solo Daily Categories, full round -> result. Uses "Give up" rather
// than guessing an actual correct answer -- deterministic and robust to
// the real category content changing over time.
import { expect, test } from "@playwright/test";

test("play a category through to the result screen", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Single player/ }).click();
	await page.getByRole("button", { name: /Daily categories/ }).click();

	// Categories are grouped into a collapsed accordion -- open the first
	// section, then pick its first category, whatever it happens to be.
	await page.locator(".category-section__header").first().click();
	await page.locator(".category-card__select").first().click();

	await page.getByRole("button", { name: "Classic" }).click();

	// "Give up" 404s server-side with no progress yet -- progress is only
	// created by the server on the FIRST real guess (see guess.ts's
	// startProgress) -- so one guess (right or wrong, doesn't matter which,
	// classic mode never completes on a single guess either way) has to
	// happen first. The guess box only submits via picking a real
	// suggestion (no free-text submit -- see GuessInput.tsx's own doc), so
	// this picks whichever name comes back first for a common 3-letter
	// prefix (suggest.ts's own MIN_QUERY_LENGTH), not a specific one --
	// "mar" reliably matches at least one real name (Maradona, Marcelo,
	// Mario, ...) across this game's actual content.
	await page.getByRole("combobox", { name: "Type your guess…" }).fill("mar");
	await page.getByRole("option").first().click();

	await page.getByRole("button", { name: "Give up" }).click();
	await page.getByRole("button", { name: "Yes, give up" }).click();

	await expect(page.getByRole("heading", { name: "Round over" })).toBeVisible();
	await expect(page.getByText(/\d+ \/ \d+ found/)).toBeVisible();

	await page.getByRole("button", { name: "More categories" }).click();
	await expect(page.locator(".category-section__header").first()).toBeVisible();
});

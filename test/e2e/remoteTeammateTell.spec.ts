// Remote play, Teammate Tell: the clue cards in place of the badge trail,
// a wrong guess, everyone giving up, the reveal, and a guest leaving from
// the final results.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, giveUpInRound, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(150_000);

test("a one-question Teammate Tell game, then the guest leaves from the results", async ({ browser }) => {
	const host = await newPlayer(browser);
	const guest = await newPlayer(browser);

	const code = await hostCreates(host, "Teammate Tell", "Cuong");
	await expect(host.getByText("Teammate Tell", { exact: true })).toBeVisible();
	await guestJoins(guest, "Teammate Tell", code, "Luka");
	await guestReadies(guest);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);

	await host.getByLabel("Number of questions").fill("1");
	await host.getByRole("button", { name: "Start game" }).click();

	// Names only until a hint tier or the reveal.
	await expect(guest.getByText("I played with…")).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.locator(".tm-clue__name").first()).toBeVisible();
	await expect(guest.locator(".tm-clue__meta")).toHaveCount(0);

	await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await pickGuess(guest, "Lionel Messi", /Messi/);
	await expect(guest.getByText("Not quite -- try again!")).toBeVisible();

	await giveUpInRound(guest);
	await expect(host.locator(".remote-badge--gave-up")).toBeVisible(POLL);
	await expect(host.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await giveUpInRound(host);

	await expect(host.getByText(/Nobody got this one/)).toBeVisible(POLL);
	await expect(guest.getByText(/Nobody got this one/)).toBeVisible(POLL);
	await guest.getByRole("button", { name: "Ready for next question" }).click();

	await expect(host.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_COUNTDOWN);

	// A guest leaving from the results vacates their seat (the host's
	// standings drop them) and lands back at the remote play picker.
	await guest.getByRole("button", { name: "Leave game" }).click();
	await guest.getByRole("button", { name: "Yes, leave" }).click();
	await expect(guest.getByRole("heading", { name: "Remote play" })).toBeVisible();
	await expect(host.locator(".remote-standings__name").filter({ hasText: "Luka" })).toBeHidden(POLL);
});

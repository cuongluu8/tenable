// Remote play, Club Run, two real browsers: lobby and ready-up, the shared
// start countdown, a wrong guess, Give up (one player, then everyone), the
// reveal with its minimum hold, the ready gate into the next question,
// final results, Play again, and the host ending the session.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, giveUpInRound, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(180_000);

test("a two-question Club Run game from lobby to Play again to End game", async ({ browser }) => {
	const host = await newPlayer(browser);
	const guest = await newPlayer(browser);

	const code = await hostCreates(host, "Club Run", "Cuong");
	await guestJoins(guest, "Club Run", code, "Luka");
	await guestReadies(guest);
	await expect(host.getByText("Luka")).toBeVisible(POLL);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);

	await host.getByLabel("Number of questions").fill("2");
	await host.getByRole("button", { name: "Start game" }).click();

	// Everyone sees the same countdown before the question, and nobody can
	// guess during it.
	await expect(host.getByText(/First question in/)).toBeVisible(POLL);
	await expect(guest.getByText(/First question in/)).toBeVisible(POLL);
	await expect(host.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.locator(".remote-round-header").getByText("Question 1 of 2")).toBeVisible();

	// A wrong guess costs nothing and can be repeated.
	await pickGuess(guest, "Lionel Messi", /Messi/);
	await expect(guest.getByText("Not quite -- try again!")).toBeVisible();
	await expect(guest.getByPlaceholder("Type your guess…")).toBeEnabled();

	// One player giving up bows them out; the round stays open for the rest.
	await giveUpInRound(guest);
	await expect(guest.getByText(/You gave up on this one/)).toBeVisible();
	await expect(host.locator(".remote-badge--gave-up")).toBeVisible(POLL);
	await expect(host.getByPlaceholder("Type your guess…")).toBeVisible();

	// Everyone giving up resolves the round with no winner -- the answer is
	// revealed to all, and the ready gate appears.
	await giveUpInRound(host);
	await expect(host.getByText(/Nobody got this one/)).toBeVisible(POLL);
	await expect(guest.getByText(/Nobody got this one/)).toBeVisible(POLL);
	await expect(host.getByText(/Waiting for everyone to be ready/)).toBeVisible();
	await guest.getByRole("button", { name: "Ready for next question" }).click();
	await expect(guest.getByRole("button", { name: "Not ready" })).toBeVisible();

	// The reveal is held for everyone before the next question arrives.
	await expect(host.locator(".remote-round-header").getByText("Question 2 of 2")).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.locator(".remote-round-header").getByText("Question 2 of 2")).toBeVisible(AFTER_COUNTDOWN);

	await expect(host.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await giveUpInRound(host);
	await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await giveUpInRound(guest);
	await expect(guest.getByRole("button", { name: "Ready for next question" })).toBeVisible(POLL);
	await guest.getByRole("button", { name: "Ready for next question" }).click();

	await expect(host.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.getByText(/Waiting for Cuong to start another game/)).toBeVisible();

	// Play again takes everyone back to the lobby, where guests re-ready.
	await host.getByRole("button", { name: "Play again, reset scores" }).click();
	await expect(host.getByRole("heading", { name: "Waiting room" })).toBeVisible();
	await expect(guest.getByRole("heading", { name: "Waiting room" })).toBeVisible(POLL);
	await expect(guest.getByRole("button", { name: "I'm ready" })).toBeVisible();

	// The host ending the session ends it for everyone.
	await host.getByRole("button", { name: "Leave game" }).click();
	await expect(guest.getByRole("heading", { name: "Session ended" })).toBeVisible(POLL);
});

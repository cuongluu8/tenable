// Remote play, the session-level features every game type shares: chat
// (the message on the leaderboard, then gone), a player joining a game
// already in progress, a guest leaving mid-game, and the host ending the
// game for everyone.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer } from "./remoteHelpers";

test.setTimeout(150_000);

test("chat, a mid-game joiner, a guest leaving, and the host ending the game", async ({ browser }) => {
	const host = await newPlayer(browser);
	const guest = await newPlayer(browser);
	const late = await newPlayer(browser);

	const code = await hostCreates(host, "Club Run", "Cuong");
	await guestJoins(guest, "Club Run", code, "Luka");
	await guestReadies(guest);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);
	await host.getByLabel("Number of questions").fill("1");
	await host.getByRole("button", { name: "Start game" }).click();
	await expect(host.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);

	// Chat: the 💬 by your own name opens the composer; the message pops
	// beside the author's name on everyone's leaderboard and scrolls away
	// after its hold, never to return.
	await host.getByRole("button", { name: "Send a message" }).click();
	await host.getByLabel("Chat message").fill("no idea who this is");
	await host.getByRole("button", { name: "Add an emoji" }).click();
	await host.getByRole("button", { name: "😂" }).click();
	await expect(host.getByLabel("Chat message")).toHaveValue("no idea who this is 😂");
	await host.getByRole("button", { name: "Send", exact: true }).click();
	await expect(host.getByRole("dialog")).toBeHidden();
	await expect(guest.locator(".remote-chat__text")).toHaveText("no idea who this is 😂", POLL);
	await expect(host.locator(".remote-chat__text")).toBeVisible();
	// Posting again inside the cooldown is refused.
	await host.getByRole("button", { name: "Send a message" }).click();
	await expect(host.getByPlaceholder(/You can post again in/)).toBeVisible();
	await host.keyboard.press("Escape");
	await expect(guest.locator(".remote-chat__text")).toBeHidden({ timeout: 20_000 });
	await guest.waitForTimeout(4_500); // another poll -- it must not come back
	await expect(guest.locator(".remote-chat__text")).toHaveCount(0);

	// Joining a game already in progress lands straight in the round.
	await guestJoins(late, "Club Run", code, "Geoff");
	await expect(late.getByText("Question 1 of 1")).toBeVisible(POLL);
	await expect(host.getByText("Geoff")).toBeVisible(POLL);

	// A guest leaving mid-game vacates their seat.
	await guest.getByRole("button", { name: "Leave game" }).click();
	await guest.getByRole("button", { name: "Yes, leave" }).click();
	await expect(guest.getByRole("heading", { name: "Remote play" })).toBeVisible();
	await expect(host.getByText("Luka")).toBeHidden(POLL);

	// The host ending the game ends it for everyone still in it.
	await host.getByRole("button", { name: "End game" }).click();
	await host.getByRole("button", { name: "Yes, end game" }).click();
	await expect(late.getByRole("heading", { name: "Session ended" })).toBeVisible(POLL);
	await late.getByRole("button", { name: "Back" }).click();
	await expect(late.getByRole("heading", { name: "Remote play" })).toBeVisible();
});

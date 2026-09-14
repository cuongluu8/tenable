// Remote play, the session-level features every game type shares: chat
// (the message on the leaderboard, then gone), a player joining a game
// already in progress, a guest leaving mid-game, and the host ending the
// game for everyone.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(150_000);
// Phone width: the chat pane is a drawer behind a floating button here
// (from 960px up it's a permanent column with no button -- the other
// remote specs run at the default desktop size and cover that layout).
test.use({ viewport: { width: 390, height: 780 } });

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

	// A guess shows up in everyone's activity history.
	await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
	await pickGuess(guest, "Lionel Messi", /Messi/);

	// Chat lives in the side pane: the floating 💬 opens it, the message
	// posts into the history with the round's events, the other player
	// gets an unread badge, and a new message also pops beside the
	// author's name on the leaderboard and scrolls away, never to return.
	await host.getByRole("button", { name: /Open chat/ }).click();
	await expect(host.getByRole("complementary", { name: "Chat and activity" })).toBeVisible();
	await expect(host.locator(".remote-pane__entry--system").first()).toHaveText("Question 1 of 1");
	await expect(host.locator(".remote-pane__entry--event")).toContainText(/Luka.*✗.*Messi/, POLL);
	await host.getByLabel("Chat message").fill("no idea who this is");
	await host.getByRole("button", { name: "Add an emoji" }).click();
	await host.getByRole("button", { name: "😂" }).click();
	await expect(host.getByLabel("Chat message")).toHaveValue("no idea who this is 😂");
	await host.getByRole("button", { name: "Send", exact: true }).click();
	await expect(host.locator(".remote-pane__bubble")).toHaveText("no idea who this is 😂");
	// Posting again inside the cooldown is refused.
	await expect(host.getByPlaceholder(/You can post again in/)).toBeVisible();
	await host.getByRole("button", { name: "Close chat" }).click();

	await expect(guest.getByRole("button", { name: /Open chat, 1 new message/ })).toBeVisible(POLL);
	await expect(guest.locator(".remote-chat__text")).toHaveText("no idea who this is 😂");
	await guest.getByRole("button", { name: /Open chat/ }).click();
	await expect(guest.locator(".remote-pane__bubble")).toHaveText("no idea who this is 😂");
	await expect(guest.locator(".remote-pane__who").filter({ hasText: "Cuong" }).first()).toBeVisible();
	await guest.getByRole("button", { name: "Close chat" }).click();
	await expect(guest.getByRole("button", { name: "Open chat", exact: true })).toBeVisible();
	await expect(guest.locator(".remote-chat__text")).toBeHidden({ timeout: 20_000 });
	await guest.waitForTimeout(4_500); // another poll -- it must not come back
	await expect(guest.locator(".remote-chat__text")).toHaveCount(0);

	// Joining a game already in progress lands straight in the round.
	await guestJoins(late, "Club Run", code, "Geoff");
	await expect(late.locator(".remote-round-header").getByText("Question 1 of 1")).toBeVisible(POLL);
	await expect(host.getByText("Geoff")).toBeVisible(POLL);

	// A guest leaving mid-game vacates their seat.
	await guest.getByRole("button", { name: "Leave game" }).click();
	await guest.getByRole("button", { name: "Yes, leave" }).click();
	await expect(guest.getByRole("heading", { name: "Remote play" })).toBeVisible();
	await expect(host.locator(".remote-standings__name").filter({ hasText: "Luka" })).toBeHidden(POLL);

	// The host ending the game ends it for everyone still in it.
	await host.getByRole("button", { name: "End game" }).click();
	await host.getByRole("button", { name: "Yes, end game" }).click();
	await expect(late.getByRole("heading", { name: "Session ended" })).toBeVisible(POLL);
	await late.getByRole("button", { name: "Back" }).click();
	await expect(late.getByRole("heading", { name: "Remote play" })).toBeVisible();
});

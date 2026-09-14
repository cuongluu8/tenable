// Remote play, the session-level features every game type shares: chat
// (the message on the leaderboard, then gone), a player joining a game
// already in progress, a guest leaving mid-game, and the host ending the
// game for everyone.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(150_000);
// Phone width: chat is the always-visible bar across the top here (from
// 960px up it's a permanent column -- the other remote specs run at the
// default desktop size and cover that layout).
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

	// Chat is the always-visible bar across the top: the round's events and
	// every guess are already in it, a message posts into it, and the other
	// player sees it on their own bar without doing anything. The ticker is
	// hidden while the game screen is up.
	await expect(host.locator(".ticker")).toBeHidden();
	const hostBar = host.getByRole("complementary", { name: "Chat and activity" });
	await expect(hostBar).toBeVisible();
	await expect(hostBar.locator(".remote-pane__entry--system").first()).toHaveText("Question 1 of 1");
	await expect(hostBar.locator(".remote-pane__entry--event")).toContainText(/Luka.*✗.*Messi/, POLL);
	await host.getByLabel("Chat message").fill("no idea who this is");
	await host.getByRole("button", { name: "Add an emoji" }).click();
	await host.getByRole("button", { name: "😂" }).click();
	await expect(host.getByLabel("Chat message")).toHaveValue("no idea who this is 😂");
	await host.getByRole("button", { name: "Send", exact: true }).click();
	await expect(hostBar.locator(".remote-pane__entry--chat")).toContainText("You: no idea who this is 😂");
	// Posting again inside the cooldown is refused.
	await expect(host.getByPlaceholder(/You can post again in/)).toBeVisible();

	const guestBar = guest.getByRole("complementary", { name: "Chat and activity" });
	await expect(guestBar.locator(".remote-pane__entry--chat")).toContainText("Cuong: no idea who this is 😂", POLL);

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

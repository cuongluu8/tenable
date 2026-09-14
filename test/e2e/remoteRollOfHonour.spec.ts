// Remote play, Roll of Honour: the competition picker in the lobby, the
// grid's start countdown, claiming a season (and what the other player
// sees), a wrong answer freeing the tile and blocking the guesser, the
// other player taking and answering it, switching between held seasons,
// Give up by everyone revealing the full roll, and Play again keeping
// scores into the next game.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(180_000);

test("a Premier League grid: claim, wrong, right, switch, give up, play again keeping scores", async ({ browser }) => {
	const host = await newPlayer(browser);
	const guest = await newPlayer(browser);

	const code = await hostCreates(host, "Roll of Honour", "Cuong");
	await guestJoins(guest, "Roll of Honour", code, "Luka");
	await guestReadies(guest);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);

	await host.getByLabel("Competition").selectOption("premier-league");
	await host.getByRole("button", { name: "Start game" }).click();

	await expect(guest.getByText(/Grid opens in/)).toBeVisible(POLL);
	await expect(guest.getByText("Tap a season to claim it, then name the winner.")).toBeVisible(AFTER_COUNTDOWN);
	await expect(host.getByText("Tap a season to claim it, then name the winner.")).toBeVisible(AFTER_COUNTDOWN);
	await expect(host.getByText(/Premier League · 0 of 34 filled/)).toBeVisible();

	// Guest claims a season: their tile shows the hold countdown, the host
	// sees it locked.
	await guest.getByRole("button", { name: "1994-95" }).click();
	await expect(guest.getByRole("dialog", { name: /Who won in 1994-95/ })).toBeVisible();
	await expect(guest.locator(".roh-tile--mine")).toHaveCount(1);
	await expect(host.locator(".roh-tile--locked")).toHaveCount(1, POLL);

	// Wrong: short verdict, the tile is freed for others, and the guesser
	// is blocked from it for a few seconds (timer on the tile).
	await pickGuess(guest, "Arsenal", "Arsenal");
	await expect(guest.getByText("❌ Not Arsenal")).toBeVisible();
	await expect(guest.locator(".roh-tile--blocked")).toHaveCount(1);
	await expect(host.locator(".roh-tile--locked")).toHaveCount(0, POLL);

	// The host takes it straight away and answers by a short name.
	await host.getByRole("button", { name: "1994-95" }).click();
	await pickGuess(host, "Blackburn", "Blackburn Rovers");
	await expect(host.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeVisible();
	await expect(host.getByText(/1 of 34 filled/)).toBeVisible();
	await expect(guest.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeVisible(POLL);
	await expect(guest.getByText("1 win")).toBeVisible(POLL);
	// The guesser's block has lapsed by now, and the answered tile can't be taken.
	await expect(guest.locator(".roh-tile--blocked")).toHaveCount(0, { timeout: 8_000 });
	await expect(guest.getByRole("button", { name: "1994-95: Blackburn Rovers" })).toBeDisabled();

	// Switching: tapping another season while holding one moves the hold.
	await host.getByRole("button", { name: "2015-16" }).click();
	await expect(host.getByRole("dialog", { name: /Who won in 2015-16/ })).toBeVisible();
	await host.getByRole("button", { name: "Put it back" }).click(); // the × -- releases the hold
	await expect(host.getByRole("dialog")).toBeHidden();
	await host.getByRole("button", { name: "2016-17" }).click();
	await expect(host.getByRole("dialog", { name: /Who won in 2016-17/ })).toBeVisible();
	await host.keyboard.press("Escape");
	await expect(host.getByRole("dialog")).toBeHidden();

	// Give up bows a player out of the whole game; once everyone has, the
	// game ends and the full roll is revealed.
	await guest.getByRole("button", { name: "Give up", exact: true }).click();
	await guest.getByRole("button", { name: "Yes, give up" }).click();
	await expect(guest.getByText(/You gave up on this one/)).toBeVisible();
	await expect(host.locator(".remote-badge--gave-up")).toBeVisible(POLL);
	await host.getByRole("button", { name: "Give up", exact: true }).click();
	await host.getByRole("button", { name: "Yes, give up" }).click();

	await expect(host.getByRole("heading", { name: "Final results" })).toBeVisible(POLL);
	await expect(guest.getByRole("heading", { name: "Final results" })).toBeVisible(POLL);
	await expect(host.getByRole("button", { name: "2015-16: Leicester City" })).toBeVisible();
	await expect(host.locator(".remote-standings__item").first()).toContainText("Cuong");
	await expect(host.locator(".remote-standings__item").first()).toContainText("1 win");

	// Play again, keeping scores: back through the lobby into a new grid
	// with the tally carried over.
	await host.getByRole("button", { name: "Play again, keep scores" }).click();
	await expect(guest.getByRole("heading", { name: "Waiting room" })).toBeVisible(POLL);
	await guestReadies(guest);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);
	await host.getByRole("button", { name: "Start game" }).click();
	await expect(host.getByText(/0 of 34 filled/)).toBeVisible(AFTER_COUNTDOWN);
	await expect(host.locator(".remote-standings__item").first()).toContainText("1 win");
});

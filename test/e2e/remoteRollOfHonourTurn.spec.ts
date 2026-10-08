// Remote play, Roll of Honour in Turn mode: the lobby's mode picker and
// turn-timer slider, then seasons played in order with the table taking
// turns -- only the player whose turn it is gets an answer box, a wrong
// answer passes the turn, a full trip round the table brings a hint, a
// right answer is shown to everyone, and the next season is opened by the
// next player along.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer, pickGuess } from "./remoteHelpers";

test.setTimeout(180_000);

test("a Premier League grid in Turn mode: turns, a hint after a full pass, a right answer, rotation", async ({ browser }) => {
	const host = await newPlayer(browser);
	const guest = await newPlayer(browser);
	await guest.setViewportSize({ width: 390, height: 800 });

	const code = await hostCreates(host, "Roll of Honour", "Cuong");
	await guestJoins(guest, code, "Luka");
	await guestReadies(guest);
	await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);

	await host.getByLabel("Competition").selectOption("premier-league");
	// The slider only exists for Turn mode; 20s keeps the timer out of the
	// test's way.
	await expect(host.getByLabel(/Seconds per guess/)).toHaveCount(0);
	await host.getByLabel("Mode").selectOption("turn");
	await expect(host.getByLabel("Seconds per guess: 10")).toBeVisible();
	await host.getByLabel(/Seconds per guess/).fill("20");
	await expect(host.getByLabel("Seconds per guess: 20")).toBeVisible();
	await host.getByRole("button", { name: "Start game" }).click();

	// 1992-93 is the host's to open; the guest watches, with no answer box.
	await expect(host.getByText("Your turn")).toBeVisible(AFTER_COUNTDOWN);
	await expect(guest.getByText("Cuong's turn")).toBeVisible(AFTER_COUNTDOWN);
	await expect(host.locator(".roh-turn__season")).toHaveText("1992-93");
	await expect(guest.getByPlaceholder("Type your guess…")).toHaveCount(0);
	await expect(host.locator(".roh-turn__hint")).toHaveCount(0);

	// Wrong: the turn passes to the guest.
	await pickGuess(host, "Arsenal", "Arsenal");
	await expect(host.getByText("❌ Not Arsenal")).toBeVisible();
	await expect(host.getByText("Luka's turn")).toBeVisible(POLL);
	await expect(guest.getByText("Your turn")).toBeVisible(POLL);

	// Wrong again: everyone has had a go, so the first hint appears (every
	// Premier League winner is English, so it's the name's first letter
	// and shape) and it's back to the host.
	await pickGuess(guest, "Arsenal", "Arsenal");
	await expect(host.getByText("Your turn")).toBeVisible(POLL);
	await expect(host.locator(".roh-turn__hint")).toHaveText("M _ _ _ _ _ _ _ _ _  _ _ _ _ _ _");
	await expect(guest.locator(".roh-turn__hint")).toHaveText("M _ _ _ _ _ _ _ _ _  _ _ _ _ _ _", POLL);

	// Right: shown to both, scored, and the tile filled in.
	await pickGuess(host, "Manchester Uni", "Manchester United");
	await expect(guest.getByText("✅ Cuong got it: Manchester United")).toBeVisible(POLL);
	await expect(guest.getByRole("button", { name: "1992-93: Manchester United" })).toBeVisible();
	await expect(guest.getByText("1 win")).toBeVisible(POLL);

	// After the reveal, 1993-94 -- opened by the next player along.
	await expect(guest.locator(".roh-turn__season")).toHaveText("1993-94", AFTER_COUNTDOWN);
	await expect(guest.getByText("Your turn")).toBeVisible();
	await expect(host.getByText("Luka's turn")).toBeVisible(POLL);
	// The last season's verdict doesn't linger over this one.
	await expect(host.getByText("❌ Not Arsenal")).toHaveCount(0);
	await expect(guest.getByText("❌ Not Arsenal")).toHaveCount(0);
});

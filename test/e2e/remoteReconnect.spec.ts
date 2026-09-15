// Remote play's push channel under bad connections (see
// remoteGameSession.ts's WebSockets doc and useRemoteSession.ts):
//   - a device that goes offline mid-session is shown as away to the
//     others after 15s, then catches up and is present again when it comes
//     back, over a fresh socket;
//   - a device whose socket keeps failing but whose HTTP still works falls
//     back to polling and misses nothing;
//   - a refresh mid-game re-opens the socket from the stored identity and
//     lands straight back in the game.
//
// Tagged @slow and run as Playwright's "e2e-slow" project (npm run
// test:e2e:slow), kept out of the default `npm run test:e2e`: the 15s
// away window and the reconnect backoff are real waits -- this file alone
// is a minute or so -- and they'd dominate the quick suite people run
// while iterating. CI runs both projects on every commit.
import { expect, test } from "@playwright/test";
import { AFTER_COUNTDOWN, POLL, guestJoins, guestReadies, hostCreates, newPlayer } from "./remoteHelpers";

// Away is 15s (PLAYER_AWAY_MS) after the socket dropped, noticed by the
// object's alarm and pushed; the assertion allows for the alarm's own
// granularity and a slow CI runner.
const AFTER_AWAY = { timeout: 30_000 };
// Reconnect backoff is 1s, 2s, 4s, 8s, then 15s -- a device that was
// offline for the away window is a few attempts in when it comes back.
const AFTER_RECONNECT = { timeout: 25_000 };

test.describe("remote play over a bad connection", { tag: "@slow" }, () => {
	test.slow(); // Triples the default timeout; the whole file is real waits.

	test("a player who drops offline mid-game is shown as away, the game finishes without them, and they land on the results when back", async ({ browser }) => {
		const host = await newPlayer(browser);
		const guest = await newPlayer(browser);

		const code = await hostCreates(host, "Club Run", "Cuong");
		await guestJoins(guest, "Club Run", code, "Luka");
		await guestReadies(guest);
		await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);
		await host.getByLabel("Number of questions").fill("1");
		await host.getByRole("button", { name: "Start game" }).click();
		await expect(host.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
		await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);
		await expect(host.locator(".remote-badge--away")).toHaveCount(0);

		// The guest's network goes away entirely -- socket and HTTP both --
		// without a close frame, as a phone losing signal does. Their socket
		// still looks open to the server; their pings stop.
		await guest.context().setOffline(true);

		// 15s of grace, then the host sees them away without anyone doing
		// anything: the object's alarm noticed the pings stopping.
		await expect(host.locator(".remote-badge--away")).toBeVisible(AFTER_AWAY);

		// The game doesn't hang on them: with the only other player away, the
		// host giving up resolves the round, and the ready gate skips the
		// away player, so the one-question game runs through to the results.
		await host.getByRole("button", { name: "Give up", exact: true }).click();
		await host.getByRole("button", { name: "Yes, give up" }).click();
		await expect(host.getByText(/Nobody got this one/)).toBeVisible(POLL);
		await expect(host.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_COUNTDOWN);
		await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(); // Still on the stale screen.

		// Back online: the client notices its dead socket (missed pongs, or
		// the browser's online event), reconnects, and the first push is the
		// current state; the host sees them present again.
		await guest.context().setOffline(false);
		await expect(guest.getByRole("heading", { name: "Final results" })).toBeVisible(AFTER_RECONNECT);
		await expect(host.locator(".remote-badge--away")).toHaveCount(0, POLL);
	});

	test("a player whose socket keeps failing falls back to polling and still sees everything", async ({ browser }) => {
		const host = await newPlayer(browser);
		const guest = await newPlayer(browser);

		// Every socket the guest opens is closed by the network before the
		// server's first push -- as a proxy that drops upgrades would. HTTP
		// is untouched, so the client's poll fallback carries the session.
		await guest.routeWebSocket(/\/api\/remote\/sessions\/[^/]+\/ws/, (ws) => {
			ws.close({ code: 1011, reason: "dropped by the network" });
		});

		const code = await hostCreates(host, "Club Run", "Cuong");
		await guestJoins(guest, "Club Run", code, "Luka");
		await guestReadies(guest);
		await expect(host.getByText("Luka")).toBeVisible(POLL);
		await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);

		await host.getByLabel("Number of questions").fill("1");
		await host.getByRole("button", { name: "Start game" }).click();
		// The guest learns of the start from a poll, not a push.
		await expect(guest.getByText(/First question in/)).toBeVisible(POLL);
		await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);

		// And stays present to the host throughout: polling IS presence.
		await expect(host.locator(".remote-badge--away")).toHaveCount(0);
		await guest.waitForTimeout(16_000);
		await expect(host.locator(".remote-badge--away")).toHaveCount(0);
	});

	test("a refresh mid-game re-opens the socket from the stored identity and lands back in the game", async ({ browser }) => {
		const host = await newPlayer(browser);
		const guest = await newPlayer(browser);

		const code = await hostCreates(host, "Club Run", "Cuong");
		await guestJoins(guest, "Club Run", code, "Luka");
		await guestReadies(guest);
		await expect(host.locator(".remote-badge--ready")).toBeVisible(POLL);
		await host.getByLabel("Number of questions").fill("1");
		await host.getByRole("button", { name: "Start game" }).click();
		await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(AFTER_COUNTDOWN);

		await guest.reload();
		// No lobby, no join form -- straight back to the live question.
		await expect(guest.getByPlaceholder("Type your guess…")).toBeVisible(POLL);
		await expect(guest.locator(".remote-round-header").getByText("Question 1 of 1")).toBeVisible();
		await expect(host.locator(".remote-badge--away")).toHaveCount(0);
	});
});

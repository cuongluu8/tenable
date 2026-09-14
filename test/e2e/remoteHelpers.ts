import { expect, type Browser, type Page } from "@playwright/test";

// Remote play is several real browsers on one session, so every remote
// spec runs two (or three) independent contexts -- separate cookies,
// separate localStorage identities -- exactly as separate phones would.
// Everything here goes through the UI the way a player would: the game
// picker, "Host a game"/"Join a game", the lobby's code display, its
// ready button. Nothing calls /api/remote directly.

export async function newPlayer(browser: Browser): Promise<Page> {
	const context = await browser.newContext();
	return context.newPage();
}

export async function hostCreates(page: Page, game: "Club Run" | "Teammate Tell" | "Roll of Honour", name: string): Promise<string> {
	await page.goto("/remote");
	await page.getByRole("button", { name: new RegExp(game) }).click();
	await page.getByRole("button", { name: /Host a game/ }).click();
	await page.getByLabel("Your name").fill(name);
	await page.getByRole("button", { name: "Create session" }).click();
	await expect(page.getByRole("heading", { name: "Waiting room" })).toBeVisible();
	const code = (await page.locator(".remote-code-display__value").textContent())?.trim();
	if (!code) throw new Error("No session code shown in the lobby");
	return code;
}

export async function guestJoins(page: Page, game: "Club Run" | "Teammate Tell" | "Roll of Honour", code: string, name: string): Promise<void> {
	await page.goto("/remote");
	await page.getByRole("button", { name: new RegExp(game) }).click();
	await page.getByRole("button", { name: /Join a game/ }).click();
	await page.getByLabel("Session code").fill(code);
	await page.getByLabel("Your name").fill(name);
	await page.getByRole("button", { name: "Join session" }).click();
}

export async function guestReadies(page: Page): Promise<void> {
	await expect(page.getByRole("heading", { name: "Waiting room" })).toBeVisible();
	await page.getByRole("button", { name: "I'm ready" }).click();
	await expect(page.getByRole("button", { name: "Not ready" })).toBeVisible();
}

// The guess box only submits a picked suggestion (see GuessInput.tsx), so
// a guess is typed, then picked from the list -- same as a player does.
export async function pickGuess(page: Page, typed: string, option: RegExp | string): Promise<void> {
	await page.getByPlaceholder("Type your guess…").fill(typed);
	await page.getByRole("option", { name: option }).first().click();
}

export async function giveUpInRound(page: Page): Promise<void> {
	await page.getByRole("button", { name: "Give up", exact: true }).click();
	await page.getByRole("button", { name: "Yes, give up" }).click();
}

// Other devices learn things on their next 4s poll -- assertions about
// what ANOTHER player sees allow for that.
export const POLL = { timeout: 12_000 };
// The start countdown (5s) and the minimum answer reveal (5s) are real
// waits in the dev server's config, so anything on the far side of one
// gets this.
export const AFTER_COUNTDOWN = { timeout: 20_000 };

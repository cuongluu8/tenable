import type { Page } from "@playwright/test";

// Both helpers below drive a "guess the player" round engine (RoundPlay.tsx)
// to completion via "Give up" alone -- deterministic and robust to real
// content changes, unlike guessing an actual answer would be. They differ
// in what "done" looks like because two different screens sit on top of
// the same RoundPlay engine:
//   - Sets mode (ClubBadgeSetPlay.tsx/TeammateSetPlay.tsx, via
//     useSetRound.ts) queues one question at a time and finishes into
//     SetCompleteScreen ("Set N: <name> complete!") once every question in
//     the set has been answered -- there's no early exit via a life
//     budget, so this may need to click through the whole set (10
//     questions).
//   - The random-round engine (GuessThePlayer.tsx, multiplayer-only --
//     see that file's own doc) finishes into RoundResultScreen
//     ("🏁 Round over"), and multiplayer has no round-ending life budget
//     either (see clubBadgesState.ts's "next" reducer case) -- same
//     "may need every question" situation.
// `maxQuestions` is a safety net against a genuine infinite-loop bug
// hanging the test, not a tuned "how many questions this round has"
// number.

async function clickThroughOneGiveUp(page: Page): Promise<void> {
	await page.getByRole("button", { name: "Give up", exact: true }).click();
	await page.getByRole("button", { name: "Yes, give up" }).click();
	await page.getByRole("button", { name: /^(Next question|Next player|See results)$/ }).click();
}

export async function giveUpUntilSetComplete(page: Page, maxQuestions = 15): Promise<void> {
	for (let i = 0; i < maxQuestions; i++) {
		if (await page.getByRole("heading", { name: /complete!$/ }).isVisible().catch(() => false)) {
			return;
		}
		await clickThroughOneGiveUp(page);
	}
	throw new Error(`Set didn't complete within ${maxQuestions} questions -- possible infinite loop.`);
}

export async function giveUpUntilRoundOver(page: Page, maxQuestions = 25): Promise<void> {
	for (let i = 0; i < maxQuestions; i++) {
		if (await page.getByRole("heading", { name: "🏁 Round over" }).isVisible().catch(() => false)) {
			return;
		}
		await clickThroughOneGiveUp(page);
	}
	throw new Error(`Round didn't end within ${maxQuestions} questions -- possible infinite loop in the reducer.`);
}

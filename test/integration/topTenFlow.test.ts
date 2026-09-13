// Route-level contract tests for the classic Top-10 gameplay flow: guess,
// give-up, reveal, reset -- POST /api/guess, POST /api/give-up,
// GET /api/reveal/:slug, POST /api/reset. Each test uses its own random
// device id so KV progress never leaks between test cases sharing this
// file's one seeded D1.
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

function withDevice(id: string): HeadersInit {
	return { Cookie: `tenable_device=${id}`, "Content-Type": "application/json" };
}

async function guess(device: string, body: Record<string, unknown>) {
	return SELF.fetch("https://example.com/api/guess", {
		method: "POST",
		headers: withDevice(device),
		body: JSON.stringify(body),
	});
}

describe("POST /api/guess", () => {
	it("grades a correct guess and reports the found rank/name/statValue", async () => {
		const device = crypto.randomUUID();
		const res = await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		expect(res.status).toBe(200);
		const data = (await res.json()) as { result: string; found: { rank: number; name: string; statValue: string } };
		expect(data.result).toBe("correct");
		expect(data.found).toEqual({ rank: 1, name: "Fixture Player One", statValue: "100" });
	});

	it("grades a correct guess by alias the same as by canonical name", async () => {
		const device = crypto.randomUUID();
		const res = await guess(device, { slug: "fixture-top-3", guess: "fp1" });
		expect((await res.json() as { result: string }).result).toBe("correct");
	});

	it("re-guessing an already-found rank reports 'duplicate', not 'correct' again", async () => {
		const device = crypto.randomUUID();
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		const res = await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		expect((await res.json() as { result: string }).result).toBe("duplicate");
	});

	it("grades an unmatched guess 'wrong'", async () => {
		const device = crypto.randomUUID();
		const res = await guess(device, { slug: "fixture-top-3", guess: "Nobody At All" });
		expect((await res.json() as { result: string }).result).toBe("wrong");
	});

	it("classic mode completes as a win once every answer is found", async () => {
		const device = crypto.randomUUID();
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player Two" });
		const res = await guess(device, { slug: "fixture-top-3", guess: "Fixture Player Three" });
		const data = (await res.json()) as { progress: { completed: boolean; won: boolean } };
		expect(data.progress.completed).toBe(true);
		expect(data.progress.won).toBe(true);
	});

	it("tension mode ends as a loss once lives run out, without needing every answer found", async () => {
		const device = crypto.randomUUID();
		await guess(device, { slug: "fixture-top-3", guess: "wrong", mode: "tension" });
		let last!: { progress: { completed: boolean; won: boolean }; livesRemaining: number };
		for (let i = 0; i < 4; i++) {
			const res = await guess(device, { slug: "fixture-top-3", guess: `still wrong ${i}`, mode: "tension" });
			last = (await res.json()) as typeof last;
		}
		expect(last.progress.completed).toBe(true);
		expect(last.progress.won).toBe(false);
		expect(last.livesRemaining).toBe(0);
	});

	it("409s once the round is already completed", async () => {
		const device = crypto.randomUUID();
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player Two" });
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player Three" });
		const res = await guess(device, { slug: "fixture-top-3", guess: "anything" });
		expect(res.status).toBe(409);
	});

	it("400s on a missing slug, 404s on an unknown one", async () => {
		const device = crypto.randomUUID();
		expect((await guess(device, { guess: "x" })).status).toBe(400);
		expect((await guess(device, { slug: "does-not-exist", guess: "x" })).status).toBe(404);
	});
});

describe("POST /api/give-up + GET /api/reveal/:slug", () => {
	it("give-up ends the round as a loss, and reveal only works after that", async () => {
		const device = crypto.randomUUID();

		const tooEarly = await SELF.fetch("https://example.com/api/reveal/fixture-top-3", { headers: withDevice(device) });
		expect(tooEarly.status).toBe(403);

		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });
		const giveUpRes = await SELF.fetch("https://example.com/api/give-up", {
			method: "POST",
			headers: withDevice(device),
			body: JSON.stringify({ slug: "fixture-top-3" }),
		});
		expect(giveUpRes.status).toBe(200);
		const giveUpData = (await giveUpRes.json()) as { progress: { completed: boolean; won: boolean } };
		expect(giveUpData.progress).toMatchObject({ completed: true, won: false });

		const revealRes = await SELF.fetch("https://example.com/api/reveal/fixture-top-3", { headers: withDevice(device) });
		expect(revealRes.status).toBe(200);
		const revealData = (await revealRes.json()) as { answers: { rank: number; name: string }[] };
		expect(revealData.answers).toHaveLength(3);
		expect(revealData.answers[0]).toEqual({ rank: 1, name: "Fixture Player One", statValue: "100" });
	});

	it("give-up 404s with no round in progress, 409s on an already-finished one", async () => {
		const device = crypto.randomUUID();
		const res = await SELF.fetch("https://example.com/api/give-up", {
			method: "POST",
			headers: withDevice(device),
			body: JSON.stringify({ slug: "fixture-top-3" }),
		});
		expect(res.status).toBe(404);
	});
});

describe("POST /api/reset", () => {
	it("clears progress so the category can be started fresh again", async () => {
		const device = crypto.randomUUID();
		await guess(device, { slug: "fixture-top-3", guess: "Fixture Player One" });

		const resetRes = await SELF.fetch("https://example.com/api/reset", {
			method: "POST",
			headers: withDevice(device),
			body: JSON.stringify({ slug: "fixture-top-3" }),
		});
		expect(resetRes.status).toBe(200);
		expect(await resetRes.json()).toEqual({ ok: true });

		const categoryRes = await SELF.fetch("https://example.com/api/categories/fixture-top-3", { headers: withDevice(device) });
		const data = (await categoryRes.json()) as { progress: unknown };
		expect(data.progress).toBeNull();
	});

	it("is idempotent -- resetting with no progress at all still succeeds", async () => {
		const device = crypto.randomUUID();
		const res = await SELF.fetch("https://example.com/api/reset", {
			method: "POST",
			headers: withDevice(device),
			body: JSON.stringify({ slug: "fixture-top-3" }),
		});
		expect(res.status).toBe(200);
	});
});

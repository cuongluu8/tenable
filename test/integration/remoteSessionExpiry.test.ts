// The session expiry alarm (remoteGameSession.ts's alarm() / SESSION_TTL_MS):
// an untouched session is deleted when its alarm fires; a live one has its
// alarm re-armed instead. Drives the object directly with cloudflare:test's
// helpers -- the alarm is time-based, so the test ages the stored
// lastSeenAt rather than waiting a day.
import { env, runDurableObjectAlarm, runInDurableObject, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface CreateResponse {
	sessionCode: string;
	playerToken: string;
}

async function createSession(hostName: string): Promise<CreateResponse> {
	const res = await SELF.fetch("https://example.com/api/remote/sessions", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ hostName }),
	});
	expect(res.status).toBe(200);
	return res.json();
}

function stubFor(code: string) {
	return env.REMOTE_GAME_SESSION.get(env.REMOTE_GAME_SESSION.idFromName(code));
}

describe("session expiry", () => {
	it("arms an alarm at create, re-arms it for a live session, and deletes an abandoned one", async () => {
		const host = await createSession("Host");
		const stub = stubFor(host.sessionCode);

		// Armed at create.
		const armedAt = await runInDurableObject(stub, (_instance, state) => state.storage.getAlarm());
		expect(armedAt).not.toBeNull();

		// Fires with a recent poll behind it: still here, alarm re-armed.
		expect(await runDurableObjectAlarm(stub)).toBe(true);
		expect((await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state`, { headers: { "X-Player-Token": host.playerToken } })).status).toBe(200);
		expect(await runInDurableObject(stub, (_instance, state) => state.storage.getAlarm())).not.toBeNull();

		// Age every player's last poll past the TTL, fire again: gone.
		await runInDurableObject(stub, (_instance, state) => {
			state.storage.sql.exec("UPDATE players SET data = json_set(data, '$.lastSeenAt', ?)", Date.now() - 25 * 60 * 60 * 1000);
		});
		expect(await runDurableObjectAlarm(stub)).toBe(true);
		const after = await SELF.fetch(`https://example.com/api/remote/sessions/${host.sessionCode}/state`, { headers: { "X-Player-Token": host.playerToken } });
		expect(after.status).toBe(404);
		expect(await runInDurableObject(stub, (_instance, state) => state.storage.getAlarm())).toBeNull();
	});
});

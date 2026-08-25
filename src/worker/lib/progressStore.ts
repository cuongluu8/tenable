import type { Mode, Progress, StreakInfo } from "./types";

function progressKey(deviceId: string, date: string): string {
	return `progress:${deviceId}:${date}`;
}

function streakKey(deviceId: string): string {
	return `streak:${deviceId}`;
}

export async function getProgress(
	kv: KVNamespace,
	deviceId: string,
	date: string,
): Promise<Progress | null> {
	return kv.get<Progress>(progressKey(deviceId, date), "json");
}

export async function startProgress(
	kv: KVNamespace,
	deviceId: string,
	date: string,
	mode: Mode,
): Promise<Progress> {
	const progress: Progress = {
		mode,
		foundRanks: [],
		wrongGuesses: 0,
		completed: false,
		won: false,
		completedAt: null,
	};
	await saveProgress(kv, deviceId, date, progress);
	return progress;
}

export async function saveProgress(
	kv: KVNamespace,
	deviceId: string,
	date: string,
	progress: Progress,
): Promise<void> {
	// A day's progress is only ever relevant for a short window; expire well
	// past that so KV doesn't accumulate forever.
	await kv.put(progressKey(deviceId, date), JSON.stringify(progress), {
		expirationTtl: 60 * 60 * 24 * 30,
	});
}

export async function getStreak(
	kv: KVNamespace,
	deviceId: string,
): Promise<StreakInfo> {
	const streak = await kv.get<StreakInfo>(streakKey(deviceId), "json");
	return streak ?? { current: 0, longest: 0, lastCompletedDate: null };
}

// Called once when a round finishes. Only a *win* extends the streak; the
// streak breaks if the previous completed date isn't the day before today
// (i.e. the player missed a day).
export async function recordCompletion(
	kv: KVNamespace,
	deviceId: string,
	date: string,
	won: boolean,
): Promise<StreakInfo> {
	const streak = await getStreak(kv, deviceId);

	if (!won) {
		streak.current = 0;
		streak.lastCompletedDate = date;
		await kv.put(streakKey(deviceId), JSON.stringify(streak));
		return streak;
	}

	const isConsecutive =
		streak.lastCompletedDate !== null &&
		isNextDay(streak.lastCompletedDate, date);

	streak.current = isConsecutive || streak.lastCompletedDate === null ? streak.current + 1 : 1;
	streak.longest = Math.max(streak.longest, streak.current);
	streak.lastCompletedDate = date;

	await kv.put(streakKey(deviceId), JSON.stringify(streak));
	return streak;
}

function isNextDay(previous: string, current: string): boolean {
	const prevDate = new Date(`${previous}T00:00:00Z`);
	const currDate = new Date(`${current}T00:00:00Z`);
	const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
	return diffDays === 1;
}

import type { LifetimeStats, Mode, Progress, StreakInfo } from "./types";

const PROGRESS_PREFIX = (deviceId: string) => `progress:${deviceId}:`;

function progressKey(deviceId: string, slug: string): string {
	return `${PROGRESS_PREFIX(deviceId)}${slug}`;
}

function streakKey(deviceId: string): string {
	return `streak:${deviceId}`;
}

function lifetimeKey(deviceId: string): string {
	return `lifetime:${deviceId}`;
}

export async function getProgress(
	kv: KVNamespace,
	deviceId: string,
	slug: string,
): Promise<Progress | null> {
	return kv.get<Progress>(progressKey(deviceId, slug), "json");
}

// Every category this device has ever started or finished, keyed by slug.
// Used to mark categories "already answered" in the category list so they
// aren't presented as fresh questions again.
export async function listProgressBySlug(
	kv: KVNamespace,
	deviceId: string,
): Promise<Map<string, Progress>> {
	const prefix = PROGRESS_PREFIX(deviceId);
	const keys = await kv.list({ prefix });
	const entries = await Promise.all(
		keys.keys.map(async (k) => {
			const progress = await kv.get<Progress>(k.name, "json");
			return [k.name.slice(prefix.length), progress] as const;
		}),
	);
	const map = new Map<string, Progress>();
	for (const [slug, progress] of entries) {
		if (progress) map.set(slug, progress);
	}
	return map;
}

export async function startProgress(
	kv: KVNamespace,
	deviceId: string,
	slug: string,
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
	await saveProgress(kv, deviceId, slug, progress);
	return progress;
}

export async function saveProgress(
	kv: KVNamespace,
	deviceId: string,
	slug: string,
	progress: Progress,
): Promise<void> {
	// Completed rounds are kept indefinitely (that's what "remembers what
	// I've answered" relies on) — no TTL here, unlike the old date-keyed
	// version where a day's record only mattered briefly.
	await kv.put(progressKey(deviceId, slug), JSON.stringify(progress));
}

export async function getStreak(
	kv: KVNamespace,
	deviceId: string,
): Promise<StreakInfo> {
	const streak = await kv.get<StreakInfo>(streakKey(deviceId), "json");
	return streak ?? { current: 0, longest: 0, lastCompletedDate: null };
}

export async function getLifetimeStats(
	kv: KVNamespace,
	deviceId: string,
): Promise<LifetimeStats> {
	const stats = await kv.get<LifetimeStats>(lifetimeKey(deviceId), "json");
	return stats ?? { totalPlayed: 0, totalWon: 0 };
}

// Called once per finished round, for every category (not just one a day).
// Lifetime totals always move; the day-streak only moves on the *first* win
// recorded for a given calendar date, so playing multiple categories in one
// sitting doesn't inflate it and a loss never erases it.
export async function recordCompletion(
	kv: KVNamespace,
	deviceId: string,
	date: string,
	won: boolean,
): Promise<{ streak: StreakInfo; lifetime: LifetimeStats }> {
	const lifetime = await getLifetimeStats(kv, deviceId);
	lifetime.totalPlayed += 1;
	if (won) lifetime.totalWon += 1;
	await kv.put(lifetimeKey(deviceId), JSON.stringify(lifetime));

	const streak = await getStreak(kv, deviceId);
	if (won && streak.lastCompletedDate !== date) {
		const isConsecutive =
			streak.lastCompletedDate !== null && isNextDay(streak.lastCompletedDate, date);
		streak.current = isConsecutive ? streak.current + 1 : 1;
		streak.longest = Math.max(streak.longest, streak.current);
		streak.lastCompletedDate = date;
		await kv.put(streakKey(deviceId), JSON.stringify(streak));
	}

	return { streak, lifetime };
}

function isNextDay(previous: string, current: string): boolean {
	const prevDate = new Date(`${previous}T00:00:00Z`);
	const currDate = new Date(`${current}T00:00:00Z`);
	const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
	return diffDays === 1;
}

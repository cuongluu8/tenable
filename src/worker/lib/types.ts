export type Mode = "classic" | "tension";

export const TENSION_LIVES = 5;

export interface CategoryPublic {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
}

export type CategoryStatus = "new" | "in_progress" | "won" | "lost";

export interface CategorySummary extends CategoryPublic {
	status: CategoryStatus;
}

export interface Progress {
	mode: Mode;
	foundRanks: number[];
	wrongGuesses: number;
	completed: boolean;
	won: boolean;
	completedAt: string | null;
}

// A day-based win streak (only wins move it, and only the first win of a
// given calendar day counts — playing several categories in one day doesn't
// inflate it, matching the "come back daily" hook without gating content).
export interface StreakInfo {
	current: number;
	longest: number;
	lastCompletedDate: string | null;
}

// Simple lifetime counters, independent of the streak.
export interface LifetimeStats {
	totalPlayed: number;
	totalWon: number;
}

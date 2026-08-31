export type Mode = "classic" | "tension";

export const TENSION_LIVES = 5;

export interface CategoryPublic {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
	// UTC "YYYY-MM-DD" — the latest date any of this category's answers are
	// verified accurate up to (MAX across category_answers.as_of_date, see
	// rebuild.ts). Null only for a category with zero answers. This is the
	// mechanical currency guarantee shown to players — never a hand-written
	// "through 2025-26" claim that can drift from what the data actually
	// reflects.
	asOfDate: string | null;
}

export type CategoryStatus = "new" | "in_progress" | "won" | "lost";

export interface CategorySummary extends CategoryPublic {
	status: CategoryStatus;
	// Section heading the client groups the category list under (see
	// schema.sql's group_label) — only meaningful for the list view, so it's
	// on CategorySummary rather than the shared CategoryPublic that a single
	// in-progress category (PlayScreen) also uses.
	group: string;
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

export type Mode = "classic" | "tension";

export const TENSION_LIVES = 5;

export interface DailyCategoryPublic {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
}

export interface FoundAnswer {
	rank: number;
	name: string;
	statValue: string;
}

export interface Progress {
	mode: Mode;
	foundRanks: number[];
	wrongGuesses: number;
	completed: boolean;
	won: boolean;
	completedAt: string | null;
}

export interface StreakInfo {
	current: number;
	longest: number;
	lastCompletedDate: string | null;
}

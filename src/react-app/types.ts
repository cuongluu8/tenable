export type Mode = "classic" | "tension";

export interface DailyCategory {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
}

export interface Progress {
	mode: Mode;
	foundRanks: number[];
	wrongGuesses: number;
	completed: boolean;
	won: boolean;
	completedAt: string | null;
}

export interface Streak {
	current: number;
	longest: number;
	lastCompletedDate: string | null;
}

export interface DailyResponse {
	date: string;
	category: DailyCategory;
	progress: Progress | null;
	streak: Streak;
}

export interface GuessResponse {
	result: "correct" | "duplicate" | "wrong";
	found: { rank: number; name: string; statValue: string } | null;
	progress: Progress;
	livesRemaining: number | null;
	streak: Streak | null;
}

export interface RevealAnswer {
	rank: number;
	name: string;
	statValue: string;
}

export type Mode = "classic" | "tension";

export type CategoryStatus = "new" | "in_progress" | "won" | "lost";

export interface Category {
	slug: string;
	title: string;
	subtitle: string | null;
	statLabel: string;
	answerCount: number;
}

export interface CategorySummary extends Category {
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

export interface Streak {
	current: number;
	longest: number;
	lastCompletedDate: string | null;
}

export interface Lifetime {
	totalPlayed: number;
	totalWon: number;
}

export interface CategoriesResponse {
	categories: CategorySummary[];
	streak: Streak;
	lifetime: Lifetime;
}

export interface CategoryResponse {
	category: Category;
	progress: Progress | null;
	// Names for ranks already found in a previous session (empty if none) —
	// see the worker route for why this is safe to send unconditionally.
	foundAnswers: RevealAnswer[];
}

export interface GuessResponse {
	result: "correct" | "duplicate" | "wrong";
	found: { rank: number; name: string; statValue: string } | null;
	progress: Progress;
	livesRemaining: number | null;
	streak: Streak | null;
	lifetime: Lifetime | null;
}

export interface RevealAnswer {
	rank: number;
	name: string;
	statValue: string;
}

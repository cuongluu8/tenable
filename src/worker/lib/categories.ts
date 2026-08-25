import type { DailyCategoryPublic } from "./types";

interface CategoryRow {
	id: number;
	slug: string;
	title: string;
	subtitle: string | null;
	stat_label: string;
}

export async function getCategoryForDate(
	db: D1Database,
	date: string,
): Promise<CategoryRow | null> {
	const row = await db
		.prepare(
			`SELECT id, slug, title, subtitle, stat_label
			 FROM categories WHERE scheduled_date = ?`,
		)
		.bind(date)
		.first<CategoryRow>();
	return row ?? null;
}

export async function getAnswerCount(
	db: D1Database,
	categoryId: number,
): Promise<number> {
	const row = await db
		.prepare(`SELECT COUNT(*) as count FROM answers WHERE category_id = ?`)
		.bind(categoryId)
		.first<{ count: number }>();
	return row?.count ?? 0;
}

export function toPublic(
	row: CategoryRow,
	answerCount: number,
): DailyCategoryPublic {
	return {
		slug: row.slug,
		title: row.title,
		subtitle: row.subtitle,
		statLabel: row.stat_label,
		answerCount,
	};
}

interface AnswerMatchRow {
	id: number;
	rank: number;
	canonical_name: string;
	stat_value: string;
}

// Server-authoritative guess check: normalize the guess and look it up
// against both canonical names and aliases for this category. Answers are
// never sent to the client, so this is the only place a guess can be
// validated.
export async function matchGuess(
	db: D1Database,
	categoryId: number,
	normalizedGuess: string,
): Promise<AnswerMatchRow | null> {
	// Matching goes through answer_aliases only (never canonical_name directly)
	// because aliases are pre-normalized the same way guesses are; seed data
	// always includes the full normalized name as one of a name's aliases.
	const row = await db
		.prepare(
			`SELECT a.id, a.rank, a.canonical_name, a.stat_value
			 FROM answers a
			 JOIN answer_aliases al ON al.answer_id = a.id
			 WHERE a.category_id = ? AND al.alias = ?
			 LIMIT 1`,
		)
		.bind(categoryId, normalizedGuess)
		.first<AnswerMatchRow>();
	return row ?? null;
}

interface FullAnswerRow {
	rank: number;
	canonical_name: string;
	stat_value: string;
}

export async function getAllAnswers(
	db: D1Database,
	categoryId: number,
): Promise<FullAnswerRow[]> {
	const result = await db
		.prepare(
			`SELECT rank, canonical_name, stat_value FROM answers
			 WHERE category_id = ? ORDER BY rank ASC`,
		)
		.bind(categoryId)
		.all<FullAnswerRow>();
	return result.results ?? [];
}

import type { CategorySummary } from "../types";

interface Props {
	categories: CategorySummary[];
	onSelect: (category: CategorySummary) => void;
}

const STATUS_LABEL: Record<CategorySummary["status"], string> = {
	new: "Not started",
	in_progress: "In progress",
	won: "✅ Completed",
	lost: "❌ Completed",
};

export function CategoryList({ categories, onSelect }: Props) {
	return (
		<ul className="category-list">
			{categories.map((cat) => (
				<li key={cat.slug}>
					<button className="category-card" onClick={() => onSelect(cat)}>
						<div className="category-card__main">
							<strong>{cat.title}</strong>
							{cat.subtitle && <span className="category-card__subtitle">{cat.subtitle}</span>}
						</div>
						<span className={`category-card__status category-card__status--${cat.status}`}>
							{STATUS_LABEL[cat.status]}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}

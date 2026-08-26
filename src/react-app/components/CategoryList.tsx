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

// Splits into consecutive runs by `group` without sorting — the API already
// orders categories by group_order then id, so a run boundary is exactly a
// section boundary. Reordering here would fight that server-side order for
// no benefit.
function groupSections(categories: CategorySummary[]): { group: string; items: CategorySummary[] }[] {
	const sections: { group: string; items: CategorySummary[] }[] = [];
	for (const cat of categories) {
		const current = sections[sections.length - 1];
		if (current && current.group === cat.group) {
			current.items.push(cat);
		} else {
			sections.push({ group: cat.group, items: [cat] });
		}
	}
	return sections;
}

export function CategoryList({ categories, onSelect }: Props) {
	return (
		<>
			{groupSections(categories).map((section) => (
				<section key={section.group} className="category-section">
					<h2 className="category-section__heading">{section.group}</h2>
					<ul className="category-list">
						{section.items.map((cat) => (
							<li key={cat.slug}>
								<button className="category-card" onClick={() => onSelect(cat)}>
									<div className="category-card__main">
										<strong>{cat.title}</strong>
										{cat.subtitle && (
											<span className="category-card__subtitle">{cat.subtitle}</span>
										)}
									</div>
									<span className={`category-card__status category-card__status--${cat.status}`}>
										{STATUS_LABEL[cat.status]}
									</span>
								</button>
							</li>
						))}
					</ul>
				</section>
			))}
		</>
	);
}

import { useState } from "react";
import type { CategorySummary } from "../types";
import { GroupIcon } from "./GroupIcon";

interface Props {
	categories: CategorySummary[];
	onSelect: (category: CategorySummary) => void;
	// Multiplayer only (see MultiplayerSetup.tsx): highlights one card as the
	// current pick. Single-player never passes this — there, clicking a card
	// navigates straight into that category, so there's never a "currently
	// selected, not yet committed" state to show.
	selectedSlug?: string;
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

function panelId(group: string): string {
	return `category-section-${group.toLowerCase().replace(/\s+/g, "-")}`;
}

export function CategoryList({ categories, onSelect, selectedSlug }: Props) {
	// Accordion — at most one section open at a time, none open on load. With
	// 26 categories across 4 sections, showing every card at once is exactly
	// the wall of text this grouping exists to replace; letting more than one
	// stay open would get back there a click or two later.
	const [openGroup, setOpenGroup] = useState<string | null>(null);

	return (
		<div className="category-sections">
			{groupSections(categories).map((section) => {
				const isOpen = section.group === openGroup;
				const playedCount = section.items.filter((cat) => cat.status !== "new").length;

				return (
					<div className="category-section" key={section.group}>
						<button
							type="button"
							className="category-section__header"
							aria-expanded={isOpen}
							aria-controls={panelId(section.group)}
							onClick={() => setOpenGroup(isOpen ? null : section.group)}
						>
							<span className="category-section__icon" aria-hidden="true">
								<GroupIcon group={section.group} />
							</span>
							<span className="category-section__text">
								<strong>{section.group}</strong>
								<span className="category-section__meta">
									{playedCount > 0
										? `${playedCount}/${section.items.length} played`
										: `${section.items.length} categories`}
								</span>
							</span>
							<svg
								className="category-section__chevron"
								data-open={isOpen}
								viewBox="0 0 24 24"
								width="20"
								height="20"
								aria-hidden="true"
							>
								<path
									d="M7 9.5 12 14.5 17 9.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.75"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
						<div className="category-section__body" data-expanded={isOpen} id={panelId(section.group)}>
							<div className="category-section__body-inner">
								<ul className="category-list">
									{section.items.map((cat) => (
										<li key={cat.slug}>
											<button
												className={
													"category-card" + (cat.slug === selectedSlug ? " category-card--selected" : "")
												}
												onClick={() => onSelect(cat)}
											>
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
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

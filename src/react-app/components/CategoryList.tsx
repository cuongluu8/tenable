import { useState } from "react";
import type { CategorySummary } from "../types";
import { GroupIcon } from "./GroupIcon";
import { formatAsOfDate } from "../lib/formatAsOfDate";

interface Props {
	categories: CategorySummary[];
	onSelect: (category: CategorySummary) => void;
	// Called after a category's progress has been reset on the server, so
	// the parent can refetch the list and pick up the reverted "new" status.
	// Single-player only — multiplayer never renders a reset control (see
	// the status !== "new" guard below: a fresh multiplayer pick has no
	// progress of its own to reset).
	onReset?: (slug: string) => void;
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

export function CategoryList({ categories, onSelect, onReset, selectedSlug }: Props) {
	// Accordion — at most one section open at a time, none open on load. With
	// 26 categories across 4 sections, showing every card at once is exactly
	// the wall of text this grouping exists to replace; letting more than one
	// stay open would get back there a click or two later.
	const [openGroup, setOpenGroup] = useState<string | null>(null);
	// Which card's reset is mid-confirm, and which is mid-request — separate
	// from openGroup since a reset can be confirmed independently of section
	// state. At most one of each at a time (there's only one list on screen).
	const [confirmingReset, setConfirmingReset] = useState<string | null>(null);
	const [resetting, setResetting] = useState<string | null>(null);

	async function doReset(slug: string) {
		setConfirmingReset(null);
		setResetting(slug);
		try {
			await fetch("/api/reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug }),
			});
			onReset?.(slug);
		} finally {
			setResetting(null);
		}
	}

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
										<li
											key={cat.slug}
											className={
												"category-card" + (cat.slug === selectedSlug ? " category-card--selected" : "")
											}
										>
											<button
												type="button"
												className="category-card__select"
												onClick={() => onSelect(cat)}
											>
												<div className="category-card__main">
													<strong>{cat.title}</strong>
													{cat.subtitle && (
														<span className="category-card__subtitle">{cat.subtitle}</span>
													)}
													{formatAsOfDate(cat.asOfDate) && (
														<span className="category-card__as-of">{formatAsOfDate(cat.asOfDate)}</span>
													)}
												</div>
												<span className={`category-card__status category-card__status--${cat.status}`}>
													{STATUS_LABEL[cat.status]}
												</span>
											</button>
											{/* Reset only makes sense once a round exists — a "new" category
												has no progress to throw away. Omitted entirely in multiplayer
												(no onReset passed there): resetting is a single-player-progress
												concept, and multiplayer rounds aren't persisted per device. */}
											{onReset &&
												cat.status !== "new" &&
												(confirmingReset === cat.slug ? (
													<span className="category-card__reset-confirm">
														<span>Reset?</span>
														<button
															type="button"
															className="category-card__reset-confirm-yes"
															onClick={() => doReset(cat.slug)}
															disabled={resetting === cat.slug}
														>
															Yes
														</button>
														<button
															type="button"
															className="category-card__reset-confirm-cancel"
															onClick={() => setConfirmingReset(null)}
															disabled={resetting === cat.slug}
														>
															Cancel
														</button>
													</span>
												) : (
													<button
														type="button"
														className="category-card__reset"
														aria-label={`Reset ${cat.title}`}
														onClick={() => setConfirmingReset(cat.slug)}
														disabled={resetting === cat.slug}
													>
														↻ Reset
													</button>
												))}
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

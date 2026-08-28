import { useEffect, useState } from "react";
import { CategoryList } from "../components/CategoryList";
import type { CategoriesResponse, CategorySummary } from "../types";
import type { MpCategory } from "./state";

interface Props {
	onStart: (category: MpCategory) => void;
	// Back to the roster step (MultiplayerPlayers.tsx), not all the way home —
	// the players are already decided by the time this screen shows, so
	// there's no reason to make someone re-enter them over a single misclick.
	onBack: () => void;
}

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; categories: CategorySummary[] };

// Second step of multiplayer setup (see MultiplayerPlayers.tsx for the
// first): pick a category once the roster is settled. Reuses the exact
// same CategoryList component and /api/categories data single-player's own
// category screen uses (grouped sections, per-category status, everything)
// — the two pickers are meant to look and behave identically, not a cut-
// down variant for multiplayer. The one real difference is unavoidable:
// single-player's CategoryList click navigates straight into that category,
// but this screen still has to wait for "Start Game", so a pick here just
// records the choice (highlighted via CategoryList's selectedSlug prop)
// rather than starting anything — nothing is pre-selected on load, matching
// single-player's list having no concept of a "default" category either.
export function MultiplayerCategoryPick({ onStart, onBack }: Props) {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [categorySlug, setCategorySlug] = useState("");

	useEffect(() => {
		fetch("/api/categories")
			.then((res) => {
				if (!res.ok) throw new Error("Couldn't load categories");
				return res.json() as Promise<CategoriesResponse>;
			})
			.then((data) => setLoad({ status: "ready", categories: data.categories }))
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, []);

	const selectedCategory = load.status === "ready" ? load.categories.find((c) => c.slug === categorySlug) : undefined;

	function start() {
		if (!selectedCategory) return;
		onStart({
			slug: selectedCategory.slug,
			title: selectedCategory.title,
			subtitle: selectedCategory.subtitle,
			statLabel: selectedCategory.statLabel,
			answerCount: selectedCategory.answerCount,
		});
	}

	return (
		<div className="mp-setup">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Choose a category</h2>

			{load.status === "loading" && <p>Loading categories…</p>}
			{load.status === "error" && <p>{load.message}</p>}
			{load.status === "ready" && (
				<>
					<CategoryList categories={load.categories} onSelect={(cat) => setCategorySlug(cat.slug)} selectedSlug={categorySlug} />
					{/* CategoryList's accordion collapses a section once you move on to
					    another one, so the highlighted card (see App.css's
					    .category-card--selected) can end up scrolled out of view — this
					    line is the one thing that stays visible regardless of which
					    section is open. */}
					{selectedCategory && <p className="mp-setup__selected">Selected: {selectedCategory.title}</p>}
				</>
			)}

			<button type="button" className="mp-setup__start" onClick={start} disabled={!selectedCategory}>
				Start Game
			</button>
		</div>
	);
}

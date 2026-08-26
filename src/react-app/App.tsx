import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CategoryList } from "./components/CategoryList";
import { Logo } from "./components/Logo";
import { PlayScreen } from "./components/PlayScreen";
import type { CategoriesResponse, Category } from "./types";

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; data: CategoriesResponse };

// A category being played lives at /play/:slug (not just in memory) so a
// refresh, a shared link, or the browser's back/forward buttons land back on
// the same category instead of always bouncing to the category list — see
// the popstate listener below for the back/forward half of that.
function slugFromPath(): string | null {
	return /^\/play\/([^/]+)$/.exec(window.location.pathname)?.[1] ?? null;
}

function App() {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [activeSlug, setActiveSlug] = useState<string | null>(() => slugFromPath());

	const loadCategories = useCallback(() => {
		fetch("/api/categories")
			.then((res) => {
				if (!res.ok) throw new Error("Couldn't load categories");
				return res.json() as Promise<CategoriesResponse>;
			})
			.then((data) => setLoad({ status: "ready", data }))
			.catch((err: Error) => setLoad({ status: "error", message: err.message }));
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	// Browser back/forward: the URL has already changed by the time this
	// fires, so just resync state to match it (and refresh stats when that
	// lands back on the category list, same as handleBack does).
	useEffect(() => {
		function handlePopState() {
			const slug = slugFromPath();
			setActiveSlug(slug);
			if (!slug) loadCategories();
		}
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [loadCategories]);

	function handleSelect(cat: Category) {
		window.history.pushState(null, "", `/play/${cat.slug}`);
		setActiveSlug(cat.slug);
	}

	function handleBack() {
		window.history.pushState(null, "", "/");
		setActiveSlug(null);
		loadCategories(); // refresh statuses/streak after playing
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBack} />;
	}

	return (
		<div className="screen">
			<header className="header">
				<Logo className="logo" />
				<h1>Tenable</h1>
				<p className="subtitle">Top 10 football trivia</p>
			</header>

			{load.status === "loading" && <p>Loading categories…</p>}
			{load.status === "error" && <p>{load.message}</p>}
			{load.status === "ready" && (
				<>
					<div className="summary-row">
						{load.data.streak.current > 0 && (
							<span className="streak">🔥 {load.data.streak.current}-day streak</span>
						)}
						<span className="lifetime">
							{load.data.lifetime.totalWon} / {load.data.lifetime.totalPlayed} won
						</span>
					</div>
					<CategoryList categories={load.data.categories} onSelect={handleSelect} />
				</>
			)}
		</div>
	);
}

export default App;

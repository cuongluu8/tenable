import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CategoryList } from "./components/CategoryList";
import { PlayScreen } from "./components/PlayScreen";
import type { CategoriesResponse } from "./types";

type LoadState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; data: CategoriesResponse };

function App() {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

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

	function handleBack() {
		setActiveSlug(null);
		loadCategories(); // refresh statuses/streak after playing
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBack} />;
	}

	return (
		<div className="screen">
			<header className="header">
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
					<CategoryList
						categories={load.data.categories}
						onSelect={(cat) => setActiveSlug(cat.slug)}
					/>
				</>
			)}
		</div>
	);
}

export default App;

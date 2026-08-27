import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CategoryList } from "./components/CategoryList";
import { Logo } from "./components/Logo";
import { PlayScreen } from "./components/PlayScreen";
import { Multiplayer } from "./multiplayer/Multiplayer";
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

// Same reasoning as slugFromPath() above, one level simpler since
// multiplayer has no per-session slug of its own (v1 is single-device
// pass-and-play — see src/react-app/multiplayer/state.ts).
function isMultiplayerPath(): boolean {
	return window.location.pathname === "/multiplayer";
}

function App() {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [activeSlug, setActiveSlug] = useState<string | null>(() => slugFromPath());
	const [multiplayerActive, setMultiplayerActive] = useState<boolean>(() => isMultiplayerPath());

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
			const mp = isMultiplayerPath();
			setActiveSlug(slug);
			setMultiplayerActive(mp);
			if (!slug && !mp) loadCategories();
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

	function handleMultiplayerSelect() {
		window.history.pushState(null, "", "/multiplayer");
		setMultiplayerActive(true);
	}

	function handleMultiplayerBack() {
		window.history.pushState(null, "", "/");
		setMultiplayerActive(false);
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBack} />;
	}

	if (multiplayerActive) {
		return <Multiplayer onBack={handleMultiplayerBack} />;
	}

	return (
		<div className="screen">
			<header className="header">
				<Logo className="logo" />
				<h1>Tenable</h1>
				<p className="subtitle">Top 10 football trivia</p>
			</header>

			<button type="button" onClick={handleMultiplayerSelect}>
				🎮 Multiplayer (pass and play)
			</button>

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

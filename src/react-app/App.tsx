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

// The single-player category list itself, one level up from a specific
// round — /play with no slug. Kept as its own path (not folded into "/")
// so the same back/forward/refresh reasoning above applies to it too: the
// home screen is just the single-player/multiplayer mode choice, and
// landing on /play directly should show the list, not bounce to home.
function isCategoryListPath(): boolean {
	return window.location.pathname === "/play";
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
	const [categoryListActive, setCategoryListActive] = useState<boolean>(() => isCategoryListPath());
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

	// The category list's own data is only ever needed once the player is
	// actually looking at it — the home screen below is just a mode picker
	// now and has nothing to show from this fetch, so there's no reason to
	// run it on every app load the way it used to.
	useEffect(() => {
		if (categoryListActive) loadCategories();
	}, [categoryListActive, loadCategories]);

	// Browser back/forward: the URL has already changed by the time this
	// fires, so just resync state to match it. Landing back on /play this way
	// is covered by the effect above (categoryListActive flipping true fires
	// it); returning from an actual round needs its own explicit refresh
	// (see handleBackToCategoryList) since categoryListActive never actually
	// goes false while a round is active — it stays true underneath, so
	// coming back to it isn't a state change the effect would see.
	useEffect(() => {
		function handlePopState() {
			setActiveSlug(slugFromPath());
			setCategoryListActive(isCategoryListPath());
			setMultiplayerActive(isMultiplayerPath());
		}
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	function handleSinglePlayerSelect() {
		window.history.pushState(null, "", "/play");
		setCategoryListActive(true);
	}

	function handleMultiplayerSelect() {
		window.history.pushState(null, "", "/multiplayer");
		setMultiplayerActive(true);
	}

	function handleSelect(cat: Category) {
		window.history.pushState(null, "", `/play/${cat.slug}`);
		setActiveSlug(cat.slug);
	}

	function handleBackToCategoryList() {
		window.history.pushState(null, "", "/play");
		setActiveSlug(null);
		loadCategories(); // refresh statuses/streak after playing
	}

	function handleBackToHome() {
		window.history.pushState(null, "", "/");
		setActiveSlug(null);
		setCategoryListActive(false);
		setMultiplayerActive(false);
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBackToCategoryList} />;
	}

	if (multiplayerActive) {
		return <Multiplayer onBack={handleBackToHome} />;
	}

	if (categoryListActive) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={handleBackToHome}>
					← Back
				</button>
				<h2>Single player</h2>

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
							onSelect={handleSelect}
							onReset={loadCategories}
						/>
					</>
				)}
			</div>
		);
	}

	return (
		<div className="screen">
			<header className="header">
				<Logo className="logo" />
				<h1>Tenable</h1>
				<p className="subtitle">Top 10 football trivia</p>
			</header>

			<div className="mode-picker">
				<button type="button" className="mode-button" onClick={handleSinglePlayerSelect}>
					<strong>🏆 Single player</strong>
					<span>Play the Top 10 solo, at your own pace</span>
				</button>
				<button type="button" className="mode-button" onClick={handleMultiplayerSelect}>
					<strong>🎮 Multiplayer</strong>
					<span>Pass the device around and take turns</span>
				</button>
			</div>
		</div>
	);
}

export default App;

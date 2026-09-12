import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CategoryList } from "./components/CategoryList";
import { Logo } from "./components/Logo";
import { PlayScreen } from "./components/PlayScreen";
import { SetsModeRoute } from "./components/SetsModeRoute";
import { ClubBadgeSetPlay } from "./clubBadges/ClubBadgeSetPlay";
import { ClubBadgeSets } from "./clubBadges/ClubBadgeSets";
import { Multiplayer } from "./multiplayer/Multiplayer";
import { TeammateSetPlay } from "./teammates/TeammateSetPlay";
import { TeammateSets } from "./teammates/TeammateSets";
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

// The single-player category list itself, one level under the single-player
// mode picker (see isSinglePlayerHomePath below) — /play with no slug. Kept
// as its own path (not folded into the picker) so the same back/forward/
// refresh reasoning above applies to it too.
function isCategoryListPath(): boolean {
	return window.location.pathname === "/play";
}

// Same reasoning as slugFromPath() above, one level simpler since
// multiplayer has no per-session slug of its own (v1 is single-device
// pass-and-play — see src/react-app/multiplayer/state.ts).
function isMultiplayerPath(): boolean {
	return window.location.pathname === "/multiplayer";
}

// Single player's own mode picker (Daily Categories vs Club Run vs
// Teammate Tell, solo) — sits between home and any of those three, the
// same role
// Multiplayer's internal game-type picker plays for the multiplayer side
// (see Multiplayer.tsx) but as its own route here since single-player's two
// modes are otherwise-unrelated top-level screens (PlayScreen vs
// ClubBadgeSets), not steps of one shared flow the way multiplayer's
// roster is.
function isSinglePlayerHomePath(): boolean {
	return window.location.pathname === "/single-player";
}

// Solo "guess the player" and "who am I?" are each a "Sets" mode -- a
// picker plus one level of set-play underneath it (see components/
// SetsModeRoute.tsx, which owns everything under these base paths).
// This only has to answer "is the URL under here at all", not which of
// the picker/play sub-views -- SetsModeRoute figures that out itself
// once App.tsx mounts it.
const CLUB_BADGES_BASE_PATH = "/single-player/club-badges";
const TEAMMATES_BASE_PATH = "/single-player/teammates";

function isUnderPath(base: string): boolean {
	return window.location.pathname === base || window.location.pathname.startsWith(`${base}/`);
}

function App() {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [activeSlug, setActiveSlug] = useState<string | null>(() => slugFromPath());
	const [categoryListActive, setCategoryListActive] = useState<boolean>(() => isCategoryListPath());
	const [multiplayerActive, setMultiplayerActive] = useState<boolean>(() => isMultiplayerPath());
	const [singlePlayerHomeActive, setSinglePlayerHomeActive] = useState<boolean>(() => isSinglePlayerHomePath());
	const [clubBadgesActive, setClubBadgesActive] = useState<boolean>(() => isUnderPath(CLUB_BADGES_BASE_PATH));
	const [teammatesActive, setTeammatesActive] = useState<boolean>(() => isUnderPath(TEAMMATES_BASE_PATH));

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
	//
	// clubBadgesActive/teammatesActive only ever need the prefix check --
	// everything underneath (picker vs. a specific set, which set, a retry
	// id) is SetsModeRoute's own popstate listener's job, not this one's.
	useEffect(() => {
		function handlePopState() {
			setActiveSlug(slugFromPath());
			setCategoryListActive(isCategoryListPath());
			setMultiplayerActive(isMultiplayerPath());
			setSinglePlayerHomeActive(isSinglePlayerHomePath());
			setClubBadgesActive(isUnderPath(CLUB_BADGES_BASE_PATH));
			setTeammatesActive(isUnderPath(TEAMMATES_BASE_PATH));
		}
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	function handleSinglePlayerSelect() {
		window.history.pushState(null, "", "/single-player");
		setSinglePlayerHomeActive(true);
	}

	function handleMultiplayerSelect() {
		window.history.pushState(null, "", "/multiplayer");
		setMultiplayerActive(true);
	}

	function handleDailyCategoriesSelect() {
		window.history.pushState(null, "", "/play");
		setSinglePlayerHomeActive(false);
		setCategoryListActive(true);
	}

	function handleSoloClubBadgesSelect() {
		window.history.pushState(null, "", CLUB_BADGES_BASE_PATH);
		setSinglePlayerHomeActive(false);
		setClubBadgesActive(true);
	}

	function handleSoloTeammatesSelect() {
		window.history.pushState(null, "", TEAMMATES_BASE_PATH);
		setSinglePlayerHomeActive(false);
		setTeammatesActive(true);
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

	// One level up from either single-player mode (Daily Categories, Club
	// Run, or Teammate Tell) back to the picker between them — not all
	// the way home, same "back goes up one step" reasoning as
	// handleBackToCategoryList. Just flips the two Sets modes off here --
	// unmounting SetsModeRoute is itself the reset for whatever picker/
	// play/retry state it was holding, nothing to clear by hand anymore.
	function handleBackToSinglePlayerHome() {
		window.history.pushState(null, "", "/single-player");
		setCategoryListActive(false);
		setClubBadgesActive(false);
		setTeammatesActive(false);
		setSinglePlayerHomeActive(true);
	}

	function handleBackToHome() {
		window.history.pushState(null, "", "/");
		setActiveSlug(null);
		setCategoryListActive(false);
		setMultiplayerActive(false);
		setSinglePlayerHomeActive(false);
		setClubBadgesActive(false);
		setTeammatesActive(false);
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBackToCategoryList} />;
	}

	if (multiplayerActive) {
		return <Multiplayer onBack={handleBackToHome} />;
	}

	if (clubBadgesActive) {
		return (
			<SetsModeRoute
				basePath={CLUB_BADGES_BASE_PATH}
				Picker={ClubBadgeSets}
				Play={ClubBadgeSetPlay}
				onExitToParent={handleBackToSinglePlayerHome}
			/>
		);
	}

	if (teammatesActive) {
		return (
			<SetsModeRoute
				basePath={TEAMMATES_BASE_PATH}
				Picker={TeammateSets}
				Play={TeammateSetPlay}
				onExitToParent={handleBackToSinglePlayerHome}
			/>
		);
	}

	if (categoryListActive) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={handleBackToSinglePlayerHome}>
					← Back
				</button>
				<h2>Daily categories</h2>

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

	if (singlePlayerHomeActive) {
		return (
			<div className="screen">
				<button type="button" className="back-link" onClick={handleBackToHome}>
					← Back
				</button>
				<h2>Single player</h2>

				<div className="mode-picker">
					<button type="button" className="mode-button" onClick={handleDailyCategoriesSelect}>
						<strong>🏆 Daily categories</strong>
						<span>Play the Top 10 solo, at your own pace</span>
					</button>
					<button type="button" className="mode-button" onClick={handleSoloClubBadgesSelect}>
						<strong>🛡️ Club Run</strong>
						<span>Name them from the clubs they've played for</span>
					</button>
					<button type="button" className="mode-button" onClick={handleSoloTeammatesSelect}>
						<strong>🤝 Teammate Tell</strong>
						<span>Name the mystery player from their former teammates</span>
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="screen">
			<header className="header">
				<Logo className="logo" />
				<h1>Top-10 Tension</h1>
				<p className="subtitle">Top 10 football trivia</p>
			</header>

			<div className="mode-picker">
				<button type="button" className="mode-button" onClick={handleSinglePlayerSelect}>
					<strong>🏆 Single player</strong>
					<span>Play solo, at your own pace</span>
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

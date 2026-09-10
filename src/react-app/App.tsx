import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { CategoryList } from "./components/CategoryList";
import { Logo } from "./components/Logo";
import { PlayScreen } from "./components/PlayScreen";
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

// Single player's own mode picker (Daily Categories vs Guess the Player,
// solo) — sits between home and either of those two, the same role
// Multiplayer's internal game-type picker plays for the multiplayer side
// (see Multiplayer.tsx) but as its own route here since single-player's two
// modes are otherwise-unrelated top-level screens (PlayScreen vs
// ClubBadgeSets), not steps of one shared flow the way multiplayer's
// roster is.
function isSinglePlayerHomePath(): boolean {
	return window.location.pathname === "/single-player";
}

// Solo "guess the player" -- one level under the single-player picker.
// Unlike multiplayer's own instance of this game (still a fresh random
// draw every time, see GuessThePlayer.tsx), single player's now shows the
// Sets picker (ClubBadgeSets.tsx, 2026-09-08) instead of jumping straight
// into a round -- ten curated, nameable rounds a player returns to and
// completes at their own pace, not a slug-worthy "session" of its own
// either, same reasoning as before.
function isClubBadgeSetsPath(): boolean {
	return window.location.pathname === "/single-player/club-badges";
}

// Solo "who am I? I played with..." -- one level under the single-player
// picker, exactly the same shape as the club-badges entry: this path is
// the Sets picker (TeammateSets.tsx), not a round -- eleven curated,
// nameable rounds a player returns to and completes at their own pace
// (see src/worker/lib/teammateSets.ts), progress saved locally.
function isSoloTeammatesPath(): boolean {
	return window.location.pathname === "/single-player/teammates";
}

// One level under the "Who am I?" Sets picker -- actually playing a
// specific set. Slugged by number since TEAMMATE_SETS is 1-indexed and
// unnamed beyond "Set N" (teammateSets.ts). ?retry=<questionId> narrows
// the session to replaying just that one already-answered question
// (TeammateSets.tsx's per-question retry). Mirror of
// clubBadgeSetIdFromPath.
function teammateSetIdFromPath(): number | null {
	const match = /^\/single-player\/teammates\/set\/(\d+)$/.exec(window.location.pathname);
	return match ? Number(match[1]) : null;
}
function teammateSetRetryQuestionId(): number | undefined {
	const raw = new URLSearchParams(window.location.search).get("retry");
	const parsed = raw ? Number(raw) : NaN;
	return Number.isInteger(parsed) ? parsed : undefined;
}

// One level under the Sets picker -- actually playing a specific set.
// Slugged by number (not a name) since CLUB_BADGE_SETS itself is 1-indexed
// and unnamed beyond "Set N" (clubBadgeSets.ts). ?retry=<questionId>
// narrows the session to replaying just that one already-answered
// question (ClubBadgeSets.tsx's per-question retry) instead of whatever
// else in the set is still unanswered.
function clubBadgeSetIdFromPath(): number | null {
	const match = /^\/single-player\/club-badges\/set\/(\d+)$/.exec(window.location.pathname);
	return match ? Number(match[1]) : null;
}
function clubBadgeSetRetryQuestionId(): number | undefined {
	const raw = new URLSearchParams(window.location.search).get("retry");
	const parsed = raw ? Number(raw) : NaN;
	return Number.isInteger(parsed) ? parsed : undefined;
}

function App() {
	const [load, setLoad] = useState<LoadState>({ status: "loading" });
	const [activeSlug, setActiveSlug] = useState<string | null>(() => slugFromPath());
	const [categoryListActive, setCategoryListActive] = useState<boolean>(() => isCategoryListPath());
	const [multiplayerActive, setMultiplayerActive] = useState<boolean>(() => isMultiplayerPath());
	const [singlePlayerHomeActive, setSinglePlayerHomeActive] = useState<boolean>(() => isSinglePlayerHomePath());
	const [clubBadgeSetsActive, setClubBadgeSetsActive] = useState<boolean>(() => isClubBadgeSetsPath());
	const [clubBadgeSetId, setClubBadgeSetId] = useState<number | null>(() => clubBadgeSetIdFromPath());
	const [clubBadgeSetRetryId, setClubBadgeSetRetryId] = useState<number | undefined>(() => clubBadgeSetRetryQuestionId());
	const [soloTeammatesActive, setSoloTeammatesActive] = useState<boolean>(() => isSoloTeammatesPath());
	const [teammateSetId, setTeammateSetId] = useState<number | null>(() => teammateSetIdFromPath());
	const [teammateSetRetryId, setTeammateSetRetryId] = useState<number | undefined>(() => teammateSetRetryQuestionId());

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
			setSinglePlayerHomeActive(isSinglePlayerHomePath());
			setClubBadgeSetsActive(isClubBadgeSetsPath());
			setClubBadgeSetId(clubBadgeSetIdFromPath());
			setClubBadgeSetRetryId(clubBadgeSetRetryQuestionId());
			setSoloTeammatesActive(isSoloTeammatesPath());
			setTeammateSetId(teammateSetIdFromPath());
			setTeammateSetRetryId(teammateSetRetryQuestionId());
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
		window.history.pushState(null, "", "/single-player/club-badges");
		setSinglePlayerHomeActive(false);
		setClubBadgeSetsActive(true);
	}

	function handleSoloTeammatesSelect() {
		window.history.pushState(null, "", "/single-player/teammates");
		setSinglePlayerHomeActive(false);
		setSoloTeammatesActive(true);
	}

	// Enters a specific set's play view -- ClubBadgeSets.tsx's "Play"/
	// "Resume" (no questionId) or its per-question "Retry" (with one).
	function handlePlayClubBadgeSet(setId: number, onlyQuestionId?: number) {
		const query = onlyQuestionId ? `?retry=${onlyQuestionId}` : "";
		window.history.pushState(null, "", `/single-player/club-badges/set/${setId}${query}`);
		setClubBadgeSetsActive(false);
		setClubBadgeSetId(setId);
		setClubBadgeSetRetryId(onlyQuestionId);
	}

	// Back from a set's play view to the Sets picker -- one level up, not
	// all the way to the single-player mode picker, same "back goes up one
	// step" reasoning as handleBackToCategoryList/handleBackToSinglePlayerHome.
	function handleExitClubBadgeSetPlay() {
		window.history.pushState(null, "", "/single-player/club-badges");
		setClubBadgeSetId(null);
		setClubBadgeSetRetryId(undefined);
		setClubBadgeSetsActive(true);
	}

	// "Who am I?" Sets -- exact mirror of handlePlayClubBadgeSet /
	// handleExitClubBadgeSetPlay above.
	function handlePlayTeammateSet(setId: number, onlyQuestionId?: number) {
		const query = onlyQuestionId ? `?retry=${onlyQuestionId}` : "";
		window.history.pushState(null, "", `/single-player/teammates/set/${setId}${query}`);
		setSoloTeammatesActive(false);
		setTeammateSetId(setId);
		setTeammateSetRetryId(onlyQuestionId);
	}

	function handleExitTeammateSetPlay() {
		window.history.pushState(null, "", "/single-player/teammates");
		setTeammateSetId(null);
		setTeammateSetRetryId(undefined);
		setSoloTeammatesActive(true);
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

	// One level up from either single-player mode (Daily Categories or Guess
	// the Player) back to the picker between them — not all the way home,
	// same "back goes up one step" reasoning as handleBackToCategoryList.
	function handleBackToSinglePlayerHome() {
		window.history.pushState(null, "", "/single-player");
		setCategoryListActive(false);
		setClubBadgeSetsActive(false);
		setClubBadgeSetId(null);
		setClubBadgeSetRetryId(undefined);
		setSoloTeammatesActive(false);
		setTeammateSetId(null);
		setTeammateSetRetryId(undefined);
		setSinglePlayerHomeActive(true);
	}

	function handleBackToHome() {
		window.history.pushState(null, "", "/");
		setActiveSlug(null);
		setCategoryListActive(false);
		setMultiplayerActive(false);
		setSinglePlayerHomeActive(false);
		setClubBadgeSetsActive(false);
		setClubBadgeSetId(null);
		setClubBadgeSetRetryId(undefined);
		setSoloTeammatesActive(false);
		setTeammateSetId(null);
		setTeammateSetRetryId(undefined);
	}

	if (activeSlug) {
		return <PlayScreen slug={activeSlug} onBack={handleBackToCategoryList} />;
	}

	if (multiplayerActive) {
		return <Multiplayer onBack={handleBackToHome} />;
	}

	if (clubBadgeSetId !== null) {
		return (
			<ClubBadgeSetPlay
				setId={clubBadgeSetId}
				onlyQuestionId={clubBadgeSetRetryId}
				onExit={handleExitClubBadgeSetPlay}
			/>
		);
	}

	if (clubBadgeSetsActive) {
		return <ClubBadgeSets onPlay={handlePlayClubBadgeSet} onBack={handleBackToSinglePlayerHome} />;
	}

	if (teammateSetId !== null) {
		return (
			<TeammateSetPlay
				setId={teammateSetId}
				onlyQuestionId={teammateSetRetryId}
				onExit={handleExitTeammateSetPlay}
			/>
		);
	}

	if (soloTeammatesActive) {
		return <TeammateSets onPlay={handlePlayTeammateSet} onBack={handleBackToSinglePlayerHome} />;
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
						<strong>🛡️ Guess the player</strong>
						<span>Name them from the clubs they've played for</span>
					</button>
					<button type="button" className="mode-button" onClick={handleSoloTeammatesSelect}>
						<strong>🤝 Who am I?</strong>
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

import { useEffect, useState, type ComponentType } from "react";

interface SetsPickerProps {
	onPlay: (setId: number, onlyQuestionId?: number) => void;
	onBack: () => void;
}

interface SetsPlayProps {
	setId: number;
	onlyQuestionId?: number;
	onExit: () => void;
}

interface Props {
	// e.g. "/single-player/club-badges" or "/single-player/teammates".
	// Both this mode's picker (basePath itself) and its play view
	// (basePath + "/set/N") live under it; App.tsx only has to know the
	// URL is somewhere under here to mount this component at all (see its
	// own isXActive() prefix check) -- everything below that is this
	// component's own business.
	basePath: string;
	// ClubBadgeSets/TeammateSets and ClubBadgeSetPlay/TeammateSetPlay --
	// both pairs already share this exact prop shape (see components/
	// SetsPicker.tsx and components/useSetRound.ts, the engines they're
	// built on).
	Picker: ComponentType<SetsPickerProps>;
	Play: ComponentType<SetsPlayProps>;
	// Back from the picker to wherever App.tsx mounted this from (the
	// single-player mode picker) -- one level up, same "back goes up one
	// step" reasoning as the rest of App.tsx's own navigation.
	onExitToParent: () => void;
}

// Owns a "Sets" mode's own two-level sub-routing: `basePath` is the set
// picker, `basePath/set/N[?retry=id]` plays one (`retry` narrows a
// session to replaying just that one already-answered question, the
// picker's own per-question "Retry"). club-badges' "Guess the Player"
// and teammates' "Who am I?" are both shaped exactly like this --
// previously App.tsx hand-rolled matching path-checkers, three state
// slots (active/setId/retryId), three handlers, and two render branches
// PER mode; this component holds that once and App.tsx just mounts one
// instance per mode while the URL is under its basePath.
//
// Deliberately owns its OWN setId/retryId state and popstate listener
// rather than lifting them into App.tsx -- App.tsx only ever needs to
// know "is the URL under this basePath at all" (see its own isXActive()),
// so mounting/unmounting this component IS the reset when the player
// leaves the mode entirely; nothing here needs to be manually cleared
// the way App.tsx's old flat state slots did.
export function SetsModeRoute({ basePath, Picker, Play, onExitToParent }: Props) {
	// Plain string ops rather than building a RegExp out of `basePath` --
	// basePath is always a literal App.tsx passes in, but this avoids
	// ever having to think about whether it's regex-safe.
	function setIdFromPath(): number | null {
		const prefix = `${basePath}/set/`;
		if (!window.location.pathname.startsWith(prefix)) return null;
		const rest = window.location.pathname.slice(prefix.length);
		return /^\d+$/.test(rest) ? Number(rest) : null;
	}
	function retryIdFromPath(): number | undefined {
		const raw = new URLSearchParams(window.location.search).get("retry");
		const parsed = raw ? Number(raw) : NaN;
		return Number.isInteger(parsed) ? parsed : undefined;
	}

	const [setId, setSetId] = useState<number | null>(() => setIdFromPath());
	const [retryId, setRetryId] = useState<number | undefined>(() => retryIdFromPath());

	// Browser back/forward within this mode (e.g. from a set's play view
	// back to the picker, or vice versa via forward) -- the URL has
	// already changed by the time this fires, so just resync. Navigating
	// OUT of this mode entirely is handled by App.tsx's own popstate
	// listener unmounting this component, not by anything here.
	useEffect(() => {
		function handlePopState() {
			setSetId(setIdFromPath());
			setRetryId(retryIdFromPath());
		}
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handlePlay(id: number, onlyQuestionId?: number) {
		const query = onlyQuestionId ? `?retry=${onlyQuestionId}` : "";
		window.history.pushState(null, "", `${basePath}/set/${id}${query}`);
		setSetId(id);
		setRetryId(onlyQuestionId);
	}

	function handleExitPlay() {
		window.history.pushState(null, "", basePath);
		setSetId(null);
		setRetryId(undefined);
	}

	if (setId !== null) {
		return <Play setId={setId} onlyQuestionId={retryId} onExit={handleExitPlay} />;
	}
	return <Picker onPlay={handlePlay} onBack={onExitToParent} />;
}

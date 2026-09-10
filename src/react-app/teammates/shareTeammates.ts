// WhatsApp share for a finished "Who am I?" Set -- a straight sibling of
// clubBadges/shareSet.ts (see that file's own doc): one message format,
// built in one place, shared by TeammateSetPlay.tsx (right when a set is
// finished) and TeammateSets.tsx (re-sharing one done in an earlier
// session). Plain words, no emoji -- wa.me's redirect corrupts astral-
// plane characters into U+FFFD (confirmed 2026-09-08, WhatsApp's bug).
import { scoreBand, type ScoreBand } from "../clubBadges/state";

const BAND_LABEL: Record<ScoreBand, string> = {
	gold: "Gold",
	silver: "Silver",
	yellow: "Yellow",
	brown: "Brown",
	grey: "Grey",
};

// Links back to the SAME set's play view, not just the picker -- whoever
// gets the message jumps straight into the identical challenge. Works
// with no server-side state: a fresh device visiting that URL just sees
// an empty set (teammateSetsStorage.ts has nothing for it yet).
export function buildTeammateSetShareText(setId: number, setName: string, average: number): string {
	const label = BAND_LABEL[scoreBand(average)];
	const url = `${window.location.origin}/single-player/teammates/set/${setId}`;
	return `I scored ${average} (${label}) on Set ${setId}: ${setName} of "Who am I?" — name the mystery player from their old teammates. Think you can beat me? ${url}`;
}

// wa.me only PRE-FILLS WhatsApp's compose box -- the person still picks a
// recipient and hits send themselves, same as any "share to..." button.
export function shareTeammateSetViaWhatsApp(setId: number, setName: string, average: number): void {
	const text = buildTeammateSetShareText(setId, setName, average);
	window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

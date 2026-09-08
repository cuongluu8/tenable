// Shared by ClubBadgeSetPlay.tsx (right when a set is finished) and
// ClubBadgeSets.tsx (re-sharing a set completed in an earlier session) --
// one message format, built in one place, so the two don't quietly drift
// apart.
import { scoreBand, type ScoreBand } from "./state";

// Plain words, not emoji -- confirmed live (2026-09-08) that api.whatsapp.
// com's own wa.me redirect corrupts any astral-plane character (a medal or
// colored-circle emoji, i.e. anything needing a UTF-16 surrogate pair --
// U+10000 and above) into U+FFFD, the "�" replacement character. Verified
// this was WhatsApp's own doing, not a bug on this end: the exact string
// handed to encodeURIComponent (checked directly, both with the literal
// glyph and with an explicit \u{...} escape) had the correct codepoint and
// encoded to the correct 4-byte UTF-8 sequence every time -- the request
// this app sends is already correct, WhatsApp's redirect is what mangles
// it afterward. Plain text sidesteps that entirely (and reads fine on
// every WhatsApp client regardless of emoji support, not just this one).
const BAND_LABEL: Record<ScoreBand, string> = {
	gold: "Gold",
	silver: "Silver",
	yellow: "Yellow",
	brown: "Brown",
	grey: "Grey",
};

// Links back to the SAME set's play view, not just the Sets picker --
// letting whoever gets the message jump straight into the identical
// challenge rather than having to find it themselves. Works with no
// server-side state at all: a fresh device visiting that URL just sees
// an empty set (setsStorage.ts's own localStorage has nothing for it
// yet), same as anyone starting a set for the first time.
export function buildSetShareText(setId: number, setName: string, average: number): string {
	const label = BAND_LABEL[scoreBand(average)];
	const url = `${window.location.origin}/single-player/club-badges/set/${setId}`;
	return `I scored ${average} (${label}) on Set ${setId}: ${setName} of Guess the Player! Think you can beat me? ${url}`;
}

// wa.me only ever PRE-FILLS WhatsApp's own compose box with this text --
// opening it here is not the same as sending anything: the person who
// clicked this button still has to pick a recipient and hit send
// themselves, inside WhatsApp, same as any "share to..." button.
export function shareSetViaWhatsApp(setId: number, setName: string, average: number): void {
	const text = buildSetShareText(setId, setName, average);
	window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

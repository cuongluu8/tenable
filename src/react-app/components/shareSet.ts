// WhatsApp share for a finished "Sets" round, shared by both Set modes.
// One message format built in one place so club-badges' and teammates'
// shares can't quietly drift apart. Each mode gets its sharer from
// createSetSharer() in its own thin wrapper -- only the URL path segment
// and the one-clause mode blurb differ.
//
// Plain words, not emoji -- confirmed live (2026-09-08) that api.whatsapp.
// com's own wa.me redirect corrupts any astral-plane character (a medal
// or colored-circle emoji, i.e. anything needing a UTF-16 surrogate pair
// -- U+10000 and above) into U+FFFD, the "�" replacement character.
// Verified this was WhatsApp's own doing, not a bug on this end: the
// exact string handed to encodeURIComponent (checked directly, both with
// the literal glyph and with an explicit \u{...} escape) had the correct
// codepoint and encoded to the correct 4-byte UTF-8 sequence every time
// -- the request this app sends is already correct, WhatsApp's redirect
// is what mangles it afterward. Plain text sidesteps that entirely (and
// reads fine on every WhatsApp client regardless of emoji support).
import { scoreBand, type ScoreBand } from "./clubBadgesState";

const BAND_LABEL: Record<ScoreBand, string> = {
	gold: "Gold",
	silver: "Silver",
	yellow: "Yellow",
	brown: "Brown",
	grey: "Grey",
};

export interface SetSharer {
	buildSetShareText(setId: number, setName: string, average: number): string;
	// wa.me only ever PRE-FILLS WhatsApp's own compose box with this text
	// -- opening it is not the same as sending anything: the person who
	// clicked still has to pick a recipient and hit send themselves,
	// inside WhatsApp, same as any "share to..." button.
	shareSetViaWhatsApp(setId: number, setName: string, average: number): void;
}

export function createSetSharer(opts: {
	// The /single-player/<pathSegment>/set/<id> URL the message links to
	// -- pointing at the SAME set's play view, not just the picker, so
	// whoever gets the message jumps straight into the identical
	// challenge. Works with no server-side state: a fresh device visiting
	// that URL just sees an empty set (setsStorage.ts has nothing for it
	// yet).
	pathSegment: string;
	// The clause between "...Set 3: Velvet Wolf " and " Think you can beat
	// me?" -- e.g. "of Club Run!" or 'of "Teammate Tell" — name the
	// mystery player from their old teammates.'
	modeBlurb: string;
}): SetSharer {
	function buildSetShareText(setId: number, setName: string, average: number): string {
		const label = BAND_LABEL[scoreBand(average)];
		const url = `${window.location.origin}/single-player/${opts.pathSegment}/set/${setId}`;
		return `I scored ${average} (${label}) on Set ${setId}: ${setName} ${opts.modeBlurb} Think you can beat me? ${url}`;
	}

	return {
		buildSetShareText,
		shareSetViaWhatsApp(setId, setName, average) {
			const text = buildSetShareText(setId, setName, average);
			window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
		},
	};
}

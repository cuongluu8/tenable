// club-badges "Club Run -- Sets" WhatsApp share. Thin wrapper around the
// shared sharer (components/shareSet.ts) -- this file owns nothing but
// the URL segment and the mode blurb. Used by ClubBadgeSetPlay.tsx
// (right when a set is finished) and ClubBadgeSets.tsx (re-sharing one
// done in an earlier session).
import { createSetSharer } from "../components/shareSet";

export const { buildSetShareText, shareSetViaWhatsApp } = createSetSharer({
	pathSegment: "club-badges",
	modeBlurb: "of Club Run!",
});

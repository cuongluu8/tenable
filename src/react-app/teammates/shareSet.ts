// "Who am I? -- Sets" WhatsApp share. Thin wrapper around the shared
// sharer (components/shareSet.ts) -- this file owns nothing but the URL
// segment and the mode blurb. Used by TeammateSetPlay.tsx (right when a
// set is finished) and TeammateSets.tsx (re-sharing one done in an
// earlier session).
import { createSetSharer } from "../components/shareSet";

export const { buildSetShareText, shareSetViaWhatsApp } = createSetSharer({
	pathSegment: "teammates",
	modeBlurb: 'of "Who am I?" — name the mystery player from their old teammates.',
});

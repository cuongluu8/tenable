// Unit test for shareSet.ts's buildSetShareText -- the part of the
// WhatsApp sharer that's pure enough to test without opening a real
// window. shareSetViaWhatsApp itself (window.open) isn't covered here --
// there's nothing to assert on beyond "it was called with this exact
// string", which buildSetShareText already covers directly.
import { describe, expect, it } from "vitest";
import { createSetSharer } from "./shareSet";

describe("createSetSharer().buildSetShareText", () => {
	const sharer = createSetSharer({ pathSegment: "club-badges", modeBlurb: "of Club Run!" });

	it("builds the message with the right score band label and a link to the same set", () => {
		const text = sharer.buildSetShareText(3, "Velvet Wolf", 85);
		expect(text).toBe(
			`I scored 85 (Gold) on Set 3: Velvet Wolf of Club Run! Think you can beat me? ${window.location.origin}/single-player/club-badges/set/3`,
		);
	});

	it("bands the score using the same thresholds as scoreBand()", () => {
		expect(sharer.buildSetShareText(1, "Set", 40)).toContain("(Yellow)");
		expect(sharer.buildSetShareText(1, "Set", -5)).toContain("(Grey)");
	});

	it("never contains an astral-plane character (medal/colored-circle emoji) -- WhatsApp's own wa.me redirect corrupts those into U+FFFD, confirmed live 2026-09-08", () => {
		const text = sharer.buildSetShareText(1, "Set", 85);
		for (const ch of text) {
			expect(ch.codePointAt(0)).toBeLessThan(0x10000);
		}
	});

	it("a different mode's pathSegment/modeBlurb produces a differently-linked, differently-worded message", () => {
		const teammates = createSetSharer({ pathSegment: "teammates", modeBlurb: 'of "Teammate Tell"!' });
		const text = teammates.buildSetShareText(2, "Candid Ibex", 60);
		expect(text).toContain("/single-player/teammates/set/2");
		expect(text).toContain('of "Teammate Tell"!');
	});
});

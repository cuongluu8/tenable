import { useEffect, type RefObject } from "react";
import { getSafeViewport } from "../lib/safeViewport";

// Minimum breathing room to leave between the element and the edge of the
// safe zone once scrolled — enough that it isn't touching the keyboard/
// address-bar edge exactly, not a large empty gap.
const SAFE_MARGIN = 16;

// Keeps `ref`'s element inside the safe zone (see safeViewport.ts) while
// it's focused, by scrolling the page if needed — rather than relying on
// the browser's own native "scroll focused element into view" behavior.
// That native behavior is exactly what's unreliable here: on iOS Safari in
// particular, it races against the address bar's own collapse animation and
// the keyboard's open animation, both of which shrink the safe zone
// asynchronously *after* focus fires, and a scroll computed before they
// finish settling can still leave the element behind either one.
//
// Two checks cover that: one on focus (handles the synchronous/common
// case), and one on every visualViewport resize while focused (handles the
// keyboard/address-bar settling later, which is exactly when the safe zone
// actually finishes changing).
export function useKeepInSafeZone<T extends HTMLElement>(ref: RefObject<T | null>) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		function ensureVisible() {
			if (!el || document.activeElement !== el) return;
			const rect = el.getBoundingClientRect();
			const safe = getSafeViewport();
			const overflow = rect.bottom + SAFE_MARGIN - safe.bottom;
			if (overflow > 0) {
				window.scrollBy({ top: overflow, behavior: "smooth" });
			}
		}

		el.addEventListener("focus", ensureVisible);
		const vv = window.visualViewport;
		vv?.addEventListener("resize", ensureVisible);
		return () => {
			el.removeEventListener("focus", ensureVisible);
			vv?.removeEventListener("resize", ensureVisible);
		};
	}, [ref]);
}

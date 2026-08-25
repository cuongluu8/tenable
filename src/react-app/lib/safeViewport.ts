// The "safe zone": the actually-visible viewport, in layout-viewport
// pixels. On mobile this differs from `window.innerHeight` (and from a
// plain CSS `100vh`) once the on-screen keyboard — and, on iOS, the
// collapsing/expanding address bar — covers part of the screen without
// shrinking the layout viewport itself. Anything that needs to stay
// tappable/visible on mobile (a floating dropdown, a focused input) needs
// to be measured against this, not against window.innerHeight.
//
// This is the one shared definition of "safe" for the app — every piece of
// UI that cares about the keyboard/address-bar-covered area should read it
// from here rather than re-deriving its own visualViewport math (that
// divergence is exactly what made the previous attempt at this
// inconsistent: the dropdown's positioning and the focus-scroll behavior
// each had their own slightly different idea of what was visible).
export interface SafeViewport {
	top: number;
	bottom: number;
	height: number;
}

export function getSafeViewport(): SafeViewport {
	const vv = window.visualViewport;
	const top = vv?.offsetTop ?? 0;
	const height = vv?.height ?? window.innerHeight;
	return { top, height, bottom: top + height };
}

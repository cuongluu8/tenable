interface Props {
	className?: string;
}

// The app's mark: a "1" beside a football standing in for the "0" — reads
// as "10" (the show's Top 10 answer-list format the app is named for) and
// as a ball at the same time. Inline SVG, same rationale as GroupIcon:
// nothing to fetch, never 404s, themes for free via currentColor.
// Coordinates were checked by rendering this exact path data standalone at
// 3x size before wiring it in — freehand SVG numerals/shapes are easy to
// get subtly wrong (see GroupIcon's laurel wreath that read as a gear).
//
// Two animations, both driven purely by App.css (nothing here is
// animation-specific beyond the class names to hook):
// 1. A one-time stroke "draw-in" on mount, staggered digit → ball outline
//    → panel → spokes, so the mark appears to sketch itself rather than
//    just popping in.
// 2. Once drawn, the ball keeps a slow, continuous spin — a small "always
//    in play" detail. Only the .logo__ball group rotates; the "1" stays
//    still, which is what keeps it reading as a numeral instead of a
//    spinning number.
// Both are skipped under prefers-reduced-motion (see App.css).
export function Logo({ className }: Props) {
	return (
		<svg
			className={className}
			viewBox="0 0 96 58"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path className="logo__digit" d="M11 17 20 7 20 51M11 51 29 51" strokeWidth={5} />
			<g className="logo__ball">
				<circle className="logo__ball-outline" cx="64" cy="29" r="21" strokeWidth={4.5} />
				<path
					className="logo__ball-panel"
					d="M64 21.3 71.3 26.6 68.5 35.2 59.5 35.2 56.7 26.6Z"
					strokeWidth={3}
					fill="currentColor"
					fillOpacity={0.15}
				/>
				<path
					className="logo__ball-spokes"
					d="M64 21.3 64 8M71.3 26.6 84 22.5M68.5 35.2 76.4 46M59.5 35.2 51.7 46M56.7 26.6 44 22.5"
					strokeWidth={3}
				/>
			</g>
		</svg>
	);
}

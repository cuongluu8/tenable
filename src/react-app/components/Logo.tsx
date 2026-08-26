interface Props {
	className?: string;
}

// The app's mark, now a full badge/medallion rather than a bare pictogram —
// a circular rim (classic sports-crest shape) around the same "1 + football
// = 10" mark as before: reads as "10" (the show's Top 10 answer-list
// format) and as a ball at once. Inline SVG, same rationale as GroupIcon:
// nothing to fetch, never 404s.
//
// All shape coordinates were checked by rendering this exact markup
// standalone at 3x size before wiring it in — freehand SVG is easy to get
// subtly wrong at a glance (see GroupIcon's laurel wreath that read as a
// gear at actual size).
//
// Animation, all in App.css (this file only adds the class/id hooks):
// 1. The rim scales and fades in first.
// 2. Then the digit and ball draw themselves on, stroke by stroke.
// 3. Once drawn, the ball keeps a slow continuous spin — only the
//    .logo__ball group rotates, so the "1" stays a numeral instead of also
//    spinning.
// 4. A soft diagonal shine periodically sweeps across the badge.
// 5. The whole mark has a slow, faint breathing glow.
// All five are skipped under prefers-reduced-motion (see App.css) — the
// badge just renders complete and still.
export function Logo({ className }: Props) {
	return (
		<svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
			<defs>
				<linearGradient id="logoStroke" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#bbf7d0" />
					<stop offset="55%" stopColor="#4ade80" />
					<stop offset="100%" stopColor="#16a34a" />
				</linearGradient>
				<linearGradient id="logoShine" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
					<stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
					<stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
				</linearGradient>
				<clipPath id="logoClip">
					<circle cx="60" cy="60" r="50" />
				</clipPath>
			</defs>

			<circle className="logo__ring" cx="60" cy="60" r="52" stroke="url(#logoStroke)" strokeWidth={3} />

			<g
				transform="translate(8 28) scale(1.13)"
				stroke="url(#logoStroke)"
				strokeLinecap="round"
				strokeLinejoin="round"
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
			</g>

			{/* The periodic shine: a skewed gradient bar, clipped to the rim's
			    interior, translated across by the CSS animation. Painted last
			    (on top of the digit/ball) and screen-blended so it actually
			    brightens the mark's own strokes as it passes, not just the
			    dark gaps around them — layering it behind, the first attempt,
			    only lightened the background and was barely visible. */}
			<g clipPath="url(#logoClip)">
				<rect
					className="logo__shine"
					x="-30"
					y="-10"
					width="26"
					height="140"
					fill="url(#logoShine)"
					transform="skewX(-20)"
				/>
			</g>
		</svg>
	);
}

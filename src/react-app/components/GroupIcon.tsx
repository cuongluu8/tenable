interface Props {
	group: string;
}

// One small monoline icon per home-page group. Plain inline SVG — no
// external image files or icon fonts — so it's self-contained (no network
// fetch, no 404 risk) and themeable purely through `currentColor` (the
// badge around it sets the color; see .category-section__icon in App.css).
// Falls back to a plain dot for any future group without a bespoke icon
// yet, rather than rendering nothing.
export function GroupIcon({ group }: Props) {
	switch (group) {
		case "This Season":
			return <BallIcon />;
		case "Club Goalscorers":
			return <GoalIcon />;
		case "Recent Winners":
			return <TrophyIcon />;
		case "All-Time Records":
			return <CrownIcon />;
		default:
			return <DotIcon />;
	}
}

const stroke = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
};

// A classic pentagon-panel football — the pentagon's five vertices each
// extend outward to the ball's rim, which is what actually reads as
// "football" at a glance rather than just "circle with a shape in it".
function BallIcon() {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8.7 15.1 11 13.9 14.7 10.1 14.7 8.9 11Z" />
			<path d="M12 8.7 12 3M15.1 11 20.6 9.2M13.9 14.7 17.3 19.3M10.1 14.7 6.7 19.3M8.9 11 3.4 9.2" />
		</svg>
	);
}

// A goal frame with a netting grid and the ball crossing the line —
// distinct from the season ball icon by being about scoring specifically.
function GoalIcon() {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
			<path d="M4 4V16M20 4V16M4 4H20" />
			<path d="M9 4V16M14 4V16M4 8H20M4 12H20" />
			<circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
		</svg>
	);
}

function TrophyIcon() {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
			<path d="M8 3H16V6A4 4 0 0 1 8 6Z" />
			<path d="M8 4C5 4 5 8 8 8M16 4C19 4 19 8 16 8" />
			<path d="M12 10V14" />
			<path d="M9.5 14H14.5L16 17H8Z" />
		</svg>
	);
}

// A crown — the "greatest of all time" read for the all-time, by-count
// categories, distinct from the single-cup "Recent Winners" trophy.
function CrownIcon() {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
			<path d="M5 17 7 7 10 12 12 5 14 12 17 7 19 17" />
			<path d="M5 17V20H19V17" />
			<circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
			<circle cx="12" cy="5" r="1.1" fill="currentColor" stroke="none" />
			<circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

function DotIcon() {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
			<circle cx="12" cy="12" r="4" />
		</svg>
	);
}

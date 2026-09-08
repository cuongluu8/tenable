import { useState } from "react";
import type { CbBadge } from "./state";

interface Props {
	badge: CbBadge;
	// Whether the country hint (the first of what's meant to grow into a
	// small set of hints -- see ClubBadgesPlay.tsx) is currently revealed --
	// a ribbon across the badge's top edge, plus (once a real image is
	// showing -- see showPlaceholder below) the club's name underneath it,
	// same non-spoiler reasoning as the placeholder case always showing it
	// (the club isn't the answer, the player is). Per-question, not
	// per-tile: every badge in a question shows or hides this together,
	// driven by one button.
	showCountryHint: boolean;
	// A loan club (ClubBadgesPlay.tsx's ChainTile.isLoan), rendered at half
	// size -- visually distinct from a real step in the chain, since it
	// almost never was one.
	small?: boolean;
}

// One club's badge, or a text placeholder standing in for it -- either
// because the server never had a url for it (club.url === null, no
// image_key sourced yet) or because a url that WAS supposed to work failed
// to actually load (onError below -- covers a stale/wrong-filename source
// URL, a transient network blip, anything). Either way this degrades
// gracefully instead of a broken-image icon, and showing the club's name as
// text gives nothing away a working badge wouldn't have anyway (the club
// isn't the answer, the player is).
export function BadgeTile({ badge, showCountryHint, small }: Props) {
	const [failed, setFailed] = useState(false);
	const showPlaceholder = !badge.url || failed;
	const wrapClassName = ["cb-badge-wrap", small && "cb-badge-wrap--small"].filter(Boolean).join(" ");
	const badgeClassName = ["cb-badge", small && "cb-badge--small"].filter(Boolean).join(" ");
	// The ribbon and name label are now always rendered, hint on or off --
	// reserving their space unconditionally means toggling the hint never
	// changes any tile's own height, which is what used to make a row
	// re-center its shorter tiles (a loan tile's smaller image, or a
	// placeholder) the moment the hint came on, since a row only grows
	// taller for the tiles that actually gained a name label (confirmed
	// the hard way, 2026-09-07 -- a CSS align-self fix chased one specific
	// symptom of this before this turned out to be the actual, general
	// cause). visibility: hidden keeps the box's space without showing its
	// contents, unlike display: none which would remove the reservation
	// along with it.
	const hintStyle = showCountryHint ? undefined : { visibility: "hidden" as const };
	// A placeholder already shows the name inside itself (below) -- a
	// second copy here would just repeat it, so the name label stays
	// invisible for a placeholder regardless of the hint, purely to
	// reserve the same height a real tile's name label would take.
	const nameStyle = showCountryHint && !showPlaceholder ? undefined : { visibility: "hidden" as const };

	return (
		<div className={wrapClassName}>
			{badge.country && (
				<span className="cb-badge-ribbon" style={hintStyle} aria-hidden={!showCountryHint}>
					{badge.country}
				</span>
			)}
			{showPlaceholder ? (
				// No title attribute -- a hover tooltip isn't reachable on a
				// touch screen at all, and the name's already right here as
				// visible text anyway, so it would only ever have been
				// redundant on desktop.
				<div className={[badgeClassName, "cb-badge--placeholder"].join(" ")}>
					<span>{badge.name}</span>
				</div>
			) : (
				// Also no title here (a working badge has no other on-screen
				// text naming the club before the hint's used) -- same
				// "unreachable on touch" reasoning applies regardless of
				// whether the tooltip would've been redundant, so it's not a
				// fix worth making conditional on that. alt stays: it's for
				// assistive tech and the broken-image case, not a hover
				// tooltip.
				<img
					src={badge.url ?? undefined}
					alt={badge.name}
					className={badgeClassName}
					onError={() => setFailed(true)}
				/>
			)}
			<span className="cb-badge-name" style={nameStyle} aria-hidden={nameStyle !== undefined}>
				{showPlaceholder ? " " : badge.name}
			</span>
		</div>
	);
}

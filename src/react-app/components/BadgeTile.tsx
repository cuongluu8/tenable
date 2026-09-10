import { useState } from "react";
import type { CbBadge } from "./clubBadgesState";

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

	return (
		<div className={wrapClassName}>
			{showCountryHint && badge.country && <span className="cb-badge-ribbon">{badge.country}</span>}
			{showPlaceholder ? (
				<>
					{/* No title attribute -- a hover tooltip isn't reachable on a
					    touch screen at all, and the name's already right here as
					    visible text anyway, so it would only ever have been
					    redundant on desktop. */}
					<div className={[badgeClassName, "cb-badge--placeholder"].join(" ")}>
						<span>{badge.name}</span>
					</div>
					{/* A placeholder already shows the name inside itself, hint or
					    not -- a second, real .cb-badge-name below would just repeat
					    it. But every real-image tile's own wrap grows taller by
					    exactly that much once the hint reveals theirs, and a row
					    centers tiles of different heights, so skipping this one
					    silently pushed every placeholder's own crest-equivalent out
					    of line with the real ones next to it (confirmed the hard
					    way, 2026-09-07). An invisible same-size spacer reserves the
					    identical height without showing the name twice. */}
					{showCountryHint && (
						<span className="cb-badge-name" style={{ visibility: "hidden" }} aria-hidden="true">
							&nbsp;
						</span>
					)}
				</>
			) : (
				<>
					{/* Also no title here (a working badge has no other on-screen
					    text naming the club before the hint's used) -- same
					    "unreachable on touch" reasoning applies regardless of
					    whether the tooltip would've been redundant, so it's not a
					    fix worth making conditional on that. alt stays: it's for
					    assistive tech and the broken-image case, not a hover
					    tooltip. */}
					<img
						src={badge.url ?? undefined}
						alt={badge.name}
						className={badgeClassName}
						onError={() => setFailed(true)}
					/>
					{showCountryHint && <span className="cb-badge-name">{badge.name}</span>}
				</>
			)}
		</div>
	);
}

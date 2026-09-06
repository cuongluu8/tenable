import { useState } from "react";
import type { CbBadge } from "./state";

interface Props {
	badge: CbBadge;
	// Whether the country-ribbon hint (the first of what's meant to grow
	// into a small set of hints -- see ClubBadgesPlay.tsx) is currently
	// revealed. Per-question, not per-tile: every badge in a question shows
	// or hides its ribbon together, driven by one button.
	showCountryHint: boolean;
}

// One club's badge, or a text placeholder standing in for it -- either
// because the server never had a url for it (club.url === null, no
// image_key sourced yet) or because a url that WAS supposed to work failed
// to actually load (onError below -- covers a stale/wrong-filename source
// URL, a transient network blip, anything). Either way this degrades
// gracefully instead of a broken-image icon, and showing the club's name as
// text gives nothing away a working badge wouldn't have anyway (the club
// isn't the answer, the player is).
export function BadgeTile({ badge, showCountryHint }: Props) {
	const [failed, setFailed] = useState(false);
	const showPlaceholder = !badge.url || failed;

	return (
		<div className="cb-badge-wrap">
			{showCountryHint && badge.country && <span className="cb-badge-ribbon">{badge.country}</span>}
			{showPlaceholder ? (
				<div className="cb-badge cb-badge--placeholder" title={badge.name}>
					<span>{badge.name}</span>
				</div>
			) : (
				<img
					src={badge.url ?? undefined}
					alt={badge.name}
					title={badge.name}
					className="cb-badge"
					onError={() => setFailed(true)}
				/>
			)}
		</div>
	);
}

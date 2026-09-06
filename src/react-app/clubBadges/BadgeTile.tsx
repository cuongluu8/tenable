import { useState } from "react";
import type { CbBadge } from "./state";

// One club's badge, or a text placeholder standing in for it -- either
// because the server never had a url for it (club.url === null, no
// image_key sourced yet) or because a url that WAS supposed to work failed
// to actually load (onError below -- covers a stale/wrong-filename source
// URL, a transient network blip, anything). Either way this degrades
// gracefully instead of a broken-image icon, and showing the club's name as
// text gives nothing away a working badge wouldn't have anyway (the club
// isn't the answer, the player is).
export function BadgeTile({ badge }: { badge: CbBadge }) {
	const [failed, setFailed] = useState(false);

	if (!badge.url || failed) {
		return (
			<div className="cb-badge cb-badge--placeholder" title={badge.name}>
				<span>{badge.name}</span>
			</div>
		);
	}

	return <img src={badge.url} alt={badge.name} title={badge.name} className="cb-badge" onError={() => setFailed(true)} />;
}

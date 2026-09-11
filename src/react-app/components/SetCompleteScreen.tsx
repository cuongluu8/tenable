import "./clubBadges.css";
import { scoreBand } from "./clubBadgesState";

interface Props {
	setId: number;
	setName: string;
	average: number;
	onShare: () => void;
	onExit: () => void;
}

// Shown once, right when a Set becomes fully answered (see
// useSetRound.ts's nextQuestion) -- instead of silently dropping back to
// the picker, so there's an actual "you did it" moment to share from,
// not just an updated card the player has to notice on the list. Shared
// by both club-badges' and teammates' set-play screens; `onShare` is
// each mode's own shareSetViaWhatsApp wrapper (see components/
// shareSet.ts) bound to this completion's numbers.
export function SetCompleteScreen({ setId, setName, average, onShare, onExit }: Props) {
	return (
		<div className="screen">
			<h2>
				Set {setId}: {setName} complete!
			</h2>
			<p className={`cb-score cb-score--${scoreBand(average)}`}>{average} avg</p>
			<div className="cb-set-complete__actions">
				<button type="button" onClick={onShare}>
					Share via WhatsApp
				</button>
				<button type="button" className="back-link" onClick={onExit}>
					← Back to Sets
				</button>
			</div>
		</div>
	);
}

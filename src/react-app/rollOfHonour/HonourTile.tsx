import "./rollOfHonour.css";

export interface HonourTileView {
	season: string;
	status: "open" | "locked" | "answered";
	winner: string | null;
	imageUrl: string | null;
}

interface Props {
	tile: HonourTileView;
	// The colour the tile takes when held or answered -- the holder's/
	// answerer's leaderboard colour in remote play, the player's own in
	// solo. Ignored for open tiles.
	ownerColor?: string;
	// Remote play's own per-device view of the tile: it's this device's
	// hold (with the local time left on it), or this player is inside the
	// retry block for it. Solo passes none of these.
	mine?: boolean;
	lockLeftMs?: number | null;
	blockedForMs?: number;
	// A tile revealed at game over that the player never answered (solo)
	// -- shown filled in but muted, so what was missed reads differently
	// from what was got.
	missed?: boolean;
	disabled: boolean;
	onSelect: () => void;
}

// One season of a Roll of Honour grid -- shared by remote play
// (remote/RollOfHonourGame.tsx) and single player (RollOfHonourSolo.tsx),
// extracted 2026-09-13. Fixed height whatever it holds (see .roh-tile) so
// the grid never reflows as tiles fill in.
export function HonourTile({ tile, ownerColor, mine = false, lockLeftMs = null, blockedForMs = 0, missed = false, disabled, onSelect }: Props) {
	const classes = ["roh-tile"];
	if (tile.status === "answered") classes.push(missed ? "roh-tile--missed" : "roh-tile--answered");
	if (tile.status === "locked") classes.push(mine ? "roh-tile--mine" : "roh-tile--locked");
	if (blockedForMs > 0) classes.push("roh-tile--blocked");
	const interactive = tile.status === "open" && blockedForMs <= 0 && !disabled;
	return (
		<button
			type="button"
			className={classes.join(" ")}
			style={ownerColor ? ({ "--owner-color": ownerColor } as React.CSSProperties) : undefined}
			onClick={onSelect}
			disabled={!interactive && !mine}
			aria-label={`${tile.season}${tile.winner ? `: ${tile.winner}` : ""}`}
		>
			<span className="roh-tile__season">{tile.season}</span>
			{tile.winner ? (
				<span className="roh-tile__answer">
					{tile.imageUrl ? <img src={tile.imageUrl} alt="" className="roh-tile__badge" /> : null}
					<span className="roh-tile__club">{tile.winner}</span>
				</span>
			) : mine && lockLeftMs !== null ? (
				<span className="roh-tile__timer">{Math.ceil(lockLeftMs / 1000)}s</span>
			) : tile.status === "locked" ? (
				<span className="roh-tile__lock">🔒</span>
			) : blockedForMs > 0 ? (
				<span className="roh-tile__timer roh-tile__timer--blocked">{Math.ceil(blockedForMs / 1000)}s</span>
			) : null}
		</button>
	);
}

// Per-player identity colors, shared by multiplayer (roster chips, result
// board -- see multiplayer/state.ts, MultiplayerPlayers.tsx) and the
// "guess the player" round engine (components/clubBadgesState.ts assigns
// one per player at "start"). Lives here rather than in either feature's
// state module so neither has to import the other's.
//
// Assigned to players in roster order at "start", cycling if there are
// ever more players than colors (MultiplayerSetup.tsx caps at 8, matching
// this palette's length, so cycling is just a safety net, not the normal
// case). Deliberately excludes pure red (#f87171) and pure green
// (#22c55e/#4ade80) at the *extremes* of this palette's hues that
// App.css already uses for "wrong"/"life lost" and "correct"/"found" -- a
// player's identity color shouldn't itself read as a correctness signal.
// (The one green here, first in the list, is soft enough not to collide
// in practice, and dropping it would leave only seven.)
export const PLAYER_COLORS = [
	"#4ade80", // green
	"#60a5fa", // blue
	"#f472b6", // pink
	"#fbbf24", // amber
	"#a78bfa", // violet
	"#22d3ee", // cyan
	"#fb923c", // orange
	"#94a3b8", // slate
];

export function colorForPlayerIndex(index: number): string {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

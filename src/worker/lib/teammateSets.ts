// Fixed, curated player groupings for "Who am I? I played with..." Sets
// mode (src/react-app/teammates/TeammateSets.tsx / TeammateSetPlay.tsx) --
// the exact same idea as club-badges' own Sets (src/worker/lib/
// clubBadgeSets.ts): replace that mode's old "random 10 every round" draw
// with standing, nameable rounds ("Set 1", "Set 2", ...) a player can
// leave, come back to, complete at their own pace, and retry individual
// questions in, with progress saved locally.
//
// Ordering matches clubBadgeSets.ts's: a manual fame ranking, most
// globally recognizable mystery player first, least well-known last, not
// derived from any stat in this database (there's no "how famous" column
// -- see clubBadgeSets.ts's own doc). teammate_questions rows were
// derived in ascending player entity-id order, and entity id order IS the
// fame ranking (that's how the star-player id block was originally
// curated -- see docs/stats-enrichment.md), so this is a straight chunk
// of the 110 questions' player ids in id order into groups of 10.
//
// 110 questions divides evenly, so all 11 sets are a full ten -- no
// short remainder set the way club-badges' last one is. A future batch
// of teammate_questions should be re-chunked from the tail the same way
// (see build_teammate_questions.py), not just appended, to keep the
// difficulty ordering meaningful across the sets as well as within them.
//
// A 2026-09-11 rebuild (after the player_career_stats growth that also
// triggered clubBadgeSets.ts's own re-chunk) found teammate_questions had
// grown to 111 -- one more than these 11 full sets cover (player 604).
// Deliberately left OUT of every Set rather than either forcing an
// eleventh-slot "Set 12" of just one question or renumbering all 11
// existing sets to re-sort one extra id in -- both cost more (an awkward
// near-empty set, or the same kind of local-progress-losing renumbering
// clubBadgeSets.ts accepted for 61 players, not 1) than holding a single
// player back until the next real batch gives the tail something
// meaningful to re-chunk into.
export const TEAMMATE_SETS: number[][] = [
	[548, 549, 550, 555, 557, 569, 572, 577, 590, 591],
	[593, 594, 595, 597, 598, 599, 605, 606, 607, 608],
	[610, 611, 612, 613, 615, 616, 617, 618, 627, 631],
	[635, 637, 638, 643, 649, 652, 660, 664, 665, 666],
	[667, 668, 671, 672, 674, 677, 680, 683, 686, 688],
	[715, 718, 719, 721, 729, 730, 732, 733, 734, 735],
	[737, 744, 753, 754, 755, 762, 764, 767, 771, 775],
	[777, 780, 786, 790, 793, 798, 800, 801, 802, 803],
	[811, 815, 816, 817, 821, 828, 829, 832, 833, 836],
	[842, 845, 849, 851, 853, 855, 857, 859, 863, 868],
	[870, 874, 876, 878, 879, 886, 887, 890, 894, 900],
];

// A fun display name per set, index-matched to TEAMMATE_SETS above --
// "adjective + animal", the same naming brief club-badges' sets follow
// (CLUB_BADGE_SET_NAMES). Deliberately shares no word with any club-badge
// set name (those 30 are the other half of the same app) and avoids
// gold/silver/yellow/brown/grey, which are state.ts's scoreBand names --
// see clubBadgeSets.ts's own doc on both. "Set N" stays the stable
// reference everywhere that matters (URLs, teammateSetsStorage.ts keys);
// these names are display-only.
export const TEAMMATE_SET_NAMES: string[] = [
	"Rowdy Manatee",
	"Brisk Ferret",
	"Candid Ibex",
	"Jolly Pangolin",
	"Nimble Marten",
	"Dapper Tapir",
	"Cosmic Wombat",
	"Feral Gecko",
	"Plucky Caribou",
	"Sly Meerkat",
	"Bold Axolotl",
];

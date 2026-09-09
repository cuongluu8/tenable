// Fixed, curated player groupings for club-badges "Sets" mode (single
// player only -- see src/react-app/clubBadges/ClubBadgeSets.tsx; also
// selectable in multiplayer since 2026-09-08 -- see
// src/react-app/multiplayer/MultiplayerSetPick.tsx) -- replaces that mode's
// old "random 10 every round" draw with standing, nameable rounds ("Set 1",
// "Set 2", ...) a player can return to, complete at their own pace, and
// retry individual questions in.
//
// Ordering is a manual fame ranking (most globally recognizable player
// first, least well-known last), not derived from any stat in this
// database -- there's no "how famous is this player" column to query,
// and unlike this project's other content (transfer dates, trophy
// counts, ...) that's a judgment call by design, not a fact to source
// and verify. Chunked into groups of 10 in that order, so Set 1 is the
// ten most recognizable players in the whole eligible pool and each
// later set is progressively less mainstream -- matching "ordered easy
// to hard" both within a set and across the sets themselves.
//
// Sets 1-30 (293 ids): a single fame-ranked master list -- batch 1 (ids
// 530-650, 96 players whose club_sequence had at least
// MIN_CLUBS_FOR_QUESTION entries as of 2026-09-08) immediately followed
// by batch 2 part 1 (ids 651-900, 197 more qualifying players, added
// 2026-09-09 -- "Batch 2 part 1" of docs/stats-enrichment.md's player-
// stats project, see that file's own "What's left" section), then
// chunked into groups of 10 in that combined order. Entity id order
// within each batch IS the fame ranking (that's how the ids were
// assigned when the star-player block was originally curated -- see
// docs/stats-enrichment.md's own doc on why), so this is a straight
// chunk of the combined ids, not a separately hand-sorted list.
//
// Re-chunked from scratch 2026-09-09 (rather than just appending batch
// 2 as new sets after a half-empty Set 10) specifically so Set 10
// wouldn't stay stuck at 6 players forever, or worse, sit there
// permanently less-famous than Set 11 onward once batch 2 arrived --
// either would have broken "ordered easy to hard across the sets", not
// just within one. Sets 1-9 come out byte-identical to before (they
// were already full tens drawn purely from batch 1); only Set 10
// onward actually changed. 293 doesn't divide evenly into groups of 10,
// so the last set (30) is 3 rather than 10 -- a real, deliberately
// smaller set, not a bug, same as every previous batch's own remainder.
//
// A future player added to the eligible pool should be manually slotted
// into the ranking below (and ideally into the current under-10 tail
// set first) rather than just appended, to keep the difficulty ordering
// meaningful -- or, if a whole new batch arrives the way batch 2 did,
// re-chunk the tail from the last full set onward the same way this
// commit did, rather than leaving a permanently-short set sitting
// mid-list.
export const CLUB_BADGE_SETS: number[][] = [
	[530, 531, 535, 536, 560, 534, 532, 533, 537, 541],
	[542, 538, 539, 544, 540, 582, 636, 545, 552, 575],
	[599, 603, 594, 614, 543, 546, 577, 583, 606, 602],
	[613, 620, 556, 547, 548, 562, 561, 550, 579, 578],
	[586, 642, 639, 641, 645, 643, 637, 638, 634, 635],
	[626, 627, 596, 597, 598, 605, 650, 592, 593, 557],
	[558, 566, 564, 567, 565, 646, 571, 572, 569, 570],
	[590, 555, 549, 551, 554, 591, 648, 607, 610, 608],
	[611, 609, 612, 631, 633, 615, 616, 617, 618, 640],
	[628, 629, 649, 553, 604, 595, 651, 652, 653, 656],
	[657, 659, 660, 661, 663, 664, 665, 666, 667, 668],
	[669, 670, 671, 672, 673, 674, 675, 676, 677, 678],
	[679, 680, 681, 682, 683, 684, 686, 687, 688, 690],
	[691, 692, 694, 698, 700, 701, 702, 705, 706, 709],
	[710, 713, 714, 715, 717, 718, 719, 720, 721, 724],
	[725, 727, 728, 729, 730, 732, 733, 734, 735, 736],
	[737, 741, 743, 744, 746, 747, 748, 749, 750, 751],
	[753, 754, 755, 757, 758, 759, 762, 763, 764, 766],
	[767, 769, 770, 771, 772, 773, 774, 775, 777, 779],
	[780, 781, 782, 783, 784, 785, 786, 788, 789, 790],
	[791, 793, 795, 796, 797, 798, 799, 800, 801, 802],
	[803, 804, 805, 806, 807, 809, 810, 811, 812, 813],
	[814, 815, 816, 817, 818, 821, 822, 823, 824, 825],
	[826, 827, 828, 829, 830, 831, 832, 833, 835, 836],
	[837, 838, 839, 840, 841, 842, 843, 845, 846, 847],
	[849, 850, 851, 852, 853, 855, 856, 857, 858, 859],
	[860, 862, 863, 864, 865, 867, 868, 869, 870, 871],
	[872, 873, 874, 875, 876, 877, 878, 879, 880, 882],
	[883, 884, 885, 886, 887, 888, 890, 893, 894, 896],
	[898, 899, 900],
];

// A fun display name per set, index-matched to CLUB_BADGE_SETS above --
// "adjective + animal", the user's own naming brief (2026-09-08).
// Deliberately doesn't reuse gold/silver/yellow/brown/grey as either
// word: those are already state.ts's scoreBand names (the per-question
// score chip colors), and reusing one here would read as if THIS set
// were somehow tied to that specific score tier, which it isn't -- a
// set's name has nothing to do with how well anyone's actually done in
// it. "Set N" stays the stable reference everywhere that matters
// (URLs, setsStorage.ts's keys) -- these names are display-only.
export const CLUB_BADGE_SET_NAMES: string[] = [
	"Crimson Falcon",
	"Neon Panther",
	"Velvet Wolf",
	"Shadow Cobra",
	"Midnight Lynx",
	"Solar Otter",
	"Electric Badger",
	"Frozen Raven",
	"Rusty Fox",
	"Quantum Hawk",
	"Obsidian Viper",
	"Arctic Jaguar",
	"Golden Eagle",
	"Iron Bison",
	"Violet Stallion",
	"Amber Scorpion",
	"Storm Mantis",
	"Phantom Condor",
	"Radiant Puma",
	"Silver Serpent",
	"Toxic Griffin",
	"Lunar Rhino",
	"Scarlet Kraken",
	"Titan Phoenix",
	"Crystal Cheetah",
	"Vortex Wolverine",
	"Emerald Tiger",
	"Blazing Leopard",
	"Nova Mongoose",
	"Onyx Barracuda",
];

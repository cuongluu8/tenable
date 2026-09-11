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
// Sets 1-9 (90 ids) are the original hand-curated core and are NEVER
// mechanically re-chunked -- they predate build_club_badge_questions.py
// and stay exactly as originally authored across every re-chunk this
// file has been through, same as every prior batch's own policy.
//
// Sets 10-36 (264 ids) are a straight ascending-id chunk of every OTHER
// currently-eligible player (entity id order IS the fame ranking within
// this "notable tier" range -- see docs/stats-enrichment.md), re-chunked
// from scratch 2026-09-11: a 2026-09-11 audit found 56 already-eligible
// players (club_badge_questions had grown to 354 rows since these Sets
// were last chunked at 293) sitting completely unreachable -- never
// slotted into any Set at all, not even a stale one -- plus 5 more newly
// eligible ones. Those 61 players' ids are scattered throughout 553-900,
// not a clean trailing range, so absorbing them in fame order shifts
// Sets 10-13 for real (they now include ids that used to be missing
// entirely) and renumbers -- without changing the CONTENT of -- Sets
// 14-36 upward by a few slots. A player mid-way through one of those
// renumbered sets will see their local progress (setsStorage.ts, keyed
// by (setId, questionId)) attached to a different Set number than
// before -- same tradeoff the 2026-09-09 batch-2 re-chunk already
// accepted once, for the same reason: a permanently-scattered pool of
// unreachable content is worse than a one-time renumbering.
//
// A future player added to the eligible pool should be manually slotted
// into the ranking below (and ideally into the current under-10 tail
// set first) rather than just appended, to keep the difficulty ordering
// meaningful -- or, if a whole new batch arrives, re-chunk Sets 10+ from
// scratch the same way this commit did (never Sets 1-9), rather than
// leaving newly-eligible players unreachable until the next audit finds
// them.
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
	[553, 559, 563, 568, 576, 580, 581, 585, 588, 595],
	[600, 601, 604, 619, 621, 625, 628, 629, 630, 632],
	[644, 649, 651, 652, 653, 654, 655, 656, 657, 658],
	[659, 660, 661, 662, 663, 664, 665, 666, 667, 668],
	[669, 670, 671, 672, 673, 674, 675, 676, 677, 678],
	[679, 680, 681, 682, 683, 684, 685, 686, 687, 688],
	[689, 690, 691, 692, 693, 694, 695, 696, 697, 698],
	[699, 700, 701, 702, 703, 705, 706, 707, 709, 710],
	[711, 712, 713, 714, 715, 717, 718, 719, 720, 721],
	[722, 724, 725, 726, 727, 728, 729, 730, 731, 732],
	[733, 734, 735, 736, 737, 738, 739, 740, 741, 742],
	[743, 744, 745, 746, 747, 748, 749, 750, 751, 752],
	[753, 754, 755, 757, 758, 759, 760, 761, 762, 763],
	[764, 765, 766, 767, 769, 770, 771, 772, 773, 774],
	[775, 776, 777, 778, 779, 780, 781, 782, 783, 784],
	[785, 786, 787, 788, 789, 790, 791, 792, 793, 794],
	[795, 796, 797, 798, 799, 800, 801, 802, 803, 804],
	[805, 806, 807, 808, 809, 810, 811, 812, 813, 814],
	[815, 816, 817, 818, 819, 821, 822, 823, 824, 825],
	[826, 827, 828, 829, 830, 831, 832, 833, 834, 835],
	[836, 837, 838, 839, 840, 841, 842, 843, 844, 845],
	[846, 847, 848, 849, 850, 851, 852, 853, 854, 855],
	[856, 857, 858, 859, 860, 861, 862, 863, 864, 865],
	[867, 868, 869, 870, 871, 872, 873, 874, 875, 876],
	[877, 878, 879, 880, 881, 882, 883, 884, 885, 886],
	[887, 888, 889, 890, 891, 892, 893, 894, 895, 896],
	[897, 898, 899, 900],
];

// A fun display name per set, index-matched to CLUB_BADGE_SETS above --
// "adjective + animal", the user's own naming brief (2026-09-08).
// Deliberately doesn't reuse gold/silver/yellow/brown/grey as either
// word: those are already clubBadgesState.ts's scoreBand names (the
// per-question score chip colors), and reusing one here would read as if
// THIS set were somehow tied to that specific score tier, which it
// isn't -- a set's name has nothing to do with how well anyone's
// actually done in it. Also never reuses a word already used by
// teammateSets.ts's own names (the two Sets modes are the other half of
// the same app). "Set N" stays the stable reference everywhere that
// matters (URLs, setsStorage.ts's keys) -- these names are display-only.
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
	"Ember Heron",
	"Ashen Kestrel",
	"Glacial Weasel",
	"Umber Ocelot",
	"Sapphire Marlin",
	"Molten Ibis",
];

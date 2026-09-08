// Fixed, curated player groupings for club-badges "Sets" mode (single
// player only -- see src/react-app/clubBadges/ClubBadgeSets.tsx) --
// replaces that mode's old "random 10 every round" draw with ten
// standing, nameable rounds ("Set 1", "Set 2", ...) a player can return
// to, complete at their own pace, and retry individual questions in.
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
// The 96 ids here are every club_badge_questions player whose
// club_sequence has at least MIN_CLUBS_FOR_QUESTION entries (clubBadges.
// ts) as of 2026-09-08 -- confirmed by exact-match against a live query
// of that pool before writing this list out (no player added or dropped
// by guesswork). 96 doesn't divide evenly into groups of 10, so the last
// set is 6 rather than 10 -- a real, deliberately smaller set, not a bug.
// A future player added to the eligible pool should be manually slotted
// into the ranking below (and ideally into an existing under-10 set
// first) rather than just appended, to keep the difficulty ordering
// meaningful.
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
	[628, 629, 649, 553, 604, 595],
];

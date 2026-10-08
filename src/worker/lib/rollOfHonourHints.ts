// Roll of Honour's Turn mode hints (remote play; see remoteGameSession.ts's
// class doc). Pure string work, kept apart from rollOfHonour.ts's
// D1-backed tile building so it's unit-tested on its own.
import type { HonourTilePrivate } from "./rollOfHonour";

// The winner's name with every letter and digit blanked except the first
// (and, with `last`, the final one) -- "M _ _ _ _ _ _ _ _ _  _ _ _ _" for
// Manchester City. Characters are spaced out, words are two spaces apart,
// shown letters are upper case ("A _ _ _ _  _ _ _ _ A"), and punctuation
// is left as it is so the shape of the name still reads.
export function maskHonourName(name: string, last = false): string {
	const chars = [...name.trim()];
	const blankable = (ch: string) => /[\p{L}\p{N}]/u.test(ch);
	const firstIndex = chars.findIndex(blankable);
	let lastIndex = -1;
	if (last) {
		for (let i = chars.length - 1; i >= 0 && lastIndex < 0; i--) if (blankable(chars[i])) lastIndex = i;
	}
	const words: string[][] = [[]];
	chars.forEach((ch, i) => {
		if (/\s/.test(ch)) {
			if (words[words.length - 1].length > 0) words.push([]);
			return;
		}
		words[words.length - 1].push(!blankable(ch) || i === firstIndex || i === lastIndex ? ch.toUpperCase() : "_");
	});
	return words.map((w) => w.join(" ")).join("  ");
}

// How many hints a Turn mode tile has -- one more pass around the table
// follows each, so a tile is HONOUR_TURN_HINTS + 1 passes at most.
export const HONOUR_TURN_HINTS = 2;

// The hints showing after `revealed` of them (0..HONOUR_TURN_HINTS).
// A competition with winners from several countries gives the country,
// then the first letter and the name's shape; one where every winner is
// from the same country (`nameOnly` -- the country would say nothing)
// gives the first letter and shape, then the last letter too.
export function honourTurnHints(tile: Pick<HonourTilePrivate, "winner" | "country">, revealed: number, nameOnly: boolean): string[] {
	if (revealed <= 0) return [];
	if (nameOnly) return [maskHonourName(tile.winner, revealed >= 2)];
	return revealed >= 2 ? [`Country: ${tile.country}`, maskHonourName(tile.winner)] : [`Country: ${tile.country}`];
}

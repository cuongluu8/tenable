import { describe, expect, it } from "vitest";
import { honourTurnHints, maskHonourName } from "./rollOfHonourHints";

describe("maskHonourName", () => {
	it("shows only the first letter, words two spaces apart", () => {
		expect(maskHonourName("Manchester City")).toBe("M _ _ _ _ _ _ _ _ _  _ _ _ _");
		expect(maskHonourName("Aston Villa")).toBe("A _ _ _ _  _ _ _ _ _");
		expect(maskHonourName("Ajax")).toBe("A _ _ _");
	});

	it("adds the last letter when asked", () => {
		expect(maskHonourName("Aston Villa", true)).toBe("A _ _ _ _  _ _ _ _ A");
		expect(maskHonourName("Liverpool", true)).toBe("L _ _ _ _ _ _ _ L");
	});

	it("leaves punctuation alone and handles accents", () => {
		expect(maskHonourName("Saint-Étienne")).toBe("S _ _ _ _ - _ _ _ _ _ _ _");
		expect(maskHonourName("1. FC Köln", true)).toBe("1 .  _ _  _ _ _ N");
	});
});

describe("honourTurnHints", () => {
	const tile = { winner: "Real Madrid", country: "Spain" };

	it("gives nothing before the first hint", () => {
		expect(honourTurnHints(tile, 0, false)).toEqual([]);
		expect(honourTurnHints(tile, 0, true)).toEqual([]);
	});

	it("country, then the first letter, when winners come from several countries", () => {
		expect(honourTurnHints(tile, 1, false)).toEqual(["Country: Spain"]);
		expect(honourTurnHints(tile, 2, false)).toEqual(["Country: Spain", "R _ _ _  _ _ _ _ _ _"]);
	});

	it("first letter, then the last letter too, when every winner shares a country", () => {
		const villa = { winner: "Aston Villa", country: "England" };
		expect(honourTurnHints(villa, 1, true)).toEqual(["A _ _ _ _  _ _ _ _ _"]);
		expect(honourTurnHints(villa, 2, true)).toEqual(["A _ _ _ _  _ _ _ _ A"]);
	});
});

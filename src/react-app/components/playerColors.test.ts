import { describe, expect, it } from "vitest";
import { colorForPlayerIndex, PLAYER_COLORS } from "./playerColors";

describe("colorForPlayerIndex", () => {
	it("assigns each index within the palette its own color", () => {
		expect(colorForPlayerIndex(0)).toBe(PLAYER_COLORS[0]);
		expect(colorForPlayerIndex(3)).toBe(PLAYER_COLORS[3]);
	});

	it("cycles back to the start once there are more players than colors", () => {
		expect(colorForPlayerIndex(PLAYER_COLORS.length)).toBe(PLAYER_COLORS[0]);
		expect(colorForPlayerIndex(PLAYER_COLORS.length + 1)).toBe(PLAYER_COLORS[1]);
	});
});

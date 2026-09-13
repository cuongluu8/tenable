import { describe, expect, it } from "vitest";
import { initialPassPlayState, passPlayReducer, rankPassPlayers, type PassPlayState } from "./passPlayState";

const seasons = ["1992-93", "1993-94", "1994-95"];
const started = (): PassPlayState => passPlayReducer(initialPassPlayState, { type: "start", playerNames: ["Ann", "Bob"], seasons });

describe("passPlayReducer", () => {
	it("start builds the roster in order with distinct colours and nothing answered", () => {
		const s = started();
		expect(s.players.map((p) => p.name)).toEqual(["Ann", "Bob"]);
		expect(s.players[0].color).not.toBe(s.players[1].color);
		expect(s.turnIndex).toBe(0);
		expect(s.answered).toEqual({});
		expect(s.over).toBe(false);
	});

	it("a correct answer claims the tile for the current player and passes the turn", () => {
		const s = passPlayReducer(started(), { type: "correct", season: "1992-93", winner: "Manchester United", imageUrl: null });
		expect(s.answered["1992-93"]).toMatchObject({ winner: "Manchester United", playerIndex: 0 });
		expect(s.players.map((p) => p.correct)).toEqual([1, 0]);
		expect(s.turnIndex).toBe(1);
	});

	it("wrong and skip pass the turn without changing the board; turns wrap around", () => {
		let s = passPlayReducer(started(), { type: "wrong" });
		expect(s.turnIndex).toBe(1);
		expect(s.answered).toEqual({});
		s = passPlayReducer(s, { type: "skip" });
		expect(s.turnIndex).toBe(0);
	});

	it("ignores a second claim on an already-answered season", () => {
		let s = passPlayReducer(started(), { type: "correct", season: "1992-93", winner: "Manchester United", imageUrl: null });
		const again = passPlayReducer(s, { type: "correct", season: "1992-93", winner: "Manchester United", imageUrl: null });
		expect(again).toBe(s);
		s = again;
		expect(s.players.map((p) => p.correct)).toEqual([1, 0]);
	});

	it("filling the last tile ends the game; give up ends it early; revealed fills the roll; nothing moves after", () => {
		let s = started();
		for (const [i, season] of seasons.entries()) s = passPlayReducer(s, { type: "correct", season, winner: `W${i}`, imageUrl: null });
		expect(s.over).toBe(true);
		expect(s.gaveUp).toBe(false);
		expect(s.players.map((p) => p.correct)).toEqual([2, 1]);
		expect(passPlayReducer(s, { type: "wrong" })).toBe(s);

		let g = passPlayReducer(started(), { type: "giveUp" });
		expect(g).toMatchObject({ over: true, gaveUp: true });
		g = passPlayReducer(g, { type: "revealed", tiles: seasons.map((season) => ({ season, winner: "X", imageUrl: null })) });
		expect(Object.keys(g.revealed ?? {})).toEqual(seasons);
	});
});

describe("rankPassPlayers", () => {
	it("orders by tiles won and shares a rank on ties", () => {
		const ranked = rankPassPlayers([
			{ name: "Ann", color: "a", correct: 2 },
			{ name: "Bob", color: "b", correct: 5 },
			{ name: "Cat", color: "c", correct: 2 },
		]);
		expect(ranked.map((r) => [r.player.name, r.rank])).toEqual([
			["Bob", 1],
			["Ann", 2],
			["Cat", 2],
		]);
	});
});

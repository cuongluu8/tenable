// Unit tests for normalize.ts -- the three functions underneath every
// guess-matching path in this app (see matchGuess()/checkPlayerGuess.ts).
// The collapseToAlnum cases below are deliberately the exact two examples
// documented in that function's own comment (git history around
// 2026-08-26): a hyphen and an ampersand both used to need their own
// special-cased fallback before collapseToAlnum replaced them with one
// general rule -- these lock that rule in as a regression test, not just
// an illustration.
import { describe, expect, it } from "vitest";
import { collapseToAlnum, normalize, toFtsPrefixQuery } from "./normalize";

describe("normalize", () => {
	it("lowercases, strips accents/punctuation, and collapses whitespace", () => {
		expect(normalize("Cristiano  Ronaldo!")).toBe("cristiano ronaldo");
		expect(normalize("Raúl González")).toBe("raul gonzalez");
	});

	it("trims leading/trailing whitespace left over after punctuation is stripped", () => {
		expect(normalize("  Pelé  ")).toBe("pele");
	});

	it("returns an empty string for input that's punctuation/whitespace only", () => {
		expect(normalize("!!!")).toBe("");
		expect(normalize("   ")).toBe("");
	});
});

describe("toFtsPrefixQuery", () => {
	it("turns each word into a prefix-match term", () => {
		expect(toFtsPrefixQuery("erling ha")).toBe("erling* ha*");
	});

	it("drops empty words rather than emitting a bare '*' term", () => {
		expect(toFtsPrefixQuery("erling  haaland")).toBe("erling* haaland*");
	});

	it("returns an empty string for empty input", () => {
		expect(toFtsPrefixQuery("")).toBe("");
	});
});

describe("collapseToAlnum", () => {
	it("makes a hyphen and a space-separated name compare equal", () => {
		expect(collapseToAlnum("Paris Saint-Germain")).toBe(collapseToAlnum("Paris Saint Germain"));
		expect(collapseToAlnum("Paris Saint-Germain")).toBe("parissaintgermain");
	});

	it("drops an ampersand the same way any other punctuation is dropped", () => {
		expect(collapseToAlnum("Oleg Salenko & Hristo Stoichkov")).toBe("olegsalenkohristostoichkov");
	});

	it("leaves already-equal strings equal (a strict superset of exact matching)", () => {
		expect(collapseToAlnum("Messi")).toBe(collapseToAlnum("Messi"));
	});
});

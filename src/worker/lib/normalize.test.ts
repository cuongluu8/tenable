// First unit test, also serving as the smoke test that vitest.config.ts's
// harness (Phase A) actually works.
import { describe, expect, it } from "vitest";
import { collapseToAlnum, normalize, toFtsPrefixQuery } from "./normalize";

describe("normalize", () => {
	it("lowercases, strips accents/punctuation, and collapses whitespace", () => {
		expect(normalize("Cristiano  Ronaldo!")).toBe("cristiano ronaldo");
		expect(normalize("Raúl González")).toBe("raul gonzalez");
	});
});

describe("toFtsPrefixQuery", () => {
	it("turns each word into a prefix-match term", () => {
		expect(toFtsPrefixQuery("erling ha")).toBe("erling* ha*");
	});

	it("drops empty words rather than emitting a bare '*' term", () => {
		expect(toFtsPrefixQuery("erling  haaland")).toBe("erling* haaland*");
	});
});

describe("collapseToAlnum", () => {
	it("drops every non-alphanumeric character, including spaces", () => {
		expect(collapseToAlnum("paris saintgermain")).toBe("parissaintgermain");
	});
});

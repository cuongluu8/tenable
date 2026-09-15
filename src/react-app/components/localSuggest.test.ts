import { describe, expect, it } from "vitest";
import { localNormalize, localSuggest } from "./localSuggest";

// The browser-side filter GuessInput runs over a local index (a whole
// pool or a shard), which must agree with the server's suggestNames():
// every typed word is the start of some word of the name, or the whole
// typed text is the start of a curated alias.
const index = [
	{ name: "Virgil van Dijk", aliases: ["vvd"] },
	{ name: "Kevin De Bruyne", aliases: ["kdb"] },
	{ name: "Lionel Messi", aliases: [] },
	{ name: "Rúben Dias", aliases: [] },
];

describe("localSuggest", () => {
	it("matches a single word against any word of the name", () => {
		expect(localSuggest(index, "dij").suggestions).toEqual(["Virgil van Dijk"]);
		expect(localSuggest(index, "mes").suggestions).toEqual(["Lionel Messi"]);
	});

	it("matches a multi-word query word by word, as the server's FTS query does", () => {
		expect(localSuggest(index, "van dij").suggestions).toEqual(["Virgil van Dijk"]);
		expect(localSuggest(index, "de bru").suggestions).toEqual(["Kevin De Bruyne"]);
		expect(localSuggest(index, "van mes").suggestions).toEqual([]);
	});

	it("matches the whole typed text as the start of an alias", () => {
		expect(localSuggest(index, "vvd").suggestions).toEqual(["Virgil van Dijk"]);
		expect(localSuggest(index, "kd").suggestions).toEqual(["Kevin De Bruyne"]);
	});

	it("ignores accents and case", () => {
		expect(localNormalize("Rúben")).toBe("ruben");
		expect(localSuggest(index, "RUB").suggestions).toEqual(["Rúben Dias"]);
	});

	it("caps at 20 and flags truncation", () => {
		const many = Array.from({ length: 25 }, (_, i) => ({ name: `Player Alpha ${i}`, aliases: [] }));
		const result = localSuggest(many, "alp");
		expect(result.suggestions).toHaveLength(20);
		expect(result.truncated).toBe(true);
	});
});

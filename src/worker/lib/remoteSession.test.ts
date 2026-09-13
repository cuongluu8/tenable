import { describe, expect, it } from "vitest";
import { generateSessionCode, generateToken, isValidSessionCode, normalizeSessionCode } from "./remoteSession";

describe("generateSessionCode", () => {
	it("generates a 6-character code", () => {
		expect(generateSessionCode()).toHaveLength(6);
	});

	it("never includes a visually-ambiguous character (0, O, 1, I, L)", () => {
		// Generate a good number of codes rather than relying on one sample --
		// this is checking the alphabet itself excludes them, not just that
		// one lucky draw happened to avoid them.
		for (let i = 0; i < 200; i++) {
			const code = generateSessionCode();
			for (const ambiguous of ["0", "O", "1", "I", "L"]) {
				expect(code).not.toContain(ambiguous);
			}
		}
	});

	it("every generated code is considered valid by isValidSessionCode", () => {
		for (let i = 0; i < 50; i++) {
			expect(isValidSessionCode(generateSessionCode())).toBe(true);
		}
	});
});

describe("normalizeSessionCode", () => {
	it("uppercases", () => {
		expect(normalizeSessionCode("ab23cd")).toBe("AB23CD");
	});

	it("strips whitespace, including a mid-code line wrap", () => {
		expect(normalizeSessionCode("AB 23\nCD")).toBe("AB23CD");
	});

	it("leaves an already-normalized code unchanged", () => {
		expect(normalizeSessionCode("AB23CD")).toBe("AB23CD");
	});
});

describe("isValidSessionCode", () => {
	it("rejects the wrong length", () => {
		expect(isValidSessionCode("AB23C")).toBe(false);
		expect(isValidSessionCode("AB23CDE")).toBe(false);
	});

	it("rejects a code containing an excluded ambiguous character", () => {
		expect(isValidSessionCode("AB23O5")).toBe(false);
		expect(isValidSessionCode("AB23I5")).toBe(false);
	});

	it("accepts a code drawn entirely from the real alphabet", () => {
		expect(isValidSessionCode("AB23CD")).toBe(true);
	});
});

describe("generateToken", () => {
	it("generates a non-empty string", () => {
		expect(generateToken().length).toBeGreaterThan(0);
	});

	it("generates a different token each time", () => {
		expect(generateToken()).not.toBe(generateToken());
	});
});

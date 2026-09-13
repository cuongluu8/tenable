// Unit tests for setsStorage.ts's localStorage-backed store -- runs under
// jsdom (vitest.config.ts) so the real localStorage API is exercised, not
// a mock of it.
import { beforeEach, describe, expect, it } from "vitest";
import { createSetsStore } from "./setsStorage";

beforeEach(() => {
	localStorage.clear();
});

describe("createSetsStore", () => {
	it("returns an empty result set for a set with no recorded progress", () => {
		const store = createSetsStore("fixture-key");
		expect(store.getSetResults(1)).toEqual({});
	});

	it("records a result and reads it back under the same set/question", () => {
		const store = createSetsStore("fixture-key");
		store.recordResult(1, 10, { outcome: "correct", points: 85 });
		expect(store.getSetResults(1)).toEqual({ 10: { outcome: "correct", points: 85 } });
	});

	it("recording a second question in the same set doesn't clobber the first", () => {
		const store = createSetsStore("fixture-key");
		store.recordResult(1, 10, { outcome: "correct", points: 85 });
		store.recordResult(1, 11, { outcome: "wrong", points: 0 });
		expect(store.getSetResults(1)).toEqual({
			10: { outcome: "correct", points: 85 },
			11: { outcome: "wrong", points: 0 },
		});
	});

	it("persists across a fresh store instance for the same storage key (survives a reload)", () => {
		createSetsStore("fixture-key").recordResult(1, 10, { outcome: "correct", points: 85 });
		const reopened = createSetsStore("fixture-key");
		expect(reopened.getSetResults(1)).toEqual({ 10: { outcome: "correct", points: 85 } });
	});

	it("resetQuestion removes just that question, leaving the rest of the set intact", () => {
		const store = createSetsStore("fixture-key");
		store.recordResult(1, 10, { outcome: "correct", points: 85 });
		store.recordResult(1, 11, { outcome: "wrong", points: 0 });
		store.resetQuestion(1, 10);
		expect(store.getSetResults(1)).toEqual({ 11: { outcome: "wrong", points: 0 } });
	});

	it("resetQuestion on a set with no progress at all is a no-op, not an error", () => {
		const store = createSetsStore("fixture-key");
		expect(() => store.resetQuestion(1, 10)).not.toThrow();
	});

	it("resetSet clears an entire set, leaving other sets untouched", () => {
		const store = createSetsStore("fixture-key");
		store.recordResult(1, 10, { outcome: "correct", points: 85 });
		store.recordResult(2, 20, { outcome: "correct", points: 90 });
		store.resetSet(1);
		expect(store.getSetResults(1)).toEqual({});
		expect(store.getSetResults(2)).toEqual({ 20: { outcome: "correct", points: 90 } });
	});

	it("two different storage keys (two modes) never see each other's progress", () => {
		const clubBadges = createSetsStore("fixture-club-badges");
		const teammates = createSetsStore("fixture-teammates");
		clubBadges.recordResult(1, 10, { outcome: "correct", points: 85 });
		expect(teammates.getSetResults(1)).toEqual({});
	});

	it("treats malformed stored JSON as no progress, rather than throwing", () => {
		localStorage.setItem("fixture-key", "{not valid json");
		const store = createSetsStore("fixture-key");
		expect(store.getSetResults(1)).toEqual({});
	});
});

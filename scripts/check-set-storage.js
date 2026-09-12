import assert from "node:assert/strict";
import { PROBLEM_SETS_KEY, deleteProblemSet, duplicateProblemSet, loadProblemSets, saveProblemSets, upsertProblemSet } from "../static/sets/storage.js";

class MemoryStorage { constructor(entries = {}) { this.values = new Map(Object.entries(entries)); } getItem(key) { return this.values.get(key) || null; } setItem(key, value) { this.values.set(key, String(value)); } }
const storage = new MemoryStorage({ [PROBLEM_SETS_KEY]: "{broken" });
assert.deepEqual(loadProblemSets(storage), []);
let sets = upsertProblemSet(storage, { id: "a", title: "A", instructions: "I", problemIds: ["p1"] });
sets = upsertProblemSet(storage, { id: "a", title: "A2", instructions: "I2", problemIds: ["p1", "p1"] });
assert.equal(loadProblemSets(storage)[0].title, "A2");
const duplicated = duplicateProblemSet(storage, sets[0], "2026-09-12T00:00:00.000Z"); assert.notEqual(duplicated.set.id, "a"); assert.equal(duplicated.set.problemIds.length, 1);
assert.equal(deleteProblemSet(storage, "a").some((set) => set.id === "a"), false);
const many = Array.from({ length: 60 }, (_, index) => ({ id: `set-${index}`, title: String(index), instructions: "x", problemIds: [] })); saveProblemSets(storage, many); assert.equal(loadProblemSets(storage).length, 50);
console.log("Problem set storage: PASS (broken input, upsert, duplicate, delete, max 50)");

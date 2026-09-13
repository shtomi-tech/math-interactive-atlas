import assert from "node:assert/strict";
import { addProblem, createProblemSet, moveProblem, normalizeProblemSet, removeProblem, updateSetMetadata } from "../static/sets/model.js";

let set = createProblemSet({ id: "set-test", now: "2026-09-12T00:00:00.000Z" });
set = updateSetMetadata(set, { title: "小テスト", instructions: "途中式を書く" }, "2026-09-12T00:01:00.000Z");
set = addProblem(set, "a", "2026-09-12T00:02:00.000Z"); set = addProblem(set, "b"); set = addProblem(set, "a");
assert.deepEqual(set.problemIds, ["a", "b"]);
assert.deepEqual(moveProblem(set, 1, "up").problemIds, ["b", "a"]);
assert.deepEqual(removeProblem(set, "a").problemIds, ["b"]);
assert.deepEqual(normalizeProblemSet({ id: "x", problemIds: ["a", "a", "b"], title: " x " }).problemIds, ["a", "b"]);
assert.deepEqual(normalizeProblemSet({ problemIds: ["a", "missing", "a"] }, new Set(["a"])).problemIds, ["a"]);
assert.equal(normalizeProblemSet({ problemIds: Array.from({ length: 40 }, (_, index) => `p${index}`) }).problemIds.length, 30);
console.log("Problem set model: PASS (create, metadata, add, dedupe, move, remove, normalize, max)");

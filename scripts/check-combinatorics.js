import assert from "node:assert/strict";
import {
  combinationCount,
  enumerateCombinations,
  enumeratePermutations,
  factorial,
  permutationCount,
  treePaths
} from "../static/atlas/math/combinatorics.js";

assert.equal(factorial(0), 1);
assert.equal(factorial(1), 1);
assert.equal(factorial(4), 24);
assert.equal(factorial(5), 120);
assert.throws(() => factorial(-1), RangeError);
assert.equal(permutationCount(5, 2), 20);
assert.equal(combinationCount(5, 2), 10);

const permutations = enumeratePermutations(["A", "B", "C"]);
assert.equal(permutations.length, 6);
assert.equal(new Set(permutations.map((items) => items.join(""))).size, 6);

const combinations = enumerateCombinations(["A", "B", "C", "D"], 2);
assert.equal(combinations.length, 6);
assert.equal(new Set(combinations.map((items) => items.join(""))).size, 6);
assert.deepEqual(combinations[0], ["A", "B"]);

const paths = treePaths([["A", "B", "C"], ["1", "2"]]);
assert.equal(paths.length, 6);
assert.equal(new Set(paths.map((items) => items.join(""))).size, 6);
assert.deepEqual(paths.map((items) => items.join("")), ["A1", "A2", "B1", "B2", "C1", "C2"]);

console.log("Combinatorics math: PASS (counts, permutations, combinations, tree paths)");

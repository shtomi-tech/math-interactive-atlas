import assert from "node:assert/strict";
import { arithmeticSum, arithmeticTerm, arithmeticTerms, differenceSequence, generateRecurrence, geometricSum, geometricTerm, partialSums, sigmaSum } from "../static/atlas/math/sequences.js";

assert.equal(arithmeticTerm(2, 3, 5), 14);
assert.deepEqual(arithmeticTerms(2, 3, 5), [2, 5, 8, 11, 14]);
assert.deepEqual(generateRecurrence({ initial: 1, next: (value) => value + 1, count: 0 }), []);
assert.deepEqual(partialSums([1, 2, NaN]), []);
assert.deepEqual(differenceSequence([1, Infinity]), []);
assert.equal(arithmeticSum(2, 3, 5), 40);
assert.equal(geometricTerm(2, 3, 4), 54);
assert.equal(geometricSum(2, 0.5, 4), 3.75);
assert.deepEqual(partialSums([2, 5, 8]), [2, 7, 15]);
assert.deepEqual(differenceSequence([2, 5, 8]), [3, 3]);
assert.deepEqual(generateRecurrence({ initial: 1, next: (previous) => 2 * previous + 1, count: 4 }), [1, 3, 7, 15]);
assert.equal(sigmaSum({ start: 1, end: 4, term: (index) => index * index }), 30);
console.log("Sequences math: PASS (arithmetic, geometric, partial sums, recurrence and sigma)");

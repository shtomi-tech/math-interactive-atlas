import assert from "node:assert/strict";
import { absoluteDistance, inequalityFacts, sqrtBounds } from "../static/atlas/math/number-line.js";
assert.deepEqual(sqrtBounds(10), { lowerInteger: 3, upperInteger: 4, lowerSquare: 9, upperSquare: 16, value: Math.sqrt(10) });
assert.equal(absoluteDistance(4, -2), 6);
for (const operator of ["<", "≤", ">", "≥"]) assert.equal(inequalityFacts(operator, 2).operator, operator);
assert.equal(inequalityFacts("≤", 2).closed, true);
console.log("Number line math: PASS (sqrt bounds, distance, inequality facts)");

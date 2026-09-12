import assert from "node:assert/strict";
import { changeOfBase, exponentialValue, logarithmValue, solveSimpleExponential, solveSimpleLogarithm } from "../static/atlas/math/exponential-logarithm.js";

assert.equal(exponentialValue(2, 3), 8);
assert.equal(logarithmValue(2, 8), 3);
assert.equal(changeOfBase(100, 10), 2);
assert.equal(solveSimpleExponential({ base: 2, target: 16 }), 4);
assert.equal(solveSimpleLogarithm({ base: 3, target: 2 }), 9);
assert.equal(exponentialValue(1, 3), null);
assert.equal(logarithmValue(2, 0), null);
assert.equal(logarithmValue(-2, 4), null);
console.log("Exponential/logarithm math: PASS (exponents, logarithms, base conversion and invalid domains)");

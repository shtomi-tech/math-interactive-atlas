import assert from "node:assert/strict";
import { antiderivativeCoefficients, criticalPoints, derivativeCoefficients, derivativeValue, definiteIntegral, polynomialValue, secantSlope, signedAreaParts, tangentLine } from "../static/atlas/math/calculus.js";

assert.equal(polynomialValue([1, 2, 1], 2), 9);
assert.deepEqual(derivativeCoefficients([1, 2, 1]), [2, 2]);
assert.equal(derivativeValue([0, 0, 1], 2), 4);
assert.equal(secantSlope([0, 0, 1], 1, 1), 3);
assert.deepEqual(tangentLine([0, 0, 1], 2), { slope: 4, intercept: -4, coefficients: [-4, 4], point: { x: 2, y: 4 } });
assert.deepEqual(criticalPoints([0, -3, 0, 1]), [-1, 1]);
assert.deepEqual(antiderivativeCoefficients([0, 2]), [0, 0, 1]);
assert.equal(definiteIntegral([0, 1], 0, 2), 2);
const parts = signedAreaParts([-1, 0, 1], -1, 2);
assert.equal(parts.length, 2);
assert.equal(parts[0].sign, "negative");
assert.equal(parts[1].sign, "positive");
assert.ok(Math.abs(definiteIntegral([-1, 0, 1], -1, 1) + 4 / 3) < 1e-10);
console.log("Calculus math: PASS (polynomial, derivative, tangent, integral and signed-area helpers)");

import assert from "node:assert/strict";
import { expandMonicProduct, factorPairExpansion, perfectSquareCoefficients } from "../static/atlas/math/algebra.js";
assert.deepEqual(expandMonicProduct(2, 3), { x2: 1, x: 5, constant: 6 });
assert.deepEqual(factorPairExpansion(-2, 3), { x2: 1, x: 1, constant: -6 });
assert.deepEqual(perfectSquareCoefficients(3), { x2: 1, x: 6, constant: 9 });
console.log("Algebra math: PASS (expansion, factorization, perfect square)");

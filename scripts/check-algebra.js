import assert from "node:assert/strict";
import { completeSquare, expandMonicProduct, factorPairExpansion, perfectSquareCoefficients } from "../static/atlas/math/algebra.js";
assert.deepEqual(expandMonicProduct(2, 3), { x2: 1, x: 5, constant: 6 });
assert.deepEqual(factorPairExpansion(-2, 3), { x2: 1, x: 1, constant: -6 });
assert.deepEqual(perfectSquareCoefficients(3), { x2: 1, x: 6, constant: 9 });
assert.deepEqual(completeSquare({ b: 4, c: 1 }), { h: 2, q: -3 });
assert.deepEqual(completeSquare({ b: 3, c: 1 }), { h: 1.5, q: -1.25 });
console.log("Algebra math: PASS (expansion, factorization, perfect square)");

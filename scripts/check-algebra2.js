import assert from "node:assert/strict";
import { complexMultiply, expandCubic, factorTheoremFacts, polynomialDivide, quadraticRootRelations } from "../static/atlas/math/algebra2.js";
assert.deepEqual(expandCubic(2), [8, 12, 6, 1]);
assert.deepEqual(polynomialDivide([-1, 0, 0, 1], [-1, 1]), { quotient: [1, 1, 1], remainder: [0] });
assert.deepEqual(complexMultiply({ real: 1, imag: 2 }, { real: 3, imag: 4 }), { real: -5, imag: 10 });
const roots = quadraticRootRelations(1, -5, 6); assert.equal(roots.sum, 5); assert.equal(roots.product, 6);
assert.equal(factorTheoremFacts([-6, 11, -6, 1], 1).isFactor, true);
console.log("Algebra II math: PASS (cubic, division, complex, roots and factor theorem)");

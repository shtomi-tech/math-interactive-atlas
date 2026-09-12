import assert from "node:assert/strict";
import { breakEvenPoint, leastSquaresLinear, linearModel, quadraticModel, residuals, rmse } from "../static/atlas/math/modeling.js";
assert.equal(linearModel({ slope: 2, intercept: 1 })(3), 7); assert.equal(quadraticModel({ a: 1, b: 0, c: 0 })(3), 9);
assert.deepEqual(residuals([1, 2], [1, 1]), [0, 1]); assert.equal(rmse([1, 2], [1, 2]), 0);
const fit = leastSquaresLinear([0, 1, 2], [1, 3, 5]); assert.equal(fit.slope, 2); assert.equal(fit.intercept, 1);
assert.deepEqual(breakEvenPoint({ slope: 2, intercept: 1 }, { slope: 1, intercept: 4 }), { x: 3, y: 7 });
console.log("Modeling math: PASS (models, residuals, regression, RMSE and break-even)");

import assert from "node:assert/strict";
import {
  correlationCoefficient,
  covariance,
  mean,
  median,
  quartiles,
  standardDeviation,
  variance
} from "../static/atlas/math/statistics.js";

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} !== ${expected}`);
}

close(mean([1, 2, 3, 4, 5]), 3, "mean");
close(median([1, 2, 3, 4, 5]), 3, "odd median");
close(median([1, 2, 3, 4]), 2.5, "even median");
close(variance([1, 2, 3]), 2 / 3, "population variance");
close(standardDeviation([1, 2, 3]), Math.sqrt(2 / 3), "standard deviation");
assert.deepEqual(quartiles([1, 2, 3, 4, 5]), { q1: 1.5, q2: 3, q3: 4.5 });
assert.deepEqual(quartiles([1, 2, 3, 4]), { q1: 1.5, q2: 2.5, q3: 3.5 });
close(covariance([1, 2, 3], [2, 4, 6]), 4 / 3, "covariance");
close(correlationCoefficient([1, 2, 3], [2, 4, 6]), 1, "positive correlation");
close(correlationCoefficient([1, 2, 3], [6, 4, 2]), -1, "negative correlation");
assert.equal(correlationCoefficient([1, 1, 1], [2, 3, 4]), null, "zero variance correlation");

console.log("Statistics math: PASS (mean, median, variance, quartiles, correlation)");

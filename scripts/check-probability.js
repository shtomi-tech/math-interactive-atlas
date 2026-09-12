import assert from "node:assert/strict";
import { binomialCoefficient, binomialProbability, binomialUpperTail } from "../static/atlas/math/probability.js";

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} !== ${expected}`);
}

assert.equal(binomialCoefficient(5, 0), 1);
assert.equal(binomialCoefficient(5, 5), 1);
close(binomialProbability(1, 0, 0.5), 0.5, "P(X=0), n=1, p=.5");
close(binomialProbability(1, 1, 0.5), 0.5, "P(X=1), n=1, p=.5");
const total = Array.from({ length: 21 }, (_, k) => binomialProbability(20, k, 0.5)).reduce((sum, value) => sum + value, 0);
close(total, 1, "binomial distribution sum");
close(binomialUpperTail(20, 15, 0.5), Array.from({ length: 6 }, (_, index) => binomialProbability(20, 15 + index, 0.5)).reduce((sum, value) => sum + value, 0), "upper tail");

console.log("Probability math: PASS (binomial probability and upper tail)");

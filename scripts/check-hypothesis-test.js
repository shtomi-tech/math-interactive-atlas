import assert from "node:assert/strict";
import { binomialProbability } from "../static/atlas/math/probability.js";
import { coinTestFacts } from "../static/atlas/math/hypothesis-test.js";

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} !== ${expected}`);
}

const facts = coinTestFacts({ n: 20, observedHeads: 15, nullProbability: 0.5 });
const directTail = Array.from({ length: 6 }, (_, index) => binomialProbability(20, 15 + index, 0.5)).reduce((sum, value) => sum + value, 0);
assert.equal(facts.n, 20);
assert.equal(facts.observedHeads, 15);
assert.equal(facts.distribution.length, 21);
close(facts.upperTail, directTail, "coin upper tail");
close(facts.pValue, facts.upperTail, "p-value alias");

console.log("Hypothesis test math: PASS (n=20, p=.5, observed=15)");

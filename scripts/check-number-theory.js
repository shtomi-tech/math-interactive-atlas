import assert from "node:assert/strict";
import { euclideanSteps, gcd } from "../static/atlas/math/number-theory.js";
assert.equal(gcd(84, 30), 6);
assert.equal(gcd(48, 18), 6);
for (const step of euclideanSteps(84, 30)) assert.equal(step.dividend, step.divisor * step.quotient + step.remainder);
assert.deepEqual(euclideanSteps(84, 30), [
  { dividend: 84, divisor: 30, quotient: 2, remainder: 24 },
  { dividend: 30, divisor: 24, quotient: 1, remainder: 6 },
  { dividend: 24, divisor: 6, quotient: 4, remainder: 0 }
]);
console.log("Number theory: PASS (gcd and Euclidean steps)");

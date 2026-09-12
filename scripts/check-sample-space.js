import assert from "node:assert/strict";
import { diceOutcomes, outcomesForEvent, probabilityForEvent } from "../static/atlas/math/sample-space.js";
const outcomes = diceOutcomes();
assert.equal(outcomes.length, 36);
assert.equal(new Set(outcomes.map(({ first, second }) => `${first}-${second}`)).size, 36);
assert.equal(outcomesForEvent("sum-7").length, 6);
assert.equal(outcomesForEvent("same").length, 6);
assert.equal(probabilityForEvent("sum-7"), 1 / 6);
console.log("Sample space math: PASS (36 outcomes and events)");

import assert from "node:assert/strict";
import { expressionForMask, REGION_BITS, toggleRegion } from "../static/atlas/math/set-regions.js";

const expected = new Map([
  [0, "∅"],
  [1, "(A ∪ B)ᶜ"],
  [2, "A ∩ Bᶜ"],
  [3, "Bᶜ"],
  [4, "A ∩ B"],
  [5, "(A ∩ B) ∪ (A ∪ B)ᶜ"],
  [6, "A"],
  [7, "A ∪ Bᶜ"],
  [8, "Aᶜ ∩ B"],
  [9, "Aᶜ"],
  [10, "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)"],
  [11, "(A ∩ B)ᶜ"],
  [12, "B"],
  [13, "Aᶜ ∪ B"],
  [14, "A ∪ B"],
  [15, "U"]
]);

expected.forEach((expression, mask) => assert.equal(expressionForMask(mask), expression, `mask ${mask}`));
assert.equal(toggleRegion(0, REGION_BITS.INTERSECTION), 4);
assert.equal(toggleRegion(4, REGION_BITS.INTERSECTION), 0);
assert.equal(toggleRegion(15, REGION_BITS.OUTSIDE), 14);
assert.equal(expected.size, 16);

console.log("Set regions math: PASS (16 masks)");

import assert from "node:assert/strict";
import { REGION_BITS } from "../static/atlas/math/set-regions.js";
import { CONDITIONAL_STEPS, conditionalStepFacts } from "../static/atlas/math/conditional-probability.js";

const expectedSteps = [
  [CONDITIONAL_STEPS.OVERVIEW, REGION_BITS.OUTSIDE | REGION_BITS.A_ONLY | REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY],
  [CONDITIONAL_STEPS.CONDITION, REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY],
  [CONDITIONAL_STEPS.INTERSECTION, REGION_BITS.INTERSECTION],
  [CONDITIONAL_STEPS.FORMULA, REGION_BITS.INTERSECTION]
];

assert.equal(REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY, 12, "B mask");
assert.equal(REGION_BITS.INTERSECTION, 4, "A∩B mask");
expectedSteps.forEach(([step, activeMask]) => {
  const facts = conditionalStepFacts(step);
  assert.equal(facts.step, step, `${step} step`);
  assert.equal(facts.universeMask, step === CONDITIONAL_STEPS.OVERVIEW ? 15 : 12, `${step} universeMask`);
  assert.equal(facts.activeMask, step === CONDITIONAL_STEPS.OVERVIEW ? 0 : activeMask, `${step} activeMask`);
  assert.ok(facts.title.trim(), `${step} title is empty`);
  assert.ok(facts.description.trim(), `${step} description is empty`);
  assert.ok(facts.formulaText.trim(), `${step} formulaText is empty`);
  assert.ok(facts.formulaLatex.trim(), `${step} formulaLatex is empty`);
});

assert.equal(conditionalStepFacts("unknown").step, CONDITIONAL_STEPS.OVERVIEW);

console.log("Conditional probability math: PASS (4 steps)");

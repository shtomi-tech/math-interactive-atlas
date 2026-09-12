import assert from "node:assert/strict";
import { SET_RELATIONS, relationFacts } from "../static/atlas/math/set-relations.js";

const expected = new Map([
  [SET_RELATIONS.P_SUBSET_Q, [true, false]],
  [SET_RELATIONS.Q_SUBSET_P, [false, true]],
  [SET_RELATIONS.EQUAL, [true, true]],
  [SET_RELATIONS.NEITHER, [false, false]]
]);

expected.forEach(([pImpliesQ, qImpliesP], relation) => {
  const facts = relationFacts(relation);
  assert.equal(facts.pImpliesQ, pImpliesQ, `${relation} pImpliesQ`);
  assert.equal(facts.qImpliesP, qImpliesP, `${relation} qImpliesP`);
  [
    "relationText",
    "relationLatex",
    "implicationText",
    "implicationLatex",
    "sufficientText",
    "necessaryText"
  ].forEach((field) => assert.equal(typeof facts[field], "string", `${relation} ${field} type`));
  [
    "relationText",
    "relationLatex",
    "implicationText",
    "implicationLatex",
    "sufficientText",
    "necessaryText"
  ].forEach((field) => assert.ok(facts[field].trim(), `${relation} ${field} is empty`));
});

console.log("Set relations math: PASS (4 relations)");

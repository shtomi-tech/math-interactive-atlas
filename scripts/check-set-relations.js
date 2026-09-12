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
  assert.ok(Array.isArray(facts.conditionStatements), `${relation} conditionStatements must be an array`);
  facts.conditionStatements.forEach((statement) => assert.ok(statement.trim(), `${relation} condition statement is empty`));
});

assert.equal(relationFacts(SET_RELATIONS.P_SUBSET_Q).sufficientText, "pはqの十分条件");
assert.equal(relationFacts(SET_RELATIONS.P_SUBSET_Q).necessaryText, "qはpの必要条件");
assert.equal(relationFacts(SET_RELATIONS.Q_SUBSET_P).sufficientText, "qはpの十分条件");
assert.equal(relationFacts(SET_RELATIONS.Q_SUBSET_P).necessaryText, "pはqの必要条件");
assert.equal(relationFacts(SET_RELATIONS.EQUAL).sufficientText, "pはqの必要十分条件");
assert.equal(relationFacts(SET_RELATIONS.EQUAL).necessaryText, "qはpの必要十分条件");
assert.deepEqual(relationFacts(SET_RELATIONS.NEITHER).conditionStatements, [
  "pはqの十分条件ではない",
  "qはpの必要条件ではない",
  "qはpの十分条件ではない",
  "pはqの必要条件ではない"
]);

console.log("Set relations math: PASS (4 relations)");

import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWorksheetModel, parseWorksheetIds, problemAnswerText } from "../static/worksheet/model.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const emptyModel = buildWorksheetModel(problems, ["missing"]);
assert.deepEqual(emptyModel.problems, []); assert.deepEqual(emptyModel.unknownIds, ["missing"]);
const fixtures = [
  { id: "numeric", type: "numeric", formula: "x=1", answer: { value: 1 } },
  { id: "choice", type: "single-choice", choices: [{ id: "a", text: "A" }], answer: { choiceId: "a" } },
  { id: "other", type: "numeric", answer: { value: 2 } }
];
const model = buildWorksheetModel(fixtures, ["other", "numeric", "missing", "numeric"]);
assert.deepEqual(model.problems.map((problem) => problem.id), ["other", "numeric"]); assert.deepEqual(model.unknownIds, ["missing"]);
assert.deepEqual(parseWorksheetIds("a,b,a"), ["a", "b"]); assert.equal(problemAnswerText(fixtures[0]) !== "", true); assert.equal(problemAnswerText(fixtures[1]), "A"); assert.equal(fixtures.some((problem) => problem.formula), true);
console.log(`Worksheet model: PASS (empty data, ordered ids, dedupe, unknown ids, numeric and choice data; live=${problems.length})`);

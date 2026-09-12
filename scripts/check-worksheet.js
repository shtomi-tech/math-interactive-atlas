import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWorksheetModel, parseWorksheetIds, problemAnswerText } from "../static/worksheet/model.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const model = buildWorksheetModel(problems, [problems[2].id, problems[0].id, "missing", problems[0].id]);
assert.deepEqual(model.problems.map((problem) => problem.id), [problems[2].id, problems[0].id]); assert.deepEqual(model.unknownIds, ["missing"]);
assert.deepEqual(parseWorksheetIds("a,b,a"), ["a", "b"]); assert.equal(problemAnswerText(problems.find((problem) => problem.type === "numeric")) !== "", true); assert.equal(problems.some((problem) => problem.type === "single-choice"), true); assert.equal(problems.some((problem) => problem.formula || problem.explanationFormula), true);
console.log("Worksheet model: PASS (ordered ids, dedupe, unknown ids, numeric and choice data)");

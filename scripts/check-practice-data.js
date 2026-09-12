import assert from "node:assert/strict";
import fs from "node:fs";
import { validateProblemData } from "../static/practice/validation.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
assert.equal(problems.length, contents.length * 3);
assert.deepEqual(validateProblemData(problems, contents), []);
assert.equal(new Set(problems.map((problem) => `${problem.subject}:${problem.unit}`)).size, 15);
assert.deepEqual(new Set(problems.map((problem) => problem.subject)), new Set(["math1", "mathA", "math2", "mathB"]));
console.log(`Practice data: PASS (${problems.length} problems, 15 units, 4 subjects)`);

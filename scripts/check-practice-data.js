import assert from "node:assert/strict";
import fs from "node:fs";
import { validateProblemData } from "../static/practice/validation.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
assert.equal(Array.isArray(problems), true);
assert.deepEqual(validateProblemData(problems, contents), []);
console.log(`Practice data: PASS (${problems.length} problems; empty catalog allowed)`);

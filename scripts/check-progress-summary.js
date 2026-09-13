import assert from "node:assert/strict";
import fs from "node:fs";
import { summarizeLearning } from "../static/progress/summary.js";

const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const state = { visited: { [contents[0].id]: { count: 1 } }, practice: { "legacy-problem": { attempts: 1, lastResult: "incorrect" } } };
const report = summarizeLearning(contents, problems, state);
assert.equal(report.visitedContents, 1); assert.equal(report.totalContents, contents.length); assert.equal(report.totalProblems, 0); assert.equal(report.review, 0); assert.equal(report.mastered, 0); assert.equal(report.practicing, 0); assert.equal(report.unattempted, 0); assert.equal(report.recentActivity.length, 0); assert.equal(report.contents[0].visited, true); assert.equal(report.contents[0].total, 0);
console.log("Progress summary: PASS (empty Practice data, stale history ignored, Atlas visits retained)");

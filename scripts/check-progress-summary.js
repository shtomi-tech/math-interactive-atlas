import assert from "node:assert/strict";
import fs from "node:fs";
import { summarizeLearning } from "../static/progress/summary.js";

const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const state = { visited: { [contents[0].id]: { count: 1 } }, practice: { [problems[0].id]: { attempts: 1, lastResult: "incorrect" }, [problems[1].id]: { attempts: 2, lastResult: "correct", correctStreak: 2, lastAttemptAt: "2026-09-12T00:00:00.000Z" }, [problems[2].id]: { attempts: 1, lastResult: "correct", correctStreak: 1, lastAttemptAt: "2026-09-12T00:01:00.000Z" } } };
const report = summarizeLearning(contents, problems, state);
assert.equal(report.visitedContents, 1); assert.equal(report.totalContents, contents.length); assert.equal(report.totalProblems, contents.length * 3); assert.equal(report.review, 1); assert.equal(report.mastered, 1); assert.equal(report.practicing, 1); assert.equal(report.recentActivity.length, 2); assert.equal(report.units.some((unit) => unit.unit === problems[0].unit), true); assert.equal(report.contents[0].visited, true);
const staleMastery = summarizeLearning(contents, problems, { practice: { [problems[0].id]: { masteredAt: "2026-09-12T00:00:00.000Z" } } });
assert.equal(staleMastery.unattempted, problems.length);
console.log("Progress summary: PASS (global, units, contents, current statuses, recent activity)");

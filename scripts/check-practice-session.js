import assert from "node:assert/strict";
import fs from "node:fs";
import { CONTENT_ORDER } from "../static/atlas/curriculum.js";
import { buildExplicitSession, buildSession, nextProblem, sessionPosition } from "../static/practice/session.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contentSession = buildSession(problems, { content: "quadratic-discriminant" });
assert.equal(contentSession.problems.length, 3);
assert.deepEqual(contentSession.problems.map((problem) => problem.difficulty), [1, 2, 3]);
assert.equal(buildSession(problems, { unit: "quadratic" }).problems.length, 24);
assert.equal(buildSession(problems, { unit: "quadratic", difficulty: 1 }).problems.length, 8);
assert.equal(buildSession(problems, { unit: "sequences" }).problems.length, 12);
assert.deepEqual(buildSession(problems, { content: "arithmetic-sequence" }).problems.map((problem) => problem.difficulty), [1, 2, 3]);
assert.equal(buildSession(problems, { query: "判別式" }).problems.length > 0, true);
const state = { practice: {
  [contentSession.problems[0].id]: { attempts: 1, correct: 0, wrong: 1, lastResult: "incorrect", correctStreak: 0 },
  [contentSession.problems[1].id]: { attempts: 1, correct: 1, wrong: 0, lastResult: "correct", correctStreak: 1 },
  [contentSession.problems[2].id]: { attempts: 2, correct: 2, wrong: 0, lastResult: "correct", correctStreak: 2 }
} };
assert.equal(buildSession(problems, { status: "review" }, state).problems.length, 1);
assert.equal(buildSession(problems, { status: "mastered" }, state).problems.length, 1);
const stableAgain = buildSession(problems, { unit: "quadratic" });
assert.deepEqual(stableAgain.problems.map((problem) => problem.id), buildSession(problems, { unit: "quadratic" }).problems.map((problem) => problem.id));
const quadraticContentOrder = buildSession(problems, { unit: "quadratic" }).problems.map((problem) => problem.atlasContentId);
assert.deepEqual(quadraticContentOrder, CONTENT_ORDER.quadratic.flatMap((contentId) => Array(3).fill(contentId)));
const explicit = buildExplicitSession(problems, ["quad-discriminant-03", "quad-discriminant-01", "missing", "quad-discriminant-01"]);
assert.deepEqual(explicit.problems.map((problem) => problem.id), ["quad-discriminant-03", "quad-discriminant-01"]);
assert.deepEqual(explicit.unknownIds, ["missing"]);
assert.equal(nextProblem(contentSession, contentSession.problems[0].id).id, contentSession.problems[1].id);
assert.equal(nextProblem(contentSession, contentSession.problems[2].id), null);
assert.deepEqual(sessionPosition(contentSession, contentSession.problems[1].id), { index: 1, position: 2, total: 3 });
console.log("Practice session: PASS (content, unit, difficulty, status, search, stable order, next/last)");

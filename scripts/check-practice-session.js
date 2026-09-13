import assert from "node:assert/strict";
import fs from "node:fs";
import { buildExplicitSession, buildSession, nextProblem, sessionPosition } from "../static/practice/session.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
assert.deepEqual(buildSession(problems, { content: "quadratic-basic" }).problems, []);
assert.deepEqual(buildExplicitSession(problems, ["missing"]).problems, []);
assert.deepEqual(buildExplicitSession(problems, ["missing"]).unknownIds, ["missing"]);

const sample = [
  { id: "p1", subject: "math1", unit: "quadratic", atlasContentId: "quadratic-basic", difficulty: 1, title: "P1", prompt: "P1" },
  { id: "p2", subject: "math1", unit: "quadratic", atlasContentId: "quadratic-basic", difficulty: 2, title: "P2", prompt: "P2" },
  { id: "p3", subject: "math1", unit: "quadratic", atlasContentId: "quadratic-basic", difficulty: 3, title: "P3", prompt: "P3" }
];
const contentSession = buildSession(sample, { content: "quadratic-basic" });
assert.deepEqual(contentSession.problems.map((problem) => problem.difficulty), [1, 2, 3]);
const state = { practice: {
  p1: { attempts: 1, correct: 0, wrong: 1, lastResult: "incorrect", correctStreak: 0 },
  p2: { attempts: 1, correct: 1, wrong: 0, lastResult: "correct", correctStreak: 1 },
  p3: { attempts: 2, correct: 2, wrong: 0, lastResult: "correct", correctStreak: 2 }
} };
assert.equal(buildSession(sample, { status: "review" }, state).problems.length, 1);
assert.equal(buildSession(sample, { status: "mastered" }, state).problems.length, 1);
const explicit = buildExplicitSession(sample, ["p3", "p1", "missing", "p1"]);
assert.deepEqual(explicit.problems.map((problem) => problem.id), ["p3", "p1"]);
assert.deepEqual(explicit.unknownIds, ["missing"]);
assert.equal(nextProblem(contentSession, "p1").id, "p2");
assert.equal(nextProblem(contentSession, "p3"), null);
assert.deepEqual(sessionPosition(contentSession, "p2"), { index: 1, position: 2, total: 3 });
console.log(`Practice session: PASS (${problems.length} live problems; empty and fixture sessions)`);

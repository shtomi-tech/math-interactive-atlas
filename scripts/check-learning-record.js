import assert from "node:assert/strict";
import { buildLearningRecord, parseLearningRecord, replaceLearningRecord, validateLearningRecord } from "../static/progress/record.js";

const state = { version: 2, favorites: ["content-a"], visited: {}, practice: { p1: { attempts: 1, correct: 1, wrong: 0, correctStreak: 1, lastResult: "correct" } } };
const record = buildLearningRecord(state, "2026-09-12T00:00:00.000Z");
assert.equal(validateLearningRecord(record), true); assert.deepEqual(replaceLearningRecord(record).favorites, ["content-a"]); assert.equal(parseLearningRecord(JSON.stringify(record)).ok, true); assert.equal(parseLearningRecord("{broken").ok, false); assert.equal(parseLearningRecord({ schema: record.schema, version: 1, state: {} }).ok, false); assert.equal(record.schema, "math-interactive-atlas-learning-record");
console.log("Learning record: PASS (v2 schema, parse, validate, normalize, replace-only)");

import assert from "node:assert/strict";
import { LEARNING_STATE_KEY, LEARNING_STATE_VERSION, loadLearningState, recordPracticeAttempt, recordVisit, saveLearningState, toggleFavorite } from "../static/atlas/storage.js";

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const empty = loadLearningState(new MemoryStorage({ [LEARNING_STATE_KEY]: JSON.stringify({ version: 1, favorites: [], visited: {}, practice: {} }) }));
assert.equal(LEARNING_STATE_VERSION, 2);
assert.deepEqual(empty, { version: 2, favorites: [], visited: {}, practice: {} });
const v1Correct = loadLearningState(new MemoryStorage({ [LEARNING_STATE_KEY]: JSON.stringify({ version: 1, favorites: [], visited: {}, practice: { old: { attempts: 1, correct: 1, wrong: 0, lastResult: "correct" } } }) }));
assert.equal(v1Correct.practice.old.correctStreak, 1);
const v1Incorrect = loadLearningState(new MemoryStorage({ [LEARNING_STATE_KEY]: JSON.stringify({ version: 1, favorites: [], visited: {}, practice: { old: { attempts: 1, correct: 0, wrong: 1, lastResult: "incorrect" } } }) }));
assert.equal(v1Incorrect.practice.old.correctStreak, 0);
const brokenStorage = new MemoryStorage({ [LEARNING_STATE_KEY]: "{broken" });
assert.deepEqual(loadLearningState(brokenStorage), { version: 2, favorites: [], visited: {}, practice: {} });
const brokenCounts = loadLearningState(new MemoryStorage({ [LEARNING_STATE_KEY]: JSON.stringify({ version: 2, practice: { broken: { attempts: 1, correct: 4, wrong: 3, lastResult: "correct", correctStreak: 9 } } }) }));
assert.equal(brokenCounts.practice.broken.attempts, 7);
assert.equal(brokenCounts.practice.broken.correct + brokenCounts.practice.broken.wrong <= brokenCounts.practice.broken.attempts, true);

const stateStorage = new MemoryStorage();
let state = loadLearningState(stateStorage);
state = toggleFavorite(state, "quadratic-discriminant"); state = toggleFavorite(state, "quadratic-discriminant"); state = toggleFavorite(state, "quadratic-discriminant");
assert.deepEqual(state.favorites, ["quadratic-discriminant"]);
state = toggleFavorite(state, "quadratic-discriminant"); assert.deepEqual(state.favorites, []);
state = recordVisit(state, "quadratic-discriminant", "2026-09-12T00:00:00.000Z"); state = recordVisit(state, "quadratic-discriminant", "2026-09-12T00:01:00.000Z");
assert.equal(state.visited["quadratic-discriminant"].count, 2);
state = recordPracticeAttempt(state, "quad-discriminant-01", { correct: true, now: "2026-09-12T00:02:00.000Z" });
assert.equal(state.practice["quad-discriminant-01"].correctStreak, 1);
assert.equal(state.practice["quad-discriminant-01"].masteredAt, undefined);
state = recordPracticeAttempt(state, "quad-discriminant-01", { correct: true, now: "2026-09-12T00:03:00.000Z" });
assert.equal(state.practice["quad-discriminant-01"].correctStreak, 2);
assert.equal(state.practice["quad-discriminant-01"].masteredAt, "2026-09-12T00:03:00.000Z");
state = recordPracticeAttempt(state, "quad-discriminant-01", { correct: false, now: "2026-09-12T00:04:00.000Z" });
assert.equal(state.practice["quad-discriminant-01"].correctStreak, 0);
assert.equal(state.practice["quad-discriminant-01"].lastResult, "incorrect");
assert.equal(state.practice["quad-discriminant-01"].masteredAt, "2026-09-12T00:03:00.000Z");
assert.equal(saveLearningState(stateStorage, state), true); assert.deepEqual(loadLearningState(stateStorage), state); assert.equal(saveLearningState(null, state), false);
console.log("Learning state: PASS (v1 migration, mastery, review reset, counters, storage failure)");

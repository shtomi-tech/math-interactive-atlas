import assert from "node:assert/strict";
import { LEARNING_STATE_KEY, loadLearningState, recordPracticeAttempt, recordVisit, saveLearningState, toggleFavorite } from "../static/atlas/storage.js";

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const emptyStorage = new MemoryStorage();
assert.deepEqual(loadLearningState(emptyStorage), { version: 1, favorites: [], visited: {}, practice: {} });
const brokenStorage = new MemoryStorage({ [LEARNING_STATE_KEY]: "{broken" });
assert.deepEqual(loadLearningState(brokenStorage), { version: 1, favorites: [], visited: {}, practice: {} });
const stateStorage = new MemoryStorage();
let state = loadLearningState(stateStorage);
state = toggleFavorite(state, "quadratic-discriminant"); state = toggleFavorite(state, "quadratic-discriminant"); state = toggleFavorite(state, "quadratic-discriminant");
assert.deepEqual(state.favorites, ["quadratic-discriminant"]);
state = toggleFavorite(state, "quadratic-discriminant"); assert.deepEqual(state.favorites, []);
state = recordVisit(state, "quadratic-discriminant", "2026-09-12T00:00:00.000Z"); state = recordVisit(state, "quadratic-discriminant", "2026-09-12T00:01:00.000Z"); state = recordVisit(state, "quadratic-discriminant", "2026-09-12T00:02:00.000Z");
assert.equal(state.visited["quadratic-discriminant"].count, 3); assert.equal(state.visited["quadratic-discriminant"].lastVisitedAt, "2026-09-12T00:02:00.000Z");
state = recordPracticeAttempt(state, "quad-discriminant-01", { correct: false, now: "2026-09-12T00:03:00.000Z" }); state = recordPracticeAttempt(state, "quad-discriminant-01", { correct: true, now: "2026-09-12T00:04:00.000Z" });
assert.deepEqual(state.practice["quad-discriminant-01"], { attempts: 2, correct: 1, wrong: 1, lastResult: "correct", lastAttemptAt: "2026-09-12T00:04:00.000Z" });
assert.equal(saveLearningState(stateStorage, state), true); assert.deepEqual(loadLearningState(stateStorage), state); assert.equal(saveLearningState(null, state), false);
console.log("Learning state: PASS (parse, favorites, visits, attempts, graceful storage failure)");

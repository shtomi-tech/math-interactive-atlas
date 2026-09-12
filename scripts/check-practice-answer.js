import assert from "node:assert/strict";
import { checkAnswer, checkNumeric, checkSingleChoice } from "../static/practice/answer.js";

const choice = { type: "single-choice", answer: { choiceId: "b" } };
assert.equal(checkSingleChoice(choice, "b"), true); assert.equal(checkSingleChoice(choice, "a"), false); assert.equal(checkAnswer(choice, { choiceId: "b" }), true);
const numeric = { type: "numeric", answer: { value: 6, tolerance: 0.01 } };
assert.equal(checkNumeric(numeric, 6), true); assert.equal(checkNumeric(numeric, 6.009), true); assert.equal(checkNumeric(numeric, 6.02), false); assert.equal(checkAnswer(numeric, { value: 6 }), true);
console.log("Practice answer: PASS (choice and numeric tolerance)");

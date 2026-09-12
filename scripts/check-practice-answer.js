import assert from "node:assert/strict";
import { checkAnswer, checkNumeric, checkSingleChoice, evaluateAnswer, parseNumericResponse } from "../static/practice/answer.js";

const choice = { type: "single-choice", answer: { choiceId: "b" } };
assert.equal(checkSingleChoice(choice, "b"), true); assert.equal(checkSingleChoice(choice, "a"), false); assert.equal(checkAnswer(choice, { choiceId: "b" }), true);
const numeric = { type: "numeric", answer: { value: 6, tolerance: 0.01 } };
assert.equal(checkNumeric(numeric, 6), true); assert.equal(checkNumeric(numeric, 6.009), true); assert.equal(checkNumeric(numeric, 6.02), false); assert.equal(checkAnswer(numeric, { value: 6 }), true);
const zero = { type: "numeric", answer: { value: 0, tolerance: 0.001 } };
assert.equal(parseNumericResponse(""), null); assert.equal(parseNumericResponse("   "), null);
assert.equal(parseNumericResponse("０"), 0); assert.equal(parseNumericResponse("−１"), -1);
assert.deepEqual(evaluateAnswer(zero, { value: "" }), { valid: false, correct: false });
assert.deepEqual(evaluateAnswer(zero, { value: " " }), { valid: false, correct: false });
assert.deepEqual(evaluateAnswer(zero, { value: "0" }), { valid: true, correct: true, normalizedResponse: 0 });
assert.equal(checkNumeric({ type: "numeric", answer: { value: -1, tolerance: 0.001 } }, "−１"), true);
console.log("Practice answer: PASS (blank, Unicode numeric input, choice, tolerance)");

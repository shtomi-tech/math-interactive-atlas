import assert from "node:assert/strict";
import fs from "node:fs";
import { SUBJECT_META, UNIT_META } from "../static/atlas/curriculum.js";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const contentIds = new Set(contents.map((content) => content.id));
assert.equal(problems.length, 120, "Practice must contain 120 problems");
assert.equal(contents.length, 40, "Atlas must contain 40 contents");
assert.equal(new Set(problems.map((problem) => problem.id)).size, 120, "problem ids must be unique");
assert.equal(new Set(problems.map((problem) => problem.prompt)).size, 120, "problem prompts must be unique");
assert.equal(new Set(problems.map((problem) => problem.atlasContentId)).size, 40, "all Atlas contents must be covered");
contents.forEach((content) => assert.equal(problems.filter((problem) => problem.atlasContentId === content.id).length, 3, `${content.id} must have 3 problems`));
problems.forEach((problem) => {
  assert.equal(contentIds.has(problem.atlasContentId), true, `${problem.id} has an unknown atlasContentId`);
  assert.equal(Boolean(SUBJECT_META[problem.subject]), true, `${problem.id} has an unknown subject`);
  assert.equal(Boolean(UNIT_META[problem.unit]), true, `${problem.id} has an unknown unit`);
  const sameContent = problems.filter((item) => item.atlasContentId === problem.atlasContentId);
  assert.equal(sameContent.filter((item) => item.difficulty === 1).length, 1, `${problem.atlasContentId} needs one difficulty 1 problem`);
  assert.equal(sameContent.filter((item) => item.difficulty === 2).length, 1, `${problem.atlasContentId} needs one difficulty 2 problem`);
  assert.equal(sameContent.filter((item) => item.difficulty === 3).length, 1, `${problem.atlasContentId} needs one difficulty 3 problem`);
  if (problem.type === "numeric") { assert.equal(Number.isFinite(problem.answer?.value), true, `${problem.id} answer must be finite`); assert.equal(Number.isFinite(problem.answer?.tolerance), true, `${problem.id} tolerance must be finite`); }
  if (problem.type === "single-choice") { const answers = problem.choices.filter((choice) => choice.id === problem.answer?.choiceId); assert.equal(answers.length, 1, `${problem.id} answer choice must be unique`); }
});
console.log("Practice coverage: PASS (120 problems, 40/40 contents, difficulty 1/2/3)");

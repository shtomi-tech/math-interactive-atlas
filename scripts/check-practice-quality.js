import assert from "node:assert/strict";
import fs from "node:fs";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const contentIds = new Set(contents.map((content) => content.id));
assert.equal(problems.length, 180);
assert.equal(new Set(problems.map((problem) => problem.id)).size, 180);
const byContent = new Map();
const issues = [];
for (const problem of problems) {
  if (!contentIds.has(problem.atlasContentId)) issues.push(`${problem.id}: unknown content`);
  if (![1, 2, 3].includes(problem.difficulty)) issues.push(`${problem.id}: invalid difficulty`);
  if (!problem.prompt?.trim() || !problem.explanation?.trim() || !problem.tags?.length) issues.push(`${problem.id}: missing learning text`);
  if (problem.type === "single-choice") {
    const choices = Array.isArray(problem.choices) ? problem.choices : [];
    const ids = choices.map((choice) => choice.id);
    const texts = choices.map((choice) => choice.text);
    if (choices.length < 3 || new Set(ids).size !== ids.length || new Set(texts).size !== texts.length || !ids.includes(problem.answer?.choiceId)) issues.push(`${problem.id}: choice answer is not unique/valid`);
  } else if (problem.type === "numeric") {
    if (!Number.isFinite(problem.answer?.value) || !Number.isFinite(problem.answer?.tolerance) || problem.answer.tolerance <= 0) issues.push(`${problem.id}: numeric answer is invalid`);
  } else issues.push(`${problem.id}: unknown problem type`);
  if (!byContent.has(problem.atlasContentId)) byContent.set(problem.atlasContentId, []);
  byContent.get(problem.atlasContentId).push(problem);
}
for (const content of contents) {
  const items = byContent.get(content.id) || [];
  assert.equal(items.length, 3, `${content.id}: expected 3 problems`);
  assert.deepEqual(items.map((problem) => problem.difficulty).sort(), [1, 2, 3], `${content.id}: expected d1/d2/d3`);
}
assert.equal(issues.length, 0, issues.join("\n"));
console.log("Practice quality audit: PASS (180 prompts, unique answers, conditions/text, 60 content x 3 difficulty levels)");

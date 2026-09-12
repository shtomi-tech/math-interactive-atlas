import assert from "node:assert/strict";
import fs from "node:fs";

const problems = JSON.parse(fs.readFileSync(new URL("../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const contentIds = new Set(contents.map((content) => content.id));
problems.forEach((problem) => assert.equal(contentIds.has(problem.atlasContentId), true, `${problem.id} has an unknown atlasContentId`));
const covered = new Set(problems.map((problem) => problem.atlasContentId));
console.log(`Practice coverage: ${covered.size} / ${contents.length} contents`);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch (error) {
    errors.push(`${relativePath} is not readable: ${error.message}`);
    return "";
  }
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const contents = readJson("static/atlas/content-data.json");
const practice = readJson("static/practice/problem-data.json");
const audit = readJson("research/repository-audit.json");
const registrySource = read("static/atlas/interactions/index.js");
const expectedEngines = ["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"];
const subjects = new Set(Array.isArray(contents) ? contents.map((content) => content.subject) : []);
const engines = new Set(Array.isArray(contents) ? contents.map((content) => content.interaction?.engine) : []);
const auditRecords = Array.isArray(audit?.contents) ? audit.contents : [];
const auditCounts = auditRecords.reduce((counts, record) => {
  counts[record.auditStatus] = (counts[record.auditStatus] || 0) + 1;
  return counts;
}, {});

requireCondition(Array.isArray(contents) && contents.length === 89, "R3 scope requires exactly 89 Atlas contents");
requireCondition(Array.isArray(practice) && practice.length === 0, "R3 scope requires an empty Practice catalog");
requireCondition(audit?.version === 1 && auditRecords.length === 89, "R3 scope requires 89 audit records");
requireCondition((auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && (auditCounts.pending || 0) === 0, "R3 scope requires audit verified 0 / needs-review 89 / pending 0");
requireCondition(subjects.size === 4 && ["math1", "mathA", "math2", "mathB"].every((subject) => subjects.has(subject)), "R3 scope requires Math I/A/II/B subjects only");
requireCondition(engines.size === 11 && expectedEngines.every((engine) => engines.has(engine)), "R3 scope requires exactly 11 runtime interaction engines");
expectedEngines.forEach((engine) => requireCondition(registrySource.includes(engine), `R3 scope engine registry is missing ${engine}`));

if (errors.length > 0) {
  console.error("R3 scope: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("R3 scope: PASS (89 contents; Practice 0; audit verified 0 / needs-review 89 / pending 0; 11 engines; 4 subjects)");
}

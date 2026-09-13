import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const readJson = (relativePath) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); }
  catch (error) { errors.push(`${relativePath}: ${error.message}`); return null; }
};
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const contents = readJson("static/atlas/content-data.json");
const practice = readJson("static/practice/problem-data.json");
const audit = readJson("research/repository-audit.json");
const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const coverage = readJson("data/candidate-canonical-map.json");
const registry = (() => { try { return fs.readFileSync(path.join(root, "static/atlas/interactions/index.js"), "utf8"); } catch { return ""; } })();
const auditCounts = (audit?.contents || []).reduce((counts, record) => { counts[record.auditStatus] = (counts[record.auditStatus] || 0) + 1; return counts; }, {});
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const features = external?.repositories?.flatMap((repository) => repository.features || []) || [];
const count = (status) => mappings.filter((mapping) => mapping.status === status).length;
const repositoryIds = (external?.repositories || []).map((repository) => repository.id);

requireCondition(Array.isArray(contents) && contents.length === 89, "R5 scope requires exactly 89 Legacy Candidates");
requireCondition(Array.isArray(practice) && practice.length === 0, "R5 scope requires Practice 0");
requireCondition(audit?.version === 1 && audit?.contents?.length === 89, "R5 scope requires 89 audit records");
requireCondition((auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && (auditCounts.pending || 0) === 0, "R5 scope requires audit 0 / 89 / 0");
requireCondition(Array.isArray(library?.interactions) && library.interactions.length === 8, "R5 scope requires 8 canonical interactions");
requireCondition(Array.isArray(external?.repositories) && external.repositories.length === 6, "R5 scope requires 6 external repositories");
requireCondition(features.length === 10, "R5 scope requires 10 external features");
requireCondition(runtime?.version === 1 && mappings.length === 8, "R5 scope requires 8 runtime mappings");
requireCondition(count("implemented") === 3 && count("planned") === 5 && count("blocked-evidence") === 0, "R5 scope requires runtime 3 implemented / 5 planned / 0 blocked-evidence");
requireCondition(Array.isArray(coverage?.candidates) && coverage.candidates.length === 89, "R5 scope requires 89 candidate-canonical records");
requireCondition(repositoryIds.join(",") === "REPO-001,REPO-002,REPO-003,REPO-004,REPO-005,REPO-006", "R5 repositories must be the fixed six-repository set");
requireCondition(!JSON.stringify({ library, external, coverage }).includes("adapted-from"), "R5 metadata must not use adapted-from");
requireCondition(registry.includes("functionGraph") && ["rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"].every((engine) => registry.includes(engine)), "R5 scope requires the existing 11-engine registry");

if (errors.length) {
  console.error("R5 scope: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("R5 scope: PASS (89 Legacy Candidates; audit 0 / 89 / 0; 8 Canonical; 6 repositories; 10 features; Practice 0; Engines 11; runtime 3 / 5 / 0; coverage 89)");
}

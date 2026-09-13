import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const readJson = (relativePath) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); }
  catch (error) { errors.push(`${relativePath}: ${error.message}`); return null; }
};
const readText = (relativePath) => { try { return fs.readFileSync(path.join(root, relativePath), "utf8"); } catch { return ""; } };
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const contents = readJson("static/atlas/content-data.json");
const practice = readJson("static/practice/problem-data.json");
const audit = readJson("research/repository-audit.json");
const library = readJson("data/interactions.json");
const activeIndex = readJson("dist/ai/interactions.json");
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const coverage = readJson("data/candidate-canonical-map.json");
const gapAnalysis = readJson("research/gap-behavior-analysis.json");
const candidateRegistry = readJson("research/canonical-interaction-candidates.json");
const leads = readJson("research/canonical-candidate-repository-leads.json");
const auditCounts = (audit?.contents || []).reduce((counts, record) => { counts[record.auditStatus] = (counts[record.auditStatus] || 0) + 1; return counts; }, {});
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const features = external?.repositories?.flatMap((repository) => repository.features || []) || [];
const activeIds = ["MATH-INT-001", "MATH-INT-002", "MATH-INT-003", "MATH-INT-004", "MATH-INT-005", "MATH-INT-006", "MATH-INT-007", "MATH-INT-008"];
const fixedRepositories = ["REPO-001", "REPO-002", "REPO-003", "REPO-004", "REPO-005", "REPO-006"];
const fixedFeatures = ["REPO-001-F001", "REPO-001-F002", "REPO-001-F003", "REPO-002-F001", "REPO-002-F002", "REPO-002-F003", "REPO-003-F001", "REPO-004-F001", "REPO-005-F001", "REPO-006-F001"];
const countStatus = (status) => mappings.filter((mapping) => mapping.status === status).length;
const gapIds = new Set((coverage?.candidates || []).filter((candidate) => candidate.coverageStatus === "gap").map((candidate) => candidate.candidateId));
const analyzedGapIds = new Set((gapAnalysis?.gaps || []).map((gap) => gap.candidateId));

requireCondition(Array.isArray(contents) && contents.length === 89, "R6 scope requires exactly 89 Legacy Candidates");
requireCondition(Array.isArray(practice) && practice.length === 0, "R6 scope requires Practice 0");
requireCondition(audit?.version === 1 && audit?.contents?.length === 89, "R6 scope requires 89 audit records");
requireCondition((auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && (auditCounts.pending || 0) === 0, "R6 scope requires audit 0 / 89 / 0");
requireCondition(Array.isArray(library?.interactions) && library.interactions.length === 8, "R6 scope requires 8 active canonical interactions");
requireCondition(Array.isArray(activeIndex?.interactions) && activeIndex.interactions.length === 8, "R6 scope requires 8 active generated interactions");
requireCondition(library?.interactions?.map((interaction) => interaction.id).sort().join(",") === activeIds.join(","), "active canonical IDs must remain MATH-INT-001..008");
requireCondition(activeIndex?.interactions?.map((interaction) => interaction.id).sort().join(",") === activeIds.join(","), "active generated IDs must remain MATH-INT-001..008");
requireCondition(Array.isArray(external?.repositories) && external.repositories.length === 6, "R6 scope requires 6 active external repositories");
requireCondition(external.repositories.map((repository) => repository.id).join(",") === fixedRepositories.join(","), "active repository IDs must remain the fixed six-repository set");
requireCondition(features.length === 10 && features.map((feature) => feature.id).join(",") === fixedFeatures.join(","), "active repository features must remain the fixed ten-feature set");
requireCondition(runtime?.version === 1 && mappings.length === 8, "R6 scope requires 8 runtime mappings");
requireCondition(countStatus("implemented") === 3 && countStatus("planned") === 5 && countStatus("blocked-evidence") === 0, "R6 scope requires runtime 3 implemented / 5 planned / 0 blocked-evidence");
requireCondition(Array.isArray(coverage?.candidates) && coverage.candidates.length === 89, "R6 scope requires 89 candidate-canonical records");
requireCondition(gapIds.size === 56 && analyzedGapIds.size === 56 && [...gapIds].every((id) => analyzedGapIds.has(id)), "R6 scope requires exact analysis of the 56 R5 gaps");
requireCondition(Array.isArray(candidateRegistry?.candidates) && candidateRegistry.candidates.filter((candidate) => candidate.shortlisted).length >= 3 && candidateRegistry.candidates.filter((candidate) => candidate.shortlisted).length <= 5, "R6 scope requires a 3 to 5 proposal shortlist");
requireCondition(!JSON.stringify({ library, activeIndex, external, runtime, coverage, candidateRegistry, leads }).includes("adapted-from"), "R6 metadata must not use adapted-from");
requireCondition(!JSON.stringify(candidateRegistry).match(/MATH-INT-\d{3}/), "R6 candidates must not add active MATH-INT IDs");
const registrySource = readText("static/atlas/interactions/index.js");
requireCondition(["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"].every((engine) => registrySource.includes(engine)), "R6 scope requires the existing 11-engine registry");

if (errors.length) {
  console.error("R6 scope: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("R6 scope: PASS (89 Legacy Candidates; audit 0 / 89 / 0; 8 Canonical; 6 repositories; 10 features; Practice 0; Engines 11; runtime 3 / 5 / 0; gaps 56; shortlist 4)");
}

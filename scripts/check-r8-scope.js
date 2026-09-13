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
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const coverage = readJson("data/candidate-canonical-map.json");
const activeIndex = readJson("dist/ai/interactions.json");
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const interactions = Array.isArray(library?.interactions) ? library.interactions : [];
const features = (external?.repositories || []).flatMap((repository) => repository.features || []);
const auditCounts = (audit?.contents || []).reduce((result, record) => { result[record.auditStatus] = (result[record.auditStatus] || 0) + 1; return result; }, {});
const runtimeCounts = mappings.reduce((result, mapping) => { result[mapping.status] = (result[mapping.status] || 0) + 1; return result; }, {});
const coverageCounts = (coverage?.candidates || []).reduce((result, record) => { result[record.coverageStatus] = (result[record.coverageStatus] || 0) + 1; return result; }, { covered: 0, partial: 0, gap: 0 });
const canonicalIds = interactions.map((interaction) => interaction.id);

requireCondition(contents?.length === 89, "R8 must preserve 89 Legacy Candidates");
requireCondition(practice?.length === 0, "R8 must preserve Practice 0");
requireCondition(audit?.version === 1 && audit?.contents?.length === 89 && (auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && !(auditCounts.pending || 0), "R8 audit must remain 0 / 89 / 0");
requireCondition(interactions.length === 10 && canonicalIds.every((id, index) => id === `MATH-INT-${String(index + 1).padStart(3, "0")}`), "R8 Canonical IDs must remain exactly MATH-INT-001..010");
requireCondition(activeIndex?.interactions?.length === 10, "R8 generated AI index must contain 10 Canonical records");
requireCondition(external?.repositories?.length === 9 && features.length === 13, "R8 must preserve 9 repositories and 13 features");
requireCondition(runtime?.version === 1 && mappings.length === 10, "R8 runtime map must contain 10 mappings");
requireCondition(runtimeCounts.implemented === 4 && runtimeCounts.planned === 6 && !(runtimeCounts["blocked-evidence"] || 0), "R8 runtime must be 4 / 6 / 0");
requireCondition(coverage?.candidates?.length === 89 && coverageCounts.covered === 18 && coverageCounts.partial === 24 && coverageCounts.gap === 47, "R8 coverage must remain 18 / 24 / 47");
requireCondition(readText("static/atlas/interactions/index.js").match(/functionGraph|rangeGraph|geometryBoard|regionSelector|combinatoricsViewer|dataLab|simulationLab|algebraLab|numberLineLab|algorithmLab|sequenceLab/g)?.length >= 11, "R8 must preserve the existing 11-engine registry");
requireCondition(!JSON.stringify({ library, external, runtime, coverage }).includes("adapted-from"), "R8 metadata must not use adapted-from");
requireCondition(canonicalIds.includes("MATH-INT-009") && !canonicalIds.includes("MATH-INT-011"), "R8 must not add a new Canonical interaction");
requireCondition(mappings.find((mapping) => mapping.interactionId === "MATH-INT-010")?.status === "planned", "R8 must leave MATH-INT-010 planned");

if (errors.length) {
  console.error("R8 scope: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("R8 scope: PASS (Canonical 10; repositories 9; features 13; runtime 4 / 6 / 0; coverage 18 / 24 / 47; Legacy 89; Practice 0; Engines 11)");
}

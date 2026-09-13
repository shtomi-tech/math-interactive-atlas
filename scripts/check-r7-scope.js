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
const plan = readJson("research/canonical-promotion-plan.json");
const evidence = readJson("research/canonical-promotion-evidence.json");
const delta = readJson("research/r7-coverage-delta.json");
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const interactions = Array.isArray(library?.interactions) ? library.interactions : [];
const repositories = Array.isArray(external?.repositories) ? external.repositories : [];
const features = repositories.flatMap((repository) => repository.features || []);
const retainedIds = new Set(["MATH-INT-001", "MATH-INT-002", "MATH-INT-003", "MATH-INT-004", "MATH-INT-005", "MATH-INT-006", "MATH-INT-007", "MATH-INT-008"]);
const baselineRepositoryNames = new Set(["phetsims/graphing-quadratics", "phetsims/function-builder", "phetsims/area-model-algebra", "phetsims/fractions-intro", "phetsims/area-model-common", "phetsims/fractions-common"]);
const baselineFeatureIds = new Set(["REPO-001-F001", "REPO-001-F002", "REPO-001-F003", "REPO-002-F001", "REPO-002-F002", "REPO-002-F003", "REPO-003-F001", "REPO-004-F001", "REPO-005-F001", "REPO-006-F001"]);
const decisions = Array.isArray(plan?.decisions) ? plan.decisions : [];
const promoted = decisions.filter((decision) => decision.decision === "promote");
const promotedIds = new Set(promoted.map((decision) => decision.promotedInteractionId));
const promotedEvidence = (evidence?.promotions || []).flatMap((promotion) => promotion.sources || []);
const newRepositoryNames = new Set(promotedEvidence.map((source) => source.repository).filter((repository) => !baselineRepositoryNames.has(repository)));
const formalizedNewFeatureIds = new Set();
promotedEvidence.forEach((source) => {
  const repository = repositories.find((item) => item.repository === source.repository);
  (repository?.features || []).forEach((feature) => {
    if ((feature.paths || []).some((sourcePath) => source.sourcePaths.includes(sourcePath)) && !baselineFeatureIds.has(feature.id)) formalizedNewFeatureIds.add(feature.id);
  });
});
const auditCounts = (audit?.contents || []).reduce((counts, record) => { counts[record.auditStatus] = (counts[record.auditStatus] || 0) + 1; return counts; }, {});
const runtimeCounts = mappings.reduce((counts, mapping) => { counts[mapping.status] = (counts[mapping.status] || 0) + 1; return counts; }, {});
const coverageCounts = (coverage?.candidates || []).reduce((counts, record) => { counts[record.coverageStatus] = (counts[record.coverageStatus] || 0) + 1; return counts; }, { covered: 0, partial: 0, gap: 0 });
const registrySource = readText("static/atlas/interactions/index.js");
const canonicalIds = interactions.map((interaction) => interaction.id);

requireCondition(contents?.length === 89, "R7 scope requires 89 Legacy Candidates");
requireCondition(practice?.length === 0, "R7 scope requires Practice 0");
requireCondition(audit?.version === 1 && audit?.contents?.length === 89, "R7 scope requires 89 audit records");
requireCondition((auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && (auditCounts.pending || 0) === 0, "R7 scope requires audit 0 / 89 / 0");
requireCondition(interactions.length === 8 + promoted.length, "R7 Canonical count must be 8 plus promotion count");
requireCondition([...retainedIds].every((id) => canonicalIds.includes(id)), "R7 must retain MATH-INT-001..008");
requireCondition(new Set(canonicalIds).size === canonicalIds.length, "R7 Canonical IDs must be unique");
requireCondition(activeIndex?.interactions?.length === interactions.length && activeIndex.interactions.map((interaction) => interaction.id).sort().join(",") === canonicalIds.slice().sort().join(","), "R7 active AI index must match the active Canonical registry");
requireCondition(repositories.length === 6 + newRepositoryNames.size, "R7 repository count must equal six baseline repositories plus actual new formalized repositories");
requireCondition(features.length === 10 + formalizedNewFeatureIds.size, "R7 feature count must equal ten baseline features plus actual new formalized features");
requireCondition(runtime?.version === 1 && mappings.length === interactions.length, "R7 runtime map must contain one mapping per Canonical");
requireCondition((runtimeCounts.implemented || 0) === 3 && (runtimeCounts.planned || 0) === 5 + promoted.length && (runtimeCounts["blocked-evidence"] || 0) === 0, "R7 runtime must be 3 implemented / 5 plus promotions planned / 0 blocked");
requireCondition(mappings.filter((mapping) => promotedIds.has(mapping.interactionId)).every((mapping) => mapping.status === "planned" && !mapping.engine && !mapping.mode && !mapping.implementationStyle), "R7 promoted Canonicals must remain planned without runtime-only metadata");
requireCondition([...promotedIds].every((id) => canonicalIds.includes(id) && /^MATH-INT-(009|010|011)$/.test(id)), "R7 promoted IDs must be MATH-INT-009..011");
requireCondition(promoted.map((decision) => decision.promotedInteractionId).every((id, index) => id === `MATH-INT-${String(9 + index).padStart(3, "0")}`), "R7 promoted IDs must be contiguous");
requireCondition((coverage?.candidates || []).length === 89 && new Set((coverage?.candidates || []).map((record) => record.candidateId)).size === 89, "R7 Candidate Map must contain 89 unique records");
requireCondition((coverage?.candidates || []).every((record) => (record.matches || []).every((match) => canonicalIds.includes(match.interactionId))), "R7 Candidate Map must reference valid Canonical IDs only");
requireCondition(coverageCounts.covered + coverageCounts.partial + coverageCounts.gap === 89, "R7 coverage must total 89");
requireCondition(delta?.current?.covered === coverageCounts.covered && delta?.current?.partial === coverageCounts.partial && delta?.current?.gap === coverageCounts.gap, "R7 coverage delta must match current coverage");
requireCondition(registrySource.includes("functionGraph") && ["rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"].every((engine) => registrySource.includes(engine)), "R7 must retain the existing 11-engine registry");
requireCondition(!JSON.stringify({ library, activeIndex, external, runtime, coverage, plan, evidence }).includes("adapted-from"), "R7 metadata must not use adapted-from");

if (errors.length) {
  console.error("R7 scope: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`R7 scope: PASS (Canonical ${interactions.length}; promotions ${promoted.length}; repositories ${repositories.length}; features ${features.length}; runtime 3 / ${5 + promoted.length} / 0; coverage ${coverageCounts.covered} / ${coverageCounts.partial} / ${coverageCounts.gap})`);
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const readJson = (relativePath) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); }
  catch (error) { errors.push(`${relativePath} is not valid JSON: ${error.message}`); return null; }
};
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const library = readJson("data/interactions.json");
const runtime = readJson("data/interaction-runtime-map.json");
const external = readJson("research/external-repositories.json");
const interactions = Array.isArray(library?.interactions) ? library.interactions : [];
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const featureRepository = new Map((external?.repositories || []).flatMap((repository) => (repository.features || []).map((feature) => [feature.id, repository.repository])));
const ids = interactions.map((interaction) => interaction.id);
const mappingIds = mappings.map((mapping) => mapping.interactionId);
const implementedIds = new Set(["MATH-INT-001", "MATH-INT-002", "MATH-INT-003", "MATH-INT-009"]);
const engines = new Set(["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"]);

requireCondition(runtime?.version === 1, "runtime mapping version must be 1");
requireCondition(interactions.length >= 8, "runtime mapping expects the retained canonical interactions");
requireCondition(mappings.length === interactions.length, "runtime mapping must contain exactly one record per canonical interaction");
requireCondition(new Set(mappingIds).size === mappingIds.length, "runtime mapping contains duplicate interaction IDs");
requireCondition(JSON.stringify([...new Set(mappingIds)].sort()) === JSON.stringify([...new Set(ids)].sort()), "runtime mapping IDs must exactly match canonical interaction IDs");
mappings.forEach((mapping) => {
  requireCondition(implementedIds.has(mapping.interactionId) ? mapping.status === "implemented" : mapping.status === "planned", `${mapping.interactionId} has unexpected runtime status`);
  requireCondition(Array.isArray(mapping.sourceFeatureIds) && mapping.sourceFeatureIds.length >= 1, `${mapping.interactionId} needs sourceFeatureIds`);
  mapping.sourceFeatureIds?.forEach((featureId) => requireCondition(featureRepository.has(featureId), `${mapping.interactionId} references unknown source feature ${featureId}`));
  if (mapping.status === "implemented") {
    requireCondition(engines.has(mapping.engine), `${mapping.interactionId} must use an existing Engine`);
    requireCondition(typeof mapping.mode === "string" && mapping.mode.trim() !== "", `${mapping.interactionId} needs a runtime mode`);
    requireCondition(mapping.implementationStyle === "clean-room-reimplementation", `${mapping.interactionId} must be a clean-room reimplementation`);
    const isR4Pilot = ["MATH-INT-001", "MATH-INT-002", "MATH-INT-003"].includes(mapping.interactionId);
    const expectedSources = mapping.interactionId === "MATH-INT-009" ? ["REPO-001-F003", "REPO-007-F001"] : null;
    requireCondition(isR4Pilot ? mapping.sourceFeatureIds.every((featureId) => featureRepository.get(featureId) === "phetsims/graphing-quadratics") : JSON.stringify(mapping.sourceFeatureIds) === JSON.stringify(expectedSources), `${mapping.interactionId} pilot source features are invalid`);
  } else {
    requireCondition(!mapping.engine && !mapping.mode && !mapping.implementationStyle, `${mapping.interactionId} planned mapping must not mount a runtime demo or carry implementation-only metadata`);
  }
});

if (errors.length) { console.error("Interaction runtime map: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else {
  const counts = mappings.reduce((result, mapping) => { result[mapping.status] = (result[mapping.status] || 0) + 1; return result; }, {});
  console.log(`Interaction runtime map: PASS (${mappings.length} mappings; implemented ${counts.implemented || 0}; planned ${counts.planned || 0}; blocked-evidence ${counts["blocked-evidence"] || 0}; existing engines only)`);
}

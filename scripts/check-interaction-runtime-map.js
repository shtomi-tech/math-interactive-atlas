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
const expectedStatuses = new Map([
  ["MATH-INT-001", "implemented"], ["MATH-INT-002", "implemented"], ["MATH-INT-003", "implemented"],
  ["MATH-INT-004", "planned"], ["MATH-INT-005", "planned"], ["MATH-INT-006", "planned"],
  ["MATH-INT-007", "blocked-evidence"], ["MATH-INT-008", "blocked-evidence"]
]);
const engines = new Set(["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"]);

requireCondition(runtime?.version === 1, "runtime mapping version must be 1");
requireCondition(interactions.length === 8, "runtime mapping expects exactly 8 canonical interactions");
requireCondition(mappings.length === interactions.length, "runtime mapping must contain exactly one record per canonical interaction");
requireCondition(new Set(mappingIds).size === mappingIds.length, "runtime mapping contains duplicate interaction IDs");
requireCondition(JSON.stringify([...new Set(mappingIds)].sort()) === JSON.stringify([...new Set(ids)].sort()), "runtime mapping IDs must exactly match canonical interaction IDs");
mappings.forEach((mapping) => {
  requireCondition(expectedStatuses.get(mapping.interactionId) === mapping.status, `${mapping.interactionId} has unexpected runtime status`);
  requireCondition(Array.isArray(mapping.sourceFeatureIds) && mapping.sourceFeatureIds.length >= 1, `${mapping.interactionId} needs sourceFeatureIds`);
  mapping.sourceFeatureIds?.forEach((featureId) => requireCondition(featureRepository.has(featureId), `${mapping.interactionId} references unknown source feature ${featureId}`));
  if (mapping.status === "implemented") {
    requireCondition(engines.has(mapping.engine), `${mapping.interactionId} must use an existing Engine`);
    requireCondition(typeof mapping.mode === "string" && mapping.mode.trim() !== "", `${mapping.interactionId} needs a runtime mode`);
    requireCondition(mapping.implementationStyle === "clean-room-reimplementation", `${mapping.interactionId} must be a clean-room reimplementation`);
    requireCondition(mapping.sourceFeatureIds.every((featureId) => featureRepository.get(featureId) === "phetsims/graphing-quadratics"), `${mapping.interactionId} pilot source must be REPO-001`);
  } else {
    requireCondition(!mapping.engine && !mapping.mode, `${mapping.interactionId} non-implemented mapping must not mount a runtime demo`);
  }
});

if (errors.length) { console.error("Interaction runtime map: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else console.log("Interaction runtime map: PASS (8 mappings; implemented 3; planned 3; blocked-evidence 2; existing engines only)");

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
const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const interactions = new Map((library?.interactions || []).map((interaction) => [interaction.id, interaction]));
const repositories = new Map((external?.repositories || []).map((repository) => [repository.id, repository]));
const features = new Map((external?.repositories || []).flatMap((repository) => (repository.features || []).map((feature) => [feature.id, { feature, repository }])));
const mappings = new Map((runtime?.mappings || []).map((mapping) => [mapping.interactionId, mapping]));
const expected = {
  "MATH-INT-007": { featureIds: ["REPO-003-F001", "REPO-005-F001"], repositories: ["REPO-003", "REPO-005"] },
  "MATH-INT-008": { featureIds: ["REPO-004-F001", "REPO-006-F001"], repositories: ["REPO-004", "REPO-006"] }
};

for (const [interactionId, requirement] of Object.entries(expected)) {
  const interaction = interactions.get(interactionId);
  const mapping = mappings.get(interactionId);
  requireCondition(interaction, `${interactionId} must exist in canonical metadata`);
  requireCondition(mapping?.status === "planned", `${interactionId} runtime status must be planned after evidence completion`);
  requireCondition(Array.isArray(mapping?.sourceFeatureIds) && new Set(mapping.sourceFeatureIds).size === mapping.sourceFeatureIds.length, `${interactionId} runtime sourceFeatureIds must be unique`);
  requireCondition(requirement.featureIds.every((featureId) => mapping?.sourceFeatureIds?.includes(featureId)), `${interactionId} runtime mapping must reference ${requirement.featureIds.join(" + ")}`);
  requireCondition(new Set((interaction?.sources || []).map((source) => source.featureId)).size >= 2, `${interactionId} must have at least two repository source features`);
  requireCondition(requirement.featureIds.every((featureId) => (interaction?.sources || []).some((source) => source.featureId === featureId && source.relation === "inspired-by")), `${interactionId} metadata must cite both evidence features with inspired-by`);
  requireCondition(requirement.repositories.every((repositoryId) => repositories.has(repositoryId)), `${interactionId} must cite the expected repositories`);
  for (const featureId of requirement.featureIds) {
    const record = features.get(featureId);
    requireCondition(record, `${interactionId} references missing feature ${featureId}`);
    if (!record) continue;
    const { feature, repository } = record;
    requireCondition(repository.license?.reviewed === true, `${featureId} repository license must be reviewed`);
    requireCondition(typeof repository.license?.expression === "string" && repository.license.expression.trim() !== "", `${featureId} repository license must be present`);
    requireCondition(typeof repository.ref === "string" && /^[0-9a-f]{40}$/i.test(repository.ref), `${featureId} repository ref must be a fixed SHA`);
    requireCondition(Array.isArray(feature.paths) && feature.paths.length >= 1, `${featureId} must list source paths`);
    requireCondition(Array.isArray(feature.evidenceUrls) && feature.evidenceUrls.length >= 1, `${featureId} must list evidence URLs`);
    requireCondition(feature.evidenceUrls.every((url) => url.includes(`/blob/${repository.ref}/`) && !/\/blob\/(main|master)\//.test(url)), `${featureId} evidence URLs must use the fixed SHA`);
    for (const field of ["behaviorSummary", "learnerActions", "changes", "feedback"]) {
      const value = feature[field];
      requireCondition((typeof value === "string" && value.trim() !== "") || (Array.isArray(value) && value.length > 0), `${featureId} ${field} must describe the observed behavior`);
    }
  }
}

requireCondition(!JSON.stringify({ library, external, runtime }).includes("adapted-from"), "evidence metadata must not use adapted-from");

if (errors.length) {
  console.error("Evidence readiness: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Evidence readiness: PASS (MATH-INT-007 and MATH-INT-008 each have two fixed-source repositories and planned runtime status)");
}

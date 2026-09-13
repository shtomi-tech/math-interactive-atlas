import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const categories = new Set(["Build", "Move", "Select", "Transform", "Visualize", "Compare", "Simulate", "Generate", "Measure", "Construct"]);
const arrayFields = ["learnerActions", "changes", "feedbackCapabilities", "capabilities", "learningPatterns", "bestFor", "notBestFor", "supports"];
const scalarFields = ["id", "title", "category", "description", "learningGoal", "implementationDifficulty", "reusability", "reusePolicy", "implementationStatus"];

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const interactions = Array.isArray(library?.interactions) ? library.interactions : [];
const repositories = Array.isArray(external?.repositories) ? external.repositories : [];
const features = new Map(repositories.flatMap((repository) => (Array.isArray(repository.features) ? repository.features : []).map((feature) => [feature.id, { repository: repository.repository, ref: repository.ref }])));
const ids = new Set();
const interactionRepositories = new Set();
const interactionCategories = new Set();

requireCondition(library?.version === 1, "interaction library version must be 1");
requireCondition(Array.isArray(library?.interactions), "interaction library interactions must be an array");
requireCondition(interactions.length >= 8, "interaction library must contain at least 8 canonical interactions");
requireCondition(features.size > 0, "interaction library needs external feature registry data");

interactions.forEach((interaction, index) => {
  const label = `interaction ${index}`;
  requireCondition(interaction && typeof interaction === "object" && !Array.isArray(interaction), `${label} must be an object`);
  if (!interaction || typeof interaction !== "object" || Array.isArray(interaction)) return;
  requireCondition(typeof interaction.id === "string" && /^MATH-INT-\d{3}$/.test(interaction.id), `${label} id must match MATH-INT-###`);
  requireCondition(!ids.has(interaction.id), `duplicate interaction id: ${interaction.id}`);
  ids.add(interaction.id);
  scalarFields.slice(1).forEach((field) => requireCondition(typeof interaction[field] === "string" && interaction[field].trim() !== "", `${interaction.id} ${field} is required`));
  requireCondition(categories.has(interaction.category), `${interaction.id} has unsupported category: ${interaction.category}`);
  interactionCategories.add(interaction.category);
  arrayFields.forEach((field) => requireCondition(Array.isArray(interaction[field]) && interaction[field].length >= 1 && interaction[field].every((value) => typeof value === "string" && value.trim() !== ""), `${interaction.id} ${field} must contain non-empty strings`));
  requireCondition(interaction.implementationStatus === "research-only", `${interaction.id} must remain research-only in R3`);
  requireCondition(!Object.prototype.hasOwnProperty.call(interaction, "contentId"), `${interaction.id} must not depend on contentId`);
  requireCondition(Array.isArray(interaction.sources) && interaction.sources.length >= 1, `${interaction.id} needs at least one source`);
  const sourceFeatures = new Set();
  (Array.isArray(interaction.sources) ? interaction.sources : []).forEach((source, sourceIndex) => {
    const sourceLabel = `${interaction.id} source ${sourceIndex}`;
    requireCondition(source && typeof source === "object" && !Array.isArray(source), `${sourceLabel} must be an object`);
    if (!source || typeof source !== "object" || Array.isArray(source)) return;
    requireCondition(typeof source.featureId === "string" && features.has(source.featureId), `${sourceLabel} must reference an external feature`);
    requireCondition(!sourceFeatures.has(source.featureId), `${interaction.id} repeats feature ${source.featureId}`);
    sourceFeatures.add(source.featureId);
    requireCondition(source.relation === "inspired-by", `${sourceLabel} must use inspired-by in R3`);
    requireCondition(typeof source.aspect === "string" && source.aspect.trim() !== "", `${sourceLabel} aspect is required`);
    requireCondition(typeof source.evidence === "string" && source.evidence.trim() !== "", `${sourceLabel} evidence is required`);
    if (features.has(source.featureId)) interactionRepositories.add(features.get(source.featureId).repository);
  });
});

requireCondition(interactionCategories.size >= 4, `interaction library must cover at least 4 categories (got ${interactionCategories.size})`);
requireCondition(interactionRepositories.size >= 3, `interaction library must use at least 3 external repositories (got ${interactionRepositories.size})`);

if (errors.length > 0) {
  console.error("Interaction library: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Interaction library: PASS (${interactions.length} canonical interactions; ${interactionRepositories.size} repositories; ${interactionCategories.size} categories; research-only)`);
}

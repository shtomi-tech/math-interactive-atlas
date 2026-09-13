import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "dist/ai/interactions.json");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

export function buildIndex(library, external, runtimeMap = { mappings: [] }) {
  const featureMap = new Map((external.repositories || []).flatMap((repository) => (repository.features || []).map((feature) => [feature.id, {
    repository: repository.repository,
    ref: repository.ref,
    license: repository.license.expression,
    paths: feature.paths
  }])));
  const runtimeById = new Map((runtimeMap.mappings || []).map((mapping) => [mapping.interactionId, mapping]));

  return {
    version: 1,
    interactions: (library.interactions || []).map((interaction) => ({
      id: interaction.id,
      title: interaction.title,
      category: interaction.category,
      description: interaction.description,
      learningGoal: interaction.learningGoal,
      learnerActions: interaction.learnerActions,
      changes: interaction.changes,
      feedbackCapabilities: interaction.feedbackCapabilities,
      capabilities: interaction.capabilities,
      learningPatterns: interaction.learningPatterns,
      bestFor: interaction.bestFor,
      notBestFor: interaction.notBestFor,
      supports: interaction.supports,
      implementationDifficulty: interaction.implementationDifficulty,
      reusability: interaction.reusability,
      reusePolicy: interaction.reusePolicy,
      runtime: (() => {
        const mapping = runtimeById.get(interaction.id);
        if (!mapping) throw new Error(`missing runtime mapping: ${interaction.id}`);
        return {
          status: mapping.status,
          ...(mapping.engine ? { engine: mapping.engine } : {}),
          ...(mapping.mode ? { mode: mapping.mode } : {})
        };
      })(),
      sources: (interaction.sources || []).map((source) => {
        const feature = featureMap.get(source.featureId);
        if (!feature) throw new Error(`unknown featureId: ${source.featureId}`);
        return {
          repository: feature.repository,
          ref: feature.ref,
          featureId: source.featureId,
          featurePath: feature.paths[0],
          relation: source.relation,
          aspect: source.aspect,
          evidence: source.evidence,
          license: feature.license
        };
      })
    }))
  };
}

function serializedIndex() {
  return `${JSON.stringify(buildIndex(readJson("data/interactions.json"), readJson("research/external-repositories.json"), readJson("data/interaction-runtime-map.json")), null, 2)}\n`;
}

function main() {
  const expected = serializedIndex();
  if (process.argv.includes("--check")) {
    let actual = "";
    try {
      actual = fs.readFileSync(outputPath, "utf8");
    } catch (error) {
      console.error(`Interaction index: FAILED (${error.message})`);
      process.exitCode = 1;
      return;
    }
    if (actual !== expected) {
      console.error("Interaction index: FAILED (generated output is stale; run node scripts/build-interaction-index.js)");
      process.exitCode = 1;
      return;
    }
    console.log("Interaction index: PASS (generated output is current)");
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, expected);
  console.log("Interaction index: BUILT (dist/ai/interactions.json)");
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) main();

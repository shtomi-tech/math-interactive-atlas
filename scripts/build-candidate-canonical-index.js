import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "dist/ai/candidate-canonical-coverage.json");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

export function buildIndex(contents, library, coverage) {
  const contentById = new Map((contents || []).map((content) => [content.id, content]));
  const interactionById = new Map((library.interactions || []).map((interaction) => [interaction.id, interaction]));
  return {
    version: 1,
    candidates: (coverage.candidates || []).map((record) => {
      const content = contentById.get(record.candidateId);
      if (!content) throw new Error(`missing candidate content: ${record.candidateId}`);
      return {
        candidateId: record.candidateId,
        subject: content.subject,
        unit: content.unit,
        title: content.title,
        coverageStatus: record.coverageStatus,
        matches: (record.matches || []).map((match) => {
          const interaction = interactionById.get(match.interactionId);
          if (!interaction) throw new Error(`missing canonical interaction: ${match.interactionId}`);
          return {
            interactionId: match.interactionId,
            interactionTitle: interaction.title,
            relation: match.relation,
            confidence: match.confidence,
            rationale: match.rationale
          };
        }),
        recommendedAction: record.recommendedAction
      };
    })
  };
}

function serializedIndex() {
  return `${JSON.stringify(buildIndex(readJson("static/atlas/content-data.json"), readJson("data/interactions.json"), readJson("data/candidate-canonical-map.json")), null, 2)}\n`;
}

function main() {
  const expected = serializedIndex();
  if (process.argv.includes("--check")) {
    let actual = "";
    try { actual = fs.readFileSync(outputPath, "utf8"); }
    catch (error) {
      console.error(`Candidate-canonical index: FAILED (${error.message})`);
      process.exitCode = 1;
      return;
    }
    if (actual !== expected) {
      console.error("Candidate-canonical index: FAILED (generated output is stale; run node scripts/build-candidate-canonical-index.js)");
      process.exitCode = 1;
      return;
    }
    console.log("Candidate-canonical index: PASS (generated output is current)");
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, expected);
  console.log("Candidate-canonical index: BUILT (dist/ai/candidate-canonical-coverage.json)");
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) main();

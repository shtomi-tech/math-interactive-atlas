import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "dist/ai/canonical-promotion-decisions.json");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const plan = readJson("research/canonical-promotion-plan.json");
const evidence = readJson("research/canonical-promotion-evidence.json");
const delta = readJson("research/r7-coverage-delta.json");
const library = readJson("data/interactions.json");
const runtime = readJson("data/interaction-runtime-map.json");
const evidenceByProposal = new Map((evidence.promotions || []).map((promotion) => [promotion.proposalId, promotion]));
const runtimeById = new Map((runtime.mappings || []).map((mapping) => [mapping.interactionId, mapping]));
const promotions = (plan.decisions || []).filter((decision) => decision.decision === "promote");
const holds = (plan.decisions || []).filter((decision) => decision.decision === "hold");
const index = {
  version: 1,
  baselineCommit: plan.baselineCommit,
  promotionCount: promotions.length,
  promotedProposalIds: promotions.map((decision) => decision.proposalId),
  newInteractionIds: promotions.map((decision) => decision.promotedInteractionId),
  promotions: promotions.map((decision) => {
    const promotionEvidence = evidenceByProposal.get(decision.proposalId);
    return {
      proposalId: decision.proposalId,
      interactionId: decision.promotedInteractionId,
      selectionRationale: decision.selectionRationale,
      overrideRationale: decision.overrideRationale,
      evidenceSourceCount: promotionEvidence?.sources?.length || 0,
      evidence: (promotionEvidence?.sources || []).map((source) => ({
        repository: source.repository,
        sha: source.ref,
        license: source.license.expression,
        sourceCount: source.sourcePaths.length
      })),
      runtimeStatus: runtimeById.get(decision.promotedInteractionId)?.status || null
    };
  }),
  holdDecisions: holds.map((decision) => ({
    proposalId: decision.proposalId,
    reason: decision.holdRationale,
    overrideRationale: decision.overrideRationale
  })),
  coverage: {
    before: delta.baseline,
    after: delta.current,
    transitions: delta.transitions
  },
  activeCanonicalCount: library.interactions.length
};
const serialized = `${JSON.stringify(index, null, 2)}\n`;

if (process.argv.includes("--check")) {
  let actual = "";
  try { actual = fs.readFileSync(outputPath, "utf8"); }
  catch (error) { console.error(`Canonical promotion index: FAILED (${error.message})`); process.exitCode = 1; }
  if (actual && actual !== serialized) {
    console.error("Canonical promotion index: FAILED (generated output is stale; run node scripts/build-canonical-promotion-index.js)");
    process.exitCode = 1;
  } else if (actual) console.log("Canonical promotion index: PASS (generated output is current)");
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized);
  console.log("Canonical promotion index: BUILT (dist/ai/canonical-promotion-decisions.json)");
}

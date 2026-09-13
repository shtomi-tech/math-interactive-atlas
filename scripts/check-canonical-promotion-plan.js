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
const nonEmpty = (value) => typeof value === "string" && value.trim() !== "";
const plan = readJson("research/canonical-promotion-plan.json");
const candidates = readJson("research/canonical-interaction-candidates.json");
const shortlistIds = (candidates?.candidates || []).filter((candidate) => candidate.shortlisted).map((candidate) => candidate.proposalId).sort();
const decisions = Array.isArray(plan?.decisions) ? plan.decisions : [];
const decisionIds = decisions.map((decision) => decision?.proposalId);
const validFits = new Set(["high", "medium", "low", "none"]);
const validDecisions = new Set(["promote", "hold"]);

requireCondition(plan?.version === 1, "promotion plan version must be 1");
requireCondition(plan?.baselineCommit === "e3f20563c9ff7d5251337659ec37ea8d2d76bfc9", "promotion plan baseline must be the R6 commit");
requireCondition(shortlistIds.length === 4 && shortlistIds.join(",") === ["CAN-CAND-001", "CAN-CAND-002", "CAN-CAND-003", "CAN-CAND-004"].join(","), "promotion plan must target the four R6 shortlist proposals");
requireCondition(decisions.length === shortlistIds.length, "promotion plan must contain one decision per shortlist proposal");
requireCondition(new Set(decisionIds).size === decisionIds.length, "promotion plan proposal decisions must be unique");
requireCondition(decisionIds.slice().sort().join(",") === shortlistIds.join(","), "promotion plan decisions must equal the R6 shortlist exactly once");

decisions.forEach((decision, index) => {
  const label = `decision ${index} ${decision?.proposalId || "(missing proposal)"}`;
  requireCondition(shortlistIds.includes(decision?.proposalId), `${label} must reference a shortlisted proposal`);
  requireCondition(validDecisions.has(decision?.decision), `${label} decision must be promote or hold`);
  const rank = decision?.rankSnapshot;
  requireCondition(Number.isInteger(rank?.primaryGapImpact) && rank.primaryGapImpact > 0, `${label} rankSnapshot primaryGapImpact is required`);
  requireCondition(Number.isInteger(rank?.affectedSubjectCount) && rank.affectedSubjectCount > 0, `${label} rankSnapshot affectedSubjectCount is required`);
  requireCondition(Number.isInteger(rank?.affectedUnitCount) && rank.affectedUnitCount > 0, `${label} rankSnapshot affectedUnitCount is required`);
  requireCondition(validFits.has(rank?.engineFit), `${label} rankSnapshot engineFit is invalid`);
  if (decision?.decision === "promote") {
    requireCondition(/^MATH-INT-(009|010|011)$/.test(decision.promotedInteractionId || ""), `${label} promotedInteractionId must be MATH-INT-009..011`);
    requireCondition(nonEmpty(decision.selectionRationale), `${label} promote requires selectionRationale`);
    requireCondition(decision.gates?.shortlisted === true, `${label} promote must pass shortlisted gate`);
    requireCondition(decision.gates?.behaviorCoherent === true, `${label} promote must pass behaviorCoherent gate`);
    requireCondition(decision.gates?.splitRiskResolved === true, `${label} promote must pass splitRiskResolved gate`);
    requireCondition(decision.gates?.qualifiedRepositoryCount >= 2, `${label} promote must record at least two qualified repositories`);
    requireCondition(decision.gates?.licenseReviewed === true && decision.gates?.fixedShaVerified === true, `${label} promote must pass license and fixed SHA gates`);
  } else {
    requireCondition(!decision.promotedInteractionId, `${label} hold must not reserve a MATH-INT ID`);
    requireCondition(nonEmpty(decision.holdRationale), `${label} hold requires holdRationale`);
  }
  requireCondition(decision.overrideRationale === null || nonEmpty(decision.overrideRationale), `${label} overrideRationale must be null or non-empty`);
});

const promoted = decisions.filter((decision) => decision.decision === "promote");
requireCondition(promoted.length <= 3, `promotion count must be at most 3 (got ${promoted.length})`);
const promotedIds = promoted.map((decision) => decision.promotedInteractionId);
requireCondition(new Set(promotedIds).size === promotedIds.length, "promotedInteractionId must be unique");
requireCondition(promotedIds.every((id, index) => id === `MATH-INT-${String(9 + index).padStart(3, "0")}`), "new MATH-INT IDs must be contiguous from MATH-INT-009 in decision order");

const ranked = decisions.slice().sort((left, right) => {
  const a = left.rankSnapshot;
  const b = right.rankSnapshot;
  const fitRank = { high: 3, medium: 2, low: 1, none: 0 };
  return (b.primaryGapImpact - a.primaryGapImpact)
    || (b.affectedSubjectCount - a.affectedSubjectCount)
    || (b.affectedUnitCount - a.affectedUnitCount)
    || (fitRank[b.engineFit] - fitRank[a.engineFit])
    || left.proposalId.localeCompare(right.proposalId);
});
const gatePass = (decision) => decision.gates?.shortlisted === true
  && decision.gates?.behaviorCoherent === true
  && decision.gates?.splitRiskResolved === true
  && decision.gates?.qualifiedRepositoryCount >= 2
  && decision.gates?.licenseReviewed === true
  && decision.gates?.fixedShaVerified === true;
ranked.forEach((higher, index) => {
  if (!gatePass(higher) || higher.decision !== "hold") return;
  ranked.slice(index + 1).filter((lower) => lower.decision === "promote").forEach((lower) => {
    requireCondition(nonEmpty(lower.overrideRationale), `${lower.proposalId} must explain a lower-ranked promotion override`);
  });
});

if (errors.length) {
  console.error("Canonical promotion plan: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Canonical promotion plan: PASS (${decisions.length} shortlist decisions; promotions ${promoted.length}; contiguous IDs)`);
}

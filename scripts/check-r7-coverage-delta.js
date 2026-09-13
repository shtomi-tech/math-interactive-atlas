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
const delta = readJson("research/r7-coverage-delta.json");
const map = readJson("data/candidate-canonical-map.json");
const analysis = readJson("research/gap-behavior-analysis.json");
const plan = readJson("research/canonical-promotion-plan.json");
const records = Array.isArray(map?.candidates) ? map.candidates : [];
const transitions = Array.isArray(delta?.transitions) ? delta.transitions : [];
const transitionById = new Map(transitions.map((transition) => [transition.candidateId, transition]));
const r6GapIds = new Set((analysis?.gaps || []).map((gap) => gap.candidateId));
const currentCounts = records.reduce((counts, record) => { counts[record.coverageStatus] = (counts[record.coverageStatus] || 0) + 1; return counts; }, { covered: 0, partial: 0, gap: 0 });
const baselineStatuses = new Map(records.map((record) => [record.candidateId, transitionById.get(record.candidateId)?.from || record.coverageStatus]));
const baselineCounts = [...baselineStatuses.values()].reduce((counts, status) => { counts[status] = (counts[status] || 0) + 1; return counts; }, { covered: 0, partial: 0, gap: 0 });
const allowedTransitions = new Set(["gap->partial", "gap->covered", "partial->covered"]);

requireCondition(delta?.version === 1, "R7 coverage delta version must be 1");
requireCondition(delta?.baseline?.covered === 9 && delta?.baseline?.partial === 24 && delta?.baseline?.gap === 56, "R7 coverage baseline must be 9 / 24 / 56");
requireCondition(records.length === 89, "R7 coverage delta requires 89 candidate records");
requireCondition(delta?.current?.covered === currentCounts.covered && delta?.current?.partial === currentCounts.partial && delta?.current?.gap === currentCounts.gap, "R7 coverage current counts must match the candidate map");
requireCondition(currentCounts.covered + currentCounts.partial + currentCounts.gap === 89, "R7 coverage counts must total 89");
requireCondition(baselineCounts.covered === 9 && baselineCounts.partial === 24 && baselineCounts.gap === 56, "R7 transitions must reconstruct the R6 baseline counts");
requireCondition(new Set(transitions.map((transition) => transition.candidateId)).size === transitions.length, "R7 transition candidate IDs must be unique");
requireCondition(transitions.length === 9, "R7 coverage delta must record each implemented transition exactly once");

transitions.forEach((transition, index) => {
  const label = `transition ${index} ${transition?.candidateId || "(missing candidate)"}`;
  const record = records.find((candidate) => candidate.candidateId === transition?.candidateId);
  requireCondition(record, `${label} candidate must exist in the map`);
  requireCondition(r6GapIds.has(transition?.candidateId), `${label} must start from an R6 gap`);
  requireCondition(transition?.from === "gap", `${label} must start from gap`);
  requireCondition(record?.coverageStatus === transition?.to, `${label} to status must match the current map`);
  requireCondition(allowedTransitions.has(`${transition?.from}->${transition?.to}`), `${label} uses a forbidden coverage transition`);
  requireCondition(record?.matches?.some((match) => match.interactionId === transition?.interactionId), `${label} interaction ID must match an actual map match`);
  if (transition?.to === "covered") requireCondition(record?.matches?.some((match) => match.interactionId === transition?.interactionId && match.relation === "direct"), `${label} covered transition requires a direct match`);
  requireCondition(typeof transition?.rationale === "string" && transition.rationale.trim() !== "", `${label} rationale is required`);
});

const baselineCoveredIds = new Set(records.filter((record) => baselineStatuses.get(record.candidateId) === "covered").map((record) => record.candidateId));
requireCondition([...baselineCoveredIds].every((candidateId) => records.find((record) => record.candidateId === candidateId)?.coverageStatus === "covered"), "existing covered candidates must not regress");
const promotionCount = (plan?.decisions || []).filter((decision) => decision.decision === "promote").length;
if (promotionCount > 0) requireCondition(currentCounts.gap < 56, "a promotion must reduce the coverage gap count");

if (errors.length) {
  console.error("R7 coverage delta: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`R7 coverage delta: PASS (before 9 / 24 / 56; after ${currentCounts.covered} / ${currentCounts.partial} / ${currentCounts.gap}; transitions ${transitions.length})`);
}

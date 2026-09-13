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
const nonEmpty = (value) => typeof value === "string" ? value.trim() !== "" : Array.isArray(value) ? value.length > 0 && value.every((item) => String(item).trim() !== "") : Boolean(value);
const expectedGapIds = [
  "unit-circle", "triangle-area-sine", "sine-law-circumcircle", "cosine-law", "triangle-centers", "angle-bisector-ratio", "inscribed-angle", "power-of-point", "right-triangle-trig", "trig-relations", "radian-measure", "trig-addition-formula", "double-angle", "section-formula", "line-relations", "circle-line-intersections",
  "hypothesis-test-coin", "independent-trials", "population-sample", "random-variable-distribution", "distribution-mean-variance", "binomial-distribution-b", "standard-normalization", "sampling-distribution-mean", "confidence-interval", "normal-hypothesis-test",
  "factorization-reverse", "euclidean-algorithm", "polynomial-division", "rational-expression-domain", "complex-arithmetic", "roots-coefficients", "factor-theorem", "identity-coefficients",
  "arithmetic-sequence", "geometric-sequence", "sequence-partial-sum", "recurrence-iteration", "sigma-notation", "difference-sequence", "mathematical-induction",
  "set-regions", "necessary-sufficient", "event-regions", "conditional-probability", "sample-space-grid", "inequality-numberline", "inequality-region-2d",
  "mean-median-outlier", "variance-distance", "boxplot-drag", "correlation-builder",
  "sqrt-numberline", "absolute-distance", "exponent-extension", "modeling-cycle"
];
const expectedSet = new Set(expectedGapIds);
const validEngines = new Set(["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"]);
const validFits = new Set(["high", "medium", "low", "none"]);
const analysis = readJson("research/gap-behavior-analysis.json");
const map = readJson("data/candidate-canonical-map.json");
const gaps = Array.isArray(analysis?.gaps) ? analysis.gaps : [];
const clusters = Array.isArray(analysis?.clusters) ? analysis.clusters : [];
const mapGaps = (map?.candidates || []).filter((candidate) => candidate.coverageStatus === "gap").map((candidate) => candidate.candidateId);

requireCondition(analysis?.version === 1, "gap behavior analysis version must be 1");
requireCondition(analysis?.baseline?.commit === "a129d96b2ede407a0a389631ae8c178b64e980f3", "gap behavior baseline commit must be a129d96b2ede407a0a389631ae8c178b64e980f3");
requireCondition(analysis?.baseline?.coverage?.covered === 9 && analysis?.baseline?.coverage?.partial === 24 && analysis?.baseline?.coverage?.gap === 56, "gap behavior baseline coverage must be 9 / 24 / 56");
requireCondition(gaps.length === 56, `gap behavior analysis must contain 56 records (got ${gaps.length})`);
requireCondition([...new Set(mapGaps)].sort().join("\n") === expectedGapIds.slice().sort().join("\n"), "R5 map gap IDs must equal the fixed 56 gap IDs");
requireCondition([...new Set(gaps.map((gap) => gap?.candidateId))].sort().join("\n") === expectedGapIds.slice().sort().join("\n"), "gap records must equal the fixed 56 gap IDs exactly once");

gaps.forEach((gap, index) => {
  const label = `gap ${index} ${gap?.candidateId || "(missing id)"}`;
  requireCondition(expectedSet.has(gap?.candidateId), `${label} is not a fixed R5 gap`);
  requireCondition(typeof gap?.primaryClusterId === "string" && gap.primaryClusterId.trim() !== "", `${label} primaryClusterId is required`);
  const signature = gap?.behaviorSignature;
  requireCondition(signature && typeof signature === "object" && !Array.isArray(signature), `${label} behaviorSignature is required`);
  ["learnerAction", "manipulatedObject", "stateChanges", "feedback"].forEach((field) => requireCondition(nonEmpty(signature?.[field]), `${label} behaviorSignature.${field} is required`));
  requireCondition(signature && (signature.constraints === undefined || nonEmpty(signature.constraints) || Array.isArray(signature.constraints)), `${label} behaviorSignature.constraints must be a string or array`);
  requireCondition(nonEmpty(gap?.gapRationale), `${label} gapRationale is required`);
  requireCondition(Array.isArray(gap?.engineFitHypotheses) && gap.engineFitHypotheses.length > 0, `${label} engineFitHypotheses must be non-empty`);
  (gap?.engineFitHypotheses || []).forEach((hypothesis, hypothesisIndex) => {
    requireCondition(validEngines.has(hypothesis?.engine), `${label} engine hypothesis ${hypothesisIndex} has an invalid engine`);
    requireCondition(validFits.has(hypothesis?.fit), `${label} engine hypothesis ${hypothesisIndex} has an invalid fit`);
    requireCondition(nonEmpty(hypothesis?.rationale), `${label} engine hypothesis ${hypothesisIndex} rationale is required`);
  });
});

const clusterIds = new Set(clusters.map((cluster) => cluster?.id));
const memberIds = [];
clusters.forEach((cluster, index) => {
  const label = `cluster ${index} ${cluster?.id || "(missing id)"}`;
  requireCondition(/^GAP-CL-\d{3}$/.test(cluster?.id || ""), `${label} has an invalid id`);
  requireCondition(nonEmpty(cluster?.title), `${label} title is required`);
  requireCondition(Array.isArray(cluster?.memberCandidateIds) && cluster.memberCandidateIds.length > 0, `${label} memberCandidateIds must be non-empty`);
  requireCondition(nonEmpty(cluster?.behaviorInvariant), `${label} behaviorInvariant is required`);
  requireCondition(new Set(["low", "medium", "high"]).has(cluster?.splitRisk), `${label} splitRisk is invalid`);
  requireCondition(nonEmpty(cluster?.notes), `${label} notes are required`);
  (cluster?.memberCandidateIds || []).forEach((candidateId) => memberIds.push(candidateId));
});
requireCondition([...new Set(memberIds)].sort().join("\n") === expectedGapIds.slice().sort().join("\n"), "cluster member union must equal the fixed 56 gap IDs with no duplicate or orphan");
gaps.forEach((gap) => requireCondition(clusterIds.has(gap.primaryClusterId), `gap ${gap.candidateId} references an unknown cluster ${gap.primaryClusterId}`));
clusters.forEach((cluster) => (cluster.memberCandidateIds || []).forEach((candidateId) => {
  const record = gaps.find((gap) => gap.candidateId === candidateId);
  requireCondition(record?.primaryClusterId === cluster.id, `cluster ${cluster.id} has a member with a different primaryClusterId: ${candidateId}`);
}));

if (errors.length) {
  console.error("Gap behavior analysis: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Gap behavior analysis: PASS (56 gaps; ${clusters.length} clusters; duplicate/orphan 0)`);
}

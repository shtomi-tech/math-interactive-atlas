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
const map = readJson("data/candidate-canonical-map.json");
const registry = readJson("research/canonical-interaction-candidates.json");
const leads = readJson("research/canonical-candidate-repository-leads.json");
const records = Array.isArray(map?.candidates) ? map.candidates : [];
const proposals = Array.isArray(registry?.candidates) ? registry.candidates : [];
const gapIds = new Set(records.filter((record) => record.coverageStatus === "gap").map((record) => record.candidateId));
const partialIds = new Set(records.filter((record) => record.coverageStatus === "partial").map((record) => record.candidateId));
const coveredIds = new Set(records.filter((record) => record.coverageStatus === "covered").map((record) => record.candidateId));
const validCategories = new Set(["Move", "Build", "Compare", "Simulate", "Transform", "Select", "Measure", "Animate"]);
const validEngines = new Set(["functionGraph", "rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"]);
const validFits = new Set(["high", "medium", "low", "none"]);
const validEvidence = new Set(["verified-two-source", "verified-one-source", "blocked"]);
const validPriorities = new Set(["P0", "P1", "P2"]);
const qualifiedByProposal = new Map();
(leads?.leads || []).forEach((lead) => {
  if (lead?.qualification === "qualified") qualifiedByProposal.set(lead.proposalId, (qualifiedByProposal.get(lead.proposalId) || 0) + 1);
});

requireCondition(registry?.version === 1, "canonical interaction candidate registry version must be 1");
requireCondition(registry?.baseline?.commit === "a129d96b2ede407a0a389631ae8c178b64e980f3", "candidate registry baseline commit must be a129d96b2ede407a0a389631ae8c178b64e980f3");
requireCondition(registry?.baseline?.coverage?.covered === 9 && registry?.baseline?.coverage?.partial === 24 && registry?.baseline?.coverage?.gap === 56, "candidate registry baseline coverage must be 9 / 24 / 56");
requireCondition(proposals.length > 0, "candidate registry must contain proposals");
requireCondition(new Set(proposals.map((proposal) => proposal?.proposalId)).size === proposals.length, "proposalId duplicate = 0");
requireCondition(!JSON.stringify(registry).match(/MATH-INT-\d{3}/), "research candidates must not use active MATH-INT IDs");

const allPrimary = [];
const allSecondary = [];
proposals.forEach((proposal, index) => {
  const label = `proposal ${index} ${proposal?.proposalId || "(missing id)"}`;
  requireCondition(/^CAN-CAND-\d{3}$/.test(proposal?.proposalId || ""), `${label} has an invalid proposalId`);
  requireCondition(Array.isArray(proposal?.sourceClusterIds) && proposal.sourceClusterIds.length > 0 && proposal.sourceClusterIds.every((id) => /^GAP-CL-\d{3}$/.test(id)), `${label} sourceClusterIds are required`);
  ["title", "behaviorDefinition", "priorityRationale", "promotionStatus"].forEach((field) => requireCondition(nonEmpty(proposal?.[field]), `${label} ${field} is required`));
  requireCondition(validCategories.has(proposal?.categoryCandidate) || /^proposed:[a-z0-9-]+$/.test(proposal?.categoryCandidate || ""), `${label} has an invalid categoryCandidate`);
  ["learnerActions", "changes", "feedbackCapabilities", "capabilities", "primaryGapCandidateIds", "secondaryPartialOpportunityIds"].forEach((field) => requireCondition(Array.isArray(proposal?.[field]) && proposal[field].length > 0 || field === "secondaryPartialOpportunityIds" && Array.isArray(proposal[field]), `${label} ${field} is required`));
  requireCondition(proposal?.promotionStatus === "research-only", `${label} promotionStatus must be research-only`);
  requireCondition(proposal?.engineFit && validFits.has(proposal.engineFit.level), `${label} engineFit level is invalid`);
  requireCondition(Array.isArray(proposal?.engineFit?.engines) && proposal.engineFit.engines.length > 0, `${label} engineFit engines are required`);
  (proposal?.engineFit?.engines || []).forEach((engine) => requireCondition(validEngines.has(engine), `${label} uses unknown engine ${engine}`));
  requireCondition(nonEmpty(proposal?.engineFit?.rationale), `${label} engineFit rationale is required`);
  requireCondition(validEvidence.has(proposal?.evidenceStatus), `${label} evidenceStatus is invalid`);
  requireCondition(validPriorities.has(proposal?.researchPriority), `${label} researchPriority is invalid`);
  requireCondition(typeof proposal?.shortlisted === "boolean", `${label} shortlisted must be boolean`);
  (proposal?.learnerActions || []).concat(proposal?.changes || [], proposal?.feedbackCapabilities || [], proposal?.capabilities || []).forEach((value) => requireCondition(nonEmpty(value), `${label} contains an empty capability field`));
  (proposal?.primaryGapCandidateIds || []).forEach((candidateId) => { requireCondition(gapIds.has(candidateId), `${label} primary gap is not an R5 gap: ${candidateId}`); allPrimary.push(candidateId); });
  (proposal?.secondaryPartialOpportunityIds || []).forEach((candidateId) => { requireCondition(partialIds.has(candidateId), `${label} secondary opportunity is not an R5 partial: ${candidateId}`); requireCondition(!coveredIds.has(candidateId), `${label} secondary opportunity is covered: ${candidateId}`); allSecondary.push(candidateId); });
  const qualifiedCount = qualifiedByProposal.get(proposal.proposalId) || 0;
  if (proposal.evidenceStatus === "verified-two-source") requireCondition(qualifiedCount >= 2, `${label} verified-two-source requires at least 2 qualified leads (got ${qualifiedCount})`);
  if (proposal.evidenceStatus === "verified-one-source") requireCondition(qualifiedCount >= 1, `${label} verified-one-source requires at least 1 qualified lead`);
  if (proposal.evidenceStatus === "blocked") requireCondition(qualifiedCount === 0, `${label} blocked evidence cannot have a qualified lead`);
  if (proposal.shortlisted) {
    requireCondition(Array.isArray(proposal.searchQueries) && proposal.searchQueries.length > 0 && proposal.searchQueries.every(nonEmpty), `${label} shortlist requires non-empty searchQueries`);
  }
});

requireCondition([...new Set(allPrimary)].sort().join("\n") === [...gapIds].sort().join("\n"), "candidate primary gap union must equal all 56 R5 gaps exactly once");
requireCondition(new Set(allSecondary).size === allSecondary.length, "secondary partial opportunities must not be duplicated");
requireCondition(allSecondary.every((candidateId) => partialIds.has(candidateId)), "secondary opportunities must be partial-only");
const shortlist = proposals.filter((proposal) => proposal.shortlisted);
requireCondition(shortlist.length >= 3 && shortlist.length <= 5, `shortlist must contain 3 to 5 proposals (got ${shortlist.length})`);
const shortlistPrimary = shortlist.flatMap((proposal) => proposal.primaryGapCandidateIds || []);
requireCondition(new Set(shortlistPrimary).size === shortlistPrimary.length, "shortlist primary gaps must not overlap");
requireCondition(shortlist.every((proposal) => proposal.primaryGapCandidateIds?.length > 0), "shortlist proposals must have primary gaps");

if (errors.length) {
  console.error("Canonical interaction candidates: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Canonical interaction candidates: PASS (${proposals.length} proposals; shortlist ${shortlist.length}; primary gaps ${allPrimary.length}; duplicate primary 0)`);
}

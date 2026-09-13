import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "dist/ai/canonical-research-priorities.json");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const contents = readJson("static/atlas/content-data.json");
const currentCoverage = readJson("data/candidate-canonical-map.json");
const analysis = readJson("research/gap-behavior-analysis.json");
const candidateRegistry = readJson("research/canonical-interaction-candidates.json");
const leadRegistry = readJson("research/canonical-candidate-repository-leads.json");
const contentById = new Map(contents.map((content) => [content.id, content]));
// This index is the immutable R6 research snapshot. R7 may add active matches
// to the current map, so remove only those post-R6 canonical links while
// rebuilding the historical research view.
const coverage = {
  ...currentCoverage,
  candidates: currentCoverage.candidates.map((record) => {
    const hasR7Match = (record.matches || []).some((match) => Number(match.interactionId?.replace("MATH-INT-", "")) >= 9);
    return hasR7Match ? { ...record, coverageStatus: "gap", matches: [], recommendedAction: "research-new-interaction" } : record;
  })
};
const gaps = coverage.candidates.filter((candidate) => candidate.coverageStatus === "gap");
const partials = coverage.candidates.filter((candidate) => candidate.coverageStatus === "partial");
const gapSet = new Set(gaps.map((candidate) => candidate.candidateId));
const leadByProposal = new Map();
(leadRegistry.leads || []).forEach((lead) => {
  if (!leadByProposal.has(lead.proposalId)) leadByProposal.set(lead.proposalId, []);
  leadByProposal.get(lead.proposalId).push({
    leadId: lead.leadId,
    repository: lead.repository,
    ref: lead.ref,
    qualification: lead.qualification,
    license: lead.license,
    featurePaths: lead.featurePaths,
    evidenceUrls: lead.evidenceUrls,
    observedBehavior: lead.observedBehavior,
    implementationBoundary: lead.implementationBoundary
  });
});
const subjectName = (candidateId) => {
  const content = contentById.get(candidateId);
  return `${content?.subject || "unknown"} (${content?.subjectLabel || "unknown"})`;
};
const unitName = (candidateId) => {
  const content = contentById.get(candidateId);
  return `${content?.subject || "unknown"}/${content?.unit || "unknown"} (${content?.unitLabel || "unknown"})`;
};
const countObject = (ids, nameFn) => ids.reduce((result, candidateId) => {
  const key = nameFn(candidateId);
  result[key] = (result[key] || 0) + 1;
  return result;
}, {});
const gapAnalysisById = new Map(analysis.gaps.map((gap) => [gap.candidateId, gap]));
const gapByCluster = {};
gaps.forEach((gap) => {
  const clusterId = gapAnalysisById.get(gap.candidateId)?.primaryClusterId || "unknown";
  gapByCluster[clusterId] = (gapByCluster[clusterId] || 0) + 1;
});
const qualifiedLeads = (proposalId) => (leadByProposal.get(proposalId) || []).filter((lead) => lead.qualification === "qualified").length;
const candidates = candidateRegistry.candidates.map((candidate) => {
  const primary = candidate.primaryGapCandidateIds.filter((candidateId) => gapSet.has(candidateId));
  return {
    proposalId: candidate.proposalId,
    sourceClusterIds: candidate.sourceClusterIds,
    title: candidate.title,
    categoryCandidate: candidate.categoryCandidate,
    behaviorDefinition: candidate.behaviorDefinition,
    learnerActions: candidate.learnerActions,
    changes: candidate.changes,
    feedbackCapabilities: candidate.feedbackCapabilities,
    capabilities: candidate.capabilities,
    engineFit: candidate.engineFit,
    evidenceStatus: candidate.evidenceStatus,
    qualifiedLeadCount: qualifiedLeads(candidate.proposalId),
    researchPriority: candidate.researchPriority,
    promotionStatus: candidate.promotionStatus,
    priorityRationale: candidate.priorityRationale,
    shortlisted: candidate.shortlisted,
    searchQueries: candidate.searchQueries,
    primaryGapImpact: {
      count: primary.length,
      candidateIds: primary,
      subjects: [...new Set(primary.map(subjectName))].sort(),
      units: [...new Set(primary.map(unitName))].sort()
    },
    secondaryPartialOpportunityIds: candidate.secondaryPartialOpportunityIds,
    repositoryEvidence: leadByProposal.get(candidate.proposalId) || []
  };
});
const primaryGapImpact = candidates.map((candidate) => ({
  proposalId: candidate.proposalId,
  count: candidate.primaryGapImpact.count,
  candidateIds: candidate.primaryGapImpact.candidateIds
}));
const secondaryByProposal = candidates.filter((candidate) => candidate.secondaryPartialOpportunityIds.length > 0).map((candidate) => ({
  proposalId: candidate.proposalId,
  candidateIds: candidate.secondaryPartialOpportunityIds
}));
const index = {
  version: 1,
  baseline: analysis.baseline,
  gapSummary: {
    total: gaps.length,
    bySubject: countObject(gaps.map((gap) => gap.candidateId), subjectName),
    byUnit: countObject(gaps.map((gap) => gap.candidateId), unitName),
    byBehaviorCluster: gapByCluster
  },
  clusters: analysis.clusters,
  candidates,
  primaryGapImpact,
  secondaryOpportunities: {
    total: partials.length,
    candidateIds: partials.map((candidate) => candidate.candidateId).sort(),
    byProposal: secondaryByProposal
  },
  engineFit: analysis.gaps.reduce((result, gap) => {
    gap.engineFitHypotheses.forEach((hypothesis) => {
      if (!result[hypothesis.engine]) result[hypothesis.engine] = { high: 0, medium: 0, low: 0, none: 0 };
      result[hypothesis.engine][hypothesis.fit] += 1;
    });
    return result;
  }, {}),
  repositoryEvidence: {
    totalLeads: leadRegistry.leads.length,
    qualifiedLeads: leadRegistry.leads.filter((lead) => lead.qualification === "qualified").length,
    byProposal: candidates.map((candidate) => ({ proposalId: candidate.proposalId, leadIds: (leadByProposal.get(candidate.proposalId) || []).map((lead) => lead.leadId) }))
  },
  promotionReadiness: {
    activeCanonicalPromotion: false,
    activeCanonicalIds: ["MATH-INT-001", "MATH-INT-002", "MATH-INT-003", "MATH-INT-004", "MATH-INT-005", "MATH-INT-006", "MATH-INT-007", "MATH-INT-008"],
    shortlistProposalIds: candidates.filter((candidate) => candidate.shortlisted).map((candidate) => candidate.proposalId),
    researchOnlyProposalCount: candidates.filter((candidate) => candidate.promotionStatus === "research-only").length
  }
};

const serialized = `${JSON.stringify(index, null, 2)}\n`;
if (process.argv.includes("--check")) {
  let actual = "";
  try { actual = fs.readFileSync(outputPath, "utf8"); }
  catch (error) {
    console.error(`Canonical research index: FAILED (${error.message})`);
    process.exitCode = 1;
  }
  if (actual && actual !== serialized) {
    console.error("Canonical research index: FAILED (generated output is stale; run node scripts/build-canonical-research-index.js)");
    process.exitCode = 1;
  } else if (actual) {
    console.log("Canonical research index: PASS (generated output is current)");
  }
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized);
  console.log("Canonical research index: BUILT (dist/ai/canonical-research-priorities.json)");
}

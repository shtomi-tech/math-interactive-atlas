import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const contents = readJson("static/atlas/content-data.json");
const map = readJson("data/candidate-canonical-map.json");
const analysis = readJson("research/gap-behavior-analysis.json");
const candidates = readJson("research/canonical-interaction-candidates.json").candidates;
const leads = readJson("research/canonical-candidate-repository-leads.json").leads;
const contentById = new Map(contents.map((content) => [content.id, content]));
const gapSet = new Set(analysis.gaps.map((record) => record.candidateId));
const gapRecords = map.candidates.filter((record) => gapSet.has(record.candidateId));
const gapAnalysis = new Map(analysis.gaps.map((record) => [record.candidateId, record]));
const qualifiedCount = new Map();
leads.filter((lead) => lead.qualification === "qualified").forEach((lead) => qualifiedCount.set(lead.proposalId, (qualifiedCount.get(lead.proposalId) || 0) + 1));

if (gapRecords.length !== 56 || analysis.gaps.length !== 56 || map.candidates.length !== 89) {
  throw new Error("R6 report requires the immutable 56-gap research snapshot and 89-candidate map");
}

const countBy = (records, keyFn) => {
  const counts = new Map();
  records.forEach((record) => { const key = keyFn(record); counts.set(key, (counts.get(key) || 0) + 1); });
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right));
};
const subjectName = (candidateId) => {
  const content = contentById.get(candidateId);
  return `${content?.subject || "unknown"} (${content?.subjectLabel || "unknown"})`;
};
const unitName = (candidateId) => {
  const content = contentById.get(candidateId);
  return `${content?.subject || "unknown"}/${content?.unit || "unknown"} (${content?.unitLabel || "unknown"})`;
};
const fitRank = { high: 3, medium: 2, low: 1, none: 0 };
const evidenceRank = { "verified-two-source": 2, "verified-one-source": 1, blocked: 0 };
const candidateStats = candidates.map((candidate) => {
  const primary = candidate.primaryGapCandidateIds.filter((candidateId) => gapSet.has(candidateId));
  const subjects = [...new Set(primary.map(subjectName))].sort();
  const units = [...new Set(primary.map(unitName))].sort();
  return { candidate, primary, subjects, units };
}).sort((left, right) => {
  const a = left.candidate;
  const b = right.candidate;
  return (right.primary.length - left.primary.length)
    || (right.subjects.length - left.subjects.length)
    || (right.units.length - left.units.length)
    || ((fitRank[b.engineFit.level] || 0) - (fitRank[a.engineFit.level] || 0))
    || ((evidenceRank[b.evidenceStatus] || 0) - (evidenceRank[a.evidenceStatus] || 0))
    || a.proposalId.localeCompare(b.proposalId);
});

console.log("R6 Canonical Research Priorities");
console.log(`baseline: ${analysis.baseline.commit}`);
console.log(`primary gaps: ${gapRecords.length}`);
console.log("\ngap by subject:");
countBy(gapRecords, (record) => subjectName(record.candidateId)).forEach(([key, count]) => console.log(`${key}: ${count}`));
console.log("\ngap by subject/unit:");
countBy(gapRecords, (record) => unitName(record.candidateId)).forEach(([key, count]) => console.log(`${key}: ${count}`));
console.log("\ngap by behavior cluster:");
countBy(gapRecords, (record) => gapAnalysis.get(record.candidateId)?.primaryClusterId || "unknown").forEach(([key, count]) => {
  const cluster = analysis.clusters.find((item) => item.id === key);
  console.log(`${key} (${cluster?.title || "unknown"}): ${count}`);
});
const fitCounts = new Map();
analysis.gaps.forEach((record) => record.engineFitHypotheses.forEach((hypothesis) => {
  const key = `${hypothesis.engine}/${hypothesis.fit}`;
  fitCounts.set(key, (fitCounts.get(key) || 0) + 1);
}));
console.log("\nexisting engine fit hypotheses:");
[...fitCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).forEach(([key, count]) => console.log(`${key}: ${count}`));
console.log("\ncandidate priorities:");
candidateStats.forEach(({ candidate, primary, subjects, units }) => {
  console.log(`${candidate.proposalId} | ${candidate.researchPriority} | shortlist=${candidate.shortlisted} | primary=${primary.length} | subjects=${subjects.join(", ")} | units=${units.join(", ")} | fit=${candidate.engineFit.level} | evidence=${candidate.evidenceStatus} | qualifiedLeads=${qualifiedCount.get(candidate.proposalId) || 0}`);
  console.log(`  gaps: ${primary.join(", ")}`);
});
const partial = map.candidates.filter((record) => record.coverageStatus === "partial").map((record) => record.candidateId).sort();
console.log(`\nsecondary partial opportunities: ${partial.length}`);
console.log(partial.join(", "));

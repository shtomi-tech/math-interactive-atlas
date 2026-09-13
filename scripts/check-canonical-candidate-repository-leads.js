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
const nonEmpty = (value) => typeof value === "string" ? value.trim() !== "" : Array.isArray(value) ? value.length > 0 : Boolean(value);
const leadsFile = readJson("research/canonical-candidate-repository-leads.json");
const candidatesFile = readJson("research/canonical-interaction-candidates.json");
const proposals = new Map((candidatesFile?.candidates || []).map((candidate) => [candidate.proposalId, candidate]));
const leads = Array.isArray(leadsFile?.leads) ? leadsFile.leads : [];
const allowedLicenses = new Set(["MIT", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0", "GPL-3.0", "GPL-3.0-only", "GPL-3.0-or-later", "AGPL-3.0", "AGPL-3.0-only", "AGPL-3.0-or-later"]);
const validQualifications = new Set(["qualified", "rejected"]);
const shaPattern = /^[0-9a-f]{40}$/;

requireCondition(leadsFile?.version === 1, "repository leads version must be 1");
requireCondition(leadsFile?.baseline?.commit === "a129d96b2ede407a0a389631ae8c178b64e980f3", "repository leads baseline commit must be a129d96b2ede407a0a389631ae8c178b64e980f3");
requireCondition(new Set(leads.map((lead) => lead?.leadId)).size === leads.length, "leadId duplicate = 0");
requireCondition(!JSON.stringify(leadsFile).includes("adapted-from"), "repository leads must not use adapted-from");

const qualifiedCounts = new Map();
leads.forEach((lead, index) => {
  const label = `lead ${index} ${lead?.leadId || "(missing id)"}`;
  requireCondition(/^LEAD-\d{3}$/.test(lead?.leadId || ""), `${label} has an invalid leadId`);
  requireCondition(proposals.has(lead?.proposalId), `${label} references an unknown proposal`);
  requireCondition(lead?.repository && typeof lead.repository === "object", `${label} repository is required`);
  const owner = lead?.repository?.owner;
  const name = lead?.repository?.name;
  const rootUrl = lead?.repository?.rootUrl;
  requireCondition(/^[A-Za-z0-9_.-]+$/.test(owner || "") && /^[A-Za-z0-9_.-]+$/.test(name || ""), `${label} repository owner/name is invalid`);
  requireCondition(rootUrl === `https://github.com/${owner}/${name}`, `${label} rootUrl must be the exact GitHub repository URL`);
  requireCondition(lead?.visibility === "public", `${label} visibility must be public`);
  requireCondition(shaPattern.test(lead?.ref || ""), `${label} ref must be a fixed 40-hex commit SHA`);
  const license = lead?.license;
  requireCondition(license && nonEmpty(license.expression), `${label} license expression is required`);
  requireCondition(allowedLicenses.has(license?.expression), `${label} license expression is unknown or not allowed: ${license?.expression}`);
  requireCondition(license?.reviewed === true, `${label} license must be explicitly reviewed`);
  requireCondition(license?.url === `${rootUrl}/blob/${lead.ref}/LICENSE`, `${label} license URL must point to LICENSE at the fixed SHA`);
  requireCondition(license?.reviewedAt === "2026-09-13", `${label} license reviewedAt must be 2026-09-13`);
  requireCondition(Array.isArray(lead?.featurePaths) && lead.featurePaths.length > 0, `${label} featurePaths must be non-empty`);
  requireCondition(Array.isArray(lead?.evidenceUrls) && lead.evidenceUrls.length >= lead.featurePaths.length, `${label} evidenceUrls must cover featurePaths`);
  (lead.featurePaths || []).forEach((featurePath) => requireCondition(typeof featurePath === "string" && featurePath.trim() !== "", `${label} has an empty feature path`));
  (lead.evidenceUrls || []).forEach((url) => {
    requireCondition(typeof url === "string" && url.includes(`${rootUrl}/blob/${lead.ref}/`), `${label} evidence URL must use the fixed SHA`);
    requireCondition(!/(\/main\/|\/master\/|\/latest\/)/i.test(url), `${label} evidence URL must not use a branch or latest ref`);
  });
  (lead.featurePaths || []).forEach((featurePath) => requireCondition((lead.evidenceUrls || []).some((url) => url.endsWith(`/${featurePath}`)), `${label} has no evidence URL for ${featurePath}`));
  requireCondition(nonEmpty(lead?.observedBehavior), `${label} observedBehavior is required`);
  requireCondition(lead?.relationCandidate === "inspired-by", `${label} relationCandidate must be inspired-by`);
  requireCondition(validQualifications.has(lead?.qualification), `${label} qualification is invalid`);
  requireCondition(lead?.implementationBoundary === "behavioral-reference-only", `${label} implementationBoundary must be behavioral-reference-only`);
  requireCondition(nonEmpty(lead?.notes), `${label} notes/reason is required`);
  const verification = lead?.verification;
  requireCondition(verification?.repositoryPublic === true && verification?.commitExists === true && verification?.sourcePathsExist === true && verification?.licenseFileExists === true, `${label} qualified evidence verification flags must all be true`);
  if (lead.qualification === "qualified") qualifiedCounts.set(lead.proposalId, (qualifiedCounts.get(lead.proposalId) || 0) + 1);
  if (lead.license?.expression?.startsWith("GPL") || lead.license?.expression?.startsWith("AGPL")) requireCondition(lead.implementationBoundary === "behavioral-reference-only", `${label} copyleft lead must be behavioral-reference-only`);
});

for (const proposal of candidatesFile?.candidates || []) {
  const qualifiedCount = qualifiedCounts.get(proposal.proposalId) || 0;
  if (proposal.evidenceStatus === "verified-two-source") requireCondition(qualifiedCount >= 2, `${proposal.proposalId} verified-two-source requires 2 qualified leads`);
  if (proposal.evidenceStatus === "verified-one-source") requireCondition(qualifiedCount >= 1, `${proposal.proposalId} verified-one-source requires 1 qualified lead`);
  if (proposal.evidenceStatus === "blocked") requireCondition(qualifiedCount === 0, `${proposal.proposalId} blocked proposal cannot have qualified leads`);
}

if (errors.length) {
  console.error("Canonical candidate repository leads: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Canonical candidate repository leads: PASS (${leads.length} leads; qualified ${[...qualifiedCounts.values()].reduce((sum, count) => sum + count, 0)}; fixed-SHA evidence)`);
}

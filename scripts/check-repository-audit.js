import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

function isGitHubRepositoryUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" && url.pathname.split("/").filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

const contents = readJson("static/atlas/content-data.json");
const audit = readJson("research/repository-audit.json");
const contentIds = Array.isArray(contents) ? contents.map((content) => content.id) : [];
const contentIdSet = new Set(contentIds);
const records = Array.isArray(audit?.contents) ? audit.contents : [];
const allowedStatuses = new Set(["pending", "verified", "needs-review"]);
const allowedRelations = new Set(["inspired-by", "adapted-from"]);

requireCondition(Array.isArray(contents), "content data must be an array");
requireCondition(audit && audit.version === 1, "repository audit version must be 1");
requireCondition(Array.isArray(audit?.contents), "repository audit contents must be an array");
requireCondition(records.length === contentIds.length, `repository audit must contain one record per content (${contentIds.length})`);

const recordIds = new Set();
records.forEach((record, index) => {
  requireCondition(record && typeof record === "object" && !Array.isArray(record), `audit record ${index} must be an object`);
  if (!record || typeof record !== "object" || Array.isArray(record)) return;
  requireCondition(typeof record.contentId === "string" && record.contentId.trim() !== "", `audit record ${index} contentId is required`);
  requireCondition(!recordIds.has(record.contentId), `duplicate audit contentId: ${record.contentId}`);
  recordIds.add(record.contentId);
  requireCondition(contentIdSet.has(record.contentId), `audit contentId does not exist: ${record.contentId}`);
  requireCondition(allowedStatuses.has(record.auditStatus), `${record.contentId} has invalid auditStatus: ${record.auditStatus}`);
  requireCondition(Array.isArray(record.references), `${record.contentId} references must be an array`);
  if (!Array.isArray(record.references)) return;
  if (record.auditStatus === "pending") requireCondition(record.references.length === 0, `${record.contentId} pending records must not have references`);
  if (record.auditStatus === "verified") requireCondition(record.references.length >= 1, `${record.contentId} verified records need at least one reference`);

  const repositories = new Set();
  record.references.forEach((reference, referenceIndex) => {
    const label = `${record.contentId} reference ${referenceIndex}`;
    requireCondition(reference && typeof reference === "object" && !Array.isArray(reference), `${label} must be an object`);
    if (!reference || typeof reference !== "object" || Array.isArray(reference)) return;
    requireCondition(allowedRelations.has(reference.relation), `${label} has an invalid relation`);
    requireCondition(typeof reference.repository === "string" && /^[^/\s]+\/[^/\s]+$/.test(reference.repository), `${label} repository must use owner/repository format`);
    requireCondition(typeof reference.url === "string" && isGitHubRepositoryUrl(reference.url), `${label} URL must be a GitHub repository URL`);
    requireCondition(typeof reference.aspect === "string" && reference.aspect.trim() !== "", `${label} aspect is required`);
    requireCondition(typeof reference.evidence === "string" && reference.evidence.trim() !== "", `${label} evidence is required`);
    requireCondition(typeof reference.license === "string" && reference.license.trim() !== "", `${label} license is required`);
    requireCondition(typeof reference.licenseReviewed === "boolean", `${label} licenseReviewed must be boolean`);
    requireCondition(!repositories.has(reference.repository), `${record.contentId} repeats repository ${reference.repository}`);
    repositories.add(reference.repository);
    requireCondition(reference.relation !== "original", `${label} cannot use original relation`);
    if (reference.relation === "adapted-from") {
      requireCondition(reference.licenseReviewed === true, `${label} adapted-from requires licenseReviewed=true`);
      requireCondition(typeof reference.ref === "string" && reference.ref.trim() !== "", `${label} adapted-from requires ref`);
      requireCondition(Array.isArray(reference.paths) && reference.paths.length >= 1 && reference.paths.every((sourcePath) => typeof sourcePath === "string" && sourcePath.trim() !== ""), `${label} adapted-from requires at least one source path`);
    }
    if (record.auditStatus === "verified") requireCondition(reference.licenseReviewed === true, `${label} verified references require licenseReviewed=true`);
  });
});

requireCondition(recordIds.size === contentIdSet.size && [...contentIdSet].every((id) => recordIds.has(id)), "repository audit contentId set must exactly match content data IDs");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Repository audit: PASS (${records.length} candidate records; ${records.filter((record) => record.auditStatus === "pending").length} pending)`);
}

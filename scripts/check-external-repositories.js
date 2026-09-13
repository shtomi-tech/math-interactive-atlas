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

function isCommitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

function exactGitHubRepositoryUrl(repository, value) {
  return value === `https://github.com/${repository}`;
}

function fixedBlobUrl(repository, ref, value) {
  return typeof value === "string" && new RegExp(`^https://github\\.com/${repository.replace("/", "\\/")}/blob/${ref}/[^?#]+$`).test(value);
}

const registry = readJson("research/external-repositories.json");
const repositories = Array.isArray(registry?.repositories) ? registry.repositories : [];
const repositoryIds = new Set();
const repositoryNames = new Set();
const featureIds = new Set();

requireCondition(registry?.version === 1, "external repository registry version must be 1");
requireCondition(Array.isArray(registry?.repositories), "external repository registry repositories must be an array");
requireCondition(repositories.length >= 3, "external repository registry must contain at least 3 repositories");

repositories.forEach((repository, repositoryIndex) => {
  const label = `repository ${repositoryIndex}`;
  requireCondition(repository && typeof repository === "object" && !Array.isArray(repository), `${label} must be an object`);
  if (!repository || typeof repository !== "object" || Array.isArray(repository)) return;
  requireCondition(typeof repository.id === "string" && repository.id.trim() !== "", `${label} id is required`);
  requireCondition(!repositoryIds.has(repository.id), `duplicate repository id: ${repository.id}`);
  repositoryIds.add(repository.id);
  requireCondition(typeof repository.repository === "string" && /^[^/\s]+\/[^/\s]+$/.test(repository.repository), `${label} repository must use owner/repository format`);
  requireCondition(!repositoryNames.has(repository.repository), `duplicate repository name: ${repository.repository}`);
  repositoryNames.add(repository.repository);
  requireCondition(exactGitHubRepositoryUrl(repository.repository, repository.url), `${label} URL must be the exact GitHub repository root`);
  requireCondition(isCommitSha(repository.ref), `${repository.repository} ref must be a 40-character commit SHA`);
  requireCondition(repository.license && typeof repository.license === "object" && !Array.isArray(repository.license), `${repository.repository} license is required`);
  if (!repository.license || typeof repository.license !== "object" || Array.isArray(repository.license)) return;
  requireCondition(typeof repository.license.expression === "string" && repository.license.expression.trim() !== "", `${repository.repository} license expression is required`);
  requireCondition(typeof repository.license.reviewed === "boolean", `${repository.repository} license reviewed must be boolean`);
  requireCondition(repository.license.reviewed === true, `${repository.repository} license must be reviewed`);
  requireCondition(typeof repository.license.reviewedAt === "string" && repository.license.reviewedAt.trim() !== "", `${repository.repository} license reviewedAt is required`);
  requireCondition(fixedBlobUrl(repository.repository, repository.ref, repository.license.url), `${repository.repository} license URL must use the fixed ref`);
  requireCondition(Array.isArray(repository.features) && repository.features.length >= 1, `${repository.repository} must contain at least one feature`);

  (Array.isArray(repository.features) ? repository.features : []).forEach((feature, featureIndex) => {
    const featureLabel = `${repository.repository} feature ${featureIndex}`;
    requireCondition(feature && typeof feature === "object" && !Array.isArray(feature), `${featureLabel} must be an object`);
    if (!feature || typeof feature !== "object" || Array.isArray(feature)) return;
    requireCondition(typeof feature.id === "string" && feature.id.trim() !== "", `${featureLabel} id is required`);
    requireCondition(!featureIds.has(feature.id), `duplicate feature id: ${feature.id}`);
    featureIds.add(feature.id);
    requireCondition(typeof feature.title === "string" && feature.title.trim() !== "", `${feature.id} title is required`);
    requireCondition(Array.isArray(feature.paths) && feature.paths.length >= 1 && feature.paths.every((sourcePath) => typeof sourcePath === "string" && sourcePath.trim() !== "" && !sourcePath.startsWith("/")), `${feature.id} paths must contain at least one relative path`);
    requireCondition(Array.isArray(feature.evidenceUrls) && feature.evidenceUrls.length >= 1, `${feature.id} evidenceUrls must contain at least one URL`);
    (Array.isArray(feature.evidenceUrls) ? feature.evidenceUrls : []).forEach((evidenceUrl, evidenceIndex) => {
      requireCondition(fixedBlobUrl(repository.repository, repository.ref, evidenceUrl), `${feature.id} evidence URL ${evidenceIndex} must use the fixed ref`);
      const pathPart = typeof evidenceUrl === "string" ? evidenceUrl.split(`/blob/${repository.ref}/`)[1] : "";
      requireCondition((feature.paths || []).includes(pathPart), `${feature.id} evidence URL ${evidenceIndex} must point to a listed feature path`);
    });
    requireCondition(feature.demoUrl === null || (typeof feature.demoUrl === "string" && /^https:\/\//.test(feature.demoUrl)), `${feature.id} demoUrl must be null or an HTTPS URL`);
    requireCondition(typeof feature.behaviorSummary === "string" && feature.behaviorSummary.trim() !== "", `${feature.id} behaviorSummary is required`);
    ["learnerActions", "changes", "feedback"].forEach((field) => {
      requireCondition(Array.isArray(feature[field]) && feature[field].length >= 1 && feature[field].every((value) => typeof value === "string" && value.trim() !== ""), `${feature.id} ${field} must contain non-empty strings`);
    });
    requireCondition(typeof feature.reviewedAt === "string" && feature.reviewedAt.trim() !== "", `${feature.id} reviewedAt is required`);
  });
});

if (errors.length > 0) {
  console.error("External repositories: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`External repositories: PASS (${repositories.length} repositories; ${featureIds.size} features)`);
}

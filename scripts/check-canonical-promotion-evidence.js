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
const evidence = readJson("research/canonical-promotion-evidence.json");
const plan = readJson("research/canonical-promotion-plan.json");
const external = readJson("research/external-repositories.json");
const promoted = new Map((plan?.decisions || []).filter((decision) => decision.decision === "promote").map((decision) => [decision.proposalId, decision]));
const repositories = new Map((external?.repositories || []).map((repository) => [repository.repository, repository]));
const shaPattern = /^[0-9a-f]{40}$/;

requireCondition(evidence?.version === 1, "promotion evidence version must be 1");
requireCondition(Array.isArray(evidence?.promotions), "promotion evidence promotions must be an array");
requireCondition(!JSON.stringify(evidence).includes("adapted-from"), "promotion evidence must not use adapted-from");
requireCondition(evidence?.promotions?.length === promoted.size, "promotion evidence must cover every promoted candidate exactly once");
const evidenceIds = (evidence?.promotions || []).map((promotion) => promotion?.proposalId);
requireCondition(new Set(evidenceIds).size === evidenceIds.length, "promotion evidence proposal IDs must be unique");

(evidence?.promotions || []).forEach((promotion, index) => {
  const label = `promotion evidence ${index} ${promotion?.proposalId || "(missing proposal)"}`;
  const decision = promoted.get(promotion?.proposalId);
  requireCondition(decision, `${label} must reference a promoted proposal`);
  requireCondition(decision?.promotedInteractionId === promotion?.interactionId, `${label} interaction ID must match the promotion plan`);
  const sources = Array.isArray(promotion?.sources) ? promotion.sources : [];
  requireCondition(sources.length >= 2, `${label} requires at least two sources`);
  requireCondition(new Set(sources.map((source) => source.repository)).size >= 2, `${label} requires two distinct repositories`);
  requireCondition(promotion.cleanRoomRequired === true, `${label} must document clean-room implementation`);
  sources.forEach((source, sourceIndex) => {
    const sourceLabel = `${label} source ${sourceIndex}`;
    requireCondition(nonEmpty(source?.repository) && repositories.has(source.repository), `${sourceLabel} repository must be formalized in the external registry`);
    requireCondition(source?.visibility === "public", `${sourceLabel} visibility must be public`);
    requireCondition(shaPattern.test(source?.ref || ""), `${sourceLabel} ref must be a 40-character fixed SHA`);
    requireCondition(nonEmpty(source?.license?.expression), `${sourceLabel} license expression is required`);
    requireCondition(source?.license?.reviewed === true, `${sourceLabel} license must be reviewed`);
    const sourcePaths = Array.isArray(source?.sourcePaths) ? source.sourcePaths : [];
    const evidenceUrls = Array.isArray(source?.evidenceUrls) ? source.evidenceUrls : [];
    requireCondition(sourcePaths.length > 0, `${sourceLabel} sourcePaths must be non-empty`);
    requireCondition(evidenceUrls.length > 0, `${sourceLabel} evidenceUrls must be non-empty`);
    requireCondition(Array.isArray(source?.observedBehavior) && source.observedBehavior.length > 0, `${sourceLabel} observedBehavior must be non-empty`);
    requireCondition(source?.relation === "inspired-by", `${sourceLabel} relation must be inspired-by`);
    requireCondition(source?.implementationBoundary === "behavioral-reference-only", `${sourceLabel} must use behavioral-reference-only`);
    requireCondition(nonEmpty(source?.verifiedAt), `${sourceLabel} verifiedAt is required`);
    evidenceUrls.forEach((url) => {
      requireCondition(typeof url === "string" && url.includes(`/blob/${source.ref}/`), `${sourceLabel} evidence URL must use its fixed SHA`);
      requireCondition(typeof url === "string" && !/\/blob\/(main|master)\//i.test(url), `${sourceLabel} evidence URL must not use a branch ref`);
      const pathPart = typeof url === "string" ? url.split(`/blob/${source.ref}/`)[1] : "";
      requireCondition(sourcePaths.includes(pathPart), `${sourceLabel} evidence URL must point to a listed source path`);
    });
    const repository = repositories.get(source.repository);
    const registeredPaths = new Set((repository?.features || []).flatMap((feature) => feature.paths || []));
    requireCondition(sourcePaths.every((sourcePath) => registeredPaths.has(sourcePath)), `${sourceLabel} source paths must be present in the formalized feature registry`);
  });
});

if (errors.length) {
  console.error("Canonical promotion evidence: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Canonical promotion evidence: PASS (${evidence.promotions.length} promotions; at least two independent fixed-source repositories each)`);
}

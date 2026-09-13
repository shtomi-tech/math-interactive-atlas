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
const contents = readJson("static/atlas/content-data.json");
const library = readJson("data/interactions.json");
const map = readJson("data/candidate-canonical-map.json");
const candidates = Array.isArray(map?.candidates) ? map.candidates : [];
const contentIds = Array.isArray(contents) ? contents.map((content) => content.id) : [];
const canonicalIds = new Set(Array.isArray(library?.interactions) ? library.interactions.map((interaction) => interaction.id) : []);
const validStatuses = new Set(["covered", "partial", "gap"]);
const validRelations = new Set(["direct", "partial", "supporting"]);
const validConfidence = new Set(["high", "medium", "low"]);
const validActions = new Set(["canonicalize-later", "retain-legacy", "research-new-interaction"]);
const counts = new Map();

requireCondition(map?.version === 1, "candidate-canonical map version must be 1");
requireCondition(Array.isArray(map?.candidates), "candidate-canonical map candidates must be an array");
requireCondition(candidates.length === 89, `candidate-canonical map must contain 89 records (got ${candidates.length})`);
requireCondition(new Set(candidates.map((candidate) => candidate.candidateId)).size === candidates.length, "candidateId duplicate = 0");
requireCondition(new Set(contentIds).size === contentIds.length, "content-data candidate IDs must be unique");
requireCondition(candidates.map((candidate) => candidate.candidateId).sort().join("\n") === [...contentIds].sort().join("\n"), "candidate IDs must exactly match content-data.json");

candidates.forEach((candidate, index) => {
  const label = `candidate ${index} ${candidate?.candidateId || "(missing id)"}`;
  requireCondition(candidate && typeof candidate === "object" && !Array.isArray(candidate), `${label} must be an object`);
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return;
  requireCondition(typeof candidate.candidateId === "string" && candidate.candidateId.trim() !== "", `${label} candidateId is required`);
  requireCondition(validStatuses.has(candidate.coverageStatus), `${label} has invalid coverageStatus`);
  requireCondition(Array.isArray(candidate.matches), `${label} matches must be an array`);
  requireCondition(validActions.has(candidate.recommendedAction), `${label} has invalid recommendedAction`);
  const matchIds = new Set();
  const relations = new Set();
  (candidate.matches || []).forEach((match, matchIndex) => {
    const matchLabel = `${label} match ${matchIndex}`;
    requireCondition(match && typeof match === "object" && !Array.isArray(match), `${matchLabel} must be an object`);
    if (!match || typeof match !== "object" || Array.isArray(match)) return;
    requireCondition(canonicalIds.has(match.interactionId) && /^MATH-INT-\d{3}$/.test(match.interactionId), `${matchLabel} references an unknown Canonical ID`);
    requireCondition(!matchIds.has(match.interactionId), `${label} repeats interactionId ${match.interactionId}`);
    matchIds.add(match.interactionId);
    requireCondition(validRelations.has(match.relation), `${matchLabel} has invalid relation`);
    requireCondition(validConfidence.has(match.confidence), `${matchLabel} has invalid confidence`);
    requireCondition(typeof match.rationale === "string" && match.rationale.trim() !== "", `${matchLabel} rationale is required`);
    relations.add(match.relation);
    counts.set(match.interactionId, (counts.get(match.interactionId) || 0) + 1);
  });
  const directCount = relations.has("direct") ? (candidate.matches || []).filter((match) => match.relation === "direct").length : 0;
  const partialCount = relations.has("partial") ? (candidate.matches || []).filter((match) => match.relation === "partial").length : 0;
  if (candidate.coverageStatus === "covered") {
    requireCondition(directCount >= 1, `${label} covered requires direct >= 1`);
  } else if (candidate.coverageStatus === "partial") {
    requireCondition(directCount === 0 && partialCount >= 1, `${label} partial requires direct = 0 and partial >= 1`);
  } else {
    requireCondition((candidate.matches || []).length === 0, `${label} gap requires matches = []`);
    requireCondition(candidate.recommendedAction === "research-new-interaction", `${label} gap requires research-new-interaction`);
  }
});

requireCondition([...counts.values()].some((value) => value < candidates.length), "semantic guard rejects assigning all candidates to one Canonical Interaction");

if (errors.length) {
  console.error("Candidate-canonical map: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  const statusCounts = candidates.reduce((result, candidate) => { result[candidate.coverageStatus] += 1; return result; }, { covered: 0, partial: 0, gap: 0 });
  console.log(`Candidate-canonical map: PASS (89 records; covered ${statusCounts.covered}; partial ${statusCounts.partial}; gap ${statusCounts.gap}; duplicate Candidate 0)`);
}

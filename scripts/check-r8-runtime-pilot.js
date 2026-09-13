import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const readJson = (relativePath) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); }
  catch (error) { errors.push(`${relativePath}: ${error.message}`); return null; }
};
const readText = (relativePath) => { try { return fs.readFileSync(path.join(root, relativePath), "utf8"); } catch { return ""; } };
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const library = readJson("data/interactions.json");
const runtime = readJson("data/interaction-runtime-map.json");
const interactions = Array.isArray(library?.interactions) ? library.interactions : [];
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const byId = new Map(mappings.map((mapping) => [mapping.interactionId, mapping]));
const pilot = byId.get("MATH-INT-009");
const deferred = byId.get("MATH-INT-010");
const counts = mappings.reduce((result, mapping) => { result[mapping.status] = (result[mapping.status] || 0) + 1; return result; }, {});

requireCondition(interactions.some((interaction) => interaction.id === "MATH-INT-009"), "MATH-INT-009 must exist in the Canonical library");
requireCondition(pilot?.status === "implemented", "MATH-INT-009 must be the implemented R8 pilot");
requireCondition(pilot?.engine === "geometryBoard", "MATH-INT-009 must use geometryBoard");
requireCondition(pilot?.mode === "canonical-constrained-measure", "MATH-INT-009 must use canonical-constrained-measure");
requireCondition(pilot?.implementationStyle === "clean-room-reimplementation", "MATH-INT-009 must use clean-room-reimplementation");
requireCondition(JSON.stringify(pilot?.sourceFeatureIds) === JSON.stringify(["REPO-001-F003", "REPO-007-F001"]), "MATH-INT-009 source features must remain REPO-001-F003 and REPO-007-F001");
requireCondition(deferred?.status === "planned", "MATH-INT-010 must remain planned");
requireCondition(!deferred?.engine && !deferred?.mode && !deferred?.implementationStyle, "MATH-INT-010 must not carry runtime-only metadata");
requireCondition(counts.implemented === 4 && counts.planned === 6 && !counts["blocked-evidence"], "R8 runtime must be 4 implemented / 6 planned / 0 blocked");
requireCondition(readText("static/atlas/math/canonical-geometry.js").includes("normalizeDegrees") && readText("static/atlas/math/canonical-geometry.js").includes("angleFromPoint") && readText("static/atlas/math/canonical-geometry.js").includes("measureUnitCircle"), "R8 Pure Math functions are missing");
requireCondition(readText("static/atlas/interactions/geometry-scenes/canonical.js").includes("canonical-constrained-measure"), "R8 canonical geometry scene is missing");
requireCondition(readText("static/library/viewer.js").includes("mountInteraction") && !readText("static/library/viewer.js").includes("mountFunctionGraph"), "Canonical Library viewer must use the engine-neutral registry");

if (errors.length) {
  console.error("R8 runtime pilot: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("R8 runtime pilot: PASS (MATH-INT-009 geometryBoard implemented; MATH-INT-010 planned)");
}

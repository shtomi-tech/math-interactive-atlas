import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const readJson = (relativePath) => { try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); } catch (error) { errors.push(`${relativePath}: ${error.message}`); return null; } };
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const contents = readJson("static/atlas/content-data.json");
const practice = readJson("static/practice/problem-data.json");
const audit = readJson("research/repository-audit.json");
const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const registry = (() => { try { return fs.readFileSync(path.join(root, "static/atlas/interactions/index.js"), "utf8"); } catch { return ""; } })();
const auditCounts = (audit?.contents || []).reduce((counts, record) => { counts[record.auditStatus] = (counts[record.auditStatus] || 0) + 1; return counts; }, {});
const mappings = Array.isArray(runtime?.mappings) ? runtime.mappings : [];
const count = (status) => mappings.filter((mapping) => mapping.status === status).length;

requireCondition(Array.isArray(contents) && contents.length === 89, "R4 scope requires exactly 89 Legacy Candidates");
requireCondition(Array.isArray(practice) && practice.length === 0, "R4 scope requires Practice 0");
requireCondition(audit?.version === 1 && audit?.contents?.length === 89, "R4 scope requires 89 audit records");
requireCondition((auditCounts.verified || 0) === 0 && auditCounts["needs-review"] === 89 && (auditCounts.pending || 0) === 0, "R4 scope requires audit 0 / 89 / 0");
const retainedIds = ["MATH-INT-001", "MATH-INT-002", "MATH-INT-003", "MATH-INT-004", "MATH-INT-005", "MATH-INT-006", "MATH-INT-007", "MATH-INT-008"];
requireCondition(Array.isArray(library?.interactions) && library.interactions.length >= 8, "R4 scope requires the eight retained canonical interactions");
requireCondition(retainedIds.every((id) => library.interactions.some((interaction) => interaction.id === id)), "R4 scope requires MATH-INT-001..008 to be retained");
requireCondition(runtime?.version === 1 && mappings.length === library?.interactions?.length, "R4 scope requires one runtime mapping per canonical interaction");
requireCondition(count("implemented") >= 3 && count("implemented") <= 4, "R4 invariants require the three retained pilots and at most one later pilot");
requireCondition(mappings.filter((mapping) => mapping.interactionId.startsWith("MATH-INT-001") || mapping.interactionId.startsWith("MATH-INT-002") || mapping.interactionId.startsWith("MATH-INT-003")).every((mapping) => mapping.status === "implemented" && mapping.engine === "functionGraph"), "R4 invariants require the 001-003 functionGraph pilots");
requireCondition(mappings.filter((mapping) => ["MATH-INT-004", "MATH-INT-005", "MATH-INT-006"].includes(mapping.interactionId)).every((mapping) => mapping.status === "planned"), "R4 invariants require 004-006 to remain planned");
requireCondition(mappings.filter((mapping) => mapping.interactionId === "MATH-INT-009").every((mapping) => ["planned", "implemented"].includes(mapping.status)), "R4 invariants require MATH-INT-009 to remain planned or be the single later pilot");
requireCondition(!JSON.stringify(library).includes("adapted-from"), "R4 canonical metadata must not use adapted-from");
requireCondition(registry.includes("functionGraph") && ["rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"].every((engine) => registry.includes(engine)), "R4 scope requires the existing 11-engine registry");

if (errors.length) { console.error("R4 scope: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else console.log(`R4 invariants: PASS (89 Legacy Candidates; audit 0 / 89 / 0; ${library.interactions.length} Canonical including retained 001-008; 3 pilot runtimes; Practice 0; Engines 11)`);

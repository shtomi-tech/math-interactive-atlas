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
requireCondition(Array.isArray(library?.interactions) && library.interactions.length === 8, "R4 scope requires 8 canonical interactions");
requireCondition(Array.isArray(external?.repositories) && external.repositories.length === 4, "R4 scope requires 4 external repositories");
requireCondition(external.repositories.flatMap((repository) => repository.features || []).length === 8, "R4 scope requires 8 external features");
requireCondition(runtime?.version === 1 && mappings.length === 8, "R4 scope requires 8 runtime mappings");
requireCondition(count("implemented") === 3 && count("planned") === 3 && count("blocked-evidence") === 2, "R4 scope requires implemented 3 / planned 3 / blocked-evidence 2");
requireCondition(!JSON.stringify(library).includes("adapted-from"), "R4 canonical metadata must not use adapted-from");
requireCondition(registry.includes("functionGraph") && ["rangeGraph", "geometryBoard", "regionSelector", "combinatoricsViewer", "dataLab", "simulationLab", "algebraLab", "numberLineLab", "algorithmLab", "sequenceLab"].every((engine) => registry.includes(engine)), "R4 scope requires the existing 11-engine registry");

if (errors.length) { console.error("R4 scope: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else console.log("R4 scope: PASS (89 Legacy Candidates; audit 0 / 89 / 0; 8 Canonical; 4 repositories; 8 features; Practice 0; Engines 11; runtime 3 / 3 / 2)");

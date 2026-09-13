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

const contents = readJson("static/atlas/content-data.json");
const metadata = readJson("static/atlas/interaction-metadata.json");
const records = Array.isArray(metadata?.interactions) ? metadata.interactions : [];
const arrayFields = ["capabilities", "learningPatterns", "learnerActions", "changes", "feedbackCapabilities", "bestFor", "notBestFor", "supports"];
const scalarFields = ["id", "title", "category", "description", "learningGoal", "implementationDifficulty", "reusability", "reusePolicy"];
const schemaFields = ["id", "title", "category", "description", "learningGoal", ...arrayFields, "implementationDifficulty", "reusability", "reusePolicy"];

requireCondition(Array.isArray(contents), "content data must be an array");
requireCondition(metadata && metadata.version === 1, "interaction metadata version must be 1");
requireCondition(metadata?.schema?.provenanceSource === "research/repository-audit.json", "interaction metadata provenance source must be repository audit");
requireCondition(metadata?.schema?.fieldTypes && schemaFields.every((field) => typeof metadata.schema.fieldTypes[field] === "string"), "interaction metadata schema fields are incomplete");
requireCondition(Array.isArray(metadata?.interactions), "interaction metadata interactions must be an array");

const ids = new Set();
const requireCompleteRecord = records.length > 0;
records.forEach((record, index) => {
  requireCondition(record && typeof record === "object" && !Array.isArray(record), `metadata record ${index} must be an object`);
  if (!record || typeof record !== "object" || Array.isArray(record)) return;
  requireCondition(typeof record.id === "string" && record.id.trim() !== "", `metadata record ${index} id is required`);
  requireCondition(!ids.has(record.id), `duplicate interaction metadata id: ${record.id}`);
  ids.add(record.id);
  scalarFields.forEach((field) => {
    if (requireCompleteRecord || field in record) requireCondition(["string", "number"].includes(typeof record[field]) && String(record[field]).trim() !== "", `${record.id} ${field} must be a non-empty string or number`);
  });
  arrayFields.forEach((field) => {
    if (requireCompleteRecord || field in record) requireCondition(Array.isArray(record[field]) && record[field].every((value) => typeof value === "string"), `${record.id} ${field} must be an array of strings`);
  });
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Interaction metadata: PASS (${records.length} records; empty registry allowed)`);
}

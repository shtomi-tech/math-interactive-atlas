import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex } from "./build-interaction-index.js";

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

const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const runtime = readJson("data/interaction-runtime-map.json");
const actual = readJson("dist/ai/interactions.json");
if (library && external && runtime && actual) {
  const expected = buildIndex(library, external, runtime);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push("dist/ai/interactions.json does not match the generated index");
}

if (errors.length > 0) {
  console.error("Interaction index contract: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Interaction index contract: PASS (${actual.interactions.length} records)`);
}

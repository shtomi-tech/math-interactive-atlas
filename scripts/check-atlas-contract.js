import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "atlas.html",
  "static/atlas.css",
  "static/atlas/main.js",
  "static/atlas/catalog.js",
  "static/atlas/viewer.js",
  "static/atlas/router.js",
  "static/atlas/interactions/index.js",
  "static/atlas/content-data.json",
  "static/atlas/interactions/function-graph.js",
  "static/atlas/interactions/range-graph.js",
  "docs/atlas/DESIGN.md"
];
const errors = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

requiredFiles.forEach(read);
const html = read("atlas.html");
const index = read("index.html");
const css = read("static/atlas.css");
const dataText = read("static/atlas/content-data.json");
const viewerSource = read("static/atlas/viewer.js");
const registrySource = read("static/atlas/interactions/index.js");
const atlasSource = ["static/atlas/main.js", "static/atlas/catalog.js", "static/atlas/viewer.js", "static/atlas/router.js", "static/atlas/interactions/index.js", "static/atlas/interactions/function-graph.js", "static/atlas/interactions/range-graph.js"].map(read).join("\n");

let contents = [];
try {
  contents = JSON.parse(dataText);
} catch (error) {
  errors.push(`content data is not valid JSON: ${error.message}`);
}

requireCondition(Array.isArray(contents), "content data must be an array");
const ids = new Set();
const requiredFields = [
  "id",
  "subject",
  "subjectLabel",
  "unit",
  "unitLabel",
  "title",
  "shortDescription",
  "formula",
  "interactionType",
  "discoveryPoints",
  "related",
  "source"
];
const allowedInteractionTypes = new Set(["slider", "drag", "geometry", "select", "cards", "data", "simulation", "build"]);

if (Array.isArray(contents)) {
  contents.forEach((content, index) => {
    requiredFields.forEach((field) => requireCondition(field in content, `content[${index}] missing ${field}`));
    requireCondition(!ids.has(content.id), `duplicate content id: ${content.id}`);
    ids.add(content.id);
    requireCondition(Boolean(content.interaction?.engine), `content[${index}] missing interaction.engine`);
    requireCondition(Boolean(content.interaction?.mode), `content[${index}] missing interaction.mode`);
    requireCondition(content.interaction?.initial && typeof content.interaction.initial === "object" && !Array.isArray(content.interaction.initial), `content[${index}] interaction.initial must be an object`);
    requireCondition(allowedInteractionTypes.has(content.interactionType), `content[${index}] has unsupported interactionType: ${content.interactionType}`);
    Object.entries(content.interaction?.parameters || {}).forEach(([name, parameter]) => {
      requireCondition(["min", "max", "step"].every((field) => field in parameter), `${content.id} parameter ${name} needs min/max/step`);
      const initialValue = content.interaction?.initial?.[name];
      requireCondition(Number.isFinite(initialValue), `${content.id} parameter ${name} initial is not finite`);
      requireCondition(initialValue >= parameter.min && initialValue <= parameter.max, `${content.id} parameter ${name} initial is outside min/max`);
    });
    requireCondition(Array.isArray(content.discoveryPoints) && content.discoveryPoints.length > 0, `content[${index}] needs discoveryPoints`);
    requireCondition(Array.isArray(content.related), `content[${index}] related must be an array`);
    requireCondition(content.source && typeof content.source === "object", `content[${index}] source must exist`);
  });
  contents.forEach((content) => content.related?.forEach((id) => requireCondition(ids.has(id), `${content.id} related id does not exist: ${id}`)));
}

["quadratic-basic", "quadratic-vertex", "quadratic-discriminant"].forEach((id) => requireCondition(ids.has(id), `missing Phase 1 content: ${id}`));
requireCondition(ids.has("quadratic-range"), "missing Phase 2A content: quadratic-range");
const rangeContent = contents.find((content) => content.id === "quadratic-range");
if (rangeContent) {
  requireCondition(rangeContent.interaction.engine === "rangeGraph", "quadratic-range must use rangeGraph");
  requireCondition(rangeContent.interactionType === "drag", "quadratic-range must use drag interactionType");
}
requireCondition(/katex@\d/.test(html), "KaTeX CDN version is not fixed in atlas.html");
requireCondition(/jsxgraph@\d/.test(html), "JSXGraph CDN version is not fixed in atlas.html");
requireCondition(html.includes("static/atlas/main.js"), "atlas main module is not loaded");
requireCondition(css.includes("--atlas-bg"), "atlas CSS variables are not namespaced");
requireCondition(registrySource.includes("Unknown interaction engine"), "registry does not handle unknown engines");
requireCondition(!viewerSource.includes("function-graph.js") && !viewerSource.includes("range-graph.js"), "viewer imports a concrete interaction engine");
requireCondition(!/localStorage|currentExamKey|app\.progress|answerDrafts|examFlow|practiceCatalogState|MINI_EXAMS/.test(atlasSource), "atlas source references existing practice or exam state");
requireCondition(index.includes("./atlas.html") || index.includes("atlas.html"), "index.html does not link to atlas.html");

const hasExistingPracticeMarkup = index.includes("practiceMain") || index.includes("examMain");
if (hasExistingPracticeMarkup) {
  requireCondition(index.includes("practiceMain"), "practiceMain was removed from index.html");
  requireCondition(index.includes("examMain"), "examMain was removed from index.html");
}

if (errors.length > 0) {
  console.error("Atlas contract: FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Atlas contract: PASS (${contents.length} contents)`);
}

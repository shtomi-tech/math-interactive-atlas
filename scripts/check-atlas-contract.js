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
  "static/atlas/interactions/geometry-board.js",
  "static/atlas/interactions/region-selector.js",
  "static/atlas/interactions/combinatorics-viewer.js",
  "static/atlas/interactions/data-lab.js",
  "static/atlas/interactions/simulation-lab.js",
  "static/atlas/math/set-regions.js",
  "static/atlas/math/set-relations.js",
  "static/atlas/math/event-regions.js",
  "static/atlas/math/conditional-probability.js",
  "static/atlas/math/combinatorics.js",
  "static/atlas/math/statistics.js",
  "static/atlas/math/probability.js",
  "static/atlas/math/hypothesis-test.js",
  "static/atlas/math/geometry.js",
  "scripts/check-set-regions.js",
  "scripts/check-set-relations.js",
  "scripts/check-event-regions.js",
  "scripts/check-conditional-probability.js",
  "scripts/check-combinatorics.js",
  "scripts/check-statistics.js",
  "scripts/check-probability.js",
  "scripts/check-hypothesis-test.js",
  "scripts/check-geometry.js",
  "static/atlas/content-data.json",
  "static/atlas/interactions/function-graph.js",
  "static/atlas/interactions/range-graph.js",
  "docs/atlas/DESIGN.md",
  ".github/workflows/atlas-checks.yml",
  ".github/workflows/pages.yml"
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
const catalogSource = read("static/atlas/catalog.js");
const routerSource = read("static/atlas/router.js");
const geometrySource = read("static/atlas/interactions/geometry-board.js");
const regionSource = read("static/atlas/interactions/region-selector.js");
const combinatoricsViewerSource = read("static/atlas/interactions/combinatorics-viewer.js");
const dataLabSource = read("static/atlas/interactions/data-lab.js");
const simulationLabSource = read("static/atlas/interactions/simulation-lab.js");
const setRegionsSource = read("static/atlas/math/set-regions.js");
const setRelationsSource = read("static/atlas/math/set-relations.js");
const eventRegionsSource = read("static/atlas/math/event-regions.js");
const conditionalProbabilitySource = read("static/atlas/math/conditional-probability.js");
const combinatoricsSource = read("static/atlas/math/combinatorics.js");
const statisticsSource = read("static/atlas/math/statistics.js");
const probabilitySource = read("static/atlas/math/probability.js");
const hypothesisSource = read("static/atlas/math/hypothesis-test.js");
const workflowSource = read(".github/workflows/atlas-checks.yml");
const pagesWorkflowSource = read(".github/workflows/pages.yml");
const atlasSource = ["static/atlas/main.js", "static/atlas/catalog.js", "static/atlas/viewer.js", "static/atlas/router.js", "static/atlas/interactions/index.js", "static/atlas/interactions/function-graph.js", "static/atlas/interactions/range-graph.js", "static/atlas/interactions/geometry-board.js", "static/atlas/interactions/region-selector.js", "static/atlas/interactions/combinatorics-viewer.js", "static/atlas/interactions/data-lab.js", "static/atlas/interactions/simulation-lab.js", "static/atlas/math/set-regions.js", "static/atlas/math/set-relations.js", "static/atlas/math/event-regions.js", "static/atlas/math/conditional-probability.js", "static/atlas/math/combinatorics.js", "static/atlas/math/statistics.js", "static/atlas/math/probability.js", "static/atlas/math/hypothesis-test.js"].map(read).join("\n");

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
  "instructions",
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
requireCondition(ids.has("unit-circle"), "missing Phase 2B content: unit-circle");
requireCondition(ids.has("triangle-area-sine"), "missing Phase 2C content: triangle-area-sine");
requireCondition(ids.has("set-regions"), "missing Phase 2D content: set-regions");
requireCondition(ids.has("necessary-sufficient"), "missing Phase 2E content: necessary-sufficient");
requireCondition(ids.has("event-regions"), "missing Phase 2F content: event-regions");
requireCondition(ids.has("conditional-probability"), "missing Phase 3A content: conditional-probability");
requireCondition(ids.has("counting-tree"), "missing Phase 3A content: counting-tree");
requireCondition(ids.has("permutations-all"), "missing Phase 3A content: permutations-all");
requireCondition(ids.has("combinations-order"), "missing Phase 3A content: combinations-order");
requireCondition(ids.has("mean-median-outlier"), "missing Phase 3B content: mean-median-outlier");
requireCondition(ids.has("variance-distance"), "missing Phase 3B content: variance-distance");
requireCondition(ids.has("boxplot-drag"), "missing Phase 3B content: boxplot-drag");
requireCondition(ids.has("correlation-builder"), "missing Phase 3B content: correlation-builder");
requireCondition(ids.has("hypothesis-test-coin"), "missing Phase 3B content: hypothesis-test-coin");
[
  "independent-trials", "sine-law-circumcircle", "cosine-law", "triangle-centers",
  "angle-bisector-ratio", "inscribed-angle", "power-of-point"
].forEach((id) => requireCondition(ids.has(id), `missing Phase 3C content: ${id}`));
requireCondition(contents.length === 25, "Phase 3C must provide 25 contents");
requireCondition(new Set(contents.map((content) => content.interaction.engine)).size === 7, "Phase 3C must keep 7 interaction engines");
const rangeContent = contents.find((content) => content.id === "quadratic-range");
if (rangeContent) {
  requireCondition(rangeContent.interaction.engine === "rangeGraph", "quadratic-range must use rangeGraph");
  requireCondition(rangeContent.interactionType === "drag", "quadratic-range must use drag interactionType");
}
const unitCircleContent = contents.find((content) => content.id === "unit-circle");
if (unitCircleContent) {
  requireCondition(unitCircleContent.interaction.engine === "geometryBoard", "unit-circle must use geometryBoard");
  requireCondition(unitCircleContent.interactionType === "geometry", "unit-circle must use geometry interactionType");
  requireCondition(unitCircleContent.interaction.mode === "unit-circle", "unit-circle must use unit-circle mode");
  requireCondition(unitCircleContent.related.includes("triangle-area-sine"), "unit-circle must link triangle-area-sine");
}
const triangleAreaContent = contents.find((content) => content.id === "triangle-area-sine");
if (triangleAreaContent) {
  requireCondition(triangleAreaContent.interaction.engine === "geometryBoard", "triangle-area-sine must use geometryBoard");
  requireCondition(triangleAreaContent.interactionType === "geometry", "triangle-area-sine must use geometry interactionType");
  requireCondition(triangleAreaContent.interaction.mode === "triangle-area-sine", "triangle-area-sine must use triangle-area-sine mode");
  requireCondition(triangleAreaContent.related.includes("unit-circle"), "triangle-area-sine must link unit-circle");
}
const setRegionsContent = contents.find((content) => content.id === "set-regions");
if (setRegionsContent) {
  requireCondition(setRegionsContent.interaction.engine === "regionSelector", "set-regions must use regionSelector");
  requireCondition(setRegionsContent.interaction.mode === "set-regions", "set-regions must use set-regions mode");
  requireCondition(setRegionsContent.interactionType === "select", "set-regions must use select interactionType");
  requireCondition(setRegionsContent.interaction.initial.selectedMask === 0, "set-regions must start with selectedMask 0");
  requireCondition(setRegionsContent.related.includes("necessary-sufficient"), "set-regions must link necessary-sufficient");
  requireCondition(setRegionsContent.related.includes("event-regions"), "set-regions must link event-regions");
}
const necessarySufficientContent = contents.find((content) => content.id === "necessary-sufficient");
if (necessarySufficientContent) {
  requireCondition(necessarySufficientContent.interaction.engine === "regionSelector", "necessary-sufficient must use regionSelector");
  requireCondition(necessarySufficientContent.interaction.mode === "necessary-sufficient", "necessary-sufficient must use necessary-sufficient mode");
  requireCondition(necessarySufficientContent.interactionType === "select", "necessary-sufficient must use select interactionType");
  requireCondition(necessarySufficientContent.interaction.initial.relation === "p-subset-q", "necessary-sufficient must start with p-subset-q");
  requireCondition(necessarySufficientContent.related.includes("set-regions"), "necessary-sufficient must link set-regions");
}
const eventRegionsContent = contents.find((content) => content.id === "event-regions");
if (eventRegionsContent) {
  requireCondition(eventRegionsContent.subject === "mathA", "event-regions must use mathA");
  requireCondition(eventRegionsContent.subjectLabel === "数学A", "event-regions subjectLabel must be 数学A");
  requireCondition(eventRegionsContent.unit === "probability", "event-regions must use probability unit");
  requireCondition(eventRegionsContent.unitLabel === "場合の数と確率", "event-regions unitLabel is incorrect");
  requireCondition(eventRegionsContent.interaction.engine === "regionSelector", "event-regions must use regionSelector");
  requireCondition(eventRegionsContent.interaction.mode === "event-regions", "event-regions must use event-regions mode");
  requireCondition(eventRegionsContent.interactionType === "select", "event-regions must use select interactionType");
  requireCondition(eventRegionsContent.interaction.initial.event === "union", "event-regions must start with union");
  requireCondition(eventRegionsContent.related.includes("set-regions"), "event-regions must link set-regions");
  requireCondition(eventRegionsContent.related.includes("conditional-probability"), "event-regions must link conditional-probability");
}
const conditionalProbabilityContent = contents.find((content) => content.id === "conditional-probability");
if (conditionalProbabilityContent) {
  requireCondition(conditionalProbabilityContent.subject === "mathA", "conditional-probability must use mathA");
  requireCondition(conditionalProbabilityContent.unit === "probability", "conditional-probability must use probability unit");
  requireCondition(conditionalProbabilityContent.interaction.engine === "regionSelector", "conditional-probability must use regionSelector");
  requireCondition(conditionalProbabilityContent.interaction.mode === "conditional-probability", "conditional-probability mode is incorrect");
  requireCondition(conditionalProbabilityContent.interactionType === "select", "conditional-probability must use select interactionType");
  requireCondition(conditionalProbabilityContent.interaction.initial.step === "overview", "conditional-probability must start with overview");
  requireCondition(conditionalProbabilityContent.related.includes("event-regions"), "conditional-probability must link event-regions");
}
[
  ["counting-tree", "tree-count"],
  ["permutations-all", "permutations"],
  ["combinations-order", "combinations"]
].forEach(([id, mode]) => {
  const content = contents.find((item) => item.id === id);
  if (!content) return;
  requireCondition(content.subject === "mathA", `${id} must use mathA`);
  requireCondition(content.unit === "probability", `${id} must use probability unit`);
  requireCondition(content.interaction.engine === "combinatoricsViewer", `${id} must use combinatoricsViewer`);
  requireCondition(content.interaction.mode === mode, `${id} mode is incorrect`);
  requireCondition(content.interactionType === "select", `${id} must use select interactionType`);
});
[
  ["mean-median-outlier", "mean-median"],
  ["variance-distance", "variance-distance"],
  ["boxplot-drag", "boxplot"],
  ["correlation-builder", "correlation"]
].forEach(([id, mode]) => {
  const content = contents.find((item) => item.id === id);
  if (!content) return;
  requireCondition(content.subject === "math1", `${id} must use math1`);
  requireCondition(content.unit === "statistics", `${id} must use statistics unit`);
  requireCondition(content.interaction.engine === "dataLab", `${id} must use dataLab`);
  requireCondition(content.interaction.mode === mode, `${id} mode is incorrect`);
});
const hypothesisContent = contents.find((content) => content.id === "hypothesis-test-coin");
if (hypothesisContent) {
  requireCondition(hypothesisContent.subject === "math1", "hypothesis-test-coin must use math1");
  requireCondition(hypothesisContent.unit === "statistics", "hypothesis-test-coin must use statistics unit");
  requireCondition(hypothesisContent.interaction.engine === "simulationLab", "hypothesis-test-coin must use simulationLab");
  requireCondition(hypothesisContent.interaction.mode === "hypothesis-coin", "hypothesis-test-coin mode is incorrect");
  requireCondition(hypothesisContent.interactionType === "simulation", "hypothesis-test-coin must use simulation interactionType");
}
requireCondition(/katex@\d/.test(html), "KaTeX CDN version is not fixed in atlas.html");
requireCondition(/jsxgraph@\d/.test(html), "JSXGraph CDN version is not fixed in atlas.html");
requireCondition(html.includes("static/atlas/main.js"), "atlas main module is not loaded");
requireCondition(css.includes("--atlas-bg"), "atlas CSS variables are not namespaced");
requireCondition(css.includes("atlas-data-") && css.includes("atlas-simulation-"), "DataLab and SimulationLab CSS is missing");
requireCondition(registrySource.includes("Unknown interaction engine"), "registry does not handle unknown engines");
requireCondition(registrySource.includes("geometryBoard") && registrySource.includes("geometry-board.js"), "registry does not register geometryBoard");
requireCondition(registrySource.includes("regionSelector") && registrySource.includes("region-selector.js"), "registry does not register regionSelector");
requireCondition(geometrySource.includes("mountGeometryBoard"), "geometry board mount function is missing");
requireCondition(geometrySource.includes("keepAspectRatio: true"), "geometry board does not preserve aspect ratio");
[
  "unit-circle", "triangle-area-sine", "sine-law-circumcircle", "cosine-law", "triangle-centers",
  "angle-bisector-ratio", "inscribed-angle", "power-of-point"
].forEach((mode) => requireCondition(geometrySource.includes(`"${mode}"`), `geometry mode dispatch is missing ${mode}`));
requireCondition(geometrySource.includes("areaByHeight") && geometrySource.includes("areaBySine") && geometrySource.includes("areaCalculationError"), "triangle area calculation cross-check is missing");
requireCondition(regionSource.includes("mountRegionSelector") && regionSource.includes("selectedMask"), "region selector mount or state is missing");
requireCondition(!/JXG|JSXGraph/.test(regionSource), "region selector must not depend on JSXGraph");
requireCondition(regionSource.includes('"set-regions": mountSetRegionsScene') && regionSource.includes('"necessary-sufficient": mountNecessarySufficientScene'), "region selector mode dispatch is incomplete");
requireCondition(regionSource.includes('"event-regions": mountEventRegionsScene'), "event-regions mode dispatch is missing");
requireCondition(regionSource.includes('"conditional-probability": mountConditionalProbabilityScene'), "conditional-probability mode dispatch is missing");
requireCondition(regionSource.includes("latexForMask") && !regionSource.includes("LATEX_EXPRESSIONS"), "region selector must use the set regions LaTeX source");
requireCondition(setRegionsSource.includes("REGION_BITS") && setRegionsSource.includes("expressionForMask") && setRegionsSource.includes("latexForMask") && setRegionsSource.includes("toggleRegion"), "set regions math module is incomplete");
requireCondition(setRelationsSource.includes("SET_RELATIONS") && setRelationsSource.includes("relationFacts"), "set relations math module is incomplete");
requireCondition(eventRegionsSource.includes("EVENT_TYPES") && eventRegionsSource.includes("maskForEvent") && eventRegionsSource.includes("eventFacts"), "event regions math module is incomplete");
requireCondition(conditionalProbabilitySource.includes("CONDITIONAL_STEPS") && conditionalProbabilitySource.includes("conditionalStepFacts"), "conditional probability math module is incomplete");
requireCondition(combinatoricsSource.includes("factorial") && combinatoricsSource.includes("permutationCount") && combinatoricsSource.includes("combinationCount") && combinatoricsSource.includes("enumeratePermutations") && combinatoricsSource.includes("enumerateCombinations") && combinatoricsSource.includes("treePaths"), "combinatorics math module is incomplete");
requireCondition(["mean", "median", "variance", "standardDeviation", "quartiles", "covariance", "correlationCoefficient"].every((name) => statisticsSource.includes(`export function ${name}`)), "statistics math module is incomplete");
requireCondition(probabilitySource.includes("binomialCoefficient") && probabilitySource.includes("binomialProbability") && probabilitySource.includes("binomialUpperTail") && probabilitySource.includes("binomialDistribution"), "probability math module is incomplete");
requireCondition(hypothesisSource.includes("coinTestFacts"), "hypothesis test math module is incomplete");
requireCondition(combinatoricsViewerSource.includes("COMBINATORICS_MODES") && combinatoricsViewerSource.includes('"tree-count": mountTreeCount') && combinatoricsViewerSource.includes("permutations: mountPermutations") && combinatoricsViewerSource.includes("combinations: mountCombinations"), "combinatorics viewer mode dispatch is incomplete");
requireCondition(combinatoricsViewerSource.includes("config.data?.stages") && !combinatoricsViewerSource.includes("TREE_STAGES"), "counting tree stages must come from content data");
requireCondition(dataLabSource.includes("DATA_LAB_MODES") && dataLabSource.includes("mountMeanMedianScene") && dataLabSource.includes("mountVarianceScene") && dataLabSource.includes("mountBoxplotScene") && dataLabSource.includes("mountCorrelationScene"), "data lab mode dispatch is incomplete");
requireCondition(simulationLabSource.includes("mountSimulationLab") && simulationLabSource.includes('"hypothesis-coin"') && simulationLabSource.includes('"independent-trials"') && simulationLabSource.includes("Math.random"), "simulation lab implementation is incomplete");
requireCondition(!simulationLabSource.includes("atlas-simulation-five-percent"), "hypothesis chart must not draw a 5% height line");
requireCondition(registrySource.includes("combinatoricsViewer") && registrySource.includes("combinatorics-viewer.js"), "registry does not register combinatoricsViewer");
requireCondition(registrySource.includes("dataLab") && registrySource.includes("data-lab.js"), "registry does not register dataLab");
requireCondition(registrySource.includes("simulationLab") && registrySource.includes("simulation-lab.js"), "registry does not register simulationLab");
requireCondition(catalogSource.includes("SUBJECT_ORDER") && catalogSource.includes('"math1", "mathA"') && catalogSource.includes("SUBJECT_UNIT_ORDER") && catalogSource.includes("probability") && catalogSource.includes('"event-regions"') && catalogSource.includes('"conditional-probability"') && catalogSource.includes('"counting-tree"'), "catalog does not define the Phase 3A subject order");
requireCondition(catalogSource.includes("statistics: Object.freeze") && catalogSource.includes('"mean-median-outlier"') && catalogSource.includes('"hypothesis-test-coin"'), "catalog does not define the Phase 3B statistics order");
requireCondition(routerSource.includes('subject: params.get("subject") || null'), "catalog route must show all subjects when subject is omitted");
requireCondition(workflowSource.includes("node-version: 22"), "GitHub Actions must use Node.js 22");
requireCondition(workflowSource.includes("node scripts/check-atlas-contract.js") && workflowSource.includes("node scripts/check-set-regions.js") && workflowSource.includes("node scripts/check-set-relations.js") && workflowSource.includes("node scripts/check-event-regions.js") && workflowSource.includes("node scripts/check-conditional-probability.js") && workflowSource.includes("node scripts/check-combinatorics.js") && workflowSource.includes("node scripts/check-statistics.js") && workflowSource.includes("node scripts/check-probability.js") && workflowSource.includes("node scripts/check-hypothesis-test.js") && workflowSource.includes("node scripts/check-geometry.js"), "GitHub Actions check scripts are incomplete");
requireCondition(workflowSource.includes("node --check static/atlas/interactions/region-selector.js") && workflowSource.includes("node --check static/atlas/math/set-relations.js") && workflowSource.includes("node --check static/atlas/math/event-regions.js") && workflowSource.includes("node --check static/atlas/math/conditional-probability.js") && workflowSource.includes("node --check static/atlas/math/combinatorics.js") && workflowSource.includes("node --check static/atlas/interactions/combinatorics-viewer.js") && workflowSource.includes("node --check static/atlas/interactions/data-lab.js") && workflowSource.includes("node --check static/atlas/interactions/simulation-lab.js") && workflowSource.includes("node --check static/atlas/math/statistics.js") && workflowSource.includes("node --check static/atlas/math/probability.js") && workflowSource.includes("node --check static/atlas/math/hypothesis-test.js"), "GitHub Actions syntax checks are incomplete");
requireCondition(pagesWorkflowSource.includes("workflow_dispatch:") && !pagesWorkflowSource.includes("  push:") && pagesWorkflowSource.includes("actions/configure-pages@v5") && !pagesWorkflowSource.includes("enablement:") && pagesWorkflowSource.includes("test -f atlas.html") && pagesWorkflowSource.includes("test -f index.html") && pagesWorkflowSource.includes("test -f static/atlas.css") && pagesWorkflowSource.includes("test -f static/atlas/main.js") && pagesWorkflowSource.includes("test -f static/atlas/content-data.json") && pagesWorkflowSource.includes("cp static/atlas.css _site/static/atlas.css") && pagesWorkflowSource.includes("cp -R static/atlas _site/static/atlas") && pagesWorkflowSource.includes("touch _site/.nojekyll") && pagesWorkflowSource.includes("actions/upload-pages-artifact@v3") && pagesWorkflowSource.includes("actions/deploy-pages@v4"), "GitHub Pages deploy workflow is incomplete");
requireCondition(!viewerSource.includes("function-graph.js") && !viewerSource.includes("range-graph.js") && !viewerSource.includes("geometry-board.js") && !viewerSource.includes("region-selector.js") && !viewerSource.includes("combinatorics-viewer.js") && !viewerSource.includes("data-lab.js") && !viewerSource.includes("simulation-lab.js"), "viewer imports a concrete interaction engine");
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

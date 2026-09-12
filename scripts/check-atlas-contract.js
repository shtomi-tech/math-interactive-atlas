import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "atlas.html",
  "practice.html",
  "sets.html",
  "worksheet.html",
  "progress.html",
  "static/tokens.css",
  "static/atlas.css",
  "static/atlas/main.js",
  "static/atlas/catalog.js",
  "static/atlas/viewer.js",
  "static/atlas/router.js",
  "static/atlas/interactions/index.js",
  "static/atlas/interactions/geometry-board.js",
  "static/atlas/interactions/geometry-scenes/common.js",
  "static/atlas/interactions/geometry-scenes/index.js",
  "static/atlas/interactions/geometry-scenes/triangle.js",
  "static/atlas/interactions/geometry-scenes/circle.js",
  "static/atlas/interactions/geometry-scenes/trigonometry.js",
  "static/atlas/interactions/geometry-scenes/coordinate.js",
  "static/atlas/interactions/region-selector.js",
  "static/atlas/interactions/combinatorics-viewer.js",
  "static/atlas/interactions/data-lab.js",
  "static/atlas/interactions/simulation-lab.js",
  "static/atlas/interactions/algebra-lab.js",
  "static/atlas/interactions/number-line-lab.js",
  "static/atlas/interactions/algorithm-lab.js",
  "static/atlas/interactions/function-graph.js",
  "static/atlas/interactions/function-scenes/common.js",
  "static/atlas/interactions/function-scenes/index.js",
  "static/atlas/interactions/function-scenes/quadratic.js",
  "static/atlas/interactions/function-scenes/exponential.js",
  "static/atlas/interactions/function-scenes/trigonometric.js",
  "static/atlas/interactions/function-scenes/calculus.js",
  "static/atlas/interactions/function-scenes/social-models.js",
  "static/atlas/interactions/sequence-lab.js",
  "static/atlas/curriculum.js",
  "static/atlas/math/set-regions.js",
  "static/atlas/math/set-relations.js",
  "static/atlas/math/event-regions.js",
  "static/atlas/math/conditional-probability.js",
  "static/atlas/math/combinatorics.js",
  "static/atlas/math/statistics.js",
  "static/atlas/math/probability.js",
  "static/atlas/math/hypothesis-test.js",
  "static/atlas/math/geometry.js",
  "static/atlas/math/algebra.js",
  "static/atlas/math/number-line.js",
  "static/atlas/math/sample-space.js",
  "static/atlas/math/number-theory.js",
  "static/atlas/math/quadratic.js",
  "static/atlas/math/trigonometry.js",
  "static/atlas/math/exponential-logarithm.js",
  "static/atlas/math/calculus.js",
  "static/atlas/math/sequences.js",
  "static/atlas/math/algebra2.js",
  "static/atlas/math/coordinate-geometry.js",
  "static/atlas/math/statistical-inference.js",
  "static/atlas/math/sampling.js",
  "static/atlas/math/modeling.js",
  "static/atlas/storage.js",
  "static/practice.css",
  "static/practice/main.js",
  "static/practice/router.js",
  "static/practice/catalog.js",
  "static/practice/runner.js",
  "static/practice/answer.js",
  "static/practice/validation.js",
  "static/practice/filter.js",
  "static/practice/session.js",
  "static/practice/problem-data.json",
  "static/asset-version.txt",
  "static/sets.css",
  "static/sets/main.js",
  "static/sets/model.js",
  "static/sets/storage.js",
  "static/sets/io.js",
  "static/worksheet.css",
  "static/worksheet/main.js",
  "static/worksheet/model.js",
  "static/progress.css",
  "static/progress/main.js",
  "static/progress/summary.js",
  "static/progress/record.js",
  "scripts/check-set-regions.js",
  "scripts/check-set-relations.js",
  "scripts/check-event-regions.js",
  "scripts/check-conditional-probability.js",
  "scripts/check-combinatorics.js",
  "scripts/check-statistics.js",
  "scripts/check-probability.js",
  "scripts/check-hypothesis-test.js",
  "scripts/check-geometry.js",
  "scripts/check-algebra.js",
  "scripts/check-number-line.js",
  "scripts/check-sample-space.js",
  "scripts/check-number-theory.js",
  "scripts/check-quadratic.js",
  "scripts/check-trigonometry.js",
  "scripts/check-exponential-logarithm.js",
  "scripts/check-calculus.js",
  "scripts/check-sequences.js",
  "scripts/check-algebra2.js",
  "scripts/check-coordinate-geometry.js",
  "scripts/check-statistical-inference.js",
  "scripts/check-modeling.js",
  "scripts/check-curriculum.js",
  "scripts/check-related-content.js",
  "scripts/check-practice-data.js",
  "scripts/check-practice-answer.js",
  "scripts/check-practice-links.js",
  "scripts/check-practice-coverage.js",
  "scripts/check-practice-quality.js",
  "scripts/check-practice-session.js",
  "scripts/check-learning-state.js",
  "tests/e2e/all-atlas-content.spec.js",
  "tests/e2e/learning-loop.spec.js",
  "tests/e2e/pages-smoke.spec.js",
  "tests/e2e/helpers.js",
  "static/atlas/content-data.json",
  "static/atlas/interactions/range-graph.js",
  "docs/atlas/DESIGN.md",
  "docs/RELEASE_CHECKLIST.md",
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
const practiceHtml = read("practice.html");
const index = read("index.html");
const tokenSource = read("static/tokens.css");
const css = read("static/atlas.css");
const practiceCss = read("static/practice.css");
const dataText = read("static/atlas/content-data.json");
const practiceDataText = read("static/practice/problem-data.json");
const viewerSource = read("static/atlas/viewer.js");
const registrySource = read("static/atlas/interactions/index.js");
const catalogSource = read("static/atlas/catalog.js");
const routerSource = read("static/atlas/router.js");
const geometrySource = read("static/atlas/interactions/geometry-board.js");
const regionSource = read("static/atlas/interactions/region-selector.js");
const combinatoricsViewerSource = read("static/atlas/interactions/combinatorics-viewer.js");
const dataLabSource = read("static/atlas/interactions/data-lab.js");
const simulationLabSource = read("static/atlas/interactions/simulation-lab.js");
const algebraLabSource = read("static/atlas/interactions/algebra-lab.js");
const numberLineLabSource = read("static/atlas/interactions/number-line-lab.js");
const algorithmLabSource = read("static/atlas/interactions/algorithm-lab.js");
const functionGraphSource = read("static/atlas/interactions/function-graph.js");
const functionScenesSource = ["common.js", "index.js", "quadratic.js", "exponential.js", "trigonometric.js", "calculus.js", "social-models.js"].map((file) => read(`static/atlas/interactions/function-scenes/${file}`)).join("\n");
const sequenceLabSource = read("static/atlas/interactions/sequence-lab.js");
const rangeGraphSource = read("static/atlas/interactions/range-graph.js");
const curriculumSource = read("static/atlas/curriculum.js");
const setRegionsSource = read("static/atlas/math/set-regions.js");
const setRelationsSource = read("static/atlas/math/set-relations.js");
const eventRegionsSource = read("static/atlas/math/event-regions.js");
const conditionalProbabilitySource = read("static/atlas/math/conditional-probability.js");
const combinatoricsSource = read("static/atlas/math/combinatorics.js");
const statisticsSource = read("static/atlas/math/statistics.js");
const probabilitySource = read("static/atlas/math/probability.js");
const hypothesisSource = read("static/atlas/math/hypothesis-test.js");
const algebraSource = read("static/atlas/math/algebra.js");
const numberLineSource = read("static/atlas/math/number-line.js");
const sampleSpaceSource = read("static/atlas/math/sample-space.js");
const numberTheorySource = read("static/atlas/math/number-theory.js");
const quadraticSource = read("static/atlas/math/quadratic.js");
const trigonometrySource = read("static/atlas/math/trigonometry.js");
const exponentialLogarithmSource = read("static/atlas/math/exponential-logarithm.js");
const calculusSource = read("static/atlas/math/calculus.js");
const sequencesSource = read("static/atlas/math/sequences.js");
const algebra2Source = read("static/atlas/math/algebra2.js");
const coordinateGeometrySource = read("static/atlas/math/coordinate-geometry.js");
const statisticalInferenceSource = read("static/atlas/math/statistical-inference.js");
const samplingSource = read("static/atlas/math/sampling.js");
const modelingSource = read("static/atlas/math/modeling.js");
const geometryScenesSource = ["common.js", "index.js", "triangle.js", "circle.js", "trigonometry.js", "coordinate.js"].map((file) => read(`static/atlas/interactions/geometry-scenes/${file}`)).join("\n");
const storageSource = read("static/atlas/storage.js");
const practiceMainSource = read("static/practice/main.js");
const practiceRouterSource = read("static/practice/router.js");
const practiceCatalogSource = read("static/practice/catalog.js");
const practiceRunnerSource = read("static/practice/runner.js");
const practiceAnswerSource = read("static/practice/answer.js");
const practiceValidationSource = read("static/practice/validation.js");
const practiceFilterSource = read("static/practice/filter.js");
const practiceSessionSource = read("static/practice/session.js");
const setsHtml = read("sets.html");
const setsSource = read("static/sets/main.js");
const setModelSource = read("static/sets/model.js");
const setStorageSource = read("static/sets/storage.js");
const setIoSource = read("static/sets/io.js");
const worksheetSource = read("static/worksheet/main.js");
const worksheetModelSource = read("static/worksheet/model.js");
const progressSource = read("static/progress/main.js");
const progressSummarySource = read("static/progress/summary.js");
const progressRecordSource = read("static/progress/record.js");
const workflowSource = read(".github/workflows/atlas-checks.yml");
const pagesWorkflowSource = read(".github/workflows/pages.yml");
const e2eHelperSource = read("tests/e2e/helpers.js");
const allAtlasE2eSource = read("tests/e2e/all-atlas-content.spec.js");
const learningLoopE2eSource = read("tests/e2e/learning-loop.spec.js");
const pagesSmokeE2eSource = read("tests/e2e/pages-smoke.spec.js");
const atlasSource = ["static/atlas/main.js", "static/atlas/catalog.js", "static/atlas/viewer.js", "static/atlas/router.js", "static/atlas/interactions/index.js", "static/atlas/interactions/function-graph.js", "static/atlas/interactions/range-graph.js", "static/atlas/interactions/geometry-board.js", "static/atlas/interactions/region-selector.js", "static/atlas/interactions/combinatorics-viewer.js", "static/atlas/interactions/data-lab.js", "static/atlas/interactions/simulation-lab.js", "static/atlas/interactions/algebra-lab.js", "static/atlas/interactions/number-line-lab.js", "static/atlas/interactions/algorithm-lab.js", "static/atlas/math/set-regions.js", "static/atlas/math/set-relations.js", "static/atlas/math/event-regions.js", "static/atlas/math/conditional-probability.js", "static/atlas/math/combinatorics.js", "static/atlas/math/statistics.js", "static/atlas/math/probability.js", "static/atlas/math/hypothesis-test.js", "static/atlas/math/algebra.js", "static/atlas/math/number-line.js", "static/atlas/math/sample-space.js", "static/atlas/math/number-theory.js"].map(read).join("\n");

let contents = [];
try {
  contents = JSON.parse(dataText);
} catch (error) {
  errors.push(`content data is not valid JSON: ${error.message}`);
}

let practiceProblems = [];
try {
  practiceProblems = JSON.parse(practiceDataText);
} catch (error) {
  errors.push(`practice problem data is not valid JSON: ${error.message}`);
}

requireCondition(Array.isArray(contents), "content data must be an array");
requireCondition(Array.isArray(practiceProblems), "practice problem data must be an array");
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
const engineSources = { functionGraph: `${functionGraphSource}\n${functionScenesSource}`, rangeGraph: rangeGraphSource, geometryBoard: `${geometrySource}\n${geometryScenesSource}`, regionSelector: regionSource, combinatoricsViewer: combinatoricsViewerSource, dataLab: dataLabSource, simulationLab: simulationLabSource, algebraLab: algebraLabSource, numberLineLab: numberLineLabSource, algorithmLab: algorithmLabSource, sequenceLab: sequenceLabSource };

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
    requireCondition(Boolean(engineSources[content.interaction?.engine]), `${content.id} uses an unknown engine`);
    if (engineSources[content.interaction?.engine]) requireCondition(engineSources[content.interaction.engine].includes(content.interaction.mode), `${content.id} mode is not supported by ${content.interaction.engine}`);
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
[
  "expansion-area", "factorization-reverse", "perfect-square-build", "sqrt-numberline", "absolute-distance",
  "inequality-numberline", "circular-permutations", "sample-space-grid", "euclidean-algorithm"
].forEach((id) => requireCondition(ids.has(id), `missing Phase 4A content: ${id}`));
[
  ["completing-square", "math1", "quadratic", "algebraLab", "completing-square", "build"],
  ["three-point-parabola", "math1", "quadratic", "functionGraph", "three-point-parabola", "drag"],
  ["quadratic-inequality", "math1", "quadratic", "functionGraph", "quadratic-inequality", "select"],
  ["parameter-intersections", "math1", "quadratic", "functionGraph", "parameter-intersections", "slider"],
  ["right-triangle-trig", "math1", "trigonometry", "geometryBoard", "right-triangle-trig", "geometry"],
  ["trig-relations", "math1", "trigonometry", "geometryBoard", "trig-relations", "geometry"]
].forEach(([id, subject, unit, engine, mode, interactionType]) => {
  const content = contents.find((item) => item.id === id);
  requireCondition(Boolean(content), `missing Phase 4B/5A content: ${id}`);
  if (!content) return;
  requireCondition(content.subject === subject && content.unit === unit, `${id} subject or unit is incorrect`);
  requireCondition(content.interaction.engine === engine && content.interaction.mode === mode, `${id} engine or mode is incorrect`);
  requireCondition(content.interactionType === interactionType, `${id} interactionType is incorrect`);
});
requireCondition(contents.length === 89, "Phase 7B must provide 89 contents");
requireCondition(new Set(contents.map((content) => content.interaction.engine)).size === 11, "Phase 7B must provide 11 interaction engines");
requireCondition(new Set(contents.map((content) => content.subject)).size === 4, "Phase 7A must provide 4 subjects");
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
requireCondition(/static\/tokens\.css/.test(html) && /practice\.html/.test(practiceHtml) && /static\/practice\/main\.js/.test(practiceHtml), "Phase 5B entry pages are incomplete");
requireCondition(tokenSource.includes("--atlas-bg") && tokenSource.includes("--atlas-text"), "shared design tokens are missing");
requireCondition(css.includes("--atlas-bg"), "atlas CSS variables are not namespaced");
requireCondition(css.includes("atlas-data-") && css.includes("atlas-simulation-"), "DataLab and SimulationLab CSS is missing");
requireCondition(practiceCss.includes("practice-") && practiceCss.includes("min-height: 44px"), "Practice CSS or native control sizing is missing");
requireCondition(registrySource.includes("Unknown interaction engine"), "registry does not handle unknown engines");
requireCondition(registrySource.includes("assertEngineContract") && registrySource.includes("getState") && registrySource.includes("setParameter"), "interaction engine lifecycle contract is incomplete");
requireCondition(registrySource.includes("geometryBoard") && registrySource.includes("geometry-board.js"), "registry does not register geometryBoard");
requireCondition(registrySource.includes("regionSelector") && registrySource.includes("region-selector.js"), "registry does not register regionSelector");
requireCondition(geometrySource.includes("mountGeometryBoard"), "geometry board mount function is missing");
requireCondition(`${geometrySource}\n${geometryScenesSource}`.includes("keepAspectRatio: true"), "geometry board does not preserve aspect ratio");
[
  "unit-circle", "triangle-area-sine", "sine-law-circumcircle", "cosine-law", "triangle-centers",
  "angle-bisector-ratio", "inscribed-angle", "power-of-point", "right-triangle-trig", "trig-relations",
  "radian-measure", "trig-addition-formula", "double-angle", "circle-equation", "circle-line-intersections",
  "section-formula", "line-equation", "line-relations", "locus-distance-ratio", "inequality-region"
].forEach((mode) => requireCondition(geometryScenesSource.includes(`"${mode}"`), `geometry mode dispatch is missing ${mode}`));
requireCondition(geometryScenesSource.includes("state.area") && geometryScenesSource.includes("sin") && geometryScenesSource.includes("selected"), "geometry scene calculations are incomplete");
requireCondition(geometryScenesSource.includes("centroid") && geometryScenesSource.includes("Math.max(-2.5") && geometryScenesSource.includes("Math.max(0.5"), "triangle centers reset or drag bounds are incomplete");
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
requireCondition(combinatoricsViewerSource.includes("COMBINATORICS_MODES") && combinatoricsViewerSource.includes('"tree-count": mountTreeCount') && combinatoricsViewerSource.includes("permutations: mountPermutations") && combinatoricsViewerSource.includes("combinations: mountCombinations") && combinatoricsViewerSource.includes('"circular-permutations"') && combinatoricsViewerSource.includes('"sample-space-grid"'), "combinatorics viewer mode dispatch is incomplete");
requireCondition(combinatoricsViewerSource.includes("config.data?.stages") && !combinatoricsViewerSource.includes("TREE_STAGES"), "counting tree stages must come from content data");
requireCondition(dataLabSource.includes("DATA_LAB_MODES") && dataLabSource.includes("mountMeanMedianScene") && dataLabSource.includes("mountVarianceScene") && dataLabSource.includes("mountBoxplotScene") && dataLabSource.includes("mountCorrelationScene") && dataLabSource.includes("mountRandomVariableScene") && dataLabSource.includes("mountDistributionMeanVarianceScene") && dataLabSource.includes("mountNormalDistributionScene") && dataLabSource.includes("mountStandardNormalizationScene") && dataLabSource.includes("mountModelingCycleScene") && dataLabSource.includes("mountModelComparisonScene"), "data lab mode dispatch is incomplete");
requireCondition(simulationLabSource.includes("mountSimulationLab") && simulationLabSource.includes('"hypothesis-coin"') && simulationLabSource.includes('"independent-trials"') && simulationLabSource.includes('"population-sample"') && simulationLabSource.includes('"binomial-distribution"') && simulationLabSource.includes('"sampling-mean"') && simulationLabSource.includes('"confidence-interval"') && simulationLabSource.includes('"normal-hypothesis-test"') && simulationLabSource.includes("Math.random"), "simulation lab implementation is incomplete");
requireCondition(!simulationLabSource.includes("atlas-simulation-five-percent"), "hypothesis chart must not draw a 5% height line");
requireCondition(simulationLabSource.includes("config.initial?.n") && simulationLabSource.includes("config.initial?.p") && simulationLabSource.includes("config.initial?.k") && simulationLabSource.includes("config.parameters"), "independent trials must be data-driven");
requireCondition(algebraLabSource.includes("mountAlgebraLab") && algebraLabSource.includes("expansion-area") && algebraLabSource.includes("factorization-reverse") && algebraLabSource.includes("perfect-square-build") && algebraLabSource.includes("completing-square"), "algebra lab implementation is incomplete");
requireCondition(numberLineLabSource.includes("mountNumberLineLab") && numberLineLabSource.includes("sqrt-location") && numberLineLabSource.includes("absolute-distance") && numberLineLabSource.includes("inequality-ray") && numberLineLabSource.includes("exponent-extension"), "number line lab implementation is incomplete");
requireCondition(algorithmLabSource.includes("mountAlgorithmLab") && algorithmLabSource.includes("euclideanSteps"), "algorithm lab implementation is incomplete");
requireCondition(rangeGraphSource.includes("signed-integral") && rangeGraphSource.includes("signedAreaParts") && rangeGraphSource.includes("definiteIntegral"), "range graph signed-integral mode is incomplete");
requireCondition(sequenceLabSource.includes("SEQUENCE_MODES") && sequenceLabSource.includes("partialSums") && sequenceLabSource.includes("generateRecurrence") && sequenceLabSource.includes("atlas-sequence-table"), "SequenceLab implementation is incomplete");
requireCondition(algebraSource.includes("expandMonicProduct") && algebraSource.includes("perfectSquareCoefficients") && algebraSource.includes("factorPairExpansion") && algebraSource.includes("completeSquare"), "algebra math module is incomplete");
requireCondition(numberLineSource.includes("sqrtBounds") && numberLineSource.includes("absoluteDistance") && numberLineSource.includes("inequalityFacts"), "number line math module is incomplete");
requireCondition(sampleSpaceSource.includes("diceOutcomes") && sampleSpaceSource.includes("outcomesForEvent") && sampleSpaceSource.includes("probabilityForEvent"), "sample space math module is incomplete");
requireCondition(numberTheorySource.includes("gcd") && numberTheorySource.includes("euclideanSteps"), "number theory math module is incomplete");
requireCondition(quadraticSource.includes("quadraticValue") && quadraticSource.includes("quadraticDiscriminant") && quadraticSource.includes("quadraticRoots") && quadraticSource.includes("quadraticVertex") && quadraticSource.includes("quadraticThroughPoints") && quadraticSource.includes("quadraticInequalityIntervals") && quadraticSource.includes("quadraticLineIntersections"), "quadratic math module is incomplete");
requireCondition(quadraticSource.includes("quadraticExpression") && quadraticSource.includes("formatIntervalSet"), "quadratic summary helpers are missing");
requireCondition(trigonometrySource.includes("rightTriangleTrig") && trigonometrySource.includes("trigRelations"), "trigonometry math module is incomplete");
requireCondition(trigonometrySource.includes("degreesToRadians") && trigonometrySource.includes("radiansToDegrees") && trigonometrySource.includes("trigFunctionValue") && trigonometrySource.includes("transformedTrigValue") && trigonometrySource.includes("additionFormulaFacts") && trigonometrySource.includes("doubleAngleFacts"), "Phase 7A trigonometry helpers are incomplete");
requireCondition(exponentialLogarithmSource.includes("exponentialValue") && exponentialLogarithmSource.includes("logarithmValue") && exponentialLogarithmSource.includes("changeOfBase") && exponentialLogarithmSource.includes("solveSimpleExponential") && exponentialLogarithmSource.includes("solveSimpleLogarithm"), "exponential/logarithm math module is incomplete");
requireCondition(calculusSource.includes("polynomialValue") && calculusSource.includes("derivativeCoefficients") && calculusSource.includes("derivativeValue") && calculusSource.includes("secantSlope") && calculusSource.includes("tangentLine") && calculusSource.includes("criticalPoints") && calculusSource.includes("antiderivativeCoefficients") && calculusSource.includes("definiteIntegral") && calculusSource.includes("signedAreaParts"), "calculus math module is incomplete");
requireCondition(sequencesSource.includes("arithmeticTerm") && sequencesSource.includes("arithmeticSum") && sequencesSource.includes("geometricTerm") && sequencesSource.includes("geometricSum") && sequencesSource.includes("partialSums") && sequencesSource.includes("differenceSequence") && sequencesSource.includes("generateRecurrence") && sequencesSource.includes("sigmaSum"), "sequences math module is incomplete");
requireCondition(functionGraphSource.includes("FUNCTION_GRAPH_MODES") && functionScenesSource.includes('"three-point-parabola"') && functionScenesSource.includes('"quadratic-inequality"') && functionScenesSource.includes('"parameter-intersections"') && functionScenesSource.includes('"exponential-base"') && functionScenesSource.includes('"log-inverse"') && functionScenesSource.includes('"logarithm-base"') && functionScenesSource.includes('"exponential-equation"') && functionScenesSource.includes('"trig-function-graphs"') && functionScenesSource.includes('"trig-transform"') && functionScenesSource.includes('"secant-to-tangent"') && functionScenesSource.includes('"derivative-at-point"') && functionScenesSource.includes('"function-and-derivative"') && functionScenesSource.includes('"cubic-extrema"') && functionScenesSource.includes('"indefinite-integral"') && functionScenesSource.includes('"decision-sensitivity"'), "FunctionGraph Phase 7B modes are incomplete");
requireCondition(functionScenesSource.includes("quadraticExpression") && functionScenesSource.includes("formatIntervalSet") && functionScenesSource.includes(" ／ 解："), "quadratic inequality summary format regressed");
requireCondition(functionScenesSource.includes("const xs = [-2, 0, 2]") && functionScenesSource.includes("create(\"glider\"") && functionScenesSource.includes("three-point-parabola"), "three-point parabola drag constraints are missing");
requireCondition(algebra2Source.includes("expandCubic") && algebra2Source.includes("polynomialDivide") && algebra2Source.includes("complexMultiply") && algebra2Source.includes("quadraticRootRelations") && algebra2Source.includes("rationalCancellationFacts"), "algebra2 math module is incomplete");
requireCondition(coordinateGeometrySource.includes("sectionPoint") && coordinateGeometrySource.includes("lineThroughPoints") && coordinateGeometrySource.includes("circleLineIntersections") && coordinateGeometrySource.includes("apolloniusLocus"), "coordinate geometry math module is incomplete");
requireCondition(statisticalInferenceSource.includes("expectedValue") && statisticalInferenceSource.includes("distributionVariance") && statisticalInferenceSource.includes("normalCdf") && statisticalInferenceSource.includes("confidenceIntervalKnownSigma") && statisticalInferenceSource.includes("zTestMean"), "statistical inference math module is incomplete");
requireCondition(samplingSource.includes("sampleWithReplacement") && samplingSource.includes("sampleWithoutReplacement") && samplingSource.includes("simulateSampleMeans"), "sampling math module is incomplete");
requireCondition(modelingSource.includes("leastSquaresLinear") && modelingSource.includes("residuals") && modelingSource.includes("rmse") && modelingSource.includes("breakEvenPoint"), "modeling math module is incomplete");
requireCondition(curriculumSource.includes("orderedContentIds") && curriculumSource.includes("neighborsForContent") && curriculumSource.includes("SUBJECT_META") && curriculumSource.includes("UNIT_META") && curriculumSource.includes("subjectLabel") && curriculumSource.includes("unitLabel"), "curriculum metadata module is incomplete");
requireCondition(registrySource.includes("combinatoricsViewer") && registrySource.includes("combinatorics-viewer.js"), "registry does not register combinatoricsViewer");
requireCondition(registrySource.includes("dataLab") && registrySource.includes("data-lab.js"), "registry does not register dataLab");
requireCondition(registrySource.includes("simulationLab") && registrySource.includes("simulation-lab.js"), "registry does not register simulationLab");
requireCondition(registrySource.includes("algebraLab") && registrySource.includes("algebra-lab.js"), "registry does not register algebraLab");
requireCondition(registrySource.includes("numberLineLab") && registrySource.includes("number-line-lab.js"), "registry does not register numberLineLab");
requireCondition(registrySource.includes("algorithmLab") && registrySource.includes("algorithm-lab.js"), "registry does not register algorithmLab");
requireCondition(registrySource.includes("sequenceLab") && registrySource.includes("sequence-lab.js"), "registry does not register sequenceLab");
requireCondition(curriculumSource.includes('"math1", "mathA"') && curriculumSource.includes('"event-regions"') && curriculumSource.includes('"mean-median-outlier"') && curriculumSource.includes('"expansion-area"') && curriculumSource.includes('"euclidean-algorithm"'), "curriculum metadata order is incomplete");
requireCondition(catalogSource.includes("教材を検索") || catalogSource.includes("searchMatch"), "catalog search is missing");
requireCondition(routerSource.includes('params.get("q")') && routerSource.includes('params.get("type")') && routerSource.includes("replaceCatalogFilters"), "catalog filter URL state is incomplete");
requireCondition(routerSource.includes('params.get("progress")') && routerSource.includes("fromProblem") && routerSource.includes("fromCatalog"), "atlas learning-loop route state is incomplete");
requireCondition(catalogSource.includes("unvisited") && catalogSource.includes("favorites") && catalogSource.includes("visited") && catalogSource.includes("onToggleFavorite") && catalogSource.includes("閲覧済み"), "atlas progress and favorite filters are incomplete");
requireCondition(catalogSource.includes("availableUnits") && catalogSource.includes("subjectSelect"), "atlas dependent unit filter is missing");
requireCondition(viewerSource.includes("neighborsForContent") && viewerSource.includes("atlas-learning-navigation"), "viewer previous/next navigation is missing");
requireCondition(viewerSource.includes("aria-pressed") && viewerSource.includes("atlas-practice-links") && viewerSource.includes("practice.html") && viewerSource.includes("fromProblem"), "atlas viewer learning-loop links are incomplete");
requireCondition(storageSource.includes("math-interactive-atlas-state-v1") && storageSource.includes("LEARNING_STATE_VERSION = 2") && storageSource.includes("loadLearningState") && storageSource.includes("saveLearningState") && storageSource.includes("toggleFavorite") && storageSource.includes("recordVisit") && storageSource.includes("recordPracticeAttempt") && storageSource.includes("correctStreak") && storageSource.includes("masteredAt"), "learning state storage API is incomplete");
requireCondition(practiceMainSource.includes("validateProblemData") && practiceMainSource.includes("recordPracticeAttempt") && practiceMainSource.includes("problem-data.json"), "Practice main flow is incomplete");
requireCondition(practiceRouterSource.includes("goToProblem") && practiceRouterSource.includes("mode") && practiceRouterSource.includes("replaceCatalogFilters"), "Practice route state is incomplete");
requireCondition(practiceRouterSource.includes("atlasContentId"), "Practice route must preserve the Atlas content id");
requireCondition(practiceCatalogSource.includes("status") && practiceCatalogSource.includes("renderUnitOptions") && practiceCatalogSource.includes("未挑戦") && practiceCatalogSource.includes("練習中") && practiceCatalogSource.includes("要復習") && practiceCatalogSource.includes("習得"), "Practice catalog filters or status display is incomplete");
requireCondition(practiceRunnerSource.includes("もう一度確認してみよう") && practiceRunnerSource.includes("practice-atlas-link") && practiceRunnerSource.includes("practice-retry-button") && practiceRunnerSource.includes("fromProblem") && practiceRunnerSource.includes("次の問題") && practiceRunnerSource.includes("aria-live"), "Practice runner feedback flow is incomplete");
requireCondition(practiceAnswerSource.includes("parseNumericResponse") && practiceAnswerSource.includes("evaluateAnswer") && practiceAnswerSource.includes("checkSingleChoice") && practiceAnswerSource.includes("checkNumeric") && practiceAnswerSource.includes("checkAnswer"), "Practice answer checker is incomplete");
requireCondition(practiceValidationSource.includes("validateProblem") && practiceValidationSource.includes("validateProblemData") && practiceValidationSource.includes("single-choice") && practiceValidationSource.includes("numeric"), "Practice data validation is incomplete");
requireCondition(practiceFilterSource.includes("problemMatches") && practiceFilterSource.includes("statusForProblem") && practiceFilterSource.includes("searchMatch"), "Practice filter pure logic is incomplete");
requireCondition(practiceSessionSource.includes("buildSession") && practiceSessionSource.includes("buildExplicitSession") && practiceSessionSource.includes("nextProblem") && practiceSessionSource.includes("sessionPosition"), "Practice session pure logic is incomplete");
requireCondition(setsSource.includes("problemBank") && setsSource.includes("saveCurrentSet") && setsHtml.includes("Share Link") && setsHtml.includes("セットをJSONで保存"), "Problem set builder flow is incomplete");
requireCondition(setModelSource.includes("createProblemSet") && setModelSource.includes("addProblem") && setModelSource.includes("removeProblem") && setModelSource.includes("moveProblem") && setModelSource.includes("normalizeProblemSet"), "Problem set model is incomplete");
requireCondition(setStorageSource.includes("math-interactive-atlas-problem-sets-v1") && setStorageSource.includes("MAX_SAVED_SETS") && setStorageSource.includes("loadProblemSets") && setStorageSource.includes("duplicateProblemSet"), "Problem set storage is incomplete");
requireCondition(setIoSource.includes("math-interactive-atlas-problem-set") && setIoSource.includes("parseProblemSetImport") && setIoSource.includes("problemSetUrls"), "Problem set import/export is incomplete");
requireCondition(worksheetSource.includes("buildWorksheetModel") && worksheetSource.includes("answers") && worksheetSource.includes("katex"), "Worksheet rendering is incomplete");
requireCondition(worksheetModelSource.includes("MAX_WORKSHEET_PROBLEMS") && worksheetModelSource.includes("unknownIds"), "Worksheet model is incomplete");
requireCondition(progressSummarySource.includes("summarizeLearning") && progressSummarySource.includes("practiceStatus") && progressSummarySource.includes("recentActivity"), "Progress summary is incomplete");
requireCondition(progressSource.includes("学習記録をバックアップ") && progressSource.includes("replaceLearningRecord") && progressSource.includes("progressContents") && progressSource.includes("要復習"), "Progress report flow is incomplete");
requireCondition(progressSource.includes("progress-content-practice") && progressSource.includes("図鑑を開く"), "Progress review links are incomplete");
requireCondition(progressRecordSource.includes("math-interactive-atlas-learning-record") && progressRecordSource.includes("LEARNING_RECORD_VERSION = 2") && progressRecordSource.includes("normalizeState"), "Learning record schema is incomplete");
requireCondition(practiceProblems.length === contents.length * 3 && new Set(practiceProblems.map((problem) => problem.unit)).size === 15 && new Set(practiceProblems.map((problem) => problem.subject)).size === 4, "Practice must provide three problems per content across 15 units and 4 subjects");
requireCondition(contents.length === 89, "Phase 8A content freeze requires exactly 89 contents");
requireCondition(practiceProblems.length === 267, "Phase 8A content freeze requires exactly 267 practice problems");
requireCondition(new Set(contents.map((content) => content.interaction?.engine)).size === 11, "Phase 8A engine freeze requires exactly 11 interaction engines");
requireCondition(samplingSource.includes("sampleStandardNormal") && samplingSource.includes("sampleNormal") && samplingSource.includes("sampleMeanFromNormalPopulation") && samplingSource.includes("simulateKnownSigmaConfidenceIntervals"), "Phase 8A normal sampling helpers are missing");
requireCondition(simulationLabSource.includes("drawNormalTestChart") && simulationLabSource.includes("標準正規分布") && simulationLabSource.includes("100区間を作る"), "Phase 8A statistical simulation UI is incomplete");
requireCondition(geometryScenesSource.includes("判定する点P") && geometryScenesSource.includes("円周上の点P") && geometryScenesSource.includes("aria-pressed"), "Phase 8A geometry direct manipulation is incomplete");
requireCondition(algebraLabSource.includes("formatBinomial") && algebraLabSource.includes("role: \"img\"") && algebraLabSource.includes("aria-label"), "Phase 8A algebra accessibility helpers are missing");
requireCondition(routerSource.includes('subject: params.get("subject") || null'), "catalog route must show all subjects when subject is omitted");
requireCondition(workflowSource.includes("node-version: 22"), "GitHub Actions must use Node.js 22");
requireCondition(workflowSource.includes("node scripts/check-atlas-contract.js") && workflowSource.includes("node scripts/check-set-regions.js") && workflowSource.includes("node scripts/check-set-relations.js") && workflowSource.includes("node scripts/check-event-regions.js") && workflowSource.includes("node scripts/check-conditional-probability.js") && workflowSource.includes("node scripts/check-combinatorics.js") && workflowSource.includes("node scripts/check-statistics.js") && workflowSource.includes("node scripts/check-probability.js") && workflowSource.includes("node scripts/check-hypothesis-test.js") && workflowSource.includes("node scripts/check-geometry.js") && workflowSource.includes("node scripts/check-algebra.js") && workflowSource.includes("node scripts/check-number-line.js") && workflowSource.includes("node scripts/check-sample-space.js") && workflowSource.includes("node scripts/check-number-theory.js") && workflowSource.includes("node scripts/check-quadratic.js") && workflowSource.includes("node scripts/check-trigonometry.js") && workflowSource.includes("node scripts/check-curriculum.js") && workflowSource.includes("node scripts/check-related-content.js") && workflowSource.includes("node scripts/check-practice-data.js") && workflowSource.includes("node scripts/check-practice-answer.js") && workflowSource.includes("node scripts/check-practice-links.js") && workflowSource.includes("node scripts/check-practice-coverage.js") && workflowSource.includes("node scripts/check-practice-quality.js") && workflowSource.includes("node scripts/check-practice-session.js") && workflowSource.includes("node scripts/check-learning-state.js") && workflowSource.includes("node scripts/check-problem-set.js") && workflowSource.includes("node scripts/check-set-storage.js") && workflowSource.includes("node scripts/check-worksheet.js") && workflowSource.includes("node scripts/check-progress-summary.js") && workflowSource.includes("node scripts/check-learning-record.js") && workflowSource.includes("node scripts/check-asset-version.js"), "GitHub Actions check scripts are incomplete");
requireCondition(workflowSource.includes("node scripts/check-js-syntax.js"), "GitHub Actions syntax checks are incomplete");
requireCondition(workflowSource.includes("node scripts/check-exponential-logarithm.js") && workflowSource.includes("node scripts/check-calculus.js") && workflowSource.includes("node scripts/check-sequences.js") && workflowSource.includes("node scripts/check-algebra2.js") && workflowSource.includes("node scripts/check-coordinate-geometry.js") && workflowSource.includes("node scripts/check-statistical-inference.js") && workflowSource.includes("node scripts/check-modeling.js"), "Phase 7B math checks are missing from GitHub Actions");
requireCondition(workflowSource.includes("node scripts/check-js-syntax.js"), "Phase 7B syntax checks are missing from GitHub Actions");
requireCondition(workflowSource.includes("browser-smoke:") && workflowSource.includes("npx playwright install --with-deps chromium") && workflowSource.includes("npm test"), "Browser smoke checks are missing from GitHub Actions");
requireCondition(pagesWorkflowSource.includes("workflow_dispatch:") && !pagesWorkflowSource.includes("  push:") && pagesWorkflowSource.includes("actions/configure-pages@v5") && !pagesWorkflowSource.includes("enablement:") && pagesWorkflowSource.includes("test -f atlas.html") && pagesWorkflowSource.includes("test -f index.html") && pagesWorkflowSource.includes("test -f practice.html") && pagesWorkflowSource.includes("test -f static/tokens.css") && pagesWorkflowSource.includes("test -f static/atlas.css") && pagesWorkflowSource.includes("test -f static/atlas/main.js") && pagesWorkflowSource.includes("test -f static/atlas/content-data.json") && pagesWorkflowSource.includes("test -f static/practice.css") && pagesWorkflowSource.includes("test -f static/practice/main.js") && pagesWorkflowSource.includes("test -f static/practice/problem-data.json") && pagesWorkflowSource.includes("cp static/tokens.css static/atlas.css static/practice.css _site/static/") && pagesWorkflowSource.includes("cp -R static/atlas _site/static/atlas") && pagesWorkflowSource.includes("cp -R static/practice _site/static/practice") && pagesWorkflowSource.includes("touch _site/.nojekyll") && pagesWorkflowSource.includes("actions/upload-pages-artifact@v3") && pagesWorkflowSource.includes("actions/deploy-pages@v4"), "GitHub Pages deploy workflow is incomplete");
requireCondition(pagesWorkflowSource.includes("test -f static/atlas/interactions/sequence-lab.js") && pagesWorkflowSource.includes("test -f static/atlas/math/exponential-logarithm.js") && pagesWorkflowSource.includes("test -f static/atlas/math/calculus.js") && pagesWorkflowSource.includes("test -f static/atlas/math/sequences.js") && pagesWorkflowSource.includes("test -f static/atlas/math/algebra2.js") && pagesWorkflowSource.includes("test -f static/atlas/math/coordinate-geometry.js") && pagesWorkflowSource.includes("test -f static/atlas/math/statistical-inference.js") && pagesWorkflowSource.includes("test -f static/atlas/math/modeling.js") && pagesWorkflowSource.includes("test -f static/atlas/interactions/function-scenes/index.js") && pagesWorkflowSource.includes("test -f static/atlas/interactions/geometry-scenes/index.js"), "Phase 7B Pages assets are missing");
requireCondition(pagesWorkflowSource.includes("Smoke test deployed Pages") && pagesWorkflowSource.includes("curl --fail"), "Pages post-deploy smoke check is missing");
requireCondition(pagesWorkflowSource.includes("PLAYWRIGHT_BASE_URL") && pagesWorkflowSource.includes("tests/e2e/pages-smoke.spec.js") && pagesWorkflowSource.includes("npx playwright install --with-deps chromium"), "Pages browser smoke check is missing");
requireCondition(e2eHelperSource.includes("function appPath") && e2eHelperSource.includes('replace(/^\\/+/, "")'), "E2E base-path helper is missing");
requireCondition(allAtlasE2eSource.includes("readFileSync") && allAtlasE2eSource.includes("for (const content of contents)") && allAtlasE2eSource.includes("test(`${content.id}"), "Atlas regression must create independent data-driven tests");
requireCondition(learningLoopE2eSource.includes("algebra-factor-01") && learningLoopE2eSource.includes("prob-permutation-01") && learningLoopE2eSource.includes("math2-exponent-extension-01") && learningLoopE2eSource.includes("mathB-arithmetic-sequence-01") && learningLoopE2eSource.includes('problem.type === "single-choice"') && learningLoopE2eSource.includes('getByLabel("数値の答え")'), "Learning loop scenario coverage is incomplete");
requireCondition(pagesSmokeE2eSource.includes("EXPECTED_ASSET_VERSION") && pagesSmokeE2eSource.includes("toBe(expectedAssetVersion)"), "Pages smoke must verify the exact asset version");
requireCondition(pagesWorkflowSource.includes("EXPECTED_ASSET_VERSION") && pagesWorkflowSource.includes("tests/e2e/all-atlas-content.spec.js") && pagesWorkflowSource.includes("tests/e2e/learning-loop.spec.js") && pagesWorkflowSource.includes("tests/e2e/responsive.spec.js"), "Pages workflow must run the full public browser gate");
requireCondition(!viewerSource.includes("function-graph.js") && !viewerSource.includes("range-graph.js") && !viewerSource.includes("geometry-board.js") && !viewerSource.includes("region-selector.js") && !viewerSource.includes("combinatorics-viewer.js") && !viewerSource.includes("data-lab.js") && !viewerSource.includes("simulation-lab.js"), "viewer imports a concrete interaction engine");
requireCondition(!/currentExamKey|app\.progress|answerDrafts|examFlow|MINI_EXAMS/.test(atlasSource), "atlas source references existing practice or exam state");
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

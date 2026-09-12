import {
  combinationCount,
  enumerateCombinations,
  enumeratePermutations,
  factorial,
  permutationCount,
  treePaths
} from "../math/combinatorics.js?v=20260912-3a";

const SVG_NS = "http://www.w3.org/2000/svg";
const DISPLAY_LIMIT = 240;
let viewerSequence = 0;

const TREE_STAGES = Object.freeze([
  Object.freeze(["A", "B", "C"]),
  Object.freeze(["1", "2"])
]);

const COMBINATORICS_VIEWS = Object.freeze({
  ORDERED: "ordered",
  GROUPED: "grouped"
});

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function createLayout(container, { controlsLabel, resultLabel, rootClass = "" }) {
  container.replaceChildren();
  container.classList.add("atlas-combinatorics-canvas");
  const root = document.createElement("div");
  root.className = `atlas-combinatorics-viewer${rootClass ? ` ${rootClass}` : ""}`;
  const diagram = document.createElement("div");
  diagram.className = "atlas-combinatorics-diagram";
  const controls = document.createElement("div");
  controls.className = "atlas-combinatorics-controls";
  controls.setAttribute("aria-label", controlsLabel);
  const result = document.createElement("section");
  result.className = "atlas-combinatorics-result";
  result.setAttribute("aria-live", "polite");
  const heading = document.createElement("p");
  heading.className = "atlas-combinatorics-result-label";
  heading.textContent = resultLabel;
  result.append(heading);
  root.append(diagram, controls, result);
  container.append(root);
  return { root, diagram, controls, result };
}

function renderFormula(target, latex, fallback) {
  target.replaceChildren();
  target.setAttribute("aria-label", fallback);
  if (window.katex?.render && latex) {
    try {
      window.katex.render(latex, target, { displayMode: true, throwOnError: false });
      return;
    } catch {
      // Keep the plain formula when KaTeX is unavailable or cannot render it.
    }
  }
  target.textContent = fallback;
}

function createButton({ label, className = "", ariaLabel = label, onActivate }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", ariaLabel);
  button.textContent = label;
  const listener = () => onActivate();
  button.addEventListener("click", listener);
  return { button, cleanup: () => button.removeEventListener("click", listener) };
}

function createSelect({ label, value, options, onChange }) {
  const wrapper = document.createElement("label");
  wrapper.className = "atlas-combinatorics-select-control";
  const labelText = document.createElement("span");
  labelText.textContent = label;
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = String(option.value);
    element.textContent = option.label ?? String(option.value);
    select.append(element);
  });
  select.value = String(value);
  const listener = () => onChange(select.value);
  select.addEventListener("change", listener);
  wrapper.append(labelText, select);
  return { wrapper, select, cleanup: () => select.removeEventListener("change", listener) };
}

function cleanupScene(container, cleanup) {
  cleanup.forEach((remove) => remove());
  container.replaceChildren();
  container.classList.remove("atlas-combinatorics-canvas");
}

function createTreeSvg(container, instanceId) {
  const svg = svgElement("svg", {
    class: "atlas-combinatorics-svg atlas-tree-svg",
    viewBox: "0 0 500 340",
    role: "img",
    "aria-label": "A・B・Cから1・2を選ぶ樹形図"
  });
  svg.append(svgElement("rect", { class: "atlas-combinatorics-panel", x: 12, y: 12, width: 476, height: 316, rx: 14 }));
  const start = { x: 52, y: 170 };
  const firstNodes = [
    { label: "A", x: 190, y: 70 },
    { label: "B", x: 190, y: 170 },
    { label: "C", x: 190, y: 270 }
  ];
  const secondNodes = [
    { label: "1", x: 370, y: 42, parent: 0 },
    { label: "2", x: 370, y: 88, parent: 0 },
    { label: "1", x: 370, y: 142, parent: 1 },
    { label: "2", x: 370, y: 188, parent: 1 },
    { label: "1", x: 370, y: 242, parent: 2 },
    { label: "2", x: 370, y: 288, parent: 2 }
  ];
  const firstElements = [];
  const secondElements = [];
  const startGroup = svgElement("g", { class: "atlas-tree-node atlas-tree-start" });
  startGroup.append(svgElement("circle", { cx: start.x, cy: start.y, r: 22 }), svgElement("text", { x: start.x, y: start.y + 6 }));
  startGroup.children[1].textContent = "Start";
  svg.append(startGroup);

  firstNodes.forEach((node) => {
    const line = svgElement("line", { class: "atlas-tree-branch atlas-tree-first-branch", x1: start.x + 22, y1: start.y, x2: node.x - 22, y2: node.y });
    const group = svgElement("g", { class: "atlas-tree-node atlas-tree-first-node" });
    group.append(svgElement("circle", { cx: node.x, cy: node.y, r: 22 }), svgElement("text", { x: node.x, y: node.y + 6 }));
    group.children[1].textContent = node.label;
    svg.append(line, group);
    firstElements.push({ line, group });
  });

  secondNodes.forEach((node) => {
    const parent = firstNodes[node.parent];
    const line = svgElement("line", { class: "atlas-tree-branch atlas-tree-second-branch", x1: parent.x + 22, y1: parent.y, x2: node.x - 22, y2: node.y });
    const group = svgElement("g", { class: "atlas-tree-node atlas-tree-second-node" });
    group.append(svgElement("circle", { cx: node.x, cy: node.y, r: 18 }), svgElement("text", { x: node.x, y: node.y + 5 }));
    group.children[1].textContent = node.label;
    svg.append(line, group);
    secondElements.push({ line, group });
  });
  container.append(svg);
  return { svg, firstElements, secondElements };
}

function mountTreeCount(container, config = {}) {
  const initialDepth = [1, 2, 3].includes(Number(config.initial?.visibleDepth)) ? Number(config.initial.visibleDepth) : 2;
  let visibleDepth = initialDepth;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "樹形図の表示段階",
    resultLabel: "選び方の数",
    rootClass: "atlas-tree-count-viewer"
  });
  const tree = createTreeSvg(diagram, `atlas-tree-${viewerSequence += 1}`);
  const controlsRow = document.createElement("div");
  controlsRow.className = "atlas-combinatorics-control-row";
  const stepButtons = new Map();
  const cleanup = [];
  [
    [1, "第1段階"],
    [2, "第2段階"],
    [3, "すべて表示"]
  ].forEach(([depth, label]) => {
    const { button, cleanup: removeListener } = createButton({
      label,
      className: "atlas-combinatorics-step-button",
      ariaLabel: `${label}を表示`,
      onActivate: () => setDepth(depth)
    });
    button.setAttribute("aria-pressed", "false");
    controlsRow.append(button);
    stepButtons.set(depth, button);
    cleanup.push(removeListener);
  });
  controls.append(controlsRow);

  const formula = document.createElement("div");
  formula.className = "atlas-combinatorics-formula";
  const summary = document.createElement("p");
  summary.className = "atlas-combinatorics-summary";
  const paths = document.createElement("div");
  paths.className = "atlas-tree-paths";
  result.append(formula, summary, paths);
  const allPaths = treePaths(TREE_STAGES);

  function setDepth(depth) {
    if (destroyed || ![1, 2, 3].includes(depth)) return;
    visibleDepth = depth;
    tree.firstElements.forEach(({ line, group }) => {
      line.style.display = "";
      group.style.display = "";
    });
    tree.secondElements.forEach(({ line, group }) => {
      line.style.display = visibleDepth >= 2 ? "" : "none";
      group.style.display = visibleDepth >= 2 ? "" : "none";
    });
    stepButtons.forEach((button, value) => {
      button.setAttribute("aria-pressed", String(value === visibleDepth));
      button.classList.toggle("is-selected", value === visibleDepth);
    });
    if (visibleDepth === 1) {
      renderFormula(formula, "3", "3");
      summary.textContent = "1段階目：3通りの選び方";
    } else {
      renderFormula(formula, "3\\times 2=6", "3 × 2 = 6");
      summary.textContent = visibleDepth === 3 ? "3 × 2 = 6通り（すべての経路）" : "3 × 2 = 6通り";
    }
    paths.replaceChildren();
    if (visibleDepth === 3) {
      allPaths.forEach((path) => {
        const chip = document.createElement("span");
        chip.className = "atlas-combinatorics-chip";
        chip.textContent = path.join("");
        paths.append(chip);
      });
    }
    config.onStateChange?.({ visibleDepth }, summary.textContent);
  }

  function reset() {
    setDepth(initialDepth);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "visibleDepth") setDepth(Number(value));
  }

  setDepth(initialDepth);
  return { reset, destroy, getState: () => ({ visibleDepth }), setParameter };
}

function itemsForSize(n) {
  return Array.from({ length: n }, (_, index) => String.fromCharCode(65 + index));
}

function mountPermutations(container, config = {}) {
  const initialN = [3, 4, 5].includes(Number(config.initial?.n)) ? Number(config.initial.n) : 4;
  let n = initialN;
  let highlightStart = false;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "順列の表示設定",
    resultLabel: "順列の数",
    rootClass: "atlas-permutations-viewer"
  });
  const controlsRow = document.createElement("div");
  controlsRow.className = "atlas-combinatorics-control-row";
  const nControl = createSelect({
    label: "文字数 n",
    value: n,
    options: [3, 4, 5].map((value) => ({ value, label: String(value) })),
    onChange: (value) => setN(Number(value))
  });
  controlsRow.append(nControl.wrapper);
  const highlight = createButton({
    label: "Aで始まるものを強調",
    className: "atlas-combinatorics-highlight-button",
    onActivate: () => setHighlight(!highlightStart)
  });
  highlight.button.setAttribute("aria-pressed", "false");
  controlsRow.append(highlight.button);
  controls.append(controlsRow);

  const formula = document.createElement("div");
  formula.className = "atlas-combinatorics-formula";
  const summary = document.createElement("p");
  summary.className = "atlas-combinatorics-summary";
  const list = document.createElement("div");
  list.className = "atlas-combinatorics-chip-grid";
  const countNote = document.createElement("p");
  countNote.className = "atlas-combinatorics-note";
  result.append(formula, summary);
  diagram.append(list, countNote);
  const cleanup = [nControl.cleanup, highlight.cleanup];

  function render() {
    const items = itemsForSize(n);
    const permutations = enumeratePermutations(items);
    const count = factorial(n);
    const chain = items.map((_, index) => n - index).join(" × ");
    renderFormula(formula, `${n}!=${chain}=${count}`, `${n}! = ${chain} = ${count}`);
    list.replaceChildren();
    permutations.forEach((permutation) => {
      const chip = document.createElement("span");
      chip.className = "atlas-combinatorics-chip";
      if (highlightStart && permutation[0] === "A") chip.classList.add("is-highlighted");
      chip.textContent = permutation.join("");
      chip.setAttribute("aria-label", `順列 ${permutation.join("")}`);
      list.append(chip);
    });
    countNote.textContent = `${count}個の順列を表示`;
    summary.textContent = highlightStart
      ? `Aで始まる順列：${factorial(n - 1)}個（${n - 1}!）`
      : `${n}! = ${count}通り`;
    highlight.button.setAttribute("aria-pressed", String(highlightStart));
    highlight.button.classList.toggle("is-selected", highlightStart);
    config.onStateChange?.({ n, highlightStart }, summary.textContent);
  }

  function setN(nextN) {
    if (destroyed || ![3, 4, 5].includes(nextN)) return;
    n = nextN;
    nControl.select.value = String(n);
    render();
  }

  function setHighlight(value) {
    if (destroyed) return;
    highlightStart = Boolean(value);
    render();
  }

  function reset() {
    n = initialN;
    highlightStart = false;
    nControl.select.value = String(n);
    render();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "n") setN(Number(value));
    if (name === "highlightStart") setHighlight(value);
  }

  render();
  return { reset, destroy, getState: () => ({ n, highlightStart }), setParameter };
}

function mountCombinations(container, config = {}) {
  const initialN = Number.isInteger(Number(config.initial?.n)) && Number(config.initial.n) >= 3 && Number(config.initial.n) <= 8 ? Number(config.initial.n) : 5;
  const requestedR = Number(config.initial?.r);
  const initialR = Number.isInteger(requestedR) && requestedR >= 1 && requestedR <= Math.min(4, initialN) ? requestedR : Math.min(2, initialN);
  const initialView = [COMBINATORICS_VIEWS.ORDERED, COMBINATORICS_VIEWS.GROUPED].includes(config.initial?.view) ? config.initial.view : COMBINATORICS_VIEWS.ORDERED;
  let n = initialN;
  let r = initialR;
  let view = initialView;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "組合せの表示設定",
    resultLabel: "順列から組合せへ",
    rootClass: "atlas-combinations-viewer"
  });
  const controlsRow = document.createElement("div");
  controlsRow.className = "atlas-combinatorics-control-row atlas-combinations-control-row";
  const nControl = createSelect({
    label: "全体 n",
    value: n,
    options: Array.from({ length: 6 }, (_, index) => ({ value: index + 3, label: String(index + 3) })),
    onChange: (value) => setN(Number(value))
  });
  const rControl = createSelect({
    label: "選ぶ数 r",
    value: r,
    options: [],
    onChange: (value) => setR(Number(value))
  });
  controlsRow.append(nControl.wrapper, rControl.wrapper);
  const viewButtons = new Map();
  [
    [COMBINATORICS_VIEWS.ORDERED, "順序を区別"],
    [COMBINATORICS_VIEWS.GROUPED, "順序を無視"]
  ].forEach(([value, label]) => {
    const { button, cleanup: removeListener } = createButton({
      label,
      className: "atlas-combinatorics-view-button",
      ariaLabel: `${label}で表示`,
      onActivate: () => setView(value)
    });
    button.setAttribute("aria-pressed", "false");
    controlsRow.append(button);
    viewButtons.set(value, button);
    viewButtons.set(`${value}:cleanup`, removeListener);
  });
  controls.append(controlsRow);

  const formulas = document.createElement("div");
  formulas.className = "atlas-combinatorics-formulas";
  const formulaP = document.createElement("div");
  const formulaDivide = document.createElement("div");
  const formulaC = document.createElement("div");
  formulas.append(formulaP, formulaDivide, formulaC);
  const summary = document.createElement("p");
  summary.className = "atlas-combinatorics-summary";
  const list = document.createElement("div");
  list.className = "atlas-combination-list";
  const note = document.createElement("p");
  note.className = "atlas-combinatorics-note";
  result.append(formulas, summary);
  diagram.append(list, note);
  const cleanup = [nControl.cleanup, rControl.cleanup, viewButtons.get(`${COMBINATORICS_VIEWS.ORDERED}:cleanup`), viewButtons.get(`${COMBINATORICS_VIEWS.GROUPED}:cleanup`)];

  function updateROptions() {
    const maxR = Math.min(4, n);
    rControl.select.replaceChildren();
    for (let value = 1; value <= maxR; value += 1) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = String(value);
      rControl.select.append(option);
    }
    rControl.select.value = String(r);
  }

  function render() {
    updateROptions();
    const items = itemsForSize(n);
    const pCount = permutationCount(n, r);
    const cCount = combinationCount(n, r);
    renderFormula(formulaP, `${n}P${r}=${pCount}`, `${n}P${r} = ${pCount}`);
    renderFormula(formulaDivide, `${pCount}\\div ${r}!=${cCount}`, `${pCount} ÷ ${r}! = ${cCount}`);
    renderFormula(formulaC, `${n}C${r}=${cCount}`, `${n}C${r} = ${cCount}`);
    viewButtons.forEach((button, value) => {
      if (value.includes(":")) return;
      const active = value === view;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-selected", active);
    });
    list.replaceChildren();
    note.textContent = "";
    const combinations = enumerateCombinations(items, r);
    if (view === COMBINATORICS_VIEWS.ORDERED) {
      const ordered = combinations.flatMap((combination) => enumeratePermutations(combination));
      ordered.slice(0, DISPLAY_LIMIT).forEach((permutation) => {
        const chip = document.createElement("span");
        chip.className = "atlas-combinatorics-chip";
        chip.textContent = permutation.join("");
        list.append(chip);
      });
      if (ordered.length > DISPLAY_LIMIT) note.textContent = `${DISPLAY_LIMIT}件を表示中（全${ordered.length}通り）。`;
      summary.textContent = `${n}P${r} = ${pCount}通り：順序を区別`;
    } else {
      combinations.forEach((combination) => {
        const group = document.createElement("div");
        group.className = "atlas-combination-group";
        const permutations = enumeratePermutations(combination);
        const label = document.createElement("strong");
        label.textContent = permutations.slice(0, 2).map((itemsInPermutation) => itemsInPermutation.join("")).join(" = ");
        const count = document.createElement("small");
        count.textContent = `${r}! = ${permutations.length}通りを同じ組として扱う`;
        group.append(label, count);
        list.append(group);
      });
      summary.textContent = `${n}C${r} = ${cCount}組：順序を無視`;
    }
    config.onStateChange?.({ n, r, view }, `${summary.textContent} ／ ${pCount} ÷ ${r}! = ${cCount}`);
  }

  function setN(nextN) {
    if (destroyed || !Number.isInteger(nextN) || nextN < 3 || nextN > 8) return;
    n = nextN;
    if (r > Math.min(4, n)) r = Math.min(4, n);
    nControl.select.value = String(n);
    render();
  }

  function setR(nextR) {
    if (destroyed || !Number.isInteger(nextR) || nextR < 1 || nextR > Math.min(4, n)) return;
    r = nextR;
    render();
  }

  function setView(nextView) {
    if (destroyed || ![COMBINATORICS_VIEWS.ORDERED, COMBINATORICS_VIEWS.GROUPED].includes(nextView)) return;
    view = nextView;
    render();
  }

  function reset() {
    n = initialN;
    r = initialR;
    view = initialView;
    nControl.select.value = String(n);
    render();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "n") setN(Number(value));
    if (name === "r") setR(Number(value));
    if (name === "view") setView(value);
  }

  render();
  return { reset, destroy, getState: () => ({ n, r, view }), setParameter };
}

const COMBINATORICS_MODES = Object.freeze({
  "tree-count": mountTreeCount,
  permutations: mountPermutations,
  combinations: mountCombinations
});

export function mountCombinatoricsViewer(container, config = {}) {
  const mountScene = COMBINATORICS_MODES[config.mode];
  if (!mountScene) throw new Error(`Unsupported combinatorics viewer mode: ${config.mode || "(empty)"}`);
  return mountScene(container, config);
}

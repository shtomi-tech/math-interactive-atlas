import {
  combinationCount,
  enumerateCombinations,
  enumeratePermutations,
  factorial,
  permutationCount,
  treePaths,
  circularPermutationCount,
  rotatePermutation
} from "../math/combinatorics.js?v=20260912-5c";
import { diceOutcomes, outcomesForEvent, probabilityForEvent } from "../math/sample-space.js?v=20260912-5c";

const SVG_NS = "http://www.w3.org/2000/svg";
const DISPLAY_LIMIT = 240;

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

function createTreeSvg(container, stages) {
  const stageData = stages.map((stage) => stage.map((choice) => String(choice)));
  const width = 680;
  const height = Math.max(300, Math.min(520, 100 + Math.max(2, stageData.reduce((total, stage) => total * stage.length, 1)) * 34));
  const stageX = (stageIndex) => 90 + ((width - 170) / Math.max(1, stageData.length)) * (stageIndex + 1);
  const yFor = (index, count) => 40 + ((height - 80) / Math.max(1, count - 1)) * index;
  const svg = svgElement("svg", {
    class: "atlas-combinatorics-svg atlas-tree-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `${stageData.map((stage) => stage.join("・")).join("から選ぶ樹形図")}`
  });
  svg.append(svgElement("rect", { class: "atlas-combinatorics-panel", x: 12, y: 12, width: width - 24, height: height - 24, rx: 14 }));
  const start = { x: 48, y: height / 2 };
  const stageElements = [];
  const startGroup = svgElement("g", { class: "atlas-tree-node atlas-tree-start" });
  startGroup.append(svgElement("circle", { cx: start.x, cy: start.y, r: 22 }), svgElement("text", { x: start.x, y: start.y + 6 }));
  startGroup.children[1].textContent = "Start";
  svg.append(startGroup);

  let parents = [{ x: start.x, y: start.y, path: [] }];
  stageData.forEach((stage, stageIndex) => {
    const lines = [];
    const groups = [];
    const children = [];
    const childCount = parents.length * stage.length;
    parents.forEach((parent) => stage.forEach((choice) => {
      const index = children.length;
      const node = { label: choice, x: stageX(stageIndex), y: yFor(index, childCount), path: [...parent.path, choice] };
      const nodeSize = stageIndex === 0 ? 22 : 18;
      const line = svgElement("line", { class: `atlas-tree-branch atlas-tree-stage-${stageIndex + 1}-branch`, x1: parent.x + nodeSize, y1: parent.y, x2: node.x - nodeSize, y2: node.y });
      const group = svgElement("g", { class: `atlas-tree-node atlas-tree-stage-node atlas-tree-stage-${stageIndex + 1}-node${stageIndex === 0 ? " atlas-tree-first-node" : ""}${stageIndex === 1 ? " atlas-tree-second-node" : ""}`, "data-stage": stageIndex + 1 });
      group.append(svgElement("circle", { cx: node.x, cy: node.y, r: nodeSize }), svgElement("text", { x: node.x, y: node.y + 6 }));
      group.children[1].textContent = node.label;
      svg.append(line, group);
      lines.push(line);
      groups.push(group);
      children.push(node);
    }));
    stageElements.push({ lines, groups });
    parents = children;
  });
  container.append(svg);
  return { svg, stageElements };
}

function mountTreeCount(container, config = {}) {
  const stageCount = Array.isArray(config.data?.stages) && config.data.stages.length > 0 ? config.data.stages.length : 2;
  const initialDepth = Number.isInteger(Number(config.initial?.visibleDepth)) && Number(config.initial.visibleDepth) >= 1 && Number(config.initial.visibleDepth) <= stageCount ? Number(config.initial.visibleDepth) : Math.min(2, stageCount);
  let visibleDepth = initialDepth;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "樹形図の表示段階",
    resultLabel: "選び方の数",
    rootClass: "atlas-tree-count-viewer"
  });
  const stages = Array.isArray(config.data?.stages) && config.data.stages.length > 0
    ? config.data.stages.filter((stage) => Array.isArray(stage) && stage.length > 0)
    : [["A", "B", "C"], ["1", "2"]];
  if (stages.length === 0) throw new TypeError("tree-count requires non-empty data.stages");
  const tree = createTreeSvg(diagram, stages);
  const controlsRow = document.createElement("div");
  controlsRow.className = "atlas-combinatorics-control-row";
  const stepButtons = new Map();
  const cleanup = [];
  [...Array.from({ length: stages.length }, (_, index) => [index + 1, `第${index + 1}段階`]), [stages.length, "すべて表示"]]
    .forEach(([depth, label]) => {
    const { button, cleanup: removeListener } = createButton({
      label,
      className: "atlas-combinatorics-step-button",
      ariaLabel: `${label}を表示`,
      onActivate: () => setDepth(depth)
    });
    button.setAttribute("aria-pressed", "false");
    controlsRow.append(button);
    stepButtons.set(label === "すべて表示" ? "all" : depth, button);
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
  const allPaths = treePaths(stages);
  const stageCounts = stages.map((stage) => stage.length);
  const productText = stageCounts.join(" × ");

  function setDepth(depth) {
    if (destroyed || !Number.isInteger(depth) || depth < 1 || depth > stages.length) return;
    visibleDepth = depth;
    tree.stageElements.forEach(({ lines, groups }, index) => {
      const visible = visibleDepth === stages.length || index < visibleDepth;
      lines.forEach((line) => { line.style.display = visible ? "" : "none"; });
      groups.forEach((group) => { group.style.display = visible ? "" : "none"; });
    });
    stepButtons.forEach((button, value) => {
      const active = value === "all" ? visibleDepth === stages.length : value === visibleDepth;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-selected", active);
    });
    if (visibleDepth === 1) {
      renderFormula(formula, String(stageCounts[0]), String(stageCounts[0]));
      summary.textContent = `1段階目：${stageCounts[0]}通りの選び方`;
    } else {
      renderFormula(formula, `${productText.replaceAll(" × ", "\\times ")}=${allPaths.length}`, `${productText} = ${allPaths.length}`);
      summary.textContent = visibleDepth === stages.length ? `${productText} = ${allPaths.length}通り（すべての経路）` : `${productText} = ${allPaths.length}通り`;
    }
    paths.replaceChildren();
    if (visibleDepth === stages.length) {
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

function mountCircularPermutations(container, config = {}) {
  const { controls, result, diagram } = createLayout(container, { controlsLabel: "円順列の表示設定", resultLabel: "円順列の数", rootClass: "atlas-circular-permutations-viewer" });
  const initialN = Math.min(6, Math.max(3, Number(config.initial?.n ?? 4))); const state = { n: initialN, offset: 0 };
  const row = document.createElement("div"); row.className = "atlas-combinatorics-control-row"; const select = document.createElement("select"); select.setAttribute("aria-label", "円に置く数 n"); [3,4,5,6].forEach((n)=>{const option=document.createElement("option");option.value=n;option.textContent=n;select.append(option);}); select.value=state.n;
  const rotate = document.createElement("button"); rotate.type="button"; rotate.textContent="回転"; rotate.setAttribute("aria-label","円順列を回転する"); row.append(select,rotate); controls.append(row);
  const formula=document.createElement("div");formula.className="atlas-combinatorics-formula";const note=document.createElement("p");note.className="atlas-combinatorics-note";result.append(formula,note);
  function render(){const items=Array.from({length:state.n},(_,index)=>String.fromCharCode(65+index));const rotated=rotatePermutation(items,state.offset);diagram.replaceChildren();const circle=document.createElement("div");circle.className="atlas-circular-circle";rotated.forEach((item,index)=>{const chip=document.createElement("span");chip.className="atlas-circular-item";chip.textContent=item;chip.style.setProperty("--circular-index",index);chip.style.setProperty("--circular-total",state.n);circle.append(chip);});diagram.append(circle);formula.textContent=`${state.n}! ÷ ${state.n} = ${circularPermutationCount(state.n)} = (${state.n}−1)!`;note.textContent=`線形では ${state.n}! 通り。回転した ${items.join("")}・${rotated.join("")} などは、円順列では同じ1グループとして扱います。`;config.onStateChange?.({...state},note.textContent);}
  select.addEventListener("change",()=>{state.n=Number(select.value);state.offset=0;render();});rotate.addEventListener("click",()=>{state.offset=(state.offset+1)%state.n;render();});render();return{reset(){state.n=initialN;state.offset=0;select.value=state.n;render();},destroy(){cleanupScene(container,[()=>select.remove(),()=>rotate.remove()]);},getState:()=>({...state}),setParameter(name,value){if(name==="n"){state.n=Number(value);select.value=state.n;render();}}};
}

function mountSampleSpaceGrid(container, config = {}) {
  const { controls, result, diagram } = createLayout(container, { controlsLabel: "標本空間の事象", resultLabel: "確率", rootClass: "atlas-sample-space-viewer" });
  const events = [["sum-7","和が7"],["sum-8-or-more","和が8以上"],["at-least-one-6","少なくとも一方が6"],["same","同じ目"]]; const state={event:events.some(([value])=>value===config.initial?.event)?config.initial.event:"sum-7"};const select=document.createElement("select");select.setAttribute("aria-label","事象");events.forEach(([value,label])=>{const option=document.createElement("option");option.value=value;option.textContent=label;select.append(option);});select.value=state.event;controls.append(select);const grid=document.createElement("div");grid.className="atlas-sample-space-grid";diagram.append(grid);const summary=document.createElement("p");summary.className="atlas-combinatorics-summary";result.append(summary);
  function render(){const selected=new Set(outcomesForEvent(state.event).map(({first,second})=>`${first}-${second}`));grid.replaceChildren();for(let first=1;first<=6;first+=1)for(let second=1;second<=6;second+=1){const cell=document.createElement("span");cell.className="atlas-sample-space-cell";cell.textContent=`${first},${second}`;cell.classList.toggle("is-selected",selected.has(`${first}-${second}`));cell.setAttribute("aria-label",`(${first},${second})${selected.has(`${first}-${second}`)?" 該当":""}`);grid.append(cell);}const count=selected.size;summary.textContent=`該当：${count}個 ／ 全体：36個 ／ P = ${count}/36 = ${probabilityForEvent(state.event)}`;config.onStateChange?.({...state},summary.textContent);}select.addEventListener("change",()=>{state.event=select.value;render();});render();return{reset(){state.event=config.initial?.event||"sum-7";select.value=state.event;render();},destroy(){container.replaceChildren();},getState:()=>({...state}),setParameter(name,value){if(name==="event"){state.event=value;select.value=value;render();}}};
}

const COMBINATORICS_MODES = Object.freeze({
  "tree-count": mountTreeCount,
  permutations: mountPermutations,
  combinations: mountCombinations,
  "circular-permutations": mountCircularPermutations,
  "sample-space-grid": mountSampleSpaceGrid
});

export function mountCombinatoricsViewer(container, config = {}) {
  const mountScene = COMBINATORICS_MODES[config.mode];
  if (!mountScene) throw new Error(`Unsupported combinatorics viewer mode: ${config.mode || "(empty)"}`);
  return mountScene(container, config);
}

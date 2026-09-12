import { coinTestFacts } from "../math/hypothesis-test.js?v=20260912-3b";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = Object.freeze({
  primary: "#2563eb",
  highlight: "#f59e0b",
  helper: "#64748b",
  construction: "#94a3b8",
  text: "#1f2937",
  border: "#d1d5db"
});

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatProbability(value) {
  return Number(value).toFixed(4);
}

function formatNumber(value) {
  const number = finite(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function createLayout(container) {
  container.replaceChildren();
  container.classList.add("atlas-simulation-canvas");
  const root = document.createElement("div");
  root.className = "atlas-simulation-lab atlas-hypothesis-coin-scene";
  const diagram = document.createElement("div");
  diagram.className = "atlas-simulation-diagram";
  const controls = document.createElement("div");
  controls.className = "atlas-simulation-controls";
  controls.setAttribute("aria-label", "仮説検定シミュレーションの操作");
  const result = document.createElement("section");
  result.className = "atlas-simulation-result";
  result.setAttribute("aria-live", "polite");
  const heading = document.createElement("p");
  heading.className = "atlas-simulation-result-label";
  heading.textContent = "理論値とシミュレーション結果";
  result.append(heading);
  root.append(diagram, controls, result);
  container.append(root);
  return { diagram, controls, result };
}

function createRangeControl({ label, min, max, step, value, onInput }) {
  const wrapper = document.createElement("label");
  wrapper.className = "atlas-simulation-range-control";
  const heading = document.createElement("span");
  heading.className = "atlas-simulation-control-heading";
  const labelText = document.createElement("span");
  labelText.textContent = label;
  const output = document.createElement("output");
  output.textContent = formatNumber(value);
  heading.append(labelText, output);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute("aria-label", label);
  const listener = () => {
    output.textContent = formatNumber(input.value);
    onInput(Number(input.value));
  };
  input.addEventListener("input", listener);
  wrapper.append(heading, input);
  return {
    wrapper,
    input,
    setValue(nextValue) { input.value = String(nextValue); output.textContent = formatNumber(nextValue); },
    cleanup() { input.removeEventListener("input", listener); }
  };
}

function createButton(label, onActivate) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "atlas-simulation-button";
  button.setAttribute("aria-label", label);
  button.textContent = label;
  const listener = () => onActivate();
  button.addEventListener("click", listener);
  return { button, cleanup: () => button.removeEventListener("click", listener) };
}

function renderFormula(target, latex, fallback) {
  target.replaceChildren();
  target.setAttribute("aria-label", fallback);
  if (window.katex?.render && latex) {
    try {
      window.katex.render(latex, target, { displayMode: true, throwOnError: false });
      return;
    } catch {
      // Keep the plain formula when KaTeX is unavailable.
    }
  }
  target.textContent = fallback;
}

function cleanupScene(container, cleanup) {
  cleanup.forEach((remove) => remove?.());
  container.replaceChildren();
  container.classList.remove("atlas-simulation-canvas");
}

export function mountSimulationLab(container, config = {}) {
  if (config.mode !== "hypothesis-coin") throw new Error(`Unsupported simulation lab mode: ${config.mode || "(empty)"}`);
  const initialObserved = clamp(Math.round(finite(config.initial?.observedHeads, 15)), 0, 20);
  const nullProbability = clamp(finite(config.initial?.nullProbability, 0.5), 0, 1);
  let observedHeads = initialObserved;
  let simulationTrials = 0;
  let simulationTailCount = 0;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container);
  const svg = svgElement("svg", { class: "atlas-simulation-svg", viewBox: "0 0 760 380", role: "img", "aria-label": "公平なコインを20回投げたときの表の回数の二項分布" });
  diagram.append(svg);
  const formula = document.createElement("div");
  formula.className = "atlas-simulation-formula";
  const theory = document.createElement("p");
  theory.className = "atlas-simulation-theory";
  const simulation = document.createElement("p");
  simulation.className = "atlas-simulation-observation";
  result.append(formula, theory, simulation);
  const observedControl = createRangeControl({
    label: "観測された表の回数",
    min: 0,
    max: 20,
    step: 1,
    value: observedHeads,
    onInput: (value) => setObservedHeads(value)
  });
  const run100 = createButton("100回シミュレーション", () => runSimulation(100));
  const run1000 = createButton("1000回シミュレーション", () => runSimulation(1000));
  controls.append(observedControl.wrapper, run100.button, run1000.button);

  function runSimulation(trials) {
    if (destroyed) return;
    let tailCount = 0;
    for (let trial = 0; trial < trials; trial += 1) {
      let heads = 0;
      for (let toss = 0; toss < 20; toss += 1) {
        if (Math.random() < nullProbability) heads += 1;
      }
      if (heads >= observedHeads) tailCount += 1;
    }
    simulationTrials = trials;
    simulationTailCount = tailCount;
    render();
  }

  function setObservedHeads(value) {
    if (destroyed) return;
    observedHeads = clamp(Math.round(finite(value, initialObserved)), 0, 20);
    simulationTrials = 0;
    simulationTailCount = 0;
    observedControl.setValue(observedHeads);
    render();
  }

  function render() {
    const facts = coinTestFacts({ n: 20, observedHeads, nullProbability });
    const maxProbability = Math.max(...facts.distribution.map((item) => item.probability), 0.05);
    const left = 54;
    const right = 730;
    const top = 42;
    const bottom = 300;
    const slot = (right - left) / facts.distribution.length;
    const barWidth = Math.max(8, slot * 0.7);
    const yFor = (probability) => bottom - (probability / maxProbability) * (bottom - top);
    const xFor = (heads) => left + slot * heads + slot / 2;
    svg.replaceChildren();
    svg.append(svgElement("line", { class: "atlas-simulation-axis", x1: left, y1: bottom, x2: right, y2: bottom }));
    svg.append(svgElement("line", { class: "atlas-simulation-axis", x1: left, y1: top, x2: left, y2: bottom }));
    facts.distribution.forEach(({ heads, probability, inUpperTail }) => {
      const height = Math.max(1, bottom - yFor(probability));
      const bar = svgElement("rect", { class: `atlas-simulation-bar${inUpperTail ? " is-tail" : ""}`, x: xFor(heads) - barWidth / 2, y: yFor(probability), width: barWidth, height, rx: 3 });
      bar.setAttribute("aria-label", `表${heads}回: ${formatProbability(probability)}`);
      svg.append(bar);
      const tick = svgElement("text", { class: "atlas-simulation-axis-label", x: xFor(heads), y: bottom + 24 });
      tick.textContent = String(heads);
      svg.append(tick);
    });
    const thresholdX = xFor(observedHeads) - slot / 2;
    svg.append(svgElement("line", { class: "atlas-simulation-threshold", x1: thresholdX, y1: top, x2: thresholdX, y2: bottom }));
    const thresholdLabel = svgElement("text", { class: "atlas-simulation-threshold-label", x: thresholdX + 4, y: top - 12 });
    thresholdLabel.textContent = `観測値 ${observedHeads}`;
    svg.append(thresholdLabel);
    const fivePercentY = yFor(0.05);
    svg.append(svgElement("line", { class: "atlas-simulation-five-percent", x1: left, y1: fivePercentY, x2: right, y2: fivePercentY }));
    const fivePercentLabel = svgElement("text", { class: "atlas-simulation-five-percent-label", x: right - 4, y: fivePercentY - 6 });
    fivePercentLabel.textContent = "5%";
    svg.append(fivePercentLabel);
    const xLabel = svgElement("text", { class: "atlas-simulation-axis-title", x: (left + right) / 2, y: 360 });
    xLabel.textContent = "表の回数";
    svg.append(xLabel);
    const factsText = `P(X ≥ ${observedHeads}) = ${formatProbability(facts.upperTail)}`;
    renderFormula(formula, `P(X\\ge ${observedHeads})=${formatProbability(facts.upperTail)}`, factsText);
    theory.textContent = `理論値：公平なコインで20回中${observedHeads}回以上表になる確率 = ${formatProbability(facts.upperTail)}`;
    simulation.textContent = simulationTrials === 0
      ? "シミュレーション結果：未実行（理論値とは別の実験結果です）"
      : `シミュレーション結果：${simulationTrials}回中${simulationTailCount}回（${formatProbability(simulationTailCount / simulationTrials)}）　※理論値とは別の実験結果です`;
    observedControl.setValue(observedHeads);
    config.onStateChange?.({ observedHeads, simulationTrials, simulationTailCount }, `${theory.textContent} ／ ${simulation.textContent}`);
  }

  function reset() {
    observedHeads = initialObserved;
    simulationTrials = 0;
    simulationTailCount = 0;
    render();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, [observedControl.cleanup, run100.cleanup, run1000.cleanup]);
  }
  function setParameter(name, value) {
    if (name === "observedHeads") setObservedHeads(value);
  }
  render();
  return { reset, destroy, getState: () => ({ observedHeads, simulationTrials, simulationTailCount }), setParameter };
}

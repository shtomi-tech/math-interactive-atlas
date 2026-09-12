import { coinTestFacts } from "../math/hypothesis-test.js?v=20260912-4b";
import { binomialDistribution, binomialProbability } from "../math/probability.js?v=20260912-4b";

const NS = "http://www.w3.org/2000/svg";
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
const svg = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
};

function sampleBinomial(n, p) {
  let successes = 0;
  for (let i = 0; i < n; i += 1) successes += Math.random() < p ? 1 : 0;
  return successes;
}

function createLayout(container, title) {
  container.replaceChildren();
  container.classList.add("atlas-simulation-lab");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const controls = document.createElement("div");
  controls.className = "atlas-simulation-controls";
  const chart = svg("svg", { viewBox: "0 0 640 280", role: "img" });
  chart.classList.add("atlas-simulation-chart");
  const result = document.createElement("div");
  result.className = "atlas-simulation-result";
  const actions = document.createElement("div");
  actions.className = "atlas-simulation-actions";
  container.append(heading, controls, chart, result, actions);
  return { controls, chart, result, actions };
}

function addRange(parent, label, min, max, step, value, onInput) {
  const wrap = document.createElement("label");
  wrap.className = "atlas-simulation-range";
  const caption = document.createElement("span");
  const output = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value);
  const refresh = () => { output.value = input.value; output.textContent = input.value; };
  caption.textContent = label;
  input.addEventListener("input", () => { refresh(); onInput(Number(input.value)); });
  refresh(); wrap.append(caption, input, output); parent.append(wrap);
  return { input, output, set(valueToSet) { input.value = String(valueToSet); refresh(); } };
}

function rangeDefinition(config, name, fallback) {
  const definition = config.parameters?.[name] || {};
  return {
    min: Number.isFinite(Number(definition.min)) ? Number(definition.min) : fallback.min,
    max: Number.isFinite(Number(definition.max)) ? Number(definition.max) : fallback.max,
    step: Number.isFinite(Number(definition.step)) ? Number(definition.step) : fallback.step
  };
}

function addButton(parent, label, onClick) {
  const button = document.createElement("button");
  button.type = "button"; button.textContent = label;
  button.addEventListener("click", onClick); parent.append(button);
}

function drawDistribution(chart, distribution, { selectedK, tailFrom = null, frequencies = null, trials = 0 } = {}) {
  chart.replaceChildren();
  const width = 640, height = 280, left = 44, right = 16, top = 24, bottom = 44;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const sampleRates = frequencies?.map((count) => count / Math.max(1, trials));
  const maxValue = Math.max(0.05, ...distribution.map((item) => item.probability), ...(sampleRates || [0]));
  chart.append(svg("line", { x1: left, y1: top + plotHeight, x2: width - right, y2: top + plotHeight, stroke: "#64748b" }));
  const slot = plotWidth / distribution.length;
  distribution.forEach((item, index) => {
    const theoryHeight = (item.probability / maxValue) * plotHeight;
    const highlighted = item.k === selectedK || (tailFrom !== null && item.k >= tailFrom);
    chart.append(svg("rect", {
      x: left + index * slot + slot * 0.12, y: top + plotHeight - theoryHeight,
      width: slot * (sampleRates ? 0.34 : 0.76), height: theoryHeight,
      fill: highlighted ? "#f59e0b" : "#2563eb", rx: 2
    }));
    if (sampleRates) {
      const sampleHeight = (sampleRates[index] / maxValue) * plotHeight;
      chart.append(svg("rect", {
        x: left + index * slot + slot * 0.52, y: top + plotHeight - sampleHeight,
        width: slot * 0.34, height: sampleHeight, fill: "#14b8a6", rx: 2
      }));
    }
    const label = svg("text", { x: left + (index + 0.5) * slot, y: height - 17, "text-anchor": "middle", fill: "#334155", "font-size": 12 });
    label.textContent = item.k; chart.append(label);
  });
  chart.setAttribute("aria-label", sampleRates ? "青と橙が理論値、緑が実験値の二項分布" : "二項分布の理論値");
}

function mountHypothesisCoinScene(container) {
  const ui = createLayout(container, "コインで仮説検定を体験する");
  const state = { n: 20, p: 0.5, observed: 15, trials: 0, extreme: 0 };
  const nControl = addRange(ui.controls, "投げる回数 n", 5, 50, 1, state.n, (value) => { state.n = value; state.observed = Math.min(state.observed, value); observedControl.input.max = value; observedControl.set(state.observed); resetSimulation(); render(); });
  const observedControl = addRange(ui.controls, "表の回数", 0, state.n, 1, state.observed, (value) => { state.observed = value; resetSimulation(); render(); });
  const resetSimulation = () => { state.trials = 0; state.extreme = 0; };
  function simulate(count) {
    for (let i = 0; i < count; i += 1) if (sampleBinomial(state.n, state.p) >= state.observed) state.extreme += 1;
    state.trials += count; render();
  }
  addButton(ui.actions, "100回実験", () => simulate(100));
  addButton(ui.actions, "1000回実験", () => simulate(1000));
  function render() {
    const facts = coinTestFacts({ n: state.n, observedHeads: state.observed, nullProbability: state.p });
    drawDistribution(ui.chart, binomialDistribution(state.n, state.p), { selectedK: state.observed, tailFrom: state.observed });
    const comparison = facts.tailProbability < 0.05 ? "0.05 より小さい" : "0.05 以上";
    const simulation = state.trials ? `実験：${state.extreme}/${state.trials} = ${(state.extreme / state.trials).toFixed(4)}` : "実験ボタンで近似値を確かめられます。";
    ui.result.innerHTML = `<p class="atlas-simulation-hypothesis">帰無仮説 H₀：表の確率 p = 0.5 ／ 対立仮説：表が出やすいのではないか</p><p class="atlas-simulation-comparison">上側確率 P(X ≥ ${state.observed}) = ${facts.tailProbability.toFixed(4)}（${comparison}）</p><p class="atlas-simulation-interpretation">${facts.tailProbability < 0.05 ? "H₀のもとでは起こりにくい結果です。" : "この結果だけではH₀を退けるほど珍しいとはいえません。"}</p><p>${simulation}</p>`;
  }
  render();
  return { setParameter(name, value) { if (name === "n") nControl.input.value = value; if (name === "observed") observedControl.input.value = value; }, getState: () => ({ ...state }), destroy() { container.replaceChildren(); } };
}

function mountIndependentTrialsScene(container, config = {}) {
  const ui = createLayout(container, "独立試行を大量実験する");
  const nDefinition = rangeDefinition(config, "n", { min: 1, max: 10, step: 1 });
  const pDefinition = rangeDefinition(config, "p", { min: 0.1, max: 0.9, step: 0.1 });
  const kDefinition = rangeDefinition(config, "k", { min: 0, max: nDefinition.max, step: 1 });
  const state = {
    n: clamp(config.initial?.n ?? 5, nDefinition.min, nDefinition.max),
    p: clamp(config.initial?.p ?? 0.4, pDefinition.min, pDefinition.max),
    k: clamp(config.initial?.k ?? 2, kDefinition.min, Math.min(kDefinition.max, config.initial?.n ?? nDefinition.max)),
    trials: 0,
    frequencies: []
  };
  state.n = Math.round(state.n); state.k = Math.round(state.k); state.frequencies = Array(state.n + 1).fill(0);
  const clear = () => { state.trials = 0; state.frequencies = Array(state.n + 1).fill(0); };
  function simulate(count) { for (let i = 0; i < count; i += 1) state.frequencies[sampleBinomial(state.n, state.p)] += 1; state.trials += count; render(); }
  addButton(ui.actions, "100回実験", () => simulate(100)); addButton(ui.actions, "1000回実験", () => simulate(1000));
  function render() {
    const distribution = binomialDistribution(state.n, state.p);
    drawDistribution(ui.chart, distribution, { selectedK: state.k, frequencies: state.trials ? state.frequencies : null, trials: state.trials });
    const exact = binomialProbability(state.n, state.k, state.p);
    const observed = state.trials ? state.frequencies[state.k] / state.trials : null;
    ui.result.innerHTML = `<p class="atlas-simulation-formula">P(X=${state.k}) = C(${state.n}, ${state.k}) × ${state.p}<sup>${state.k}</sup> × ${(1-state.p).toFixed(1)}<sup>${state.n-state.k}</sup> = ${exact.toFixed(4)}</p><p>理論値：${exact.toFixed(4)} ／ 実験値：${observed === null ? "未実施" : observed.toFixed(4)}${state.trials ? `（${state.trials}回）` : ""}</p><p class="atlas-simulation-legend">青・橙：理論値　緑：実験値</p>`;
  }
  render();
  return { setParameter(name, value) { if (name === "n") { state.n = Math.round(clamp(value, nDefinition.min, nDefinition.max)); state.k = Math.min(state.k, state.n); clear(); } if (name === "p") { state.p = clamp(value, pDefinition.min, pDefinition.max); clear(); } if (name === "k") state.k = Math.min(state.n, Math.round(clamp(value, kDefinition.min, kDefinition.max))); render(); }, getState: () => ({ ...state, frequencies: [...state.frequencies] }), destroy() { container.replaceChildren(); } };
}

export const SIMULATION_MODES = Object.freeze({
  "hypothesis-coin": mountHypothesisCoinScene,
  "independent-trials": mountIndependentTrialsScene
});

export function mountSimulationLab(container, config = {}) {
  const mount = SIMULATION_MODES[config.mode];
  if (!mount) throw new Error(`Unsupported SimulationLab mode: ${config.mode}`);
  return mount(container, config);
}

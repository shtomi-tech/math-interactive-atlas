import { coinTestFacts } from "../math/hypothesis-test.js?v=20260913-r1";
import { binomialDistribution, binomialProbability } from "../math/probability.js?v=20260913-r1";
import { normalPdf, zTestMean } from "../math/statistical-inference.js?v=20260913-r1";
import { sampleMean, sampleWithReplacement, simulateKnownSigmaConfidenceIntervals, simulateSampleMeans } from "../math/sampling.js?v=20260913-r1";

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

function createLayout(container, title, config = {}) {
  container.replaceChildren();
  container.classList.add("atlas-simulation-lab");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const controls = document.createElement("div");
  controls.className = "atlas-simulation-controls";
  const chart = svg("svg", { viewBox: "0 0 640 280", role: "img", "aria-label": `${title}の図` });
  chart.classList.add("atlas-simulation-chart");
  const result = document.createElement("div");
  result.className = "atlas-simulation-result";
  const actions = document.createElement("div");
  actions.className = "atlas-simulation-actions";
  container.append(heading, controls, chart, result, actions);
  return { controls, chart, result, actions, notify(state, summary = result.textContent) { config.onStateChange?.(state, summary); } };
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

function addSelect(parent, label, options, value, onChange) {
  const wrap = document.createElement("label");
  wrap.className = "atlas-simulation-select";
  const caption = document.createElement("span"); caption.textContent = label;
  const select = document.createElement("select"); select.setAttribute("aria-label", label);
  options.forEach(([optionValue, optionLabel]) => { const option = document.createElement("option"); option.value = optionValue; option.textContent = optionLabel; select.append(option); });
  select.value = String(value); select.addEventListener("change", () => onChange(select.value));
  wrap.append(caption, select); parent.append(wrap);
  return { select, set(next) { select.value = String(next); } };
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

function drawHistogram(chart, values, { min = -4, max = 4, bins = 16 } = {}) {
  chart.replaceChildren(); const width = 640, height = 280, left = 44, right = 16, top = 24, bottom = 44; const counts = Array(bins).fill(0); values.forEach((value) => { const index = Math.floor((Number(value) - min) / (max - min) * bins); if (index >= 0 && index < bins) counts[index] += 1; }); const maximum = Math.max(1, ...counts); const slot = (width - left - right) / bins; chart.append(svg("line", { x1: left, y1: height - bottom, x2: width - right, y2: height - bottom, stroke: "#64748b" })); counts.forEach((count, index) => { const barHeight = count / maximum * (height - top - bottom); chart.append(svg("rect", { x: left + index * slot + 1, y: height - bottom - barHeight, width: Math.max(1, slot - 2), height: barHeight, fill: "#2563eb", rx: 2 })); }); chart.setAttribute("aria-label", "標本平均の分布ヒストグラム");
}

function drawNormalTestChart(chart, result) {
  chart.replaceChildren();
  const width = 640; const height = 320; const left = 48; const right = 18; const top = 22; const bottom = 52;
  const plotWidth = width - left - right; const baseline = height - bottom; const maxDensity = normalPdf(0);
  const xToPixel = (x) => left + ((x + 4) / 8) * plotWidth;
  const yToPixel = (y) => baseline - (y / maxDensity) * (baseline - top);
  const tail = result.alternative === "greater" ? "右側領域" : result.alternative === "less" ? "左側領域" : "両側領域";
  const inTail = (x) => result.alternative === "greater" ? x >= result.z : result.alternative === "less" ? x <= result.z : Math.abs(x) >= Math.abs(result.z);
  const points = Array.from({ length: 161 }, (_, index) => -4 + index / 20);
  const curve = points.map((x) => `${xToPixel(x)},${yToPixel(normalPdf(x))}`).join(" ");
  const shaded = [];
  let segment = [];
  for (const x of points) {
    if (inTail(x)) segment.push(x);
    else if (segment.length) { shaded.push(segment); segment = []; }
  }
  if (segment.length) shaded.push(segment);
  shaded.forEach((part) => { const polygon = [`${xToPixel(part[0])},${baseline}`, ...part.map((x) => `${xToPixel(x)},${yToPixel(normalPdf(x))}`), `${xToPixel(part.at(-1))},${baseline}`].join(" "); chart.append(svg("polygon", { points: polygon, fill: "#f59e0b", opacity: 0.38 })); });
  chart.append(svg("line", { x1: left, y1: baseline, x2: width - right, y2: baseline, stroke: "#64748b" }));
  chart.append(svg("polyline", { points: curve, fill: "none", stroke: "#2563eb", "stroke-width": 3 }));
  const observedX = Math.max(-4, Math.min(4, result.z));
  chart.append(svg("line", { x1: xToPixel(observedX), y1: top, x2: xToPixel(observedX), y2: baseline, stroke: "#e11d48", "stroke-width": 2, "stroke-dasharray": "6 4" }));
  [-4, -2, 0, 2, 4].forEach((value) => { const label = svg("text", { x: xToPixel(value), y: height - 24, "text-anchor": "middle", fill: "#334155", "font-size": 12 }); label.textContent = value; chart.append(label); });
  chart.setAttribute("role", "img"); chart.setAttribute("aria-label", `標準正規分布。観測されたz値は${result.z.toFixed(3)}、p値は${result.pValue.toFixed(4)}、${tail}を色付きで表示`);
}

function mountPopulationSampleScene(container, config = {}) {
  const ui = createLayout(container, "母集団と標本", config); const population = Array.isArray(config.data?.population) ? config.data.population.map(Number).filter(Number.isFinite) : Array.from({ length: 100 }, (_, index) => index + 1); const initial = { sampleSize: Math.max(5, Math.min(40, Number(config.initial?.sampleSize ?? 10))) }; const state = { ...initial, sample: [], samples: [] }; const sampleControl = addRange(ui.controls, "標本サイズ n", 5, 40, 1, state.sampleSize, (value) => { state.sampleSize = value; render(); }); addButton(ui.actions, "標本を1回抽出", () => { state.sample = sampleWithReplacement(population, state.sampleSize); render(); }); addButton(ui.actions, "100回抽出", () => { state.samples = simulateSampleMeans({ population, sampleSize: state.sampleSize, trials: 100 }); render(); });
  function render() { const populationAverage = sampleMean(population); const currentAverage = state.sample.length ? sampleMean(state.sample) : null; const averages = state.samples.length ? state.samples : (state.sample.length ? [currentAverage] : []); drawHistogram(ui.chart, averages, { min: 1, max: 100 }); sampleControl.set(state.sampleSize); ui.result.innerHTML = `<p>母平均：${populationAverage.toFixed(2)}</p><p>標本平均：${currentAverage === null ? "未抽出" : currentAverage.toFixed(2)}</p><p>100回分布：${state.samples.length ? `${state.samples.length}個の標本平均` : "未実施"}</p>`; } function reset() { state.sampleSize = initial.sampleSize; state.sample = []; state.samples = []; sampleControl.set(state.sampleSize); render(); } return { reset, setParameter(name, value) { if (name === "sampleSize") { state.sampleSize = Math.round(clamp(value, 5, 40)); state.sample = []; state.samples = []; render(); } }, getState: () => ({ sampleSize: state.sampleSize, sample: [...state.sample], samples: [...state.samples] }), destroy() { container.replaceChildren(); } };
}

function mountBinomialDistributionScene(container, config = {}) {
  const ui = createLayout(container, "二項分布の形を動かす", config); const initial = { n: Math.round(clamp(config.initial?.n ?? 20, 5, 50)), p: clamp(config.initial?.p ?? .5, .1, .9) }; const state = { ...initial }; const nControl = addRange(ui.controls, "試行回数 n", 5, 50, 1, state.n, (value) => setParameter("n", value)); const pControl = addRange(ui.controls, "成功確率 p", .1, .9, .05, state.p, (value) => setParameter("p", value));
  function render() { const distribution = binomialDistribution(state.n, state.p); drawDistribution(ui.chart, distribution); nControl.set(state.n); pControl.set(state.p); const meanValue = state.n * state.p; const varianceValue = meanValue * (1 - state.p); ui.result.innerHTML = `<p>平均 np = ${meanValue.toFixed(2)}</p><p>分散 np(1-p) = ${varianceValue.toFixed(2)}</p><p>標準偏差 √np(1-p) = ${Math.sqrt(varianceValue).toFixed(2)}</p><p class="atlas-simulation-legend">棒グラフは理論分布です。数学Aの独立試行は確率計算、数学Bは分布全体と統計量を主役にします。</p>`; } function setParameter(name, value) { if (name === "n") state.n = Math.round(clamp(value, 5, 50)); if (name === "p") state.p = clamp(value, .1, .9); render(); } function reset() { Object.assign(state, initial); render(); } render(); return { reset, setParameter, getState: () => ({ ...state }), destroy() { container.replaceChildren(); } };
}

function mountSamplingMeanScene(container, config = {}) {
  const ui = createLayout(container, "標本平均の分布", config); const population = Array.from({ length: 100 }, (_, index) => index + 1); const initial = { sampleSize: Math.round(clamp(config.initial?.sampleSize ?? 10, 5, 40)), trials: Math.round(clamp(config.initial?.trials ?? 100, 20, 100)) }; const state = { ...initial, means: [] }; const nControl = addRange(ui.controls, "標本サイズ n", 5, 40, 1, state.sampleSize, (value) => setParameter("sampleSize", value)); const trialsControl = addRange(ui.controls, "試行回数", 20, 100, 10, state.trials, (value) => setParameter("trials", value)); addButton(ui.actions, "標本平均を生成", () => { state.means = simulateSampleMeans({ population, sampleSize: state.sampleSize, trials: state.trials }); render(); });
  function render() { drawHistogram(ui.chart, state.means, { min: 35, max: 65 }); nControl.set(state.sampleSize); trialsControl.set(state.trials); const populationMean = sampleMean(population); ui.result.innerHTML = `<p>母平均 μ=${populationMean.toFixed(2)} ／ 標本平均の分布：${state.means.length ? `${state.means.length}個` : "未生成"}</p><p>理論：E(X̄)=μ、SD(X̄)=σ/√n = ${(Math.sqrt(varianceOf(population)) / Math.sqrt(state.sampleSize)).toFixed(2)}</p><p class="atlas-simulation-legend">ヒストグラムは実験、下段は理論値です。</p>`; } function varianceOf(values) { const average = sampleMean(values); return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length; } function setParameter(name, value) { if (name === "sampleSize") state.sampleSize = Math.round(clamp(value, 5, 40)); if (name === "trials") state.trials = Math.round(clamp(value, 20, 100)); state.means = []; render(); } function reset() { Object.assign(state, initial); state.means = []; render(); } render(); return { reset, setParameter, getState: () => ({ ...state, means: [...state.means] }), destroy() { container.replaceChildren(); } };
}

function mountConfidenceIntervalScene(container, config = {}) {
  const ui = createLayout(container, "信頼区間を何度も作る", config); const levels = [["0.9", "90%"], ["0.95", "95%"], ["0.99", "99%"]]; const initial = { sampleSize: Math.round(clamp(config.initial?.sampleSize ?? 20, 5, 40)), confidence: levels.some(([value]) => Number(value) === Number(config.initial?.confidence)) ? Number(config.initial.confidence) : .95 }; const state = { ...initial, intervals: [] }; const nControl = addRange(ui.controls, "標本サイズ", 5, 40, 1, state.sampleSize, (value) => setParameter("sampleSize", value)); const confidenceControl = addSelect(ui.controls, "信頼水準", levels, state.confidence, (value) => setParameter("confidence", Number(value))); const populationMean = 50; const populationSd = 10; function generate(count) { state.intervals = simulateKnownSigmaConfidenceIntervals({ populationMean, populationSd, sampleSize: state.sampleSize, confidence: state.confidence, trials: count }); render(); } addButton(ui.actions, "20区間を作る", () => generate(20)); addButton(ui.actions, "100区間を作る", () => generate(100));
  function render() { ui.chart.replaceChildren(); const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 420px)").matches; const displayLimit = isMobile ? 30 : 100; const displayed = state.intervals.slice(0, displayLimit); const rowHeight = isMobile ? 8 : 2.8; const chartHeight = Math.max(360, 48 + displayed.length * rowHeight); const scale = (value) => 80 + (value - 35) / 30 * 520; ui.chart.setAttribute("viewBox", `0 0 640 ${chartHeight}`); ui.chart.append(svg("line", { x1: 80, y1: 28, x2: 80, y2: chartHeight - 30, stroke: "#64748b" }), svg("line", { x1: scale(populationMean), y1: 20, x2: scale(populationMean), y2: chartHeight - 30, stroke: "#f59e0b", "stroke-width": 3 })); displayed.forEach((interval, index) => { const y = 32 + index * rowHeight; const contains = interval.containsPopulationMean; ui.chart.append(svg("line", { x1: scale(interval.lower), y1: y, x2: scale(interval.upper), y2: y, stroke: contains ? "#2563eb" : "#e11d48", "stroke-width": 2 })); const label = svg("text", { x: 590, y: y + 3, fill: contains ? "#2563eb" : "#e11d48", "font-size": isMobile ? 10 : 9 }); label.textContent = contains ? "含む" : "含まない"; ui.chart.append(label); }); nControl.set(state.sampleSize); confidenceControl.set(state.confidence); const included = state.intervals.filter((interval) => interval.containsPopulationMean).length; const displayNote = state.intervals.length > displayLimit ? `<p>${state.intervals.length}本中、最初の${displayLimit}本を図示しています。</p>` : ""; ui.result.innerHTML = `<p>母平均 μ=${populationMean} ／ 信頼水準：${(state.confidence * 100).toFixed(0)}% ／ ${state.intervals.length ? `母平均を含む ${included}/${state.intervals.length}` : "未実施"}</p><p>同じ方法で何度も区間を作ると、長期的に約${(state.confidence * 100).toFixed(0)}%が母平均を含みます。この1本の区間に母平均が入る確率を表すものではありません。</p>${displayNote}<p class="atlas-simulation-legend">青=含む、赤=含まない。判定は色と文字の両方で示します。</p>`; } function setParameter(name, value) { if (name === "sampleSize") state.sampleSize = Math.round(clamp(value, 5, 40)); if (name === "confidence") state.confidence = levels.map(([entry]) => Number(entry)).sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0]; state.intervals = []; render(); } function reset() { Object.assign(state, initial); state.intervals = []; render(); } render(); return { reset, setParameter, getState: () => ({ ...state, intervals: [...state.intervals] }), destroy() { container.replaceChildren(); } };
}

function mountNormalHypothesisTestScene(container, config = {}) {
  const ui = createLayout(container, "正規分布で仮説検定", config); const initial = { sampleMean: 54, sampleSize: 25, significance: .05, alternative: "two-sided" }; const state = { ...initial }; const meanControl = addRange(ui.controls, "標本平均", 40, 60, .5, state.sampleMean, (value) => setParameter("sampleMean", value)); const sizeControl = addRange(ui.controls, "標本サイズ", 5, 100, 1, state.sampleSize, (value) => setParameter("sampleSize", value)); const significanceControl = addRange(ui.controls, "有意水準", .01, .1, .01, state.significance, (value) => setParameter("significance", value)); const select = document.createElement("select"); select.setAttribute("aria-label", "対立仮説"); [["two-sided", "両側"], ["greater", "大きい"], ["less", "小さい"]].forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option); }); select.value = state.alternative; select.addEventListener("change", () => setParameter("alternative", select.value)); ui.controls.append(select);
  function render() { const result = zTestMean({ sampleMean: state.sampleMean, nullMean: 50, populationSd: 10, sampleSize: state.sampleSize, alternative: state.alternative }); meanControl.set(state.sampleMean); sizeControl.set(state.sampleSize); significanceControl.set(state.significance); select.value = state.alternative; const reject = result.pValue < state.significance; drawNormalTestChart(ui.chart, result); const tail = state.alternative === "greater" ? "右側領域" : state.alternative === "less" ? "左側領域" : "両側領域"; ui.result.innerHTML = `<p>H₀：μ=50 ／ z統計量=${result.z.toFixed(3)} ／ p値=${result.pValue.toFixed(4)} ／ α=${state.significance.toFixed(2)}</p><p>標準正規分布の${tail}をp値として表示 ／ 判定：${reject ? "H₀を棄却" : "H₀を棄却しない"}</p><p class="atlas-simulation-legend">「H₀が正しい確率」とは表現しません。p値はH₀のもとでの観測結果の珍しさです。</p>`; } function setParameter(name, value) { if (name === "sampleMean") state.sampleMean = clamp(value, 40, 60); if (name === "sampleSize") state.sampleSize = Math.round(clamp(value, 5, 100)); if (name === "significance") state.significance = clamp(value, .01, .1); if (name === "alternative" && ["two-sided", "greater", "less"].includes(value)) state.alternative = value; render(); } function reset() { Object.assign(state, initial); render(); } render(); return { reset, setParameter, getState: () => ({ ...state }), destroy() { container.replaceChildren(); } };
}

function mountHypothesisCoinScene(container, config = {}) {
  const ui = createLayout(container, "コインで仮説検定を体験する", config);
  const initial = { n: 20, p: 0.5, observed: 15 };
  const state = { ...initial, trials: 0, extreme: 0 };
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
  function reset() { state.n = initial.n; state.p = initial.p; state.observed = initial.observed; state.trials = 0; state.extreme = 0; nControl.set(state.n); observedControl.input.max = state.n; observedControl.set(state.observed); render(); }
  function setParameter(name, value) { if (name === "n") { state.n = Math.round(clamp(value, 5, 50)); state.observed = Math.min(state.observed, state.n); observedControl.input.max = state.n; observedControl.set(state.observed); resetSimulation(); } if (name === "observed") { state.observed = Math.round(clamp(value, 0, state.n)); observedControl.set(state.observed); resetSimulation(); } render(); }
  return { reset, setParameter, getState: () => ({ ...state }), destroy() { container.replaceChildren(); } };
}

function mountIndependentTrialsScene(container, config = {}) {
  const ui = createLayout(container, "独立試行を大量実験する", config);
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
  const initial = { n: state.n, p: state.p, k: state.k };
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
  function reset() { state.n = initial.n; state.p = initial.p; state.k = initial.k; clear(); render(); }
  return { reset, setParameter(name, value) { if (name === "n") { state.n = Math.round(clamp(value, nDefinition.min, nDefinition.max)); state.k = Math.min(state.k, state.n); clear(); } if (name === "p") { state.p = clamp(value, pDefinition.min, pDefinition.max); clear(); } if (name === "k") state.k = Math.min(state.n, Math.round(clamp(value, kDefinition.min, kDefinition.max))); render(); }, getState: () => ({ ...state, frequencies: [...state.frequencies] }), destroy() { container.replaceChildren(); } };
}

export const SIMULATION_MODES = Object.freeze({
  "hypothesis-coin": mountHypothesisCoinScene,
  "independent-trials": mountIndependentTrialsScene,
  "population-sample": mountPopulationSampleScene,
  "binomial-distribution": mountBinomialDistributionScene,
  "sampling-mean": mountSamplingMeanScene,
  "confidence-interval": mountConfidenceIntervalScene,
  "normal-hypothesis-test": mountNormalHypothesisTestScene
});

export function mountSimulationLab(container, config = {}) {
  const mount = SIMULATION_MODES[config.mode];
  if (!mount) throw new Error(`Unsupported SimulationLab mode: ${config.mode}`);
  return mount(container, config);
}

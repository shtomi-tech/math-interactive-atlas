import {
  correlationCoefficient,
  mean,
  median,
  quartiles,
  standardDeviation,
  variance
} from "../math/statistics.js?v=20260912-3b";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = Object.freeze({
  primary: "#2563eb",
  secondary: "#e11d48",
  helper: "#64748b",
  construction: "#94a3b8",
  highlight: "#f59e0b",
  text: "#1f2937",
  subtle: "#eef2ff",
  border: "#d1d5db"
});
const DISPLAY_WIDTH = 680;
const DATA_LAB_MODES = Object.freeze({
  "mean-median": mountMeanMedianScene,
  "variance-distance": mountVarianceScene,
  boxplot: mountBoxplotScene,
  correlation: mountCorrelationScene
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

function formatNumber(value, digits = 2) {
  const number = finite(value);
  if (Math.abs(number) < 0.0005) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

function formatCorrelation(value) {
  return value === null ? "定義できません" : formatNumber(value, 3);
}

function createLayout(container, { controlsLabel, resultLabel, rootClass }) {
  container.replaceChildren();
  container.classList.add("atlas-data-canvas");
  const root = document.createElement("div");
  root.className = `atlas-data-lab${rootClass ? ` ${rootClass}` : ""}`;
  const diagram = document.createElement("div");
  diagram.className = "atlas-data-diagram";
  const controls = document.createElement("div");
  controls.className = "atlas-data-controls";
  controls.setAttribute("aria-label", controlsLabel);
  const result = document.createElement("section");
  result.className = "atlas-data-result";
  result.setAttribute("aria-live", "polite");
  const resultLabelElement = document.createElement("p");
  resultLabelElement.className = "atlas-data-result-label";
  resultLabelElement.textContent = resultLabel;
  result.append(resultLabelElement);
  root.append(diagram, controls, result);
  container.append(root);
  return { diagram, controls, result };
}

function createRangeControl({ label, min, max, step, value, onInput }) {
  const wrapper = document.createElement("label");
  wrapper.className = "atlas-data-range-control";
  const heading = document.createElement("span");
  heading.className = "atlas-data-control-heading";
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
    setValue(nextValue) {
      input.value = String(nextValue);
      output.textContent = formatNumber(nextValue);
    },
    cleanup() { input.removeEventListener("input", listener); }
  };
}

function createSelectControl({ label, value, options, onChange }) {
  const wrapper = document.createElement("label");
  wrapper.className = "atlas-data-select-control";
  const labelText = document.createElement("span");
  labelText.textContent = label;
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);
  options.forEach(({ value: optionValue, label: optionLabel }) => {
    const option = document.createElement("option");
    option.value = String(optionValue);
    option.textContent = optionLabel ?? String(optionValue);
    select.append(option);
  });
  select.value = String(value);
  const listener = () => onChange(Number(select.value));
  select.addEventListener("change", listener);
  wrapper.append(labelText, select);
  return {
    wrapper,
    select,
    cleanup() { select.removeEventListener("change", listener); }
  };
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

function drawAxis(svg, { min, max, left = 44, right = 636, y = 112, tickStep = 1 }) {
  svg.append(svgElement("line", { class: "atlas-data-axis", x1: left, y1: y, x2: right, y2: y }));
  const scale = (value) => left + ((value - min) / (max - min)) * (right - left);
  const tickCount = Math.floor((max - min) / tickStep);
  for (let index = 0; index <= tickCount; index += 1) {
    const value = min + index * tickStep;
    const x = scale(value);
    svg.append(
      svgElement("line", { class: "atlas-data-tick", x1: x, y1: y - 6, x2: x, y2: y + 6 }),
      svgElement("text", { class: "atlas-data-axis-label", x, y: y + 26 })
    );
    svg.lastChild.textContent = formatNumber(value);
  }
  return scale;
}

function createSvg(viewBox, label) {
  return svgElement("svg", { class: "atlas-data-svg", viewBox, role: "img", "aria-label": label });
}

function cleanupScene(container, cleanup) {
  cleanup.forEach((remove) => remove?.());
  container.replaceChildren();
  container.classList.remove("atlas-data-canvas");
}

function mountMeanMedianScene(container, config = {}) {
  const initialOutlier = clamp(Math.round(finite(config.initial?.outlier, 6)), 6, 30);
  const configuredValues = Array.isArray(config.data?.values) ? config.data.values.map(Number) : [1, 2, 3, 4, 5, 6];
  const baseValues = configuredValues.length >= 2 && configuredValues.every(Number.isFinite) ? configuredValues.slice(0, -1) : [1, 2, 3, 4, 5];
  let outlier = initialOutlier;
  let dragging = false;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "平均と中央値の操作",
    resultLabel: "現在の統計量",
    rootClass: "atlas-mean-median-scene"
  });
  const svg = createSvg(`0 0 ${DISPLAY_WIDTH} 220`, "1から5と外れ値の6点、平均、中央値を示す数直線");
  diagram.append(svg);
  const formula = document.createElement("div");
  formula.className = "atlas-data-formula";
  const summary = document.createElement("p");
  summary.className = "atlas-data-summary";
  result.append(formula, summary);
  const slider = createRangeControl({
    label: "外れ値 x₆",
    min: 6,
    max: 30,
    step: 1,
    value: outlier,
    onInput: (value) => setOutlier(value)
  });
  controls.append(slider.wrapper);

  const handlePointerMove = (event) => {
    if (dragging) setOutlier(valueFromPointer(event));
  };
  const handlePointerUp = () => { dragging = false; };
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  function valueFromPointer(event) {
    const rect = svg.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    return Math.round(ratio * 32);
  }

  function setOutlier(value) {
    if (destroyed) return;
    outlier = clamp(Math.round(finite(value, initialOutlier)), 6, 30);
    slider.setValue(outlier);
    render();
  }

  function render() {
    const values = [...baseValues, outlier];
    const average = mean(values);
    const middle = median(values);
    svg.replaceChildren();
    const scale = drawAxis(svg, { min: 0, max: 32, y: 112, tickStep: 4 });
    values.forEach((value, index) => {
      const point = svgElement("circle", { class: `atlas-data-point${index === 5 ? " atlas-data-point-draggable" : ""}`, cx: scale(value), cy: 112, r: 9 });
      point.setAttribute("aria-label", `データ${index + 1}: ${formatNumber(value)}`);
      if (index === 5) {
        point.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          dragging = true;
          point.setPointerCapture?.(event.pointerId);
          setOutlier(valueFromPointer(event));
        });
        point.addEventListener("pointerup", () => { dragging = false; });
        point.addEventListener("pointercancel", () => { dragging = false; });
      }
      svg.append(point);
      const label = svgElement("text", { class: "atlas-data-point-label", x: scale(value), y: 88 });
      label.textContent = formatNumber(value);
      svg.append(label);
    });
    [
      [average, 44, "atlas-data-marker atlas-data-marker-mean", `平均 ${formatNumber(average)}`],
      [middle, 176, "atlas-data-marker atlas-data-marker-median", `中央値 ${formatNumber(middle)}`]
    ].forEach(([value, y, className, label]) => {
      svg.append(svgElement("line", { class: className, x1: scale(value), y1: y < 112 ? y + 12 : 112, x2: scale(value), y2: y < 112 ? 112 : y - 12 }));
      const text = svgElement("text", { class: `${className} atlas-data-marker-label`, x: scale(value), y });
      text.textContent = label;
      svg.append(text);
    });
    renderFormula(formula, "\\bar{x}=\\frac{\\sum x_i}{n}", "x̄ = Σxi / n");
    summary.textContent = `平均 = ${formatNumber(average)}　／　中央値 = ${formatNumber(middle)}`;
    config.onStateChange?.({ outlier }, summary.textContent);
  }

  function reset() { setOutlier(initialOutlier); }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    cleanupScene(container, [slider.cleanup]);
  }
  function setParameter(name, value) {
    if (name === "outlier") setOutlier(value);
  }
  render();
  return { reset, destroy, getState: () => ({ outlier }), setParameter };
}

function mountVarianceScene(container, config = {}) {
  const initialCenter = finite(config.initial?.center, 5);
  const initialSpread = clamp(finite(config.initial?.spread, 1), 0, 2);
  let center = initialCenter;
  let spread = initialSpread;
  let destroyed = false;
  const configuredDeviations = Array.isArray(config.data?.deviations) ? config.data.deviations.map(Number) : [-2, -1, 0, 0, 1, 2];
  const deviations = configuredDeviations.length > 0 && configuredDeviations.every(Number.isFinite) ? configuredDeviations : [-2, -1, 0, 0, 1, 2];
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "分散の操作",
    resultLabel: "距離から見た分散",
    rootClass: "atlas-variance-scene"
  });
  const svg = createSvg(`0 0 ${DISPLAY_WIDTH} 250`, "平均から各データ点までの距離を示す数直線");
  diagram.append(svg);
  const formula = document.createElement("div");
  formula.className = "atlas-data-formula";
  const summary = document.createElement("p");
  summary.className = "atlas-data-summary";
  result.append(formula, summary);
  const centerControl = createRangeControl({ label: "中心 center", min: 0, max: 10, step: 0.5, value: center, onInput: (value) => setParameter("center", value) });
  const spreadControl = createRangeControl({ label: "広がり spread", min: 0, max: 2, step: 0.25, value: spread, onInput: (value) => setParameter("spread", value) });
  controls.append(centerControl.wrapper, spreadControl.wrapper);

  function render() {
    const values = deviations.map((deviation) => center + spread * deviation);
    const average = mean(values);
    const currentVariance = variance(values);
    svg.replaceChildren();
    const scale = drawAxis(svg, { min: -1, max: 11, y: 110, tickStep: 1 });
    values.forEach((value, index) => {
      const x = scale(value);
      const meanX = scale(average);
      svg.append(svgElement("line", { class: "atlas-data-distance", x1: meanX, y1: 110, x2: x, y2: 110 }));
      svg.append(svgElement("circle", { class: "atlas-data-point", cx: x, cy: 110, r: 8 }));
      const square = (value - average) ** 2;
      const label = svgElement("text", { class: "atlas-data-point-label", x, y: index % 2 === 0 ? 82 : 145 });
      label.textContent = `(${formatNumber(value)}−${formatNumber(average)})²=${formatNumber(square)}`;
      svg.append(label);
    });
    const meanLine = svgElement("line", { class: "atlas-data-marker atlas-data-marker-mean", x1: scale(average), y1: 54, x2: scale(average), y2: 166 });
    svg.append(meanLine);
    const meanLabel = svgElement("text", { class: "atlas-data-marker-label atlas-data-marker-mean", x: scale(average), y: 38 });
    meanLabel.textContent = `平均 ${formatNumber(average)}`;
    svg.append(meanLabel);
    centerControl.setValue(center);
    spreadControl.setValue(spread);
    renderFormula(formula, "V=\\frac{1}{n}\\sum(x_i-\\bar{x})^2", "V = 1/n Σ(xi − x̄)²");
    summary.textContent = `平均 = ${formatNumber(average)}　／　分散 = ${formatNumber(currentVariance)}　／　標準偏差 = ${formatNumber(standardDeviation(values))}`;
    config.onStateChange?.({ center, spread }, summary.textContent);
  }

  function setParameter(name, value) {
    if (destroyed) return;
    if (name === "center") center = clamp(finite(value, initialCenter), 0, 10);
    if (name === "spread") spread = clamp(finite(value, initialSpread), 0, 2);
    render();
  }
  function reset() { center = initialCenter; spread = initialSpread; render(); }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, [centerControl.cleanup, spreadControl.cleanup]);
  }
  render();
  return { reset, destroy, getState: () => ({ center, spread }), setParameter };
}

function drawBoxplot(svg, values) {
  const summary = quartiles(values);
  const sorted = [...values].sort((left, right) => left - right);
  const minimum = sorted[0];
  const maximum = sorted[sorted.length - 1];
  const scale = drawAxis(svg, { min: 0, max: 10, y: 72, tickStep: 1 });
  const y = 172;
  svg.append(svgElement("line", { class: "atlas-boxplot-whisker", x1: scale(minimum), y1: y, x2: scale(maximum), y2: y }));
  svg.append(svgElement("line", { class: "atlas-boxplot-cap", x1: scale(minimum), y1: y - 22, x2: scale(minimum), y2: y + 22 }));
  svg.append(svgElement("line", { class: "atlas-boxplot-cap", x1: scale(maximum), y1: y - 22, x2: scale(maximum), y2: y + 22 }));
  svg.append(svgElement("rect", { class: "atlas-boxplot-box", x: scale(summary.q1), y: y - 30, width: Math.max(1, scale(summary.q3) - scale(summary.q1)), height: 60, rx: 6 }));
  svg.append(svgElement("line", { class: "atlas-boxplot-median", x1: scale(summary.q2), y1: y - 30, x2: scale(summary.q2), y2: y + 30 }));
  const labels = [[minimum, "最小"], [summary.q1, "Q1"], [summary.q2, "中央値"], [summary.q3, "Q3"], [maximum, "最大"]];
  labels.forEach(([value, label], index) => {
    const text = svgElement("text", { class: "atlas-boxplot-label", x: scale(value), y: index % 2 === 0 ? y + 54 : y - 42 });
    text.textContent = `${label} ${formatNumber(value)}`;
    svg.append(text);
  });
  return { ...summary, min: minimum, max: maximum };
}

function mountBoxplotScene(container, config = {}) {
  const configuredValues = Array.isArray(config.data?.values) ? config.data.values.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const initialValues = configuredValues.length > 0 && configuredValues.every(Number.isFinite) ? configuredValues : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let values = [...initialValues];
  let selectedIndex = 0;
  let dragging = false;
  let destroyed = false;
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "箱ひげ図の操作",
    resultLabel: "五数要約",
    rootClass: "atlas-boxplot-scene"
  });
  const svg = createSvg(`0 0 ${DISPLAY_WIDTH} 260`, "データ点と五数要約から作る箱ひげ図");
  diagram.append(svg);
  const summary = document.createElement("p");
  summary.className = "atlas-data-summary atlas-boxplot-summary";
  result.append(summary);
  const pointControl = createSelectControl({
    label: "選択中データ",
    value: selectedIndex,
    options: values.map((_, index) => ({ value: index, label: `データ${index + 1}` })),
    onChange: (value) => setSelectedIndex(value)
  });
  const valueControl = createRangeControl({
    label: "選択中の値",
    min: 0,
    max: 10,
    step: 1,
    value: values[selectedIndex],
    onInput: (value) => setPointValue(value)
  });
  controls.append(pointControl.wrapper, valueControl.wrapper);

  const handlePointerMove = (event) => {
    if (dragging) setPointValue(valueFromPointer(event));
  };
  const handlePointerUp = () => { dragging = false; };
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  function valueFromPointer(event) {
    const rect = svg.getBoundingClientRect();
    return clamp(Math.round(clamp((event.clientX - rect.left) / rect.width, 0, 1) * 10), 0, 10);
  }
  function setSelectedIndex(index) {
    if (destroyed || !Number.isInteger(Number(index))) return;
    selectedIndex = clamp(Number(index), 0, values.length - 1);
    valueControl.setValue(values[selectedIndex]);
    render();
  }
  function setPointValue(value) {
    if (destroyed) return;
    values[selectedIndex] = clamp(Math.round(finite(value, values[selectedIndex])), 0, 10);
    valueControl.setValue(values[selectedIndex]);
    render();
  }
  function render() {
    svg.replaceChildren();
    const scale = drawAxis(svg, { min: 0, max: 10, y: 72, tickStep: 1 });
    values.forEach((value, index) => {
      const point = svgElement("circle", { class: `atlas-data-point atlas-boxplot-raw-point${index === selectedIndex ? " is-selected" : ""}`, cx: scale(value), cy: 72, r: index === selectedIndex ? 10 : 8 });
      point.setAttribute("aria-label", `データ${index + 1}: ${formatNumber(value)}`);
      point.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        selectedIndex = index;
        pointControl.select.value = String(index);
        dragging = true;
        point.setPointerCapture?.(event.pointerId);
        setPointValue(valueFromPointer(event));
      });
      point.addEventListener("pointerup", () => { dragging = false; });
      point.addEventListener("pointercancel", () => { dragging = false; });
      svg.append(point);
    });
    const fiveNumber = drawBoxplot(svg, values);
    valueControl.setValue(values[selectedIndex]);
    summary.textContent = `最小値 = ${formatNumber(fiveNumber.min)}　／　Q1 = ${formatNumber(fiveNumber.q1)}　／　中央値 = ${formatNumber(fiveNumber.q2)}　／　Q3 = ${formatNumber(fiveNumber.q3)}　／　最大値 = ${formatNumber(fiveNumber.max)}`;
    config.onStateChange?.({ values: [...values], selectedIndex }, summary.textContent);
  }
  function reset() { values = [...initialValues]; selectedIndex = 0; pointControl.select.value = "0"; render(); }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    cleanupScene(container, [pointControl.cleanup, valueControl.cleanup]);
  }
  function setParameter(name, value) {
    if (name === "selectedIndex") setSelectedIndex(Number(value));
    if (name === "pointValue") setPointValue(Number(value));
  }
  render();
  return { reset, destroy, getState: () => ({ values: [...values], selectedIndex }), setParameter };
}

function mountCorrelationScene(container, config = {}) {
  const initialTrend = clamp(finite(config.initial?.trend, 1), -2, 2);
  const initialNoise = clamp(finite(config.initial?.noise, 1), 0, 4);
  let trend = initialTrend;
  let noise = initialNoise;
  let destroyed = false;
  const configuredX = Array.isArray(config.data?.x) ? config.data.x.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8];
  const configuredNoise = Array.isArray(config.data?.noisePattern) ? config.data.noisePattern.map(Number) : [-1.2, 0.6, -0.4, 1.0, -0.8, 0.3, 1.1, -0.5];
  const xValues = configuredX.length > 1 && configuredX.every(Number.isFinite) ? configuredX : [1, 2, 3, 4, 5, 6, 7, 8];
  const noisePattern = configuredNoise.length === xValues.length && configuredNoise.every(Number.isFinite) ? configuredNoise : xValues.map(() => 0);
  const { controls, result, diagram } = createLayout(container, {
    controlsLabel: "相関係数の操作",
    resultLabel: "相関係数",
    rootClass: "atlas-correlation-scene"
  });
  const svg = createSvg(`0 0 ${DISPLAY_WIDTH} 360`, "傾向とばらつきを変えられる散布図");
  diagram.append(svg);
  const formula = document.createElement("div");
  formula.className = "atlas-data-formula";
  const summary = document.createElement("p");
  summary.className = "atlas-data-summary";
  result.append(formula, summary);
  const trendControl = createRangeControl({ label: "傾向 trend", min: -2, max: 2, step: 0.5, value: trend, onInput: (value) => setParameter("trend", value) });
  const noiseControl = createRangeControl({ label: "ばらつき noise", min: 0, max: 4, step: 0.5, value: noise, onInput: (value) => setParameter("noise", value) });
  controls.append(trendControl.wrapper, noiseControl.wrapper);

  function render() {
    const xCenter = mean(xValues);
    const xMinimum = Math.min(...xValues);
    const xMaximum = Math.max(...xValues);
    const xSpan = Math.max(1, xMaximum - xMinimum);
    const yValues = xValues.map((x, index) => 5 + trend * (x - xCenter) + noise * noisePattern[index]);
    const coefficient = correlationCoefficient(xValues, yValues);
    svg.replaceChildren();
    const left = 54;
    const right = 634;
    const top = 32;
    const bottom = 300;
    const xScale = (value) => left + ((value - xMinimum) / xSpan) * (right - left);
    const yScale = (value) => bottom - ((value + 8) / 26) * (bottom - top);
    for (let value = -5; value <= 15; value += 5) {
      const y = yScale(value);
      svg.append(svgElement("line", { class: "atlas-data-grid-line", x1: left, y1: y, x2: right, y2: y }));
      const label = svgElement("text", { class: "atlas-data-axis-label", x: left - 10, y: y + 4 });
      label.textContent = String(value);
      svg.append(label);
    }
    svg.append(
      svgElement("line", { class: "atlas-data-axis", x1: left, y1: bottom, x2: right, y2: bottom }),
      svgElement("line", { class: "atlas-data-axis", x1: left, y1: top, x2: left, y2: bottom })
    );
    xValues.forEach((value) => {
      const tick = svgElement("text", { class: "atlas-data-axis-label", x: xScale(value), y: bottom + 24 });
      tick.textContent = String(value);
      svg.append(tick);
    });
    yValues.forEach((value, index) => {
      const point = svgElement("circle", { class: "atlas-data-point atlas-scatterplot-point", cx: xScale(xValues[index]), cy: yScale(value), r: 8 });
      point.setAttribute("aria-label", `(${xValues[index]}, ${formatNumber(value)})`);
      svg.append(point);
    });
    const label = svgElement("text", { class: "atlas-data-scatter-label", x: 58, y: 24 });
    label.textContent = `r = ${formatCorrelation(coefficient)}`;
    svg.append(label);
    trendControl.setValue(trend);
    noiseControl.setValue(noise);
    renderFormula(formula, "r=\\frac{\\sum(x-\\bar{x})(y-\\bar{y})}{\\sqrt{\\sum(x-\\bar{x})^2\\sum(y-\\bar{y})^2}}", "r = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)²Σ(y−ȳ)²)");
    summary.textContent = coefficient === null
      ? "相関係数：定義できません（yの値がすべて同じです）"
      : `相関係数 r = ${formatCorrelation(coefficient)}　／　傾向 = ${formatNumber(trend)}　／　ばらつき = ${formatNumber(noise)}`;
    config.onStateChange?.({ trend, noise }, summary.textContent);
  }
  function setParameter(name, value) {
    if (destroyed) return;
    if (name === "trend") trend = clamp(finite(value, initialTrend), -2, 2);
    if (name === "noise") noise = clamp(finite(value, initialNoise), 0, 4);
    render();
  }
  function reset() { trend = initialTrend; noise = initialNoise; render(); }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, [trendControl.cleanup, noiseControl.cleanup]);
  }
  render();
  return { reset, destroy, getState: () => ({ trend, noise }), setParameter };
}

export function mountDataLab(container, config = {}) {
  const mountScene = DATA_LAB_MODES[config.mode];
  if (!mountScene) throw new Error(`Unsupported data lab mode: ${config.mode || "(empty)"}`);
  return mountScene(container, config);
}

import { clampProbeX, moveVertex, normalizeCoefficient, quadraticExpression, quadraticY } from "../../math/canonical-quadratic.js?v=20260913-r4";
import { COLORS, createState, format } from "./common.js?v=20260913-r4";

function stateSummary(state) {
  return `${quadraticExpression(state)} ／ 頂点 (${format(state.h)}, ${format(state.k)})`;
}

function keyboardButton(context, label, onKeyDown) {
  const button = context.button(label, () => {});
  button.className = "atlas-canonical-keyboard-target";
  button.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown");
  button.addEventListener("keydown", onKeyDown);
  return button;
}

function notifyBoard(context) {
  context.board?.update();
}

function createPointerHandle(context, { label, testId, getPosition, onMove }) {
  context.host.style.position = "relative";
  const layer = document.createElement("div");
  layer.className = "atlas-canonical-handle-layer";
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "atlas-canonical-drag-handle";
  handle.textContent = label;
  handle.dataset.testid = testId;
  handle.setAttribute("aria-label", `${label}をドラッグ`);
  layer.append(handle);
  context.host.append(layer);
  const positionHandle = () => {
    const rect = context.host.getBoundingClientRect();
    const { x, y } = getPosition();
    handle.style.left = `${((x + 6) / 12) * rect.width}px`;
    handle.style.top = `${((6 - y) / 12) * rect.height}px`;
  };
  const onPointerMove = (event) => {
    const rect = context.host.getBoundingClientRect();
    onMove({ x: ((event.clientX - rect.left) / rect.width) * 12 - 6, y: 6 - ((event.clientY - rect.top) / rect.height) * 12 });
  };
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", () => handle.removeEventListener("pointermove", onPointerMove), { once: true });
  });
  return { handle, positionHandle };
}

export function mountCanonicalVertexDrag(context, config) {
  const state = createState(config, { a: 1, h: 0, k: 0 });
  const bounds = { h: [-5, 5], k: [-5, 5] };
  context.graph((x) => quadraticY(state, x));
  context.board?.create("line", [[() => state.h, -6], [() => state.h, 6]], { straightFirst: false, straightLast: false, strokeColor: COLORS.construction, strokeWidth: 2, dash: 2, fixed: true, highlight: false });
  const vertex = context.point([() => state.h, () => state.k], { id: "canonical-vertex-handle", name: "V", size: 7, fixed: false, strokeColor: COLORS.text, fillColor: COLORS.highlight });
  const announce = () => config.onStateChange?.({ ...state }, stateSummary(state));
  let updatePointerHandle = () => {};
  const sync = () => { vertex?.moveTo([state.h, state.k], 0); notifyBoard(context); announce(); updatePointerHandle(); };
  vertex?.on("drag", () => { Object.assign(state, moveVertex(state, vertex.X(), vertex.Y(), bounds)); sync(); });
  const pointerHandle = createPointerHandle(context, { label: "V", testId: "canonical-vertex-handle", getPosition: () => ({ x: state.h, y: state.k }), onMove: ({ x, y }) => { Object.assign(state, moveVertex(state, x, y, bounds)); sync(); } });
  updatePointerHandle = pointerHandle.positionHandle;
  keyboardButton(context, "頂点を選択して矢印キーで移動", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[event.key];
    Object.assign(state, moveVertex(state, state.h + delta[0], state.k + delta[1], bounds));
    sync();
  });
  updatePointerHandle();
  announce();
  return {
    reset() { Object.assign(state, config.initial || { a: 1, h: 0, k: 0 }); sync(); },
    getState: () => ({ ...state }),
    setParameter(name, value) { if (["h", "k"].includes(name)) Object.assign(state, moveVertex(state, name === "h" ? value : state.h, name === "k" ? value : state.k, bounds)); sync(); }
  };
}

function appendRange(context, config, state, onInput) {
  const definition = config.parameters?.a || { label: "係数 a", min: -3, max: 3, step: 0.1 };
  const label = document.createElement("label");
  label.className = "atlas-canonical-slider-control";
  const title = document.createElement("span");
  title.textContent = definition.label || "係数 a";
  const output = document.createElement("output");
  output.textContent = format(state.a);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(definition.min);
  input.max = String(definition.max);
  input.step = String(definition.step);
  input.value = String(state.a);
  input.setAttribute("aria-label", "二次関数の係数aを操作");
  input.addEventListener("input", () => { onInput(normalizeCoefficient(input.value, definition.min, definition.max, definition.step)); output.textContent = format(state.a); });
  label.append(title, input, output);
  context.controls.append(label);
  return { input, output, definition };
}

export function mountCanonicalCoefficientSlider(context, config) {
  const state = createState(config, { a: 1, h: 0, k: 0 });
  context.graph((x) => quadraticY(state, x));
  context.text(-5.6, 5.2, () => `a = ${format(state.a)}`, { fontSize: 16, strokeColor: COLORS.primary });
  context.text(-5.6, 4.6, () => quadraticExpression(state));
  let range;
  const announce = () => config.onStateChange?.({ ...state }, `${quadraticExpression(state)} ／ a = ${format(state.a)}`);
  const sync = () => { if (range) { range.input.value = String(state.a); range.output.textContent = format(state.a); } notifyBoard(context); announce(); };
  range = appendRange(context, config, state, (value) => { state.a = value; sync(); });
  keyboardButton(context, "係数スライダーを選択", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const { min, max, step } = range.definition;
    state.a = normalizeCoefficient(state.a + direction * Number(step), min, max, step);
    sync();
  });
  announce();
  return {
    reset() { Object.assign(state, config.initial || { a: 1, h: 0, k: 0 }); sync(); },
    getState: () => ({ ...state }),
    setParameter(name, value) { if (name === "a") state.a = normalizeCoefficient(value, range.definition.min, range.definition.max, range.definition.step); sync(); }
  };
}

export function mountCanonicalCurveProbe(context, config) {
  const state = createState(config, { a: 1, h: 0, k: 0, probeX: 1, probeY: 1 });
  const domain = [-5, 5];
  context.graph((x) => quadraticY(state, x));
  const probe = context.point([() => state.probeX, () => state.probeY], { id: "canonical-curve-probe", name: "P", size: 7, fixed: false, strokeColor: COLORS.text, fillColor: COLORS.highlight });
  const announce = () => config.onStateChange?.({ ...state }, `P (${format(state.probeX)}, ${format(state.probeY)}) ／ ${quadraticExpression(state)}`);
  let updatePointerHandle = () => {};
  const sync = () => { state.probeY = quadraticY(state, state.probeX); probe?.moveTo([state.probeX, state.probeY], 0); notifyBoard(context); announce(); updatePointerHandle(); };
  probe?.on("drag", () => { state.probeX = clampProbeX(probe.X(), domain); sync(); });
  const pointerHandle = createPointerHandle(context, { label: "P", testId: "canonical-curve-probe", getPosition: () => ({ x: state.probeX, y: state.probeY }), onMove: ({ x }) => { state.probeX = clampProbeX(x, domain); sync(); } });
  updatePointerHandle = pointerHandle.positionHandle;
  keyboardButton(context, "曲線上の点を選択して左右キーで移動", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    state.probeX = clampProbeX(state.probeX + (event.key === "ArrowRight" ? 1 : -1), domain);
    sync();
  });
  sync();
  return {
    reset() { Object.assign(state, config.initial || { a: 1, h: 0, k: 0, probeX: 1, probeY: 1 }); sync(); },
    getState: () => ({ ...state }),
    setParameter(name, value) { if (name === "probeX") { state.probeX = clampProbeX(value, domain); sync(); } }
  };
}

export const canonicalScenes = Object.freeze({
  "canonical-vertex-drag": mountCanonicalVertexDrag,
  "canonical-coefficient-slider": mountCanonicalCoefficientSlider,
  "canonical-curve-probe": mountCanonicalCurveProbe
});

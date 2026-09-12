import { formatIntervalSet, quadraticDiscriminant, quadraticExpression, quadraticInequalityIntervals, quadraticLineIntersections, quadraticRoots, quadraticThroughPoints, quadraticValue } from "../math/quadratic.js?v=20260912-6g";

const COLORS = { primary: "#2563eb", secondary: "#e11d48", helper: "#64748b", construction: "#94a3b8", highlight: "#f59e0b", text: "#1f2937" };
const BOARD_BOUNDS = [-6, 6, 6, -6];
const EPSILON = 1e-8;
let sequence = 0;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const format = (value) => { const number = finite(value); if (Object.is(number, -0)) return "0"; return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); };
const equation = (coefficients) => `y = ${quadraticExpression(coefficients)}`;

function createContext(container) {
  const host = document.createElement("div");
  host.id = `atlas-function-graph-${++sequence}`;
  host.className = "jxgbox atlas-function-graph-board";
  container.replaceChildren(host);
  const board = globalThis.JXG?.JSXGraph?.initBoard(host.id, { boundingbox: BOARD_BOUNDS, axis: true, keepAspectRatio: false, showCopyright: false, showNavigation: false, pan: { enabled: false }, zoom: { enabled: false }, grid: { strokeColor: "#e2e8f0", strokeWidth: 1 } }) || null;
  if (!board) {
    const fallback = document.createElement("p");
    fallback.className = "atlas-canvas-fallback";
    fallback.textContent = "グラフライブラリを読み込めません。下の操作欄で関係を観察できます。";
    container.append(fallback);
  }
  const controls = document.createElement("div");
  controls.className = "atlas-function-graph-scene-controls";
  container.append(controls);
  const cleanup = [];
  const observer = globalThis.ResizeObserver ? new ResizeObserver(() => { board?.resizeContainer(host.clientWidth, host.clientHeight); board?.fullUpdate(); }) : null;
  observer?.observe(host);
  cleanup.push(() => observer?.disconnect());
  function text(x, y, value, options = {}) { return board?.create("text", [x, y, value], { fixed: true, highlight: false, fontSize: 14, strokeColor: COLORS.text, ...options }); }
  function graph(value, options = {}) { return board?.create("functiongraph", [value, -6, 6], { strokeColor: COLORS.primary, strokeWidth: 3, fixed: true, highlight: false, ...options }); }
  function point(coords, options = {}) { return board?.create("point", coords, { name: "", size: 5, strokeColor: COLORS.secondary, fillColor: COLORS.highlight, fixed: true, highlight: false, ...options }); }
  function button(label, onClick) { const item = document.createElement("button"); item.type = "button"; item.textContent = label; item.addEventListener("click", onClick); controls.append(item); cleanup.push(() => item.remove()); return item; }
  return { board, controls, host, text, graph, point, button, cleanup, destroy() { cleanup.forEach((fn) => fn()); if (board && globalThis.JXG?.JSXGraph?.freeBoard) globalThis.JXG.JSXGraph.freeBoard(board); container.replaceChildren(); } };
}

function createState(config, defaults) { return { ...defaults, ...(config.initial || {}) }; }
function parameterBounds(config, name, fallback = { min: -Infinity, max: Infinity }) { const item = config.parameters?.[name] || {}; return { min: Number.isFinite(Number(item.min)) ? Number(item.min) : fallback.min, max: Number.isFinite(Number(item.max)) ? Number(item.max) : fallback.max }; }
function clampParameter(config, name, value, fallback) { const bounds = parameterBounds(config, name, fallback); return Math.min(bounds.max, Math.max(bounds.min, finite(value))); }

function mountQuadraticBasicScene(context, config) {
  const state = createState(config, { a: 1 });
  context.graph((x) => state.a * x * x);
  context.text(-5.6, 5.2, () => `a = ${format(state.a)}`, { fontSize: 16, strokeColor: COLORS.primary });
  context.text(-5.6, 4.6, () => state.a === 0 ? "y = 0" : state.a === 1 ? "y = x²" : state.a === -1 ? "y = −x²" : `y = ${format(state.a)}x²`);
  context.text(-5.6, 4, () => state.a === 0 ? "a = 0 では二次関数ではありません。" : "", { fontSize: 12, strokeColor: COLORS.secondary });
  const notify = () => config.onStateChange?.({ ...state }, state.a === 0 ? "a = 0 では二次関数ではありません。" : `y = ${format(state.a)}x²`);
  notify();
  return { setParameter(name, value) { if (name === "a") state.a = clampParameter(config, name, value, { min: -3, max: 3 }); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { a: 1 }); notify(); context.board?.update(); }, getState: () => ({ ...state }) };
}

function mountQuadraticVertexScene(context, config) {
  const state = createState(config, { a: 1, p: 0, q: 0 });
  context.graph((x) => state.a * (x - state.p) ** 2 + state.q);
  context.board?.create("line", [[() => state.p, -6], [() => state.p, 6]], { straightFirst: false, straightLast: false, strokeColor: COLORS.construction, strokeWidth: 2, dash: 2, fixed: true, highlight: false });
  context.point([() => state.p, () => state.q], { name: "V", fillColor: COLORS.highlight, strokeColor: COLORS.text });
  const notify = () => config.onStateChange?.({ ...state }, `頂点 (${format(state.p)}, ${format(state.q)}) ／ 対称軸 x = ${format(state.p)}`);
  notify();
  return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { a: 1, p: 0, q: 0 }); notify(); context.board?.update(); }, getState: () => ({ ...state }) };
}

function mountDiscriminantScene(context, config) {
  const state = createState(config, { a: 1, b: 0, c: -1 });
  const roots = [context.point([0, 0]), context.point([0, 0])];
  context.graph((x) => quadraticValue(state, x));
  context.text(-5.6, 5.2, () => Math.abs(state.a) < EPSILON ? "判定対象外" : `D = ${format(quadraticDiscriminant(state))}`, { fontSize: 16, strokeColor: COLORS.secondary });
  context.text(-5.6, 4.6, () => equation(state));
  context.text(-5.6, 4, () => Math.abs(state.a) < EPSILON ? "a = 0 では二次方程式ではありません。" : `実数解：${quadraticRoots(state).length}個`, { fontSize: 12, strokeColor: COLORS.helper });
  const notify = () => { const values = quadraticRoots(state); roots.forEach((root, index) => { const value = values[index]; root?.moveTo([Number.isFinite(value) ? value : 0, 0], 0); root?.setAttribute({ visible: Number.isFinite(value) }); }); context.board?.update(); config.onStateChange?.({ ...state }, Math.abs(state.a) < EPSILON ? "a = 0 では二次方程式ではありません。" : `D = ${format(quadraticDiscriminant(state))} ／ 交点 = ${quadraticRoots(state).length}個`); };
  notify();
  return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value); notify(); }, reset() { Object.assign(state, config.initial || { a: 1, b: 0, c: -1 }); notify(); }, getState: () => ({ ...state }) };
}

function mountThreePointScene(context, config) {
  const state = createState(config, { y1: 3, y2: -1, y3: 3 });
  const xs = [-2, 0, 2];
  const guides = xs.map((x) => context.board?.create("line", [[x, -6], [x, 6]], { strokeColor: COLORS.construction, strokeWidth: 1, dash: 2, fixed: true, highlight: false }));
  const points = xs.map((x, index) => context.board ? context.board.create("glider", [x, state[`y${index + 1}`], guides[index]], { name: `P${index + 1}`, size: 5, strokeColor: COLORS.secondary, fillColor: COLORS.highlight, fixed: false, highlight: false }) : null);
  context.graph((x) => { const result = quadraticThroughPoints(xs.map((value, index) => ({ x: value, y: state[`y${index + 1}`] }))); return result ? quadraticValue(result, x) : 0; });
  context.text(-5.6, 5.2, () => { const result = quadraticThroughPoints(xs.map((value, index) => ({ x: value, y: state[`y${index + 1}`] }))); return result ? equation(result) : "3点から放物線を決められません"; }, { fontSize: 15, strokeColor: COLORS.primary });
  function notify() { points.forEach((point, index) => point?.moveTo([xs[index], state[`y${index + 1}`]], 0)); const result = quadraticThroughPoints(xs.map((value, index) => ({ x: value, y: state[`y${index + 1}`] }))); context.board?.update(); config.onStateChange?.({ ...state }, result ? `${equation(result)} ／ 3点を通る放物線` : "x座標が重複すると放物線を決められません"); }
  points.forEach((point, index) => point?.on("drag", () => { state[`y${index + 1}`] = clampParameter(config, `y${index + 1}`, point.Y(), { min: -5, max: 5 }); notify(); }));
  notify();
  return { setParameter(name, value) { if (["y1", "y2", "y3"].includes(name)) state[name] = clampParameter(config, name, value, { min: -5, max: 5 }); notify(); }, reset() { Object.assign(state, config.initial || { y1: 3, y2: -1, y3: 3 }); notify(); }, getState: () => ({ ...state }) };
}

function mountQuadraticInequalityScene(context, config) {
  const state = createState(config, { a: 1, b: 0, c: -4, operator: ">" });
  context.graph((x) => quadraticValue(state, x));
  const roots = [context.point([0, 0]), context.point([0, 0])];
  const select = document.createElement("select"); select.setAttribute("aria-label", "二次不等式の不等号");
  [">", "≥", "<", "≤"].forEach((operator) => { const option = document.createElement("option"); option.value = operator; option.textContent = operator; select.append(option); }); select.value = state.operator;
  const line = document.createElement("div"); line.className = "atlas-inequality-number-line"; context.controls.append(select, line);
  function notify() { const values = quadraticRoots(state); roots.forEach((point, index) => { const value = values[index]; point?.moveTo([Number.isFinite(value) ? value : 0, 0], 0); point?.setAttribute({ visible: Number.isFinite(value) }); }); const intervals = quadraticInequalityIntervals(state); line.textContent = `解：${formatIntervalSet(intervals)}`; context.board?.update(); config.onStateChange?.({ ...state }, `${quadraticExpression(state)} ${state.operator} 0 ／ 解：${formatIntervalSet(intervals)}`); }
  select.addEventListener("change", () => { state.operator = select.value; notify(); });
  notify();
  return { setParameter(name, value) { if (name === "operator" && [">", "≥", "<", "≤"].includes(value)) state.operator = value; else if (config.parameters?.[name]) state[name] = clampParameter(config, name, value); select.value = state.operator; notify(); }, reset() { Object.assign(state, config.initial || { a: 1, b: 0, c: -4, operator: ">" }); select.value = state.operator; notify(); }, getState: () => ({ ...state }) };
}

function mountParameterIntersectionScene(context, config) {
  const state = createState(config, { m: 2, k: 0 });
  const quadratic = (x) => x * x; const line = (x) => state.m * x + state.k;
  context.graph(quadratic); context.board?.create("functiongraph", [line, -6, 6], { strokeColor: COLORS.secondary, strokeWidth: 3, fixed: true, highlight: false });
  const points = [context.point([0, 0]), context.point([0, 0])]; context.text(-5.6, 5.2, () => `D = ${format(state.m ** 2 + 4 * state.k)}`, { fontSize: 16, strokeColor: COLORS.secondary });
  function notify() { const values = quadraticLineIntersections({ quadratic: { a: 1, b: 0, c: 0 }, line: { m: state.m, k: state.k } }); points.forEach((point, index) => { const value = values[index]; point?.moveTo([Number.isFinite(value) ? value : 0, Number.isFinite(value) ? quadratic(value) : 0], 0); point?.setAttribute({ visible: Number.isFinite(value) }); }); context.board?.update(); config.onStateChange?.({ ...state }, `共有点：${values.length}個 ／ D = ${format(state.m ** 2 + 4 * state.k)}`); }
  notify();
  return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value); notify(); }, reset() { Object.assign(state, config.initial || { m: 2, k: 0 }); notify(); }, getState: () => ({ ...state }) };
}

const FUNCTION_GRAPH_MODES = Object.freeze({ "quadratic-basic": mountQuadraticBasicScene, "quadratic-vertex": mountQuadraticVertexScene, "quadratic-discriminant": mountDiscriminantScene, "three-point-parabola": mountThreePointScene, "quadratic-inequality": mountQuadraticInequalityScene, "parameter-intersections": mountParameterIntersectionScene });

export function mountFunctionGraph(container, config = {}) {
  const mount = FUNCTION_GRAPH_MODES[config.mode];
  if (!mount) throw new Error(`Unsupported function graph mode: ${config.mode || "(empty)"}`);
  const context = createContext(container);
  const scene = mount(context, config);
  return { reset: scene.reset, destroy: context.destroy, getState: scene.getState, setParameter: scene.setParameter };
}

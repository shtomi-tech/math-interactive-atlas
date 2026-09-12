import { formatIntervalSet, quadraticDiscriminant, quadraticExpression, quadraticInequalityIntervals, quadraticLineIntersections, quadraticRoots, quadraticThroughPoints, quadraticValue } from "../math/quadratic.js?v=20260912-7i";
import { exponentialValue, logarithmValue } from "../math/exponential-logarithm.js?v=20260912-7i";
import { derivativeValue, polynomialValue, secantSlope, tangentLine } from "../math/calculus.js?v=20260912-7i";
import { trigFunctionValue, transformedTrigValue } from "../math/trigonometry.js?v=20260912-7i";

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
  function graph(value, options = {}) { const { domain = [-6, 6], ...graphOptions } = options; return board?.create("functiongraph", [value, domain[0], domain[1]], { strokeColor: COLORS.primary, strokeWidth: 3, fixed: true, highlight: false, ...graphOptions }); }
  function point(coords, options = {}) { return board?.create("point", coords, { name: "", size: 5, strokeColor: COLORS.secondary, fillColor: COLORS.highlight, fixed: true, highlight: false, ...options }); }
  function button(label, pressedOrOnClick, maybeOnClick) {
    const pressed = typeof pressedOrOnClick === "boolean" ? pressedOrOnClick : false;
    const onClick = typeof pressedOrOnClick === "function" ? pressedOrOnClick : maybeOnClick;
    const item = document.createElement("button"); item.type = "button"; item.textContent = label;
    if (maybeOnClick) item.setAttribute("aria-pressed", String(pressed));
    item.addEventListener("click", onClick); controls.append(item); cleanup.push(() => item.remove()); return item;
  }
  function secondaryBoard(bounds = BOARD_BOUNDS) {
    const secondaryHost = document.createElement("div"); secondaryHost.className = "jxgbox atlas-function-graph-secondary-board"; secondaryHost.id = `atlas-function-graph-secondary-${++sequence}`; container.insertBefore(secondaryHost, controls);
    const secondary = globalThis.JXG?.JSXGraph?.initBoard(secondaryHost.id, { boundingbox: bounds, axis: true, keepAspectRatio: false, showCopyright: false, showNavigation: false, pan: { enabled: false }, zoom: { enabled: false }, grid: { strokeColor: "#e2e8f0", strokeWidth: 1 } }) || null;
    if (secondary) cleanup.push(() => globalThis.JXG.JSXGraph.freeBoard(secondary)); else { const fallback = document.createElement("p"); fallback.textContent = "補助グラフを読み込めません。下の数値表示を確認してください。"; secondaryHost.append(fallback); }
    cleanup.push(() => secondaryHost.remove());
    return secondary;
  }
  return { board, controls, host, text, graph, point, button, secondaryBoard, cleanup, destroy() { cleanup.forEach((fn) => fn()); if (board && globalThis.JXG?.JSXGraph?.freeBoard) globalThis.JXG.JSXGraph.freeBoard(board); container.replaceChildren(); } };
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

function mountExponentialBaseScene(context, config) {
  const state = createState(config, { a: 2 });
  const value = (x) => exponentialValue(state.a, x) ?? 0;
  context.graph(value, { domain: [-3, 3] });
  context.point([0, 1], { name: "(0,1)", fillColor: COLORS.highlight });
  context.text(-5.6, 5.2, () => `y = ${format(state.a)}^x`, { fontSize: 16, strokeColor: COLORS.primary });
  const notify = () => config.onStateChange?.({ ...state }, `底 a=${format(state.a)} ／ x=0で y=1 ／ ${state.a > 1 ? "増加" : "減少"}する指数関数`);
  notify();
  return { setParameter(name, value) { if (name === "a") state.a = clampParameter(config, name, value, { min: .2, max: 3 }); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { a: 2 }); notify(); context.board?.update(); }, getState: () => ({ ...state }) };
}

function mountLogInverseScene(context, config) {
  const state = createState(config, { a: 2, x: 1 });
  const exp = (x) => exponentialValue(state.a, x) ?? 0; const logarithm = (x) => logarithmValue(state.a, x) ?? 0;
  context.graph(exp, { domain: [-3, 3], strokeColor: COLORS.primary }); context.graph(logarithm, { domain: [.08, 5], strokeColor: COLORS.secondary });
  context.board?.create("line", [[-5, -5], [5, 5]], { strokeColor: COLORS.helper, dash: 2, fixed: true, highlight: false });
  const direct = context.point([() => state.x, () => exp(state.x)], { name: "P", fillColor: COLORS.primary });
  const inverse = context.point([() => exp(state.x), () => state.x], { name: "P'", fillColor: COLORS.secondary });
  const notify = () => { direct?.setAttribute({ visible: validNumber(state.a) }); inverse?.setAttribute({ visible: validNumber(state.a) }); config.onStateChange?.({ ...state }, `P=(${format(state.x)}, ${format(exp(state.x))}) ↔ P'=(${format(exp(state.x))}, ${format(state.x)}) ／ y=xに関して対称`); context.board?.update(); };
  notify();
  return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value, name === "a" ? { min: .2, max: 3 } : { min: -2, max: 2 }); notify(); }, reset() { Object.assign(state, config.initial || { a: 2, x: 1 }); notify(); }, getState: () => ({ ...state }) };
}

function validNumber(value) { return Number.isFinite(Number(value)); }
function mountLogarithmBaseScene(context, config) {
  const state = createState(config, { a: 2 });
  const value = (x) => logarithmValue(state.a, x) ?? 0;
  context.graph(value, { domain: [.08, 6] }); context.board?.create("line", [[0, -6], [0, 6]], { strokeColor: COLORS.helper, dash: 2, fixed: true, highlight: false }); context.point([1, 0], { name: "(1,0)", fillColor: COLORS.highlight });
  context.text(-5.6, 5.2, () => `y = log_${format(state.a)} x`, { fontSize: 16, strokeColor: COLORS.primary });
  const notify = () => config.onStateChange?.({ ...state }, `底 a=${format(state.a)} ／ (1,0)を通る ／ x>0で定義 ${state.a > 1 ? "増加" : "減少"}`);
  notify();
  return { setParameter(name, value) { if (name === "a") state.a = clampParameter(config, name, value, { min: .2, max: 3 }); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { a: 2 }); notify(); context.board?.update(); }, getState: () => ({ ...state }) };
}

function mountExponentialEquationScene(context, config) {
  const state = createState(config, { k: 2 }); const exp = (x) => exponentialValue(2, x) ?? 0;
  context.graph(exp, { domain: [-3, 3] }); context.board?.create("functiongraph", [() => state.k, -3, 3], { strokeColor: COLORS.secondary, strokeWidth: 3, fixed: true, highlight: false });
  const point = context.point([() => logarithmValue(2, state.k) ?? 0, () => state.k], { name: "共有点", fillColor: COLORS.highlight });
  context.text(-5.6, 5.2, () => `y=2^x と y=${format(state.k)}`, { fontSize: 15, strokeColor: COLORS.primary });
  const notify = () => { const solution = logarithmValue(2, state.k); point?.setAttribute({ visible: solution !== null }); config.onStateChange?.({ ...state }, `共有点の解 x=log₂${format(state.k)}=${solution === null ? "定義できません" : format(solution)}`); context.board?.update(); };
  notify();
  return { setParameter(name, value) { if (name === "k") state.k = clampParameter(config, name, value, { min: .25, max: 8 }); notify(); }, reset() { Object.assign(state, config.initial || { k: 2 }); notify(); }, getState: () => ({ ...state }) };
}

function mountTrigFunctionScene(context, config) {
  const state = createState(config, { functionName: "sin" }); const buttons = []; const names = { sin: "sin", cos: "cos", tan: "tan" }; const functions = { sin: (x) => trigFunctionValue({ functionName: "sin", x }) ?? 0, cos: (x) => trigFunctionValue({ functionName: "cos", x }) ?? 0, tan: (x) => trigFunctionValue({ functionName: "tan", x }) ?? 0 };
  const graph = (x) => functions[state.functionName](x);
  context.graph(graph, { domain: [-2 * Math.PI, 2 * Math.PI] });
  ["sin", "cos", "tan"].forEach((name) => { const item = context.button(names[name], state.functionName === name, () => { state.functionName = name; buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(["sin", "cos", "tan"][index] === name))); notify(); }); buttons.push(item); });
  function notify() { config.onStateChange?.({ ...state }, `y=${state.functionName} x ／ 範囲 −2π〜2π${state.functionName === "tan" ? " ／ x=π/2+kπでは定義できません" : " ／ 周期2π"}`); context.board?.update(); }
  notify();
  return { setParameter(name, value) { if (names[value]) state.functionName = value; notify(); }, reset() { state.functionName = config.initial?.functionName || "sin"; buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(["sin", "cos", "tan"][index] === state.functionName))); notify(); }, getState: () => ({ ...state }) };
}

function mountTrigTransformScene(context, config) {
  const state = createState(config, { A: 1, B: 1, C: 0, D: 0 }); const value = (x) => transformedTrigValue({ amplitude: state.A, frequency: state.B, phase: state.C, verticalShift: state.D, x }) ?? 0;
  context.graph(value, { domain: [-2 * Math.PI, 2 * Math.PI] }); context.text(-5.6, 5.2, () => `y=${format(state.A)}sin(${format(state.B)}(x−${format(state.C)}))+${format(state.D)}`, { fontSize: 13, strokeColor: COLORS.primary });
  const notify = () => config.onStateChange?.({ ...state }, `振幅=${format(Math.abs(state.A))} ／ 周期=${format(2 * Math.PI / Math.abs(state.B))} ／ 位相=${format(state.C)} ／ 中心線=${format(state.D)}`);
  notify();
  return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { A: 1, B: 1, C: 0, D: 0 }); notify(); context.board?.update(); }, getState: () => ({ ...state }) };
}

function mountSecantScene(context, config) {
  const state = createState(config, { a: 1, h: 1 }); const f = (x) => x * x;
  context.graph(f); context.graph((x) => { const slope = secantSlope([0, 0, 1], state.a, state.h); return slope === null ? 0 : f(state.a) + slope * (x - state.a); }, { strokeColor: COLORS.secondary }); context.graph((x) => 2 * state.a * x - state.a ** 2, { strokeColor: COLORS.highlight, dash: 2 });
  context.point([() => state.a, () => f(state.a)], { name: "P", fillColor: COLORS.highlight }); context.point([() => state.a + state.h, () => f(state.a + state.h)], { name: "Q", fillColor: COLORS.secondary });
  const notify = () => { const slope = secantSlope([0, 0, 1], state.a, state.h); config.onStateChange?.({ ...state }, `割線の傾き=${slope === null ? "h=0では未定義" : format(slope)} ／ 接線の傾き=2a=${format(2 * state.a)}`); context.board?.update(); };
  notify(); return { setParameter(name, value) { if (config.parameters?.[name]) state[name] = clampParameter(config, name, value, name === "a" ? { min: -3, max: 3 } : { min: -3, max: 3 }); notify(); }, reset() { Object.assign(state, config.initial || { a: 1, h: 1 }); notify(); }, getState: () => ({ ...state }) };
}

function mountDerivativeAtPointScene(context, config) {
  const state = createState(config, { functionName: "square", a: 1 }); const buttons = []; const functions = { square: [0, 0, 1], cubic: [0, -3, 0, 1] }; const f = (x) => polynomialValue(functions[state.functionName], x) ?? 0;
  context.graph(f); context.graph((x) => derivativeValue(functions[state.functionName], x) ?? 0, { strokeColor: COLORS.secondary, dash: 2 }); context.graph((x) => { const line = tangentLine(functions[state.functionName], state.a); return line ? line.slope * x + line.intercept : 0; }, { strokeColor: COLORS.highlight }); context.point([() => state.a, () => f(state.a)], { name: "a", fillColor: COLORS.highlight });
  ["square", "cubic"].forEach((name) => { const item = context.button(name === "square" ? "x²" : "x³−3x", state.functionName === name, () => { state.functionName = name; buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(["square", "cubic"][index] === name))); notify(); }); buttons.push(item); });
  function notify() { const slope = derivativeValue(functions[state.functionName], state.a) ?? 0; config.onStateChange?.({ ...state }, `${state.functionName === "square" ? "f=x²" : "f=x³−3x"} ／ f'(${format(state.a)})=${format(slope)} ／ 接線の傾き=${format(slope)}`); context.board?.update(); }
  notify(); return { setParameter(name, value) { if (name === "a") state.a = clampParameter(config, name, value, { min: -3, max: 3 }); notify(); }, reset() { Object.assign(state, config.initial || { functionName: "square", a: 1 }); notify(); }, getState: () => ({ ...state }) };
}

function mountFunctionDerivativeScene(context, config) {
  const state = createState(config, { a: 0 }); const coefficients = [0, -3, 0, 1]; const f = (x) => polynomialValue(coefficients, x) ?? 0; const derivative = (x) => derivativeValue(coefficients, x) ?? 0;
  context.graph(f); context.point([() => state.a, () => f(state.a)], { name: "f(a)", fillColor: COLORS.primary }); const secondary = context.secondaryBoard?.(); if (secondary) { secondary.create("functiongraph", [derivative, -6, 6], { strokeColor: COLORS.secondary, strokeWidth: 3, fixed: true, highlight: false }); secondary.create("point", [() => state.a, () => derivative(state.a)], { name: "f'(a)", fillColor: COLORS.highlight, fixed: true, highlight: false }); secondary.create("text", [-5.6, 5.2, () => `f'(x)=3x²−3 ／ f'(${format(state.a)})=${format(derivative(state.a))}`], { fixed: true, highlight: false, fontSize: 13, strokeColor: COLORS.secondary }); }
  const notify = () => config.onStateChange?.({ ...state }, `f(${format(state.a)})=${format(f(state.a))} ／ f'(${format(state.a)})=${format(derivative(state.a))} ／ ${derivative(state.a) > 0 ? "増加" : derivative(state.a) < 0 ? "減少" : "水平"}`);
  notify(); return { setParameter(name, value) { if (name === "a") state.a = clampParameter(config, name, value, { min: -3, max: 3 }); notify(); context.board?.update(); secondary?.update(); }, reset() { state.a = Number(config.initial?.a ?? 0); notify(); context.board?.update(); secondary?.update(); }, getState: () => ({ ...state }) };
}

function mountCubicExtremaScene(context, config) {
  const state = createState(config, { k: 1 }); const f = (x) => x ** 3 - 3 * state.k * x; const derivative = (x) => 3 * x * x - 3 * state.k;
  context.graph(f); context.graph(derivative, { strokeColor: COLORS.secondary, dash: 2 }); const points = [context.point([0, 0], { name: "極値", fillColor: COLORS.highlight }), context.point([0, 0], { name: "極値", fillColor: COLORS.highlight })];
  const notify = () => { const root = state.k > 0 ? Math.sqrt(state.k) : 0; const values = state.k > 0 ? [{ x: -root, y: f(-root) }, { x: root, y: f(root) }] : []; points.forEach((point, index) => { const item = values[index]; point?.setAttribute({ visible: Boolean(item) }); if (item) point.moveTo([item.x, item.y], 0); }); config.onStateChange?.({ ...state }, state.k > 0 ? `f'(x)=0：x=±${format(root)} ／ 左で極大 ${format(f(-root))}、右で極小 ${format(f(root))}` : "k≤0では極大・極小の組はありません"); context.board?.update(); };
  notify(); return { setParameter(name, value) { if (name === "k") state.k = clampParameter(config, name, value, { min: -2, max: 3 }); notify(); }, reset() { Object.assign(state, config.initial || { k: 1 }); notify(); }, getState: () => ({ ...state }) };
}

function mountIndefiniteIntegralScene(context, config) { const state = createState(config, { C: 0 }); context.graph((x) => x * x + state.C); context.graph((x) => 2 * x, { strokeColor: COLORS.secondary, dash: 2 }); context.text(-5.6, 5.2, () => `F(x)=x²+${format(state.C)} ／ F'(x)=2x`, { fontSize: 14, strokeColor: COLORS.primary }); const notify = () => config.onStateChange?.({ ...state }, `C=${format(state.C)} ／ 原始関数は上下に移動 ／ 導関数は2xで同じ`); notify(); return { setParameter(name, value) { if (name === "C") state.C = clampParameter(config, name, value, { min: -4, max: 4 }); notify(); context.board?.update(); }, reset() { Object.assign(state, config.initial || { C: 0 }); notify(); }, getState: () => ({ ...state }) }; }

const FUNCTION_GRAPH_MODES = Object.freeze({ "quadratic-basic": mountQuadraticBasicScene, "quadratic-vertex": mountQuadraticVertexScene, "quadratic-discriminant": mountDiscriminantScene, "three-point-parabola": mountThreePointScene, "quadratic-inequality": mountQuadraticInequalityScene, "parameter-intersections": mountParameterIntersectionScene, "exponential-base": mountExponentialBaseScene, "log-inverse": mountLogInverseScene, "logarithm-base": mountLogarithmBaseScene, "exponential-equation": mountExponentialEquationScene, "trig-function-graphs": mountTrigFunctionScene, "trig-transform": mountTrigTransformScene, "secant-to-tangent": mountSecantScene, "derivative-at-point": mountDerivativeAtPointScene, "function-and-derivative": mountFunctionDerivativeScene, "cubic-extrema": mountCubicExtremaScene, "indefinite-integral": mountIndefiniteIntegralScene });

export function mountFunctionGraph(container, config = {}) {
  const mount = FUNCTION_GRAPH_MODES[config.mode];
  if (!mount) throw new Error(`Unsupported function graph mode: ${config.mode || "(empty)"}`);
  const context = createContext(container);
  const scene = mount(context, config);
  return { reset: scene.reset, destroy: context.destroy, getState: scene.getState, setParameter: scene.setParameter };
}

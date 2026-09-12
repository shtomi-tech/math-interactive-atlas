const COLORS = {
  primary: "#2563eb",
  secondary: "#e11d48",
  helper: "#64748b",
  construction: "#94a3b8",
  highlight: "#f59e0b",
  success: "#16a34a",
  text: "#1f2937"
};

const MIN_X = -3;
const MAX_X = 4;
const MIN_GAP = 0.25;
const BOARD_BOUNDS = [-4, 14, 5, -2];
let boardSequence = 0;
const RANGE_GRAPH_MODES = Object.freeze({ "quadratic-range": true });

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function formatNumber(value) {
  const number = finite(value);
  if (Object.is(number, -0)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function functionValue(x) {
  return (x - 1) ** 2 + 1;
}

function candidatesFor(state) {
  const candidates = [
    { label: "左端点", x: state.l, value: functionValue(state.l) },
    { label: "右端点", x: state.r, value: functionValue(state.r) }
  ];
  if (state.l <= 1 && state.r >= 1) candidates.push({ label: "頂点", x: 1, value: 1 });
  return candidates;
}

function extremaFor(state) {
  const candidates = candidatesFor(state);
  return {
    minimum: candidates.reduce((best, candidate) => candidate.value < best.value ? candidate : best),
    maximum: candidates.reduce((best, candidate) => candidate.value > best.value ? candidate : best)
  };
}

function summaryFor(state) {
  const { minimum, maximum } = extremaFor(state);
  return `定義域：${formatNumber(state.l)} ≤ x ≤ ${formatNumber(state.r)}　／　最小値：${formatNumber(minimum.value)}（x = ${formatNumber(minimum.x)}）　／　最大値：${formatNumber(maximum.value)}（x = ${formatNumber(maximum.x)}）`;
}

function addText(board, x, y, getText, options = {}) {
  return board.create("text", [x, y, getText], {
    fixed: true,
    highlight: false,
    fontSize: 13,
    strokeColor: COLORS.text,
    useMathJax: false,
    ...options
  });
}

function createBoard(container, id) {
  if (!window.JXG?.JSXGraph?.initBoard) return null;
  const host = document.createElement("div");
  host.id = id;
  host.className = "jxgbox";
  container.replaceChildren(host);
  return window.JXG.JSXGraph.initBoard(id, {
    boundingbox: BOARD_BOUNDS,
    axis: true,
    keepAspectRatio: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false },
    zoom: { enabled: false },
    axisX: { strokeColor: COLORS.helper, strokeWidth: 1.5 },
    axisY: { strokeColor: COLORS.helper, strokeWidth: 1.5 },
    grid: { strokeColor: "#e2e8f0", strokeWidth: 1 }
  });
}

function mountFallback(container) {
  const fallback = document.createElement("p");
  fallback.className = "atlas-canvas-fallback";
  fallback.textContent = "グラフライブラリを読み込めません。下の操作欄で定義域を変更できます。";
  container.replaceChildren(fallback);
}

export function mountRangeGraph(container, config) {
  if (!RANGE_GRAPH_MODES[config?.mode]) throw new Error(`Unsupported range graph mode: ${config?.mode || "(empty)"}`);
  const initial = { l: finite(config.initial?.l, -2), r: finite(config.initial?.r, 3) };
  const parameters = config.parameters || {};
  const state = { l: Math.min(initial.l, initial.r - MIN_GAP), r: Math.max(initial.r, initial.l + MIN_GAP) };
  const boardId = `atlas-range-graph-${boardSequence += 1}`;
  let board = createBoard(container, boardId);
  const handles = new Map();
  let dragging = null;

  if (!board) mountFallback(container);

  if (board) {
    board.create("functiongraph", [functionValue, MIN_X, MAX_X], {
      strokeColor: COLORS.construction,
      strokeWidth: 2,
      dash: 2,
      fixed: true,
      highlight: false
    });
    board.create("curve", [
      (t) => state.l + (state.r - state.l) * t,
      (t) => functionValue(state.l + (state.r - state.l) * t),
      0,
      1
    ], {
      strokeColor: COLORS.primary,
      strokeWidth: 4,
      fixed: true,
      highlight: false
    });
    board.create("point", [() => state.l, () => functionValue(state.l)], {
      name: "l",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.primary,
      fixed: true,
      highlight: false
    });
    board.create("point", [() => state.r, () => functionValue(state.r)], {
      name: "r",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.primary,
      fixed: true,
      highlight: false
    });
    const vertex = board.create("point", [1, 1], {
      name: "V",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.construction,
      fixed: true,
      highlight: false
    });
    const minimum = board.create("point", [() => extremaFor(state).minimum.x, () => extremaFor(state).minimum.value], {
      name: "min",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.success,
      fixed: true,
      highlight: false
    });
    const maximum = board.create("point", [() => extremaFor(state).maximum.x, () => extremaFor(state).maximum.value], {
      name: "max",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.highlight,
      fixed: true,
      highlight: false
    });
    addText(board, -3.7, 13, () => `定義域：${formatNumber(state.l)} ≤ x ≤ ${formatNumber(state.r)}`, { fontSize: 15, strokeColor: COLORS.primary });
    addText(board, -3.7, 12.3, () => {
      const { minimum: candidate } = extremaFor(state);
      return `最小値 ${formatNumber(candidate.value)}（x = ${formatNumber(candidate.x)}）`;
    }, { fontSize: 12, strokeColor: COLORS.success });
    addText(board, -3.7, 11.7, () => {
      const { maximum: candidate } = extremaFor(state);
      return `最大値 ${formatNumber(candidate.value)}（x = ${formatNumber(candidate.x)}）`;
    }, { fontSize: 12, strokeColor: COLORS.highlight });
    addText(board, 1.15, 1.5, () => state.l <= 1 && state.r >= 1 ? "頂点" : "頂点（定義域外）", { fontSize: 12, strokeColor: COLORS.helper });
    board.__atlasRangeParts = { vertex, minimum, maximum };
  }

  function setHandlePosition(side) {
    const handle = handles.get(side);
    if (!handle || !board) return;
    const rect = container.getBoundingClientRect();
    const [left, top, right, bottom] = board.getBoundingBox();
    const x = state[side];
    const y = functionValue(x);
    handle.element.style.left = `${(x - left) / (right - left) * rect.width}px`;
    handle.element.style.top = `${(top - y) / (top - bottom) * rect.height}px`;
    handle.element.setAttribute("aria-valuenow", String(x));
  }

  function pointerToX(event) {
    if (!board) return state.l;
    const rect = container.getBoundingClientRect();
    const [left, , right] = board.getBoundingBox();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return left + ratio * (right - left);
  }

  function setSide(side, value) {
    const definition = parameters[side] || { min: MIN_X, max: MAX_X };
    const minimum = finite(definition.min, MIN_X);
    const maximum = finite(definition.max, MAX_X);
    const step = finite(definition.step, 0);
    const raw = finite(value, state[side]);
    const stepped = step > 0 ? minimum + Math.round((raw - minimum) / step) * step : raw;
    const number = Math.min(maximum, Math.max(minimum, stepped));
    if (side === "l") state.l = Math.min(number, state.r - MIN_GAP);
    else state.r = Math.max(number, state.l + MIN_GAP);
    draw();
  }

  function addHandle(side, label) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = `atlas-range-handle atlas-range-handle-${side}`;
    element.textContent = label;
    element.setAttribute("role", "slider");
    element.setAttribute("aria-label", `定義域の${side === "l" ? "左" : "右"}端 ${label}`);
    element.setAttribute("aria-valuemin", String(parameters[side]?.min ?? MIN_X));
    element.setAttribute("aria-valuemax", String(parameters[side]?.max ?? MAX_X));
    element.addEventListener("pointerdown", (event) => {
      dragging = side;
      element.setPointerCapture(event.pointerId);
      setSide(side, pointerToX(event));
    });
    element.addEventListener("pointermove", (event) => {
      if (dragging === side) setSide(side, pointerToX(event));
    });
    element.addEventListener("pointerup", () => { dragging = null; });
    element.addEventListener("pointercancel", () => { dragging = null; });
    element.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      setSide(side, state[side] + (event.key === "ArrowRight" ? 0.25 : -0.25));
    });
    container.append(element);
    handles.set(side, { element });
  }

  function notify() {
    config.onStateChange?.({ ...state }, summaryFor(state));
  }

  function draw() {
    if (board) {
      const { vertex } = board.__atlasRangeParts;
      vertex.setAttribute({ fillColor: state.l <= 1 && state.r >= 1 ? COLORS.highlight : COLORS.construction });
      board.update();
      setHandlePosition("l");
      setHandlePosition("r");
    }
    notify();
  }

  function setParameter(name, value) {
    if (!["l", "r"].includes(name)) return;
    setSide(name, value);
  }

  function reset() {
    state.l = initial.l;
    state.r = initial.r;
    draw();
  }

  function destroy() {
    if (board && window.JXG?.JSXGraph?.freeBoard) window.JXG.JSXGraph.freeBoard(board);
    board = null;
    handles.clear();
    container.replaceChildren();
  }

  addHandle("l", "l");
  addHandle("r", "r");
  draw();
  return { reset, destroy, getState: () => ({ ...state }), setParameter };
}

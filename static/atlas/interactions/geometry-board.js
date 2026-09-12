const COLORS = {
  primary: "#2563eb",
  secondary: "#e11d48",
  helper: "#64748b",
  construction: "#94a3b8",
  highlight: "#f59e0b",
  success: "#16a34a",
  text: "#1f2937"
};

const UNIT_CIRCLE_BOUNDS = [-1.5, 1.5, 1.5, -1.5];
const TRIANGLE_BOUNDS = [-3.6, 4.2, 4.6, -1];
const DEFAULT_MIN_THETA = 0;
const DEFAULT_MAX_THETA = 180;
let boardSequence = 0;

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function clean(value) {
  const number = finite(value);
  if (Math.abs(number) < 0.0005) return 0;
  if (Math.abs(number - 1) < 0.0005) return 1;
  if (Math.abs(number + 1) < 0.0005) return -1;
  return number;
}

function formatFixed(value) {
  return clean(value).toFixed(3);
}

function formatAngle(value) {
  return String(Math.round(clean(value)));
}

function snap(value, minimum, maximum, step) {
  const raw = finite(value, minimum);
  const stepped = step > 0 ? minimum + Math.round((raw - minimum) / step) * step : raw;
  return clamp(stepped, minimum, maximum);
}

function createBoard(container, id, boundingbox, mode) {
  if (!window.JXG?.JSXGraph?.initBoard) return null;
  const host = document.createElement("div");
  host.id = id;
  host.className = "jxgbox atlas-geometry-jxgbox";
  host.dataset.geometryMode = mode;
  container.replaceChildren(host);
  return window.JXG.JSXGraph.initBoard(id, {
    boundingbox,
    axis: true,
    keepAspectRatio: true,
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
  fallback.textContent = "図形ライブラリを読み込めません。下の操作欄で角度を変更できます。";
  container.replaceChildren(fallback);
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

function createCore(container, config, boundingbox) {
  const parameters = config.parameters || {};
  const definition = parameters.theta || {
    min: DEFAULT_MIN_THETA,
    max: DEFAULT_MAX_THETA,
    step: 1
  };
  const minimum = finite(definition.min, DEFAULT_MIN_THETA);
  const maximum = finite(definition.max, DEFAULT_MAX_THETA);
  const step = finite(definition.step, 0);
  const initialTheta = snap(finite(config.initial?.theta, 30), minimum, maximum, step);
  const state = { theta: initialTheta };
  const boardId = `atlas-geometry-board-${boardSequence += 1}`;
  const board = createBoard(container, boardId, boundingbox, config.mode);
  const boardHost = container.querySelector(`#${boardId}`);
  let scene = null;
  let touchTarget = null;
  let resizeObserver = null;
  let resizeHandler = null;
  let dragging = false;

  function notify() {
    config.onStateChange?.({ ...state }, scene?.summary?.() || `θ = ${formatAngle(state.theta)}°`);
  }

  function setTouchTargetPoint(x, y) {
    if (!board || !boardHost || !touchTarget) return;
    const containerRect = container.getBoundingClientRect();
    const boardRect = boardHost.getBoundingClientRect();
    const [left, top, right, bottom] = board.getBoundingBox();
    const localX = (x - left) / (right - left) * boardRect.width;
    const localY = (top - y) / (top - bottom) * boardRect.height;
    touchTarget.style.left = `${boardRect.left - containerRect.left - container.clientLeft + localX}px`;
    touchTarget.style.top = `${boardRect.top - containerRect.top - container.clientTop + localY}px`;
    touchTarget.setAttribute("aria-valuenow", formatAngle(state.theta));
  }

  function setTouchTargetNode(node) {
    if (!board || !boardHost || !touchTarget || !node?.getBoundingClientRect) return;
    const containerRect = container.getBoundingClientRect();
    const pointRect = node.getBoundingClientRect();
    touchTarget.style.left = `${pointRect.left - containerRect.left - container.clientLeft + pointRect.width / 2}px`;
    touchTarget.style.top = `${pointRect.top - containerRect.top - container.clientTop + pointRect.height / 2}px`;
    touchTarget.setAttribute("aria-valuenow", formatAngle(state.theta));
  }

  function syncTouchTarget() {
    const node = scene?.touchNode?.();
    if (node) {
      setTouchTargetNode(node);
      return;
    }
    const position = scene?.touchPosition?.();
    if (position) setTouchTargetPoint(position[0], position[1]);
  }

  function thetaFromPoint(x, y) {
    return clamp(Math.atan2(Math.max(0, y), x) * 180 / Math.PI, minimum, maximum);
  }

  function thetaFromPointer(event) {
    if (typeof board?.getUsrCoordsOfMouse === "function") {
      const [x, y] = board.getUsrCoordsOfMouse(event);
      return thetaFromPoint(x, y);
    }
    const rect = boardHost.getBoundingClientRect();
    const [left, top, right, bottom] = board.getBoundingBox();
    const x = left + ((event.clientX - rect.left) / rect.width) * (right - left);
    const y = top - ((event.clientY - rect.top) / rect.height) * (top - bottom);
    return thetaFromPoint(x, y);
  }

  function setTheta(value) {
    state.theta = snap(value, minimum, maximum, step);
    scene?.update?.();
    notify();
  }

  function createTouchTarget(label = "P") {
    if (!board) return null;
    touchTarget = document.createElement("button");
    touchTarget.type = "button";
    touchTarget.className = "atlas-geometry-touch-target";
    touchTarget.textContent = label;
    touchTarget.setAttribute("role", "slider");
    touchTarget.setAttribute("aria-label", `円周上の点${label}を動かす`);
    touchTarget.setAttribute("aria-valuemin", String(minimum));
    touchTarget.setAttribute("aria-valuemax", String(maximum));
    touchTarget.setAttribute("aria-valuenow", formatAngle(state.theta));
    touchTarget.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      dragging = true;
      touchTarget.setPointerCapture(event.pointerId);
      setTheta(thetaFromPointer(event));
    });
    touchTarget.addEventListener("pointermove", (event) => {
      if (dragging) setTheta(thetaFromPointer(event));
    });
    touchTarget.addEventListener("pointerup", () => { dragging = false; });
    touchTarget.addEventListener("pointercancel", () => { dragging = false; });
    touchTarget.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      setTheta(state.theta + (event.key === "ArrowRight" ? step || 1 : -(step || 1)));
    });
    container.append(touchTarget);
    return touchTarget;
  }

  function setScene(nextScene) {
    scene = nextScene;
    scene?.update?.();
    notify();
  }

  function resize() {
    if (!board || !boardHost) return;
    const rect = boardHost.getBoundingClientRect();
    if (typeof board.resizeContainer === "function") board.resizeContainer(rect.width, rect.height, true);
    board.update();
    syncTouchTarget();
  }

  function installResizeHandling() {
    if (!board || !boardHost) return;
    resizeHandler = resize;
    window.addEventListener("resize", resizeHandler);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resizeHandler);
      resizeObserver.observe(boardHost);
    }
  }

  function destroy() {
    if (resizeObserver) resizeObserver.disconnect();
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (board && window.JXG?.JSXGraph?.freeBoard) window.JXG.JSXGraph.freeBoard(board);
    scene = null;
    touchTarget = null;
    container.replaceChildren();
  }

  return {
    board,
    boardHost,
    container,
    config,
    state,
    minimum,
    maximum,
    step,
    addText,
    createTouchTarget,
    installResizeHandling,
    notify,
    setScene,
    setTheta,
    setTouchTargetNode,
    syncTouchTarget,
    thetaFromPoint,
    thetaFromPointer,
    destroy,
    initialTheta
  };
}

function mountUnitCircleScene(core) {
  const { board, state } = core;
  let point = null;
  let syncingPoint = false;

  function updateState() {
    const radians = state.theta * Math.PI / 180;
    state.cos = clean(Math.cos(radians));
    state.sin = clean(Math.sin(radians));
    state.x = state.cos;
    state.y = state.sin;
  }

  function summary() {
    return `θ = ${formatAngle(state.theta)}°　／　P = (${formatFixed(state.x)}, ${formatFixed(state.y)})　／　cos θ = ${formatFixed(state.cos)}　／　sin θ = ${formatFixed(state.sin)}`;
  }

  if (!board) {
    return { update: updateState, summary, touchPosition: () => null };
  }

  board.create("point", [0, 0], {
    name: "O",
    size: 4,
    strokeColor: COLORS.text,
    fillColor: COLORS.text,
    fixed: true,
    highlight: false
  });
  board.create("circle", [[0, 0], 1], {
    strokeColor: COLORS.construction,
    strokeWidth: 2,
    fillColor: "none",
    fixed: true,
    highlight: false
  });
  const upperSemicircle = board.create("curve", [
    (t) => Math.cos(t),
    (t) => Math.sin(t),
    0,
    Math.PI
  ], {
    strokeOpacity: 0,
    highlight: false,
    fixed: true
  });
  point = board.create("glider", [state.cos || 1, state.sin || 0, upperSemicircle], {
    name: "P",
    size: 7,
    strokeColor: COLORS.text,
    fillColor: COLORS.highlight,
    fixed: false,
    highlight: false
  });
  point.on("drag", () => {
    if (!syncingPoint) core.setTheta(core.thetaFromPoint(point.X(), point.Y()));
  });

  board.create("segment", [[0, 0], [() => point.X(), () => point.Y()]], {
    strokeColor: COLORS.primary,
    strokeWidth: 3,
    fixed: true,
    highlight: false
  });
  board.create("segment", [[() => point.X(), 0], [() => point.X(), () => point.Y()]], {
    strokeColor: COLORS.secondary,
    strokeWidth: 2,
    dash: 2,
    fixed: true,
    highlight: false
  });
  board.create("segment", [[0, () => point.Y()], [() => point.X(), () => point.Y()]], {
    strokeColor: COLORS.helper,
    strokeWidth: 2,
    dash: 2,
    fixed: true,
    highlight: false
  });
  board.create("curve", [
    (t) => 0.28 * Math.cos(t),
    (t) => 0.28 * Math.sin(t),
    0,
    () => state.theta * Math.PI / 180
  ], {
    strokeColor: COLORS.secondary,
    strokeWidth: 2,
    fixed: true,
    highlight: false
  });
  core.addText(board, -1.35, 1.3, () => `θ = ${formatAngle(state.theta)}°`, { fontSize: 15, strokeColor: COLORS.secondary });
  core.addText(board, 1.2, -0.12, () => "x", { fontSize: 14, strokeColor: COLORS.helper });
  core.addText(board, -0.1, 1.35, () => "y", { fontSize: 14, strokeColor: COLORS.helper });
  core.addText(board, () => point.X() / 2, -0.13, () => "cos θ", { fontSize: 12, strokeColor: COLORS.primary });
  core.addText(board, -0.48, () => point.Y() / 2, () => "sin θ", { fontSize: 12, strokeColor: COLORS.secondary });
  core.createTouchTarget("P");

  function update() {
    updateState();
    syncingPoint = true;
    point.moveTo([state.cos, state.sin], 0);
    board.update();
    syncingPoint = false;
    core.syncTouchTarget();
  }

  return {
    update,
    summary,
    touchPosition: () => [point.X(), point.Y()],
    touchNode: () => point.rendNode
  };
}

function mountTriangleAreaSineScene(core) {
  const { board, state } = core;
  const a = 3;
  const b = 4;
  const baseA = { x: b, y: 0 };
  let point = null;
  let syncingPoint = false;

  function updateState() {
    const radians = state.theta * Math.PI / 180;
    state.cos = clean(Math.cos(radians));
    state.sin = clean(Math.sin(radians));
    state.x = clean(a * state.cos);
    state.y = clean(a * state.sin);
    state.height = Math.abs(state.y);
    state.areaByHeight = 0.5 * b * state.height;
    state.areaBySine = 0.5 * a * b * state.sin;
    state.areaCalculationError = Math.abs(state.areaByHeight - state.areaBySine);
    if (state.areaCalculationError > 0.000000001) throw new Error("Triangle area calculations diverged");
    state.area = state.areaByHeight;
  }

  function summary() {
    return `C = ${formatAngle(state.theta)}°　／　sin C = ${formatFixed(state.sin)}　／　高さ h = ${formatFixed(state.height)}　／　面積 S = ${formatFixed(state.area)}`;
  }

  if (!board) {
    return { update: updateState, summary, touchPosition: () => null };
  }

  const origin = board.create("point", [0, 0], {
    name: "C",
    size: 4,
    strokeColor: COLORS.text,
    fillColor: COLORS.text,
    fixed: true,
    highlight: false
  });
  const fixedA = board.create("point", [baseA.x, baseA.y], {
    name: "A",
    size: 4,
    strokeColor: COLORS.text,
    fillColor: COLORS.text,
    fixed: true,
    highlight: false
  });
  const arc = board.create("curve", [
    (t) => a * Math.cos(t),
    (t) => a * Math.sin(t),
    core.minimum * Math.PI / 180,
    core.maximum * Math.PI / 180
  ], {
    strokeColor: COLORS.construction,
    strokeWidth: 2,
    dash: 2,
    fixed: true,
    highlight: false
  });
  point = board.create("glider", [a * Math.cos(state.theta * Math.PI / 180), a * Math.sin(state.theta * Math.PI / 180), arc], {
    name: "B",
    size: 7,
    strokeColor: COLORS.text,
    fillColor: COLORS.highlight,
    fixed: false,
    highlight: false
  });
  point.on("drag", () => {
    if (!syncingPoint) core.setTheta(core.thetaFromPoint(point.X(), point.Y()));
  });

  board.create("segment", [[() => origin.X(), () => origin.Y()], [() => point.X(), () => point.Y()]], {
    strokeColor: COLORS.primary,
    strokeWidth: 3,
    fixed: true,
    highlight: false
  });
  board.create("segment", [[() => point.X(), () => point.Y()], [() => fixedA.X(), () => fixedA.Y()]], {
    strokeColor: COLORS.primary,
    strokeWidth: 3,
    fixed: true,
    highlight: false
  });
  board.create("segment", [[() => origin.X(), () => origin.Y()], [() => fixedA.X(), () => fixedA.Y()]], {
    strokeColor: COLORS.helper,
    strokeWidth: 3,
    fixed: true,
    highlight: false
  });
  board.create("segment", [[() => point.X(), 0], [() => point.X(), () => point.Y()]], {
    strokeColor: COLORS.secondary,
    strokeWidth: 3,
    dash: 2,
    fixed: true,
    highlight: false
  });
  board.create("point", [() => point.X(), 0], {
    name: "H",
    size: 4,
    strokeColor: COLORS.secondary,
    fillColor: COLORS.secondary,
    fixed: true,
    highlight: false
  });
  board.create("curve", [
    (t) => 0.55 * Math.cos(t),
    (t) => 0.55 * Math.sin(t),
    0,
    () => state.theta * Math.PI / 180
  ], {
    strokeColor: COLORS.secondary,
    strokeWidth: 2,
    fixed: true,
    highlight: false
  });
  core.addText(board, -0.55, 3.35, () => `C = ${formatAngle(state.theta)}°`, { fontSize: 15, strokeColor: COLORS.secondary });
  core.addText(board, 1.55, 3.35, () => `sin C = ${formatFixed(state.sin)}`, { fontSize: 13, strokeColor: COLORS.secondary });
  core.addText(board, 1.55, 2.95, () => `h = ${formatFixed(state.height)}`, { fontSize: 13, strokeColor: COLORS.secondary });
  core.addText(board, 1.55, 2.55, () => `S = ${formatFixed(state.area)}`, { fontSize: 13, strokeColor: COLORS.highlight });
  core.addText(board, 1.7, -0.25, () => `CA = b = ${b}`, { fontSize: 12, strokeColor: COLORS.helper });
  core.addText(board, () => point.X() / 2 - 0.2, () => point.Y() / 2, () => `BC = a = ${a}`, { fontSize: 12, strokeColor: COLORS.primary });
  core.addText(board, () => point.X() + 0.12, () => point.Y() / 2, () => "BH = h", { fontSize: 12, strokeColor: COLORS.secondary });
  core.createTouchTarget("B");

  function update() {
    updateState();
    syncingPoint = true;
    point.moveTo([state.x, state.y], 0);
    board.update();
    syncingPoint = false;
    core.syncTouchTarget();
  }

  return {
    update,
    summary,
    touchPosition: () => [point.X(), point.Y()],
    touchNode: () => point.rendNode
  };
}

const GEOMETRY_MODES = Object.freeze({
  "unit-circle": mountUnitCircleScene,
  "triangle-area-sine": mountTriangleAreaSineScene
});

export function mountGeometryBoard(container, config) {
  const mountScene = GEOMETRY_MODES[config.mode];
  if (!mountScene) throw new Error(`Unsupported geometry mode: ${config.mode || "(empty)"}`);
  const bounds = config.boundingbox || (config.mode === "triangle-area-sine" ? TRIANGLE_BOUNDS : UNIT_CIRCLE_BOUNDS);
  const core = createCore(container, config, bounds);

  if (!core.board) mountFallback(container);
  const scene = mountScene(core, config);
  core.setScene(scene);
  core.installResizeHandling();

  function reset() {
    core.setTheta(core.initialTheta);
  }

  function setParameter(name, value) {
    if (name === "theta") core.setTheta(value);
  }

  return {
    reset,
    destroy: core.destroy,
    getState: () => ({ ...core.state }),
    setParameter
  };
}

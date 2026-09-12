const COLORS = {
  primary: "#2563eb",
  secondary: "#e11d48",
  helper: "#64748b",
  construction: "#94a3b8",
  highlight: "#f59e0b",
  text: "#1f2937"
};

const DEFAULT_BOUNDS = [-1.5, 1.5, 1.5, -1.5];
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

function valuesForTheta(theta) {
  const radians = theta * Math.PI / 180;
  const cos = clean(Math.cos(radians));
  const sin = clean(Math.sin(radians));
  return { theta, x: cos, y: sin, cos, sin };
}

function summaryFor(state) {
  return `θ = ${formatAngle(state.theta)}°　／　P = (${formatFixed(state.x)}, ${formatFixed(state.y)})　／　cos θ = ${formatFixed(state.cos)}　／　sin θ = ${formatFixed(state.sin)}`;
}

function createBoard(container, id, boundingbox) {
  if (!window.JXG?.JSXGraph?.initBoard) return null;
  const host = document.createElement("div");
  host.id = id;
  host.className = "jxgbox atlas-geometry-jxgbox";
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

export function mountGeometryBoard(container, config) {
  if (config.mode && config.mode !== "unit-circle") {
    throw new Error(`Unsupported geometry mode: ${config.mode}`);
  }

  const parameters = config.parameters || {};
  const definition = parameters.theta || {
    min: DEFAULT_MIN_THETA,
    max: DEFAULT_MAX_THETA,
    step: 1
  };
  const minimum = finite(definition.min, DEFAULT_MIN_THETA);
  const maximum = finite(definition.max, DEFAULT_MAX_THETA);
  const step = finite(definition.step, 0);
  const initialTheta = clamp(finite(config.initial?.theta, 30), minimum, maximum);
  const state = valuesForTheta(initialTheta);
  const boardId = `atlas-geometry-board-${boardSequence += 1}`;
  let board = createBoard(container, boardId, config.boundingbox || DEFAULT_BOUNDS);
  const boardHost = container.querySelector(`#${boardId}`);
  let point = null;
  let touchTarget = null;
  let resizeObserver = null;
  let resizeHandler = null;
  let syncingPoint = false;
  let dragging = false;

  if (!board) mountFallback(container);

  function notify() {
    config.onStateChange?.({ ...state }, summaryFor(state));
  }

  function setTouchTargetPosition() {
    if (!board || !point || !touchTarget) return;
    const rect = boardHost.getBoundingClientRect();
    const [left, top, right, bottom] = board.getBoundingBox();
    touchTarget.style.left = `${(point.X() - left) / (right - left) * rect.width}px`;
    touchTarget.style.top = `${(top - point.Y()) / (top - bottom) * rect.height}px`;
    touchTarget.setAttribute("aria-valuenow", formatAngle(state.theta));
  }

  function draw() {
    if (board && point) {
      syncingPoint = true;
      point.moveTo([state.cos, state.sin], 0);
      board.update();
      syncingPoint = false;
      setTouchTargetPosition();
    }
    notify();
  }

  function setTheta(value) {
    const raw = finite(value, state.theta);
    const stepped = step > 0 ? minimum + Math.round((raw - minimum) / step) * step : raw;
    state.theta = clamp(stepped, minimum, maximum);
    Object.assign(state, valuesForTheta(state.theta));
    draw();
  }

  function thetaFromPoint(x, y) {
    const angle = Math.atan2(Math.max(0, y), x) * 180 / Math.PI;
    return clamp(angle, minimum, maximum);
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

  function handlePointDrag() {
    if (!point || syncingPoint) return;
    setTheta(thetaFromPoint(point.X(), point.Y()));
  }

  function createTouchTarget() {
    touchTarget = document.createElement("button");
    touchTarget.type = "button";
    touchTarget.className = "atlas-geometry-touch-target";
    touchTarget.textContent = "P";
    touchTarget.setAttribute("role", "slider");
    touchTarget.setAttribute("aria-label", "円周上の点Pを動かす");
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
  }

  if (board) {
    const origin = board.create("point", [0, 0], {
      name: "O",
      size: 4,
      strokeColor: COLORS.text,
      fillColor: COLORS.text,
      fixed: true,
      highlight: false
    });
    const circle = board.create("circle", [[0, 0], 1], {
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
    point = board.create("glider", [state.cos, state.sin, upperSemicircle], {
      name: "P",
      size: 7,
      strokeColor: COLORS.text,
      fillColor: COLORS.highlight,
      fixed: false,
      highlight: false
    });
    point.on("drag", handlePointDrag);

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
    addText(board, -1.35, 1.3, () => `θ = ${formatAngle(state.theta)}°`, { fontSize: 15, strokeColor: COLORS.secondary });
    addText(board, 1.2, -0.12, () => "x", { fontSize: 14, strokeColor: COLORS.helper });
    addText(board, -0.1, 1.35, () => "y", { fontSize: 14, strokeColor: COLORS.helper });
    addText(board, () => point.X() / 2, -0.13, () => "cos θ", { fontSize: 12, strokeColor: COLORS.primary });
    addText(board, -0.48, () => point.Y() / 2, () => "sin θ", { fontSize: 12, strokeColor: COLORS.secondary });
    void origin;
    void circle;
    createTouchTarget();
    draw();

    resizeHandler = () => {
      const rect = boardHost.getBoundingClientRect();
      if (typeof board.resizeContainer === "function") board.resizeContainer(rect.width, rect.height, true);
      board.update();
      setTouchTargetPosition();
    };
    window.addEventListener("resize", resizeHandler);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resizeHandler);
      resizeObserver.observe(boardHost);
    }
  } else {
    notify();
  }

  function reset() {
    setTheta(initialTheta);
  }

  function setParameter(name, value) {
    if (name === "theta") setTheta(value);
  }

  function destroy() {
    if (resizeObserver) resizeObserver.disconnect();
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (board && window.JXG?.JSXGraph?.freeBoard) window.JXG.JSXGraph.freeBoard(board);
    board = null;
    point = null;
    touchTarget = null;
    container.replaceChildren();
  }

  return { reset, destroy, getState: () => ({ ...state }), setParameter };
}

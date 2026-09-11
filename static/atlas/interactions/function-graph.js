const GRAPH_COLORS = {
  primary: "#2563eb",
  secondary: "#e11d48",
  helper: "#64748b",
  construction: "#94a3b8",
  highlight: "#f59e0b",
  text: "#1f2937"
};

const BOARD_BOUNDS = [-6, 6, 6, -6];
let boardSequence = 0;

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function formatNumber(value) {
  const number = finite(value);
  if (Object.is(number, -0)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function signed(value) {
  const number = finite(value);
  if (number === 0) return "";
  return number > 0 ? ` + ${formatNumber(number)}` : ` − ${formatNumber(Math.abs(number))}`;
}

function equationForBasic(a) {
  if (a === 0) return "y = 0";
  if (a === 1) return "y = x²";
  if (a === -1) return "y = −x²";
  return `y = ${formatNumber(a)}x²`;
}

function equationForVertex({ a, p, q }) {
  const coefficient = a === 1 ? "" : a === -1 ? "−" : formatNumber(a);
  const shiftedX = p === 0 ? "x" : p > 0 ? `(x − ${formatNumber(p)})` : `(x + ${formatNumber(Math.abs(p))})`;
  return `y = ${coefficient}${shiftedX}²${signed(q)}`;
}

function equationForDiscriminant({ a, b, c }) {
  if (a === 0) {
    if (b === 0) return c === 0 ? "y = 0" : `y = ${c < 0 ? "− " : ""}${formatNumber(Math.abs(c))}`;
    const linear = b === 0 ? "" : b === 1 ? "x" : b === -1 ? "−x" : `${formatNumber(b)}x`;
    return `y = ${linear || "0"}${signed(c)}`;
  }
  const coefficient = a === 1 ? "" : a === -1 ? "−" : formatNumber(a);
  const linear = b === 0 ? "" : b === 1 ? " + x" : b === -1 ? " − x" : `${signed(b)}x`;
  return `y = ${coefficient}x²${linear}${signed(c)}`;
}

function discriminant({ a, b, c }) {
  return b ** 2 - 4 * a * c;
}

function rootsFor({ a, b, c }) {
  if (Math.abs(a) < 0.000001) return [];
  const value = discriminant({ a, b, c });
  if (value < -0.000001) return [];
  if (Math.abs(value) <= 0.000001) return [-b / (2 * a)];
  const squareRoot = Math.sqrt(Math.max(0, value));
  return [(-b - squareRoot) / (2 * a), (-b + squareRoot) / (2 * a)].filter(Number.isFinite);
}

function valueFor(mode, state, x) {
  if (mode === "quadratic-basic") return state.a * x ** 2;
  if (mode === "quadratic-vertex") return state.a * (x - state.p) ** 2 + state.q;
  if (Math.abs(state.a) < 0.000001) return state.b * x + state.c;
  return state.a * x ** 2 + state.b * x + state.c;
}

function summaryFor(mode, state) {
  if (mode === "quadratic-basic") {
    const base = `a = ${formatNumber(state.a)}　／　${equationForBasic(state.a)}`;
    return state.a === 0 ? `${base}　／　二次関数ではありません。` : base;
  }
  if (mode === "quadratic-vertex") {
    return `頂点 (${formatNumber(state.p)}, ${formatNumber(state.q)})　／　対称軸 x = ${formatNumber(state.p)}　／　${equationForVertex(state)}`;
  }
  if (Math.abs(state.a) < 0.000001) {
    return `a = 0　／　${equationForDiscriminant(state)}　／　二次方程式ではありません。aを0以外にしてください。`;
  }
  const value = discriminant(state);
  const roots = rootsFor(state);
  return `D = ${formatNumber(value)}　／　交点 = ${roots.length}個　／　${equationForDiscriminant(state)}`;
}

function addText(board, x, y, getText, options = {}) {
  return board.create("text", [x, y, getText], {
    fixed: true,
    highlight: false,
    fontSize: 14,
    strokeColor: GRAPH_COLORS.text,
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
    axisX: { strokeColor: GRAPH_COLORS.helper, strokeWidth: 1.5 },
    axisY: { strokeColor: GRAPH_COLORS.helper, strokeWidth: 1.5 },
    grid: { strokeColor: "#e2e8f0", strokeWidth: 1 }
  });
}

function mountFallback(container) {
  const fallback = document.createElement("p");
  fallback.className = "atlas-canvas-fallback";
  fallback.textContent = "グラフライブラリを読み込めません。数値と式は下の操作欄に表示します。";
  container.replaceChildren(fallback);
}

export function mountFunctionGraph(container, config) {
  const mode = config.mode;
  const initial = { ...config.initial };
  const parameters = config.parameters || {};
  const state = { ...initial };
  const boardId = `atlas-function-graph-${boardSequence += 1}`;
  let board = createBoard(container, boardId);
  let rootPoints = [];

  if (!board) mountFallback(container);

  function setVisible(point, visible) {
    point.setAttribute({ visible });
  }

  if (board) {
    board.create("functiongraph", [(x) => valueFor(mode, state, x), -6, 6], {
      strokeColor: GRAPH_COLORS.primary,
      strokeWidth: 3,
      fixed: true,
      highlight: false
    });

    if (mode === "quadratic-basic") {
      addText(board, -5.6, 5.2, () => `a = ${formatNumber(state.a)}`, { fontSize: 16, strokeColor: GRAPH_COLORS.primary });
      addText(board, -5.6, 4.6, () => equationForBasic(state.a));
      addText(board, -5.6, 4.0, () => state.a === 0 ? "a = 0 では二次関数ではありません。" : "", { fontSize: 12, strokeColor: GRAPH_COLORS.secondary });
    }

    if (mode === "quadratic-vertex") {
      board.create("line", [[() => state.p, -6], [() => state.p, 6]], {
        straightFirst: false,
        straightLast: false,
        strokeColor: GRAPH_COLORS.construction,
        strokeWidth: 2,
        dash: 2,
        fixed: true,
        highlight: false
      });
      board.create("point", [() => state.p, () => state.q], {
        name: "V",
        size: 5,
        strokeColor: GRAPH_COLORS.text,
        fillColor: GRAPH_COLORS.highlight,
        fixed: true,
        highlight: false
      });
      addText(board, -5.6, 5.2, () => `頂点 (${formatNumber(state.p)}, ${formatNumber(state.q)})`, { fontSize: 16, strokeColor: GRAPH_COLORS.primary });
      addText(board, -5.6, 4.6, () => equationForVertex(state));
      addText(board, -5.6, 4.0, () => `対称軸 x = ${formatNumber(state.p)}`, { fontSize: 12, strokeColor: GRAPH_COLORS.helper });
    }

    if (mode === "quadratic-discriminant") {
      rootPoints = [0, 1].map(() => board.create("point", [0, 0], {
        name: "",
        size: 5,
        strokeColor: GRAPH_COLORS.text,
        fillColor: GRAPH_COLORS.secondary,
        visible: false,
        fixed: true,
        highlight: false
      }));
      addText(board, -5.6, 5.2, () => Math.abs(state.a) < 0.000001 ? "判定対象外" : `D = ${formatNumber(discriminant(state))}`, { fontSize: 16, strokeColor: GRAPH_COLORS.secondary });
      addText(board, -5.6, 4.6, () => equationForDiscriminant(state));
      addText(board, -5.6, 4.0, () => {
        if (Math.abs(state.a) < 0.000001) return "a = 0 では二次方程式ではありません。";
        return `実数解：${rootsFor(state).length}個`;
      }, { fontSize: 12, strokeColor: GRAPH_COLORS.helper });
    }
  }

  function notify() {
    config.onStateChange?.({ ...state }, summaryFor(mode, state));
  }

  function draw() {
    if (board && mode === "quadratic-discriminant") {
      const roots = rootsFor(state);
      rootPoints.forEach((point, index) => {
        const root = roots[index];
        point.moveTo([Number.isFinite(root) ? root : 0, 0], 0);
        setVisible(point, Number.isFinite(root));
      });
    }
    board?.update();
    notify();
  }

  function setParameter(name, value) {
    const definition = parameters[name];
    if (!definition) return;
    const number = finite(value, initial[name]);
    state[name] = Math.min(definition.max, Math.max(definition.min, number));
    draw();
  }

  function reset() {
    Object.assign(state, initial);
    draw();
  }

  function destroy() {
    if (board && window.JXG?.JSXGraph?.freeBoard) window.JXG.JSXGraph.freeBoard(board);
    board = null;
    rootPoints = [];
    container.replaceChildren();
  }

  draw();
  return { reset, destroy, setParameter, getState: () => ({ ...state }) };
}

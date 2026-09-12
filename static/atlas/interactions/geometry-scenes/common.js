import { angleBisectorFoot, angleDegrees, centroid, circumcenter, distance, excenterA, incenter, lawOfCosinesSide, lineCircleIntersections, orthocenter, pointOnCircle } from "../../math/geometry.js?v=20260912-7k";
export { angleBisectorFoot, angleDegrees, centroid, circumcenter, distance, excenterA, incenter, lawOfCosinesSide, lineCircleIntersections, orthocenter, pointOnCircle };
export const COLORS = Object.freeze({ primary: "#2563eb", secondary: "#0f766e", highlight: "#d97706", helper: "#64748b", construction: "#94a3b8" });
export const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const rad = (degrees) => Number(degrees) * Math.PI / 180;
export const fixed = (value, digits = 2) => Number(value).toFixed(digits);
let sequence = 0;

export function createContext(container, config, boundingbox) {
  container.replaceChildren(); container.classList.add("atlas-geometry-stage");
  const boardHost = document.createElement("div"); boardHost.id = `atlas-geometry-board-${++sequence}`; boardHost.className = "jxgbox atlas-geometry-canvas";
  const touchLayer = document.createElement("div"); touchLayer.className = "atlas-geometry-touch-layer";
  const controls = document.createElement("div"); controls.className = "atlas-geometry-scene-controls";
  const summary = document.createElement("p"); summary.className = "atlas-geometry-summary"; summary.setAttribute("aria-live", "polite");
  container.append(boardHost, touchLayer, controls, summary);
  const board = globalThis.JXG?.JSXGraph?.initBoard(boardHost.id, { boundingbox, axis: true, showCopyright: false, showNavigation: false, keepAspectRatio: true, pan: { enabled: false }, zoom: { enabled: false } }) || null;
  const cleanups = [];
  const context = {
    board, controls, summary, config,
    point(coords, options = {}) { return board?.create("point", coords, { size: 4, strokeColor: COLORS.primary, fillColor: COLORS.primary, fixed: true, highlight: false, ...options }); },
    segment(a, b, options = {}) { return board?.create("segment", [a, b], { strokeWidth: 3, strokeColor: COLORS.primary, fixed: true, highlight: false, ...options }); },
    circle(center, radius, options = {}) { return board?.create("circle", [center, radius], { strokeWidth: 2, strokeColor: COLORS.helper, fixed: true, highlight: false, ...options }); },
    text(x, y, value, options = {}) { return board?.create("text", [x, y, value], { fixed: true, highlight: false, fontSize: 14, strokeColor: COLORS.helper, ...options }); },
    button(label, active, onClick) { const button = document.createElement("button"); button.type = "button"; button.textContent = label; button.setAttribute("aria-pressed", String(active)); button.addEventListener("click", onClick); controls.append(button); cleanups.push(() => button.remove()); return button; },
    touchTarget({ label, position, onMove, onKey }) { const button = document.createElement("button"); button.type = "button"; button.className = "atlas-geometry-touch-target"; button.setAttribute("aria-label", label); const place = () => { if (!board) return; const coords = new globalThis.JXG.Coords(globalThis.JXG.COORDS_BY_USER, position(), board); button.style.left = `${coords.scrCoords[1]}px`; button.style.top = `${coords.scrCoords[2]}px`; }; const move = (event) => { if (!board) return; const rect = boardHost.getBoundingClientRect(); const coords = new globalThis.JXG.Coords(globalThis.JXG.COORDS_BY_SCREEN, [event.clientX - rect.left, event.clientY - rect.top], board); onMove(coords.usrCoords[1], coords.usrCoords[2]); }; button.addEventListener("pointerdown", (event) => { button.setPointerCapture(event.pointerId); move(event); }); button.addEventListener("pointermove", (event) => { if (button.hasPointerCapture(event.pointerId)) move(event); }); button.addEventListener("keydown", onKey); touchLayer.append(button); cleanups.push(() => button.remove()); return place; },
    update(text, placers = []) { board?.update(); placers.forEach((place) => place()); summary.textContent = text; }
  };
  const observer = globalThis.ResizeObserver ? new ResizeObserver(() => { board?.resizeContainer(boardHost.clientWidth, boardHost.clientHeight); board?.fullUpdate(); }) : null; observer?.observe(boardHost); cleanups.push(() => observer?.disconnect());
  context.destroy = () => { cleanups.forEach((cleanup) => cleanup()); if (board) globalThis.JXG?.JSXGraph?.freeBoard(board); container.replaceChildren(); };
  return context;
}

export function makeScene(context, config, spec) {
  const initial = { ...spec.initial, ...(config.initial || {}) }; const state = { ...initial }; const placers = []; let built = false;
  const api = { state, setParameter(name, value) { if (!(name in state)) return; state[name] = spec.clamp?.(name, finite(value, state[name]), state) ?? finite(value, state[name]); spec.derive?.(state); if (!built) { spec.build(context, state, api, placers); built = true; } context.update(spec.summary(state), placers); }, reset() { Object.assign(state, initial); spec.derive?.(state); context.update(spec.summary(state), placers); }, placers };
  spec.derive?.(state); spec.build(context, state, api, placers); built = true; context.update(spec.summary(state), placers); return api;
}

export function mountWithContext(container, config, sceneMap, bounds = [-6, 5, 6, -5]) { const mount = sceneMap[config.mode]; if (!mount) throw new Error(`Unsupported geometry mode: ${config.mode || "(empty)"}`); const context = createContext(container, config, config.boundingbox || bounds); const scene = mount(context, config); return { reset: scene.reset || (() => {}), destroy: context.destroy, getState: () => ({ ...scene.state }), setParameter: scene.setParameter || (() => {}) }; }

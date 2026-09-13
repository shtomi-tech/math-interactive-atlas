import { angleFromPoint, measureUnitCircle, normalizeDegrees } from "../../math/canonical-geometry.js?v=20260913-r8";
import { COLORS, fixed, makeScene } from "./common.js?v=20260913-r8";

function deriveMeasurement(state) {
  const measurement = measureUnitCircle(state.theta);
  state.measurement = measurement;
  state.x = measurement.point.x;
  state.y = measurement.point.y;
  state.radius = measurement.radius;
  state.cos = measurement.cos;
  state.sin = measurement.sin;
  state.squareSum = measurement.squareSum;
}

function moveByKeyboard(api, state, event) {
  const deltas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
  if (!(event.key in deltas)) return;
  event.preventDefault();
  api.setParameter("theta", state.theta + deltas[event.key]);
}

function constrainedMeasure(context, config) {
  return makeScene(context, config, {
    initial: { theta: 30 },
    clamp: (name, value) => name === "theta" ? normalizeDegrees(value) : value,
    derive: deriveMeasurement,
    build: (c, state, api, placers) => {
      const origin = c.point([0, 0], { name: "O", fillColor: COLORS.secondary });
      c.circle(origin, 1, { strokeColor: COLORS.helper });
      c.segment(origin, [() => state.x, () => state.y], { strokeColor: COLORS.highlight });
      c.segment([() => state.x, 0], [() => state.x, () => state.y], { strokeColor: COLORS.secondary, dash: 2 });
      c.point([() => state.x, () => state.y], { name: "P", fillColor: COLORS.highlight, size: 6 });
      c.text(-2.05, 1.72, () => `P=(${fixed(state.x)}, ${fixed(state.y)})`, { strokeColor: COLORS.text });
      c.text(-2.05, 1.42, () => `θ=${fixed(state.theta, 0)}°`, { strokeColor: COLORS.text });
      const place = c.touchTarget({
        label: "制約付き測定点P。矢印キーで円周上を移動",
        position: () => [state.x, state.y],
        onMove: (x, y) => api.setParameter("theta", angleFromPoint(x, y, state.theta)),
        onKey: (event) => moveByKeyboard(api, state, event)
      });
      placers.push(place);
    },
    summary: (state) => `θ=${fixed(state.theta, 0)}° ／ cosθ=${fixed(state.cos)} ／ sinθ=${fixed(state.sin)} ／ x²+y²=${fixed(state.squareSum)} ／ 半径=${fixed(state.radius)}`
  });
}

export const canonicalScenes = Object.freeze({
  "canonical-constrained-measure": constrainedMeasure
});

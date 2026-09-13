import { clampProbeX, moveVertex, normalizeCoefficient, quadraticY } from "../static/atlas/math/canonical-quadratic.js";
import { angleFromPoint, measureUnitCircle, normalizeDegrees } from "../static/atlas/math/canonical-geometry.js";

const errors = [];
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const vertex = moveVertex({ a: 1, h: 0, k: 0 }, 2, -3);
requireCondition(vertex.h === 2 && vertex.k === -3, "MATH-INT-001 must move vertex h/k");
requireCondition(quadraticY(vertex, vertex.h) === vertex.k, "MATH-INT-001 vertex must satisfy y = a(x-h)^2+k");
const coefficient = { a: normalizeCoefficient(2, -3, 3, 0.1), h: 0, k: 0 };
requireCondition(coefficient.a === 2 && coefficient.h === 0 && coefficient.k === 0, "MATH-INT-002 must change only a");
requireCondition(quadraticY(coefficient, 2) === 8, "MATH-INT-002 quadratic value is incorrect");
const state = { a: 0.5, h: -1, k: 2 };
[-4, -1, 0, 3].forEach((x) => requireCondition(quadraticY(state, x) === state.a * (x - state.h) ** 2 + state.k, `MATH-INT-003 probe invariant failed at x=${x}`));
requireCondition(clampProbeX(-8, [-5, 5]) === -5 && clampProbeX(8, [-5, 5]) === 5, "MATH-INT-003 probe must stay within the domain");

[0, 30, 45, 60, 90, 180, 270, 359].forEach((theta) => {
  const measurement = measureUnitCircle(theta);
  requireCondition(Number.isFinite(measurement.point.x) && Number.isFinite(measurement.point.y), `MATH-INT-009 must return finite coordinates at theta=${theta}`);
  requireCondition(Math.abs(measurement.radius - 1) <= 1e-10, `MATH-INT-009 radius invariant failed at theta=${theta}`);
  requireCondition(Math.abs(measurement.squareSum - 1) <= 1e-10, `MATH-INT-009 square-sum invariant failed at theta=${theta}`);
  requireCondition(measurement.point.x === measurement.cos && measurement.point.y === measurement.sin, `MATH-INT-009 sin/cos coordinates diverged at theta=${theta}`);
});
requireCondition(normalizeDegrees(-1) === 359 && normalizeDegrees(360) === 0 && normalizeDegrees(361) === 1, "MATH-INT-009 angle normalization is incorrect");
requireCondition(Math.abs(measureUnitCircle(30).point.x - Math.sqrt(3) / 2) <= 1e-10 && Math.abs(measureUnitCircle(30).point.y - 0.5) <= 1e-10, "MATH-INT-009 30-degree values are incorrect");
requireCondition(angleFromPoint(0, 0, 123) === 123, "MATH-INT-009 origin pointer must preserve the fallback angle");

if (errors.length) { console.error("Canonical runtime math: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else console.log("Canonical runtime math: PASS (vertex, coefficient, curve-probe, and constrained-geometry invariants)");

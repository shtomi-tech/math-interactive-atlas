import { clampProbeX, moveVertex, normalizeCoefficient, quadraticY } from "../static/atlas/math/canonical-quadratic.js";

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

if (errors.length) { console.error("Canonical runtime math: FAILED"); errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
else console.log("Canonical runtime math: PASS (vertex, coefficient, and curve-probe invariants)");

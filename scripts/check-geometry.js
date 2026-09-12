import assert from "node:assert/strict";
import {
  angleBisectorFoot,
  angleDegrees,
  centroid,
  circumcenter,
  distance,
  incenter,
  lawOfCosinesSide,
  lineCircleIntersections,
  orthocenter
} from "../static/atlas/math/geometry.js";

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);
}

function pointClose(actual, expected, message) {
  assert.ok(actual, `${message}: point is null`);
  close(actual.x, expected.x, `${message}.x`);
  close(actual.y, expected.y, `${message}.y`);
}

const A = { x: 0, y: 0 };
const B = { x: 4, y: 0 };
const C = { x: 0, y: 3 };
pointClose(centroid(A, B, C), { x: 4 / 3, y: 1 }, "centroid");
pointClose(circumcenter(A, B, C), { x: 2, y: 1.5 }, "circumcenter");
pointClose(incenter(A, B, C), { x: 1, y: 1 }, "incenter");
pointClose(orthocenter(A, B, C), { x: 0, y: 0 }, "orthocenter");
close(lawOfCosinesSide(4, 3, 90), 5, "cosine law");

const foot = angleBisectorFoot(A, B, C);
close(distance(B, foot) / distance(foot, C), distance(A, B) / distance(A, C), "angle bisector ratio");

const sideA = distance(B, C);
const sideB = distance(C, A);
const sideC = distance(A, B);
const angleA = angleDegrees(B, A, C) * Math.PI / 180;
const angleB = angleDegrees(C, B, A) * Math.PI / 180;
const angleC = angleDegrees(A, C, B) * Math.PI / 180;
close(sideA / Math.sin(angleA), 5, "sine law a");
close(sideB / Math.sin(angleB), 5, "sine law b");
close(sideC / Math.sin(angleC), 5, "sine law c");

const O = { x: 0, y: 0 };
close(angleDegrees({ x: 1, y: 0 }, O, { x: -1, y: 0 }), 2 * angleDegrees({ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }), "inscribed angle");

const P = { x: 5, y: 0 };
const fixed = lineCircleIntersections(P, { x: -1, y: 0 }, O, 3).filter((point) => point.t >= 0);
close(fixed[0].t * fixed[1].t, 16, "fixed secant power");
const radians = 165 * Math.PI / 180;
const moving = lineCircleIntersections(P, { x: Math.cos(radians), y: Math.sin(radians) }, O, 3).filter((point) => point.t >= 0);
close(moving[0].t * moving[1].t, 16, "moving secant power");

console.log("Geometry math: PASS (centers, laws, bisector, circle, power)");

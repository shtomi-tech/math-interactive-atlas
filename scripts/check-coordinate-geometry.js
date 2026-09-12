import assert from "node:assert/strict";
import { circleLineIntersections, distance2D, lineThroughPoints, midpoint2D, pointLineDistance } from "../static/atlas/math/coordinate-geometry.js";
assert.equal(distance2D({ x: 0, y: 0 }, { x: 4, y: 2 }), Math.sqrt(20));
assert.deepEqual(midpoint2D({ x: 0, y: 0 }, { x: 4, y: 2 }), { x: 2, y: 1 });
assert.equal(pointLineDistance({ x: 0, y: 0 }, { a: 3, b: 4, c: -20 }), 4);
assert.deepEqual(lineThroughPoints({ x: 0, y: 0 }, { x: 4, y: 2 }), { a: -2, b: 4, c: 0 });
assert.deepEqual(circleLineIntersections({ center: { x: 0, y: 0 }, radius: 5 }, { a: 0, b: 1, c: 0 }).map(({ x, y }) => [x, y]), [[-5, 0], [5, 0]]);
console.log("Coordinate geometry: PASS (distance, midpoint, line, point-line distance and circle-line)");

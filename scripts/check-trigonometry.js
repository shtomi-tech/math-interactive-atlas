import assert from "node:assert/strict";
import { rightTriangleTrig, trigRelations } from "../static/atlas/math/trigonometry.js";
assert.ok(Math.abs(rightTriangleTrig(30).sin - 0.5) < 1e-10);
assert.ok(Math.abs(rightTriangleTrig(60).cos - 0.5) < 1e-10);
assert.ok(Math.abs(rightTriangleTrig(45).tan - 1) < 1e-10);
assert.equal(rightTriangleTrig(90).tan, null);
[0, 30, 45, 60, 120, 180].forEach((theta) => assert.ok(Math.abs(trigRelations(theta).squareSum - 1) < 1e-10));
console.log("Trigonometry math: PASS (special values, identity, undefined tan)");

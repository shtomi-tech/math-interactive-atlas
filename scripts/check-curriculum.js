import assert from "node:assert/strict";
import fs from "node:fs";
import { orderedContentIds } from "../static/atlas/curriculum.js";
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8"));
const ids = contents.map((content) => content.id); const order = orderedContentIds();
assert.equal(order.length, 40); assert.equal(new Set(order).size, order.length); assert.deepEqual([...ids].sort(), [...order].sort());
console.log("Curriculum: PASS (40 contents, one order entry each)");

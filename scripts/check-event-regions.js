import assert from "node:assert/strict";
import { expressionForMask } from "../static/atlas/math/set-regions.js";
import { EVENT_TYPES, eventFacts, maskForEvent } from "../static/atlas/math/event-regions.js";

const expected = new Map([
  [EVENT_TYPES.A, 6],
  [EVENT_TYPES.B, 12],
  [EVENT_TYPES.A_COMPLEMENT, 9],
  [EVENT_TYPES.B_COMPLEMENT, 3],
  [EVENT_TYPES.INTERSECTION, 4],
  [EVENT_TYPES.UNION, 14],
  [EVENT_TYPES.UNION_COMPLEMENT, 1],
  [EVENT_TYPES.INTERSECTION_COMPLEMENT, 11]
]);

expected.forEach((mask, event) => {
  const facts = eventFacts(event);
  assert.equal(maskForEvent(event), mask, `${event} mask`);
  assert.equal(facts.id, event, `${event} id`);
  assert.equal(facts.mask, mask, `${event} facts mask`);
  assert.equal(facts.text, expressionForMask(mask), `${event} expression`);
  assert.ok(facts.latex.trim(), `${event} latex is empty`);
  assert.ok(facts.description.trim(), `${event} description is empty`);
});

assert.equal(eventFacts(EVENT_TYPES.UNION).text, "A ∪ B");
assert.equal(eventFacts(EVENT_TYPES.UNION).latex, "A \\cup B");

console.log("Event regions math: PASS (8 events)");

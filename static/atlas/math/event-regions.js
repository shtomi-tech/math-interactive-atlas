import { expressionForMask, latexForMask } from "./set-regions.js?v=20260913-r2";

export const EVENT_TYPES = Object.freeze({
  A: "a",
  B: "b",
  A_COMPLEMENT: "a-complement",
  B_COMPLEMENT: "b-complement",
  INTERSECTION: "intersection",
  UNION: "union",
  UNION_COMPLEMENT: "union-complement",
  INTERSECTION_COMPLEMENT: "intersection-complement"
});

const EVENT_MASKS = Object.freeze({
  [EVENT_TYPES.A]: 6,
  [EVENT_TYPES.B]: 12,
  [EVENT_TYPES.A_COMPLEMENT]: 9,
  [EVENT_TYPES.B_COMPLEMENT]: 3,
  [EVENT_TYPES.INTERSECTION]: 4,
  [EVENT_TYPES.UNION]: 14,
  [EVENT_TYPES.UNION_COMPLEMENT]: 1,
  [EVENT_TYPES.INTERSECTION_COMPLEMENT]: 11
});

const EVENT_DESCRIPTIONS = Object.freeze({
  [EVENT_TYPES.A]: "Aが起こる",
  [EVENT_TYPES.B]: "Bが起こる",
  [EVENT_TYPES.A_COMPLEMENT]: "Aが起こらない",
  [EVENT_TYPES.B_COMPLEMENT]: "Bが起こらない",
  [EVENT_TYPES.INTERSECTION]: "AとBがともに起こる",
  [EVENT_TYPES.UNION]: "AまたはBの少なくとも一方が起こる",
  [EVENT_TYPES.UNION_COMPLEMENT]: "AもBも起こらない",
  [EVENT_TYPES.INTERSECTION_COMPLEMENT]: "AとBが同時には起こらない"
});

export function maskForEvent(event) {
  return EVENT_MASKS[event] ?? EVENT_MASKS[EVENT_TYPES.UNION];
}

export function eventFacts(event) {
  const id = Object.hasOwn(EVENT_MASKS, event) ? event : EVENT_TYPES.UNION;
  const mask = maskForEvent(id);
  return {
    id,
    text: expressionForMask(mask),
    latex: latexForMask(mask),
    mask,
    description: EVENT_DESCRIPTIONS[id]
  };
}

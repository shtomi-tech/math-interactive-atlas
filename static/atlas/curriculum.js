export const SUBJECT_ORDER = Object.freeze(["math1", "mathA"]);

export const SUBJECT_UNIT_ORDER = Object.freeze({
  math1: Object.freeze(["algebra", "trigonometry", "quadratic", "statistics"]),
  mathA: Object.freeze(["probability", "geometry-a", "human-activity"])
});

export const CONTENT_ORDER = Object.freeze({
  algebra: Object.freeze(["expansion-area", "factorization-reverse", "perfect-square-build", "sqrt-numberline", "absolute-distance", "inequality-numberline", "set-regions", "necessary-sufficient"]),
  trigonometry: Object.freeze(["right-triangle-trig", "unit-circle", "trig-relations", "triangle-area-sine", "sine-law-circumcircle", "cosine-law"]),
  quadratic: Object.freeze(["quadratic-basic", "quadratic-vertex", "completing-square", "three-point-parabola", "quadratic-range", "quadratic-discriminant", "quadratic-inequality", "parameter-intersections"]),
  statistics: Object.freeze(["mean-median-outlier", "variance-distance", "boxplot-drag", "correlation-builder", "hypothesis-test-coin"]),
  probability: Object.freeze(["event-regions", "conditional-probability", "counting-tree", "permutations-all", "combinations-order", "independent-trials", "circular-permutations", "sample-space-grid"]),
  "geometry-a": Object.freeze(["triangle-centers", "angle-bisector-ratio", "inscribed-angle", "power-of-point"]),
  "human-activity": Object.freeze(["euclidean-algorithm"])
});

export function orderedContentIds() {
  return SUBJECT_ORDER.flatMap((subject) => (SUBJECT_UNIT_ORDER[subject] || []).flatMap((unit) => CONTENT_ORDER[unit] || []));
}

export function orderedContents(contents) {
  const byId = new Map(contents.map((content) => [content.id, content]));
  return orderedContentIds().map((id) => byId.get(id)).filter(Boolean);
}

export function neighborsForContent(contents, id) {
  const current = contents.find((content) => content.id === id);
  if (!current) return { previous: null, next: null, index: -1, total: 0 };
  const sameSubject = orderedContents(contents).filter((content) => content.subject === current.subject);
  const subjectIndex = sameSubject.findIndex((content) => content.id === id);
  const sameUnit = sameSubject.filter((content) => content.unit === current.unit);
  const unitIndex = sameUnit.findIndex((content) => content.id === id);
  return { previous: sameSubject[subjectIndex - 1] || null, next: sameSubject[subjectIndex + 1] || null, index: unitIndex, total: sameUnit.length, subjectIndex, subjectTotal: sameSubject.length };
}

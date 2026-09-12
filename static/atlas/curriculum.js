export const SUBJECT_ORDER = Object.freeze(["math1", "mathA", "math2", "mathB"]);

export const SUBJECT_META = Object.freeze({
  math1: Object.freeze({ label: "数学I" }),
  mathA: Object.freeze({ label: "数学A" }),
  math2: Object.freeze({ label: "数学Ⅱ" }),
  mathB: Object.freeze({ label: "数学B" })
});

export const UNIT_META = Object.freeze({
  algebra: Object.freeze({ label: "数と式" }),
  trigonometry: Object.freeze({ label: "図形と計量" }),
  quadratic: Object.freeze({ label: "二次関数" }),
  statistics: Object.freeze({ label: "データの分析" }),
  probability: Object.freeze({ label: "場合の数と確率" }),
  "geometry-a": Object.freeze({ label: "図形の性質" }),
  "human-activity": Object.freeze({ label: "数学と人間の活動" }),
  "expressions-2": Object.freeze({ label: "いろいろな式" }),
  "geometry-equations": Object.freeze({ label: "図形と方程式" }),
  "exponential-logarithm": Object.freeze({ label: "指数関数・対数関数" }),
  "trigonometric-functions": Object.freeze({ label: "三角関数" }),
  "calculus-2": Object.freeze({ label: "微分・積分の考え" }),
  sequences: Object.freeze({ label: "数列" }),
  "statistical-inference": Object.freeze({ label: "統計的な推測" }),
  "math-social-life": Object.freeze({ label: "数学と社会生活" })
});

export function subjectLabel(id) {
  return SUBJECT_META[id]?.label || id;
}

export function unitLabel(id) {
  return UNIT_META[id]?.label || id;
}

export const SUBJECT_UNIT_ORDER = Object.freeze({
  math1: Object.freeze(["algebra", "trigonometry", "quadratic", "statistics"]),
  mathA: Object.freeze(["probability", "geometry-a", "human-activity"]),
  math2: Object.freeze(["expressions-2", "geometry-equations", "exponential-logarithm", "trigonometric-functions", "calculus-2"]),
  mathB: Object.freeze(["sequences", "statistical-inference", "math-social-life"])
});

export const CONTENT_ORDER = Object.freeze({
  algebra: Object.freeze(["expansion-area", "factorization-reverse", "perfect-square-build", "sqrt-numberline", "absolute-distance", "inequality-numberline", "set-regions", "necessary-sufficient"]),
  trigonometry: Object.freeze(["right-triangle-trig", "unit-circle", "trig-relations", "triangle-area-sine", "sine-law-circumcircle", "cosine-law"]),
  quadratic: Object.freeze(["quadratic-basic", "quadratic-vertex", "completing-square", "three-point-parabola", "quadratic-range", "quadratic-discriminant", "quadratic-inequality", "parameter-intersections"]),
  statistics: Object.freeze(["mean-median-outlier", "variance-distance", "boxplot-drag", "correlation-builder", "hypothesis-test-coin"]),
  probability: Object.freeze(["event-regions", "conditional-probability", "counting-tree", "permutations-all", "combinations-order", "independent-trials", "circular-permutations", "sample-space-grid"]),
  "geometry-a": Object.freeze(["triangle-centers", "angle-bisector-ratio", "inscribed-angle", "power-of-point"]),
  "human-activity": Object.freeze(["euclidean-algorithm"]),
  "expressions-2": Object.freeze(["cubic-expansion", "polynomial-division", "rational-expression-domain", "complex-arithmetic", "roots-coefficients", "factor-theorem", "identity-coefficients"]),
  "geometry-equations": Object.freeze(["section-formula", "line-equation", "line-relations", "circle-equation", "circle-line-intersections", "locus-distance-ratio", "inequality-region-2d"]),
  "exponential-logarithm": Object.freeze(["exponent-extension", "exponential-base", "log-inverse", "logarithm-base", "exponential-equation"]),
  "trigonometric-functions": Object.freeze(["radian-measure", "trig-function-graphs", "trig-transform", "trig-addition-formula", "double-angle"]),
  "calculus-2": Object.freeze(["secant-to-tangent", "derivative-at-point", "function-and-derivative", "cubic-extrema", "indefinite-integral", "definite-integral-signed-area"]),
  sequences: Object.freeze(["arithmetic-sequence", "geometric-sequence", "sequence-partial-sum", "recurrence-iteration", "sigma-notation", "difference-sequence", "mathematical-induction"]),
  "statistical-inference": Object.freeze(["population-sample", "random-variable-distribution", "distribution-mean-variance", "binomial-distribution-b", "normal-distribution", "standard-normalization", "sampling-distribution-mean", "confidence-interval", "normal-hypothesis-test"]),
  "math-social-life": Object.freeze(["modeling-cycle", "model-comparison", "decision-sensitivity"])
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

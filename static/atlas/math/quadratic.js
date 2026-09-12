const EPSILON = 1e-9;

function formatNumber(value) {
  const number = Number(value);
  if (Object.is(number, -0)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function coefficient(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function quadraticValue({ a = 0, b = 0, c = 0 }, x) {
  return coefficient(a) * Number(x) ** 2 + coefficient(b) * Number(x) + coefficient(c);
}

export function quadraticExpression({ a = 0, b = 0, c = 0 }) {
  const A = coefficient(a); const B = coefficient(b); const C = coefficient(c);
  const terms = [];
  if (Math.abs(A) > EPSILON) terms.push(`${A === 1 ? "" : A === -1 ? "−" : formatNumber(A)}x²`);
  if (Math.abs(B) > EPSILON) {
    const sign = B < 0 ? "−" : terms.length ? "+" : "";
    const magnitude = Math.abs(B);
    terms.push(`${sign} ${magnitude === 1 ? "" : formatNumber(magnitude)}x`.trim());
  }
  if (Math.abs(C) > EPSILON || terms.length === 0) {
    const sign = C < 0 ? "−" : terms.length ? "+" : "";
    terms.push(`${sign} ${formatNumber(Math.abs(C))}`.trim());
  }
  return terms.join(" ").replace(/^\+\s*/, "");
}

export function formatIntervalSet(intervals) {
  if (!Array.isArray(intervals) || intervals.length === 0) return "∅";
  const endpoint = (value) => value === -Infinity ? "−∞" : value === Infinity ? "∞" : formatNumber(value);
  return intervals.map((interval) => {
    const left = interval.fromClosed ? "[" : "(";
    const right = interval.toClosed ? "]" : ")";
    return `${left}${endpoint(interval.from)}, ${endpoint(interval.to)}${right}`;
  }).join(" ∪ ");
}

export function quadraticDiscriminant({ a = 0, b = 0, c = 0 }) {
  return coefficient(b) ** 2 - 4 * coefficient(a) * coefficient(c);
}

export function quadraticRoots({ a = 0, b = 0, c = 0 }) {
  const A = coefficient(a); const B = coefficient(b); const C = coefficient(c);
  if (Math.abs(A) <= EPSILON) return Math.abs(B) <= EPSILON ? [] : [-C / B];
  const discriminant = quadraticDiscriminant({ a: A, b: B, c: C });
  if (discriminant < -EPSILON) return [];
  if (Math.abs(discriminant) <= EPSILON) return [-B / (2 * A)];
  const root = Math.sqrt(Math.max(0, discriminant));
  return [-B - root, -B + root].map((value) => value / (2 * A)).filter(Number.isFinite).sort((left, right) => left - right);
}

export function quadraticVertex({ a = 0, b = 0, c = 0 }) {
  const A = coefficient(a); const B = coefficient(b); const C = coefficient(c);
  if (Math.abs(A) <= EPSILON) return null;
  const x = -B / (2 * A);
  return { x, y: quadraticValue({ a: A, b: B, c: C }, x) };
}

export function quadraticThroughPoints(points) {
  if (!Array.isArray(points) || points.length !== 3 || points.some((point) => !Number.isFinite(Number(point?.x)) || !Number.isFinite(Number(point?.y)))) return null;
  const [[x1, y1], [x2, y2], [x3, y3]] = points.map(({ x, y }) => [Number(x), Number(y)]);
  if (new Set([x1, x2, x3]).size !== 3) return null;
  const determinant = (x1 ** 2) * (x2 - x3) - (x2 ** 2) * (x1 - x3) + (x3 ** 2) * (x1 - x2);
  if (Math.abs(determinant) <= EPSILON) return null;
  const a = (y1 * (x2 - x3) - y2 * (x1 - x3) + y3 * (x1 - x2)) / determinant;
  const b = ((x1 ** 2) * (y2 - y3) - (x2 ** 2) * (y1 - y3) + (x3 ** 2) * (y1 - y2)) / determinant;
  const c = ((x1 ** 2) * (x2 * y3 - x3 * y2) - (x2 ** 2) * (x1 * y3 - x3 * y1) + (x3 ** 2) * (x1 * y2 - x2 * y1)) / determinant;
  return [a, b, c].every(Number.isFinite) ? { a, b, c } : null;
}

export function quadraticInequalityIntervals({ a, b, c, operator }) {
  if (!["<", "≤", ">", "≥"].includes(operator)) throw new RangeError("unsupported quadratic inequality operator");
  const A = coefficient(a); const B = coefficient(b); const C = coefficient(c);
  if (Math.abs(A) <= EPSILON) {
    if (Math.abs(B) <= EPSILON) return (operator === ">" || operator === "≥") === (C > 0 || (C === 0 && (operator === "≥" || operator === "≤"))) ? [{ from: -Infinity, to: Infinity, fromClosed: true, toClosed: true }] : [];
    const boundary = -C / B; const positive = B > 0; const wantsPositive = operator === ">" || operator === "≥";
    const right = positive === wantsPositive; const closed = operator === "≥" || operator === "≤";
    return right ? [{ from: boundary, to: Infinity, fromClosed: closed, toClosed: false }] : [{ from: -Infinity, to: boundary, fromClosed: false, toClosed: closed }];
  }
  const roots = quadraticRoots({ a: A, b: B, c: C });
  const wantsPositive = operator === ">" || operator === "≥"; const closed = operator === "≥" || operator === "≤";
  if (roots.length === 0) { const value = quadraticValue({ a: A, b: B, c: C }, 0); return ((value > 0) === wantsPositive || (value === 0 && closed)) ? [{ from: -Infinity, to: Infinity, fromClosed: false, toClosed: false }] : []; }
  if (roots.length === 1) return wantsPositive === (A > 0) ? [{ from: -Infinity, to: roots[0], fromClosed: false, toClosed: closed }, { from: roots[0], to: Infinity, fromClosed: closed, toClosed: false }] : (closed ? [{ from: roots[0], to: roots[0], fromClosed: true, toClosed: true }] : []);
  const [left, right] = roots; return wantsPositive === (A > 0) ? [{ from: -Infinity, to: left, fromClosed: false, toClosed: closed }, { from: right, to: Infinity, fromClosed: closed, toClosed: false }] : [{ from: left, to: right, fromClosed: closed, toClosed: closed }];
}

export function quadraticLineIntersections({ quadratic, line }) {
  const { a = 0, b = 0, c = 0 } = quadratic || {};
  const { m = 0, k = 0 } = line || {};
  return quadraticRoots({ a, b: Number(b) - Number(m), c: Number(c) - Number(k) });
}

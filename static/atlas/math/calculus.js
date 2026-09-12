const EPSILON = 1e-10;

function safeCoefficients(coefficients) {
  return Array.isArray(coefficients) && coefficients.length > 0 && coefficients.every((value) => Number.isFinite(Number(value)))
    ? coefficients.map(Number)
    : null;
}

// Polynomial coefficients always use ascending powers: [a0, a1, a2, a3] means a0 + a1*x + a2*x² + a3*x³.
export function polynomialValue(coefficients, x) {
  const values = safeCoefficients(coefficients);
  const value = Number(x);
  if (!values || !Number.isFinite(value)) return null;
  return values.reduceRight((result, coefficient) => result * value + coefficient, 0);
}

export function derivativeCoefficients(coefficients) {
  const values = safeCoefficients(coefficients);
  return values ? (values.length === 1 ? [0] : values.slice(1).map((coefficient, index) => coefficient * (index + 1))) : null;
}

export function derivativeValue(coefficients, x) {
  const derivative = derivativeCoefficients(coefficients);
  return derivative ? polynomialValue(derivative, x) : null;
}

export function secantSlope(coefficients, x, h) {
  const start = Number(x); const step = Number(h);
  if (!Number.isFinite(start) || !Number.isFinite(step) || Math.abs(step) <= EPSILON) return null;
  const first = polynomialValue(coefficients, start); const second = polynomialValue(coefficients, start + step);
  return first === null || second === null ? null : (second - first) / step;
}

export function tangentLine(coefficients, x) {
  const point = polynomialValue(coefficients, x); const slope = derivativeValue(coefficients, x);
  if (point === null || slope === null || !Number.isFinite(Number(x))) return null;
  const intercept = point - slope * Number(x);
  return { slope, intercept, coefficients: [intercept, slope], point: { x: Number(x), y: point } };
}

function linearRoots(a, b) { return Math.abs(a) <= EPSILON ? [] : [-b / a].filter(Number.isFinite); }
function roots(coefficients) {
  const values = [...coefficients];
  while (values.length > 1 && Math.abs(values.at(-1)) <= EPSILON) values.pop();
  const degree = values.length - 1;
  if (degree <= 0) return [];
  if (degree === 1) return linearRoots(values[1], values[0]);
  if (degree === 2) {
    const [c, b, a] = values; const discriminant = b * b - 4 * a * c;
    if (discriminant < -EPSILON) return [];
    if (Math.abs(discriminant) <= EPSILON) return [-b / (2 * a)].filter(Number.isFinite);
    const root = Math.sqrt(Math.max(0, discriminant));
    return [-b - root, -b + root].map((value) => value / (2 * a)).filter(Number.isFinite).sort((left, right) => left - right);
  }
  return [];
}

export function criticalPoints(coefficients) {
  const derivative = derivativeCoefficients(coefficients);
  return derivative ? roots(derivative) : [];
}

export function antiderivativeCoefficients(coefficients, constant = 0) {
  const values = safeCoefficients(coefficients); const c = Number(constant);
  if (!values || !Number.isFinite(c)) return null;
  return [c, ...values.map((coefficient, index) => coefficient / (index + 1))];
}

export function definiteIntegral(coefficients, a, b) {
  const start = Number(a); const end = Number(b); const anti = antiderivativeCoefficients(coefficients);
  if (!anti || !Number.isFinite(start) || !Number.isFinite(end)) return null;
  return polynomialValue(anti, end) - polynomialValue(anti, start);
}

export function signedAreaParts(coefficients, a, b) {
  const start = Number(a); const end = Number(b);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const direction = end >= start ? 1 : -1;
  const from = Math.min(start, end); const to = Math.max(start, end);
  const boundaries = [from, ...roots(safeCoefficients(coefficients) || []).filter((x) => x > from + EPSILON && x < to - EPSILON), to].sort((left, right) => left - right);
  const parts = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const left = boundaries[index]; const right = boundaries[index + 1];
    const signed = definiteIntegral(coefficients, left, right) * direction;
    const midpoint = (left + right) / 2;
    parts.push({ from: direction > 0 ? left : right, to: direction > 0 ? right : left, signedArea: signed, geometricArea: Math.abs(signed), sign: polynomialValue(coefficients, midpoint) < 0 ? "negative" : "positive" });
  }
  return parts;
}

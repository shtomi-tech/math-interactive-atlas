const EPSILON = 1e-9;
const radians = (degrees) => Number(degrees) * Math.PI / 180;

export function rightTriangleTrig(thetaDegrees, hypotenuse = 1) {
  const theta = Number(thetaDegrees); const length = Number(hypotenuse);
  if (![theta, length].every(Number.isFinite) || length < 0) throw new RangeError("theta and hypotenuse must be valid");
  const sin = Math.sin(radians(theta)); const cos = Math.cos(radians(theta));
  return { sin, cos, tan: Math.abs(cos) <= EPSILON ? null : sin / cos, opposite: length * sin, adjacent: length * cos, hypotenuse: length };
}

export function trigRelations(thetaDegrees) {
  const { sin, cos, tan } = rightTriangleTrig(thetaDegrees);
  return { sin, cos, tan, sinSquared: sin ** 2, cosSquared: cos ** 2, squareSum: sin ** 2 + cos ** 2 };
}

export function degreesToRadians(degrees) {
  const value = Number(degrees);
  return Number.isFinite(value) ? value * Math.PI / 180 : null;
}

export function radiansToDegrees(radiansValue) {
  const value = Number(radiansValue);
  return Number.isFinite(value) ? value * 180 / Math.PI : null;
}

export function trigFunctionValue({ functionName = "sin", x } = {}) {
  const value = Number(x);
  if (!Number.isFinite(value)) return null;
  if (functionName === "sin") return Math.sin(value);
  if (functionName === "cos") return Math.cos(value);
  if (functionName === "tan") return Math.abs(Math.cos(value)) <= EPSILON ? null : Math.tan(value);
  return null;
}

export function transformedTrigValue({ amplitude = 1, frequency = 1, phase = 0, verticalShift = 0, x } = {}) {
  const values = [amplitude, frequency, phase, verticalShift, x].map(Number);
  if (values.some((value) => !Number.isFinite(value))) return null;
  return values[0] * Math.sin(values[1] * (values[4] - values[2])) + values[3];
}

// Addition and double-angle helpers take angles in radians, matching Math.sin/Math.cos.
export function additionFormulaFacts(alpha, beta) {
  const a = Number(alpha); const b = Number(beta);
  if (![a, b].every(Number.isFinite)) return null;
  return {
    alpha: a,
    beta: b,
    sum: a + b,
    sinSum: Math.sin(a + b),
    sinExpanded: Math.sin(a) * Math.cos(b) + Math.cos(a) * Math.sin(b),
    cosSum: Math.cos(a + b),
    cosExpanded: Math.cos(a) * Math.cos(b) - Math.sin(a) * Math.sin(b)
  };
}

export function doubleAngleFacts(theta) {
  const value = Number(theta);
  if (!Number.isFinite(value)) return null;
  return {
    theta: value,
    sinDouble: Math.sin(2 * value),
    sinExpanded: 2 * Math.sin(value) * Math.cos(value),
    cosDouble: Math.cos(2 * value),
    cosExpanded: Math.cos(value) ** 2 - Math.sin(value) ** 2,
    cosFromSin: 1 - 2 * Math.sin(value) ** 2,
    cosFromCos: 2 * Math.cos(value) ** 2 - 1
  };
}

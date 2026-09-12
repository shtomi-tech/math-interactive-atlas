function finite(value) { return Number.isFinite(Number(value)); }

export function linearModel({ slope = 1, intercept = 0 } = {}) { return finite(slope) && finite(intercept) ? (x) => Number(slope) * Number(x) + Number(intercept) : null; }
export function quadraticModel({ a = 1, b = 0, c = 0 } = {}) { return [a, b, c].every(finite) ? (x) => Number(a) * Number(x) ** 2 + Number(b) * Number(x) + Number(c) : null; }
export function residuals(observed, predicted) { return Array.isArray(observed) && Array.isArray(predicted) && observed.length === predicted.length && observed.every(finite) && predicted.every(finite) ? observed.map((value, index) => Number(value) - Number(predicted[index])) : []; }
export function rmse(observed, predicted) { const errors = residuals(observed, predicted); return errors.length > 0 ? Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length) : null; }

export function leastSquaresLinear(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length || xs.length < 2 || !xs.every(finite) || !ys.every(finite)) return null;
  const x = xs.map(Number); const y = ys.map(Number); const xMean = x.reduce((sum, value) => sum + value, 0) / x.length; const yMean = y.reduce((sum, value) => sum + value, 0) / y.length;
  const denominator = x.reduce((sum, value) => sum + (value - xMean) ** 2, 0); if (denominator === 0) return null;
  const slope = x.reduce((sum, value, index) => sum + (value - xMean) * (y[index] - yMean), 0) / denominator;
  const intercept = yMean - slope * xMean;
  return { slope, intercept, predict: linearModel({ slope, intercept }) };
}

export function breakEvenPoint(modelA, modelB) {
  const a = modelA || {}; const b = modelB || {}; const slopeA = Number(a.slope); const slopeB = Number(b.slope); const interceptA = Number(a.intercept); const interceptB = Number(b.intercept);
  if (![slopeA, slopeB, interceptA, interceptB].every(Number.isFinite) || Math.abs(slopeA - slopeB) < 1e-12) return null;
  const x = (interceptB - interceptA) / (slopeA - slopeB);
  return { x, y: slopeA * x + interceptA };
}

const EPSILON = 1e-12;

function validBase(base) {
  const value = Number(base);
  return Number.isFinite(value) && value > 0 && Math.abs(value - 1) > EPSILON;
}

export function exponentialValue(base, x) {
  const value = Number(x);
  if (!validBase(base) || !Number.isFinite(value)) return null;
  const result = Number(base) ** value;
  return Number.isFinite(result) ? result : null;
}

export function logarithmValue(base, x) {
  const value = Number(x);
  if (!validBase(base) || !Number.isFinite(value) || value <= 0) return null;
  const result = Math.log(value) / Math.log(Number(base));
  return Number.isFinite(result) ? result : null;
}

export function changeOfBase(x, base) {
  return logarithmValue(base, x);
}

export function solveSimpleExponential({ base, target } = {}) {
  return logarithmValue(base, target);
}

export function solveSimpleLogarithm({ base, target } = {}) {
  return exponentialValue(base, target);
}

export function sqrtBounds(n) {
  const value = Number(n);
  if (!Number.isInteger(value) || value < 0) throw new RangeError("n must be a non-negative integer");
  const lowerInteger = Math.floor(Math.sqrt(value));
  const upperInteger = lowerInteger ** 2 === value ? lowerInteger : lowerInteger + 1;
  return { lowerInteger, upperInteger, lowerSquare: lowerInteger ** 2, upperSquare: upperInteger ** 2, value: Math.sqrt(value) };
}

export function absoluteDistance(x, center) {
  const left = Number(x);
  const right = Number(center);
  if (![left, right].every(Number.isFinite)) throw new TypeError("x and center must be finite numbers");
  return Math.abs(left - right);
}

export function inequalityFacts(operator, boundary) {
  if (!["<", "≤", ">", "≥"].includes(operator)) throw new RangeError("unsupported inequality operator");
  const value = Number(boundary);
  if (!Number.isFinite(value)) throw new TypeError("boundary must be finite");
  return { operator, boundary: value, direction: operator === "<" || operator === "≤" ? "left" : "right", closed: operator === "≤" || operator === "≥" };
}

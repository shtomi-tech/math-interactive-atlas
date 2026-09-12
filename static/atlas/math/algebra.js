export function expandMonicProduct(m, n) {
  const left = Number(m);
  const right = Number(n);
  if (![left, right].every(Number.isFinite)) throw new TypeError("m and n must be finite numbers");
  return { x2: 1, x: left + right, constant: left * right };
}

export function perfectSquareCoefficients(a) {
  const value = Number(a);
  if (!Number.isFinite(value)) throw new TypeError("a must be a finite number");
  return { x2: 1, x: 2 * value, constant: value ** 2 };
}

export function factorPairExpansion(m, n) {
  return expandMonicProduct(m, n);
}

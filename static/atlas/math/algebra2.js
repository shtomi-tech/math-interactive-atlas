// Polynomial coefficients use ascending powers: [a0, a1, ...] means Σ ai*x^i.

function numbers(values) {
  return Array.isArray(values) && values.length > 0 && values.every((value) => Number.isFinite(Number(value))) ? values.map(Number) : null;
}

export function expandCubic(a) {
  const value = Number(a);
  return Number.isFinite(value) ? [value ** 3, 3 * value ** 2, 3 * value, 1] : [];
}

export function evaluatePolynomial(coefficients, x) {
  const values = numbers(coefficients); const value = Number(x);
  return values && Number.isFinite(value) ? values.reduceRight((total, coefficient) => total * value + coefficient, 0) : null;
}

export function polynomialDivide(dividend, divisor) {
  const numerator = numbers(dividend); const denominator = numbers(divisor);
  if (!numerator || !denominator) return null;
  while (numerator.length > 1 && Math.abs(numerator.at(-1)) < 1e-12) numerator.pop();
  while (denominator.length > 1 && Math.abs(denominator.at(-1)) < 1e-12) denominator.pop();
  if (denominator.length === 1 && Math.abs(denominator[0]) < 1e-12) return null;
  if (numerator.length < denominator.length) return { quotient: [0], remainder: numerator };
  const quotient = Array(Math.max(1, numerator.length - denominator.length + 1)).fill(0);
  const remainder = [...numerator];
  for (let index = remainder.length - denominator.length; index >= 0; index -= 1) {
    const factor = remainder[index + denominator.length - 1] / denominator.at(-1);
    quotient[index] = factor;
    denominator.forEach((coefficient, offset) => { remainder[index + offset] -= factor * coefficient; });
  }
  while (remainder.length > 1 && Math.abs(remainder.at(-1)) < 1e-10) remainder.pop();
  return { quotient, remainder };
}

export function factorTheoremFacts(coefficients, candidate) {
  const values = numbers(coefficients); const root = Number(candidate);
  if (!values || !Number.isFinite(root)) return null;
  const value = evaluatePolynomial(values, root);
  const division = polynomialDivide(values, [-root, 1]);
  return { candidate: root, value, isFactor: Math.abs(value) < 1e-10, quotient: division?.quotient || [], remainder: division?.remainder || [] };
}

function complex(value) { return value && Number.isFinite(Number(value.real)) && Number.isFinite(Number(value.imag)) ? { real: Number(value.real), imag: Number(value.imag) } : null; }

export function complexAdd(z1, z2) {
  const left = complex(z1); const right = complex(z2);
  return left && right ? { real: left.real + right.real, imag: left.imag + right.imag } : null;
}

export function complexMultiply(z1, z2) {
  const left = complex(z1); const right = complex(z2);
  return left && right ? { real: left.real * right.real - left.imag * right.imag, imag: left.real * right.imag + left.imag * right.real } : null;
}

export function complexPowerI(n) {
  const exponent = Number(n);
  if (!Number.isInteger(exponent)) return null;
  return [{ real: 1, imag: 0 }, { real: 0, imag: 1 }, { real: -1, imag: 0 }, { real: 0, imag: -1 }][((exponent % 4) + 4) % 4];
}

export function quadraticRootRelations(a, b, c) {
  const values = [a, b, c].map(Number);
  if (!values.every(Number.isFinite) || Math.abs(values[0]) < 1e-12) return null;
  return { sum: -values[1] / values[0], product: values[2] / values[0], discriminant: values[1] ** 2 - 4 * values[0] * values[2] };
}

export function rationalCancellationFacts(a) {
  const value = Number(a);
  return Number.isFinite(value) ? { excludedValue: value, cancelledExpression: "x + a", condition: `x ≠ ${value}` } : null;
}

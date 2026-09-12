export function gcd(a, b) {
  let left = Math.abs(Number(a));
  let right = Math.abs(Number(b));
  if (![left, right].every(Number.isInteger) || (left === 0 && right === 0)) throw new RangeError("a and b must be integers and not both zero");
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

export function euclideanSteps(a, b) {
  let dividend = Math.abs(Number(a));
  let divisor = Math.abs(Number(b));
  if (![dividend, divisor].every(Number.isInteger) || dividend < divisor || divisor <= 0) throw new RangeError("a must be >= b > 0");
  const steps = [];
  while (true) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    steps.push({ dividend, divisor, quotient, remainder });
    if (remainder === 0) return steps;
    [dividend, divisor] = [divisor, remainder];
  }
}

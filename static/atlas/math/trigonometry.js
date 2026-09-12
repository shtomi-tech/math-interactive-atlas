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

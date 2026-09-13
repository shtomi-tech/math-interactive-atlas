export const DEGREES_PER_TURN = 360;
export const EPSILON = 1e-10;

export function normalizeDegrees(degrees) {
  if (!Number.isFinite(Number(degrees))) return 0;
  const normalized = Number(degrees) % DEGREES_PER_TURN;
  return normalized < 0 ? normalized + DEGREES_PER_TURN : normalized;
}

export function angleFromPoint(x, y, fallbackDegrees = 0) {
  const pointX = Number(x);
  const pointY = Number(y);
  if (!Number.isFinite(pointX) || !Number.isFinite(pointY) || Math.hypot(pointX, pointY) < EPSILON) {
    return normalizeDegrees(fallbackDegrees);
  }
  return normalizeDegrees(Math.atan2(pointY, pointX) * 180 / Math.PI);
}

export function measureUnitCircle(thetaDegrees) {
  const theta = normalizeDegrees(thetaDegrees);
  const radians = theta * Math.PI / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  const radius = Math.hypot(x, y);
  return Object.freeze({
    theta,
    radians,
    point: Object.freeze({ x, y }),
    radius,
    cos: x,
    sin: y,
    squareSum: x ** 2 + y ** 2
  });
}

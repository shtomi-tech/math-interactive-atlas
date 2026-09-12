function point(value) { return value && Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y)) ? { x: Number(value.x), y: Number(value.y) } : null; }
function line(value) { return value && [value.a, value.b, value.c].every((item) => Number.isFinite(Number(item))) ? { a: Number(value.a), b: Number(value.b), c: Number(value.c) } : null; }

export function distance2D(A, B) { const first = point(A); const second = point(B); return first && second ? Math.hypot(second.x - first.x, second.y - first.y) : null; }
export function midpoint2D(A, B) { const first = point(A); const second = point(B); return first && second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } : null; }

export function sectionPoint(A, B, m, n, type = "internal") {
  const first = point(A); const second = point(B); const left = Number(m); const right = Number(n);
  if (!first || !second || !Number.isFinite(left) || !Number.isFinite(right) || left + right === 0) return null;
  const sign = type === "external" ? -1 : 1;
  const denominator = sign > 0 ? left + right : left - right;
  if (Math.abs(denominator) < 1e-12) return null;
  return { x: (right * first.x + sign * left * second.x) / denominator, y: (right * first.y + sign * left * second.y) / denominator };
}

export function lineThroughPoints(A, B) {
  const first = point(A); const second = point(B);
  if (!first || !second || (first.x === second.x && first.y === second.y)) return null;
  return line({ a: first.y - second.y, b: second.x - first.x, c: first.x * second.y - second.x * first.y });
}

export function lineFromPointSlope(P, slope) {
  const anchor = point(P); const value = Number(slope);
  return anchor && (Number.isFinite(value) || value === Infinity || value === -Infinity)
    ? (Number.isFinite(value) ? line({ a: value, b: -1, c: anchor.y - value * anchor.x }) : line({ a: 1, b: 0, c: -anchor.x }))
    : null;
}

export function areParallel(line1, line2) { const first = line(line1); const second = line(line2); return Boolean(first && second && Math.abs(first.a * second.b - second.a * first.b) < 1e-10); }
export function arePerpendicular(line1, line2) { const first = line(line1); const second = line(line2); return Boolean(first && second && Math.abs(first.a * second.a + first.b * second.b) < 1e-10); }
export function pointLineDistance(P, L) { const anchor = point(P); const current = line(L); return anchor && current && Math.hypot(current.a, current.b) > 0 ? Math.abs(current.a * anchor.x + current.b * anchor.y + current.c) / Math.hypot(current.a, current.b) : null; }
export function circleEquationFacts(center, radius) { const anchor = point(center); const value = Number(radius); return anchor && Number.isFinite(value) && value >= 0 ? { center: anchor, radius: value, equation: `(x-${anchor.x})²+(y-${anchor.y})²=${value ** 2}` } : null; }

export function circleLineIntersections(circle, L) {
  const current = circleEquationFacts(circle?.center, circle?.radius); const currentLine = line(L);
  if (!current || !currentLine || Math.hypot(currentLine.a, currentLine.b) === 0) return [];
  const denominator = currentLine.a ** 2 + currentLine.b ** 2;
  const signedDistance = (currentLine.a * current.center.x + currentLine.b * current.center.y + currentLine.c) / Math.sqrt(denominator);
  const distance = Math.abs(signedDistance);
  if (distance > current.radius + 1e-10) return [];
  const foot = { x: current.center.x - currentLine.a * signedDistance / Math.sqrt(denominator), y: current.center.y - currentLine.b * signedDistance / Math.sqrt(denominator) };
  const half = Math.sqrt(Math.max(0, current.radius ** 2 - distance ** 2));
  const direction = { x: -currentLine.b / Math.sqrt(denominator), y: currentLine.a / Math.sqrt(denominator) };
  const points = half < 1e-10 ? [foot] : [{ x: foot.x - direction.x * half, y: foot.y - direction.y * half }, { x: foot.x + direction.x * half, y: foot.y + direction.y * half }];
  return points.sort((left, right) => left.x - right.x || left.y - right.y);
}

export function apolloniusLocus(A, B, ratio) {
  const first = point(A); const second = point(B); const k = Number(ratio);
  if (!first || !second || !Number.isFinite(k) || k <= 0) return null;
  if (Math.abs(k - 1) < 1e-10) return { type: "line", line: lineThroughPoints({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }, { x: (first.x + second.x) / 2 - (second.y - first.y), y: (first.y + second.y) / 2 + (second.x - first.x) }) };
  const denominator = 1 - k ** 2;
  return { type: "circle", center: { x: (first.x - k ** 2 * second.x) / denominator, y: (first.y - k ** 2 * second.y) / denominator }, radius: k * distance2D(first, second) / Math.abs(denominator) };
}

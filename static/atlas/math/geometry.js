const EPSILON = 1e-10;

function asPoint(point, name = "point") {
  const x = Array.isArray(point) ? Number(point[0]) : Number(point?.x);
  const y = Array.isArray(point) ? Number(point[1]) : Number(point?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError(`${name} must contain finite x and y coordinates`);
  return { x, y };
}

function cross(A, B, C) {
  return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function distance(A, B) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function midpoint(A, B) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

export function triangleArea2(A, B, C) {
  return cross(asPoint(A, "A"), asPoint(B, "B"), asPoint(C, "C"));
}

export function isDegenerateTriangle(A, B, C) {
  return Math.abs(triangleArea2(A, B, C)) <= EPSILON;
}

// Returns angle ABC in degrees. B is the vertex.
export function angleDegrees(A, B, C) {
  const first = asPoint(A, "A");
  const vertex = asPoint(B, "B");
  const third = asPoint(C, "C");
  const ux = first.x - vertex.x;
  const uy = first.y - vertex.y;
  const vx = third.x - vertex.x;
  const vy = third.y - vertex.y;
  const denominator = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  if (denominator <= EPSILON) return null;
  const cosine = clamp((ux * vx + uy * vy) / denominator, -1, 1);
  return Math.acos(cosine) * 180 / Math.PI;
}

export function centroid(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  if (Math.abs(cross(first, second, third)) <= EPSILON) return null;
  return { x: (first.x + second.x + third.x) / 3, y: (first.y + second.y + third.y) / 3 };
}

export function circumcenter(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  const denominator = 2 * (first.x * (second.y - third.y) + second.x * (third.y - first.y) + third.x * (first.y - second.y));
  if (Math.abs(denominator) <= EPSILON) return null;
  const firstSquared = first.x ** 2 + first.y ** 2;
  const secondSquared = second.x ** 2 + second.y ** 2;
  const thirdSquared = third.x ** 2 + third.y ** 2;
  return {
    x: (firstSquared * (second.y - third.y) + secondSquared * (third.y - first.y) + thirdSquared * (first.y - second.y)) / denominator,
    y: (firstSquared * (third.x - second.x) + secondSquared * (first.x - third.x) + thirdSquared * (second.x - first.x)) / denominator
  };
}

export function incenter(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  if (Math.abs(cross(first, second, third)) <= EPSILON) return null;
  const a = distance(second, third);
  const b = distance(third, first);
  const c = distance(first, second);
  const perimeter = a + b + c;
  return { x: (a * first.x + b * second.x + c * third.x) / perimeter, y: (a * first.y + b * second.y + c * third.y) / perimeter };
}

export function orthocenter(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  const center = circumcenter(first, second, third);
  if (!center) return null;
  return { x: first.x + second.x + third.x - 2 * center.x, y: first.y + second.y + third.y - 2 * center.y };
}

export function excenterA(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  if (Math.abs(cross(first, second, third)) <= EPSILON) return null;
  const a = distance(second, third);
  const b = distance(third, first);
  const c = distance(first, second);
  const denominator = -a + b + c;
  if (Math.abs(denominator) <= EPSILON) return null;
  return { x: (-a * first.x + b * second.x + c * third.x) / denominator, y: (-a * first.y + b * second.y + c * third.y) / denominator };
}

export function angleBisectorFoot(A, B, C) {
  const first = asPoint(A, "A");
  const second = asPoint(B, "B");
  const third = asPoint(C, "C");
  if (Math.abs(cross(first, second, third)) <= EPSILON) return null;
  const ab = distance(first, second);
  const ac = distance(first, third);
  const denominator = ab + ac;
  return { x: (ac * second.x + ab * third.x) / denominator, y: (ac * second.y + ab * third.y) / denominator };
}

export function lawOfCosinesSide(b, c, angleADegrees) {
  const sideB = Number(b);
  const sideC = Number(c);
  const angle = Number(angleADegrees);
  if (![sideB, sideC, angle].every(Number.isFinite) || sideB < 0 || sideC < 0) throw new RangeError("b, c, and angleA must be valid numbers");
  const square = sideB ** 2 + sideC ** 2 - 2 * sideB * sideC * Math.cos(angle * Math.PI / 180);
  return Math.sqrt(Math.max(0, square));
}

export function pointOnCircle(center, radius, degrees) {
  const origin = asPoint(center, "center");
  const circleRadius = Number(radius);
  const angle = Number(degrees);
  if (!Number.isFinite(circleRadius) || circleRadius < 0 || !Number.isFinite(angle)) throw new RangeError("radius and degrees must be valid numbers");
  const radians = angle * Math.PI / 180;
  return { x: origin.x + circleRadius * Math.cos(radians), y: origin.y + circleRadius * Math.sin(radians) };
}

export function lineCircleIntersections(point, direction, center, radius) {
  const start = asPoint(point, "point");
  const vector = asPoint(direction, "direction");
  const origin = asPoint(center, "center");
  const circleRadius = Number(radius);
  if (!Number.isFinite(circleRadius) || circleRadius < 0) throw new RangeError("radius must be a non-negative number");
  const a = vector.x ** 2 + vector.y ** 2;
  if (a <= EPSILON) throw new RangeError("direction must be non-zero");
  const offsetX = start.x - origin.x;
  const offsetY = start.y - origin.y;
  const b = 2 * (offsetX * vector.x + offsetY * vector.y);
  const c = offsetX ** 2 + offsetY ** 2 - circleRadius ** 2;
  const discriminant = b ** 2 - 4 * a * c;
  if (discriminant < -EPSILON) return [];
  const root = Math.sqrt(Math.max(0, discriminant));
  const parameters = Math.abs(root) <= EPSILON ? [-b / (2 * a)] : [(-b - root) / (2 * a), (-b + root) / (2 * a)];
  return parameters.sort((left, right) => left - right).map((t) => ({ x: start.x + t * vector.x, y: start.y + t * vector.y, t }));
}

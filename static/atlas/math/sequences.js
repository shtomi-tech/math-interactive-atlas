function finite(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }

export function arithmeticTerm(a1, d, n) {
  const first = Number(a1); const difference = Number(d); const index = Number(n);
  return Number.isFinite(first) && Number.isFinite(difference) && Number.isInteger(index) && index >= 1 ? first + (index - 1) * difference : null;
}

export function arithmeticTerms(a1, d, count) {
  const total = Number(count); if (!Number.isInteger(total) || total < 0) return [];
  return Array.from({ length: total }, (_, index) => arithmeticTerm(a1, d, index + 1));
}

export function arithmeticSum(a1, d, n) {
  const last = arithmeticTerm(a1, d, n); const total = Number(n);
  return last === null || !Number.isInteger(total) || total < 1 ? null : total * (Number(a1) + last) / 2;
}

export function geometricTerm(a1, r, n) {
  const first = Number(a1); const ratio = Number(r); const index = Number(n);
  return Number.isFinite(first) && Number.isFinite(ratio) && Number.isInteger(index) && index >= 1 ? first * ratio ** (index - 1) : null;
}

export function geometricTerms(a1, r, count) {
  const total = Number(count); if (!Number.isInteger(total) || total < 0) return [];
  return Array.from({ length: total }, (_, index) => geometricTerm(a1, r, index + 1));
}

export function geometricSum(a1, r, n) {
  const first = Number(a1); const ratio = Number(r); const total = Number(n);
  if (![first, ratio, total].every(Number.isFinite) || !Number.isInteger(total) || total < 1) return null;
  return Math.abs(ratio - 1) < 1e-12 ? first * total : first * (1 - ratio ** total) / (1 - ratio);
}

export function partialSums(values) {
  if (!Array.isArray(values)) return [];
  let sum = 0; return values.map((value) => { sum += finite(value); return sum; });
}

export function differenceSequence(values) {
  if (!Array.isArray(values) || values.length < 2) return [];
  return values.slice(1).map((value, index) => finite(value) - finite(values[index]));
}

export function generateRecurrence({ initial, next, count } = {}) {
  const total = Number(count); if (!Number.isInteger(total) || total < 0 || !Number.isFinite(Number(initial)) || typeof next !== "function") return [];
  const values = [Number(initial)];
  while (values.length < total) { const value = Number(next(values.at(-1), values.length, values)); if (!Number.isFinite(value)) break; values.push(value); }
  return values;
}

export function sigmaSum({ start, end, term } = {}) {
  const first = Number(start); const last = Number(end); if (!Number.isInteger(first) || !Number.isInteger(last) || typeof term !== "function" || first > last) return null;
  let result = 0; for (let index = first; index <= last; index += 1) { const value = Number(term(index)); if (!Number.isFinite(value)) return null; result += value; }
  return result;
}

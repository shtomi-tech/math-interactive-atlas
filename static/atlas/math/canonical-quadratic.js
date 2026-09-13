export function quadraticY({ a, h, k }, x) {
  return Number(a) * (Number(x) - Number(h)) ** 2 + Number(k);
}

export function clampProbeX(value, domain = [-6, 6]) {
  return Math.min(domain[1], Math.max(domain[0], Number(value)));
}

export function moveVertex(state, h, k, bounds = { h: [-5, 5], k: [-5, 5] }) {
  return {
    ...state,
    h: Math.min(bounds.h[1], Math.max(bounds.h[0], Number(h))),
    k: Math.min(bounds.k[1], Math.max(bounds.k[0], Number(k)))
  };
}

export function normalizeCoefficient(value, min, max, step) {
  const bounded = Math.min(Number(max), Math.max(Number(min), Number(value)));
  const steps = Math.round((bounded - Number(min)) / Number(step));
  return Number((Number(min) + steps * Number(step)).toFixed(8));
}

export function quadraticExpression({ a, h, k }) {
  const coefficient = Number(a);
  const horizontal = Number(h);
  const vertical = Number(k);
  const coefficientText = Number.isInteger(coefficient) ? String(coefficient) : coefficient.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const horizontalText = horizontal === 0 ? "x" : `(x ${horizontal < 0 ? "+" : "−"} ${Math.abs(horizontal)})`;
  const verticalText = vertical === 0 ? "" : ` ${vertical < 0 ? "−" : "+"} ${Math.abs(vertical)}`;
  return `y = ${coefficientText}${horizontalText}²${verticalText}`;
}

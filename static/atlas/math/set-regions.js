export const REGION_BITS = Object.freeze({
  OUTSIDE: 1,
  A_ONLY: 2,
  INTERSECTION: 4,
  B_ONLY: 8
});

const REGION_MASK = REGION_BITS.OUTSIDE | REGION_BITS.A_ONLY | REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY;

const EXPRESSIONS = Object.freeze([
  { text: "∅", latex: "\\varnothing" },
  { text: "(A ∪ B)ᶜ", latex: "\\left(A \\cup B\\right)^c" },
  { text: "A ∩ Bᶜ", latex: "A \\cap B^c" },
  { text: "Bᶜ", latex: "B^c" },
  { text: "A ∩ B", latex: "A \\cap B" },
  { text: "(A ∩ B) ∪ (A ∪ B)ᶜ", latex: "\\left(A \\cap B\\right) \\cup \\left(A \\cup B\\right)^c" },
  { text: "A", latex: "A" },
  { text: "A ∪ Bᶜ", latex: "A \\cup B^c" },
  { text: "Aᶜ ∩ B", latex: "A^c \\cap B" },
  { text: "Aᶜ", latex: "A^c" },
  { text: "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)", latex: "\\left(A \\cap B^c\\right) \\cup \\left(A^c \\cap B\\right)" },
  { text: "(A ∩ B)ᶜ", latex: "\\left(A \\cap B\\right)^c" },
  { text: "B", latex: "B" },
  { text: "Aᶜ ∪ B", latex: "A^c \\cup B" },
  { text: "A ∪ B", latex: "A \\cup B" },
  { text: "U", latex: "U" }
]);

export function normalizeMask(mask) {
  const value = Number(mask);
  return Number.isInteger(value) ? value & REGION_MASK : 0;
}

export function expressionForMask(mask) {
  return EXPRESSIONS[normalizeMask(mask)].text;
}

export function latexForMask(mask) {
  return EXPRESSIONS[normalizeMask(mask)].latex;
}

export function toggleRegion(mask, bit) {
  const value = Number(bit);
  if (![...Object.values(REGION_BITS)].includes(value)) return normalizeMask(mask);
  return normalizeMask(mask) ^ value;
}

export const REGION_BITS = Object.freeze({
  OUTSIDE: 1,
  A_ONLY: 2,
  INTERSECTION: 4,
  B_ONLY: 8
});

const REGION_MASK = REGION_BITS.OUTSIDE | REGION_BITS.A_ONLY | REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY;

const EXPRESSIONS = Object.freeze([
  "∅",
  "(A ∪ B)ᶜ",
  "A ∩ Bᶜ",
  "Bᶜ",
  "A ∩ B",
  "(A ∩ B) ∪ (A ∪ B)ᶜ",
  "A",
  "A ∪ Bᶜ",
  "Aᶜ ∩ B",
  "Aᶜ",
  "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)",
  "(A ∩ B)ᶜ",
  "B",
  "Aᶜ ∪ B",
  "A ∪ B",
  "U"
]);

export function normalizeMask(mask) {
  const value = Number(mask);
  return Number.isInteger(value) ? value & REGION_MASK : 0;
}

export function expressionForMask(mask) {
  return EXPRESSIONS[normalizeMask(mask)];
}

export function toggleRegion(mask, bit) {
  const value = Number(bit);
  if (![...Object.values(REGION_BITS)].includes(value)) return normalizeMask(mask);
  return normalizeMask(mask) ^ value;
}

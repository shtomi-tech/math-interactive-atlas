import { REGION_BITS } from "./set-regions.js?v=20260912-7k";

export const CONDITIONAL_STEPS = Object.freeze({
  OVERVIEW: "overview",
  CONDITION: "condition",
  INTERSECTION: "intersection",
  FORMULA: "formula"
});

const B_MASK = REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY;
const INTERSECTION_MASK = REGION_BITS.INTERSECTION;
const UNIVERSE_MASK = REGION_BITS.OUTSIDE | REGION_BITS.A_ONLY | REGION_BITS.INTERSECTION | REGION_BITS.B_ONLY;

const STEP_FACTS = Object.freeze({
  [CONDITIONAL_STEPS.OVERVIEW]: Object.freeze({
    step: CONDITIONAL_STEPS.OVERVIEW,
    title: "① 全体Uを見る",
    description: "標本空間U全体を見て、事象Aと事象Bの位置を確認します。",
    activeMask: 0,
    universeMask: UNIVERSE_MASK,
    formulaText: "U",
    formulaLatex: "U"
  }),
  [CONDITIONAL_STEPS.CONDITION]: Object.freeze({
    step: CONDITIONAL_STEPS.CONDITION,
    title: "② Bに絞る",
    description: "条件：Bが起こったとすると、考える新しい全体はBです。",
    activeMask: B_MASK,
    universeMask: B_MASK,
    formulaText: "B",
    formulaLatex: "B"
  }),
  [CONDITIONAL_STEPS.INTERSECTION]: Object.freeze({
    step: CONDITIONAL_STEPS.INTERSECTION,
    title: "③ A∩Bを見る",
    description: "Bの世界でAが起こる部分が、A∩Bです。",
    activeMask: INTERSECTION_MASK,
    universeMask: B_MASK,
    formulaText: "A ∩ B",
    formulaLatex: "A\\cap B"
  }),
  [CONDITIONAL_STEPS.FORMULA]: Object.freeze({
    step: CONDITIONAL_STEPS.FORMULA,
    title: "④ 公式を見る",
    description: "分母は新しい全体Bの確率です。ベン図の面積を確率の数値にはしません。",
    activeMask: INTERSECTION_MASK,
    universeMask: B_MASK,
    formulaText: "P(A|B) = P(A∩B) / P(B)",
    formulaLatex: "P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}"
  })
});

export function conditionalStepFacts(step) {
  return STEP_FACTS[step] || STEP_FACTS[CONDITIONAL_STEPS.OVERVIEW];
}

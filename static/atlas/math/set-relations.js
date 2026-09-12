export const SET_RELATIONS = Object.freeze({
  P_SUBSET_Q: "p-subset-q",
  Q_SUBSET_P: "q-subset-p",
  EQUAL: "equal",
  NEITHER: "neither"
});

const RELATION_FACTS = Object.freeze({
  [SET_RELATIONS.P_SUBSET_Q]: Object.freeze({
    pImpliesQ: true,
    qImpliesP: false,
    relationText: "P ⊆ Q",
    relationLatex: "P\\subseteq Q",
    implicationText: "p ⇒ q",
    implicationLatex: "p\\Rightarrow q",
    sufficientText: "pはqの十分条件",
    necessaryText: "qはpの必要条件"
  }),
  [SET_RELATIONS.Q_SUBSET_P]: Object.freeze({
    pImpliesQ: false,
    qImpliesP: true,
    relationText: "Q ⊆ P",
    relationLatex: "Q\\subseteq P",
    implicationText: "q ⇒ p",
    implicationLatex: "q\\Rightarrow p",
    sufficientText: "qはpの十分条件",
    necessaryText: "pはqの必要条件"
  }),
  [SET_RELATIONS.EQUAL]: Object.freeze({
    pImpliesQ: true,
    qImpliesP: true,
    relationText: "P = Q",
    relationLatex: "P=Q",
    implicationText: "p ⇔ q",
    implicationLatex: "p\\Leftrightarrow q",
    sufficientText: "pはqの必要十分条件",
    necessaryText: "qはpの必要十分条件"
  }),
  [SET_RELATIONS.NEITHER]: Object.freeze({
    pImpliesQ: false,
    qImpliesP: false,
    relationText: "P ⊄ Q ／ Q ⊄ P",
    relationLatex: "P\\nsubseteq Q\\quad /\\quad Q\\nsubseteq P",
    implicationText: "p ⇒ q も q ⇒ p も一般には成り立たない",
    implicationLatex: "p\\nRightarrow q\\quad /\\quad q\\nRightarrow p",
    sufficientText: "pはqの十分条件ではない",
    necessaryText: "qはpの必要条件ではない"
  })
});

export function relationFacts(relation) {
  return RELATION_FACTS[relation] || RELATION_FACTS[SET_RELATIONS.P_SUBSET_Q];
}

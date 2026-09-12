import {
  REGION_BITS,
  expressionForMask,
  latexForMask,
  normalizeMask,
  toggleRegion
} from "../math/set-regions.js?v=20260912-7k";
import { CONDITIONAL_STEPS, conditionalStepFacts } from "../math/conditional-probability.js?v=20260912-7k";
import { EVENT_TYPES, eventFacts } from "../math/event-regions.js?v=20260912-7k";
import { SET_RELATIONS, relationFacts } from "../math/set-relations.js?v=20260912-7k";

const SVG_NS = "http://www.w3.org/2000/svg";
let selectorSequence = 0;

const REGION_DEFINITIONS = Object.freeze([
  { bit: REGION_BITS.OUTSIDE, key: "outside", label: "外側" },
  { bit: REGION_BITS.A_ONLY, key: "a-only", label: "Aだけ" },
  { bit: REGION_BITS.INTERSECTION, key: "intersection", label: "A ∩ B" },
  { bit: REGION_BITS.B_ONLY, key: "b-only", label: "Bだけ" }
]);

const RELATION_OPTIONS = Object.freeze([
  { value: SET_RELATIONS.P_SUBSET_Q, label: "P ⊆ Q" },
  { value: SET_RELATIONS.Q_SUBSET_P, label: "Q ⊆ P" },
  { value: SET_RELATIONS.EQUAL, label: "P = Q" },
  { value: SET_RELATIONS.NEITHER, label: "どちらでもない" }
]);

const EVENT_OPTIONS = Object.freeze([
  { value: EVENT_TYPES.A, label: "A" },
  { value: EVENT_TYPES.B, label: "B" },
  { value: EVENT_TYPES.A_COMPLEMENT, label: "Aᶜ" },
  { value: EVENT_TYPES.B_COMPLEMENT, label: "Bᶜ" },
  { value: EVENT_TYPES.INTERSECTION, label: "A ∩ B" },
  { value: EVENT_TYPES.UNION, label: "A ∪ B" },
  { value: EVENT_TYPES.UNION_COMPLEMENT, label: "(A ∪ B)ᶜ" },
  { value: EVENT_TYPES.INTERSECTION_COMPLEMENT, label: "(A ∩ B)ᶜ" }
]);

const CONDITIONAL_OPTIONS = Object.freeze([
  { value: CONDITIONAL_STEPS.OVERVIEW, label: "① 全体を見る" },
  { value: CONDITIONAL_STEPS.CONDITION, label: "② Bに絞る" },
  { value: CONDITIONAL_STEPS.INTERSECTION, label: "③ A∩Bを見る" },
  { value: CONDITIONAL_STEPS.FORMULA, label: "④ 公式を見る" }
]);

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function createRegionLayout(container, { controlsLabel, resultLabel, rootClass = "" }) {
  container.replaceChildren();
  const root = document.createElement("div");
  root.className = `atlas-region-selector${rootClass ? ` ${rootClass}` : ""}`;
  const diagram = document.createElement("div");
  diagram.className = "atlas-region-diagram";
  const controls = document.createElement("div");
  controls.className = "atlas-region-controls";
  controls.setAttribute("aria-label", controlsLabel);
  const result = document.createElement("section");
  result.className = "atlas-region-result";
  result.setAttribute("aria-live", "polite");
  const resultHeading = document.createElement("p");
  resultHeading.className = "atlas-region-result-label";
  resultHeading.textContent = resultLabel;
  result.append(resultHeading);
  root.append(diagram, controls, result);
  container.append(root);
  return { root, diagram, controls, result };
}

function renderLatex(target, latex, fallback) {
  target.replaceChildren();
  target.setAttribute("aria-label", fallback);
  if (window.katex?.render && latex) {
    try {
      window.katex.render(latex, target, { displayMode: true, throwOnError: false });
      return;
    } catch {
      // Keep the plain expression when KaTeX is unavailable or cannot render it.
    }
  }
  target.textContent = fallback;
}

function createToggleButton({ label, pressed, ariaLabel, onActivate }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "atlas-region-toggle";
  button.setAttribute("aria-pressed", String(pressed));
  button.setAttribute("aria-label", ariaLabel);
  button.textContent = pressed ? `✓ ${label}` : label;
  const listener = () => onActivate();
  button.addEventListener("click", listener);
  return { button, cleanup: () => button.removeEventListener("click", listener) };
}

function cleanupScene(container, cleanup) {
  cleanup.forEach((remove) => remove());
  container.replaceChildren();
}

function createSetRegionsSvg(container, instanceId, onRegionToggle) {
  const svg = svgElement("svg", {
    class: "atlas-region-svg",
    viewBox: "0 0 500 320",
    role: "img",
    "aria-label": "全体集合Uの中にある集合Aと集合Bのベン図"
  });
  const defs = svgElement("defs");
  const a = { cx: 205, cy: 155, r: 92 };
  const b = { cx: 295, cy: 155, r: 92 };

  const outsideMask = svgElement("mask", { id: `${instanceId}-outside-mask`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 500, height: 320 });
  outsideMask.append(
    svgElement("rect", { x: 0, y: 0, width: 500, height: 320, fill: "white" }),
    svgElement("circle", { ...a, fill: "black" }),
    svgElement("circle", { ...b, fill: "black" })
  );

  const aOnlyMask = svgElement("mask", { id: `${instanceId}-a-only-mask`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 500, height: 320 });
  aOnlyMask.append(
    svgElement("circle", { ...a, fill: "white" }),
    svgElement("circle", { ...b, fill: "black" })
  );

  const bOnlyMask = svgElement("mask", { id: `${instanceId}-b-only-mask`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 500, height: 320 });
  bOnlyMask.append(
    svgElement("circle", { ...b, fill: "white" }),
    svgElement("circle", { ...a, fill: "black" })
  );

  const intersectionClip = svgElement("clipPath", { id: `${instanceId}-intersection-clip`, clipPathUnits: "userSpaceOnUse" });
  intersectionClip.append(svgElement("circle", { ...b }));
  defs.append(outsideMask, aOnlyMask, bOnlyMask, intersectionClip);
  svg.append(defs);

  svg.append(svgElement("rect", { class: "atlas-region-panel", x: 20, y: 24, width: 460, height: 272, rx: 16 }));

  const regionElements = new Map();
  const cleanup = [];
  const outside = svgElement("rect", {
    class: "atlas-region-shape atlas-region-shape-outside",
    x: 20,
    y: 24,
    width: 460,
    height: 272,
    rx: 16,
    mask: `url(#${instanceId}-outside-mask)`,
    "data-region-bit": REGION_BITS.OUTSIDE
  });
  const aOnly = svgElement("circle", {
    class: "atlas-region-shape atlas-region-shape-a-only",
    ...a,
    mask: `url(#${instanceId}-a-only-mask)`,
    "data-region-bit": REGION_BITS.A_ONLY
  });
  const bOnly = svgElement("circle", {
    class: "atlas-region-shape atlas-region-shape-b-only",
    ...b,
    mask: `url(#${instanceId}-b-only-mask)`,
    "data-region-bit": REGION_BITS.B_ONLY
  });
  const intersection = svgElement("circle", {
    class: "atlas-region-shape atlas-region-shape-intersection",
    ...a,
    "clip-path": `url(#${instanceId}-intersection-clip)`,
    "data-region-bit": REGION_BITS.INTERSECTION
  });

  REGION_DEFINITIONS.forEach(({ bit, key }) => {
    const element = { outside, "a-only": aOnly, intersection, "b-only": bOnly }[key];
    if (onRegionToggle) {
      const listener = () => onRegionToggle(bit);
      element.addEventListener("pointerup", listener);
      cleanup.push(() => element.removeEventListener("pointerup", listener));
    }
    regionElements.set(bit, element);
  });
  svg.append(outside, aOnly, bOnly, intersection);

  const boundaries = svgElement("g", { class: "atlas-region-boundaries", "pointer-events": "none" });
  boundaries.append(svgElement("circle", { ...a }), svgElement("circle", { ...b }));
  svg.append(boundaries);

  const labels = svgElement("g", { class: "atlas-region-labels", "pointer-events": "none" });
  labels.append(
    svgElement("text", { x: 144, y: 105 }),
    svgElement("text", { x: 346, y: 105 }),
    svgElement("text", { x: 250, y: 165 }),
    svgElement("text", { x: 38, y: 52 })
  );
  labels.children[0].textContent = "A";
  labels.children[1].textContent = "B";
  labels.children[2].textContent = "A ∩ B";
  labels.children[3].textContent = "U";
  svg.append(labels);
  container.append(svg);
  return { svg, regionElements, cleanup };
}

function mountSetRegionsScene(container, config = {}) {
  const initialMask = normalizeMask(config.initial?.selectedMask);
  let selectedMask = initialMask;
  let destroyed = false;
  const instanceId = `atlas-region-selector-${selectorSequence += 1}`;
  const { controls, result, diagram } = createRegionLayout(container, {
    controlsLabel: "ベン図の領域選択",
    resultLabel: "選択した領域"
  });
  const expression = document.createElement("div");
  expression.className = "atlas-region-expression";
  const summary = document.createElement("p");
  summary.className = "atlas-region-summary";
  result.append(expression, summary);

  const buttons = new Map();
  const svgParts = createSetRegionsSvg(diagram, instanceId, (bit) => setMask(toggleRegion(selectedMask, bit)));
  const cleanup = [...svgParts.cleanup];
  const { regionElements } = svgParts;

  REGION_DEFINITIONS.forEach(({ bit, label }) => {
    const { button, cleanup: removeListener } = createToggleButton({
      label,
      pressed: false,
      ariaLabel: `${label}を選択`,
      onActivate: () => setMask(toggleRegion(selectedMask, bit))
    });
    button.dataset.regionBit = String(bit);
    button.dataset.label = label;
    controls.append(button);
    buttons.set(bit, button);
    cleanup.push(removeListener);
  });

  function setMask(mask) {
    if (destroyed) return;
    selectedMask = normalizeMask(mask);
    const currentExpression = expressionForMask(selectedMask);
    REGION_DEFINITIONS.forEach(({ bit, label }) => {
      const selected = Boolean(selectedMask & bit);
      regionElements.get(bit)?.classList.toggle("is-selected", selected);
      const button = buttons.get(bit);
      if (!button) return;
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = selected ? `✓ ${label}` : label;
      button.classList.toggle("is-selected", selected);
    });
    renderLatex(expression, latexForMask(selectedMask), currentExpression);
    summary.textContent = `選択した領域：${currentExpression}`;
    config.onStateChange?.({ selectedMask }, summary.textContent);
  }

  function reset() {
    setMask(initialMask);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "selectedMask") setMask(value);
  }

  setMask(initialMask);
  return {
    reset,
    destroy,
    getState: () => ({ selectedMask }),
    setParameter
  };
}

function createRelationSvg(container) {
  const svg = svgElement("svg", {
    class: "atlas-region-svg atlas-relation-svg",
    viewBox: "0 0 500 320",
    role: "img",
    "aria-label": "集合Pと集合Qの包含関係を表す図"
  });
  svg.append(svgElement("rect", { class: "atlas-region-panel", x: 20, y: 24, width: 460, height: 272, rx: 16 }));
  const relationGroups = new Map();
  const cleanup = [];
  const options = {
    [SET_RELATIONS.P_SUBSET_Q]: {
      p: { cx: 250, cy: 160, rx: 78, ry: 56 },
      q: { cx: 250, cy: 160, rx: 164, ry: 112 }
    },
    [SET_RELATIONS.Q_SUBSET_P]: {
      p: { cx: 250, cy: 160, rx: 164, ry: 112 },
      q: { cx: 250, cy: 160, rx: 78, ry: 56 }
    },
    [SET_RELATIONS.EQUAL]: {
      equal: { cx: 250, cy: 160, rx: 126, ry: 88 }
    },
    [SET_RELATIONS.NEITHER]: {
      p: { cx: 202, cy: 160, rx: 112, ry: 78 },
      q: { cx: 298, cy: 160, rx: 112, ry: 78 }
    }
  };

  RELATION_OPTIONS.forEach(({ value, label }) => {
    const group = svgElement("g", {
      class: "atlas-relation-option",
      "data-relation": value
    });
    const shapeData = options[value];
    const shapeEntries = value === SET_RELATIONS.P_SUBSET_Q
      ? [["q", shapeData.q], ["p", shapeData.p]]
      : value === SET_RELATIONS.Q_SUBSET_P
        ? [["p", shapeData.p], ["q", shapeData.q]]
        : [["p", shapeData.p], ["q", shapeData.q]];
    shapeEntries.forEach(([name, shape]) => {
      if (shape) group.append(svgElement("ellipse", { class: `atlas-relation-shape atlas-relation-shape-${name}`, ...shape }));
    });
    if (shapeData.equal) group.append(svgElement("ellipse", { class: "atlas-relation-shape atlas-relation-shape-equal", ...shapeData.equal }));
    const labels = svgElement("g", { class: "atlas-relation-labels", "pointer-events": "none" });
    if (value === SET_RELATIONS.P_SUBSET_Q) {
      labels.append(svgElement("text", { x: 250, y: 160 }), svgElement("text", { x: 250, y: 74 }));
      labels.children[0].textContent = "P";
      labels.children[1].textContent = "Q";
    } else if (value === SET_RELATIONS.Q_SUBSET_P) {
      labels.append(svgElement("text", { x: 250, y: 74 }), svgElement("text", { x: 250, y: 160 }));
      labels.children[0].textContent = "P";
      labels.children[1].textContent = "Q";
    } else if (value === SET_RELATIONS.EQUAL) {
      labels.append(svgElement("text", { x: 250, y: 160 }));
      labels.children[0].textContent = "P = Q";
    } else {
      labels.append(svgElement("text", { x: 160, y: 160 }), svgElement("text", { x: 340, y: 160 }));
      labels.children[0].textContent = "P";
      labels.children[1].textContent = "Q";
    }
    group.append(labels);
    relationGroups.set(value, group);
    svg.append(group);
  });
  container.append(svg);
  return { svg, relationGroups, cleanup };
}

function mountNecessarySufficientScene(container, config = {}) {
  const relationValues = new Set(Object.values(SET_RELATIONS));
  const initialRelation = relationValues.has(config.initial?.relation) ? config.initial.relation : SET_RELATIONS.P_SUBSET_Q;
  let relation = initialRelation;
  let destroyed = false;
  const { controls, result, diagram } = createRegionLayout(container, {
    controlsLabel: "集合Pと集合Qの関係選択",
    resultLabel: "現在の関係",
    rootClass: "atlas-relation-selector"
  });
  const formulaFields = document.createElement("div");
  formulaFields.className = "atlas-relation-result-fields";
  const relationField = document.createElement("p");
  const relationFieldLabel = document.createElement("span");
  relationFieldLabel.className = "atlas-relation-field-label";
  relationFieldLabel.textContent = "集合";
  const relationFormula = document.createElement("span");
  relationFormula.className = "atlas-relation-formula";
  relationField.append(relationFieldLabel, relationFormula);
  const implicationField = document.createElement("p");
  const implicationFieldLabel = document.createElement("span");
  implicationFieldLabel.className = "atlas-relation-field-label";
  implicationFieldLabel.textContent = "命題";
  const implicationFormula = document.createElement("span");
  implicationFormula.className = "atlas-relation-formula";
  implicationField.append(implicationFieldLabel, implicationFormula);
  const conditionField = document.createElement("div");
  conditionField.className = "atlas-relation-condition-fields";
  formulaFields.append(relationField, implicationField, conditionField);
  const summary = document.createElement("p");
  summary.className = "atlas-region-summary";
  result.append(formulaFields, summary);

  const buttons = new Map();
  const svgParts = createRelationSvg(diagram);
  const cleanup = [...svgParts.cleanup];
  const { relationGroups } = svgParts;

  RELATION_OPTIONS.forEach(({ value, label }) => {
    const { button, cleanup: removeListener } = createToggleButton({
      label,
      pressed: false,
      ariaLabel: `${label}を選択`,
      onActivate: () => setRelation(value)
    });
    button.dataset.relation = value;
    controls.append(button);
    buttons.set(value, button);
    cleanup.push(removeListener);
  });

  function setRelation(nextRelation) {
    if (destroyed || !relationValues.has(nextRelation)) return;
    relation = nextRelation;
    const facts = relationFacts(relation);
    relationGroups.forEach((group, value) => {
      const active = value === relation;
      group.classList.toggle("is-active", active);
      group.setAttribute("aria-hidden", String(!active));
    });
    buttons.forEach((button, value) => {
      const active = value === relation;
      const label = RELATION_OPTIONS.find((option) => option.value === value)?.label || value;
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? `✓ ${label}` : label;
      button.classList.toggle("is-selected", active);
    });
    renderLatex(relationFormula, facts.relationLatex, facts.relationText);
    renderLatex(implicationFormula, facts.implicationLatex, facts.implicationText);
    const conditionStatements = facts.conditionStatements || [facts.sufficientText, facts.necessaryText];
    conditionField.replaceChildren();
    conditionStatements.forEach((statement) => {
      const condition = document.createElement("p");
      condition.textContent = statement;
      conditionField.append(condition);
    });
    summary.textContent = `${facts.relationText} ／ ${facts.implicationText} ／ ${conditionStatements.join(" ／ ")}`;
    config.onStateChange?.({ relation }, summary.textContent);
  }

  function reset() {
    setRelation(initialRelation);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "relation") setRelation(value);
  }

  setRelation(initialRelation);
  return {
    reset,
    destroy,
    getState: () => ({ relation }),
    setParameter
  };
}

function mountEventRegionsScene(container, config = {}) {
  const eventValues = new Set(Object.values(EVENT_TYPES));
  const initialEvent = eventValues.has(config.initial?.event) ? config.initial.event : EVENT_TYPES.UNION;
  let event = initialEvent;
  let destroyed = false;
  const instanceId = `atlas-event-selector-${selectorSequence += 1}`;
  const { controls, result, diagram } = createRegionLayout(container, {
    controlsLabel: "見たい事象の選択",
    resultLabel: "選択中の事象",
    rootClass: "atlas-event-selector"
  });
  const expression = document.createElement("div");
  expression.className = "atlas-region-expression atlas-event-expression";
  const description = document.createElement("p");
  description.className = "atlas-event-description";
  const summary = document.createElement("p");
  summary.className = "atlas-region-summary";
  result.append(expression, description, summary);

  const svgParts = createSetRegionsSvg(diagram, instanceId);
  const cleanup = [...svgParts.cleanup];
  const { regionElements } = svgParts;
  const buttons = new Map();

  EVENT_OPTIONS.forEach(({ value, label }) => {
    const { button, cleanup: removeListener } = createToggleButton({
      label,
      pressed: false,
      ariaLabel: `${label}を選択`,
      onActivate: () => setEvent(value)
    });
    button.dataset.event = value;
    controls.append(button);
    buttons.set(value, button);
    cleanup.push(removeListener);
  });

  function setEvent(nextEvent) {
    if (destroyed || !eventValues.has(nextEvent)) return;
    event = nextEvent;
    const facts = eventFacts(event);
    REGION_DEFINITIONS.forEach(({ bit }) => {
      regionElements.get(bit)?.classList.toggle("is-selected", Boolean(facts.mask & bit));
    });
    buttons.forEach((button, value) => {
      const active = value === event;
      const label = EVENT_OPTIONS.find((option) => option.value === value)?.label || value;
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? `✓ ${label}` : label;
      button.classList.toggle("is-selected", active);
    });
    renderLatex(expression, facts.latex, facts.text);
    description.textContent = facts.description;
    summary.textContent = `${facts.text}：${facts.description}`;
    config.onStateChange?.({ event }, summary.textContent);
  }

  function reset() {
    setEvent(initialEvent);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "event") setEvent(value);
  }

  setEvent(initialEvent);
  return {
    reset,
    destroy,
    getState: () => ({ event }),
    setParameter
  };
}

function mountConditionalProbabilityScene(container, config = {}) {
  const stepValues = new Set(Object.values(CONDITIONAL_STEPS));
  const initialStep = stepValues.has(config.initial?.step) ? config.initial.step : CONDITIONAL_STEPS.OVERVIEW;
  let step = initialStep;
  let destroyed = false;
  const instanceId = `atlas-conditional-selector-${selectorSequence += 1}`;
  const { controls, result, diagram } = createRegionLayout(container, {
    controlsLabel: "条件付き確率の学習ステップ",
    resultLabel: "現在の見方",
    rootClass: "atlas-conditional-selector"
  });
  const stepHeading = document.createElement("p");
  stepHeading.className = "atlas-conditional-step-heading";
  const formula = document.createElement("div");
  formula.className = "atlas-region-expression atlas-conditional-expression";
  const description = document.createElement("p");
  description.className = "atlas-conditional-description";
  const summary = document.createElement("p");
  summary.className = "atlas-region-summary";
  result.append(stepHeading, formula, description, summary);

  const svgParts = createSetRegionsSvg(diagram, instanceId);
  const cleanup = [...svgParts.cleanup];
  const { regionElements } = svgParts;
  const buttons = new Map();
  CONDITIONAL_OPTIONS.forEach(({ value, label }) => {
    const { button, cleanup: removeListener } = createToggleButton({
      label,
      pressed: false,
      ariaLabel: `${label}を選択`,
      onActivate: () => setStep(value)
    });
    button.classList.add("atlas-conditional-step-button");
    button.dataset.step = value;
    controls.append(button);
    buttons.set(value, button);
    cleanup.push(removeListener);
  });

  const navigation = document.createElement("div");
  navigation.className = "atlas-conditional-navigation";
  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "atlas-conditional-nav-button";
  previous.textContent = "← 前へ";
  previous.setAttribute("aria-label", "前の学習ステップへ");
  const next = document.createElement("button");
  next.type = "button";
  next.className = "atlas-conditional-nav-button";
  next.textContent = "次へ →";
  next.setAttribute("aria-label", "次の学習ステップへ");
  const previousListener = () => moveStep(-1);
  const nextListener = () => moveStep(1);
  previous.addEventListener("click", previousListener);
  next.addEventListener("click", nextListener);
  navigation.append(previous, next);
  controls.append(navigation);
  cleanup.push(() => previous.removeEventListener("click", previousListener));
  cleanup.push(() => next.removeEventListener("click", nextListener));

  function setStep(nextStep) {
    if (destroyed || !stepValues.has(nextStep)) return;
    step = nextStep;
    const facts = conditionalStepFacts(step);
    const stepIndex = CONDITIONAL_OPTIONS.findIndex((option) => option.value === step);
    const summaryText = facts.step === CONDITIONAL_STEPS.FORMULA
      ? "P(A|B) = P(A∩B) / P(B) ／ 分母はBの世界"
      : facts.description;
    diagram.parentElement?.setAttribute("data-conditional-step", facts.step);
    REGION_DEFINITIONS.forEach(({ bit }) => {
      const element = regionElements.get(bit);
      if (!element) return;
      const inUniverse = Boolean(facts.universeMask & bit);
      const active = Boolean(facts.activeMask & bit);
      element.classList.toggle("is-muted", !inUniverse);
      element.classList.toggle("is-universe", inUniverse && !active && step !== CONDITIONAL_STEPS.OVERVIEW);
      element.classList.toggle("is-selected", active);
    });
    buttons.forEach((button, value) => {
      const active = value === step;
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-current", active ? "step" : "false");
      button.textContent = active ? `✓ ${CONDITIONAL_OPTIONS.find((option) => option.value === value)?.label || value}` : CONDITIONAL_OPTIONS.find((option) => option.value === value)?.label || value;
      button.classList.toggle("is-selected", active);
    });
    previous.disabled = stepIndex <= 0;
    next.disabled = stepIndex >= CONDITIONAL_OPTIONS.length - 1;
    stepHeading.textContent = facts.title;
    renderLatex(formula, facts.formulaLatex, facts.formulaText);
    description.textContent = facts.description;
    summary.textContent = summaryText;
    config.onStateChange?.({ step }, summaryText);
  }

  function moveStep(offset) {
    const currentIndex = CONDITIONAL_OPTIONS.findIndex((option) => option.value === step);
    const nextIndex = Math.max(0, Math.min(CONDITIONAL_OPTIONS.length - 1, currentIndex + offset));
    setStep(CONDITIONAL_OPTIONS[nextIndex].value);
  }

  function reset() {
    setStep(initialStep);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanupScene(container, cleanup);
  }

  function setParameter(name, value) {
    if (name === "step") setStep(value);
  }

  setStep(initialStep);
  return {
    reset,
    destroy,
    getState: () => ({ step }),
    setParameter
  };
}

const REGION_MODES = Object.freeze({
  "set-regions": mountSetRegionsScene,
  "necessary-sufficient": mountNecessarySufficientScene,
  "event-regions": mountEventRegionsScene,
  "conditional-probability": mountConditionalProbabilityScene
});

export function mountRegionSelector(container, config = {}) {
  const mountScene = REGION_MODES[config.mode];
  if (!mountScene) throw new Error(`Unsupported region selector mode: ${config.mode || "(empty)"}`);
  return mountScene(container, config);
}

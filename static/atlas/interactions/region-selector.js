import {
  REGION_BITS,
  expressionForMask,
  normalizeMask,
  toggleRegion
} from "../math/set-regions.js";

const SVG_NS = "http://www.w3.org/2000/svg";
let selectorSequence = 0;

const REGION_DEFINITIONS = Object.freeze([
  { bit: REGION_BITS.OUTSIDE, key: "outside", label: "外側" },
  { bit: REGION_BITS.A_ONLY, key: "a-only", label: "Aだけ" },
  { bit: REGION_BITS.INTERSECTION, key: "intersection", label: "A ∩ B" },
  { bit: REGION_BITS.B_ONLY, key: "b-only", label: "Bだけ" }
]);

const LATEX_EXPRESSIONS = Object.freeze({
  "∅": "\\varnothing",
  "(A ∪ B)ᶜ": "\\left(A \\cup B\\right)^c",
  "A ∩ Bᶜ": "A \\cap B^c",
  "Bᶜ": "B^c",
  "A ∩ B": "A \\cap B",
  "(A ∩ B) ∪ (A ∪ B)ᶜ": "\\left(A \\cap B\\right) \\cup \\left(A \\cup B\\right)^c",
  "A": "A",
  "A ∪ Bᶜ": "A \\cup B^c",
  "Aᶜ ∩ B": "A^c \\cap B",
  "Aᶜ": "A^c",
  "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)": "\\left(A \\cap B^c\\right) \\cup \\left(A^c \\cap B\\right)",
  "(A ∩ B)ᶜ": "\\left(A \\cap B\\right)^c",
  "B": "B",
  "Aᶜ ∪ B": "A^c \\cup B",
  "A ∪ B": "A \\cup B",
  "U": "U"
});

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function renderExpression(target, expression) {
  target.replaceChildren();
  target.setAttribute("aria-label", expression);
  if (window.katex?.render && LATEX_EXPRESSIONS[expression]) {
    try {
      window.katex.render(LATEX_EXPRESSIONS[expression], target, { displayMode: true, throwOnError: false });
      return;
    } catch {
      // Keep the plain expression when KaTeX is unavailable or cannot render it.
    }
  }
  target.textContent = expression;
}

function createSvg(container, instanceId, onRegionToggle) {
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
    const listener = () => onRegionToggle(bit);
    element.addEventListener("pointerup", listener);
    cleanup.push(() => element.removeEventListener("pointerup", listener));
    regionElements.set(bit, element);
  });
  svg.append(outside, aOnly, bOnly, intersection);

  const boundaries = svgElement("g", { class: "atlas-region-boundaries", "pointer-events": "none" });
  boundaries.append(
    svgElement("circle", { ...a }),
    svgElement("circle", { ...b })
  );
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

export function mountRegionSelector(container, config = {}) {
  const initialMask = normalizeMask(config.initial?.selectedMask);
  let selectedMask = initialMask;
  let destroyed = false;
  const instanceId = `atlas-region-selector-${selectorSequence += 1}`;

  container.replaceChildren();
  const root = document.createElement("div");
  root.className = "atlas-region-selector";
  const diagram = document.createElement("div");
  diagram.className = "atlas-region-diagram";
  const controls = document.createElement("div");
  controls.className = "atlas-region-controls";
  controls.setAttribute("aria-label", "ベン図の領域選択");
  const result = document.createElement("section");
  result.className = "atlas-region-result";
  result.setAttribute("aria-live", "polite");
  const resultLabel = document.createElement("p");
  resultLabel.className = "atlas-region-result-label";
  resultLabel.textContent = "選択した領域";
  const expression = document.createElement("div");
  expression.className = "atlas-region-expression";
  const summary = document.createElement("p");
  summary.className = "atlas-region-summary";
  result.append(resultLabel, expression, summary);
  root.append(diagram, controls, result);
  container.append(root);

  const buttons = new Map();
  const svgParts = createSvg(diagram, instanceId, (bit) => setMask(toggleRegion(selectedMask, bit)));
  const cleanup = [...svgParts.cleanup];
  const { regionElements } = svgParts;

  REGION_DEFINITIONS.forEach(({ bit, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "atlas-region-toggle";
    button.dataset.regionBit = String(bit);
    button.dataset.label = label;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${label}を選択`);
    const listener = () => setMask(toggleRegion(selectedMask, bit));
    button.addEventListener("click", listener);
    controls.append(button);
    buttons.set(bit, button);
    cleanup.push(() => button.removeEventListener("click", listener));
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
    renderExpression(expression, currentExpression);
    summary.textContent = `選択した領域：${currentExpression}`;
    config.onStateChange?.({ selectedMask }, `選択した領域：${currentExpression}`);
  }

  function reset() {
    setMask(initialMask);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanup.forEach((remove) => remove());
    container.replaceChildren();
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

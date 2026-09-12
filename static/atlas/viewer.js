import { mountInteraction } from "./interactions/index.js?v=20260912-5c";
import { neighborsForContent } from "./curriculum.js?v=20260912-5c";

function renderFormula(target, expression) {
  target.className = "atlas-formula-fallback";
  if (window.katex?.render) {
    try {
      window.katex.render(expression, target, { displayMode: true, throwOnError: false });
      target.className = "";
      return;
    } catch {
      // Keep the plain expression when a renderer cannot process the formula.
    }
  }
  target.textContent = expression;
}

function numberText(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function createControl(name, definition, initial, onInput) {
  const label = document.createElement("label");
  label.className = "atlas-control";
  const heading = document.createElement("span");
  heading.className = "atlas-control-label";
  const nameText = document.createElement("span");
  nameText.textContent = definition.label || name;
  const output = document.createElement("output");
  output.className = "atlas-control-value";
  output.textContent = numberText(initial);
  heading.append(nameText, output);

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(definition.min);
  input.max = String(definition.max);
  input.step = String(definition.step);
  input.value = String(initial);
  input.setAttribute("aria-label", `${definition.label || name}を操作`);
  input.addEventListener("input", () => {
    output.textContent = numberText(input.value);
    onInput(name, Number(input.value));
  });
  label.append(heading, input);
  return { label, input, output };
}

function appendSource(section, source) {
  const heading = document.createElement("h2");
  heading.textContent = "Source";
  const implementation = document.createElement("p");
  implementation.textContent = `Interaction implementation: ${source.usage === "original" ? "Original" : source.usage}`;
  const library = document.createElement("p");
  library.textContent = `Rendering library: ${source.library || "none"}`;
  section.append(heading, implementation, library);

  if (source.license) {
    const license = document.createElement("p");
    license.textContent = `License: ${source.license}`;
    section.append(license);
  }
  if (source.repository) {
    const link = document.createElement("a");
    link.href = source.repository;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Repository";
    section.append(link);
  }
}

export function createViewer(root, { onBack, onRelated, onNavigate = onRelated }) {
  let engine = null;
  let controls = new Map();

  function destroy() {
    engine?.destroy();
    engine = null;
    controls = new Map();
    root.replaceChildren();
  }

  function render(content, contents) {
    destroy();

    const viewer = document.createElement("article");
    viewer.className = "atlas-viewer";

    const header = document.createElement("header");
    header.className = "atlas-viewer-header";
    const heading = document.createElement("div");
    const breadcrumb = document.createElement("p");
    breadcrumb.className = "atlas-breadcrumb";
    const position = neighborsForContent(contents, content.id);
    breadcrumb.textContent = `${content.subjectLabel}　＞　${content.unitLabel}　＞　${position.index + 1} / ${position.total}`;
    const title = document.createElement("h1");
    title.id = "viewerTitle";
    title.textContent = content.title;
    const description = document.createElement("p");
    description.className = "atlas-viewer-description";
    description.textContent = content.shortDescription;
    heading.append(breadcrumb, title, description);
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "atlas-back-button";
    backButton.textContent = "← 図鑑一覧へ戻る";
    backButton.addEventListener("click", onBack);
    header.append(heading, backButton);

    const formula = document.createElement("section");
    formula.className = "atlas-formula";
    formula.setAttribute("aria-label", "公式");
    const formulaTarget = document.createElement("span");
    renderFormula(formulaTarget, content.formula);
    formula.append(formulaTarget);

    const interactive = document.createElement("section");
    interactive.className = "atlas-interactive-section";
    const interactiveHeading = document.createElement("div");
    interactiveHeading.className = "atlas-section-heading";
    const interactiveTitle = document.createElement("h2");
    interactiveTitle.textContent = "動かしてみる";
    const interactionType = document.createElement("span");
    interactionType.className = "atlas-interaction-type";
    interactionType.textContent = String(content.interactionType).toUpperCase();
    interactiveHeading.append(interactiveTitle, interactionType);

    const frame = document.createElement("div");
    frame.className = "atlas-interactive-frame";
    const canvas = document.createElement("div");
    canvas.className = "atlas-canvas";
    const instructions = document.createElement("p");
    instructions.className = "atlas-instructions";
    instructions.textContent = content.instructions || "操作欄を使って、値の変化とグラフの関係を観察します。";
    const controlsHost = document.createElement("div");
    controlsHost.className = "atlas-controls";
    const footer = document.createElement("div");
    footer.className = "atlas-interaction-footer";
    const observation = document.createElement("p");
    observation.className = "atlas-observation";
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "atlas-reset";
    reset.textContent = "↺ 初期状態に戻す";

    function syncControls(state) {
      controls.forEach(({ input, output }, name) => {
        input.value = String(state[name]);
        output.textContent = numberText(state[name]);
      });
    }

    Object.entries(content.interaction.parameters || {}).forEach(([name, definition]) => {
      const control = createControl(name, definition, content.interaction.initial[name], (parameter, value) => engine.setParameter(parameter, value));
      controls.set(name, control);
      controlsHost.append(control.label);
    });
    footer.append(observation, reset);
    frame.append(canvas, instructions, controlsHost, footer);
    interactive.append(interactiveHeading, frame);

    const discovery = document.createElement("section");
    discovery.className = "atlas-discovery";
    const discoveryTitle = document.createElement("h2");
    discoveryTitle.textContent = "発見ポイント";
    const discoveryList = document.createElement("ul");
    discoveryList.className = "atlas-discovery-list";
    content.discoveryPoints.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      discoveryList.append(item);
    });
    discovery.append(discoveryTitle, discoveryList);

    const related = document.createElement("section");
    related.className = "atlas-related";
    const relatedTitle = document.createElement("h2");
    relatedTitle.textContent = "関連する概念";
    const relatedList = document.createElement("div");
    relatedList.className = "atlas-related-list";
    content.related.map((id) => contents.find((item) => item.id === id)).filter(Boolean).forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-related-button";
      const unit = document.createElement("small");
      unit.textContent = `${item.subjectLabel}　＞　${item.unitLabel}`;
      const itemTitle = document.createElement("strong");
      itemTitle.textContent = item.title;
      button.append(unit, itemTitle);
      button.addEventListener("click", () => onRelated(item.id));
      relatedList.append(button);
    });
    related.append(relatedTitle, relatedList);

    const navigation = document.createElement("nav");
    navigation.className = "atlas-learning-navigation";
    navigation.setAttribute("aria-label", "教材間の移動");
    [["previous", position.previous, "← 前の教材"], ["next", position.next, "次の教材 →"]].forEach(([direction, target, label]) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = `atlas-learning-navigation-${direction}`; button.disabled = !target;
      button.setAttribute("aria-label", target ? `${label}：${target.title}` : label);
      button.textContent = label;
      if (target) { const title = document.createElement("strong"); title.textContent = target.title; button.append(document.createElement("br"), title); button.addEventListener("click", () => onNavigate(target.id)); }
      navigation.append(button);
    });

    const source = document.createElement("footer");
    source.className = "atlas-source";
    appendSource(source, content.source);

    viewer.append(header, formula, interactive, discovery, related, navigation, source);
    root.append(viewer);

    engine = mountInteraction(canvas, content.interaction, {
      onStateChange: (state, summary) => {
        observation.textContent = summary;
        syncControls(state);
      }
    });
    if (!observation.textContent) observation.textContent = content.instructions || "操作欄を使って、値の変化とグラフの関係を観察します。";
    reset.addEventListener("click", () => engine.reset());
  }

  return { render, destroy };
}

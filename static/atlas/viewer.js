import { mountInteraction } from "./interactions/index.js?v=20260913-r2";
import { neighborsForContent, subjectLabel, unitLabel } from "./curriculum.js?v=20260913-r2";
import { practiceStatus } from "./storage.js?v=20260913-r2";

const STATUS_LABELS = { unattempted: "未挑戦", practicing: "練習中", review: "要復習", mastered: "習得" };

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

function appendRenderingInfo(section, rendering) {
  const heading = document.createElement("h2");
  heading.textContent = "Rendering";
  const library = document.createElement("p");
  library.textContent = `Rendering library: ${rendering?.library || "none"}`;
  section.append(heading, library);
}

function auditFor(repositoryAudits, contentId) { return repositoryAudits instanceof Map ? repositoryAudits.get(contentId) : repositoryAudits?.find?.((record) => record.contentId === contentId); }
function auditLabel(status, available = true) { return !available ? "Repository Audit unavailable" : status === "verified" ? "Verified" : status === "needs-review" ? "Needs Review" : "Pending Repository Audit"; }
function appendAuditStatus(section, audit, repositoryAuditStatus = "loaded") {
  if (repositoryAuditStatus === "unavailable") {
    const status = document.createElement("p");
    status.className = "atlas-audit-status is-unavailable";
    status.textContent = auditLabel(null, false);
    status.title = "外部Repository監査を読み込めません";
    section.append(status);
    return;
  }
  const record = audit || { auditStatus: "pending", references: [] };
  const status = document.createElement("p");
  status.className = `atlas-audit-status is-${record.auditStatus || "pending"}`;
  status.textContent = auditLabel(record.auditStatus);
  status.title = "外部Repositoryの監査状態";
  section.append(status);
  if (record.auditStatus !== "verified" || !Array.isArray(record.references)) return;
  const details = document.createElement("div");
  details.className = "atlas-audit-details";
  record.references.forEach((reference) => {
    const item = document.createElement("div");
    const repository = document.createElement("p");
    repository.textContent = "Repository: ";
    const link = document.createElement("a");
    link.href = reference.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = reference.repository;
    repository.append(link);
    const relation = document.createElement("p"); relation.textContent = `Relation: ${reference.relation}`;
    const license = document.createElement("p"); license.textContent = `License: ${reference.license}`;
    item.append(repository, relation, license);
    details.append(item);
  });
  section.append(details);
}

export function createViewer(root, { onBack, onRelated, onNavigate = onRelated, onToggleFavorite = () => {} }) {
  let engine = null;
  let controls = new Map();
  let observationObserver = null;

  function destroy() {
    observationObserver?.disconnect();
    observationObserver = null;
    engine?.destroy();
    engine = null;
    controls = new Map();
    root.replaceChildren();
  }

  function render(content, contents, { fromProblem = null, fromCatalog = null, practiceProblems = [], repositoryAudits = new Map(), repositoryAuditStatus = "loaded", learningState = {}, isFavorite = false } = {}) {
    destroy();

    const viewer = document.createElement("article");
    viewer.className = "atlas-viewer";

    const header = document.createElement("header");
    header.className = "atlas-viewer-header";
    const heading = document.createElement("div");
    const breadcrumb = document.createElement("p");
    breadcrumb.className = "atlas-breadcrumb";
    const position = neighborsForContent(contents, content.id);
    breadcrumb.textContent = `${subjectLabel(content.subject)}　＞　${unitLabel(content.unit)}　＞　${position.index + 1} / ${position.total}`;
    const title = document.createElement("h1");
    title.id = "viewerTitle";
    title.textContent = content.title;
    const description = document.createElement("p");
    description.className = "atlas-viewer-description";
    description.textContent = content.shortDescription;
    heading.append(breadcrumb, title, description);
    appendAuditStatus(heading, auditFor(repositoryAudits, content.id), repositoryAuditStatus);
    const actions = document.createElement("div");
    actions.className = "atlas-viewer-actions";
    if (fromProblem) {
      const problemBack = document.createElement("a");
      problemBack.className = "atlas-problem-return";
      problemBack.href = `./practice.html?problem=${encodeURIComponent(fromProblem)}&atlasContentId=${encodeURIComponent(content.id)}`;
      problemBack.textContent = "← 問題に戻る";
      actions.append(problemBack);
    }
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "atlas-favorite-button";
    let favoriteState = Boolean(isFavorite);
    const syncFavorite = () => { favorite.textContent = favoriteState ? "★ お気に入り" : "☆ お気に入り"; favorite.setAttribute("aria-pressed", String(favoriteState)); favorite.setAttribute("aria-label", favoriteState ? "お気に入りから外す" : "お気に入りに追加"); };
    syncFavorite();
    favorite.addEventListener("click", () => { const next = onToggleFavorite(content.id); favoriteState = typeof next === "boolean" ? next : !favoriteState; syncFavorite(); });
    actions.append(favorite);
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "atlas-back-button";
    backButton.textContent = "← 図鑑一覧へ戻る";
    backButton.addEventListener("click", () => onBack({ fromCatalog, fromProblem }));
    actions.append(backButton);
    header.append(heading, actions);

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
      unit.textContent = `${subjectLabel(item.subject)}　＞　${unitLabel(item.unit)}`;
      const itemTitle = document.createElement("strong");
      itemTitle.textContent = item.title;
      button.append(unit, itemTitle);
      button.addEventListener("click", () => onRelated(item.id, { fromCatalog, fromProblem }));
      relatedList.append(button);
    });
    related.append(relatedTitle, relatedList);

    const linkedProblems = (Array.isArray(practiceProblems) ? practiceProblems : []).filter((problem) => problem.atlasContentId === content.id).sort((left, right) => left.difficulty - right.difficulty || left.id.localeCompare(right.id));
    let practiceSection = null;
    if (linkedProblems.length) {
      practiceSection = document.createElement("section");
      practiceSection.className = "atlas-practice-links";
      const practiceTitle = document.createElement("h2");
      practiceTitle.textContent = "この概念を問題で使う";
      const practiceLead = document.createElement("p");
      practiceLead.textContent = "問題で確かめます。";
      const practiceList = document.createElement("ul");
      const difficultyLabels = ["基礎", "標準", "発展"];
      linkedProblems.forEach((problem) => { const item = document.createElement("li"); const link = document.createElement("a"); link.href = `./practice.html?problem=${encodeURIComponent(problem.id)}&atlasContentId=${encodeURIComponent(content.id)}`; const label = difficultyLabels[problem.difficulty - 1] || `難易度${problem.difficulty}`; const currentStatus = practiceStatus(learningState.practice?.[problem.id]); link.textContent = `${label}　${STATUS_LABELS[currentStatus] || currentStatus}`; item.append(link); practiceList.append(item); });
      const mastered = linkedProblems.filter((problem) => practiceStatus(learningState.practice?.[problem.id]) === "mastered").length;
      const practiceSummary = document.createElement("p");
      practiceSummary.className = "atlas-practice-summary";
      practiceSummary.textContent = `習得 ${mastered} / ${linkedProblems.length}`;
      const practiceAll = document.createElement("a");
      practiceAll.className = "atlas-practice-all-link";
      practiceAll.href = `./practice.html?content=${encodeURIComponent(content.id)}`;
      practiceAll.textContent = "この概念を練習";
      practiceSection.append(practiceTitle, practiceLead, practiceList, practiceSummary, practiceAll);
    }

    const navigation = document.createElement("nav");
    navigation.className = "atlas-learning-navigation";
    navigation.setAttribute("aria-label", "教材間の移動");
    [["previous", position.previous, "← 前の教材"], ["next", position.next, "次の教材 →"]].forEach(([direction, target, label]) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = `atlas-learning-navigation-${direction}`; button.disabled = !target;
      button.setAttribute("aria-label", target ? `${label}：${target.title}` : label);
      button.textContent = label;
      if (target) { const title = document.createElement("strong"); title.textContent = target.title; button.append(document.createElement("br"), title); button.addEventListener("click", () => onNavigate(target.id, { fromCatalog, fromProblem })); }
      navigation.append(button);
    });

    const source = document.createElement("footer");
    source.className = "atlas-source";
    appendRenderingInfo(source, content.rendering);

    viewer.append(header, formula, interactive, discovery, related);
    if (practiceSection) viewer.append(practiceSection);
    viewer.append(navigation, source);
    root.append(viewer);

    engine = mountInteraction(canvas, content.interaction, {
      onStateChange: (state, summary) => {
        observation.textContent = summary;
        syncControls(state);
      }
    });
    if (content.interaction.engine === "simulationLab") {
      const result = () => canvas.querySelector(".atlas-simulation-result");
      const syncSimulationObservation = () => {
        const current = result();
        if (current?.textContent) observation.textContent = current.textContent;
      };
      observationObserver = new MutationObserver(syncSimulationObservation);
      observationObserver.observe(canvas, { childList: true, characterData: true, subtree: true });
      syncSimulationObservation();
    }
    if (!observation.textContent) observation.textContent = content.instructions || "操作欄を使って、値の変化とグラフの関係を観察します。";
    reset.addEventListener("click", () => engine.reset());
  }

  return { render, destroy };
}

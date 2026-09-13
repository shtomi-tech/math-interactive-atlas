import { mountInteraction } from "../atlas/interactions/index.js?v=20260913-r8";
import { statusLabel } from "./catalog.js?v=20260913-r8";

const RUNTIME_INSTRUCTIONS = Object.freeze({
  "MATH-INT-001": "頂点をドラッグするか、ボタンを選択して矢印キーで移動します。",
  "MATH-INT-002": "係数aをスライダーまたはキーボードで変え、グラフの変化を比べます。",
  "MATH-INT-003": "曲線上の点をドラッグするか、ボタンを選択して左右キーで移動します。",
  "MATH-INT-009": "点Pをドラッグするか、点Pを選択して矢印キーで円周上を移動し、座標・sin・cosと保たれる関係を比べます。"
});

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function featureFor(features, featureId) { return features.get(featureId) || null; }

function appendList(parent, title, values = []) {
  parent.append(textElement("h2", "", title));
  const list = document.createElement("ul");
  values.forEach((value) => list.append(textElement("li", "", value)));
  parent.append(list);
}

function sourcePanel(interaction, features) {
  const panel = document.createElement("section");
  panel.className = "library-detail-panel";
  panel.append(textElement("h2", "", "Source Evidence"));
  const list = document.createElement("div");
  list.className = "library-source-list";
  interaction.sources.forEach((source) => {
    const feature = featureFor(features, source.featureId);
    const item = document.createElement("article");
    item.className = "library-source-item";
    item.append(textElement("p", "", `Repository: ${feature?.repository || "unavailable"}`));
    item.append(textElement("p", "", `Fixed Ref: ${feature?.ref || "unavailable"}`));
    item.append(textElement("p", "", `License: ${feature?.license || "unavailable"}`));
    item.append(textElement("p", "", `Relation: ${source.relation}`));
    feature?.evidenceUrls?.forEach((url, index) => {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `固定SHAのsource evidence ${index + 1}`;
      item.append(link);
    });
    list.append(item);
  });
  panel.append(list);
  return panel;
}

function runtimeConfig(mapping, onStateChange) {
  const functionGraph = { mode: mapping.mode, initial: { a: 1, h: 0, k: 0 }, onStateChange };
  const configs = {
    "canonical-vertex-drag": functionGraph,
    "canonical-coefficient-slider": { ...functionGraph, parameters: { a: { label: "係数 a", min: -3, max: 3, step: 0.1 } } },
    "canonical-curve-probe": { ...functionGraph, initial: { a: 1, h: 0, k: 0, probeX: 1, probeY: 1 } },
    "canonical-constrained-measure": { mode: mapping.mode, initial: { theta: 30 }, boundingbox: [-2.2, 2.0, 2.2, -2.0], onStateChange }
  };
  return configs[mapping.mode] || { mode: mapping.mode, onStateChange };
}

export function createViewer(root, { interactions, mappings, features, onBack }) {
  let engine = null;

  function destroy() {
    engine?.destroy?.();
    engine = null;
    root.replaceChildren();
  }

  function render(interactionId) {
    destroy();
    const interaction = interactions.find((item) => item.id === interactionId);
    const mapping = mappings.find((item) => item.interactionId === interactionId);
    if (!interaction || !mapping) return;

    const viewer = document.createElement("article");
    viewer.className = "library-viewer";
    const header = document.createElement("header");
    header.className = "library-viewer-header";
    const heading = document.createElement("div");
    const title = textElement("h1", "", interaction.title);
    title.id = "libraryViewerTitle";
    heading.append(textElement("p", "library-card-id", interaction.id), title, textElement("p", "library-viewer-description", interaction.description));
    const actions = document.createElement("div");
    actions.className = "library-viewer-actions";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "library-back";
    back.textContent = "← Library一覧へ戻る";
    back.addEventListener("click", onBack);
    actions.append(back);
    header.append(heading, actions);

    const details = document.createElement("div");
    details.className = "library-detail-grid";
    const learning = document.createElement("section");
    learning.className = "library-detail-panel";
    learning.append(textElement("h2", "", "Learning Goal"), textElement("p", "", interaction.learningGoal));
    appendList(learning, "Learner Actions", interaction.learnerActions);
    appendList(learning, "Feedback", interaction.feedbackCapabilities);
    const runtime = document.createElement("section");
    runtime.className = "library-detail-panel";
    runtime.append(textElement("h2", "", "Runtime Status"), textElement("p", "library-runtime-status is-" + mapping.status, statusLabel(mapping.status)));
    runtime.append(textElement("p", "", mapping.status === "implemented" ? `Engine: ${mapping.engine} / Mode: ${mapping.mode}` : mapping.status === "planned" ? "Runtime implementation is not yet available." : "Evidence review required before runtime implementation."));
    appendList(runtime, "Changes", interaction.changes);
    details.append(learning, runtime, sourcePanel(interaction, features));
    viewer.append(header, details);
    root.append(viewer);

    if (mapping.status === "implemented") {
      const demo = document.createElement("section");
      demo.className = "library-demo";
      demo.dataset.runtimeStatus = mapping.status;
      demo.append(textElement("h2", "", "Runnable Demo"), textElement("p", "library-demo-instructions", RUNTIME_INSTRUCTIONS[interaction.id] || "インタラクションを操作して変化を観察します。"));
      const canvas = document.createElement("div");
      canvas.className = "library-demo-canvas";
      const state = document.createElement("p");
      state.className = "library-demo-state";
      state.dataset.state = "";
      const footer = document.createElement("div");
      footer.className = "library-demo-footer";
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "library-reset";
      reset.textContent = "↺ Reset";
      reset.setAttribute("aria-label", `${interaction.id}を初期状態に戻す`);
      const statusText = textElement("span", "", "数学モデルを表示しています。");
      footer.append(statusText, reset);
      demo.append(canvas, state, footer);
      details.append(demo);
      engine = mountInteraction(canvas, mapping, runtimeConfig(mapping, (nextState, summary) => { state.dataset.state = JSON.stringify(nextState); state.textContent = summary; }));
      reset.addEventListener("click", () => engine.reset());
    } else {
      const unavailable = textElement("p", "library-unavailable", mapping.status === "planned" ? "Runtime implementation is not yet available." : "Evidence review required before runtime implementation.");
      details.append(unavailable);
    }
  }

  return { render, destroy };
}

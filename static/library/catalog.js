const STATUS_LABELS = Object.freeze({
  implemented: "Implemented",
  planned: "Planned",
  "blocked-evidence": "Evidence Review Required"
});

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function featureFor(features, featureId) { return features.get(featureId) || null; }

export function statusLabel(status) { return STATUS_LABELS[status] || "Unknown"; }

export function renderSummary(root, interactions, mappings, repositories) {
  root.replaceChildren();
  const counts = mappings.reduce((result, mapping) => { result[mapping.status] = (result[mapping.status] || 0) + 1; return result; }, {});
  [
    `Canonical Interactions: ${interactions.length}`,
    `External Repositories: ${repositories.length}`,
    `Implemented: ${counts.implemented || 0}`,
    `Planned: ${counts.planned || 0}`,
    `Evidence Review Required: ${counts["blocked-evidence"] || 0}`
  ].forEach((label) => root.append(textElement("span", "", label)));
}

export function renderCatalog(root, interactions, { mappings, features, onSelect }) {
  root.replaceChildren();
  const mappingById = new Map(mappings.map((mapping) => [mapping.interactionId, mapping]));
  interactions.forEach((interaction) => {
    const mapping = mappingById.get(interaction.id);
    const card = document.createElement("article");
    card.className = "library-card";
    card.dataset.interactionId = interaction.id;
    const header = document.createElement("div");
    header.className = "library-card-header";
    const titleGroup = document.createElement("div");
    titleGroup.append(textElement("span", "library-card-id", interaction.id), textElement("h2", "", interaction.title));
    header.append(titleGroup, textElement("span", "library-card-category", interaction.category));
    const status = textElement("span", `library-runtime-status is-${mapping?.status || "unknown"}`, statusLabel(mapping?.status));
    status.setAttribute("aria-label", `Runtime status: ${status.textContent}`);
    const goal = document.createElement("div");
    goal.className = "library-card-goal";
    goal.append(textElement("strong", "", "Learning Goal"), textElement("span", "", interaction.learningGoal));
    const meta = document.createElement("div");
    meta.className = "library-card-meta";
    const source = featureFor(features, interaction.sources?.[0]?.featureId);
    meta.append(
      textElement("span", "", `Source Repository: ${source?.repository || "unavailable"}`),
      textElement("span", "", `Relation: ${interaction.sources?.[0]?.relation || "unavailable"}`),
      textElement("span", "", `License: ${source?.license || "unavailable"}`)
    );
    const open = document.createElement("button");
    open.type = "button";
    open.className = "library-card-open";
    open.textContent = mapping?.status === "implemented" ? "Demoを開く" : "Research Metadataを見る";
    open.setAttribute("aria-label", `${interaction.id} ${open.textContent}`);
    open.addEventListener("click", () => onSelect(interaction.id));
    card.append(header, status, textElement("p", "library-card-description", interaction.description), goal, meta, open);
    root.append(card);
  });
}

const INTERACTION_LABELS = {
  slider: "SLIDER"
};

export function renderCatalog(root, contents, { subject = "math1", unit = null, onSelect }) {
  root.replaceChildren();
  const visible = contents.filter((content) => content.subject === subject && (!unit || content.unit === unit));

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "atlas-empty-state";
    empty.textContent = "この条件の教材はまだありません。図鑑トップへ戻ってください。";
    root.append(empty);
    return;
  }

  visible.forEach((content) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "atlas-catalog-card";
    card.dataset.contentId = content.id;
    card.setAttribute("aria-label", `${content.title}を開く`);

    const body = document.createElement("span");
    const location = document.createElement("span");
    location.className = "atlas-card-location";
    location.textContent = `${content.subjectLabel}　＞　${content.unitLabel}`;
    const title = document.createElement("h2");
    title.textContent = content.title;
    const description = document.createElement("span");
    description.className = "atlas-card-description";
    description.textContent = content.shortDescription;
    body.append(location, title, description);

    const type = document.createElement("span");
    type.className = "atlas-card-type";
    type.textContent = INTERACTION_LABELS[content.interactionType] || String(content.interactionType).toUpperCase();
    card.append(body, type);
    card.addEventListener("click", () => onSelect(content.id));
    root.append(card);
  });
}

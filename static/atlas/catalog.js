const INTERACTION_LABELS = {
  slider: "SLIDER",
  drag: "DRAG",
  geometry: "GEOMETRY",
  select: "SELECT",
  cards: "CARDS",
  data: "DATA",
  simulation: "SIMULATION",
  build: "BUILD"
};

const UNIT_ORDER = Object.freeze(["algebra", "trigonometry", "quadratic", "statistics"]);
const CONTENT_ORDER = Object.freeze({
  algebra: Object.freeze([
    "set-regions"
  ]),
  quadratic: Object.freeze([
    "quadratic-basic",
    "quadratic-vertex",
    "quadratic-discriminant",
    "quadratic-range"
  ]),
  trigonometry: Object.freeze([
    "unit-circle",
    "triangle-area-sine"
  ])
});

function createCard(content, onSelect) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "atlas-catalog-card";
  card.dataset.contentId = content.id;
  card.setAttribute("aria-label", `${content.title}を開く`);

  const body = document.createElement("span");
  const location = document.createElement("span");
  location.className = "atlas-card-location";
  location.textContent = `${content.subjectLabel}　＞　${content.unitLabel}`;
  const title = document.createElement("h3");
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
  return card;
}

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

  const subjectHeading = document.createElement("h2");
  subjectHeading.className = "atlas-catalog-subject";
  subjectHeading.textContent = visible[0].subjectLabel;
  root.append(subjectHeading);

  const units = [...UNIT_ORDER, ...visible.map((content) => content.unit).filter((value, index, values) => !UNIT_ORDER.includes(value) && values.indexOf(value) === index)];
  units.filter((unitId) => visible.some((content) => content.unit === unitId)).forEach((unitId) => {
    const order = CONTENT_ORDER[unitId] || [];
    const items = visible
      .filter((content) => content.unit === unitId)
      .sort((left, right) => {
        const leftIndex = order.indexOf(left.id);
        const rightIndex = order.indexOf(right.id);
        return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
      });
    const unitSection = document.createElement("section");
    unitSection.className = "atlas-catalog-unit";
    const unitTitle = document.createElement("h3");
    unitTitle.className = "atlas-catalog-unit-title";
    unitTitle.textContent = items[0].unitLabel;
    const grid = document.createElement("div");
    grid.className = "atlas-catalog-unit-grid";
    items.forEach((content) => grid.append(createCard(content, onSelect)));
    unitSection.append(unitTitle, grid);
    root.append(unitSection);
  });
}

import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, orderedContents, subjectLabel, unitLabel } from "./curriculum.js?v=20260913-r2";
import { practiceStatus } from "./storage.js?v=20260913-r2";

const INTERACTION_LABELS = { slider: "SLIDER", drag: "DRAG", geometry: "GEOMETRY", select: "SELECT", cards: "CARDS", data: "DATA", simulation: "SIMULATION", build: "BUILD" };
const PROGRESS_OPTIONS = [["all", "すべて"], ["unvisited", "未閲覧"], ["visited", "閲覧済み"], ["favorites", "お気に入り"]];

function safeState(state = {}) { return { favorites: Array.isArray(state.favorites) ? state.favorites : [], visited: state.visited && typeof state.visited === "object" ? state.visited : {} }; }
function uniqueOptions(contents, key) { return [...new Map(contents.map((content) => [content[key], content[`${key}Label`] || content[key]])).entries()]; }
const SEARCH_ALIASES = Object.freeze({
  "exponential-logarithm": ["exponent", "exponential", "logarithm", "log"],
  "trigonometric-functions": ["trigonometric", "sine", "cosine", "tangent", "radian", "sin", "cos", "tan"],
  "calculus-2": ["calculus", "derivative", "differentiation", "integral", "integration", "tangent", "secant"],
  sequences: ["sequence", "arithmetic", "geometric", "recurrence", "series", "sum"]
});
function searchMatch(content, query) { if (!query) return true; const haystack = [content.title, content.shortDescription, subjectLabel(content.subject), unitLabel(content.unit), content.formula, ...(content.discoveryPoints || []), ...(SEARCH_ALIASES[content.unit] || [])].join(" ").toLocaleLowerCase(); return haystack.includes(query.toLocaleLowerCase()); }
function isVisibleByProgress(content, progress, state) { const visited = Boolean(state.visited[content.id]); const favorite = state.favorites.includes(content.id); return progress === "unvisited" ? !visited : progress === "visited" ? visited : progress === "favorites" ? favorite : true; }

function auditFor(repositoryAudits, contentId) { return repositoryAudits instanceof Map ? repositoryAudits.get(contentId) : repositoryAudits?.find?.((record) => record.contentId === contentId); }
function auditLabel(status, available = true) { return !available ? "Repository Audit unavailable" : status === "verified" ? "Verified" : status === "needs-review" ? "Needs Review" : "Pending Repository Audit"; }

function createCard(content, state, onSelect, onToggleFavorite, practiceProblems = [], repositoryAudits = new Map(), repositoryAuditStatus = "loaded") {
  const card = document.createElement("article"); card.className = "atlas-catalog-card"; card.dataset.contentId = content.id;
  const open = document.createElement("button"); open.type = "button"; open.className = "atlas-catalog-card-open"; open.setAttribute("aria-label", `${content.title}を開く`);
  const body = document.createElement("span");
  const location = document.createElement("span"); location.className = "atlas-card-location"; location.textContent = `${subjectLabel(content.subject)}　＞　${unitLabel(content.unit)}`;
  const title = document.createElement("h3"); title.textContent = content.title;
  const description = document.createElement("span"); description.className = "atlas-card-description"; description.textContent = content.shortDescription;
  body.append(location, title, description); open.append(body); open.addEventListener("click", () => onSelect(content.id));
  const footer = document.createElement("div"); footer.className = "atlas-catalog-card-footer";
  const type = document.createElement("span"); type.className = "atlas-card-type"; type.textContent = INTERACTION_LABELS[content.interactionType] || String(content.interactionType).toUpperCase(); footer.append(type);
  const audit = auditFor(repositoryAudits, content.id) || { auditStatus: "pending" };
  const auditAvailable = repositoryAuditStatus !== "unavailable";
  const auditBadge = document.createElement("span"); auditBadge.className = `atlas-audit-status is-${auditAvailable ? audit.auditStatus || "pending" : "unavailable"}`; auditBadge.textContent = auditLabel(audit.auditStatus, auditAvailable); auditBadge.title = auditAvailable ? "外部Repositoryの監査状態" : "外部Repository監査を読み込めません"; footer.append(auditBadge);
  if (state.visited[content.id]) { const visited = document.createElement("span"); visited.className = "atlas-visited-badge"; visited.textContent = "閲覧済み"; footer.append(visited); }
  const linkedProblems = practiceProblems.filter((problem) => problem.atlasContentId === content.id);
  if (linkedProblems.length) { const mastered = linkedProblems.filter((problem) => practiceStatus(state.practice?.[problem.id]) === "mastered").length; const practice = document.createElement("span"); practice.className = "atlas-practice-progress"; practice.textContent = `問題 ${mastered} / ${linkedProblems.length} 習得`; footer.append(practice); }
  const favorite = document.createElement("button"); favorite.type = "button"; favorite.className = "atlas-card-favorite"; const favoriteState = state.favorites.includes(content.id); favorite.textContent = favoriteState ? "★" : "☆"; favorite.setAttribute("aria-label", favoriteState ? "お気に入りから外す" : "お気に入りに追加"); favorite.setAttribute("aria-pressed", String(favoriteState)); favorite.title = favoriteState ? "お気に入りから外す" : "お気に入りに追加"; favorite.addEventListener("click", () => onToggleFavorite(content.id)); footer.append(favorite);
  card.append(open, footer); return card;
}

export function renderCatalog(root, contents, { subject = null, unit = null, type = null, progress = null, query = "", state = {}, practiceProblems = [], repositoryAudits = new Map(), repositoryAuditStatus = "loaded", onSelect = () => {}, onFilterChange = () => {}, onToggleFavorite = () => {} }) {
  root.replaceChildren();
  const normalizedState = safeState(state);
  const toolbar = document.createElement("div"); toolbar.className = "atlas-catalog-filters"; toolbar.setAttribute("aria-label", "教材の検索と絞り込み");
  const search = document.createElement("input"); search.type = "search"; search.placeholder = "例：判別式、sin、確率、箱ひげ図"; search.setAttribute("aria-label", "教材を検索"); search.value = query || "";
  const subjectSelect = document.createElement("select"); subjectSelect.setAttribute("aria-label", "科目");
  const unitSelect = document.createElement("select"); unitSelect.setAttribute("aria-label", "単元");
  const typeSelect = document.createElement("select"); typeSelect.setAttribute("aria-label", "インタラクション種別");
  const progressSelect = document.createElement("select"); progressSelect.setAttribute("aria-label", "進捗");
  const appendOptions = (select, options) => options.forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option); });
  appendOptions(subjectSelect, [["", "すべての科目"], ...SUBJECT_ORDER.filter((id) => contents.some((content) => content.subject === id)).map((id) => [id, subjectLabel(id)])]);
  appendOptions(typeSelect, [["", "すべての種別"], ...[...new Set(contents.map((content) => content.interactionType))].map((value) => [value, INTERACTION_LABELS[value] || value])]);
  appendOptions(progressSelect, PROGRESS_OPTIONS);
  const availableUnits = () => {
    if (subjectSelect.value) return SUBJECT_UNIT_ORDER[subjectSelect.value] || [];
    return SUBJECT_ORDER.flatMap((subjectId) => SUBJECT_UNIT_ORDER[subjectId] || []).filter((value, index, values) => values.indexOf(value) === index);
  };
  function renderUnitOptions(preferred = unitSelect.value) { unitSelect.replaceChildren(); const available = availableUnits().filter((unitId) => contents.some((content) => content.unit === unitId)); appendOptions(unitSelect, [["", "すべての単元"], ...available.map((unitId) => [unitId, unitLabel(unitId)])]); unitSelect.value = available.includes(preferred) ? preferred : ""; }
  subjectSelect.value = subject || ""; renderUnitOptions(unit || ""); typeSelect.value = type || ""; progressSelect.value = PROGRESS_OPTIONS.some(([value]) => value === progress) ? progress : "all";
  const invalidUnit = Boolean(unit) && unitSelect.value !== unit;
  const clear = document.createElement("button"); clear.type = "button"; clear.textContent = "条件をクリア"; clear.setAttribute("aria-label", "検索と絞り込み条件をクリア");
  const summary = document.createElement("p"); summary.className = "atlas-catalog-progress-summary"; summary.setAttribute("aria-live", "polite");
  const count = document.createElement("p"); count.className = "atlas-catalog-result-count"; count.setAttribute("aria-live", "polite");
  const results = document.createElement("div"); results.className = "atlas-catalog-results";
  toolbar.append(search, subjectSelect, unitSelect, typeSelect, progressSelect, clear); root.append(toolbar, summary, count, results);
  function currentFilters() { return { subject: subjectSelect.value, unit: unitSelect.value, type: typeSelect.value, progress: progressSelect.value === "all" ? "" : progressSelect.value, query: search.value }; }
  function renderResults() {
    const filters = currentFilters(); const ordered = orderedContents(contents); const visible = ordered.filter((content) => (!filters.subject || content.subject === filters.subject) && (!filters.unit || content.unit === filters.unit) && (!filters.type || content.interactionType === filters.type) && isVisibleByProgress(content, filters.progress, normalizedState) && searchMatch(content, filters.query.trim()));
    const visitedCount = contents.filter((content) => normalizedState.visited[content.id]).length; const favoriteCount = contents.filter((content) => normalizedState.favorites.includes(content.id)).length; summary.textContent = `閲覧済み ${visitedCount} / ${contents.length}　お気に入り ${favoriteCount}`; count.textContent = `${visible.length}件の教材`; results.replaceChildren();
    if (visible.length === 0) { const empty = document.createElement("p"); empty.className = "atlas-empty-state"; empty.textContent = "この条件の教材はまだありません。"; results.append(empty); return; }
    SUBJECT_ORDER.filter((subjectId) => visible.some((content) => content.subject === subjectId)).forEach((subjectId) => { const subjectContents = visible.filter((content) => content.subject === subjectId); const heading = document.createElement("h2"); heading.className = "atlas-catalog-subject"; heading.textContent = subjectLabel(subjectId); results.append(heading); const unitOrder = SUBJECT_UNIT_ORDER[subjectId] || []; [...unitOrder, ...subjectContents.map((content) => content.unit).filter((value, index, values) => !unitOrder.includes(value) && values.indexOf(value) === index)].filter((unitId) => subjectContents.some((content) => content.unit === unitId)).forEach((unitId) => { const items = orderedContents(subjectContents.filter((content) => content.unit === unitId)); const section = document.createElement("section"); section.className = "atlas-catalog-unit"; const title = document.createElement("h3"); title.className = "atlas-catalog-unit-title"; title.textContent = unitLabel(unitId); const grid = document.createElement("div"); grid.className = "atlas-catalog-unit-grid"; items.forEach((content) => grid.append(createCard(content, normalizedState, onSelect, onToggleFavorite, practiceProblems, repositoryAudits, repositoryAuditStatus))); section.append(title, grid); results.append(section); }); });
  }
  function notify() { onFilterChange(currentFilters()); renderResults(); }
  search.addEventListener("input", notify); subjectSelect.addEventListener("change", () => { renderUnitOptions(); notify(); }); unitSelect.addEventListener("change", notify); typeSelect.addEventListener("change", notify); progressSelect.addEventListener("change", notify); clear.addEventListener("click", () => { search.value = ""; subjectSelect.value = ""; renderUnitOptions(); typeSelect.value = ""; progressSelect.value = "all"; notify(); });
  if (invalidUnit) onFilterChange(currentFilters());
  renderResults();
}

import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, subjectLabel, unitLabel } from "../atlas/curriculum.js?v=20260913-r4";
import { STATUS_OPTIONS, filterProblems, orderProblems, statusForProblem, summarizeProblems } from "./filter.js?v=20260913-r4";

const STATUS_CLASSES = { unattempted: "is-unattempted", practicing: "is-practicing", review: "is-review", mastered: "is-mastered" };

function problemState(problem, state) {
  const value = statusForProblem(problem, state);
  const label = STATUS_OPTIONS.find(([id]) => id === value)?.[1] || value;
  return { value, label, className: STATUS_CLASSES[value] };
}

function createProblemCard(problem, state, onSelect) {
  const card = document.createElement("article");
  card.className = "practice-problem-card";
  card.dataset.problemId = problem.id;
  const location = document.createElement("p");
  location.className = "practice-card-location";
  location.textContent = `${subjectLabel(problem.subject)}　＞　${unitLabel(problem.unit)}`;
  const title = document.createElement("h3");
  title.textContent = problem.title;
  const prompt = document.createElement("p");
  prompt.className = "practice-card-prompt";
  prompt.textContent = problem.prompt;
  const meta = document.createElement("div");
  meta.className = "practice-card-meta";
  const difficulty = document.createElement("span");
  difficulty.textContent = ["基礎", "標準", "発展"][problem.difficulty - 1] || `難易度 ${problem.difficulty}`;
  const status = problemState(problem, state);
  const statusBadge = document.createElement("span");
  statusBadge.className = `practice-status-badge ${status.className}`;
  statusBadge.textContent = status.label;
  meta.append(difficulty, statusBadge);
  const open = document.createElement("button");
  open.type = "button";
  open.textContent = "問題を開く";
  open.setAttribute("aria-label", `${problem.title}を開く`);
  open.addEventListener("click", () => onSelect(problem.id));
  card.append(location, title, prompt, meta, open);
  return card;
}

export function renderPracticeCatalog(root, problems, {
  subject = null,
  unit = null,
  content = null,
  difficulty = null,
  status = null,
  mode = null,
  query = "",
  state = {},
  onSelect = () => {},
  onFilterChange = () => {}
} = {}) {
  root.replaceChildren();
  const toolbar = document.createElement("div");
  toolbar.className = "practice-filters";
  toolbar.setAttribute("aria-label", "問題の検索と絞り込み");
  const search = document.createElement("input");
  search.type = "search";
  search.className = "practice-filter-search";
  search.placeholder = "例：判別式、sin、中央値";
  search.setAttribute("aria-label", "問題を検索");
  search.value = query || "";
  const subjectSelect = document.createElement("select");
  subjectSelect.setAttribute("aria-label", "科目");
  const unitSelect = document.createElement("select");
  unitSelect.setAttribute("aria-label", "単元");
  const difficultySelect = document.createElement("select");
  difficultySelect.setAttribute("aria-label", "難易度");
  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("aria-label", "習熟状態");
  const appendOptions = (select, options) => options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
  appendOptions(subjectSelect, [["", "すべての科目"], ...SUBJECT_ORDER.map((id) => [id, subjectLabel(id)])]);
  appendOptions(difficultySelect, [["", "すべての難易度"], ["1", "基礎"], ["2", "標準"], ["3", "発展"]]);
  appendOptions(statusSelect, [["all", "すべて"], ["unattempted", "未挑戦"], ["practicing", "練習中"], ["review", "要復習"], ["mastered", "習得"]]);
  const availableUnits = () => subjectSelect.value
    ? SUBJECT_UNIT_ORDER[subjectSelect.value] || []
    : SUBJECT_ORDER.flatMap((id) => SUBJECT_UNIT_ORDER[id] || []).filter((value, index, values) => values.indexOf(value) === index);
  function renderUnitOptions(preferred = unitSelect.value) {
    unitSelect.replaceChildren();
    const units = availableUnits().filter((unitId) => problems.some((problem) => problem.unit === unitId));
    appendOptions(unitSelect, [["", "すべての単元"], ...units.map((unitId) => [unitId, unitLabel(unitId)])]);
    unitSelect.value = units.includes(preferred) ? preferred : "";
  }
  subjectSelect.value = subject || "";
  renderUnitOptions(unit || "");
  difficultySelect.value = difficulty || "";
  statusSelect.value = status && ["all", "unattempted", "practicing", "review", "mastered"].includes(status) ? status : mode === "mistakes" ? "review" : "all";
  const summary = document.createElement("p");
  summary.className = "practice-catalog-summary";
  summary.setAttribute("aria-live", "polite");
  const results = document.createElement("div");
  results.className = "practice-catalog-results";
  toolbar.append(search, subjectSelect, unitSelect, difficultySelect, statusSelect);
  root.append(toolbar, summary, results);

  function currentFilters() {
    return { subject: subjectSelect.value, unit: unitSelect.value, content: content || "", difficulty: difficultySelect.value, status: statusSelect.value === "all" ? "" : statusSelect.value, query: search.value };
  }

  function renderResults() {
    const filters = currentFilters();
    const selectedStatus = filters.status || "all";
    const visible = orderProblems(filterProblems(problems, filters, state));
    const counts = summarizeProblems(problems, state);
    summary.textContent = `全${problems.length}問　未挑戦 ${counts.unattempted}　練習中 ${counts.practicing}　要復習 ${counts.review}　習得 ${counts.mastered}　表示中 ${visible.length}問`;
    results.replaceChildren();
    if (!problems.length) {
      const empty = document.createElement("div");
      empty.className = "practice-empty-state";
      const message = document.createElement("p");
      message.textContent = "現在、Practice問題は登録されていません。";
      const note = document.createElement("p");
      note.textContent = "外部Repository由来のインタラクティブ教材の監査後、必要な問題を改めて整備します。";
      empty.append(message, note);
      results.append(empty);
      return;
    }
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "practice-empty-state";
      empty.textContent = selectedStatus === "review" ? "要復習の問題はありません。" : "この条件の問題はありません。";
      results.append(empty);
      return;
    }
    SUBJECT_ORDER.filter((subjectId) => visible.some((problem) => problem.subject === subjectId)).forEach((subjectId) => {
      const subjectProblems = visible.filter((problem) => problem.subject === subjectId);
      const heading = document.createElement("h2");
      heading.className = "practice-subject-heading";
      heading.textContent = subjectLabel(subjectId);
      results.append(heading);
      (SUBJECT_UNIT_ORDER[subjectId] || []).filter((unitId) => subjectProblems.some((problem) => problem.unit === unitId)).forEach((unitId) => {
        const unitProblems = subjectProblems.filter((problem) => problem.unit === unitId);
        const section = document.createElement("section");
        section.className = "practice-unit-section";
        const unitHeading = document.createElement("h3");
        unitHeading.textContent = `${unitLabel(unitId)}　${unitProblems.length}問`;
        const unitSummary = document.createElement("p");
        const unitAll = problems.filter((problem) => problem.subject === subjectId && problem.unit === unitId);
        const progressItems = filters.content ? unitAll.filter((problem) => problem.atlasContentId === filters.content) : unitAll;
        const unitCounts = summarizeProblems(progressItems, state);
        unitSummary.className = "practice-unit-summary";
        unitSummary.textContent = `習得 ${unitCounts.mastered} / ${progressItems.length}　練習中 ${unitCounts.practicing}　要復習 ${unitCounts.review}`;
        const grid = document.createElement("div");
        grid.className = "practice-problem-grid";
        unitProblems.forEach((problem) => grid.append(createProblemCard(problem, state, onSelect)));
        section.append(unitHeading, unitSummary, grid);
        results.append(section);
      });
    });
  }

  function notify() { onFilterChange(currentFilters()); renderResults(); }
  search.addEventListener("input", notify);
  subjectSelect.addEventListener("change", () => { renderUnitOptions(); notify(); });
  unitSelect.addEventListener("change", notify);
  difficultySelect.addEventListener("change", notify);
  statusSelect.addEventListener("change", notify);
  renderResults();
}

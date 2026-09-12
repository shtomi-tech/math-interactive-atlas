import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER } from "../atlas/curriculum.js?v=20260912-6i";

const SUBJECT_LABELS = { math1: "数学I", mathA: "数学A" };
const UNIT_LABELS = { algebra: "数と式", trigonometry: "図形と計量", quadratic: "二次関数", statistics: "データの分析", probability: "場合の数と確率", "geometry-a": "図形の性質", "human-activity": "数学と人間の活動" };

function problemState(problem, state) {
  const entry = state.practice?.[problem.id];
  if (!entry || !entry.attempts) return { label: "未挑戦", className: "is-unattempted" };
  return entry.lastResult === "incorrect" ? { label: "要復習", className: "is-review" } : { label: "正解済み", className: "is-correct" };
}

function createProblemCard(problem, state, onSelect) {
  const card = document.createElement("article"); card.className = "practice-problem-card";
  const location = document.createElement("p"); location.className = "practice-card-location"; location.textContent = `${SUBJECT_LABELS[problem.subject]}　＞　${UNIT_LABELS[problem.unit] || problem.unit}`;
  const title = document.createElement("h3"); title.textContent = problem.title;
  const prompt = document.createElement("p"); prompt.className = "practice-card-prompt"; prompt.textContent = problem.prompt;
  const meta = document.createElement("div"); meta.className = "practice-card-meta";
  const difficulty = document.createElement("span"); difficulty.textContent = `難易度 ${problem.difficulty}`;
  const status = problemState(problem, state); const statusBadge = document.createElement("span"); statusBadge.className = `practice-status-badge ${status.className}`; statusBadge.textContent = status.label; meta.append(difficulty, statusBadge);
  const open = document.createElement("button"); open.type = "button"; open.textContent = "問題を開く"; open.setAttribute("aria-label", `${problem.title}を開く`); open.addEventListener("click", () => onSelect(problem.id));
  card.append(location, title, prompt, meta, open); return card;
}

export function renderPracticeCatalog(root, problems, { subject = null, unit = null, difficulty = null, mode = null, state = {}, onSelect = () => {}, onFilterChange = () => {} }) {
  root.replaceChildren();
  const toolbar = document.createElement("div"); toolbar.className = "practice-filters"; toolbar.setAttribute("aria-label", "問題の検索と絞り込み");
  const subjectSelect = document.createElement("select"); subjectSelect.setAttribute("aria-label", "科目");
  const unitSelect = document.createElement("select"); unitSelect.setAttribute("aria-label", "単元");
  const difficultySelect = document.createElement("select"); difficultySelect.setAttribute("aria-label", "難易度");
  const modeSelect = document.createElement("select"); modeSelect.setAttribute("aria-label", "問題モード");
  const appendOptions = (select, options) => options.forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option); });
  appendOptions(subjectSelect, [["", "すべての科目"], ...SUBJECT_ORDER.map((id) => [id, SUBJECT_LABELS[id]])]);
  appendOptions(difficultySelect, [["", "すべての難易度"], ["1", "難易度1"], ["2", "難易度2"], ["3", "難易度3"]]);
  appendOptions(modeSelect, [["", "すべての問題"], ["mistakes", "間違えた問題"]]);
  const availableUnits = () => subjectSelect.value ? SUBJECT_UNIT_ORDER[subjectSelect.value] || [] : SUBJECT_ORDER.flatMap((id) => SUBJECT_UNIT_ORDER[id] || []).filter((value, index, values) => values.indexOf(value) === index);
  function renderUnitOptions(preferred = unitSelect.value) { unitSelect.replaceChildren(); const units = availableUnits().filter((unitId) => problems.some((problem) => problem.unit === unitId)); appendOptions(unitSelect, [["", "すべての単元"], ...units.map((unitId) => [unitId, UNIT_LABELS[unitId] || unitId])]); unitSelect.value = units.includes(preferred) ? preferred : ""; }
  subjectSelect.value = subject || ""; renderUnitOptions(unit || ""); difficultySelect.value = difficulty || ""; modeSelect.value = mode === "mistakes" ? "mistakes" : "";
  toolbar.append(subjectSelect, unitSelect, difficultySelect, modeSelect); const summary = document.createElement("p"); summary.className = "practice-catalog-summary"; summary.setAttribute("aria-live", "polite"); const results = document.createElement("div"); results.className = "practice-catalog-results"; root.append(toolbar, summary, results);
  function currentFilters() { return { subject: subjectSelect.value, unit: unitSelect.value, difficulty: difficultySelect.value, mode: modeSelect.value }; }
  function renderResults() {
    const filters = currentFilters(); const visible = problems.filter((problem) => (!filters.subject || problem.subject === filters.subject) && (!filters.unit || problem.unit === filters.unit) && (!filters.difficulty || String(problem.difficulty) === filters.difficulty) && (filters.mode !== "mistakes" || state.practice?.[problem.id]?.lastResult === "incorrect"));
    const correct = problems.filter((problem) => state.practice?.[problem.id]?.lastResult === "correct").length; const review = problems.filter((problem) => state.practice?.[problem.id]?.lastResult === "incorrect").length; summary.textContent = `全${problems.length}問　正解済み ${correct}　要復習 ${review}　表示中 ${visible.length}問`; results.replaceChildren();
    if (!visible.length) { const empty = document.createElement("p"); empty.className = "practice-empty-state"; empty.textContent = filters.mode === "mistakes" ? "要復習の問題はありません。" : "この条件の問題はありません。"; results.append(empty); return; }
    SUBJECT_ORDER.filter((subjectId) => visible.some((problem) => problem.subject === subjectId)).forEach((subjectId) => { const subjectProblems = visible.filter((problem) => problem.subject === subjectId); const heading = document.createElement("h2"); heading.className = "practice-subject-heading"; heading.textContent = SUBJECT_LABELS[subjectId]; results.append(heading); (SUBJECT_UNIT_ORDER[subjectId] || []).filter((unitId) => subjectProblems.some((problem) => problem.unit === unitId)).forEach((unitId) => { const unitProblems = subjectProblems.filter((problem) => problem.unit === unitId); const section = document.createElement("section"); section.className = "practice-unit-section"; const unitHeading = document.createElement("h3"); unitHeading.textContent = `${UNIT_LABELS[unitId] || unitId}　${unitProblems.length}問`; const unitSummary = document.createElement("p"); const unitAll = problems.filter((problem) => problem.subject === subjectId && problem.unit === unitId); const unitCorrect = unitAll.filter((problem) => state.practice?.[problem.id]?.lastResult === "correct").length; const unitReview = unitAll.filter((problem) => state.practice?.[problem.id]?.lastResult === "incorrect").length; unitSummary.className = "practice-unit-summary"; unitSummary.textContent = `正解済み ${unitCorrect} / ${unitAll.length}　要復習 ${unitReview}`; const grid = document.createElement("div"); grid.className = "practice-problem-grid"; unitProblems.forEach((problem) => grid.append(createProblemCard(problem, state, onSelect))); section.append(unitHeading, unitSummary, grid); results.append(section); }); });
  }
  function notify() { onFilterChange(currentFilters()); renderResults(); }
  subjectSelect.addEventListener("change", () => { renderUnitOptions(); notify(); }); unitSelect.addEventListener("change", notify); difficultySelect.addEventListener("change", notify); modeSelect.addEventListener("change", notify); renderResults();
}

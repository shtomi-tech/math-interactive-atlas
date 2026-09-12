import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, subjectLabel, unitLabel } from "../atlas/curriculum.js?v=20260912-7i";
import { filterProblems, orderProblems } from "../practice/filter.js?v=20260912-7i";
import { addProblem, createProblemSet, moveProblem, removeProblem, updateSetMetadata } from "./model.js?v=20260912-7i";
import { deleteProblemSet, duplicateProblemSet, loadProblemSets, upsertProblemSet } from "./storage.js?v=20260912-7i";
import { copyText, exportProblemSet, parseProblemSetImport, problemSetUrls } from "./io.js?v=20260912-7i";

const dom = {
  status: document.querySelector("#setsStatus"),
  saved: document.querySelector("#savedSets"),
  title: document.querySelector("#setTitle"),
  instructions: document.querySelector("#setInstructions"),
  bank: document.querySelector("#problemBank"),
  selected: document.querySelector("#selectedProblems"),
  count: document.querySelector("#selectedCount"),
  search: document.querySelector("#setSearch"),
  subject: document.querySelector("#setSubject"),
  unit: document.querySelector("#setUnit"),
  difficulty: document.querySelector("#setDifficulty"),
  importInput: document.querySelector("#setImportInput"),
  fallback: document.querySelector("#shareFallback")
};
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let problems = [];
let currentSet = createProblemSet();
let savedSets = [];

function showStatus(message = "") { dom.status.textContent = message; }
function button(label, onClick, className = "") { const element = document.createElement("button"); element.type = "button"; element.textContent = label; if (className) element.className = className; element.addEventListener("click", onClick); return element; }
function readJson(path) { return fetch(path, { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }); }

function renderSavedSets() {
  dom.saved.replaceChildren();
  if (!savedSets.length) { const empty = document.createElement("p"); empty.className = "sets-empty"; empty.textContent = "保存された問題セットはありません。"; dom.saved.append(empty); return; }
  savedSets.forEach((set) => {
    const card = document.createElement("article"); card.className = "saved-set-card";
    const heading = document.createElement("h3"); heading.textContent = set.title || "無題の問題セット";
    const meta = document.createElement("p"); meta.textContent = `${set.problemIds.length}問　更新 ${set.updatedAt.slice(0, 10)}`;
    const actions = document.createElement("div"); actions.className = "sets-actions";
    actions.append(button("開く", () => loadSet(set)), button("複製", () => { const result = duplicateProblemSet(storage, set); savedSets = result.sets; renderSavedSets(); showStatus("問題セットを複製しました。"); }), button("削除", () => {
      if (!window.confirm(`「${set.title || "無題の問題セット"}」を削除しますか？`)) return;
      savedSets = deleteProblemSet(storage, set.id); renderSavedSets(); showStatus("問題セットを削除しました。");
    }));
    card.append(heading, meta, actions); dom.saved.append(card);
  });
}

function loadSet(set) {
  currentSet = { ...set, problemIds: [...set.problemIds] };
  dom.title.value = currentSet.title; dom.instructions.value = currentSet.instructions;
  renderSelected(); renderBank(); showStatus("問題セットを読み込みました。");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSelected() {
  dom.selected.replaceChildren();
  dom.count.textContent = `${currentSet.problemIds.length} / 30問`;
  if (!currentSet.problemIds.length) { const empty = document.createElement("p"); empty.className = "sets-empty"; empty.textContent = "右の問題一覧から問題を追加してください。"; dom.selected.append(empty); return; }
  currentSet.problemIds.forEach((id, index) => {
    const problem = problems.find((item) => item.id === id);
    const item = document.createElement("li"); item.className = "selected-problem-item";
    const text = document.createElement("div"); const title = document.createElement("strong"); title.textContent = problem?.title || `利用できない問題: ${id}`; const meta = document.createElement("span"); meta.textContent = problem ? `${subjectLabel(problem.subject)} / ${unitLabel(problem.unit)} / ${["基礎", "標準", "発展"][problem.difficulty - 1] || ""}` : "現在利用できません"; text.append(title, meta);
    const controls = document.createElement("div"); controls.className = "selected-problem-controls";
    const up = button("↑", () => { currentSet = moveProblem(currentSet, index, "up"); renderSelected(); renderBank(); }); up.setAttribute("aria-label", `${index + 1}番目の問題を上へ移動`); up.disabled = index === 0;
    const down = button("↓", () => { currentSet = moveProblem(currentSet, index, "down"); renderSelected(); renderBank(); }); down.setAttribute("aria-label", `${index + 1}番目の問題を下へ移動`); down.disabled = index === currentSet.problemIds.length - 1;
    const remove = button("削除", () => { currentSet = removeProblem(currentSet, id); renderSelected(); renderBank(); }); remove.setAttribute("aria-label", `${title.textContent}を削除`);
    controls.append(up, down, remove); item.append(text, controls); dom.selected.append(item);
  });
}

function renderBank() {
  const filtered = orderProblems(filterProblems(problems, { query: dom.search.value, subject: dom.subject.value, unit: dom.unit.value, difficulty: dom.difficulty.value }, {}));
  dom.bank.replaceChildren();
  const summary = document.createElement("p"); summary.className = "sets-bank-summary"; summary.textContent = `${filtered.length}問を表示中`;
  dom.bank.append(summary);
  if (!filtered.length) { const empty = document.createElement("p"); empty.className = "sets-empty"; empty.textContent = "この条件の問題はありません。"; dom.bank.append(empty); return; }
  filtered.forEach((problem) => {
    const card = document.createElement("article"); card.className = "set-bank-card";
    const heading = document.createElement("h3"); heading.textContent = problem.title;
    const meta = document.createElement("p"); meta.textContent = `${subjectLabel(problem.subject)}　＞　${unitLabel(problem.unit)}　／　${["基礎", "標準", "発展"][problem.difficulty - 1]}`;
    const add = button(currentSet.problemIds.includes(problem.id) ? "追加済み" : "追加", () => { currentSet = addProblem(currentSet, problem.id); renderSelected(); renderBank(); }); add.disabled = currentSet.problemIds.includes(problem.id) || currentSet.problemIds.length >= 30; add.setAttribute("aria-label", `${problem.title}を問題セットに追加`);
    card.append(heading, meta, add); dom.bank.append(card);
  });
}

function refreshUnits(preferred = dom.unit.value) {
  const units = dom.subject.value ? SUBJECT_UNIT_ORDER[dom.subject.value] || [] : SUBJECT_ORDER.flatMap((subject) => SUBJECT_UNIT_ORDER[subject] || []).filter((unit, index, list) => list.indexOf(unit) === index);
  dom.unit.replaceChildren();
  [["", "すべての単元"], ...units.map((id) => [id, unitLabel(id)])].forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; dom.unit.append(option); });
  dom.unit.value = units.includes(preferred) ? preferred : "";
}

function saveCurrentSet() {
  if (!dom.title.value.trim() || !dom.instructions.value.trim()) { showStatus("タイトルと説明を入力してください。"); (dom.title.value.trim() ? dom.instructions : dom.title).focus(); return; }
  currentSet = updateSetMetadata(currentSet, { title: dom.title.value, instructions: dom.instructions.value });
  savedSets = upsertProblemSet(storage, currentSet); currentSet = savedSets[0]; renderSavedSets(); showStatus("問題セットを保存しました。");
}

function downloadJson() {
  const data = JSON.stringify(exportProblemSet({ ...currentSet, title: dom.title.value, instructions: dom.instructions.value }), null, 2);
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); link.download = `${(dom.title.value.trim() || "problem-set").replace(/[^\wぁ-んァ-ヶ一-龠-]/g, "_")}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 0); showStatus("問題セットJSONを保存しました。");
}

function openPractice() { const urls = problemSetUrls(currentSet.problemIds, { title: dom.title.value }); if (!currentSet.problemIds.length) return showStatus("問題を1問以上追加してください。"); window.location.href = urls.practice; }
function openWorksheet(answers = false) { if (!currentSet.problemIds.length) return showStatus("問題を1問以上追加してください。"); const urls = problemSetUrls(currentSet.problemIds, { title: dom.title.value }); window.location.href = answers ? urls.answers : urls.worksheet; }
async function shareLink() { if (!currentSet.problemIds.length) return showStatus("問題を1問以上追加してください。"); const url = new URL(problemSetUrls(currentSet.problemIds).practice, document.baseURI).href; if (await copyText(url)) showStatus("Practiceへのリンクをコピーしました。"); else { dom.fallback.hidden = false; dom.fallback.value = url; dom.fallback.select(); showStatus("リンクを選択しました。コピーしてください。"); } }

async function importFile(file) {
  if (!file) return;
  const parsed = parseProblemSetImport(await file.text());
  if (!parsed.ok) { showStatus(parsed.error); return; }
  const unknown = parsed.set.problemIds.filter((id) => !problems.some((problem) => problem.id === id));
  currentSet = createProblemSet({ title: parsed.set.title, instructions: parsed.set.instructions }); currentSet = { ...currentSet, problemIds: parsed.set.problemIds };
  dom.title.value = currentSet.title; dom.instructions.value = currentSet.instructions; renderSelected(); renderBank(); showStatus(unknown.length ? "このセットには現在利用できない問題があります。" : "問題セットJSONを読み込みました。保存する場合は保存ボタンを押してください。");
}

function wire() {
  [["", "すべての科目"], ...SUBJECT_ORDER.map((id) => [id, subjectLabel(id)])].forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; dom.subject.append(option); });
  refreshUnits();
  document.querySelector("#newSetButton").addEventListener("click", () => { currentSet = createProblemSet(); dom.title.value = ""; dom.instructions.value = ""; renderSelected(); renderBank(); showStatus("新しい問題セットを作成しました。"); });
  document.querySelector("#saveSetButton").addEventListener("click", saveCurrentSet);
  document.querySelector("#practiceSetButton").addEventListener("click", openPractice);
  document.querySelector("#shareSetButton").addEventListener("click", shareLink);
  document.querySelector("#worksheetButton").addEventListener("click", () => openWorksheet(false));
  document.querySelector("#answerWorksheetButton").addEventListener("click", () => openWorksheet(true));
  document.querySelector("#exportSetButton").addEventListener("click", downloadJson);
  document.querySelector("#importSetButton").addEventListener("click", () => dom.importInput.click());
  dom.importInput.addEventListener("change", () => { importFile(dom.importInput.files?.[0]); dom.importInput.value = ""; });
  dom.search.addEventListener("input", renderBank); dom.subject.addEventListener("change", () => { refreshUnits(); renderBank(); }); dom.unit.addEventListener("change", renderBank); dom.difficulty.addEventListener("change", renderBank);
  renderSavedSets(); renderSelected(); renderBank();
}

Promise.all([readJson("./static/practice/problem-data.json"), readJson("./static/atlas/content-data.json")]).then(([loadedProblems]) => { problems = Array.isArray(loadedProblems) ? loadedProblems : []; savedSets = loadProblemSets(storage, new Set(problems.map((problem) => problem.id))); wire(); }).catch((error) => { console.error(error); showStatus("問題データを読み込めませんでした。時間をおいて再度お試しください。"); });

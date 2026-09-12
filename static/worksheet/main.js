import { subjectLabel, unitLabel } from "../atlas/curriculum.js?v=20260913-8c";
import { buildWorksheetModel, problemAnswerText } from "./model.js?v=20260913-8c";

const params = new URLSearchParams(window.location.search);
const dom = { status: document.querySelector("#worksheetStatus"), root: document.querySelector("#worksheetRoot"), title: document.querySelector("#worksheetTitle") };

function formula(target, expression) {
  if (!expression) return;
  if (globalThis.katex?.render) { try { globalThis.katex.render(expression, target, { displayMode: true, throwOnError: false }); return; } catch { /* readable text fallback */ } }
  target.textContent = expression;
}
function readJson(path) { return fetch(path, { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }); }
function addFormula(parent, value, className = "worksheet-formula") { if (!value) return; const element = document.createElement("div"); element.className = className; formula(element, value); parent.append(element); }

function renderProblem(problem, index, answers) {
  const article = document.createElement("article"); article.className = "worksheet-problem";
  const heading = document.createElement("h2"); heading.textContent = `${index}. ${problem.title}`;
  const meta = document.createElement("p"); meta.className = "worksheet-problem-meta"; meta.textContent = `${subjectLabel(problem.subject)}　＞　${unitLabel(problem.unit)}　／　${["基礎", "標準", "発展"][problem.difficulty - 1] || ""}`;
  const prompt = document.createElement("p"); prompt.className = "worksheet-prompt"; prompt.textContent = problem.prompt;
  article.append(heading, meta, prompt); addFormula(article, problem.formula);
  if (problem.type === "single-choice") {
    const list = document.createElement("ol"); list.className = "worksheet-choices";
    (problem.choices || []).forEach((choice) => { const item = document.createElement("li"); item.textContent = choice.text; list.append(item); }); article.append(list);
  } else { const answerLine = document.createElement("p"); answerLine.className = "worksheet-answer-line"; answerLine.textContent = "答え：　　　　　　　　　　　　　　　　"; article.append(answerLine); }
  if (answers) {
    const answer = document.createElement("p"); answer.className = "worksheet-answer"; answer.textContent = `答え：${problemAnswerText(problem)}`; article.append(answer);
    if (problem.explanation) { const explanation = document.createElement("p"); explanation.className = "worksheet-explanation"; explanation.textContent = problem.explanation; article.append(explanation); }
    addFormula(article, problem.explanationFormula, "worksheet-formula worksheet-explanation-formula");
  }
  return article;
}
Promise.all([readJson("./static/practice/problem-data.json")]).then(([problems]) => {
  const model = buildWorksheetModel(problems, params.get("ids"));
  if (model.unknownIds.length) dom.status.textContent = "一部の問題を読み込めませんでした";
  if (!model.problems.length) { dom.status.textContent = "指定された問題セットを読み込めませんでした。"; return; }
  const title = params.get("title") || "数学問題プリント"; dom.title.textContent = title;
  const list = document.createElement("section"); list.className = "worksheet-problems";
  model.problems.forEach((problem, index) => list.append(renderProblem(problem, index + 1, false)));
  dom.root.append(list);
  if (params.get("answers") === "1") {
    const answerHeading = document.createElement("h2"); answerHeading.className = "worksheet-answers-heading"; answerHeading.textContent = "解答・解説"; dom.root.append(answerHeading);
    const answers = document.createElement("section"); answers.className = "worksheet-answers"; model.problems.forEach((problem, index) => answers.append(renderProblem(problem, index + 1, true))); dom.root.append(answers);
  }
}).catch((error) => { console.error(error); dom.status.textContent = "問題データを読み込めませんでした。"; });

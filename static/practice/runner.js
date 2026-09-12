import { checkAnswer } from "./answer.js?v=20260912-6i";

const SUBJECT_LABELS = { math1: "数学I", mathA: "数学A" };
const UNIT_LABELS = { algebra: "数と式", trigonometry: "図形と計量", quadratic: "二次関数", statistics: "データの分析", probability: "場合の数と確率", "geometry-a": "図形の性質", "human-activity": "数学と人間の活動" };

function renderFormula(target, expression) {
  target.replaceChildren();
  if (globalThis.katex?.render) { try { globalThis.katex.render(expression, target, { displayMode: true, throwOnError: false }); return; } catch { /* Keep the plain expression below. */ } }
  target.textContent = expression;
}

function statusFor(problem, state) {
  const entry = state.practice?.[problem.id];
  if (!entry?.attempts) return "未挑戦";
  return entry.lastResult === "incorrect" ? "要復習" : "正解済み";
}

export function createProblemRunner(root, { onBack = () => {}, onResult = () => {}, onNext = () => {} } = {}) {
  function render(problem, problems, state, { fromCatalog = null } = {}) {
    root.replaceChildren();
    const article = document.createElement("article"); article.className = "practice-runner";
    const top = document.createElement("div"); top.className = "practice-runner-top";
    const back = document.createElement("button"); back.type = "button"; back.textContent = "← Practice一覧へ戻る"; back.addEventListener("click", () => onBack(fromCatalog)); top.append(back); article.append(top);
    if (!problem) { const heading = document.createElement("h1"); heading.textContent = "問題が見つかりません"; const message = document.createElement("p"); message.textContent = "指定された問題は存在しないか、現在の問題データにありません。"; article.append(heading, message); root.append(article); return; }
    const breadcrumb = document.createElement("p"); breadcrumb.className = "practice-breadcrumb"; breadcrumb.textContent = `${SUBJECT_LABELS[problem.subject]}　＞　${UNIT_LABELS[problem.unit] || problem.unit}`;
    const heading = document.createElement("h1"); heading.id = "practiceRunnerTitle"; heading.textContent = problem.title;
    const status = document.createElement("span"); status.className = "practice-runner-status"; status.textContent = statusFor(problem, state);
    const question = document.createElement("section"); question.className = "practice-question"; question.append(breadcrumb, heading, status);
    const prompt = document.createElement("p"); prompt.className = "practice-prompt"; prompt.textContent = problem.prompt; question.append(prompt);
    const formula = document.createElement("div"); formula.className = "practice-formula"; renderFormula(formula, problem.formula || ""); if (problem.formula) question.append(formula);
    const form = document.createElement("form"); form.className = "practice-answer-form";
    if (problem.type === "single-choice") {
      const fieldset = document.createElement("fieldset"); const legend = document.createElement("legend"); legend.textContent = "答えを選んでください"; fieldset.append(legend);
      problem.choices.forEach((choice) => { const label = document.createElement("label"); label.className = "practice-choice"; const input = document.createElement("input"); input.type = "radio"; input.name = `problem-${problem.id}`; input.value = choice.id; input.id = `choice-${problem.id}-${choice.id}`; const text = document.createElement("span"); text.textContent = choice.text; label.append(input, text); fieldset.append(label); }); form.append(fieldset);
    } else if (problem.type === "numeric") {
      const label = document.createElement("label"); label.className = "practice-numeric-label"; label.textContent = "答えを入力"; const input = document.createElement("input"); input.type = "number"; input.step = "any"; input.inputMode = "decimal"; input.setAttribute("aria-label", "数値の答え"); label.append(input); form.append(label);
    }
    const submit = document.createElement("button"); submit.type = "submit"; submit.className = "practice-submit"; submit.textContent = "答え合わせ"; form.append(submit); question.append(form); article.append(question);
    const feedback = document.createElement("section"); feedback.className = "practice-feedback"; feedback.setAttribute("aria-live", "polite"); article.append(feedback); root.append(article);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const response = problem.type === "single-choice" ? { choiceId: form.querySelector("input[type=radio]:checked")?.value } : { value: form.querySelector("input[type=number]")?.value };
      const correct = checkAnswer(problem, response); onResult(problem.id, correct); status.textContent = correct ? "正解済み" : "要復習"; submit.disabled = true; form.querySelectorAll("input").forEach((input) => { input.disabled = true; }); feedback.replaceChildren();
      const result = document.createElement("h2"); result.className = correct ? "practice-result is-correct" : "practice-result is-review"; result.textContent = correct ? "正解" : "もう一度確認してみよう"; feedback.append(result);
      const explanationHeading = document.createElement("h3"); explanationHeading.textContent = "解説"; const explanation = document.createElement("p"); explanation.textContent = problem.explanation; feedback.append(explanationHeading, explanation);
      if (!correct) { const atlasLink = document.createElement("a"); atlasLink.className = "practice-atlas-link"; atlasLink.href = `./atlas.html?content=${encodeURIComponent(problem.atlasContentId)}&fromProblem=${encodeURIComponent(problem.id)}`; atlasLink.textContent = "図鑑で確認する"; feedback.append(atlasLink); }
      const currentIndex = problems.findIndex((item) => item.id === problem.id); const nextProblem = problems[currentIndex + 1]; const next = document.createElement("button"); next.type = "button"; next.className = "practice-next-button"; next.textContent = nextProblem ? "次の問題" : "Practice一覧へ"; next.addEventListener("click", () => nextProblem ? onNext(nextProblem.id, fromCatalog) : onBack(fromCatalog)); feedback.append(next);
    });
  }
  return { render, destroy() { root.replaceChildren(); } };
}

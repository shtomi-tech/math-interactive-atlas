import { evaluateAnswer } from "./answer.js?v=20260912-7k";
import { subjectLabel, unitLabel } from "../atlas/curriculum.js?v=20260912-7k";
import { practiceStatus } from "../atlas/storage.js?v=20260912-7k";
import { nextProblem, sessionPosition } from "./session.js?v=20260912-7k";

const STATUS_LABELS = { unattempted: "未挑戦", practicing: "練習中", review: "要復習", mastered: "習得" };

function renderFormula(target, expression) {
  target.replaceChildren();
  if (globalThis.katex?.render) {
    try { globalThis.katex.render(expression, target, { displayMode: true, throwOnError: false }); return; } catch { /* Plain text is the fallback. */ }
  }
  target.textContent = expression;
}

function statusFor(problem, state) {
  return practiceStatus(state.practice?.[problem.id]);
}

function makeButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

export function createProblemRunner(root, { onBack = () => {}, onResult = () => {}, onNext = () => {} } = {}) {
  function render(problem, sessionOrProblems, initialState, { fromCatalog = null } = {}) {
    root.replaceChildren();
    const session = Array.isArray(sessionOrProblems) ? { problems: sessionOrProblems } : sessionOrProblems || { problems: [] };
    let state = initialState || {};
    const article = document.createElement("article");
    article.className = "practice-runner";
    const top = document.createElement("div");
    top.className = "practice-runner-top";
    const back = makeButton("← Practice一覧へ戻る", "practice-runner-back", () => onBack(fromCatalog));
    top.append(back);
    article.append(top);
    if (!problem) {
      const heading = document.createElement("h1");
      heading.textContent = "問題が見つかりません";
      const message = document.createElement("p");
      message.textContent = "指定された問題は存在しないか、現在の問題データにありません。";
      article.append(heading, message);
      root.append(article);
      return;
    }

    const position = sessionPosition(session, problem.id);
    const progress = document.createElement("div");
    progress.className = "practice-session-progress";
    const progressText = document.createElement("span");
    progressText.textContent = `問題 ${position.position} / ${position.total}`;
    const progressBar = document.createElement("progress");
    progressBar.max = Math.max(position.total, 1);
    progressBar.value = position.position || 0;
    progressBar.setAttribute("aria-label", "セッションの進み具合");
    progress.append(progressText, progressBar);
    article.append(progress);

    const breadcrumb = document.createElement("p");
    breadcrumb.className = "practice-breadcrumb";
    breadcrumb.textContent = `${subjectLabel(problem.subject)}　＞　${unitLabel(problem.unit)}`;
    const heading = document.createElement("h1");
    heading.id = "practiceRunnerTitle";
    heading.textContent = problem.title;
    const status = document.createElement("span");
    status.className = "practice-runner-status";
    const syncStatus = () => { status.textContent = STATUS_LABELS[statusFor(problem, state)]; };
    syncStatus();
    const question = document.createElement("section");
    question.className = "practice-question";
    question.append(breadcrumb, heading, status);
    const prompt = document.createElement("p");
    prompt.className = "practice-prompt";
    prompt.textContent = problem.prompt;
    question.append(prompt);
    if (problem.formula) {
      const formula = document.createElement("div");
      formula.className = "practice-formula";
      renderFormula(formula, problem.formula);
      question.append(formula);
    }
    const form = document.createElement("form");
    form.className = "practice-answer-form";
    let firstInput = null;
    if (problem.type === "single-choice") {
      const fieldset = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = "答えを選んでください";
      fieldset.append(legend);
      problem.choices.forEach((choice) => {
        const label = document.createElement("label");
        label.className = "practice-choice";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `problem-${problem.id}`;
        input.value = choice.id;
        input.id = `choice-${problem.id}-${choice.id}`;
        const text = document.createElement("span");
        text.textContent = choice.text;
        label.append(input, text);
        fieldset.append(label);
        firstInput ||= input;
      });
      form.append(fieldset);
    } else if (problem.type === "numeric") {
      const label = document.createElement("label");
      label.className = "practice-numeric-label";
      label.textContent = "答えを入力";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "数値の答え");
      label.append(input);
      form.append(label);
      firstInput = input;
    }
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "practice-submit";
    submit.textContent = "答え合わせ";
    form.append(submit);
    question.append(form);
    article.append(question);
    const feedback = document.createElement("section");
    feedback.className = "practice-feedback";
    feedback.setAttribute("aria-live", "polite");
    article.append(feedback);
    root.append(article);

    function clearFeedback() { feedback.replaceChildren(); }
    function setInputsDisabled(disabled) { form.querySelectorAll("input").forEach((input) => { input.disabled = disabled; }); submit.disabled = disabled; }
    function renderResult(result) {
      clearFeedback();
      const resultHeading = document.createElement("h2");
      resultHeading.className = result.correct ? "practice-result is-correct" : "practice-result is-review";
      resultHeading.textContent = result.correct ? "正解" : "もう一度確認してみよう";
      feedback.append(resultHeading);
      const explanationHeading = document.createElement("h3");
      explanationHeading.textContent = "解説";
      const explanation = document.createElement("p");
      explanation.textContent = problem.explanation;
      feedback.append(explanationHeading, explanation);
      if (problem.explanationFormula) {
        const formulaHeading = document.createElement("h3");
        formulaHeading.textContent = "数式";
        const formula = document.createElement("div");
        formula.className = "practice-formula practice-explanation-formula";
        renderFormula(formula, problem.explanationFormula);
        feedback.append(formulaHeading, formula);
      }
      if (!result.correct) {
        const atlasLink = document.createElement("a");
        atlasLink.className = "practice-atlas-link";
        atlasLink.href = `./atlas.html?content=${encodeURIComponent(problem.atlasContentId)}&fromProblem=${encodeURIComponent(problem.id)}`;
        atlasLink.textContent = "図鑑で確認する";
        feedback.append(atlasLink);
      }
      const retry = makeButton("もう一度解く", "practice-retry-button", () => {
        form.reset();
        clearFeedback();
        setInputsDisabled(false);
        firstInput?.focus();
      });
      const following = nextProblem(session, problem.id);
      const next = makeButton(following ? "次の問題" : "Practice一覧へ", "practice-next-button", () => following ? onNext(following.id, fromCatalog, session.problemIds || []) : onBack(fromCatalog));
      feedback.append(retry, next);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const response = problem.type === "single-choice"
        ? { choiceId: form.querySelector("input[type=radio]:checked")?.value }
        : { value: firstInput?.value };
      const result = evaluateAnswer(problem, response);
      if (!result.valid) {
        clearFeedback();
        const message = document.createElement("p");
        message.className = "practice-invalid-feedback";
        message.textContent = problem.type === "single-choice" ? "答えを選んでください。" : "答えを入力してください。";
        feedback.append(message);
        firstInput?.focus();
        return;
      }
      const nextState = onResult(problem.id, result.correct);
      if (nextState) state = nextState;
      syncStatus();
      setInputsDisabled(true);
      renderResult(result);
    });
  }
  return { render, destroy() { root.replaceChildren(); } };
}

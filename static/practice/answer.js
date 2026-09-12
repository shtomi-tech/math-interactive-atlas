export function checkSingleChoice(problem, choiceId) {
  return problem?.type === "single-choice" && choiceId === problem.answer?.choiceId;
}

export function checkNumeric(problem, value) {
  if (problem?.type !== "numeric") return false;
  const number = Number(value); const answer = Number(problem.answer?.value); const tolerance = Number(problem.answer?.tolerance ?? 0);
  return Number.isFinite(number) && Number.isFinite(answer) && Number.isFinite(tolerance) && Math.abs(number - answer) <= tolerance;
}

export function checkAnswer(problem, response) {
  if (problem?.type === "single-choice") return checkSingleChoice(problem, response?.choiceId);
  if (problem?.type === "numeric") return checkNumeric(problem, response?.value);
  return false;
}

export function parseNumericResponse(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).normalize("NFKC").replaceAll("−", "-").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function checkSingleChoice(problem, choiceId) {
  return problem?.type === "single-choice" && choiceId === problem.answer?.choiceId;
}

export function checkNumeric(problem, value) {
  if (problem?.type !== "numeric") return false;
  const number = parseNumericResponse(value); const answer = Number(problem.answer?.value); const tolerance = Number(problem.answer?.tolerance ?? 0);
  return number !== null && Number.isFinite(answer) && Number.isFinite(tolerance) && Math.abs(number - answer) <= tolerance;
}

export function evaluateAnswer(problem, response) {
  if (problem?.type === "single-choice") {
    const choiceId = response?.choiceId;
    if (typeof choiceId !== "string" || !choiceId.trim()) return { valid: false, correct: false };
    return { valid: true, correct: checkSingleChoice(problem, choiceId), normalizedResponse: choiceId };
  }
  if (problem?.type === "numeric") {
    const normalizedResponse = parseNumericResponse(response?.value);
    if (normalizedResponse === null) return { valid: false, correct: false };
    return { valid: true, correct: checkNumeric(problem, normalizedResponse), normalizedResponse };
  }
  return { valid: false, correct: false };
}

export function checkAnswer(problem, response) {
  return evaluateAnswer(problem, response).correct;
}

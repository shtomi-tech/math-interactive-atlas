export const MAX_WORKSHEET_PROBLEMS = 30;

export function parseWorksheetIds(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(raw.map((id) => String(id || "").trim()).filter(Boolean))].slice(0, MAX_WORKSHEET_PROBLEMS);
}

export function buildWorksheetModel(problems, problemIds) {
  const available = new Map((Array.isArray(problems) ? problems : []).map((problem) => [problem.id, problem]));
  const ids = parseWorksheetIds(problemIds);
  return { requestedIds: ids, problems: ids.map((id) => available.get(id)).filter(Boolean), unknownIds: ids.filter((id) => !available.has(id)) };
}

export function problemAnswerText(problem) {
  if (!problem) return "";
  if (problem.type === "single-choice") return problem.choices?.find((choice) => choice.id === problem.answer?.choiceId)?.text || String(problem.answer?.choiceId || "");
  return String(problem.answer?.value ?? problem.answer ?? "");
}

import { filterProblems, orderProblems } from "./filter.js";

export function buildSession(problems, filters = {}, learningState = {}) {
  return { filters: { ...filters }, problems: orderProblems(filterProblems(problems, filters, learningState)) };
}

export function nextProblem(session, currentProblemId) {
  const items = session?.problems || [];
  const index = items.findIndex((problem) => problem.id === currentProblemId);
  return index >= 0 ? items[index + 1] || null : items[0] || null;
}

export function sessionPosition(session, currentProblemId) {
  const items = session?.problems || [];
  const index = items.findIndex((problem) => problem.id === currentProblemId);
  return { index, position: index >= 0 ? index + 1 : 0, total: items.length };
}

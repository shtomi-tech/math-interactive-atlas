import { filterProblems, orderProblems } from "./filter.js?v=20260913-r1";

export function buildSession(problems, filters = {}, learningState = {}) {
  return { filters: { ...filters }, problems: orderProblems(filterProblems(problems, filters, learningState)) };
}

export function buildExplicitSession(problems, problemIds) {
  const available = new Map((Array.isArray(problems) ? problems : []).map((problem) => [problem.id, problem]));
  const requestedIds = [];
  const seen = new Set();
  (Array.isArray(problemIds) ? problemIds : []).forEach((value) => {
    const id = String(value || "").trim();
    if (!id || seen.has(id) || requestedIds.length >= 30) return;
    seen.add(id);
    requestedIds.push(id);
  });
  const selected = requestedIds.map((id) => available.get(id)).filter(Boolean);
  return {
    filters: { explicit: true },
    requestedIds,
    problemIds: selected.map((problem) => problem.id),
    unknownIds: requestedIds.filter((id) => !available.has(id)),
    truncated: Array.isArray(problemIds) && problemIds.some((value) => !requestedIds.includes(String(value || "").trim())),
    problems: selected
  };
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

import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, orderedContentIds } from "../atlas/curriculum.js?v=20260913-r8";
import { practiceStatus } from "../atlas/storage.js?v=20260913-r8";

export const STATUS_OPTIONS = Object.freeze([
  ["all", "すべて"],
  ["unattempted", "未挑戦"],
  ["practicing", "練習中"],
  ["review", "要復習"],
  ["mastered", "習得"]
]);

const statusValues = new Set(STATUS_OPTIONS.map(([value]) => value));
const subjectRank = new Map(SUBJECT_ORDER.map((id, index) => [id, index]));
const unitRank = new Map(SUBJECT_ORDER.flatMap((subject) => (SUBJECT_UNIT_ORDER[subject] || []).map((id, index) => [`${subject}:${id}`, index])));
const contentRank = new Map(orderedContentIds().map((id, index) => [id, index]));

export function statusForProblem(problem, state = {}) {
  return practiceStatus(state.practice?.[problem?.id]);
}

export function normalizeStatus(status, mode = "") {
  if (mode === "mistakes") return "review";
  return statusValues.has(status) ? status : "all";
}

const SEARCH_ALIASES = Object.freeze({
  "exponential-logarithm": ["exponent", "exponential", "logarithm", "log"],
  "trigonometric-functions": ["trigonometric", "sine", "cosine", "tangent", "radian", "sin", "cos", "tan"],
  "calculus-2": ["calculus", "derivative", "differentiation", "integral", "integration", "tangent", "secant"],
  sequences: ["sequence", "arithmetic", "geometric", "recurrence", "series", "sum"]
});
function searchMatch(problem, query) {
  const normalized = String(query || "").trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [problem.title, problem.prompt, ...(problem.tags || []), ...(SEARCH_ALIASES[problem.unit] || [])].join(" ").toLocaleLowerCase().includes(normalized);
}

export function problemMatches(problem, filters = {}, state = {}) {
  const status = normalizeStatus(filters.status, filters.mode);
  return (!filters.subject || problem.subject === filters.subject)
    && (!filters.unit || problem.unit === filters.unit)
    && (!filters.content || problem.atlasContentId === filters.content)
    && (!filters.difficulty || String(problem.difficulty) === String(filters.difficulty))
    && (status === "all" || statusForProblem(problem, state) === status)
    && searchMatch(problem, filters.query);
}

export function filterProblems(problems, filters = {}, state = {}) {
  return (Array.isArray(problems) ? problems : []).filter((problem) => problemMatches(problem, filters, state));
}

export function orderProblems(problems) {
  return [...(Array.isArray(problems) ? problems : [])].sort((left, right) => {
    const subjectDifference = (subjectRank.get(left.subject) ?? Number.MAX_SAFE_INTEGER) - (subjectRank.get(right.subject) ?? Number.MAX_SAFE_INTEGER);
    if (subjectDifference) return subjectDifference;
    const leftUnit = unitRank.get(`${left.subject}:${left.unit}`) ?? Number.MAX_SAFE_INTEGER;
    const rightUnit = unitRank.get(`${right.subject}:${right.unit}`) ?? Number.MAX_SAFE_INTEGER;
    if (leftUnit !== rightUnit) return leftUnit - rightUnit;
    const leftContent = contentRank.get(left.atlasContentId) ?? Number.MAX_SAFE_INTEGER;
    const rightContent = contentRank.get(right.atlasContentId) ?? Number.MAX_SAFE_INTEGER;
    if (leftContent !== rightContent) return leftContent - rightContent;
    if (left.difficulty !== right.difficulty) return left.difficulty - right.difficulty;
    return String(left.id).localeCompare(String(right.id));
  });
}

export function summarizeProblems(problems, state = {}) {
  const counts = Object.fromEntries(STATUS_OPTIONS.map(([value]) => [value, 0]));
  (Array.isArray(problems) ? problems : []).forEach((problem) => { counts[statusForProblem(problem, state)] += 1; });
  return counts;
}

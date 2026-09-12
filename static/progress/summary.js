import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, subjectLabel, unitLabel } from "../atlas/curriculum.js?v=20260913-8b";
import { practiceStatus } from "../atlas/storage.js?v=20260913-8b";

const STATUS_VALUES = ["mastered", "practicing", "review", "unattempted"];
const STATUS_LABELS = { mastered: "習得", practicing: "練習中", review: "要復習", unattempted: "未挑戦" };

function stateEntry(state, id) { return state?.practice?.[id]; }
function countStatuses(items, state) {
  const counts = Object.fromEntries(STATUS_VALUES.map((status) => [status, 0]));
  items.forEach((item) => { counts[practiceStatus(stateEntry(state, item.id))] += 1; });
  return counts;
}

export function summarizeLearning(contents, problems, learningState = {}) {
  const safeContents = Array.isArray(contents) ? contents : [];
  const safeProblems = Array.isArray(problems) ? problems : [];
  const globalCounts = countStatuses(safeProblems, learningState);
  const unitSummaries = SUBJECT_ORDER.flatMap((subject) => (SUBJECT_UNIT_ORDER[subject] || []).map((unit) => {
    const unitProblems = safeProblems.filter((problem) => problem.subject === subject && problem.unit === unit);
    return { subject, subjectLabel: subjectLabel(subject), unit, unitLabel: unitLabel(unit), ...countStatuses(unitProblems, learningState), total: unitProblems.length };
  }));
  const contentSummaries = safeContents.map((content) => {
    const contentProblems = safeProblems.filter((problem) => problem.atlasContentId === content.id);
    const visited = Boolean(learningState?.visited?.[content.id]);
    return { id: content.id, title: content.title, subject: content.subject, subjectLabel: subjectLabel(content.subject), unit: content.unit, unitLabel: unitLabel(content.unit), visited, ...countStatuses(contentProblems, learningState), total: contentProblems.length };
  });
  const recentActivity = safeProblems.map((problem) => {
    const entry = stateEntry(learningState, problem.id);
    return entry?.lastAttemptAt ? { problemId: problem.id, atlasContentId: problem.atlasContentId, title: problem.title, lastAttemptAt: entry.lastAttemptAt, status: practiceStatus(entry), statusLabel: STATUS_LABELS[practiceStatus(entry)], subject: problem.subject, unit: problem.unit } : null;
  }).filter(Boolean).sort((left, right) => String(right.lastAttemptAt).localeCompare(String(left.lastAttemptAt))).slice(0, 10);
  const global = {
    visitedContents: contentSummaries.filter((content) => content.visited).length,
    totalContents: safeContents.length,
    unattempted: globalCounts.unattempted,
    practicing: globalCounts.practicing,
    review: globalCounts.review,
    mastered: globalCounts.mastered,
    totalProblems: safeProblems.length
  };
  return {
    ...global,
    global,
    units: unitSummaries,
    unitSummaries,
    contents: contentSummaries,
    contentSummaries,
    recentActivity
  };
}

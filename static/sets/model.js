export const PROBLEM_SET_VERSION = 1;
export const MAX_SET_PROBLEMS = 30;

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function idValue(value) { const id = text(value); return id || null; }
function makeId() {
  try { if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID(); } catch { /* fallback below */ }
  return `set-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function nowValue(value) { return text(value) || new Date().toISOString(); }

export function normalizeProblemSet(value, validProblemIds = null) {
  const source = value && typeof value === "object" ? value : {};
  const valid = validProblemIds instanceof Set ? validProblemIds : Array.isArray(validProblemIds) ? new Set(validProblemIds) : null;
  const problemIds = [];
  const seen = new Set();
  (Array.isArray(source.problemIds) ? source.problemIds : []).forEach((value) => {
    const id = idValue(value);
    if (!id || seen.has(id) || problemIds.length >= MAX_SET_PROBLEMS) return;
    if (valid && !valid.has(id)) { problemIds.push(id); seen.add(id); return; }
    problemIds.push(id);
    seen.add(id);
  });
  const createdAt = nowValue(source.createdAt);
  return {
    version: PROBLEM_SET_VERSION,
    id: idValue(source.id) || makeId(),
    title: text(source.title),
    instructions: text(source.instructions),
    problemIds,
    createdAt,
    updatedAt: nowValue(source.updatedAt) || createdAt
  };
}

export function createProblemSet({ id = "", now = new Date().toISOString(), title = "", instructions = "" } = {}) {
  return normalizeProblemSet({ version: PROBLEM_SET_VERSION, id: id || makeId(), title, instructions, problemIds: [], createdAt: now, updatedAt: now });
}

function touch(set, now) { return normalizeProblemSet({ ...set, updatedAt: nowValue(now) }); }

export function addProblem(set, problemId, now = new Date().toISOString()) {
  const current = normalizeProblemSet(set);
  const id = idValue(problemId);
  if (!id || current.problemIds.includes(id) || current.problemIds.length >= MAX_SET_PROBLEMS) return current;
  return touch({ ...current, problemIds: [...current.problemIds, id] }, now);
}

export function removeProblem(set, problemId, now = new Date().toISOString()) {
  const current = normalizeProblemSet(set);
  const id = idValue(problemId);
  return touch({ ...current, problemIds: current.problemIds.filter((value) => value !== id) }, now);
}

export function moveProblem(set, fromIndex, toIndex, now = new Date().toISOString()) {
  const current = normalizeProblemSet(set);
  const from = Number(fromIndex);
  if (!Number.isInteger(from) || from < 0 || from >= current.problemIds.length) return current;
  const target = typeof toIndex === "string" ? from + (toIndex === "up" ? -1 : 1) : Number(toIndex);
  if (!Number.isInteger(target) || target < 0 || target >= current.problemIds.length || target === from) return current;
  const problemIds = [...current.problemIds];
  const [item] = problemIds.splice(from, 1);
  problemIds.splice(target, 0, item);
  return touch({ ...current, problemIds }, now);
}

export function updateSetMetadata(set, metadata = {}, now = new Date().toISOString()) {
  const current = normalizeProblemSet(set);
  return touch({ ...current, title: text(metadata.title ?? current.title), instructions: text(metadata.instructions ?? current.instructions) }, now);
}

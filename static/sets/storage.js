import { createProblemSet, normalizeProblemSet } from "./model.js?v=20260913-8a";

export const PROBLEM_SETS_KEY = "math-interactive-atlas-problem-sets-v1";
export const MAX_SAVED_SETS = 50;

function targetStorage(storage) {
  if (storage !== undefined) return storage;
  try { return globalThis.localStorage; } catch { return null; }
}

export function loadProblemSets(storage, validProblemIds = null) {
  try {
    const target = targetStorage(storage);
    const raw = target?.getItem?.(PROBLEM_SETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.sets) ? parsed.sets : [];
    return list.map((item) => normalizeProblemSet(item, validProblemIds)).slice(0, MAX_SAVED_SETS);
  } catch { return []; }
}

export function saveProblemSets(storage, sets) {
  try {
    if (!storage?.setItem) return false;
    const safe = (Array.isArray(sets) ? sets : []).map((set) => normalizeProblemSet(set)).slice(0, MAX_SAVED_SETS);
    storage.setItem(PROBLEM_SETS_KEY, JSON.stringify(safe));
    return true;
  } catch { return false; }
}

export function upsertProblemSet(storage, set) {
  const current = loadProblemSets(storage);
  const normalized = normalizeProblemSet(set);
  const next = [normalized, ...current.filter((item) => item.id !== normalized.id)].slice(0, MAX_SAVED_SETS);
  saveProblemSets(storage, next);
  return next;
}

export function deleteProblemSet(storage, id) {
  const next = loadProblemSets(storage).filter((set) => set.id !== id);
  saveProblemSets(storage, next);
  return next;
}

export function duplicateProblemSet(storage, set, now = new Date().toISOString()) {
  const source = normalizeProblemSet(set);
  const copy = createProblemSet({ title: source.title ? `${source.title}（コピー）` : "問題セット（コピー）", instructions: source.instructions, now });
  const next = upsertProblemSet(storage, { ...copy, problemIds: source.problemIds });
  return { set: next[0], sets: next };
}

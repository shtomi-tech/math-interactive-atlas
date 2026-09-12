export const LEARNING_STATE_KEY = "math-interactive-atlas-state-v1";
export const LEARNING_STATE_VERSION = 2;

function emptyState() {
  return { version: LEARNING_STATE_VERSION, favorites: [], visited: {}, practice: {} };
}

function safeId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function safeTimestamp(value) {
  return typeof value === "string" && value ? value : undefined;
}

export function practiceStatus(entry) {
  if (!entry || !entry.attempts) return "unattempted";
  if (entry.lastResult === "incorrect") return "review";
  if (entry.lastResult === "correct" && entry.correctStreak >= 2) return "mastered";
  return "practicing";
}

export function normalizeState(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const favorites = Array.isArray(source.favorites)
    ? [...new Set(source.favorites.map(safeId).filter(Boolean))]
    : [];
  const visited = {};
  if (source.visited && typeof source.visited === "object" && !Array.isArray(source.visited)) {
    Object.entries(source.visited).forEach(([id, value]) => {
      const contentId = safeId(id);
      if (!contentId || !value || typeof value !== "object") return;
      const entry = { count: safeCount(value.count) };
      const timestamp = safeTimestamp(value.lastVisitedAt);
      if (timestamp) entry.lastVisitedAt = timestamp;
      visited[contentId] = entry;
    });
  }
  const practice = {};
  if (source.practice && typeof source.practice === "object" && !Array.isArray(source.practice)) {
    Object.entries(source.practice).forEach(([id, value]) => {
      const problemId = safeId(id);
      if (!problemId || !value || typeof value !== "object") return;
      const safeAttempts = safeCount(value.attempts);
      const correct = safeCount(value.correct);
      const wrong = safeCount(value.wrong);
      const entry = {
        attempts: Math.max(safeAttempts, correct + wrong),
        correct: Math.min(correct, Math.max(safeAttempts, correct + wrong)),
        wrong: Math.min(wrong, Math.max(safeAttempts, correct + wrong)),
        correctStreak: safeCount(value.correctStreak)
      };
      if (value.lastResult === "correct" || value.lastResult === "incorrect") entry.lastResult = value.lastResult;
      const timestamp = safeTimestamp(value.lastAttemptAt);
      if (timestamp) entry.lastAttemptAt = timestamp;
      const masteredAt = safeTimestamp(value.masteredAt);
      if (masteredAt) entry.masteredAt = masteredAt;
      if (source.version !== LEARNING_STATE_VERSION && entry.attempts > 0) entry.correctStreak = entry.lastResult === "correct" ? 1 : 0;
      if (entry.lastResult !== "correct") entry.correctStreak = 0;
      if (entry.correctStreak > entry.attempts) entry.correctStreak = entry.attempts;
      practice[problemId] = entry;
    });
  }
  return { version: LEARNING_STATE_VERSION, favorites, visited, practice };
}

export function loadLearningState(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target?.getItem) return emptyState();
    const raw = target.getItem(LEARNING_STATE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveLearningState(storage, state) {
  try {
    if (!storage?.setItem) return false;
    storage.setItem(LEARNING_STATE_KEY, JSON.stringify(normalizeState(state)));
    return true;
  } catch {
    return false;
  }
}

export function toggleFavorite(state, contentId) {
  const id = safeId(contentId);
  const next = normalizeState(state);
  if (!id) return next;
  const index = next.favorites.indexOf(id);
  if (index >= 0) next.favorites.splice(index, 1);
  else next.favorites.push(id);
  return next;
}

export function recordVisit(state, contentId, now = new Date().toISOString()) {
  const id = safeId(contentId);
  const next = normalizeState(state);
  if (!id) return next;
  const current = next.visited[id] || { count: 0 };
  next.visited[id] = { count: current.count + 1, lastVisitedAt: String(now) };
  return next;
}

export function recordPracticeAttempt(state, problemId, { correct, now = new Date().toISOString() } = {}) {
  const id = safeId(problemId);
  const next = normalizeState(state);
  if (!id) return next;
  const current = next.practice[id] || { attempts: 0, correct: 0, wrong: 0, correctStreak: 0 };
  const nextStreak = correct ? current.correctStreak + 1 : 0;
  const nowValue = String(now);
  next.practice[id] = {
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    wrong: current.wrong + (correct ? 0 : 1),
    correctStreak: nextStreak,
    lastResult: correct ? "correct" : "incorrect",
    lastAttemptAt: nowValue,
    ...(nextStreak >= 2 && !current.masteredAt ? { masteredAt: nowValue } : {}),
    ...(current.masteredAt ? { masteredAt: current.masteredAt } : {})
  };
  return next;
}

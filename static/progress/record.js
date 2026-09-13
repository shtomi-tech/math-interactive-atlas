import { normalizeState } from "../atlas/storage.js?v=20260913-r1";

export const LEARNING_RECORD_SCHEMA = "math-interactive-atlas-learning-record";
export const LEARNING_RECORD_VERSION = 2;

export function buildLearningRecord(state, now = new Date().toISOString()) {
  return { schema: LEARNING_RECORD_SCHEMA, version: LEARNING_RECORD_VERSION, exportedAt: String(now), state: normalizeState(state) };
}
export const exportLearningRecord = buildLearningRecord;

export function validateLearningRecord(value) {
  return Boolean(value && typeof value === "object" && value.schema === LEARNING_RECORD_SCHEMA && value.version === LEARNING_RECORD_VERSION && value.state && typeof value.state === "object" && !Array.isArray(value.state));
}

export function parseLearningRecord(value) {
  let source = value;
  if (typeof value === "string") { try { source = JSON.parse(value); } catch { return { ok: false, error: "学習記録JSONを読み込めませんでした。" }; } }
  if (!validateLearningRecord(source)) return { ok: false, error: "学習記録JSONの形式が正しくありません。" };
  return { ok: true, record: { schema: LEARNING_RECORD_SCHEMA, version: LEARNING_RECORD_VERSION, exportedAt: String(source.exportedAt || ""), state: normalizeState(source.state) } };
}

export function replaceLearningRecord(record) { return validateLearningRecord(record) ? normalizeState(record.state) : null; }

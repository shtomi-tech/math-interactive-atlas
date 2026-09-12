export const SET_EXPORT_SCHEMA = "math-interactive-atlas-problem-set";

export function exportProblemSet(set) {
  return {
    schema: SET_EXPORT_SCHEMA,
    version: 1,
    title: typeof set?.title === "string" ? set.title.trim() : "",
    instructions: typeof set?.instructions === "string" ? set.instructions.trim() : "",
    problemIds: Array.isArray(set?.problemIds) ? [...new Set(set.problemIds.map(String).filter(Boolean))].slice(0, 30) : []
  };
}

export function parseProblemSetImport(value) {
  let source = value;
  if (typeof value === "string") {
    try { source = JSON.parse(value); } catch { return { ok: false, error: "JSONを読み込めませんでした。" }; }
  }
  if (!source || source.schema !== SET_EXPORT_SCHEMA || source.version !== 1 || typeof source.title !== "string" || typeof source.instructions !== "string" || !Array.isArray(source.problemIds)) {
    return { ok: false, error: "問題セットJSONの形式が正しくありません。" };
  }
  const problemIds = [...new Set(source.problemIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (problemIds.length > 30) return { ok: false, error: "問題セットは30問以内にしてください。" };
  return { ok: true, set: { version: 1, title: source.title.trim(), instructions: source.instructions.trim(), problemIds } };
}

export function problemSetUrls(problemIds, { title = "" } = {}) {
  const ids = (Array.isArray(problemIds) ? problemIds : []).slice(0, 30).join(",");
  const practice = new URL("./practice.html", document.baseURI);
  practice.searchParams.set("problem", (Array.isArray(problemIds) ? problemIds[0] : "") || "");
  if (ids) practice.searchParams.set("ids", ids);
  const worksheet = new URL("./worksheet.html", document.baseURI);
  if (ids) worksheet.searchParams.set("ids", ids);
  if (title) worksheet.searchParams.set("title", title);
  const answerWorksheet = new URL(worksheet.href);
  answerWorksheet.searchParams.set("answers", "1");
  return { practice: `${practice.pathname}${practice.search}`, worksheet: `${worksheet.pathname}${worksheet.search}`, answers: `${answerWorksheet.pathname}${answerWorksheet.search}` };
}

export async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
  } catch { /* fallback is handled by the caller */ }
  return false;
}

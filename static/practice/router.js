export function parseRoute(problems, location = window.location, historyState = window.history.state) {
  const params = new URLSearchParams(location.search);
  const problemId = params.get("problem");
  if (problemId) return { view: "runner", problemId, fromCatalog: historyState?.fromCatalog || null };
  const mode = params.get("mode") || "";
  return {
    view: "catalog",
    subject: params.get("subject") || null,
    unit: params.get("unit") || null,
    content: params.get("content") || null,
    difficulty: params.get("difficulty") || null,
    status: params.get("status") || (mode === "mistakes" ? "review" : null),
    mode,
    query: params.get("q") || "",
    invalidProblem: false,
    problemCount: Array.isArray(problems) ? problems.length : 0
  };
}

function practiceUrl(params = {}) {
  const url = new URL("./practice.html", document.baseURI);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key === "query" ? "q" : key, value);
  });
  return `${url.pathname}${url.search}`;
}

export function goToProblem(id, { fromCatalog = null } = {}) {
  window.history.pushState({ view: "runner", problemId: id, fromCatalog }, "", practiceUrl({ problem: id }));
  window.dispatchEvent(new Event("popstate"));
}

export function goToCatalog({ replace = false, subject = "", unit = "", content = "", difficulty = "", status = "", query = "", mode = "" } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view: "catalog", subject, unit, content, difficulty, status, query, mode }, "", practiceUrl({ subject, unit, content, difficulty, status, query }));
  window.dispatchEvent(new Event("popstate"));
}

export function replaceCatalogFilters(filters = {}) {
  const { subject = "", unit = "", content = "", difficulty = "", status = "", query = "" } = filters;
  window.history.replaceState({ view: "catalog", subject, unit, content, difficulty, status, query }, "", practiceUrl({ subject, unit, content, difficulty, status, query }));
}

export function watchRoute(problems, onRoute) {
  const handlePopState = () => onRoute(parseRoute(problems));
  window.addEventListener("popstate", handlePopState);
  handlePopState();
  return () => window.removeEventListener("popstate", handlePopState);
}

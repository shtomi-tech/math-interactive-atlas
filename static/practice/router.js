export function parseRoute(problems, location = window.location, historyState = window.history.state) {
  const params = new URLSearchParams(location.search);
  const problemId = params.get("problem");
  if (problemId) return { view: "runner", problemId, fromCatalog: historyState?.fromCatalog || null };
  return { view: "catalog", subject: params.get("subject") || null, unit: params.get("unit") || null, difficulty: params.get("difficulty") || null, mode: params.get("mode") || null, invalidProblem: false };
}

function practiceUrl(params = {}) {
  const url = new URL("./practice.html", document.baseURI);
  Object.entries(params).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  return `${url.pathname}${url.search}`;
}

export function goToProblem(id, { fromCatalog = null } = {}) {
  window.history.pushState({ view: "runner", problemId: id, fromCatalog }, "", practiceUrl({ problem: id }));
  window.dispatchEvent(new Event("popstate"));
}

export function goToCatalog({ replace = false, subject = "", unit = "", difficulty = "", mode = "" } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view: "catalog", subject, unit, difficulty, mode }, "", practiceUrl({ subject, unit, difficulty, mode }));
  window.dispatchEvent(new Event("popstate"));
}

export function replaceCatalogFilters(filters = {}) {
  const { subject = "", unit = "", difficulty = "", mode = "" } = filters;
  window.history.replaceState({ view: "catalog", subject, unit, difficulty, mode }, "", practiceUrl({ subject, unit, difficulty, mode }));
}

export function watchRoute(problems, onRoute) {
  const handlePopState = () => onRoute(parseRoute(problems));
  window.addEventListener("popstate", handlePopState); handlePopState();
  return () => window.removeEventListener("popstate", handlePopState);
}

export function parseRoute(contents, location = window.location, historyState = window.history.state) {
  const params = new URLSearchParams(location.search);
  const contentId = params.get("content");

  if (contentId) {
    const content = contents.find((item) => item.id === contentId);
    return content
      ? { view: "viewer", contentId: content.id, fromProblem: params.get("fromProblem") || null, fromCatalog: historyState?.fromCatalog || null }
      : { view: "catalog", invalidContent: true };
  }

  return {
    view: "catalog",
    subject: params.get("subject") || null,
    unit: params.get("unit") || null,
    type: params.get("type") || null,
    progress: params.get("progress") || null,
    query: params.get("q") || "",
    invalidContent: false
  };
}

function atlasUrl(params = {}) {
  const url = new URL("./atlas.html", document.baseURI);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key === "query" ? "q" : key, value);
  });
  return `${url.pathname}${url.search}`;
}

export function goToContent(id, { fromCatalog = null, fromProblem = "" } = {}) {
  window.history.pushState({ view: "viewer", contentId: id, fromCatalog, fromProblem: fromProblem || null }, "", atlasUrl({ content: id, fromProblem }));
  window.dispatchEvent(new Event("popstate"));
}

export function goToCatalog({ replace = false, subject = "", unit = "", type = "", progress = "", query = "" } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view: "catalog", subject, unit, type, progress, query }, "", atlasUrl({ subject, unit, type, progress, query }));
  window.dispatchEvent(new Event("popstate"));
}

export function replaceCatalogFilters(filters = {}) {
  const { subject = "", unit = "", type = "", progress = "", query = "" } = filters;
  window.history.replaceState({ view: "catalog", subject, unit, type, progress, query }, "", atlasUrl({ subject, unit, type, progress, query }));
}

export function watchRoute(contents, onRoute) {
  const handlePopState = () => onRoute(parseRoute(contents));
  window.addEventListener("popstate", handlePopState);
  handlePopState();
  return () => window.removeEventListener("popstate", handlePopState);
}

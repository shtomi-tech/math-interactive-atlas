export function parseRoute(contents, location = window.location) {
  const params = new URLSearchParams(location.search);
  const contentId = params.get("content");

  if (contentId) {
    const content = contents.find((item) => item.id === contentId);
    return content
      ? { view: "viewer", contentId: content.id }
      : { view: "catalog", invalidContent: true };
  }

  return {
    view: "catalog",
    subject: params.get("subject") || null,
    unit: params.get("unit") || null,
    type: params.get("type") || null,
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

export function goToContent(id) {
  window.history.pushState({ view: "viewer", contentId: id }, "", atlasUrl({ content: id }));
  window.dispatchEvent(new Event("popstate"));
}

export function goToCatalog({ replace = false, subject = "", unit = "", type = "", query = "" } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view: "catalog", subject, unit, type, query }, "", atlasUrl({ subject, unit, type, query }));
  window.dispatchEvent(new Event("popstate"));
}

export function replaceCatalogFilters(filters = {}) {
  const { subject = "", unit = "", type = "", query = "" } = filters;
  window.history.replaceState({ view: "catalog", subject, unit, type, query }, "", atlasUrl({ subject, unit, type, query }));
}

export function watchRoute(contents, onRoute) {
  const handlePopState = () => onRoute(parseRoute(contents));
  window.addEventListener("popstate", handlePopState);
  handlePopState();
  return () => window.removeEventListener("popstate", handlePopState);
}

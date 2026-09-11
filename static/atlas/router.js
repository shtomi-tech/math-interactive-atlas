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
    subject: params.get("subject") || "math1",
    unit: params.get("unit") || null,
    invalidContent: false
  };
}

function atlasUrl(params = {}) {
  const url = new URL("./atlas.html", document.baseURI);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return `${url.pathname}${url.search}`;
}

export function goToContent(id) {
  window.history.pushState({ view: "viewer", contentId: id }, "", atlasUrl({ content: id }));
  window.dispatchEvent(new Event("popstate"));
}

export function goToCatalog({ replace = false, subject = "", unit = "" } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view: "catalog", subject, unit }, "", atlasUrl({ subject, unit }));
  window.dispatchEvent(new Event("popstate"));
}

export function watchRoute(contents, onRoute) {
  const handlePopState = () => onRoute(parseRoute(contents));
  window.addEventListener("popstate", handlePopState);
  handlePopState();
  return () => window.removeEventListener("popstate", handlePopState);
}

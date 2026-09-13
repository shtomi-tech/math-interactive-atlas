import { renderCatalog, renderSummary } from "./catalog.js?v=20260913-r4";
import { createViewer } from "./viewer.js?v=20260913-r4";

const dom = {
  status: document.querySelector("#libraryStatus"),
  catalogView: document.querySelector("#libraryCatalogView"),
  catalog: document.querySelector("#libraryCatalog"),
  summary: document.querySelector("#librarySummary"),
  viewerView: document.querySelector("#libraryViewerView"),
  viewer: document.querySelector("#libraryViewer")
};

function showStatus(message = "") { dom.status.textContent = message; }

async function loadJson(path) {
  const response = await fetch(`./${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} request failed: ${response.status}`);
  return response.json();
}

async function start() {
  try {
    const [library, external, runtime] = await Promise.all([
      loadJson("data/interactions.json"),
      loadJson("research/external-repositories.json"),
      loadJson("data/interaction-runtime-map.json")
    ]);
    if (!Array.isArray(library.interactions) || !Array.isArray(external.repositories) || !Array.isArray(runtime.mappings)) throw new Error("library payload is incomplete");
    const features = new Map(external.repositories.flatMap((repository) => (repository.features || []).map((feature) => [feature.id, { ...feature, repository: repository.repository, ref: repository.ref, license: repository.license.expression }])));
    const showCatalog = () => {
      viewer.destroy();
      dom.viewerView.hidden = true;
      dom.catalogView.hidden = false;
      renderCatalog(dom.catalog, library.interactions, { mappings: runtime.mappings, features, onSelect: (id) => { history.pushState({ interaction: id }, "", `./interactions.html?interaction=${encodeURIComponent(id)}`); showInteraction(id); } });
    };
    const viewer = createViewer(dom.viewer, { interactions: library.interactions, mappings: runtime.mappings, features, onBack: () => { history.pushState({}, "", "./interactions.html"); showCatalog(); } });
    const showInteraction = (id) => {
      if (!library.interactions.some((interaction) => interaction.id === id)) { showCatalog(); return; }
      dom.catalogView.hidden = true;
      dom.viewerView.hidden = false;
      viewer.render(id);
      dom.viewerView.focus({ preventScroll: true });
    };
    renderSummary(dom.summary, library.interactions, runtime.mappings, external.repositories);
    window.addEventListener("popstate", () => { const id = new URLSearchParams(window.location.search).get("interaction"); id ? showInteraction(id) : showCatalog(); });
    const initialId = new URLSearchParams(window.location.search).get("interaction");
    initialId ? showInteraction(initialId) : showCatalog();
  } catch (error) {
    console.error(error);
    showStatus("Canonical Interaction Libraryを読み込めませんでした。");
  }
}

start();

import { renderCatalog } from "./catalog.js";
import { createViewer } from "./viewer.js";
import { goToCatalog, goToContent, watchRoute } from "./router.js";

const dom = {
  status: document.querySelector("#atlasStatus"),
  catalogView: document.querySelector("#atlasCatalogView"),
  catalogGrid: document.querySelector("#catalogGrid"),
  viewerView: document.querySelector("#atlasViewerView"),
  viewerRoot: document.querySelector("#atlasViewerRoot")
};

function showStatus(message = "") {
  dom.status.textContent = message;
}

async function loadContents() {
  const response = await fetch("./static/atlas/content-data.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`content data request failed: ${response.status}`);
  const contents = await response.json();
  if (!Array.isArray(contents)) throw new Error("content data must be an array");
  return contents;
}

async function start() {
  try {
    const contents = await loadContents();
    const viewer = createViewer(dom.viewerRoot, {
      onBack: () => goToCatalog(),
      onRelated: (id) => goToContent(id)
    });

    watchRoute(contents, (route) => {
      if (route.invalidContent) {
        goToCatalog({ replace: true });
        return;
      }

      if (route.view === "viewer") {
        const content = contents.find((item) => item.id === route.contentId);
        if (!content) {
          goToCatalog({ replace: true });
          return;
        }
        showStatus();
        dom.catalogView.hidden = true;
        dom.viewerView.hidden = false;
        viewer.render(content, contents);
        dom.viewerView.focus({ preventScroll: true });
        return;
      }

      viewer.destroy();
      dom.viewerView.hidden = true;
      dom.catalogView.hidden = false;
      showStatus();
      renderCatalog(dom.catalogGrid, contents, {
        subject: route.subject,
        unit: route.unit,
        onSelect: (id) => goToContent(id)
      });
    });
  } catch (error) {
    console.error(error);
    showStatus("教材データを読み込めませんでした。時間をおいて再度お試しください。");
  }
}

start();

import { renderCatalog } from "./catalog.js?v=20260913-r2";
import { createViewer } from "./viewer.js?v=20260913-r2";
import { goToCatalog, goToContent, replaceCatalogFilters, watchRoute } from "./router.js?v=20260913-r2";
import { loadLearningState, recordVisit, saveLearningState, toggleFavorite } from "./storage.js?v=20260913-r2";

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

const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let learningState = loadLearningState(storage);
let activeCatalogRoute = null;

async function loadContents() {
  const response = await fetch("./static/atlas/content-data.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`content data request failed: ${response.status}`);
  const contents = await response.json();
  if (!Array.isArray(contents)) throw new Error("content data must be an array");
  return contents;
}

async function loadPracticeProblems() {
  try {
    const response = await fetch("./static/practice/problem-data.json", { cache: "no-store" });
    if (!response.ok) return [];
    const problems = await response.json();
    return Array.isArray(problems) ? problems : [];
  } catch {
    return [];
  }
}

async function loadRepositoryAudit() {
  try {
    const response = await fetch("./research/repository-audit.json", { cache: "no-store" });
    if (!response.ok) return { status: "unavailable", audits: new Map(), error: `HTTP ${response.status}` };
    const audit = await response.json();
    if (audit?.version !== 1 || !Array.isArray(audit.contents)) throw new Error("invalid repository audit payload");
    return { status: "loaded", audits: new Map(audit.contents.map((record) => [record.contentId, record])), version: audit.version, recordCount: audit.contents.length };
  } catch (error) {
    return { status: "unavailable", audits: new Map(), error: error.message };
  }
}

async function start() {
  try {
    const contents = await loadContents();
    const practiceProblems = await loadPracticeProblems();
    const repositoryAuditState = await loadRepositoryAudit();
    const repositoryAudits = repositoryAuditState.audits;
    const persist = (nextState) => { learningState = nextState; saveLearningState(storage, learningState); return learningState; };
    const catalogContext = () => ({ subject: activeCatalogRoute?.subject || "", unit: activeCatalogRoute?.unit || "", type: activeCatalogRoute?.type || "", progress: activeCatalogRoute?.progress || "", query: activeCatalogRoute?.query || "" });
    const viewer = createViewer(dom.viewerRoot, {
      onBack: (context) => context?.fromCatalog ? goToCatalog({ ...context.fromCatalog, replace: true }) : goToCatalog(),
      onRelated: (id, context = {}) => goToContent(id, { fromCatalog: context.fromCatalog, fromProblem: context.fromProblem }),
      onNavigate: (id, context = {}) => goToContent(id, { fromCatalog: context.fromCatalog, fromProblem: context.fromProblem }),
      onToggleFavorite: (id) => { persist(toggleFavorite(learningState, id)); return learningState.favorites.includes(id); }
    });

    const renderCatalogView = (route) => {
      activeCatalogRoute = { ...route };
      renderCatalog(dom.catalogGrid, contents, {
        subject: route.subject,
        unit: route.unit,
        type: route.type,
        progress: route.progress,
        query: route.query,
        state: learningState,
        practiceProblems,
        repositoryAudits,
        repositoryAuditStatus: repositoryAuditState.status,
        onFilterChange: (filters) => { activeCatalogRoute = { ...activeCatalogRoute, ...filters }; replaceCatalogFilters(filters); },
        onToggleFavorite: (id) => { persist(toggleFavorite(learningState, id)); renderCatalogView(activeCatalogRoute); },
        onSelect: (id) => goToContent(id, { fromCatalog: catalogContext() })
      });
    };

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
        persist(recordVisit(learningState, content.id));
        viewer.render(content, contents, { fromProblem: route.fromProblem, fromCatalog: route.fromCatalog, practiceProblems, repositoryAudits, repositoryAuditStatus: repositoryAuditState.status, learningState, isFavorite: learningState.favorites.includes(content.id) });
        dom.viewerView.focus({ preventScroll: true });
        return;
      }

      viewer.destroy();
      dom.viewerView.hidden = true;
      dom.catalogView.hidden = false;
      showStatus();
      renderCatalogView(route);
    });
  } catch (error) {
    console.error(error);
    showStatus("教材データを読み込めませんでした。時間をおいて再度お試しください。");
  }
}

start();

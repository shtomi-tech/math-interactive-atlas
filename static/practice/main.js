import { renderPracticeCatalog } from "./catalog.js?v=20260913-8a";
import { createProblemRunner } from "./runner.js?v=20260913-8a";
import { buildExplicitSession, buildSession } from "./session.js?v=20260913-8a";
import { goToCatalog, goToProblem, replaceCatalogFilters, watchRoute } from "./router.js?v=20260913-8a";
import { loadLearningState, recordPracticeAttempt, saveLearningState } from "../atlas/storage.js?v=20260913-8a";
import { validateProblemData } from "./validation.js?v=20260913-8a";

const dom = {
  status: document.querySelector("#practiceStatus"),
  catalogView: document.querySelector("#practiceCatalogView"),
  catalogRoot: document.querySelector("#practiceCatalogRoot"),
  runnerView: document.querySelector("#practiceRunnerView"),
  runnerRoot: document.querySelector("#practiceRunnerRoot")
};
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let learningState = loadLearningState(storage);

function showStatus(message = "") { dom.status.textContent = message; }
async function readJson(path) { const response = await fetch(path, { cache: "no-store" }); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }

async function start() {
  try {
    const [problems, contents] = await Promise.all([readJson("./static/practice/problem-data.json"), readJson("./static/atlas/content-data.json")]);
    const errors = validateProblemData(problems, contents);
    if (errors.length) throw new Error(errors.join("; "));
    const persist = (next) => { learningState = next; saveLearningState(storage, learningState); return learningState; };
    const runner = createProblemRunner(dom.runnerRoot, {
      onBack: (fromCatalog) => fromCatalog ? goToCatalog({ ...fromCatalog, replace: true }) : goToCatalog(),
      onResult: (problemId, correct) => persist(recordPracticeAttempt(learningState, problemId, { correct })),
      onNext: (problemId, fromCatalog, ids = []) => goToProblem(problemId, { fromCatalog, ids })
    });
    let activeCatalogRoute = null;
    const catalogContext = () => ({
      subject: activeCatalogRoute?.subject || "",
      unit: activeCatalogRoute?.unit || "",
      content: activeCatalogRoute?.content || "",
      difficulty: activeCatalogRoute?.difficulty || "",
      status: activeCatalogRoute?.status || "",
      query: activeCatalogRoute?.query || ""
    });
    const renderCatalogView = (route) => {
      activeCatalogRoute = { ...route };
      renderPracticeCatalog(dom.catalogRoot, problems, {
        ...route,
        state: learningState,
        onFilterChange: (filters) => { activeCatalogRoute = { ...activeCatalogRoute, ...filters }; replaceCatalogFilters(filters); },
        onSelect: (problemId) => goToProblem(problemId, { fromCatalog: catalogContext() })
      });
    };
    watchRoute(problems, (route) => {
      if (route.view === "runner") {
        const problem = problems.find((item) => item.id === route.problemId);
        const explicitIds = route.ids.length ? route.ids : route.fromCatalog?.ids || [];
        const explicitSession = explicitIds.length ? buildExplicitSession(problems, explicitIds) : null;
        showStatus(explicitSession?.unknownIds.length ? "一部の問題を読み込めませんでした" : explicitSession && !explicitSession.problems.length ? "指定された問題セットを読み込めませんでした。" : "");
        dom.catalogView.hidden = true;
        dom.runnerView.hidden = false;
        const session = explicitSession || buildSession(problems, route.fromCatalog || {}, learningState);
        const renderSession = explicitSession ? session : (session.problems.length ? session : { problems });
        if (problem && !renderSession.problems.some((item) => item.id === problem.id) && !explicitSession) {
          runner.render(null, renderSession, learningState, { fromCatalog: route.fromCatalog, ids: explicitIds });
        } else {
          runner.render(problem, renderSession, learningState, { fromCatalog: route.fromCatalog, ids: explicitIds });
        }
        dom.runnerView.focus({ preventScroll: true });
        return;
      }
      runner.destroy();
      dom.runnerView.hidden = true;
      dom.catalogView.hidden = false;
      showStatus(route.invalidProblem ? "指定された問題は見つかりませんでした。" : "");
      renderCatalogView(route);
    });
  } catch (error) {
    console.error(error);
    showStatus("問題データを読み込めませんでした。時間をおいて再度お試しください。");
  }
}

start();

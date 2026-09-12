import { renderPracticeCatalog } from "./catalog.js?v=20260912-5c";
import { createProblemRunner } from "./runner.js?v=20260912-5c";
import { buildSession } from "./session.js?v=20260912-5c";
import { goToCatalog, goToProblem, replaceCatalogFilters, watchRoute } from "./router.js?v=20260912-5c";
import { loadLearningState, recordPracticeAttempt, saveLearningState } from "../atlas/storage.js?v=20260912-5c";
import { validateProblemData } from "./validation.js?v=20260912-5c";

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
      onNext: (problemId, fromCatalog) => goToProblem(problemId, { fromCatalog })
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
        showStatus();
        dom.catalogView.hidden = true;
        dom.runnerView.hidden = false;
        let session = buildSession(problems, route.fromCatalog || {}, learningState);
        if (problem && !session.problems.some((item) => item.id === problem.id)) session = buildSession(problems, {}, learningState);
        runner.render(problem, session.problems.length ? session : { problems }, learningState, { fromCatalog: route.fromCatalog });
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

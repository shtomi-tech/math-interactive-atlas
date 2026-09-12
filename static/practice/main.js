import { renderPracticeCatalog } from "./catalog.js?v=20260912-6i";
import { createProblemRunner } from "./runner.js?v=20260912-6i";
import { goToCatalog, goToProblem, replaceCatalogFilters, watchRoute } from "./router.js?v=20260912-6i";
import { loadLearningState, recordPracticeAttempt, saveLearningState } from "../atlas/storage.js?v=20260912-6i";
import { validateProblemData } from "./validation.js?v=20260912-6i";

const dom = { status: document.querySelector("#practiceStatus"), catalogView: document.querySelector("#practiceCatalogView"), catalogRoot: document.querySelector("#practiceCatalogRoot"), runnerView: document.querySelector("#practiceRunnerView"), runnerRoot: document.querySelector("#practiceRunnerRoot") };
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let learningState = loadLearningState(storage);

function showStatus(message = "") { dom.status.textContent = message; }
async function readJson(path) { const response = await fetch(path, { cache: "no-store" }); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }
function filterProblems(problems, context = {}) { const filters = context || {}; return problems.filter((problem) => (!filters.subject || problem.subject === filters.subject) && (!filters.unit || problem.unit === filters.unit) && (!filters.difficulty || String(problem.difficulty) === String(filters.difficulty)) && (filters.mode !== "mistakes" || learningState.practice?.[problem.id]?.lastResult === "incorrect")); }

async function start() {
  try {
    const [problems, contents] = await Promise.all([readJson("./static/practice/problem-data.json"), readJson("./static/atlas/content-data.json")]);
    const errors = validateProblemData(problems, contents); if (errors.length) throw new Error(errors.join("; "));
    const persist = (next) => { learningState = next; saveLearningState(storage, learningState); };
    const runner = createProblemRunner(dom.runnerRoot, {
      onBack: (fromCatalog) => fromCatalog ? goToCatalog({ ...fromCatalog, replace: true }) : goToCatalog(),
      onResult: (problemId, correct) => persist(recordPracticeAttempt(learningState, problemId, { correct })),
      onNext: (problemId, fromCatalog) => goToProblem(problemId, { fromCatalog })
    });
    let activeCatalogRoute = null;
    const catalogContext = () => ({ subject: activeCatalogRoute?.subject || "", unit: activeCatalogRoute?.unit || "", difficulty: activeCatalogRoute?.difficulty || "", mode: activeCatalogRoute?.mode || "" });
    const renderCatalogView = (route) => { activeCatalogRoute = { ...route }; renderPracticeCatalog(dom.catalogRoot, problems, { ...route, state: learningState, onFilterChange: (filters) => { activeCatalogRoute = { ...activeCatalogRoute, ...filters }; replaceCatalogFilters(filters); }, onSelect: (problemId) => goToProblem(problemId, { fromCatalog: catalogContext() }) }); };
    watchRoute(problems, (route) => {
      if (route.view === "runner") {
        const problem = problems.find((item) => item.id === route.problemId);
        showStatus(); dom.catalogView.hidden = true; dom.runnerView.hidden = false;
        const session = filterProblems(problems, route.fromCatalog); if (problem && !session.some((item) => item.id === problem.id)) session.unshift(problem);
        runner.render(problem, session.length ? session : problems, learningState, { fromCatalog: route.fromCatalog });
        dom.runnerView.focus({ preventScroll: true }); return;
      }
      runner.destroy(); dom.runnerView.hidden = true; dom.catalogView.hidden = false; showStatus(route.invalidProblem ? "指定された問題は見つかりませんでした。" : ""); renderCatalogView(route);
    });
  } catch (error) { console.error(error); showStatus("問題データを読み込めませんでした。時間をおいて再度お試しください。"); }
}

start();

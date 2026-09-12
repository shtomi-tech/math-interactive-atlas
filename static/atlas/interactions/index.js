import { mountFunctionGraph } from "./function-graph.js?v=20260913-8a";
import { mountGeometryBoard } from "./geometry-board.js?v=20260913-8a";
import { mountRangeGraph } from "./range-graph.js?v=20260913-8a";
import { mountRegionSelector } from "./region-selector.js?v=20260913-8a";
import { mountCombinatoricsViewer } from "./combinatorics-viewer.js?v=20260913-8a";
import { mountDataLab } from "./data-lab.js?v=20260913-8a";
import { mountSimulationLab } from "./simulation-lab.js?v=20260913-8a";
import { mountAlgebraLab } from "./algebra-lab.js?v=20260913-8a";
import { mountNumberLineLab } from "./number-line-lab.js?v=20260913-8a";
import { mountAlgorithmLab } from "./algorithm-lab.js?v=20260913-8a";
import { mountSequenceLab } from "./sequence-lab.js?v=20260913-8a";

const ENGINES = Object.freeze({
  functionGraph: mountFunctionGraph,
  rangeGraph: mountRangeGraph,
  geometryBoard: mountGeometryBoard,
  regionSelector: mountRegionSelector,
  combinatoricsViewer: mountCombinatoricsViewer,
  dataLab: mountDataLab,
  simulationLab: mountSimulationLab,
  algebraLab: mountAlgebraLab,
  numberLineLab: mountNumberLineLab,
  algorithmLab: mountAlgorithmLab,
  sequenceLab: mountSequenceLab
});

function assertEngineContract(engine, engineName) {
  ["reset", "destroy", "getState", "setParameter"].forEach((method) => {
    if (typeof engine?.[method] !== "function") console.warn(`${engineName} does not implement ${method}()`);
  });
}

function unavailableEngine(container, error) {
  const message = document.createElement("p");
  message.className = "atlas-canvas-fallback";
  message.textContent = "このインタラクションを読み込めませんでした。";
  container.replaceChildren(message);
  console.error(error);
  return {
    reset() {},
    destroy() { container.replaceChildren(); },
    getState() { return {}; },
    setParameter() {}
  };
}

export function mountInteraction(container, interaction, options = {}) {
  const mount = ENGINES[interaction?.engine];
  if (!mount) return unavailableEngine(container, new Error(`Unknown interaction engine: ${interaction?.engine || "(empty)"}`));

  try {
    const engine = mount(container, { ...interaction, ...options });
    assertEngineContract(engine, interaction.engine);
    return engine;
  } catch (error) {
    return unavailableEngine(container, error);
  }
}

export function registeredInteractionEngines() {
  return Object.keys(ENGINES);
}

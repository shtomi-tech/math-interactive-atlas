import { mountFunctionGraph } from "./function-graph.js?v=20260912-7i";
import { mountGeometryBoard } from "./geometry-board.js?v=20260912-7i";
import { mountRangeGraph } from "./range-graph.js?v=20260912-7i";
import { mountRegionSelector } from "./region-selector.js?v=20260912-7i";
import { mountCombinatoricsViewer } from "./combinatorics-viewer.js?v=20260912-7i";
import { mountDataLab } from "./data-lab.js?v=20260912-7i";
import { mountSimulationLab } from "./simulation-lab.js?v=20260912-7i";
import { mountAlgebraLab } from "./algebra-lab.js?v=20260912-7i";
import { mountNumberLineLab } from "./number-line-lab.js?v=20260912-7i";
import { mountAlgorithmLab } from "./algorithm-lab.js?v=20260912-7i";
import { mountSequenceLab } from "./sequence-lab.js?v=20260912-7i";

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
  algorithmLab: mountAlgorithmLab
  ,sequenceLab: mountSequenceLab
});

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
    return mount(container, { ...interaction, ...options });
  } catch (error) {
    return unavailableEngine(container, error);
  }
}

export function registeredInteractionEngines() {
  return Object.keys(ENGINES);
}

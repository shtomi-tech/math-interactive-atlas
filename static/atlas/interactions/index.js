import { mountFunctionGraph } from "./function-graph.js?v=20260912-3a";
import { mountGeometryBoard } from "./geometry-board.js?v=20260912-3c";
import { mountRangeGraph } from "./range-graph.js?v=20260912-3a";
import { mountRegionSelector } from "./region-selector.js?v=20260912-3a";
import { mountCombinatoricsViewer } from "./combinatorics-viewer.js?v=20260912-3a";
import { mountDataLab } from "./data-lab.js?v=20260912-3c";
import { mountSimulationLab } from "./simulation-lab.js?v=20260912-3c";

const ENGINES = Object.freeze({
  functionGraph: mountFunctionGraph,
  rangeGraph: mountRangeGraph,
  geometryBoard: mountGeometryBoard,
  regionSelector: mountRegionSelector,
  combinatoricsViewer: mountCombinatoricsViewer,
  dataLab: mountDataLab,
  simulationLab: mountSimulationLab
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

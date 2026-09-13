import { createContext } from "./function-scenes/common.js?v=20260913-r2";
import { FUNCTION_GRAPH_SCENES } from "./function-scenes/index.js?v=20260913-r2";

export const FUNCTION_GRAPH_MODES = Object.freeze(Object.keys(FUNCTION_GRAPH_SCENES));

export function mountFunctionGraph(container, config = {}) {
  const mount = FUNCTION_GRAPH_SCENES[config.mode];
  if (!mount) throw new Error(`Unsupported function graph mode: ${config.mode || "(empty)"}`);
  const context = createContext(container);
  const scene = mount(context, config);
  return {
    reset: scene.reset || (() => {}),
    destroy: context.destroy,
    getState: scene.getState || (() => ({})),
    setParameter: scene.setParameter || (() => {})
  };
}
